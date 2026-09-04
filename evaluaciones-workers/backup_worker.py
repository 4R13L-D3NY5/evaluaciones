#!/usr/bin/env python3
"""Worker de respaldos Restic para PostgreSQL y el almacenamiento del SEA."""
import hashlib
import json
import logging
import os
import shutil
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

import pika
import psycopg2

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] BACKUP %(message)s")
logger = logging.getLogger(__name__)

QUEUE = os.getenv("BACKUP_QUEUE", "evaluaciones.backups")
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "sea_evaluaciones")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
STORAGE = Path(os.getenv("STORAGE_BASE_PATH", "/app/storage"))
MAINTENANCE_MARKER = Path(os.getenv("MAINTENANCE_MARKER", str(STORAGE / ".sea-maintenance")))
BACKUPS = Path(os.getenv("BACKUPS_BASE_PATH", "/app/backups"))
EXTERNAL = Path(os.getenv("BACKUPS_EXTERNAL_PATH", "/app/backups-external"))
LOCAL_REPO = os.getenv("BACKUP_LOCAL_REPOSITORY", str(BACKUPS / "repository"))
EXTERNAL_REPO = os.getenv("BACKUP_EXTERNAL_REPOSITORY", str(EXTERNAL / "repository"))
PASSWORD_FILE = os.getenv("RESTIC_PASSWORD_FILE", "/run/secrets/restic_password")
RESTIC = os.getenv("RESTIC_BIN", "restic")


def db_connection():
    return psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)


def update_backup(backup_id, **fields):
    if not fields:
        return
    fields["actualizado_en"] = datetime.now(timezone.utc).replace(tzinfo=None)
    assignments = ", ".join(f"{key} = %s" for key in fields)
    values = list(fields.values()) + [backup_id]
    with db_connection() as connection, connection.cursor() as cursor:
        cursor.execute(f"UPDATE sea_respaldos SET {assignments} WHERE id = %s", values)


def audit(backup_id, action, detail=None):
    with db_connection() as connection, connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO sea_auditoria_respaldos (respaldo_id, accion, actor, detalle_json, ip_origen) VALUES (%s, %s, %s, %s::jsonb, %s)",
            (backup_id, action, "WORKER_BACKUP", json.dumps(detail or {}), "127.0.0.1"),
        )


def run(command, env=None, check=True):
    result = subprocess.run(command, env=env, text=True, capture_output=True, check=False)
    if check and result.returncode != 0:
        raise RuntimeError(f"{Path(command[0]).name} terminó con código {result.returncode}")
    return result


def restic_env(repository):
    if not Path(PASSWORD_FILE).is_file():
        raise RuntimeError("No está configurado el secreto de contraseña de Restic")
    environment = os.environ.copy()
    environment["RESTIC_REPOSITORY"] = repository
    environment["RESTIC_PASSWORD_FILE"] = PASSWORD_FILE
    environment["RESTIC_FROM_PASSWORD_FILE"] = PASSWORD_FILE
    return environment


def ensure_repository(repository, source_repository=None):
    result = run([RESTIC, "snapshots", "--json"], env=restic_env(repository), check=False)
    if result.returncode != 0:
        Path(repository).mkdir(parents=True, exist_ok=True)
        command = [RESTIC, "init"]
        if source_repository:
            command.extend(["--copy-chunker-params", "--from-repo", source_repository])
        run(command, env=restic_env(repository))


def collect_manifest(root: Path, destination: Path):
    files = []
    total_bytes = 0
    if root.exists():
        for file_path in root.rglob("*"):
            if not file_path.is_file() or ".sea-maintenance" in file_path.parts:
                continue
            digest = hashlib.sha256()
            size = file_path.stat().st_size
            with file_path.open("rb") as stream:
                for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                    digest.update(chunk)
            files.append({"ruta": str(file_path.relative_to(root)).replace("\\", "/"), "bytes": size, "sha256": digest.hexdigest()})
            total_bytes += size
    manifest = {
        "sistema": "SEA/SISA",
        "version": os.getenv("SYSTEM_VERSION", "desarrollo"),
        "generadoEn": datetime.now(timezone.utc).isoformat(),
        "storage": {"archivos": len(files), "bytes": total_bytes},
        "exclusiones": [".env", "tokens", "contraseñas", "llaves de Vault", ".sea-maintenance"],
        "archivos": files,
    }
    destination.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return len(files), total_bytes


