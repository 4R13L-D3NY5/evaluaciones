-- =============================================================================
-- V64: Habilitación de Evaluación Docente Estudiantil por Semestre
-- =============================================================================

CREATE TABLE IF NOT EXISTS sea_evaluacion_habilitacion_semestre (
    id VARCHAR(64) PRIMARY KEY,
    sede_codigo VARCHAR(20) NOT NULL,
    carrera_codigo VARCHAR(50) NOT NULL,
    gestion VARCHAR(30) NOT NULL,
    semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 12),
    habilitado BOOLEAN NOT NULL DEFAULT true,
    habilitado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_en TIMESTAMP NOT NULL,
    duracion_minutos INTEGER NOT NULL DEFAULT 90,
    habilitado_por VARCHAR(100),
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_hab_semestre UNIQUE (sede_codigo, carrera_codigo, gestion, semestre)
);

CREATE INDEX IF NOT EXISTS idx_hab_sem_lookup 
    ON sea_evaluacion_habilitacion_semestre (sede_codigo, carrera_codigo, gestion, semestre, expira_en);
