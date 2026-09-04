CREATE TABLE sea_configuracion_respaldos (
  id SMALLINT PRIMARY KEY,
  activo BOOLEAN NOT NULL DEFAULT FALSE,
  frecuencia_minutos INTEGER NOT NULL DEFAULT 1440 CHECK (frecuencia_minutos > 0),
  retencion_dias INTEGER NOT NULL DEFAULT 30 CHECK (retencion_dias > 0),
  destino_externo_configurado VARCHAR(500) NOT NULL,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_por VARCHAR(100) NOT NULL DEFAULT 'SISTEMA'
);

INSERT INTO sea_configuracion_respaldos (id, destino_externo_configurado)
VALUES (1, '/app/backups-external')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE sea_respaldos (
  id VARCHAR(64) PRIMARY KEY,
  tipo VARCHAR(30) NOT NULL DEFAULT 'SNAPSHOT',
  estado VARCHAR(40) NOT NULL DEFAULT 'SOLICITADO'
    CHECK (estado IN ('SOLICITADO', 'EN_PROCESO', 'GENERADO', 'COPIANDO', 'COPIADO', 'VERIFICANDO', 'VERIFICADO', 'RESTAURANDO', 'ELIMINADO', 'ERROR')),
  snapshot_local_id VARCHAR(255),
  snapshot_externo_id VARCHAR(255),
  ruta_local VARCHAR(500),
  ruta_externa VARCHAR(500),
  tamano_bytes BIGINT,
  archivos_count INTEGER,
  solicitado_por VARCHAR(100) NOT NULL,
  solicitado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  iniciado_en TIMESTAMP,
  finalizado_en TIMESTAMP,
  externo_copiado_en TIMESTAMP,
  verificado_en TIMESTAMP,
  local_eliminado_en TIMESTAMP,
  error_mensaje TEXT,
  metadata_json JSONB,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_respaldos_estado_fecha ON sea_respaldos (estado, solicitado_en DESC);

CREATE TABLE sea_auditoria_respaldos (
  id BIGSERIAL PRIMARY KEY,
  respaldo_id VARCHAR(64),
  accion VARCHAR(60) NOT NULL,
  actor VARCHAR(100) NOT NULL,
  detalle_json JSONB,
  ip_origen VARCHAR(45),
  fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auditoria_respaldo FOREIGN KEY (respaldo_id)
    REFERENCES sea_respaldos (id) ON DELETE SET NULL
);

CREATE INDEX idx_auditoria_respaldos_fecha ON sea_auditoria_respaldos (fecha_evento DESC);