def snapshot_id_from_output(output):
    for line in reversed(output.splitlines()):
        try:
            item = json.loads(line)
            if item.get("snapshot_id"):
                return item["snapshot_id"]
        except json.JSONDecodeError:
            continue
    result = run([RESTIC, "snapshots", "--json"], env=restic_env(LOCAL_REPO))
    snapshots = json.loads(result.stdout or "[]")
    return snapshots[-1]["id"] if snapshots else None


def snapshots_for(repository, backup_id):
    result = run([RESTIC, "snapshots", "--json", "--tag", f"backup:{backup_id}"], env=restic_env(repository))
    snapshots = json.loads(result.stdout or "[]")
    return snapshots[-1]["id"] if snapshots else None


def retention_days():
    with db_connection() as connection, connection.cursor() as cursor:
        cursor.execute("SELECT retencion_dias FROM sea_configuracion_respaldos WHERE id = 1")
        row = cursor.fetchone()
    return max(1, int(row[0])) if row else 30


def validate_manifest(restore_root: Path):
    manifests = list(restore_root.rglob("manifest.json"))
    if not manifests:
        raise RuntimeError("El snapshot no contiene el manifiesto de archivos")
    manifest = json.loads(manifests[0].read_text(encoding="utf-8"))
    restored_storage = next((path for path in restore_root.rglob("storage") if path.is_dir()), None)
    if not restored_storage:
        raise RuntimeError("El snapshot no contiene la carpeta storage")
    for item in manifest.get("archivos", []):
        file_path = restored_storage / item["ruta"]
        if not file_path.is_file() or file_path.stat().st_size != item["bytes"]:
            raise RuntimeError(f"Integridad inválida en storage/{item['ruta']}")
        digest = hashlib.sha256()
        with file_path.open("rb") as stream:
            for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(chunk)
        if digest.hexdigest() != item["sha256"]:
            raise RuntimeError(f"Hash inválido en storage/{item['ruta']}")
    return restored_storage


def validate_restored_database():
    with db_connection() as connection, connection.cursor() as cursor:
        cursor.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sea_usuarios_sistema')")
        users_table = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM sea_usuarios_sistema WHERE rol_codigo = 'ADMINISTRADOR_SISTEMA' AND activo = TRUE")
        administrators = cursor.fetchone()[0] if users_table else 0
        cursor.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flyway_schema_history')")
        flyway_table = cursor.fetchone()[0]
        migrations = False
        if flyway_table:
            cursor.execute("SELECT EXISTS (SELECT 1 FROM flyway_schema_history WHERE version = '25' AND success = TRUE)")
            migrations = cursor.fetchone()[0]
    if not users_table:
        raise RuntimeError("La restauración no contiene la tabla de usuarios del sistema")
    if administrators < 1:
        raise RuntimeError("La restauración no conserva un administrador activo")
    if not migrations:
        raise RuntimeError("La migración de respaldos no está aplicada en la base restaurada")


