ALTER TABLE sea_configuracion_omr
    ADD COLUMN IF NOT EXISTS alcance VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    ADD COLUMN IF NOT EXISTS campus_clave VARCHAR(220),
    ADD COLUMN IF NOT EXISTS campus_nombre VARCHAR(180),
    ADD COLUMN IF NOT EXISTS impresora_clave VARCHAR(180),
    ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE sea_configuracion_omr
    ADD CONSTRAINT ck_configuracion_omr_alcance
    CHECK (alcance IN ('GENERAL', 'CAMPUS', 'IMPRESORA'));

CREATE UNIQUE INDEX uq_configuracion_omr_alcance
    ON sea_configuracion_omr (
        alcance,
        COALESCE(campus_clave, ''),
        COALESCE(impresora_clave, '')
    )
    WHERE activo;

UPDATE sea_configuracion_omr
SET alcance = 'GENERAL',
    campus_clave = NULL,
    campus_nombre = NULL,
    impresora_clave = NULL,
    activo = TRUE
WHERE id = 1;
