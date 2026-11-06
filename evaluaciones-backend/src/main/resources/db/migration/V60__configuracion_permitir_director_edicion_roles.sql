ALTER TABLE sea_configuracion_evaluaciones
    ADD COLUMN IF NOT EXISTS permitir_director_edicion_roles BOOLEAN NOT NULL DEFAULT TRUE;