def create_snapshot(backup_id):
    staging = BACKUPS / "staging" / backup_id
    staging.mkdir(parents=True, exist_ok=True)
    dump_path = staging / "sea_evaluaciones.dump"
    manifest_path = staging / "manifest.json"
    update_backup(backup_id, estado="EN_PROCESO", iniciado_en=datetime.now(timezone.utc).replace(tzinfo=None), error_mensaje=None)
    try:
        files, total_bytes = collect_manifest(STORAGE, manifest_path)
        env = os.environ.copy()
        env["PGPASSWORD"] = DB_PASSWORD
        run(["pg_dump", "--format=custom", "--no-owner", "--no-privileges", "--file", str(dump_path), "--host", DB_HOST, "--port", str(DB_PORT), "--username", DB_USER, DB_NAME], env=env)
        ensure_repository(LOCAL_REPO)
        result = run([RESTIC, "backup", str(staging), str(STORAGE), "--tag", f"backup:{backup_id}", "--json"], env=restic_env(LOCAL_REPO))
        snapshot_id = snapshot_id_from_output(result.stdout)
        finished = datetime.now(timezone.utc).replace(tzinfo=None)
        update_backup(backup_id, estado="GENERADO", snapshot_local_id=snapshot_id, ruta_local=LOCAL_REPO, tamano_bytes=total_bytes, archivos_count=files, finalizado_en=finished, metadata_json=json.dumps({"dbDump": "sea_evaluaciones.dump", "manifest": "manifest.json", "storageBytes": total_bytes}))
        audit(backup_id, "RESPALDO_LOCAL_GENERADO", {"snapshot": snapshot_id, "archivos": files})
        run([RESTIC, "forget", "--keep-within", f"{retention_days()}d", "--prune"], env=restic_env(LOCAL_REPO), check=False)
    except Exception as exc:
        update_backup(backup_id, estado="ERROR", error_mensaje=str(exc)[:2000], finalizado_en=datetime.now(timezone.utc).replace(tzinfo=None))
        audit(backup_id, "RESPALDO_ERROR", {"tipo": type(exc).__name__})
        raise
    finally:
        shutil.rmtree(staging, ignore_errors=True)


def copy_external(backup_id):
    update_backup(backup_id, estado="COPIANDO")
    try:
        ensure_repository(LOCAL_REPO)
        ensure_repository(EXTERNAL_REPO, LOCAL_REPO)
        run([RESTIC, "copy", "--from-repo", LOCAL_REPO, "--repo", EXTERNAL_REPO, "--tag", f"backup:{backup_id}"], env=restic_env(EXTERNAL_REPO))
        snapshot_id = snapshots_for(EXTERNAL_REPO, backup_id)
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        update_backup(backup_id, estado="COPIADO", snapshot_externo_id=snapshot_id, ruta_externa=EXTERNAL_REPO, externo_copiado_en=now)
        audit(backup_id, "COPIA_EXTERNA_COMPLETADA", {"snapshot": snapshot_id})
    except Exception as exc:
        update_backup(backup_id, estado="ERROR", error_mensaje=str(exc)[:2000])
        audit(backup_id, "COPIA_EXTERNA_ERROR", {"tipo": type(exc).__name__})
        raise


def verify_external(backup_id):
    update_backup(backup_id, estado="VERIFICANDO")
    try:
        run([RESTIC, "check"], env=restic_env(EXTERNAL_REPO))
        snapshot_id = snapshots_for(EXTERNAL_REPO, backup_id)
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        update_backup(backup_id, estado="VERIFICADO", snapshot_externo_id=snapshot_id, verificado_en=now)
        audit(backup_id, "COPIA_EXTERNA_VERIFICADA", {"snapshot": snapshot_id})
    except Exception as exc:
        update_backup(backup_id, estado="ERROR", error_mensaje=str(exc)[:2000])
        audit(backup_id, "VERIFICACION_ERROR", {"tipo": type(exc).__name__})
        raise


def delete_local(backup_id):
    try:
        with db_connection() as connection, connection.cursor() as cursor:
            cursor.execute("SELECT estado, snapshot_local_id FROM sea_respaldos WHERE id = %s", (backup_id,))
            row = cursor.fetchone()
        if not row or row[0] != "VERIFICADO":
            raise RuntimeError("La copia externa debe estar verificada antes de eliminar la copia local")
        if row[1]:
            run([RESTIC, "forget", row[1], "--prune"], env=restic_env(LOCAL_REPO))
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        update_backup(backup_id, estado="ELIMINADO", local_eliminado_en=now)
        audit(backup_id, "COPIA_LOCAL_ELIMINADA")
    except Exception as exc:
        update_backup(backup_id, estado="ERROR", error_mensaje=str(exc)[:2000])
        audit(backup_id, "ELIMINACION_LOCAL_ERROR", {"tipo": type(exc).__name__})
        raise


