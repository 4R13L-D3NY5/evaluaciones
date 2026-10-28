ALTER TABLE configuracion_evaluaciones
    ADD COLUMN IF NOT EXISTS validar_cuotas_grupos BOOLEAN NOT NULL DEFAULT TRUE;
