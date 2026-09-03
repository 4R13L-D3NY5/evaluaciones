-- sea_bancos_preguntas no tiene actualizado_en; el trigger histórico impedía
-- actualizar bancos durante la migración y durante nuevas cargas cifradas.
DROP TRIGGER IF EXISTS trg_bancos_preguntas_updated_at ON sea_bancos_preguntas;
