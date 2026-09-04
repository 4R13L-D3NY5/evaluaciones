ALTER TABLE sea_salas_examen_virtual
    ADD COLUMN IF NOT EXISTS token_grupo_hash VARCHAR(128) NULL,
    ADD COLUMN IF NOT EXISTS token_grupo_emitido_en TIMESTAMP NULL;

ALTER TABLE sea_intentos_examen_virtual
    ADD COLUMN IF NOT EXISTS token_sesion_hash VARCHAR(128) NULL,
    ADD COLUMN IF NOT EXISTS token_sesion_emitido_en TIMESTAMP NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_intentos_virtual_token_sesion
    ON sea_intentos_examen_virtual (token_sesion_hash)
    WHERE token_sesion_hash IS NOT NULL;
