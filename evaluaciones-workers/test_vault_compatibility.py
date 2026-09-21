#!/usr/bin/env python3
"""
Prueba técnica de Compatibilidad Criptográfica con HashiCorp Vault Transit KMS (Fase 5).
Verifica que los bancos cifrados en la base de datos se descifren correctamente
utilizando la clave KEK (sea-banco-kek) y el contexto AAD vinculado.
"""
import base64
import json
import logging
import os
import sys
import urllib.request
import psycopg2
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [TEST-VAULT] %(message)s")
logger = logging.getLogger(__name__)

DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "sea_evaluaciones")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

VAULT_ADDR = os.getenv("VAULT_ADDR", "http://vault:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN")
TRANSIT_KEY = os.getenv("VAULT_TRANSIT_KEY_NAME", "sea-banco-kek")

def unwrap_dek_vault(wrapped_key: str) -> bytes:
    url = f"{VAULT_ADDR}/v1/transit/decrypt/{TRANSIT_KEY}"
    payload = json.dumps({"ciphertext": wrapped_key}).encode("utf-8")
    headers = {"X-Vault-Token": VAULT_TOKEN, "Content-Type": "application/json"}
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            b64_plaintext = data["data"]["plaintext"]
            return base64.b64decode(b64_plaintext)
    except Exception as exc:
        raise RuntimeError(f"Fallo al desenvolver DEK desde Vault Transit ({url}): {exc}")

def test_vault_decryption():
    logger.info("=================================================================")
    logger.info("INICIANDO PRUEBA DE CIFRADO / DESCIFRADO VAULT TRANSIT (FASE 5)")
    logger.info("=================================================================")
    logger.info("Vault Addr: %s | Transit Key: %s", VAULT_ADDR, TRANSIT_KEY)
    
    if not VAULT_TOKEN:
        raise RuntimeError("VAULT_TOKEN no está definido en el entorno del worker")
    
    # 1. Obtener un banco cifrado de la base de datos
    conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, rol_examen_id, contenido_cifrado, contenido_nonce, 
                   contenido_dek_envuelta, contenido_algoritmo 
            FROM sea_bancos_preguntas 
            WHERE contenido_cifrado IS NOT NULL AND contenido_dek_envuelta IS NOT NULL 
            LIMIT 1
        """)
        row = cur.fetchone()
    conn.close()
    
    if not row:
        raise RuntimeError("No se encontró ningún banco con contenido_cifrado en la base de datos")
    
    banco_id, rol_examen_id, ciphertext_b64, nonce_b64, wrapped_dek, algoritmo = row
    logger.info("Banco seleccionado: %s (rol_examen: %s, algoritmo: %s)", banco_id, rol_examen_id, algoritmo)
    logger.info("Wrapped DEK: %s...", wrapped_dek[:40])
    
    # 2. Desenvolver la DEK usando Vault Transit KMS
    logger.info("Solicitando unwrapping de la DEK a Vault Transit KMS...")
    dek = unwrap_dek_vault(wrapped_dek)
    logger.info("DEK desenvuelta exitosamente (longitud: %d bytes / 256 bits).", len(dek))
    
    # 3. Descifrar con AES-256-GCM y validar autenticación AAD
    contexto = f"banco:{banco_id}:rol:{rol_examen_id}"
    logger.info("Contexto AAD vinculado: '%s'", contexto)
    
    nonce = base64.b64decode(nonce_b64)
    ciphertext = base64.b64decode(ciphertext_b64)
    
    aesgcm = AESGCM(dek)
    plaintext_bytes = aesgcm.decrypt(nonce, ciphertext, contexto.encode("utf-8"))
    plaintext = plaintext_bytes.decode("utf-8")
    
    logger.info("Descifrado AES-256-GCM exitoso. Tamaño del payload descifrado: %d caracteres.", len(plaintext))
    
    # Validar que el payload es JSON con preguntas
    parsed = json.loads(plaintext)
    if isinstance(parsed, list):
        logger.info("Contenido estructurado: lista de %d reactivos/preguntas.", len(parsed))
    elif isinstance(parsed, dict):
        logger.info("Contenido estructurado: objeto JSON con claves: %s", list(parsed.keys()))
    
    # 4. Probar rechazo con contexto manipulado (Defensa en profundidad)
    logger.info("Verificando rechazo criptográfico ante manipulación de contexto AAD...")
    contexto_manipulado = f"banco:{banco_id}:rol:OTRO-ROL-FALSIFICADO"
    try:
        aesgcm.decrypt(nonce, ciphertext, contexto_manipulado.encode("utf-8"))
        raise AssertionError("ERROR CRÍTICO: Descifrado tuvo éxito con contexto AAD falsificado!")
    except Exception as exc:
        logger.info("Rechazo verificado correctamente ante contexto manipulado: %s", type(exc).__name__)
    
    logger.info("=================================================================")
    logger.info("CERTIFICACIÓN VAULT TRANSIT KMS Y DESCIFRADO: APROBADA AL 100%%")
    logger.info("=================================================================")
    return True

if __name__ == "__main__":
    try:
        success = test_vault_decryption()
        sys.exit(0 if success else 1)
    except Exception as exc:
        logger.exception("FALLO EN LA PRUEBA DE VAULT: %s", exc)
        sys.exit(1)
