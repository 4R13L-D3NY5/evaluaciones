ALTER TABLE sea_roles_evaluaciones
    ADD COLUMN IF NOT EXISTS conciliacion_devolucion_json TEXT;
