-- V50: Trazabilidad de fechas oficiales de toma de grupo e inscripcion de estudiantes (T-049)
-- Persiste las marcas temporales enrollCreatedAt y enrollUpdatedAt provistas por el Gateway SEA de UNITEPC.

ALTER TABLE sea_mapeo_estudiantes_variantes
    ADD COLUMN IF NOT EXISTS sea_enroll_created_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS sea_enroll_updated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN sea_mapeo_estudiantes_variantes.sea_enroll_created_at IS 'Fecha y hora exacta en la que el estudiante fue inscrito/matriculado en el grupo en el SEA institucional';
COMMENT ON COLUMN sea_mapeo_estudiantes_variantes.sea_enroll_updated_at IS 'Fecha y hora exacta de la ultima modificacion de asignacion de grupo del estudiante en el SEA institucional';

CREATE INDEX IF NOT EXISTS idx_mapeo_sea_enroll_created ON sea_mapeo_estudiantes_variantes (sea_enroll_created_at);
