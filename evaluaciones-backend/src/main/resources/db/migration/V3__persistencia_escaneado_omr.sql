ALTER TABLE sea_calificaciones_omr
    ADD COLUMN IF NOT EXISTS archivo_escaneado_path VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_omr_rol_fecha
    ON sea_calificaciones_omr (rol_examen_id, fecha_procesamiento DESC);
