ALTER TABLE sea_examenes_variantes
    ADD COLUMN IF NOT EXISTS contenido_virtual_json TEXT NULL;

CREATE TABLE IF NOT EXISTS sea_salas_examen_virtual (
    id VARCHAR(64) PRIMARY KEY,
    rol_examen_id VARCHAR(64) NOT NULL,
    codigo_sala VARCHAR(20) NOT NULL UNIQUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'PREPARADA'
        CHECK (estado IN ('PREPARADA', 'ABIERTA', 'EN_CURSO', 'PAUSADA', 'CERRADA', 'CALIFICADA', 'ANULADA')),
    duracion_minutos INTEGER NOT NULL DEFAULT 90 CHECK (duracion_minutos BETWEEN 1 AND 480),
    gracia_ingreso_minutos INTEGER NOT NULL DEFAULT 10 CHECK (gracia_ingreso_minutos BETWEEN 0 AND 60),
    permite_reconexion BOOLEAN NOT NULL DEFAULT TRUE,
    publicada_en TIMESTAMP NULL,
    iniciada_en TIMESTAMP NULL,
    termina_en TIMESTAMP NULL,
    cerrada_en TIMESTAMP NULL,
    creado_por VARCHAR(100) NOT NULL,
    iniciado_por VARCHAR(100) NULL,
    cerrado_por VARCHAR(100) NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sala_virtual_rol FOREIGN KEY (rol_examen_id)
        REFERENCES sea_roles_evaluaciones (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_salas_virtual_rol ON sea_salas_examen_virtual (rol_examen_id);
CREATE INDEX IF NOT EXISTS idx_salas_virtual_estado ON sea_salas_examen_virtual (estado);

CREATE TABLE IF NOT EXISTS sea_intentos_examen_virtual (
    id VARCHAR(64) PRIMARY KEY,
    sala_id VARCHAR(64) NOT NULL,
    mapeo_estudiante_variante_id BIGINT NOT NULL,
    codigo_estudiante VARCHAR(30) NOT NULL,
    nombre_estudiante VARCHAR(220) NOT NULL,
    variante_id VARCHAR(64) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
        CHECK (estado IN ('PENDIENTE', 'VALIDADO', 'EN_ESPERA', 'EN_CURSO', 'ENVIADO', 'CALIFICADO', 'ANULADO')),
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    token_emitido_en TIMESTAMP NOT NULL,
    token_expira_en TIMESTAMP NOT NULL,
    ingreso_en TIMESTAMP NULL,
    inicio_en TIMESTAMP NULL,
    ultima_actividad_en TIMESTAMP NULL,
    enviado_en TIMESTAMP NULL,
    aciertos SMALLINT NULL,
    nota_sobre_30 NUMERIC(5,2) NULL,
    nota_sobre_100 NUMERIC(5,2) NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_intento_virtual_sala FOREIGN KEY (sala_id)
        REFERENCES sea_salas_examen_virtual (id) ON DELETE CASCADE,
    CONSTRAINT fk_intento_virtual_mapeo FOREIGN KEY (mapeo_estudiante_variante_id)
        REFERENCES sea_mapeo_estudiantes_variantes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_intento_virtual_variante FOREIGN KEY (variante_id)
        REFERENCES sea_examenes_variantes (id) ON DELETE RESTRICT,
    UNIQUE (sala_id, codigo_estudiante)
);

CREATE INDEX IF NOT EXISTS idx_intentos_virtual_sala ON sea_intentos_examen_virtual (sala_id, estado);

CREATE TABLE IF NOT EXISTS sea_respuestas_examen_virtual (
    id BIGSERIAL PRIMARY KEY,
    intento_id VARCHAR(64) NOT NULL,
    numero_pregunta INTEGER NOT NULL CHECK (numero_pregunta > 0),
    reactivo_id INTEGER NOT NULL,
    respuesta VARCHAR(10) NULL,
    guardada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_respuesta_virtual_intento FOREIGN KEY (intento_id)
        REFERENCES sea_intentos_examen_virtual (id) ON DELETE CASCADE,
    UNIQUE (intento_id, numero_pregunta)
);

CREATE TABLE IF NOT EXISTS sea_eventos_examen_virtual (
    id BIGSERIAL PRIMARY KEY,
    sala_id VARCHAR(64) NOT NULL,
    intento_id VARCHAR(64) NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    detalles_json TEXT NULL,
    usuario VARCHAR(100) NULL,
    ip_origen VARCHAR(45) NULL,
    ocurrido_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_virtual_sala FOREIGN KEY (sala_id)
        REFERENCES sea_salas_examen_virtual (id) ON DELETE CASCADE,
    CONSTRAINT fk_evento_virtual_intento FOREIGN KEY (intento_id)
        REFERENCES sea_intentos_examen_virtual (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eventos_virtual_sala ON sea_eventos_examen_virtual (sala_id, ocurrido_en);
