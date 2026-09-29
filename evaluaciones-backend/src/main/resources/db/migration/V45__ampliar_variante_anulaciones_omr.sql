-- ============================================================================
-- V45: Ampliar restricción de letra_variante en sea_anulaciones_preguntas_omr
-- Permite variantes más allá de E (ej. F, G, H, AA...) alineado con V26.
-- ============================================================================

ALTER TABLE sea_anulaciones_preguntas_omr
    DROP CONSTRAINT IF EXISTS ck_anulacion_omr_variante;

ALTER TABLE sea_anulaciones_preguntas_omr
    ADD CONSTRAINT ck_anulacion_omr_variante
    CHECK (letra_variante ~ '^[A-Z]{1,4}$');
