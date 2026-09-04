CREATE TABLE IF NOT EXISTS sea_usuario_campus (
    usuario_id BIGINT NOT NULL,
    sede_codigo VARCHAR(30) NOT NULL,
    sede_nombre VARCHAR(150) NOT NULL,
    campus_id VARCHAR(100) NOT NULL DEFAULT '',
    campus_codigo VARCHAR(100) NOT NULL DEFAULT '',
    campus_nombre VARCHAR(180) NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (usuario_id, sede_codigo, campus_id, campus_codigo, campus_nombre),
    CONSTRAINT fk_usuario_campus_usuario FOREIGN KEY (usuario_id)
        REFERENCES sea_usuarios_sistema (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario_campus_sede_estado
    ON sea_usuario_campus (sede_codigo, habilitado);
