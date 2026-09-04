-- El estado de generación debe sobrevivir a reinicios y ser visible para
-- cualquier instancia del backend que atienda la consulta del navegador.
CREATE TABLE sea_generaciones_typst (
  job_id VARCHAR(100) PRIMARY KEY,
  rol_examen_id VARCHAR(120) NOT NULL,
  estado VARCHAR(40) NOT NULL,
  mensaje TEXT,
  resultado_json JSONB,
  solicitado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generaciones_typst_rol_fecha
  ON sea_generaciones_typst (rol_examen_id, actualizado_en DESC);
