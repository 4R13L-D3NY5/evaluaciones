CREATE TABLE sea_lotes_cartillas_omr (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  rol_examen_id VARCHAR(64) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'GENERADO'
    CHECK (estado IN ('GENERADO', 'IMPRESO', 'ANULADO')),
  total_cartillas INTEGER NOT NULL,
  archivo_pdf_path VARCHAR(255) NOT NULL,
  generado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  impreso_en TIMESTAMP NULL,
  usuario_impresion VARCHAR(100) NULL,
  CONSTRAINT fk_lote_cartilla_rol FOREIGN KEY (rol_examen_id)
    REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE
);

CREATE TABLE sea_cartillas_omr (
  id BIGSERIAL PRIMARY KEY,
  lote_id VARCHAR(64) NOT NULL,
  rol_examen_id VARCHAR(64) NOT NULL,
  numero_orden INTEGER NOT NULL,
  codigo_materia VARCHAR(30) NOT NULL,
  grupo VARCHAR(20) NOT NULL,
  codigo_estudiante VARCHAR(30) NOT NULL,
  nombre_completo VARCHAR(220) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'GENERADA'
    CHECK (estado IN ('GENERADA', 'IMPRESA', 'ANULADA')),
  impresa_en TIMESTAMP NULL,
  CONSTRAINT fk_cartilla_lote FOREIGN KEY (lote_id)
    REFERENCES sea_lotes_cartillas_omr (id) ON DELETE CASCADE,
  CONSTRAINT fk_cartilla_rol FOREIGN KEY (rol_examen_id)
    REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE,
  CONSTRAINT uq_cartilla_lote_estudiante UNIQUE (lote_id, codigo_estudiante)
);

CREATE INDEX idx_lotes_cartillas_rol ON sea_lotes_cartillas_omr (rol_examen_id, generado_en DESC);
CREATE INDEX idx_cartillas_rol_estudiante ON sea_cartillas_omr (rol_examen_id, codigo_estudiante);
