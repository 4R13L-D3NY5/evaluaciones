-- =============================================================================
-- V65: Habilitación de Edición de Roles de Examen para Vicerrectorado
-- =============================================================================

ALTER TABLE sea_usuarios_sistema 
ADD COLUMN IF NOT EXISTS puede_editar_roles_examen BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN sea_usuarios_sistema.puede_editar_roles_examen IS 
'Indica si un usuario con rol VICERRECTOR está expresamente autorizado a crear, editar o eliminar roles de examen en sus sedes.';
