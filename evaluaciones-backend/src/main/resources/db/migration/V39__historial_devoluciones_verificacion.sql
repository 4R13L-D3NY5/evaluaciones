CREATE TABLE IF NOT EXISTS sea_historial_devoluciones_verificacion (
    id BIGSERIAL PRIMARY KEY,
    rol_examen_id VARCHAR(64) NOT NULL,
    banco_preguntas_id VARCHAR(64) NOT NULL,
    observaciones_generales TEXT,
    observaciones_preguntas_json TEXT,
    verificado_por VARCHAR(100),
    fecha_devolucion TIMESTAMP NOT NULL,
    contenido_cifrado TEXT NOT NULL,
    contenido_nonce VARCHAR(64) NOT NULL,
    contenido_dek_envuelta TEXT NOT NULL,
    contenido_kek_referencia VARCHAR(150) NOT NULL,
    contenido_kek_version VARCHAR(30) NOT NULL,
    contenido_algoritmo VARCHAR(40) NOT NULL,
    CONSTRAINT fk_historial_verificacion_rol FOREIGN KEY (rol_examen_id)
        REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE,
    CONSTRAINT uq_historial_verificacion_banco UNIQUE (rol_examen_id, banco_preguntas_id)
);

CREATE INDEX IF NOT EXISTS idx_historial_verificacion_fecha
    ON sea_historial_devoluciones_verificacion (rol_examen_id, fecha_devolucion DESC);
