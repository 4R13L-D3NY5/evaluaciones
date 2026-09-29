-- Soporte para calificaciones por reprogramación oral de exámenes en OMR
ALTER TABLE sea_calificaciones_omr
    ADD COLUMN IF NOT EXISTS es_reprogramado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fecha_examen_reprogramado DATE NULL,
    ADD COLUMN IF NOT EXISTS motivo_reprogramacion VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS comprobante_reprogramacion VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS observacion_reprogramacion TEXT NULL,
    ADD COLUMN IF NOT EXISTS reprogramado_por VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS fecha_reprogramacion TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_omr_reprogramado ON sea_calificaciones_omr (rol_examen_id, es_reprogramado);
