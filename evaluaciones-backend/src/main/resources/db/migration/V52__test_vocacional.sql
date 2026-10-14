CREATE TABLE IF NOT EXISTS sea_test_vocacional (
    id BIGSERIAL PRIMARY KEY,
    lote_id VARCHAR(100) NOT NULL,
    colegio VARCHAR(250) NOT NULL,
    curso VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    nombre_completo VARCHAR(250) NULL,
    celular VARCHAR(50) NULL,
    correo VARCHAR(150) NULL,
    candidatos_nombre_json TEXT NULL DEFAULT '[]',
    candidatos_celular_json TEXT NULL DEFAULT '[]',
    candidatos_correo_json TEXT NULL DEFAULT '[]',
    numeros_marcados_json TEXT NOT NULL DEFAULT '[]',
    total_marcados INT NOT NULL DEFAULT 0,
    archivo_nombre VARCHAR(255) NULL,
    archivo_escaneado_path TEXT NULL,
    imagen_preview_path TEXT NULL,
    pagina_numero INT NOT NULL DEFAULT 1,
    estado VARCHAR(50) NOT NULL DEFAULT 'PROCESADO',
    observaciones TEXT NULL,
    creado_por VARCHAR(100) NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_vocacional_lote ON sea_test_vocacional (lote_id);
CREATE INDEX IF NOT EXISTS idx_test_vocacional_colegio ON sea_test_vocacional (colegio);
CREATE INDEX IF NOT EXISTS idx_test_vocacional_fecha ON sea_test_vocacional (fecha);
