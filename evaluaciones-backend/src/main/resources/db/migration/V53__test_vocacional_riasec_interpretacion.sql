-- V53: Integración de la Matriz de Orientación Vocacional RIASEC UNITEPC
ALTER TABLE sea_test_vocacional
    ADD COLUMN IF NOT EXISTS codigo_holland VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS facultad_sugerida VARCHAR(150) NULL,
    ADD COLUMN IF NOT EXISTS puntajes_riasec_json TEXT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS facultades_afinidad_json TEXT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS carreras_sugeridas_json TEXT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_test_vocacional_facultad ON sea_test_vocacional (facultad_sugerida);
CREATE INDEX IF NOT EXISTS idx_test_vocacional_codigo_holland ON sea_test_vocacional (codigo_holland);
