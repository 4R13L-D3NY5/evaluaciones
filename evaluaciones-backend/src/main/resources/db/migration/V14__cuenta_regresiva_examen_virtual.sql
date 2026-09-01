ALTER TABLE sea_configuracion_evaluaciones
  ADD COLUMN IF NOT EXISTS cuenta_regresiva_inicio_virtual_segundos INTEGER NOT NULL DEFAULT 15
    CHECK (cuenta_regresiva_inicio_virtual_segundos BETWEEN 0 AND 120);
