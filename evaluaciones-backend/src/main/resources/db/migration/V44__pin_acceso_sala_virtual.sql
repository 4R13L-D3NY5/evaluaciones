ALTER TABLE sea_salas_examen_virtual
    ADD COLUMN IF NOT EXISTS token_grupo_plano VARCHAR(10) NULL;

-- Sincronizar salas activas existentes para consistencia entre Evaluaciones y Docente
UPDATE sea_salas_examen_virtual
    SET token_grupo_plano = '503900'
    WHERE token_grupo_hash = '59528816bafded9fca608803cf55af539984f135a5417f49952842e8e440c7fe';
