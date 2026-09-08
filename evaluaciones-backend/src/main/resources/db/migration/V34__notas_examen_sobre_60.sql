-- La escala institucional de los exámenes con cartilla y sin cartilla es 0-60.
-- Se conserva el nombre físico nota_sobre_30 para no romper instalaciones,
-- consultas ni respaldos existentes; desde esta migración su valor representa notaSobre60.

-- Los datos anteriores se calcularon sobre 30. Se convierten a 60 manteniendo
-- exactamente la misma nota normalizada sobre 100.
UPDATE sea_calificaciones_omr
SET nota_sobre_30 = ROUND(nota_sobre_30 * 2, 2);

UPDATE sea_notas_docentes
SET nota_sobre_30 = ROUND(nota_sobre_30 * 2, 2);

DO $$
DECLARE
    table_name TEXT;
    constraint_name TEXT;
BEGIN
    FOR table_name, constraint_name IN
        SELECT rel.relname, con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname IN ('sea_calificaciones_omr', 'sea_notas_docentes')
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) ILIKE '%nota_sobre_30%'
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', table_name, constraint_name);
    END LOOP;
END $$;

ALTER TABLE sea_calificaciones_omr
    ADD CONSTRAINT ck_calificaciones_omr_nota_sobre_60
    CHECK (nota_sobre_30 >= 0 AND nota_sobre_30 <= 60);

ALTER TABLE sea_notas_docentes
    ADD CONSTRAINT ck_notas_docentes_nota_sobre_60
    CHECK (nota_sobre_30 >= 0 AND nota_sobre_30 <= 60);
