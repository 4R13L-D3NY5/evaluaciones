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
        detail = (result.stderr or result.stdout or "").strip()
        raise RuntimeError(f"{Path(command[0]).name} terminó con código {result.returncode}: {detail[:500]}")
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
        
        # Conservar copia exportable del dump en storage/dumps para descarga directa administrativa
        dumps_dir = STORAGE / "dumps"
        dumps_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(dump_path, dumps_dir / f"{backup_id}.dump")
        
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
    update_backup(backup_id, estado="COPIANDO", error_mensaje=None)
    try:
        ensure_repository(LOCAL_REPO)
        ensure_repository(EXTERNAL_REPO, LOCAL_REPO)
        run([RESTIC, "copy", "--from-repo", LOCAL_REPO, "--repo", EXTERNAL_REPO, "--tag", f"backup:{backup_id}"], env=restic_env(EXTERNAL_REPO))
        snapshot_id = snapshots_for(EXTERNAL_REPO, backup_id)
        local_id = snapshots_for(LOCAL_REPO, backup_id)
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        update_backup(backup_id, estado="COPIADO", snapshot_local_id=local_id, snapshot_externo_id=snapshot_id, ruta_externa=EXTERNAL_REPO, externo_copiado_en=now, error_mensaje=None)
        audit(backup_id, "COPIA_EXTERNA_COMPLETADA", {"snapshot": snapshot_id})
    except Exception as exc:
        update_backup(backup_id, estado="ERROR", error_mensaje=str(exc)[:2000])
        audit(backup_id, "COPIA_EXTERNA_ERROR", {"tipo": type(exc).__name__})
        raise


def verify_external(backup_id):
    update_backup(backup_id, estado="VERIFICANDO", error_mensaje=None)
    try:
        run([RESTIC, "check"], env=restic_env(EXTERNAL_REPO))
        snapshot_id = snapshots_for(EXTERNAL_REPO, backup_id)
        local_id = snapshots_for(LOCAL_REPO, backup_id)
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        update_backup(backup_id, estado="VERIFICADO", snapshot_local_id=local_id, snapshot_externo_id=snapshot_id, verificado_en=now, error_mensaje=None)
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


