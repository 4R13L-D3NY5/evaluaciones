CREATE TABLE IF NOT EXISTS sea_configuracion_omr (
  id SMALLINT PRIMARY KEY,
  umbral_densidad_marca DECIMAL(5,2) NOT NULL DEFAULT 70.00 CHECK (umbral_densidad_marca BETWEEN 40 AND 95),
  umbral_diferencial_doble DECIMAL(5,2) NOT NULL DEFAULT 18.00 CHECK (umbral_diferencial_doble BETWEEN 1 AND 50),
  umbral_binario_grilla SMALLINT NOT NULL DEFAULT 185 CHECK (umbral_binario_grilla BETWEEN 80 AND 240),
  nivel_tinta_marca SMALLINT NOT NULL DEFAULT 145 CHECK (nivel_tinta_marca BETWEEN 40 AND 220),
  zona_codigo_x DECIMAL(6,4) NOT NULL DEFAULT 0.5300 CHECK (zona_codigo_x BETWEEN 0 AND 1),
  zona_codigo_y DECIMAL(6,4) NOT NULL DEFAULT 0.0900 CHECK (zona_codigo_y BETWEEN 0 AND 1),
  zona_codigo_ancho DECIMAL(6,4) NOT NULL DEFAULT 0.2200 CHECK (zona_codigo_ancho BETWEEN 0.01 AND 1),
  zona_codigo_alto DECIMAL(6,4) NOT NULL DEFAULT 0.0500 CHECK (zona_codigo_alto BETWEEN 0.01 AND 1),
  escala_ocr DECIMAL(4,2) NOT NULL DEFAULT 2.50 CHECK (escala_ocr BETWEEN 1 AND 5),
  radio_busqueda_pixeles SMALLINT NOT NULL DEFAULT 2 CHECK (radio_busqueda_pixeles BETWEEN 0 AND 5),
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_por VARCHAR(100) NOT NULL DEFAULT 'ADMIN_EVALUACIONES'
);

INSERT INTO sea_configuracion_omr (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
