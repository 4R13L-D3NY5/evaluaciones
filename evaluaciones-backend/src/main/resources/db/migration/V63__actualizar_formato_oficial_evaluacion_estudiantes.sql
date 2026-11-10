-- =============================================================================
-- V63: Actualizar Instrumento Oficial de Evaluación Docente por Estudiantes
-- Basado en el formato oficial de UNITEPC (Google Forms):
-- Escala 1 a 3 (1: NUNCA, 2: CASI SIEMPRE, 3: SIEMPRE)
-- 5 Dimensiones y 16 criterios oficiales
-- Regla de Negocio: Consolidación por Materia + Docente (1 evaluación por docente en la materia)
-- =============================================================================

-- 1. Actualizar instrumento vigente de estudiantes a escala 1 a 3
UPDATE sea_evaluacion_instrumentos
SET titulo = 'EVALUACIÓN DE DESEMPEÑO DOCENTE - ESTUDIANTES',
    descripcion = 'Instrumento oficial institucional para la evaluación de desempeño docente por parte de los estudiantes.',
    escala_min = 1,
    escala_max = 3
WHERE id = 'inst-estudiante-unitepc-v1';

-- 2. Limpiar secciones y criterios preliminares de la versión V1
DELETE FROM sea_evaluacion_estudiante_respuestas 
WHERE criterio_id IN (
    SELECT c.id FROM sea_evaluacion_criterios c
    JOIN sea_evaluacion_secciones s ON s.id = c.seccion_id
    WHERE s.instrumento_id = 'inst-estudiante-unitepc-v1'
);

DELETE FROM sea_evaluacion_criterios 
WHERE seccion_id IN (
    SELECT id FROM sea_evaluacion_secciones 
    WHERE instrumento_id = 'inst-estudiante-unitepc-v1'
);

DELETE FROM sea_evaluacion_secciones 
WHERE instrumento_id = 'inst-estudiante-unitepc-v1';

-- 3. Insertar las 5 Dimensiones Oficiales
INSERT INTO sea_evaluacion_secciones (id, instrumento_id, codigo, nombre, descripcion, orden) VALUES
('sec-est-dominio', 'inst-estudiante-unitepc-v1', 'DOMINIO', 'DOMINIO DE LA ASIGNATURA', 'A continuación, selecciona el número que corresponda a tu opinión con respecto al desempeño de tu docente en relación a cada pregunta.', 1),
('sec-est-planificacion', 'inst-estudiante-unitepc-v1', 'PLANIFICACION', 'PLANIFICACIÓN DE LA ASIGNATURA', 'A continuación, selecciona el número que corresponda a tu opinión con respecto al desempeño de tu docente en relación a cada pregunta.', 2),
('sec-est-metodologia', 'inst-estudiante-unitepc-v1', 'METODOLOGIA', 'METODOLOGÍA DE ENSEÑANZA', 'A continuación, selecciona el número que corresponda a tu opinión con respecto al desempeño de tu docente en relación a cada pregunta.', 3),
('sec-est-evaluacion', 'inst-estudiante-unitepc-v1', 'EVALUACION', 'EVALUACIÓN DE APRENDIZAJES', 'A continuación, selecciona el número que corresponda a tu opinión con respecto al desempeño de tu docente en relación a cada pregunta.', 4),
('sec-est-actitud', 'inst-estudiante-unitepc-v1', 'ACTITUD', 'ACTITUD DOCENTE', 'A continuación, selecciona el número que corresponda a tu opinión con respecto al desempeño de tu docente en relación a cada pregunta.', 5);

-- 4. Insertar los 16 Criterios Oficiales
-- Dimensión 1: Dominio de la Asignatura
INSERT INTO sea_evaluacion_criterios (id, seccion_id, numero, enunciado, orden) VALUES
('crit-est-1-1', 'sec-est-dominio', '1.1', 'El docente demuestra dominio de la asignatura al atender las consultas que realizan los estudiantes.', 1),
('crit-est-1-2', 'sec-est-dominio', '1.2', 'Explica de forma clara los contenidos de la asignatura.', 2),
('crit-est-1-3', 'sec-est-dominio', '1.3', 'Propone ejemplos o ejercicios que vinculan la asignatura con la práctica profesional.', 3),

-- Dimensión 2: Planificación de la Asignatura
('crit-est-2-1', 'sec-est-planificacion', '2.1', 'Presenta al inicio del semestre la planificación de la asignatura, dando a conocer las competencias a desarrollar, los temas, los métodos de enseñanza, los métodos y criterios de evaluación y la bibliografía.', 4),
('crit-est-2-2', 'sec-est-planificacion', '2.2', 'Desarrolla las clases de manera organizada y estructurada.', 5),
('crit-est-2-3', 'sec-est-planificacion', '2.3', 'Presenta en clase los contenidos, las competencias esperadas, la metodología de enseñanza y los criterios de evaluación de la unidad temática.', 6),

-- Dimensión 3: Metodología de Enseñanza
('crit-est-3-1', 'sec-est-metodologia', '3.1', 'Utiliza diversas estrategias y recursos de enseñanza particularmente las digitales para facilitar el aprendizaje.', 7),
('crit-est-3-2', 'sec-est-metodologia', '3.2', 'Adapta las actividades para atender a las diferentes formas de aprendizaje de los estudiantes alternando el uso de diferentes metodologías y recursos de enseñanza (pizarra, diapositivas, preguntas, etc.)', 8),
('crit-est-3-3', 'sec-est-metodologia', '3.3', 'Aplica actividades participativas que permiten la colaboración y trabajo conjunto entre los estudiantes.', 9),

-- Dimensión 4: Evaluación de Aprendizajes
('crit-est-4-1', 'sec-est-evaluacion', '4.1', 'Utiliza diferentes actividades para evaluar lo aprendido ofreciendo la retroalimentación correspondiente para reforzar aprendizajes.', 10),
('crit-est-4-2', 'sec-est-evaluacion', '4.2', 'Considera los resultados de la evaluación para realizar mejoras en el aprendizaje.', 11),
('crit-est-4-3', 'sec-est-evaluacion', '4.3', 'Da a conocer las calificaciones en los plazos establecidos.', 12),

-- Dimensión 5: Actitud Docente
('crit-est-5-1', 'sec-est-actitud', '5.1', 'Desarrolla la clase en un clima de respeto y entendimiento.', 13),
('crit-est-5-2', 'sec-est-actitud', '5.2', 'Asiste a clases regular y puntualmente.', 14),
('crit-est-5-3', 'sec-est-actitud', '5.3', 'Motiva a los estudiantes a participar en clase.', 15),
('crit-est-5-4', 'sec-est-actitud', '5.4', 'Estimula la curiosidad y deseo de aprender.', 16);

-- 5. Actualizar restricción única: Un estudiante evalúa a un docente una sola vez por materia en una gestión
ALTER TABLE sea_evaluacion_estudiante_registros 
    DROP CONSTRAINT IF EXISTS uq_eval_est_grupo;

ALTER TABLE sea_evaluacion_estudiante_registros 
    DROP CONSTRAINT IF EXISTS uq_eval_est_materia_docente;

ALTER TABLE sea_evaluacion_estudiante_registros 
    ADD CONSTRAINT uq_eval_est_materia_docente 
    UNIQUE (estudiante_codigo, materia_codigo, docente_nombre, gestion);
