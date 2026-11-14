-- V66__solicitudes_modificacion_roles_examen.sql
-- Sistema formal de solicitud y aprobacion de modificaciones de roles de examen

CREATE TABLE IF NOT EXISTS sea_solicitudes_modificacion_rol (
    id VARCHAR(36) PRIMARY KEY,
    rol_examen_id VARCHAR(64) NOT NULL,
    
    -- Solicitante (Director de Carrera / Administrador)
    solicitante_id BIGINT NOT NULL,
    solicitante_usuario VARCHAR(100) NOT NULL,
    solicitante_nombre VARCHAR(200) NOT NULL,
    solicitante_rol VARCHAR(50) NOT NULL,
    
    -- Contexto academico del examen
    sede_codigo VARCHAR(20) NOT NULL,
    carrera_codigo VARCHAR(50) NOT NULL,
    materia_codigo VARCHAR(50) NOT NULL,
    materia_nombre VARCHAR(255) NOT NULL,
    grupo VARCHAR(20) NOT NULL,
    tipo_parcial VARCHAR(30),
    
    -- Snapshot original del examen al momento de la solicitud
    fecha_original DATE NOT NULL,
    horario_original VARCHAR(50) NOT NULL,
    modalidad_original VARCHAR(50) NOT NULL,
    
    -- Parametros solicitados
    fecha_propuesta DATE NOT NULL,
    horario_propuesto VARCHAR(50) NOT NULL,
    modalidad_propuesta VARCHAR(50) NOT NULL,
    motivo TEXT NOT NULL,
    
    -- Resolucion por Vicerrectorado
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    resolutor_id BIGINT,
    resolutor_usuario VARCHAR(100),
    resolutor_nombre VARCHAR(200),
    observacion_resolucion TEXT,
    fecha_resolucion TIMESTAMP,
    
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_solicitud_rol_examen 
        FOREIGN KEY (rol_examen_id) REFERENCES sea_roles_evaluaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_solicitud_solicitante 
        FOREIGN KEY (solicitante_id) REFERENCES sea_usuarios_sistema(id),
    CONSTRAINT fk_solicitud_resolutor 
        FOREIGN KEY (resolutor_id) REFERENCES sea_usuarios_sistema(id),
    CONSTRAINT chk_solicitud_estado 
        CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA'))
);

-- Garantiza que solo exista una solicitud PENDIENTE activa por rol de examen
CREATE UNIQUE INDEX IF NOT EXISTS uq_solicitud_pendiente_rol 
ON sea_solicitudes_modificacion_rol (rol_examen_id) 
WHERE estado = 'PENDIENTE';

CREATE INDEX IF NOT EXISTS idx_solicitud_sede_estado 
ON sea_solicitudes_modificacion_rol (sede_codigo, estado);

CREATE INDEX IF NOT EXISTS idx_solicitud_solicitante 
ON sea_solicitudes_modificacion_rol (solicitante_id, estado);
