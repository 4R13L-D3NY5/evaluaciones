-- =============================================================================
-- V61: Módulo de Evaluación Docente por Director de Carrera y Administrador
-- =============================================================================

-- 1. Tabla de Instrumentos / Tests
CREATE TABLE IF NOT EXISTS sea_evaluacion_instrumentos (
    id VARCHAR(64) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
        CHECK (estado IN ('BORRADOR', 'VIGENTE', 'HISTORICO')),
    escala_min INTEGER NOT NULL DEFAULT 1,
    escala_max INTEGER NOT NULL DEFAULT 5,
    creado_por VARCHAR(100) NOT NULL DEFAULT 'ADMIN_EVALUACIONES',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eval_inst_estado ON sea_evaluacion_instrumentos (estado);

-- 2. Tabla de Secciones / Competencias
CREATE TABLE IF NOT EXISTS sea_evaluacion_secciones (
    id VARCHAR(64) PRIMARY KEY,
    instrumento_id VARCHAR(64) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_sec_instrumento FOREIGN KEY (instrumento_id)
        REFERENCES sea_evaluacion_instrumentos (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_eval_sec_inst ON sea_evaluacion_secciones (instrumento_id, orden);

-- 3. Tabla de Criterios / Indicadores de Desempeño
CREATE TABLE IF NOT EXISTS sea_evaluacion_criterios (
    id VARCHAR(64) PRIMARY KEY,
    seccion_id VARCHAR(64) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    enunciado TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_crit_seccion FOREIGN KEY (seccion_id)
        REFERENCES sea_evaluacion_secciones (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_eval_crit_sec ON sea_evaluacion_criterios (seccion_id, orden);

-- 4. Tabla de Registros de Evaluación Aplicada a Docentes
CREATE TABLE IF NOT EXISTS sea_evaluacion_docente_registros (
    id VARCHAR(64) PRIMARY KEY,
    instrumento_id VARCHAR(64) NOT NULL,
    gestion VARCHAR(30) NOT NULL,
    sede_id VARCHAR(64),
    sede_codigo VARCHAR(20) NOT NULL,
    sede_nombre VARCHAR(150) NOT NULL,
    carrera_id VARCHAR(64),
    carrera_codigo VARCHAR(50) NOT NULL,
    carrera_nombre VARCHAR(200) NOT NULL,
    materia_codigo VARCHAR(50) NOT NULL,
    materia_nombre VARCHAR(200) NOT NULL,
    grupo_codigo VARCHAR(50) NOT NULL,
    docente_id VARCHAR(64),
    docente_nombre VARCHAR(220) NOT NULL,
    docente_identificacion VARCHAR(50),
    evaluador_id VARCHAR(64),
    evaluador_nombre VARCHAR(220) NOT NULL,
    evaluador_rol VARCHAR(50) NOT NULL,
    fecha_evaluacion DATE NOT NULL,
    hora_evaluacion VARCHAR(20),
    puntaje_actitudinal NUMERIC(6,2) NOT NULL DEFAULT 0,
    puntaje_procedimental NUMERIC(6,2) NOT NULL DEFAULT 0,
    puntaje_cognitivo NUMERIC(6,2) NOT NULL DEFAULT 0,
    puntaje_total NUMERIC(6,2) NOT NULL DEFAULT 0,
    puntaje_maximo NUMERIC(6,2) NOT NULL DEFAULT 100,
    porcentaje NUMERIC(5,2) NOT NULL DEFAULT 0,
    observaciones TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'COMPLETADA',
    creado_por VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_reg_instrumento FOREIGN KEY (instrumento_id)
        REFERENCES sea_evaluacion_instrumentos (id)
);

CREATE INDEX IF NOT EXISTS idx_eval_reg_carrera_gestion 
    ON sea_evaluacion_docente_registros (sede_codigo, carrera_codigo, gestion);
CREATE INDEX IF NOT EXISTS idx_eval_reg_docente 
    ON sea_evaluacion_docente_registros (docente_nombre);
CREATE INDEX IF NOT EXISTS idx_eval_reg_materia_grupo 
    ON sea_evaluacion_docente_registros (materia_codigo, grupo_codigo);

-- 5. Tabla de Respuestas Detalladas de la Evaluación
CREATE TABLE IF NOT EXISTS sea_evaluacion_docente_respuestas (
    id BIGSERIAL PRIMARY KEY,
    registro_id VARCHAR(64) NOT NULL,
    criterio_id VARCHAR(64) NOT NULL,
    puntuacion INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    CONSTRAINT fk_eval_resp_registro FOREIGN KEY (registro_id)
        REFERENCES sea_evaluacion_docente_registros (id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_resp_criterio FOREIGN KEY (criterio_id)
        REFERENCES sea_evaluacion_criterios (id)
);

CREATE INDEX IF NOT EXISTS idx_eval_resp_reg ON sea_evaluacion_docente_respuestas (registro_id);

-- =============================================================================
-- Precarga del Instrumento Oficial: EVALUACION DE LA COMPETENCIA DOCENTE
-- =============================================================================
INSERT INTO sea_evaluacion_instrumentos (
    id, codigo, titulo, descripcion, estado, escala_min, escala_max, creado_por
) VALUES (
    'inst-dir-carrera-unitepc-v1',
    'EVAL-DIR-UNITEPC-V1',
    'EVALUACIÓN DE LA COMPETENCIA DOCENTE',
    'Instrumento institucional oficial de evaluación de desempeño docente aplicado por Directores de Carrera y Administradores.',
    'VIGENTE',
    1,
    5,
    'SISTEMA'
) ON CONFLICT (id) DO NOTHING;

-- Secciones
INSERT INTO sea_evaluacion_secciones (id, instrumento_id, codigo, nombre, descripcion, orden) VALUES
('sec-actitudinal', 'inst-dir-carrera-unitepc-v1', 'ACTITUDINAL', 'Competencia Actitudinal', 'Evalúa puntualidad, formalidad, comunicación y clima en el aula.', 1),
('sec-procedimental', 'inst-dir-carrera-unitepc-v1', 'PROCEDIMENTAL', 'Competencia Procedimental', 'Evalúa didáctica, uso de medios, metodologías y actividades participativas.', 2),
('sec-cognitiva', 'inst-dir-carrera-unitepc-v1', 'COGNITIVA', 'Competencia Cognitiva', 'Evalúa dominio temático, claridad de objetivos, profundidad y conclusiones.', 3)
ON CONFLICT (id) DO NOTHING;

-- Criterios Competencia Actitudinal (1.1 a 1.7)
INSERT INTO sea_evaluacion_criterios (id, seccion_id, numero, enunciado, orden) VALUES
('crit-1-1', 'sec-actitudinal', '1.1', '¿Asiste puntualmente a la clase programada?', 1),
('crit-1-2', 'sec-actitudinal', '1.2', '¿Se presenta formalmente a clase, con vestimenta adecuada?', 2),
('crit-1-3', 'sec-actitudinal', '1.3', '¿Responde cordialmente consultas y preguntas de los asistentes?', 3),
('crit-1-4', 'sec-actitudinal', '1.4', '¿Mantiene contacto visual, tono de voz apropiado, corrección en la expresión y lenguaje corporal?', 4),
('crit-1-5', 'sec-actitudinal', '1.5', '¿Utiliza vocabulario adecuado al nivel de los asistentes?', 5),
('crit-1-6', 'sec-actitudinal', '1.6', '¿Promueve la participación?', 6),
('crit-1-7', 'sec-actitudinal', '1.7', '¿Al comienzo de la clase establece las reglas de comportamiento?', 7)
ON CONFLICT (id) DO NOTHING;

-- Criterios Competencia Procedimental (2.1 a 2.7)
INSERT INTO sea_evaluacion_criterios (id, seccion_id, numero, enunciado, orden) VALUES
('crit-2-1', 'sec-procedimental', '2.1', '¿Motiva y crea expectativas de aprendizaje?', 1),
('crit-2-2', 'sec-procedimental', '2.2', '¿Emplea en forma correcta y oportuna los medios, materiales y recursos para el desarrollo de la sesión de aprendizaje?', 2),
('crit-2-3', 'sec-procedimental', '2.3', '¿Los métodos y procedimientos de la sesión se corresponden con los objetivos de la sesión de aprendizaje?', 3),
('crit-2-4', 'sec-procedimental', '2.4', '¿Las diapositivas están bien estructuradas y tiene buena didáctica?', 4),
('crit-2-5', 'sec-procedimental', '2.5', '¿Demuestra preparación de la clase y desarrolla actividades de aplicación para el logro de objetivos de orden superior?', 5),
('crit-2-6', 'sec-procedimental', '2.6', '¿Aplica actividades participativas periódicamente durante la clase con el objetivo de retomar la atención de los participantes?', 6),
('crit-2-7', 'sec-procedimental', '2.7', '¿Utiliza ejemplos para facilitar la comprensión del tema?', 7)
ON CONFLICT (id) DO NOTHING;

-- Criterios Competencia Cognitiva (3.1 a 3.6)
INSERT INTO sea_evaluacion_criterios (id, seccion_id, numero, enunciado, orden) VALUES
('crit-3-1', 'sec-cognitiva', '3.1', '¿Al inicio de la sesión, presenta los objetivos de la clase?', 1),
('crit-3-2', 'sec-cognitiva', '3.2', '¿Evidencia conocimiento actualizado del tema?', 2),
('crit-3-3', 'sec-cognitiva', '3.3', '¿El nivel de profundidad y complejidad de los temas es el adecuado?', 3),
('crit-3-4', 'sec-cognitiva', '3.4', '¿Evidencia secuencialidad en el desarrollo de los contenidos?', 4),
('crit-3-5', 'sec-cognitiva', '3.5', '¿Al finalizar la clase el docente entrega las referencias de lectura complementaria?', 5),
('crit-3-6', 'sec-cognitiva', '3.6', '¿Realiza un resumen final al concluir la clase?', 6)
ON CONFLICT (id) DO NOTHING;
