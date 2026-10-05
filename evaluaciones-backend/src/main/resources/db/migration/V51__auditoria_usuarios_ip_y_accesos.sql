-- =========================================================================
-- V51: Auditoría de usuarios, captación de IP de origen e índices de trazabilidad
-- =========================================================================

ALTER TABLE sea_auditoria_usuarios ADD COLUMN IF NOT EXISTS ip_origen VARCHAR(45);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuarios_ip ON sea_auditoria_usuarios(ip_origen);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuarios_fecha ON sea_auditoria_usuarios(fecha_evento);
