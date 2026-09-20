-- Permitir el estado ANULADO en sea_calificaciones_omr para soportar anulación administrativa de exámenes
ALTER TABLE sea_calificaciones_omr
    DROP CONSTRAINT IF EXISTS sea_calificaciones_omr_estado_calificacion_check;

ALTER TABLE sea_calificaciones_omr
    ADD CONSTRAINT sea_calificaciones_omr_estado_calificacion_check
    CHECK (estado_calificacion IN ('APROBADO', 'REPROBADO', 'REVISION_MANUAL', 'ANULADO'));

-- Ampliar longitud de procesado_por para evitar desbordamiento con sufijos de auditoría
ALTER TABLE sea_calificaciones_omr
    ALTER COLUMN procesado_por TYPE VARCHAR(100);
