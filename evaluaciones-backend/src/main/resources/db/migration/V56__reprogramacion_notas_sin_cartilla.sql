-- V56: Soporte de exámenes reprogramados para la modalidad presencial sin cartilla
ALTER TABLE sea_notas_docentes
    ADD COLUMN IF NOT EXISTS es_reprogramado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fecha_examen_reprogramado DATE,
    ADD COLUMN IF NOT EXISTS motivo_reprogramacion VARCHAR(500),
    ADD COLUMN IF NOT EXISTS comprobante_reprogramacion VARCHAR(100),
    ADD COLUMN IF NOT EXISTS observacion_reprogramacion TEXT,
    ADD COLUMN IF NOT EXISTS reprogramado_por VARCHAR(100),
    ADD COLUMN IF NOT EXISTS fecha_reprogramacion TIMESTAMP,
    ADD COLUMN IF NOT EXISTS nota_original_60 NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS nota_original_100 NUMERIC(5,2);

CREATE INDEX IF NOT EXISTS idx_notas_docentes_reprogramado
    ON sea_notas_docentes(rol_examen_id, es_reprogramado);
