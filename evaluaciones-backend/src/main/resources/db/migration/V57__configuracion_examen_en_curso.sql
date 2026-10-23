-- V57: Parámetro de examen en curso en la configuración institucional de evaluaciones
ALTER TABLE sea_configuracion_evaluaciones
    ADD COLUMN IF NOT EXISTS examen_en_curso VARCHAR(50) NOT NULL DEFAULT '1ER_PARCIAL';
