ALTER TABLE sea_bancos_preguntas
    ADD COLUMN IF NOT EXISTS cuotas_grupos_aplicadas BOOLEAN NOT NULL DEFAULT FALSE;
