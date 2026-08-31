ALTER TABLE sea_configuracion_evaluaciones
  ADD COLUMN IF NOT EXISTS duracion_examen_virtual_minutos INTEGER NOT NULL DEFAULT 45
    CHECK (duracion_examen_virtual_minutos BETWEEN 1 AND 480);

ALTER TABLE sea_salas_examen_virtual
  ALTER COLUMN duracion_minutos SET DEFAULT 45;
