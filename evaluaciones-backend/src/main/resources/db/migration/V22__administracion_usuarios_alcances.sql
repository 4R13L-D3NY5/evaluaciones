-- Administración interna de usuarios preparada para futura federación con Keycloak.
ALTER TABLE sea_roles_sistema
    ADD COLUMN IF NOT EXISTS es_rol_negocio BOOLEAN NOT NULL DEFAULT TRUE;

INSERT INTO sea_roles_sistema (codigo, nombre, descripcion)
VALUES (
    'DIRECTOR_CARRERA',
    'Director de carrera',
    'Registra y consulta la programación oficial de las carreras asignadas'
)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion;

ALTER TABLE sea_usuarios_sistema
    ADD COLUMN IF NOT EXISTS ci VARCHAR(30),
    ADD COLUMN IF NOT EXISTS debe_cambiar_contrasena BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS proveedor_identidad VARCHAR(30) NOT NULL DEFAULT 'INTERNO',
    ADD COLUMN IF NOT EXISTS identidad_externa VARCHAR(180);

-- El administrador local existente también debe renovar su clave al primer ingreso
-- posterior a esta migración.
UPDATE sea_usuarios_sistema
SET debe_cambiar_contrasena = TRUE
WHERE debe_cambiar_contrasena IS NULL;

UPDATE sea_usuarios_sistema
SET ci = usuario
WHERE ci IS NULL
  AND usuario ~ '^[0-9]+$';

CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_sistema_ci
    ON sea_usuarios_sistema (ci)
    WHERE ci IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_sistema_identidad_externa
    ON sea_usuarios_sistema (proveedor_identidad, identidad_externa)
    WHERE identidad_externa IS NOT NULL;

CREATE TABLE IF NOT EXISTS sea_usuario_sedes (
    usuario_id BIGINT NOT NULL,
    sede_codigo VARCHAR(30) NOT NULL,
    sede_nombre VARCHAR(150) NOT NULL,
    PRIMARY KEY (usuario_id, sede_codigo),
    CONSTRAINT fk_usuario_sede_usuario FOREIGN KEY (usuario_id)
        REFERENCES sea_usuarios_sistema (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario_sedes_codigo
    ON sea_usuario_sedes (sede_codigo);

CREATE TABLE IF NOT EXISTS sea_usuario_carreras (
    usuario_id BIGINT NOT NULL,
    carrera_codigo VARCHAR(50) NOT NULL,
    carrera_nombre VARCHAR(180) NOT NULL,
    PRIMARY KEY (usuario_id, carrera_codigo),
    CONSTRAINT fk_usuario_carrera_usuario FOREIGN KEY (usuario_id)
        REFERENCES sea_usuarios_sistema (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario_carreras_codigo
    ON sea_usuario_carreras (carrera_codigo);

CREATE TABLE IF NOT EXISTS sea_auditoria_usuarios (
    id BIGSERIAL PRIMARY KEY,
    usuario_objetivo_id BIGINT NULL,
    usuario_objetivo_ci VARCHAR(30) NULL,
    accion VARCHAR(60) NOT NULL,
    realizado_por VARCHAR(100) NOT NULL,
    detalle VARCHAR(500) NULL,
    fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_usuario_objetivo FOREIGN KEY (usuario_objetivo_id)
        REFERENCES sea_usuarios_sistema (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuarios_fecha
    ON sea_auditoria_usuarios (fecha_evento DESC);
