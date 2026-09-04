ALTER TABLE sea_reactivos
    ADD COLUMN IF NOT EXISTS imagen_base64 TEXT NULL;

COMMENT ON COLUMN sea_reactivos.imagen_base64 IS
    'Imagen opcional del reactivo en data URI Base64; se muestra en el examen virtual.';
