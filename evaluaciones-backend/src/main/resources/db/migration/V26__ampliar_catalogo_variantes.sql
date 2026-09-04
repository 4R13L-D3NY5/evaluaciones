-- Las letras A-E son las opciones de respuesta de la cartilla.
-- La etiqueta de variante identifica la versión del examen y puede continuar
-- como Excel: A..Z, AA..ZZ, etc.

ALTER TABLE sea_examenes_variantes
    ALTER COLUMN letra_variante TYPE VARCHAR(4)
    USING TRIM(letra_variante);

ALTER TABLE sea_mapeo_estudiantes_variantes
    ALTER COLUMN letra_variante TYPE VARCHAR(4)
    USING TRIM(letra_variante);

ALTER TABLE sea_calificaciones_omr
    ALTER COLUMN letra_variante TYPE VARCHAR(4)
    USING TRIM(letra_variante);

ALTER TABLE sea_examenes_variantes
    DROP CONSTRAINT IF EXISTS sea_examenes_variantes_letra_variante_check;

ALTER TABLE sea_mapeo_estudiantes_variantes
    DROP CONSTRAINT IF EXISTS sea_mapeo_estudiantes_variantes_letra_variante_check;

ALTER TABLE sea_calificaciones_omr
    DROP CONSTRAINT IF EXISTS sea_calificaciones_omr_letra_variante_check;

ALTER TABLE sea_examenes_variantes
    ADD CONSTRAINT sea_examenes_variantes_letra_variante_check
    CHECK (letra_variante ~ '^[A-Z]{1,4}$');

ALTER TABLE sea_mapeo_estudiantes_variantes
    ADD CONSTRAINT sea_mapeo_estudiantes_variantes_letra_variante_check
    CHECK (letra_variante ~ '^[A-Z]{1,4}$');

ALTER TABLE sea_calificaciones_omr
    ADD CONSTRAINT sea_calificaciones_omr_letra_variante_check
    CHECK (letra_variante ~ '^[A-Z]{1,4}$');
