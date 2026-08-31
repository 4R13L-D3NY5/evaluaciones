CREATE TABLE IF NOT EXISTS sea_configuracion_evaluaciones (
  id SMALLINT PRIMARY KEY,
  ratio_estudiantes_por_variante INTEGER NOT NULL DEFAULT 5
    CHECK (ratio_estudiantes_por_variante BETWEEN 1 AND 30),
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_por VARCHAR(100) NOT NULL DEFAULT 'ADMIN_EVALUACIONES'
);

INSERT INTO sea_configuracion_evaluaciones (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