def snapshot_backup_metadata():
    try:
        with db_connection() as connection, connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, tipo, estado, snapshot_local_id, snapshot_externo_id,
                       ruta_local, ruta_externa, tamano_bytes, archivos_count,
                       solicitado_por, solicitado_en, iniciado_en, finalizado_en,
                       externo_copiado_en, verificado_en, local_eliminado_en,
                       error_mensaje, metadata_json
                FROM sea_respaldos
            """)
            return cursor.fetchall()
    except Exception as exc:
        logger.warning("No se pudo capturar metadata de sea_respaldos: %s", exc)
        return []


def restore_backup_metadata(respaldos, active_backup_id):
    if not respaldos:
        return
    try:
        with db_connection() as connection, connection.cursor() as cursor:
            for r in respaldos:
                snap_loc = r[3] or snapshots_for(LOCAL_REPO, r[0])
                snap_ext = r[4] or snapshots_for(EXTERNAL_REPO, r[0])
                estado = "VERIFICADO" if r[0] == active_backup_id else r[2]
                err = None if r[0] == active_backup_id else r[16]
                verif_en = datetime.now(timezone.utc).replace(tzinfo=None) if r[0] == active_backup_id else r[14]
                meta = json.dumps(r[17]) if isinstance(r[17], dict) else (r[17] if r[17] else "{}")
                cursor.execute("""
                    INSERT INTO sea_respaldos (
                        id, tipo, estado, snapshot_local_id, snapshot_externo_id,
                        ruta_local, ruta_externa, tamano_bytes, archivos_count,
                        solicitado_por, solicitado_en, iniciado_en, finalizado_en,
                        externo_copiado_en, verificado_en, local_eliminado_en,
                        error_mensaje, metadata_json, actualizado_en
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, NOW()
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        estado = EXCLUDED.estado,
                        snapshot_local_id = COALESCE(EXCLUDED.snapshot_local_id, sea_respaldos.snapshot_local_id),
                        snapshot_externo_id = COALESCE(EXCLUDED.snapshot_externo_id, sea_respaldos.snapshot_externo_id),
                        ruta_local = COALESCE(EXCLUDED.ruta_local, sea_respaldos.ruta_local),
                        ruta_externa = COALESCE(EXCLUDED.ruta_externa, sea_respaldos.ruta_externa),
                        tamano_bytes = COALESCE(EXCLUDED.tamano_bytes, sea_respaldos.tamano_bytes),
                        archivos_count = COALESCE(EXCLUDED.archivos_count, sea_respaldos.archivos_count),
                        externo_copiado_en = COALESCE(EXCLUDED.externo_copiado_en, sea_respaldos.externo_copiado_en),
                        verificado_en = COALESCE(EXCLUDED.verificado_en, sea_respaldos.verificado_en),
                        local_eliminado_en = COALESCE(EXCLUDED.local_eliminado_en, sea_respaldos.local_eliminado_en),
                        error_mensaje = EXCLUDED.error_mensaje,
                        actualizado_en = NOW()
                """, (
                    r[0], r[1], estado, snap_loc, snap_ext,
                    r[5] or LOCAL_REPO, r[6] or EXTERNAL_REPO,
                    r[7], r[8], r[9], r[10], r[11], r[12], r[13], verif_en, r[15], err, meta
                ))
    except Exception as exc:
        logger.error("Error al preservar metadata de sea_respaldos tras restore: %s", exc)


def reconcile_snapshots_on_startup():
    try:
        with db_connection() as connection, connection.cursor() as cursor:
            cursor.execute("SELECT id, snapshot_local_id, snapshot_externo_id, estado FROM sea_respaldos")
            rows = cursor.fetchall()
            for backup_id, snap_loc, snap_ext, estado in rows:
                loc = snap_loc or snapshots_for(LOCAL_REPO, backup_id)
                ext = snap_ext or snapshots_for(EXTERNAL_REPO, backup_id)
                fields = {}
                if loc and loc != snap_loc:
                    fields["snapshot_local_id"] = loc
                    fields["ruta_local"] = LOCAL_REPO
                if ext and ext != snap_ext:
                    fields["snapshot_externo_id"] = ext
                    fields["ruta_externa"] = EXTERNAL_REPO
                if ext and estado in ("ERROR", "GENERADO", "COPIANDO", "COPIADO"):
                    fields["estado"] = "VERIFICADO"
                    fields["error_mensaje"] = None
                elif loc and estado in ("ERROR", "SOLICITADO", "EN_PROCESO"):
                    fields["estado"] = "GENERADO"
                    fields["error_mensaje"] = None
                if fields:
                    update_backup(backup_id, **fields)
        logger.info("Reconciliación de respaldos con Restic completada.")
    except Exception as exc:
        logger.warning("No se pudo completar la reconciliación inicial con Restic: %s", exc)


def restore_backup(backup_id):
    restore_root = BACKUPS / "restore" / backup_id
    restore_root.mkdir(parents=True, exist_ok=True)
    completed = False
    MAINTENANCE_MARKER.write_text("restauracion-en-progreso\n", encoding="utf-8")
    try:
        # 1. Obtener snapshot desde DB o directamente desde Restic
        snapshot_id = None
        try:
            with db_connection() as connection, connection.cursor() as cursor:
                cursor.execute("SELECT snapshot_externo_id FROM sea_respaldos WHERE id = %s", (backup_id,))
                row = cursor.fetchone()
                if row and row[0]:
                    snapshot_id = row[0]
        except Exception:
            pass

        if not snapshot_id:
            snapshot_id = snapshots_for(EXTERNAL_REPO, backup_id) or snapshots_for(LOCAL_REPO, backup_id)

        if not snapshot_id:
            raise RuntimeError("El respaldo no tiene un snapshot externo verificado")

        # 2. Guardar metadata de respaldos para no perder historial al sobreescribir DB
        saved_backups = snapshot_backup_metadata()

        repo = EXTERNAL_REPO if snapshots_for(EXTERNAL_REPO, backup_id) else LOCAL_REPO
        run([RESTIC, "check"], env=restic_env(repo))
        run([RESTIC, "restore", snapshot_id, "--target", str(restore_root)], env=restic_env(repo))
        dump_files = list(restore_root.rglob("sea_evaluaciones.dump"))
        if not dump_files:
            raise RuntimeError("El snapshot no contiene el respaldo lógico de PostgreSQL")
        env = os.environ.copy()
        env["PGPASSWORD"] = DB_PASSWORD
        restore_result = run(
            ["pg_restore", "--clean", "--if-exists", "--no-owner", "--no-privileges", "--host", DB_HOST, "--port", str(DB_PORT), "--username", DB_USER, "--dbname", DB_NAME, str(dump_files[0])],
            env=env,
            check=False,
        )
        if restore_result.returncode not in (0, 1):
            detail = (restore_result.stderr or restore_result.stdout or "").strip()
            raise RuntimeError(f"pg_restore falló con código {restore_result.returncode}: {detail[:500]}")
        if restore_result.returncode == 1:
            logger.warning("pg_restore completó con advertencias no críticas: %s", (restore_result.stderr or "").strip())
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

        # 3. Restaurar metadata de respaldos para preservar snapshots e historial
        restore_backup_metadata(saved_backups, backup_id)
        update_backup(
            backup_id,
            estado="VERIFICADO",
            snapshot_externo_id=snapshot_id,
            snapshot_local_id=snapshots_for(LOCAL_REPO, backup_id),
            ruta_externa=EXTERNAL_REPO,
            ruta_local=LOCAL_REPO,
            verificado_en=datetime.now(timezone.utc).replace(tzinfo=None),
            error_mensaje=None
        )
        audit(backup_id, "RESTAURACION_COMPLETADA")
        completed = True
    except Exception as exc:
        update_backup(backup_id, estado="ERROR", error_mensaje=str(exc)[:2000])
        audit(backup_id, "RESTAURACION_ERROR", {"tipo": type(exc).__name__})
        raise
    finally:
        shutil.rmtree(restore_root, ignore_errors=True)
        MAINTENANCE_MARKER.unlink(missing_ok=True)


def extract_dump(backup_id):
    dumps_dir = STORAGE / "dumps"
    dumps_dir.mkdir(parents=True, exist_ok=True)
    target = dumps_dir / f"{backup_id}.dump"
    if target.exists() and target.stat().st_size > 0:
        return str(target)
    with db_connection() as connection, connection.cursor() as cursor:
        cursor.execute("SELECT snapshot_local_id, snapshot_externo_id FROM sea_respaldos WHERE id = %s", (backup_id,))
        row = cursor.fetchone()
    if not row:
        raise ValueError(f"Respaldo {backup_id} no encontrado")
    snap_local, snap_ext = row
    repo = LOCAL_REPO if snap_local else EXTERNAL_REPO
    snap_id = snap_local or snap_ext
    if not snap_id:
        raise ValueError(f"Respaldo {backup_id} no tiene snapshot registrado")
    temp_extract = BACKUPS / "staging" / f"extract_{backup_id}"
    temp_extract.mkdir(parents=True, exist_ok=True)
    try:
        run([RESTIC, "restore", snap_id, "--target", str(temp_extract), "--include", "*/sea_evaluaciones.dump"], env=restic_env(repo))
        found = list(temp_extract.rglob("sea_evaluaciones.dump"))
        if not found:
            raise RuntimeError("No se encontró sea_evaluaciones.dump en el snapshot")
        shutil.copy2(found[0], target)
        logger.info("Dump de base de datos extraído para %s en %s", backup_id, target)
        return str(target)
    finally:
        shutil.rmtree(temp_extract, ignore_errors=True)


def ensure_existing_dumps():
    try:
        with db_connection() as connection, connection.cursor() as cursor:
            cursor.execute("SELECT id FROM sea_respaldos WHERE estado IN ('GENERADO', 'COPIADO', 'VERIFICANDO', 'VERIFICADO')")
            rows = cursor.fetchall()
        for (bid,) in rows:
            dump_file = STORAGE / "dumps" / f"{bid}.dump"
            if not dump_file.exists() or dump_file.stat().st_size == 0:
                logger.info("Asegurando dump local exportable para respaldo %s...", bid)
                extract_dump(bid)
    except Exception as exc:
        logger.warning("No se pudieron verificar los dumps existentes al iniciar: %s", exc)


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
    if operation == "EXTRACT_DUMP": return extract_dump(backup_id)
    raise ValueError(f"Operación de respaldo no reconocida: {operation}")


def consume():
    reconcile_snapshots_on_startup()
    ensure_existing_dumps()
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
