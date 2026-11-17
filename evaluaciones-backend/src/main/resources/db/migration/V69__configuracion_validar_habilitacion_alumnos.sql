ALTER TABLE sea_configuracion_evaluaciones
    ADD COLUMN IF NOT EXISTS validar_habilitacion_alumnos BOOLEAN NOT NULL DEFAULT TRUE;
