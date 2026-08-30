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
