ALTER TABLE sea_roles_evaluaciones
    ADD COLUMN IF NOT EXISTS snapshot_entrega_estudiantes_json TEXT;
