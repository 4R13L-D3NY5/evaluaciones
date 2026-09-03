#!/bin/sh

set -u

VAULT_KEYS_FILE="${VAULT_KEYS_FILE:-/vault/secrets/unseal-keys}"
LAST_STATE=""

log_state() {
  state="$1"
  message="$2"
  if [ "$state" != "$LAST_STATE" ]; then
    echo "[vault-bootstrap] $message"
    LAST_STATE="$state"
  fi
}

obtener_estado() {
  vault status -format=json 2>/dev/null || true
}

esta_inicializado() {
  echo "$1" | grep -q '"initialized"[[:space:]]*:[[:space:]]*true'
}

esta_desbloqueado() {
  echo "$1" | grep -q '"sealed"[[:space:]]*:[[:space:]]*false'
}

desbloquear() {
  estado="$1"

  if [ ! -r "$VAULT_KEYS_FILE" ]; then
    log_state "sin-llaves" "Vault está sellado y no existe $VAULT_KEYS_FILE. Coloque las 3 llaves institucionales, una por línea."
    return 1
  fi

  aplicadas=0
  while IFS= read -r llave || [ -n "$llave" ]; do
    llave=$(printf '%s' "$llave" | sed 's/[[:space:]]*#.*$//' | tr -d '[:space:]\r')
    [ -z "$llave" ] && continue

    if ! vault operator unseal "$llave" >/dev/null 2>&1; then
      log_state "error-llave" "No se pudo aplicar una llave de desbloqueo. Verifique el archivo y la custodia institucional."
      return 1
    fi
    aplicadas=$((aplicadas + 1))
    estado=$(obtener_estado)
    if esta_desbloqueado "$estado"; then
      log_state "desbloqueado" "Vault desbloqueado correctamente; cifración disponible."
      return 0
    fi
  done < "$VAULT_KEYS_FILE"

  log_state "umbral-incompleto" "Vault continúa sellado. Se aplicaron $aplicadas llaves; se requieren las suficientes para alcanzar el umbral institucional."
  return 1
}

echo "[vault-bootstrap] Supervisor de desbloqueo iniciado."

while true; do
  estado=$(obtener_estado)

  if [ -z "$estado" ]; then
    log_state "esperando-vault" "Esperando a que Vault acepte conexiones..."
    sleep 5
    continue
  fi

  if ! esta_inicializado "$estado"; then
    log_state "no-inicializado" "Vault aún no está inicializado. Realice la inicialización institucional siguiendo guia_despliegue.md."
    sleep 15
    continue
  fi

  if esta_desbloqueado "$estado"; then
    log_state "desbloqueado" "Vault está desbloqueado y listo."
    sleep 15
    continue
  fi

  desbloquear "$estado" || sleep 15
done
