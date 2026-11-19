-- V72: Evaluación Docente - Ratificación por Materia, Cierre Institucional de Período y Permisos

-- 1. Rol TALENTO_HUMANO
INSERT INTO sea_roles_sistema (codigo, nombre, descripcion, activo, es_rol_negocio)
VALUES (
    'TALENTO_HUMANO',
    'Talento Humano',
    'Consulta de reportes de evaluación docente y gestión de ratificaciones por materia',
    TRUE,
    TRUE
)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion;

-- 2. Permiso configurable en sea_usuarios_sistema para Vicerrectores y personal autorizado
ALTER TABLE sea_usuarios_sistema
    ADD COLUMN IF NOT EXISTS puede_modificar_ratificacion_docente BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN sea_usuarios_sistema.puede_modificar_ratificacion_docente IS 
'Indica si el usuario (Vicerrector o personal asignado) tiene permiso para ratificar o desratificar manualmente docentes en una materia.';

-- 3. Flag de período de evaluación docente en la configuración institucional
ALTER TABLE sea_configuracion_evaluaciones
    ADD COLUMN IF NOT EXISTS periodo_evaluacion_docente_abierto BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN sea_configuracion_evaluaciones.periodo_evaluacion_docente_abierto IS 
'Determina si el período de evaluación docente está activo. Si es FALSE, no se permiten nuevas evaluaciones de directores ni estudiantes.';

-- 4. Tabla de persistencia de Ratificación Docente por Materia
CREATE TABLE IF NOT EXISTS sea_docente_ratificacion (
    id BIGSERIAL PRIMARY KEY,
    gestion VARCHAR(30) NOT NULL,
    sede_codigo VARCHAR(30) NOT NULL,
    carrera_codigo VARCHAR(50) NOT NULL,
    materia_codigo VARCHAR(50) NOT NULL,
    materia_nombre VARCHAR(150) NOT NULL,
    grupo_codigo VARCHAR(100) NOT NULL,
    docente_ci VARCHAR(30) NOT NULL,
    docente_nombre VARCHAR(150) NOT NULL,
    
    -- Calificaciones oficiales
    nota_director NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    nota_estudiantes NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    nota_final NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    
    -- Estados: 'RATIFICADO', 'NO_RATIFICADO'
    estado_calculado VARCHAR(30) NOT NULL,
    estado_definitivo VARCHAR(30) NOT NULL,
    
    -- Auditoría de override manual
    es_modificado_manualmente BOOLEAN NOT NULL DEFAULT FALSE,
    modificado_por_usuario VARCHAR(100) NULL,
    modificado_por_nombre VARCHAR(150) NULL,
    motivo_modificacion TEXT NULL,
    fecha_modificacion TIMESTAMP NULL,
    
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_docente_materia_ratificacion 
        UNIQUE (gestion, sede_codigo, carrera_codigo, materia_codigo, docente_ci)
);

CREATE INDEX IF NOT EXISTS idx_docente_ratif_busqueda 
    ON sea_docente_ratificacion (gestion, sede_codigo, carrera_codigo);

-- 5. Usuario inicial para Lic. Brayan Cabeño
INSERT INTO sea_usuarios_sistema (
    usuario,
    correo,
    contrasena_hash,
    nombre_completo,
    rol_codigo,
    sedes_asignadas,
    debe_cambiar_contrasena,
    puede_modificar_ratificacion_docente,
    activo
)
VALUES (
    'brayan.cabeno',
    'brayan.cabeno@unitepc.edu.bo',
    '$2a$10$0RpF5qLCWhLt7mR5lKEj.ggKwDcCy.v2FuL1BpCbpRQT4s1KXrOS',
    'Lic. Brayan Cabeño',
    'TALENTO_HUMANO',
    '',
    TRUE,
    TRUE,
    TRUE
)
ON CONFLICT (usuario) DO NOTHING;
