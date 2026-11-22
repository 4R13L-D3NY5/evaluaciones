-- =============================================================================
-- V74: Evaluación Docente - Ficha Oficial de Asignatura, Observaciones de Terceros y Firmas
-- =============================================================================

-- 1. Campo de retroalimentación en registros de evaluación del director
ALTER TABLE sea_evaluacion_docente_registros
    ADD COLUMN IF NOT EXISTS retroalimentacion TEXT NULL;

COMMENT ON COLUMN sea_evaluacion_docente_registros.retroalimentacion IS
'Recomendaciones y retroalimentación pedagógica completadas por el Director de Carrera para el docente.';

-- 2. Campos en usuarios del sistema para permisos de observación y títulos de firma
ALTER TABLE sea_usuarios_sistema
    ADD COLUMN IF NOT EXISTS puede_observar_evaluacion_docente BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS titulo_firma_evaluacion_docente VARCHAR(150) NULL,
    ADD COLUMN IF NOT EXISTS orden_firma_evaluacion_docente INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN sea_usuarios_sistema.puede_observar_evaluacion_docente IS
'Indica si el usuario (Vicerrector o autoridad) puede registrar observaciones por asignatura en la Ficha Oficial.';

COMMENT ON COLUMN sea_usuarios_sistema.titulo_firma_evaluacion_docente IS
'Cargo o denominación oficial para el pie de firma en la Ficha Oficial (ej. Director Académico, Dirección Institucional, Jefe de Talento Humano).';

COMMENT ON COLUMN sea_usuarios_sistema.orden_firma_evaluacion_docente IS
'Orden secuencial de aparición en el bloque de firmas de la Ficha Oficial y PDF.';

-- 3. Tabla para observaciones de terceros por materia/docente
CREATE TABLE IF NOT EXISTS sea_evaluacion_docente_observacion_tercero (
    id BIGSERIAL PRIMARY KEY,
    gestion VARCHAR(30) NOT NULL,
    sede_codigo VARCHAR(30) NOT NULL,
    carrera_codigo VARCHAR(50) NOT NULL,
    materia_codigo VARCHAR(50) NOT NULL,
    materia_nombre VARCHAR(150) NOT NULL,
    grupo_codigo VARCHAR(100) NOT NULL DEFAULT '',
    docente_ci VARCHAR(30) NOT NULL,
    docente_nombre VARCHAR(150) NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES sea_usuarios_sistema(id),
    usuario_nombre VARCHAR(150) NOT NULL,
    usuario_rol VARCHAR(50) NOT NULL,
    titulo_firma VARCHAR(150) NOT NULL,
    observacion TEXT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_obs_tercero_materia_docente_usuario 
        UNIQUE (gestion, sede_codigo, carrera_codigo, materia_codigo, docente_ci, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_obs_tercero_busqueda 
    ON sea_evaluacion_docente_observacion_tercero (gestion, sede_codigo, carrera_codigo, materia_codigo, docente_ci);

-- 4. Valores iniciales de títulos para Talento Humano y Vicerrectores
UPDATE sea_usuarios_sistema
SET titulo_firma_evaluacion_docente = 'Jefe de Talento Humano',
    orden_firma_evaluacion_docente = 99
WHERE rol_codigo = 'TALENTO_HUMANO'
  AND (titulo_firma_evaluacion_docente IS NULL OR titulo_firma_evaluacion_docente = '');

UPDATE sea_usuarios_sistema
SET titulo_firma_evaluacion_docente = 'Dirección Académica',
    puede_observar_evaluacion_docente = TRUE,
    orden_firma_evaluacion_docente = 10
WHERE rol_codigo = 'VICERRECTOR'
  AND (titulo_firma_evaluacion_docente IS NULL OR titulo_firma_evaluacion_docente = '');
