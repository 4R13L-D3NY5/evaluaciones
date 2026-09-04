ALTER TABLE sea_documentos_examen_sin_cartilla
  ADD COLUMN IF NOT EXISTS dek_envuelta TEXT,
  ADD COLUMN IF NOT EXISTS nonce VARCHAR(64),
  ADD COLUMN IF NOT EXISTS kek_referencia VARCHAR(255),
  ADD COLUMN IF NOT EXISTS kek_version VARCHAR(32),
  ADD COLUMN IF NOT EXISTS algoritmo_cifrado VARCHAR(80),
  ADD COLUMN IF NOT EXISTS archivo_cifrado BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN sea_documentos_examen_sin_cartilla.archivo_path IS
  'Ruta interna del ciphertext; nunca debe apuntar a un documento legible cuando archivo_cifrado=true';
COMMENT ON COLUMN sea_documentos_examen_sin_cartilla.hash_sha256 IS
  'Huella SHA-256 del contenido original para verificación posterior al descifrado';
