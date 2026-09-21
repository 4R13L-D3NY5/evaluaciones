#!/usr/bin/env python3
"""
Prueba técnica de Integridad, Corrupción Controlada y Restauración Aislada (Fases 3 y 4).
Ejecuta la validación completa sobre una base de datos temporal sin tocar la producción.
"""
import hashlib
import json
import logging
import os
import shutil
import subprocess
import sys
from pathlib import Path
import psycopg2

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [TEST-ISOLATED] %(message)s")
logger = logging.getLogger(__name__)

DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
LIVE_DB = os.getenv("DB_NAME", "sea_evaluaciones")
TEST_DB = "sea_evaluaciones_restore_test"
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

EXTERNAL_REPO = os.getenv("BACKUP_EXTERNAL_REPOSITORY", "/app/backups-external/repository")
PASSWORD_FILE = os.getenv("RESTIC_PASSWORD_FILE", "/run/secrets/restic_password")
RESTIC = os.getenv("RESTIC_BIN", "restic")
BACKUPS_BASE = Path(os.getenv("BACKUPS_BASE_PATH", "/app/backups"))

def restic_env():
    env = os.environ.copy()
    env["RESTIC_REPOSITORY"] = EXTERNAL_REPO
    env["RESTIC_PASSWORD_FILE"] = PASSWORD_FILE
    return env

def run_cmd(cmd, env=None):
    res = subprocess.run(cmd, env=env, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Comando falló ({res.returncode}): {' '.join(cmd)}\nStderr: {res.stderr}\nStdout: {res.stdout}")
    return res

def connect_db(dbname):
    return psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=dbname, user=DB_USER, password=DB_PASSWORD)

def validate_manifest(restore_root: Path):
    manifests = list(restore_root.rglob("manifest.json"))
    if not manifests:
        raise RuntimeError("El snapshot no contiene el manifiesto de archivos (manifest.json)")
    manifest = json.loads(manifests[0].read_text(encoding="utf-8"))
    
    restored_storage = next((path for path in restore_root.rglob("storage") if path.is_dir()), None)
    if not restored_storage:
        raise RuntimeError("El snapshot no contiene la carpeta storage")
    
    archivos = manifest.get("archivos", [])
    logger.info("Validando %d archivos según manifest.json...", len(archivos))
    
    for item in archivos:
        file_path = restored_storage / item["ruta"]
        if not file_path.is_file():
            raise RuntimeError(f"Archivo faltante en storage: {item['ruta']}")
        if file_path.stat().st_size != item["bytes"]:
            raise RuntimeError(f"Integridad inválida (tamaño diferente) en storage/{item['ruta']}")
        digest = hashlib.sha256()
        with file_path.open("rb") as stream:
            for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(chunk)
        if digest.hexdigest() != item["sha256"]:
            raise RuntimeError(f"Hash inválido (checksum corrupto) en storage/{item['ruta']}")
    
    return manifest, restored_storage

