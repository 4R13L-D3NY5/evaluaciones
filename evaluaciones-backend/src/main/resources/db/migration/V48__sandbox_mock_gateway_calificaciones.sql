-- =========================================================================
-- V48: Tabla Sandbox / Mock Gateway para recepción y verificación de notas
-- =========================================================================

CREATE TABLE IF NOT EXISTS sea_mock_gateway_calificaciones (
    id BIGSERIAL PRIMARY KEY,
    syllabus_course_id UUID NOT NULL,
    group_id UUID NOT NULL,
    student_old_code BIGINT NOT NULL,
    score INTEGER NOT NULL,
    client_id VARCHAR(100),
    recibido_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    intentos_recibidos INTEGER NOT NULL DEFAULT 1,
    raw_request_json TEXT,
    CONSTRAINT uk_mock_gateway_estudiante UNIQUE (group_id, syllabus_course_id, student_old_code)
);

CREATE INDEX IF NOT EXISTS idx_mock_gateway_group_id ON sea_mock_gateway_calificaciones (group_id);
CREATE INDEX IF NOT EXISTS idx_mock_gateway_student_code ON sea_mock_gateway_calificaciones (student_old_code);
