ALTER TABLE sea_configuracion_evaluaciones
  ADD COLUMN IF NOT EXISTS formato_hoja VARCHAR(100) NOT NULL DEFAULT 'Oficio (Folio UNITEPC)',
  ADD COLUMN IF NOT EXISTS tipo_letra VARCHAR(100) NOT NULL DEFAULT 'Times New Roman',
  ADD COLUMN IF NOT EXISTS tamano_letra_pt INTEGER NOT NULL DEFAULT 11
    CHECK (tamano_letra_pt BETWEEN 8 AND 18),
  ADD COLUMN IF NOT EXISTS espaciado_leading VARCHAR(100) NOT NULL DEFAULT '0.8em (línea) · 1.2em (pregunta)';
