INSERT INTO sea_roles_sistema (codigo, nombre, descripcion)
VALUES (
    'VERIFICADOR',
    'Verificador de exámenes',
    'Revisa bancos de preguntas validados antes de la generación oficial'
)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    activo = TRUE;

CREATE TABLE IF NOT EXISTS sea_configuracion_verificacion (
    id BIGSERIAL PRIMARY KEY,
    sede_codigo VARCHAR(30) NOT NULL,
    sede_nombre VARCHAR(150) NOT NULL,
    carrera_codigo VARCHAR(50),
    carrera_nombre VARCHAR(180),
    habilitada BOOLEAN NOT NULL DEFAULT FALSE,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_por VARCHAR(100) NOT NULL,
    CONSTRAINT ck_config_verificacion_alcance
        CHECK ((carrera_codigo IS NULL AND carrera_nombre IS NULL)
            OR (carrera_codigo IS NOT NULL AND carrera_nombre IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_config_verificacion_sede
    ON sea_configuracion_verificacion (sede_codigo)
    WHERE carrera_codigo IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_config_verificacion_carrera
    ON sea_configuracion_verificacion (sede_codigo, carrera_codigo)
    WHERE carrera_codigo IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_config_verificacion_alcance
    ON sea_configuracion_verificacion (sede_codigo, carrera_codigo, habilitada);

CREATE TABLE IF NOT EXISTS sea_verificaciones_examenes (
    id BIGSERIAL PRIMARY KEY,
    rol_examen_id VARCHAR(64) NOT NULL,
    banco_preguntas_id VARCHAR(64) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    observaciones_generales TEXT,
    observaciones_preguntas_json TEXT,
    verificado_por VARCHAR(100),
    fecha_verificacion TIMESTAMP,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_verificacion_rol UNIQUE (rol_examen_id),
    CONSTRAINT fk_verificacion_rol FOREIGN KEY (rol_examen_id)
        REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE,
    CONSTRAINT ck_verificacion_estado
        CHECK (estado IN ('PENDIENTE', 'VERIFICADO', 'DEVUELTO'))
);

CREATE INDEX IF NOT EXISTS idx_verificacion_estado
    ON sea_verificaciones_examenes (estado, actualizado_en);

CREATE TABLE IF NOT EXISTS sea_auditoria_verificacion (
    id BIGSERIAL PRIMARY KEY,
    rol_examen_id VARCHAR(64),
    accion VARCHAR(80) NOT NULL,
    realizado_por VARCHAR(100) NOT NULL,
    detalle TEXT,
    fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_verificacion_rol FOREIGN KEY (rol_examen_id)
        REFERENCES sea_roles_evaluaciones (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_auditoria_verificacion_fecha
    ON sea_auditoria_verificacion (fecha_evento DESC);
