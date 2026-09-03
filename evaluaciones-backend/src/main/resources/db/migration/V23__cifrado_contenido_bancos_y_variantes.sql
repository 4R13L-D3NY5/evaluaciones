-- El contenido sensible se cifra fuera de PostgreSQL. Estas columnas nuevas
-- almacenan ciphertext y el sobre de la DEK, nunca la KEK.
ALTER TABLE sea_bancos_preguntas
    ADD COLUMN IF NOT EXISTS contenido_cifrado TEXT NULL,
    ADD COLUMN IF NOT EXISTS contenido_nonce VARCHAR(64) NULL,
    ADD COLUMN IF NOT EXISTS contenido_dek_envuelta TEXT NULL,
    ADD COLUMN IF NOT EXISTS contenido_kek_referencia VARCHAR(150) NULL,
    ADD COLUMN IF NOT EXISTS contenido_kek_version VARCHAR(30) NULL,
    ADD COLUMN IF NOT EXISTS contenido_algoritmo VARCHAR(40) NULL;

ALTER TABLE sea_bancos_preguntas
    ALTER COLUMN paquete_json_encriptado DROP NOT NULL;

ALTER TABLE sea_reactivos
    ALTER COLUMN enunciado DROP NOT NULL,
    ALTER COLUMN opciones_json DROP NOT NULL,
    ALTER COLUMN respuesta_correcta DROP NOT NULL;

ALTER TABLE sea_examenes_variantes
    ALTER COLUMN patron_claves_json DROP NOT NULL,
    ALTER COLUMN orden_reactivos_ids_json DROP NOT NULL;

ALTER TABLE sea_examenes_variantes
    ADD COLUMN IF NOT EXISTS contenido_seguro_cifrado TEXT NULL,
    ADD COLUMN IF NOT EXISTS contenido_seguro_nonce VARCHAR(64) NULL,
    ADD COLUMN IF NOT EXISTS contenido_seguro_dek_envuelta TEXT NULL,
    ADD COLUMN IF NOT EXISTS contenido_seguro_kek_referencia VARCHAR(150) NULL,
    ADD COLUMN IF NOT EXISTS contenido_seguro_kek_version VARCHAR(30) NULL,
    ADD COLUMN IF NOT EXISTS contenido_seguro_algoritmo VARCHAR(40) NULL;

COMMENT ON COLUMN sea_bancos_preguntas.contenido_cifrado IS
    'Paquete JSON cifrado con AES-256-GCM; la DEK está envuelta por Vault Transit.';
COMMENT ON COLUMN sea_examenes_variantes.contenido_seguro_cifrado IS
    'Patrón OMR, orden y contenido virtual cifrados con AES-256-GCM.';
