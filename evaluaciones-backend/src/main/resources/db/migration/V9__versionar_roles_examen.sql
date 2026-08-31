ALTER TABLE sea_roles_evaluaciones
    ADD COLUMN IF NOT EXISTS version SMALLINT NOT NULL DEFAULT 1;

UPDATE sea_roles_evaluaciones
SET version = 1
WHERE version IS NULL OR version < 1;

CREATE INDEX IF NOT EXISTS idx_roles_version_grupo_parcial
    ON sea_roles_evaluaciones (sea_group_id, tipo_parcial, version DESC);
