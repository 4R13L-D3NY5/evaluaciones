-- =============================================================================
-- SISTEMA DE EVALUACIONES (SEA / XPERTIFLOW) - BASE DE DATOS POSTGRESQL
-- Base de Datos: sea_evaluaciones
-- Arquitectura: Encriptación híbrida, 6 Tipologías, Algoritmo 7F/16M/7D, Mapeo OMR y Auditoría
-- =============================================================================

DROP TABLE IF EXISTS sea_auditoria_evaluaciones CASCADE;
DROP TABLE IF EXISTS sea_calificaciones_omr CASCADE;
DROP TABLE IF EXISTS sea_mapeo_estudiantes_variantes CASCADE;
DROP TABLE IF EXISTS sea_examenes_variantes CASCADE;
DROP TABLE IF EXISTS sea_reactivos CASCADE;
DROP TABLE IF EXISTS sea_bancos_preguntas CASCADE;
DROP TABLE IF EXISTS sea_roles_evaluaciones CASCADE;

-- =============================================================================
-- 1. TABLA: sea_roles_evaluaciones (Cronograma Oficial y Flujo de 9 Estados)
-- =============================================================================
CREATE TABLE sea_roles_evaluaciones (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  sea_group_id VARCHAR(64) NULL,
  sea_syllabus_course_id VARCHAR(64) NULL,
  sede_codigo VARCHAR(10) NOT NULL DEFAULT 'CBA',
  sede_nombre VARCHAR(100) NOT NULL DEFAULT 'Cochabamba',
  carrera_codigo VARCHAR(30) NOT NULL,
  carrera_nombre VARCHAR(150) NOT NULL,
  materia_codigo VARCHAR(30) NOT NULL,
  materia_nombre VARCHAR(150) NOT NULL,
  semestre SMALLINT NOT NULL DEFAULT 1,
  grupo VARCHAR(20) NOT NULL DEFAULT 'TA-01',
  tipo_clase VARCHAR(20) NOT NULL DEFAULT 'TA',
  docente_nombre VARCHAR(150) NOT NULL,
  docente_ci VARCHAR(30) NULL,
  tipo_parcial VARCHAR(30) NOT NULL DEFAULT '1er Parcial'
    CHECK (tipo_parcial IN ('1er Parcial', '2do Parcial', 'Final', '2da Instancia')),
  modalidad VARCHAR(30) NOT NULL DEFAULT 'PRESENCIAL_CARTILLA'
    CHECK (modalidad IN ('PRESENCIAL_CARTILLA', 'PRESENCIAL_SIN_CARTILLA', 'VIRTUAL')),
  con_cartilla BOOLEAN NOT NULL DEFAULT TRUE,
  estado_flujo VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADO'
    CHECK (estado_flujo IN ('PROGRAMADO', 'VALIDADO', 'GENERADO', 'IMPRESO', 'ENTREGADO', 'DEVUELTO', 'REVISADO', 'SUBIDO', 'RECIBIDO', 'SUSPENDIDO')),
  semana SMALLINT NOT NULL DEFAULT 1,
  dia VARCHAR(20) NOT NULL DEFAULT 'Sábado',
  fecha DATE NOT NULL,
  fecha_display VARCHAR(20) NOT NULL,
  horario VARCHAR(50) NOT NULL DEFAULT '08:15 - 09:45',
  aula VARCHAR(50) NOT NULL DEFAULT 'Aula 204',
  campus VARCHAR(100) NOT NULL DEFAULT 'Campus Colonial',
  estudiantes_inscritos_count INTEGER NOT NULL DEFAULT 0,
  variantes_generadas_count SMALLINT NOT NULL DEFAULT 0,
  hash_encriptacion VARCHAR(128) NULL,
  fecha_validacion TIMESTAMP NULL,
  fecha_generacion TIMESTAMP NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_sede_carrera ON sea_roles_evaluaciones (sede_codigo, carrera_codigo);
CREATE INDEX idx_roles_materia_grupo ON sea_roles_evaluaciones (materia_codigo, grupo);
CREATE INDEX idx_roles_estado ON sea_roles_evaluaciones (estado_flujo);

-- Trigger para actualizar actualizado_en automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_roles_evaluaciones_updated_at
BEFORE UPDATE ON sea_roles_evaluaciones
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. TABLA: sea_bancos_preguntas (Bancos de Preguntas Validados y Encriptados)
-- =============================================================================
CREATE TABLE sea_bancos_preguntas (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  rol_examen_id VARCHAR(64) NULL,
  materia_codigo VARCHAR(30) NOT NULL,
  materia_nombre VARCHAR(150) NOT NULL,
  grupo VARCHAR(20) NOT NULL DEFAULT 'TA-01',
  tipo_parcial VARCHAR(30) NOT NULL DEFAULT '1er Parcial',
  total_reactivos INTEGER NOT NULL DEFAULT 60,
  faciles_count INTEGER NOT NULL DEFAULT 15,
  medias_count INTEGER NOT NULL DEFAULT 30,
  dificiles_count INTEGER NOT NULL DEFAULT 15,
  nombre_archivo_excel VARCHAR(255) NOT NULL,
  hash_sha256_integridad VARCHAR(128) NOT NULL,
  paquete_json_encriptado TEXT NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'VALIDADO'
    CHECK (estado IN ('BORRADOR', 'VALIDADO', 'ENCRIPTADO')),
  docente_aprobador VARCHAR(150) NOT NULL,
  fecha_aprobacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_banco_rol_examen FOREIGN KEY (rol_examen_id)
    REFERENCES sea_roles_evaluaciones (id) ON DELETE SET NULL
);

CREATE INDEX idx_banco_materia ON sea_bancos_preguntas (materia_codigo, tipo_parcial, grupo);

CREATE TRIGGER trg_bancos_preguntas_updated_at
BEFORE UPDATE ON sea_bancos_preguntas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. TABLA: sea_reactivos (Detalle de Preguntas Individuales y 6 Tipologías)
-- =============================================================================
CREATE TABLE sea_reactivos (
  id SERIAL PRIMARY KEY,
  banco_id VARCHAR(64) NOT NULL,
  numero_orden INTEGER NOT NULL,
  tipo_reactivo VARCHAR(50) NOT NULL DEFAULT 'SELECCION_MEJOR_RESPUESTA'
    CHECK (tipo_reactivo IN ('SELECCION_MEJOR_RESPUESTA', 'VERDADERO_O_FALSO_SIMPLE', 'RESPUESTA_PREMISAS_ABCD', 'VERDADERO_O_FALSO_COMPLEJAS', 'SUBITEM_CASO', 'OPCION_EMPAREJAMIENTO')),
  dificultad VARCHAR(20) NOT NULL DEFAULT 'Medio'
    CHECK (dificultad IN ('Fácil', 'Medio', 'Difícil')),
  nivel_dificultad SMALLINT NOT NULL DEFAULT 2,
  grupo_contexto VARCHAR(100) NULL,
  enunciado TEXT NOT NULL,
  opciones_json TEXT NOT NULL,
  respuesta_correcta CHAR(1) NOT NULL DEFAULT 'A',
  peso_puntos DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reactivo_banco FOREIGN KEY (banco_id)
    REFERENCES sea_bancos_preguntas (id) ON DELETE CASCADE
);

CREATE INDEX idx_reactivo_dificultad ON sea_reactivos (banco_id, nivel_dificultad);
CREATE INDEX idx_reactivo_tipo ON sea_reactivos (tipo_reactivo);

-- =============================================================================
-- 4. TABLA: sea_examenes_variantes (Variantes Generadas A, B, C, D, E con 30 Reactivos)
-- =============================================================================
CREATE TABLE sea_examenes_variantes (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  rol_examen_id VARCHAR(64) NOT NULL,
  letra_variante CHAR(1) NOT NULL
    CHECK (letra_variante IN ('A', 'B', 'C', 'D', 'E')),
  nombre_variante VARCHAR(20) NOT NULL,
  semilla_permutacion INTEGER NOT NULL,
  total_preguntas SMALLINT NOT NULL DEFAULT 30,
  cuota_faciles SMALLINT NOT NULL DEFAULT 7,
  cuota_medias SMALLINT NOT NULL DEFAULT 16,
  cuota_dificiles SMALLINT NOT NULL DEFAULT 7,
  patron_claves_json TEXT NOT NULL,
  orden_reactivos_ids_json TEXT NOT NULL,
  archivo_typst_path VARCHAR(255) NULL,
  archivo_pdf_path VARCHAR(255) NULL,
  archivo_remark_xlsx_path VARCHAR(255) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_variante_rol_examen FOREIGN KEY (rol_examen_id)
    REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE,
  UNIQUE (rol_examen_id, letra_variante)
);

-- =============================================================================
-- 5. TABLA: sea_mapeo_estudiantes_variantes (Asignación Confidencial Estudiante <-> Examen)
-- =============================================================================
CREATE TABLE sea_mapeo_estudiantes_variantes (
  id BIGSERIAL PRIMARY KEY,
  rol_examen_id VARCHAR(64) NOT NULL,
  variante_id VARCHAR(64) NOT NULL,
  codigo_estudiante VARCHAR(30) NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(80) NOT NULL,
  apellido_materno VARCHAR(80) NOT NULL,
  letra_variante CHAR(1) NOT NULL
    CHECK (letra_variante IN ('A', 'B', 'C', 'D', 'E')),
  hash_control_seguridad VARCHAR(128) NOT NULL,
  cuadernillo_individual_pdf VARCHAR(255) NULL,
  estado_asistencia VARCHAR(20) NOT NULL DEFAULT 'PRESENTE'
    CHECK (estado_asistencia IN ('PRESENTE', 'AUSENTE', 'JUSTIFICADO')),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mapeo_rol_examen FOREIGN KEY (rol_examen_id)
    REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE,
  CONSTRAINT fk_mapeo_variante FOREIGN KEY (variante_id)
    REFERENCES sea_examenes_variantes (id) ON DELETE CASCADE,
  UNIQUE (rol_examen_id, codigo_estudiante)
);

CREATE INDEX idx_estudiante_cod ON sea_mapeo_estudiantes_variantes (codigo_estudiante);

-- =============================================================================
-- 6. TABLA: sea_calificaciones_omr (Resultados del Procesamiento Óptico OpenCV)
-- =============================================================================
CREATE TABLE sea_calificaciones_omr (
  id BIGSERIAL PRIMARY KEY,
  rol_examen_id VARCHAR(64) NOT NULL,
  codigo_estudiante VARCHAR(30) NOT NULL,
  estudiante_nombre_completo VARCHAR(200) NOT NULL,
  letra_variante CHAR(1) NOT NULL DEFAULT 'A'
    CHECK (letra_variante IN ('A', 'B', 'C', 'D', 'E')),
  total_reactivos SMALLINT NOT NULL DEFAULT 30,
  aciertos SMALLINT NOT NULL DEFAULT 0,
  fallos SMALLINT NOT NULL DEFAULT 0,
  blancos SMALLINT NOT NULL DEFAULT 0,
  dobles_marcas SMALLINT NOT NULL DEFAULT 0,
  nota_sobre_30 DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  nota_sobre_100 DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  estado_calificacion VARCHAR(30) NOT NULL DEFAULT 'APROBADO'
    CHECK (estado_calificacion IN ('APROBADO', 'REPROBADO', 'REVISION_MANUAL')),
  respuestas_detectadas_json TEXT NOT NULL,
  imagen_cartilla_anotada_path VARCHAR(255) NULL,
  procesado_por VARCHAR(50) NOT NULL DEFAULT 'OMR_VISION_ENGINE_V2',
  fecha_procesamiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_omr_rol_examen FOREIGN KEY (rol_examen_id)
    REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE
);

CREATE INDEX idx_omr_estudiante ON sea_calificaciones_omr (rol_examen_id, codigo_estudiante);

-- =============================================================================
-- 7. TABLA: sea_auditoria_evaluaciones (Bitácora de Seguridad e Inmutabilidad)
-- =============================================================================
CREATE TABLE sea_auditoria_evaluaciones (
  id BIGSERIAL PRIMARY KEY,
  rol_examen_id VARCHAR(64) NOT NULL,
  etapa_origen VARCHAR(30) NOT NULL,
  etapa_destino VARCHAR(30) NOT NULL,
  accion VARCHAR(100) NOT NULL,
  usuario VARCHAR(100) NOT NULL DEFAULT 'ADMIN_EVALUACIONES',
  ip_origen VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  detalles_json TEXT NULL,
  fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auditoria_rol_examen FOREIGN KEY (rol_examen_id)
    REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE
);

CREATE INDEX idx_auditoria_rol ON sea_auditoria_evaluaciones (rol_examen_id);

-- =============================================================================
-- SEED DATA OFICIAL DE PRUEBA (CPEC18 Auditoría Tributaria + SIS-211 Inglés Técnico II)
-- =============================================================================

INSERT INTO sea_roles_evaluaciones (
  id, sea_group_id, sea_syllabus_course_id, sede_codigo, sede_nombre,
  carrera_codigo, carrera_nombre, materia_codigo, materia_nombre, semestre,
  grupo, tipo_clase, docente_nombre, docente_ci, tipo_parcial,
  modalidad, con_cartilla, estado_flujo, semana, dia,
  fecha, fecha_display, horario, aula, campus,
  estudiantes_inscritos_count, variantes_generadas_count, hash_encriptacion, fecha_validacion
) VALUES
(
  'ROL-CPEC18-TA01-1P', 'grp-cpec18-ta01', 'syl-cpec18', 'CBA', 'Cochabamba',
  'CONT-COMPL', 'Auditoría / Contaduría Pública', 'CPEC18', 'AUDITORÍA TRIBUTARIA', 3,
  'TA-01', 'TA', 'MAURICIO QUIROZ LAFUENTE', '4529102', '1er Parcial',
  'PRESENCIAL_CARTILLA', TRUE, 'GENERADO', 1, 'Sábado',
  '2026-08-22', '22/08/2026', '08:15 - 09:45', 'Aula 204', 'Campus Colonial',
  3, 3, 'SHA256-CPEC18-ENC-984920', '2026-08-22 08:00:00'
),
(
  'ROL-SIS211-TA01-1P', 'grp-sis211-ta01', 'syl-sis211', 'CBA', 'Cochabamba',
  'SIS-PLAN2023', 'Ingeniería de Sistemas', 'SIS-211', 'INGLÉS TÉCNICO II', 2,
  'TA-01', 'TA', 'LIC. PATRICIA VARGAS', '5829103', '1er Parcial',
  'PRESENCIAL_CARTILLA', TRUE, 'GENERADO', 1, 'Sábado',
  '2026-08-22', '22/08/2026', '10:00 - 11:30', 'Laboratorio 3', 'Campus Colonial',
  3, 3, 'SHA256-SIS211-ENC-748291', '2026-08-22 08:30:00'
),
(
  'ROL-SIS413-TA01-1P', 'grp-sis413-ta01', 'syl-sis413', 'CBA', 'Cochabamba',
  'SIS-PLAN2023', 'Ingeniería de Sistemas', 'SIS-413', 'TELECOMUNICACIONES', 4,
  'TA-01', 'TA', 'ING. JORGE CLAROS', '6192830', '1er Parcial',
  'PRESENCIAL_CARTILLA', TRUE, 'PROGRAMADO', 1, 'Sábado',
  '2026-08-22', '22/08/2026', '11:45 - 13:15', 'Aula 102', 'Campus Colonial',
  3, 0, NULL, NULL
);

-- Variantes A, B, C de CPEC18
INSERT INTO sea_examenes_variantes (
  id, rol_examen_id, letra_variante, nombre_variante, semilla_permutacion,
  total_preguntas, cuota_faciles, cuota_medias, cuota_dificiles,
  patron_claves_json, orden_reactivos_ids_json, archivo_pdf_path
) VALUES
(
  'VAR-CPEC18-A', 'ROL-CPEC18-TA01-1P', 'A', 'TIPO A', 100,
  30, 7, 16, 7,
  '{"1":"A","2":"E","3":"D","4":"B","5":"A","6":"A","7":"A","8":"A","9":"A","10":"B","11":"C","12":"A","13":"D","14":"C","15":"C","16":"C","17":"A","18":"C","19":"C","20":"D","21":"A","22":"B","23":"E","24":"A","25":"E","26":"A","27":"C","28":"A","29":"B","30":"E"}'::jsonb,
  '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]'::jsonb,
  'assets/examenes/CPEC18_Cochabamba_TA-01_1erParcial_VarA_20260822_Examen.pdf'
),
(
  'VAR-CPEC18-B', 'ROL-CPEC18-TA01-1P', 'B', 'TIPO B', 153,
  30, 7, 16, 7,
  '{"1":"B","2":"A","3":"C","4":"D","5":"E","6":"B","7":"A","8":"B","9":"A","10":"A","11":"B","12":"C","13":"A","14":"D","15":"A","16":"B","17":"E","18":"A","19":"B","20":"C","21":"D","22":"A","23":"C","24":"B","25":"D","26":"C","27":"A","28":"E","29":"A","30":"C"}'::jsonb,
  '[15,8,3,1,12,5,7,9,20,11,18,13,14,2,6,17,16,19,10,4,22,21,25,24,23,28,27,26,30,29]'::jsonb,
  'assets/examenes/CPEC18_Cochabamba_TA-01_1erParcial_VarB_20260822_Examen.pdf'
),
(
  'VAR-CPEC18-C', 'ROL-CPEC18-TA01-1P', 'C', 'TIPO C', 206,
  30, 7, 16, 7,
  '{"1":"C","2":"D","3":"A","4":"B","5":"E","6":"C","7":"D","8":"A","9":"B","10":"C","11":"A","12":"B","13":"C","14":"E","15":"B","16":"A","17":"C","18":"D","19":"A","20":"E","21":"B","22":"C","23":"A","24":"E","25":"B","26":"A","27":"D","28":"B","29":"C","30":"A"}'::jsonb,
  '[4,9,11,2,7,1,14,13,10,8,6,15,5,12,3,19,20,17,18,16,23,24,21,22,25,27,29,26,28,30]'::jsonb,
  'assets/examenes/CPEC18_Cochabamba_TA-01_1erParcial_VarC_20260822_Examen.pdf'
);

-- Mapeo Estudiantes <-> Variantes Oficiales
INSERT INTO sea_mapeo_estudiantes_variantes (
  rol_examen_id, variante_id, codigo_estudiante, nombres,
  apellido_paterno, apellido_materno, letra_variante, hash_control_seguridad,
  cuadernillo_individual_pdf
) VALUES
('ROL-CPEC18-TA01-1P', 'VAR-CPEC18-A', '7849102', 'JUAN CARLOS', 'PEREZ', 'MAMANI', 'A', 'CTL-9102-CPEC18-A', 'assets/examenes/CPEC18_7849102_JUAN_CARLOS_PEREZ_MAMANI_Examen.pdf'),
('ROL-CPEC18-TA01-1P', 'VAR-CPEC18-B', '8392104', 'MARIA BELEN', 'QUISPE', 'FLORES', 'B', 'CTL-2104-CPEC18-B', 'assets/examenes/CPEC18_8392104_MARIA_BELEN_QUISPE_FLORES_Examen.pdf'),
('ROL-CPEC18-TA01-1P', 'VAR-CPEC18-C', '6928103', 'RODRIGO ALEJANDRO', 'CONDORI', 'RODRIGUEZ', 'C', 'CTL-8103-CPEC18-C', 'assets/examenes/CPEC18_6928103_RODRIGO_ALEJANDRO_CONDORI_RODRIGUEZ_Examen.pdf');

-- Calificaciones OMR Procesadas
INSERT INTO sea_calificaciones_omr (
  rol_examen_id, codigo_estudiante, estudiante_nombre_completo,
  letra_variante, total_reactivos, aciertos, fallos, blancos, dobles_marcas,
  nota_sobre_30, nota_sobre_100, estado_calificacion, respuestas_detectadas_json
) VALUES
('ROL-CPEC18-TA01-1P', '7849102', 'JUAN CARLOS PEREZ MAMANI', 'A', 30, 28, 2, 0, 0, 28.00, 93.33, 'APROBADO', '{"1":"A","2":"E","3":"D","4":"B","5":"A","6":"A","7":"A","8":"A","9":"A","10":"B","11":"C","12":"A","13":"D","14":"C","15":"C","16":"C","17":"A","18":"C","19":"C","20":"D","21":"A","22":"B","23":"E","24":"A","25":"E","26":"A","27":"C","28":"A","29":"B","30":"E"}'::jsonb),
('ROL-CPEC18-TA01-1P', '8392104', 'MARIA BELEN QUISPE FLORES', 'B', 30, 24, 6, 0, 0, 24.00, 80.00, 'APROBADO', '{"1":"B","2":"A","3":"C","4":"D","5":"E","6":"B","7":"A","8":"B","9":"A","10":"A","11":"B","12":"C","13":"A","14":"D","15":"A","16":"B","17":"E","18":"A","19":"B","20":"C","21":"D","22":"A","23":"C","24":"B","25":"D","26":"C","27":"A","28":"E","29":"A","30":"C"}'::jsonb),
('ROL-CPEC18-TA01-1P', '6928103', 'RODRIGO ALEJANDRO CONDORI RODRIGUEZ', 'C', 30, 18, 12, 0, 0, 18.00, 60.00, 'APROBADO', '{"1":"C","2":"D","3":"A","4":"B","5":"E","6":"C","7":"D","8":"A","9":"B","10":"C","11":"A","12":"B","13":"C","14":"E","15":"B","16":"A","17":"C","18":"D","19":"A","20":"E","21":"B","22":"C","23":"A","24":"E","25":"B","26":"A","27":"D","28":"B","29":"C","30":"A"}'::jsonb);

-- Auditoría inicial
INSERT INTO sea_auditoria_evaluaciones (
  rol_examen_id, etapa_origen, etapa_destino, accion, usuario, detalles_json
) VALUES
('ROL-CPEC18-TA01-1P', 'PROGRAMADO', 'VALIDADO', 'VALIDACION_BANCO_60_REACTIVOS', 'MAURICIO QUIROZ LAFUENTE', '{"banco_preguntas":"BANCO_CPEC18_FINAL_2026.xlsx", "total_reactivos": 60}'::jsonb),
('ROL-CPEC18-TA01-1P', 'VALIDADO', 'GENERADO', 'COMPILACION_TYPST_30_REACTIVOS', 'ADMIN_EVALUACIONES', '{"variantes": 3, "distribucion": "7F_16M_7D", "motor": "Typst v0.15"}'::jsonb);
