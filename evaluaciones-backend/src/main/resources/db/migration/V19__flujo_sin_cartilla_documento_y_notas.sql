CREATE TABLE sea_documentos_examen_sin_cartilla (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  rol_examen_id VARCHAR(64) NOT NULL UNIQUE,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_archivo VARCHAR(120) NOT NULL,
  tamano_bytes BIGINT NOT NULL,
  hash_sha256 VARCHAR(128) NOT NULL,
  archivo_path VARCHAR(500) NOT NULL,
  cargado_por VARCHAR(100) NOT NULL,
  cargado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documento_sin_cartilla_rol FOREIGN KEY (rol_examen_id)
    REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE
);

CREATE INDEX idx_documento_sin_cartilla_rol ON sea_documentos_examen_sin_cartilla (rol_examen_id);

CREATE TABLE sea_notas_docentes (
  id BIGSERIAL PRIMARY KEY,
  rol_examen_id VARCHAR(64) NOT NULL,
  codigo_estudiante VARCHAR(30) NOT NULL,
  estudiante_nombre_completo VARCHAR(200) NOT NULL,
  nota_sobre_30 NUMERIC(5,2) NOT NULL CHECK (nota_sobre_30 >= 0 AND nota_sobre_30 <= 30),
  nota_sobre_100 NUMERIC(5,2) NOT NULL CHECK (nota_sobre_100 >= 0 AND nota_sobre_100 <= 100),
  guardado_por VARCHAR(100) NOT NULL,
  guardado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_nota_docente_rol FOREIGN KEY (rol_examen_id)
    REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE,
  CONSTRAINT uq_nota_docente_estudiante UNIQUE (rol_examen_id, codigo_estudiante)
);

CREATE INDEX idx_notas_docentes_rol ON sea_notas_docentes (rol_examen_id, codigo_estudiante);
