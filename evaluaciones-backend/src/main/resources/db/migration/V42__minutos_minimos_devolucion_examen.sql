ALTER TABLE sea_configuracion_evaluaciones
  ADD COLUMN IF NOT EXISTS minutos_minimos_devolucion INTEGER NOT NULL DEFAULT 45 CHECK (minutos_minimos_devolucion BETWEEN 0 AND 1440);
