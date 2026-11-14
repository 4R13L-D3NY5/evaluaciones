-- =============================================================================
-- V67: Permiso de Aprobación de Modificaciones de Roles para Vicerrectorado
-- =============================================================================

ALTER TABLE sea_usuarios_sistema 
ADD COLUMN IF NOT EXISTS puede_aprobar_solicitudes_rol BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN sea_usuarios_sistema.puede_aprobar_solicitudes_rol IS 
'Indica si un usuario con rol VICERRECTOR está expresamente autorizado a aprobar o rechazar solicitudes de modificación de exámenes en sus sedes.';
