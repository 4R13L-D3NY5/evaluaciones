CREATE TABLE IF NOT EXISTS sea_campus_carreras (
  id BIGSERIAL PRIMARY KEY,
  sede_codigo VARCHAR(30) NOT NULL,
  campus_clave VARCHAR(220) NOT NULL,
  campus_id VARCHAR(100) NOT NULL DEFAULT '',
  campus_codigo VARCHAR(100) NOT NULL DEFAULT '',
  campus_nombre VARCHAR(180) NOT NULL,
  carrera_codigo VARCHAR(30) NOT NULL,
  carrera_nombre VARCHAR(180) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_campus_carrera_asignada UNIQUE (sede_codigo, campus_clave, carrera_codigo)
);

CREATE INDEX IF NOT EXISTS idx_campus_carreras_clave
  ON sea_campus_carreras (sede_codigo, campus_clave, activo);