def restore_backup(backup_id):
    restore_root = BACKUPS / "restore" / backup_id
    restore_root.mkdir(parents=True, exist_ok=True)
    completed = False
    MAINTENANCE_MARKER.write_text("restauracion-en-progreso\n", encoding="utf-8")
    try:
        with db_connection() as connection, connection.cursor() as cursor:
            cursor.execute("SELECT snapshot_externo_id FROM sea_respaldos WHERE id = %s AND estado = 'RESTAURANDO'", (backup_id,))
            row = cursor.fetchone()
        if not row or not row[0]:
            raise RuntimeError("El respaldo no tiene un snapshot externo verificado")
        run([RESTIC, "check"], env=restic_env(EXTERNAL_REPO))
        run([RESTIC, "restore", row[0], "--target", str(restore_root)], env=restic_env(EXTERNAL_REPO))
        dump_files = list(restore_root.rglob("sea_evaluaciones.dump"))
        if not dump_files:
            raise RuntimeError("El snapshot no contiene el respaldo lógico de PostgreSQL")
        env = os.environ.copy()
        env["PGPASSWORD"] = DB_PASSWORD
        run(["pg_restore", "--clean", "--if-exists", "--no-owner", "--no-privileges", "--host", DB_HOST, "--port", str(DB_PORT), "--username", DB_USER, "--dbname", DB_NAME, str(dump_files[0])], env=env)
        validate_restored_database()
        restored_storage = validate_manifest(restore_root)
        if restored_storage:
            for item in restored_storage.iterdir():
                if item.name == ".sea-maintenance":
                    continue
                destination = STORAGE / item.name
                if destination.is_dir():
                    shutil.rmtree(destination)
                elif destination.exists():
                    destination.unlink()
                shutil.move(str(item), str(destination))
        update_backup(backup_id, estado="VERIFICADO", error_mensaje=None)
        audit(backup_id, "RESTAURACION_COMPLETADA")
        completed = True
    except Exception as exc:
        update_backup(backup_id, estado="ERROR", error_mensaje=str(exc)[:2000])
        audit(backup_id, "RESTAURACION_ERROR", {"tipo": type(exc).__name__})
        raise
    finally:
        shutil.rmtree(restore_root, ignore_errors=True)
        if completed:
            MAINTENANCE_MARKER.unlink(missing_ok=True)


def handle(payload):
    backup_id = payload.get("backupId")
    operation = payload.get("operacion")
    if not backup_id:
        raise ValueError("La operación no contiene backupId")
    if operation == "CREATE_SNAPSHOT": return create_snapshot(backup_id)
    if operation == "COPY_EXTERNAL": return copy_external(backup_id)
    if operation == "VERIFY": return verify_external(backup_id)
    if operation == "DELETE_LOCAL": return delete_local(backup_id)
    if operation == "RESTORE": return restore_backup(backup_id)
    raise ValueError(f"Operación de respaldo no reconocida: {operation}")


def consume():
    credentials = pika.PlainCredentials(os.getenv("RABBITMQ_USER", "guest"), os.getenv("RABBITMQ_PASSWORD", "guest"))
    params = pika.ConnectionParameters(host=os.getenv("RABBITMQ_HOST", "rabbitmq"), port=int(os.getenv("RABBITMQ_PORT", "5672")), credentials=credentials, heartbeat=600)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE, durable=True)
    channel.basic_qos(prefetch_count=1)

    def on_message(ch, method, properties, body):
        payload = json.loads(body.decode("utf-8"))
        logger.info("Procesando operación %s para %s", payload.get("operacion"), payload.get("backupId"))
        try:
            handle(payload)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            logger.exception("Operación de respaldo fallida; se reintentará")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(queue=QUEUE, on_message_callback=on_message)
    logger.info("Worker escuchando en %s", QUEUE)
    channel.start_consuming()


if __name__ == "__main__":
    while True:
        try:
            consume()
        except Exception:
            logger.exception("Conexión del worker interrumpida; reintentando")
            time.sleep(10)
