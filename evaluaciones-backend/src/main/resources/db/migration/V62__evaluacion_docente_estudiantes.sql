-- =============================================================================
-- V62: Módulo de Evaluación Docente por Estudiantes y Monitoreo de Avance
-- =============================================================================

-- 1. Agregar columna 'destinatario' a la tabla de instrumentos (DIRECTOR o ESTUDIANTE)
ALTER TABLE sea_evaluacion_instrumentos 
    ADD COLUMN IF NOT EXISTS destinatario VARCHAR(30) NOT NULL DEFAULT 'DIRECTOR';

CREATE INDEX IF NOT EXISTS idx_eval_inst_destinatario 
    ON sea_evaluacion_instrumentos (destinatario, estado);

-- 2. Tabla de Registros de Evaluación de Docentes realizada por Estudiantes
CREATE TABLE IF NOT EXISTS sea_evaluacion_estudiante_registros (
    id VARCHAR(64) PRIMARY KEY,
    instrumento_id VARCHAR(64) NOT NULL,
    gestion VARCHAR(30) NOT NULL,
    sede_codigo VARCHAR(20) NOT NULL,
    sede_nombre VARCHAR(150),
    carrera_codigo VARCHAR(50) NOT NULL,
    carrera_nombre VARCHAR(200),
    materia_codigo VARCHAR(50) NOT NULL,
    materia_nombre VARCHAR(200) NOT NULL,
    grupo_codigo VARCHAR(50) NOT NULL,
    docente_id VARCHAR(64),
    docente_nombre VARCHAR(220) NOT NULL,
    estudiante_codigo VARCHAR(50) NOT NULL,
    estudiante_nombre VARCHAR(220) NOT NULL,
    puntaje_total NUMERIC(6,2) NOT NULL DEFAULT 0,
    puntaje_maximo NUMERIC(6,2) NOT NULL DEFAULT 100,
    porcentaje NUMERIC(5,2) NOT NULL DEFAULT 0,
    observaciones TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'COMPLETADA',
    ip_origen VARCHAR(45),
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_est_reg_instrumento FOREIGN KEY (instrumento_id)
        REFERENCES sea_evaluacion_instrumentos (id),
    CONSTRAINT uq_eval_est_grupo UNIQUE (estudiante_codigo, materia_codigo, grupo_codigo, gestion)
);

CREATE INDEX IF NOT EXISTS idx_eval_est_reg_carrera_gestion 
    ON sea_evaluacion_estudiante_registros (sede_codigo, carrera_codigo, gestion);
CREATE INDEX IF NOT EXISTS idx_eval_est_reg_estudiante 
    ON sea_evaluacion_estudiante_registros (estudiante_codigo, gestion);
CREATE INDEX IF NOT EXISTS idx_eval_est_reg_docente 
    ON sea_evaluacion_estudiante_registros (docente_nombre, gestion);
CREATE INDEX IF NOT EXISTS idx_eval_est_reg_materia_grupo 
    ON sea_evaluacion_estudiante_registros (materia_codigo, grupo_codigo, gestion);

-- 3. Tabla de Respuestas Detalladas de la Evaluación Estudiantil
CREATE TABLE IF NOT EXISTS sea_evaluacion_estudiante_respuestas (
    id BIGSERIAL PRIMARY KEY,
    registro_id VARCHAR(64) NOT NULL,
    criterio_id VARCHAR(64) NOT NULL,
    puntuacion INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    CONSTRAINT fk_eval_est_resp_registro FOREIGN KEY (registro_id)
        REFERENCES sea_evaluacion_estudiante_registros (id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_est_resp_criterio FOREIGN KEY (criterio_id)
        REFERENCES sea_evaluacion_criterios (id)
);

CREATE INDEX IF NOT EXISTS idx_eval_est_resp_reg 
    ON sea_evaluacion_estudiante_respuestas (registro_id);

-- =============================================================================
-- Precarga del Instrumento Oficial Base para Estudiantes
-- =============================================================================
INSERT INTO sea_evaluacion_instrumentos (
    id, codigo, titulo, descripcion, estado, escala_min, escala_max, creado_por, destinatario
) VALUES (
    'inst-estudiante-unitepc-v1',
    'EVAL-EST-UNITEPC-V1',
    'EVALUACIÓN DEL DESEMPEÑO DOCENTE POR EL ESTUDIANTE',
    'Instrumento oficial de evaluación aplicada por estudiantes a sus docentes asignados en la gestión académica activa.',
    'VIGENTE',
    1,
    5,
    'SISTEMA',
    'ESTUDIANTE'
) ON CONFLICT (id) DO UPDATE SET destinatario = 'ESTUDIANTE';

-- Secciones preliminares
INSERT INTO sea_evaluacion_secciones (id, instrumento_id, codigo, nombre, descripcion, orden) VALUES
('sec-est-didactica', 'inst-estudiante-unitepc-v1', 'DIDACTICA', 'Metodología y Didáctica de Enseñanza', 'Evalúa la claridad de explicaciones, dominio del contenido y recursos de apoyo.', 1),
('sec-est-cumplimiento', 'inst-estudiante-unitepc-v1', 'CUMPLIMIENTO', 'Puntualidad y Cumplimiento del Plan', 'Evalúa asistencia, puntualidad y cumplimiento del programa analítico.', 2),
('sec-est-evaluacion', 'inst-estudiante-unitepc-v1', 'EVALUACION', 'Evaluación y Retroalimentación', 'Evalúa claridad en criterios de evaluación y resolución oportuna de dudas.', 3)
ON CONFLICT (id) DO NOTHING;

-- Criterios preliminares (actualizables cuando el usuario proporcione el formato final)
INSERT INTO sea_evaluacion_criterios (id, seccion_id, numero, enunciado, orden) VALUES
('crit-est-1-1', 'sec-est-didactica', '1.1', '¿El docente demuestra dominio y conocimiento actualizado de los temas de la materia?', 1),
('crit-est-1-2', 'sec-est-didactica', '1.2', '¿Explica los contenidos con claridad y utiliza ejemplos prácticos aplicados a la carrera?', 2),
('crit-est-1-3', 'sec-est-didactica', '1.3', '¿Utiliza recursos didácticos y medios de apoyo adecuados para facilitar el aprendizaje?', 3),
('crit-est-2-1', 'sec-est-cumplimiento', '2.1', '¿Asiste puntualmente a las clases y cumple el horario programado?', 4),
('crit-est-2-2', 'sec-est-cumplimiento', '2.2', '¿Desarrolla los contenidos del plan de estudios de forma ordenada y secuencial?', 5),
('crit-est-3-1', 'sec-est-evaluacion', '3.1', '¿Informa con anticipación las fechas y criterios con los que evaluará la materia?', 6),
('crit-est-3-2', 'sec-est-evaluacion', '3.2', '¿Responde cordialmente consultas y dudas brindando orientación oportuna?', 7),
('crit-est-3-3', 'sec-est-evaluacion', '3.3', '¿Mantiene un trato respetuoso y fomenta un ambiente propicio para el aprendizaje?', 8)
ON CONFLICT (id) DO NOTHING;
