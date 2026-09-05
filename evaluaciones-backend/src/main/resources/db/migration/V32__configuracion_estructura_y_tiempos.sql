ALTER TABLE sea_configuracion_evaluaciones
  ADD COLUMN IF NOT EXISTS estructura_preguntas_json TEXT NOT NULL DEFAULT '{"1P":{"totalPreguntas":30,"facil":7,"medio":16,"dificil":7},"2P":{"totalPreguntas":30,"facil":7,"medio":16,"dificil":7},"FINAL":{"totalPreguntas":60,"facil":15,"medio":30,"dificil":15},"2DA_INSTANCIA":{"totalPreguntas":50,"facil":10,"medio":25,"dificil":15}}',
  ADD COLUMN IF NOT EXISTS minutos_antes_entrega INTEGER NOT NULL DEFAULT 15 CHECK (minutos_antes_entrega BETWEEN 0 AND 10080),
  ADD COLUMN IF NOT EXISTS horas_antes_generacion INTEGER NOT NULL DEFAULT 144 CHECK (horas_antes_generacion BETWEEN 0 AND 720),
  ADD COLUMN IF NOT EXISTS horas_post_patron INTEGER NOT NULL DEFAULT 8 CHECK (horas_post_patron BETWEEN 0 AND 720),
  ADD COLUMN IF NOT EXISTS horas_antes_lista INTEGER NOT NULL DEFAULT 24 CHECK (horas_antes_lista BETWEEN 0 AND 720),
  ADD COLUMN IF NOT EXISTS horas_candado_72 INTEGER NOT NULL DEFAULT 72 CHECK (horas_candado_72 BETWEEN 0 AND 720);
