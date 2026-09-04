-- Alcance relacional: evita perder la combinación sede-carrera y, para docentes,
-- la combinación sede-carrera-asignatura.
CREATE TABLE IF NOT EXISTS sea_usuario_asignaciones (
    usuario_id BIGINT NOT NULL,
    sede_codigo VARCHAR(30) NOT NULL,
    sede_nombre VARCHAR(150) NOT NULL,
    carrera_codigo VARCHAR(50) NOT NULL,
    carrera_nombre VARCHAR(180) NOT NULL,
    asignatura_codigo VARCHAR(50) NOT NULL DEFAULT '',
    asignatura_nombre VARCHAR(180) NOT NULL DEFAULT '',
    PRIMARY KEY (usuario_id, sede_codigo, carrera_codigo, asignatura_codigo),
    CONSTRAINT fk_usuario_asignacion_usuario FOREIGN KEY (usuario_id)
        REFERENCES sea_usuarios_sistema (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario_asignaciones_sede_carrera
    ON sea_usuario_asignaciones (sede_codigo, carrera_codigo);
