-- V54: Agregar campos Sede, Gestión y Municipio a Test Vocacional
ALTER TABLE sea_test_vocacional
    ADD COLUMN IF NOT EXISTS sede VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS gestion VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS municipio VARCHAR(100) NULL;

CREATE INDEX IF NOT EXISTS idx_test_vocacional_sede ON sea_test_vocacional (sede);
CREATE INDEX IF NOT EXISTS idx_test_vocacional_gestion ON sea_test_vocacional (gestion);
CREATE INDEX IF NOT EXISTS idx_test_vocacional_municipio ON sea_test_vocacional (municipio);
