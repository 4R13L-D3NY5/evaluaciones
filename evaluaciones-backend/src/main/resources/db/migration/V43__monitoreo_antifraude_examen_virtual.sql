-- V43: Columnas de monitoreo y antifraude para intentos de examen virtual
ALTER TABLE sea_intentos_examen_virtual
    ADD COLUMN IF NOT EXISTS salidas_pantalla INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS advertencias_docente INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS mensaje_advertencia VARCHAR(300) NULL;
