"""Cifrado envelope compatible con BancoCifradoService de Spring."""
import base64
import json
import os
import secrets
import urllib.request
from typing import Any

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from src import config


def _token() -> str:
    if config.VAULT_TOKEN_FILE and os.path.exists(config.VAULT_TOKEN_FILE):
        with open(config.VAULT_TOKEN_FILE, "r", encoding="utf-8") as archivo:
            return archivo.read().strip()
    if config.VAULT_TOKEN:
        return config.VAULT_TOKEN.strip()
    raise RuntimeError("No está configurado el token protegido de Vault")


def _vault_post(path: str, body: dict[str, Any]) -> dict[str, Any]:
    request = urllib.request.Request(
        f"{config.VAULT_ADDR}{path}",
        data=json.dumps(body).encode("utf-8"),
        headers={"X-Vault-Token": _token(), "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=config.VAULT_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return payload.get("data", {})
    except Exception as exc:
        raise RuntimeError("Vault rechazó la operación criptográfica") from exc


def _wrap_key(data_key: bytes) -> tuple[str, str]:
    result = _vault_post(
        f"/v1/transit/encrypt/{config.VAULT_TRANSIT_KEY_NAME}",
        {"plaintext": base64.b64encode(data_key).decode("ascii")},
    )
    wrapped = str(result.get("ciphertext", ""))
    if not wrapped:
        raise RuntimeError("Vault no devolvió la DEK envuelta")
    return wrapped, str(result.get("key_version", ""))


def _unwrap_key(wrapped: str) -> bytes:
    result = _vault_post(
        f"/v1/transit/decrypt/{config.VAULT_TRANSIT_KEY_NAME}",
        {"ciphertext": wrapped},
    )
    plaintext = str(result.get("plaintext", ""))
    if not plaintext:
        raise RuntimeError("Vault no devolvió la DEK")
    return base64.b64decode(plaintext)


def cifrar_json(value: dict[str, Any], context: str) -> dict[str, str]:
    data_key = secrets.token_bytes(32)
    nonce = secrets.token_bytes(12)
    plaintext = json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    ciphertext = AESGCM(data_key).encrypt(nonce, plaintext, context.encode("utf-8"))
    wrapped, version = _wrap_key(data_key)
    return {
        "ciphertext": base64.b64encode(ciphertext).decode("ascii"),
        "nonce": base64.b64encode(nonce).decode("ascii"),
        "wrappedDataKey": wrapped,
        "keyReference": config.VAULT_TRANSIT_KEY_NAME,
        "keyVersion": version,
        "algorithm": "AES-256-GCM-v1",
    }


def descifrar_json(payload: dict[str, Any], context: str) -> dict[str, Any]:
    data_key = _unwrap_key(str(payload["wrappedDataKey"]))
    try:
        nonce = base64.b64decode(str(payload["nonce"]))
        ciphertext = base64.b64decode(str(payload["ciphertext"]))
        plaintext = AESGCM(data_key).decrypt(nonce, ciphertext, context.encode("utf-8"))
        return json.loads(plaintext.decode("utf-8"))
    finally:
        # bytearray permite limpiar la copia local de la clave de datos.
        mutable = bytearray(data_key)
        for index in range(len(mutable)):
            mutable[index] = 0
