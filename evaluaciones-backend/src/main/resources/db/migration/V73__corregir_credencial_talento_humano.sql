-- Corrige la credencial inicial de Talento Humano sembrada en V72
-- La contraseña temporal es: Admin123!
UPDATE sea_usuarios_sistema
SET contrasena_hash = '$2b$10$12.T6UBBsjfnyHGROn1gxezZT2ry.I8lErot15um079y2DJGUiwO2',
    actualizado_en = CURRENT_TIMESTAMP
WHERE usuario = 'brayan.cabeno';
