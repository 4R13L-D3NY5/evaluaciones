-- Ampliar longitud de columna examen_en_curso para soportar múltiples exámenes habilitados en simultáneo
ALTER TABLE sea_configuracion_evaluaciones
    ALTER COLUMN examen_en_curso TYPE VARCHAR(255);
