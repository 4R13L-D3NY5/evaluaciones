-- Corrige la credencial inicial de desarrollo creada en V7.
-- La contraseña temporal es: Admin123!
UPDATE sea_usuarios_sistema
SET contrasena_hash = '$2b$10$EwO9sO0iFscG.tV8DK98k.hy8H1hwZaV3ZyAvYRtO7NNV868YnXBS',
    actualizado_en = CURRENT_TIMESTAMP
WHERE usuario = 'admin';
