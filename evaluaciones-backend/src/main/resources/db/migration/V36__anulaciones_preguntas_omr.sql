CREATE TABLE IF NOT EXISTS sea_anulaciones_preguntas_omr (
    id BIGSERIAL PRIMARY KEY,
    rol_examen_id VARCHAR(64) NOT NULL,
    letra_variante VARCHAR(4) NOT NULL,
    numero_pregunta INTEGER NOT NULL,
    motivo VARCHAR(500) NOT NULL,
    anulado_por VARCHAR(100) NOT NULL,
    anulado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_anulacion_omr_rol
        FOREIGN KEY (rol_examen_id) REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE,
    CONSTRAINT ck_anulacion_omr_variante CHECK (letra_variante IN ('A', 'B', 'C', 'D', 'E')),
    CONSTRAINT ck_anulacion_omr_pregunta CHECK (numero_pregunta > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_anulacion_omr_activa
    ON sea_anulaciones_preguntas_omr (rol_examen_id, letra_variante, numero_pregunta)
    WHERE activo;

CREATE INDEX IF NOT EXISTS idx_anulacion_omr_rol_variante
    ON sea_anulaciones_preguntas_omr (rol_examen_id, letra_variante, activo);