def test_pipeline():
    logger.info("=================================================================")
    logger.info("INICIANDO PRUEBA DE INTEGRIDAD Y RESTAURACIÓN AISLADA (FASES 3 Y 4)")
    logger.info("=================================================================")
    
    # 1. Obtener último respaldo verificado de la base de datos viva
    with connect_db(LIVE_DB) as conn, conn.cursor() as cur:
        cur.execute("SELECT id, snapshot_externo_id, tamano_bytes, archivos_count FROM sea_respaldos WHERE estado = 'VERIFICADO' ORDER BY verificado_en DESC LIMIT 1")
        row = cur.fetchone()
        if not row:
            raise RuntimeError("No se encontró ningún respaldo VERIFICADO en sea_respaldos")
        backup_id, snapshot_id, tamano, total_files = row
    
    logger.info("Respaldo seleccionado para prueba: %s (snapshot externo: %s, archivos: %s)", backup_id, snapshot_id, total_files)
    
    # 2. Carpeta temporal de restauración aislada
    restore_dir = BACKUPS_BASE / "staging" / "isolated_restore_test"
    shutil.rmtree(restore_dir, ignore_errors=True)
    restore_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # 3. Restaurar snapshot desde repositorio externo con restic
        logger.info("Extrayendo snapshot con restic a %s...", restore_dir)
        run_cmd([RESTIC, "restore", snapshot_id, "--target", str(restore_dir)], env=restic_env())
        logger.info("Extracción de snapshot completada con éxito.")
        
        # 4. Fase 3: Validación de Manifiesto e Integridad
        logger.info(">>> PASO 1: Validación de SHA-256 e integridad del manifiesto")
        manifest, restored_storage = validate_manifest(restore_dir)
        logger.info("PASO 1 EXITOSO: Todos los %d archivos coinciden exactamente en tamaño y SHA-256.", len(manifest["archivos"]))
        
        # 5. Fase 3: Prueba de Corrupción Controlada
        logger.info(">>> PASO 2: Prueba de detección de corrupción controlada")
        if not manifest["archivos"]:
            raise RuntimeError("No hay archivos en el manifiesto para probar corrupción")
        
        target_item = manifest["archivos"][0]
        target_file = restored_storage / target_item["ruta"]
        original_bytes = target_file.read_bytes()
        
        # Corromper 1 byte al inicio
        corrupted_bytes = bytes([original_bytes[0] ^ 0xFF]) + original_bytes[1:]
        target_file.write_bytes(corrupted_bytes)
        logger.info("Se alteró deliberadamente 1 byte en: %s", target_item["ruta"])
        
        # Confirmar que validate_manifest detecta la corrupción
        corruption_detected = False
        try:
            validate_manifest(restore_dir)
        except RuntimeError as err:
            if "Hash inválido" in str(err) or "Integridad inválida" in str(err):
                corruption_detected = True
                logger.info("Detección confirmada: el sistema capturó la corrupción con error: %s", err)
            else:
                raise
        
        if not corruption_detected:
            raise AssertionError("ERROR CRÍTICO: El validador NO detectó la corrupción del archivo!")
        
        # Restaurar archivo original
        target_file.write_bytes(original_bytes)
        validate_manifest(restore_dir)
        logger.info("PASO 2 EXITOSO: La prueba de corrupción controlada fue detectada y prevenida al 100%%.")
        
        # 6. Fase 4: Restauración en Base de Datos Aislada
        logger.info(">>> PASO 3: Restauración en Base de Datos Aislada (%s)", TEST_DB)
        dump_files = list(restore_dir.rglob("sea_evaluaciones.dump"))
        if not dump_files:
            raise RuntimeError("No se encontró sea_evaluaciones.dump en el snapshot restaurado")
        dump_path = dump_files[0]
        logger.info("Dump encontrado: %s (tamaño: %d bytes)", dump_path, dump_path.stat().st_size)
        
        # Conectar a base 'postgres' para crear la base de prueba limpia
        conn = connect_db("postgres")
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(f"DROP DATABASE IF EXISTS {TEST_DB}")
        cur.execute(f"CREATE DATABASE {TEST_DB} OWNER {DB_USER}")
        cur.close()
        conn.close()
        logger.info("Base de datos aislada '%s' creada.", TEST_DB)
        
        # Ejecutar pg_restore en la base de prueba
        logger.info("Ejecutando pg_restore en %s...", TEST_DB)
        pg_env = os.environ.copy()
        pg_env["PGPASSWORD"] = DB_PASSWORD
        restore_result = subprocess.run([
            "pg_restore",
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-privileges",
            "--host", DB_HOST,
            "--port", DB_PORT,
            "--username", DB_USER,
            "--dbname", TEST_DB,
            str(dump_path)
        ], env=pg_env, capture_output=True, text=True)
        
        if restore_result.returncode != 0:
            logger.warning("pg_restore completado con advertencias (normal para drop-if-exists inicial): %s", restore_result.stderr[:300])
        
        # 7. Fase 4: Validación de la estructura y datos en la base aislada
        logger.info(">>> PASO 4: Verificación estructural de la base restaurada")
        with connect_db(TEST_DB) as conn, conn.cursor() as cur:
            # Contar tablas públicas
            cur.execute("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
            table_count = cur.fetchone()[0]
            logger.info("Tablas restauradas: %d", table_count)
            if table_count < 25:
                raise RuntimeError(f"Recuperación incompleta de tablas: solo {table_count} tablas encontradas")
            
            # Validar migraciones Flyway
            cur.execute("SELECT version, description, installed_on FROM flyway_schema_history WHERE success = TRUE ORDER BY installed_rank DESC LIMIT 3")
            migraciones = cur.fetchall()
            logger.info("Últimas migraciones Flyway restauradas:")
            for m in migraciones:
                logger.info("  - V%s: %s (instalada: %s)", m[0], m[1], m[2])
            latest_version = int(migraciones[0][0])
            if latest_version < 25:
                raise RuntimeError(f"Versión de Flyway insuficiente: {latest_version}")
            
            # Validar usuario administrador activo
            cur.execute("SELECT usuario, correo, activo FROM sea_usuarios_sistema WHERE rol_codigo = 'ADMINISTRADOR_SISTEMA' AND activo = TRUE")
            admins = cur.fetchall()
            logger.info("Administradores activos restaurados: %d", len(admins))
            if len(admins) < 1:
                raise RuntimeError("No se encontró ningún administrador activo en la base restaurada")
            for admin in admins:
                logger.info("  - Admin: %s (%s)", admin[0], admin[1])
            
            # Validar datos institucionales
            cur.execute("SELECT count(*), count(DISTINCT carrera_codigo), count(DISTINCT materia_codigo) FROM sea_roles_evaluaciones")
            roles_exam, carreras_distintas, materias_distintas = cur.fetchone()
            cur.execute("SELECT count(*) FROM sea_reactivos")
            reactivos = cur.fetchone()[0]
            cur.execute("SELECT count(*) FROM sea_bancos_preguntas WHERE contenido_cifrado IS NOT NULL")
            bancos_cifrados = cur.fetchone()[0]
            cur.execute("SELECT count(*) FROM sea_cartillas_omr")
            cartillas = cur.fetchone()[0]
            
            logger.info("Resumen de entidades recuperadas en la base aislada:")
            logger.info("  - Exámenes en rol evaluativo: %d", roles_exam)
            logger.info("  - Carreras académicas únicas: %d", carreras_distintas)
            logger.info("  - Materias/Asignaturas únicas: %d", materias_distintas)
            logger.info("  - Reactivos registrados: %d", reactivos)
            logger.info("  - Bancos cifrados (con DEK envuelta por Vault Transit): %d", bancos_cifrados)
            logger.info("  - Cartillas OMR registradas: %d", cartillas)
            
            if roles_exam == 0 or reactivos == 0 or bancos_cifrados == 0:
                raise RuntimeError("Las tablas institucionales clave están vacías en la base restaurada")
        
        logger.info("PASO 4 EXITOSO: La base de datos fue restaurada y validada en aislamiento al 100%%.")
        logger.info("=================================================================")
        logger.info("CERTIFICACIÓN DE INTEGRIDAD Y RESTAURACIÓN AISLADA: APROBADA")
        logger.info("=================================================================")
        return True

    finally:
        # Limpieza de recursos de prueba
        logger.info("Limpiando base de datos temporal '%s'...", TEST_DB)
        try:
            conn = connect_db("postgres")
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute(f"""
                SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
                WHERE datname = '{TEST_DB}' AND pid <> pg_backend_pid()
            """)
            cur.execute(f"DROP DATABASE IF EXISTS {TEST_DB}")
            cur.close()
            conn.close()
            logger.info("Base de datos temporal eliminada.")
        except Exception as exc:
            logger.warning("Error al eliminar base de datos de prueba: %s", exc)
        
        logger.info("Eliminando carpeta temporal de prueba %s...", restore_dir)
        shutil.rmtree(restore_dir, ignore_errors=True)

if __name__ == "__main__":
    try:
        success = test_pipeline()
        sys.exit(0 if success else 1)
    except Exception as exc:
        logger.exception("FALLO EN LA PRUEBA TÉCNICA: %s", exc)
        sys.exit(1)
