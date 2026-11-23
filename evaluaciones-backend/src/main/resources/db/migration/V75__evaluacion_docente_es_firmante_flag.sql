-- =====================================================================
-- Migración V75: Flag explícito para firmantes oficiales de Evaluación Docente
-- y reparación de respuestas históricas para consistencia dimensional
-- =====================================================================

-- 1. Agregar flag explícito de firmante en sea_usuarios_sistema
ALTER TABLE sea_usuarios_sistema 
ADD COLUMN IF NOT EXISTS es_firmante_evaluacion_docente BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Talento Humano firma por defecto como refrendatario institucional (solo visual)
UPDATE sea_usuarios_sistema 
SET es_firmante_evaluacion_docente = TRUE 
WHERE rol_codigo = 'TALENTO_HUMANO';

-- 3. Los vicerrectores quedan en FALSE por defecto para que la administración
-- active únicamente a los vicerrectores designados para firmar (ej. Dirección Académica / Dirección Institucional)
UPDATE sea_usuarios_sistema 
SET es_firmante_evaluacion_docente = FALSE 
WHERE rol_codigo = 'VICERRECTOR';

-- 4. Sembrado defensivo de respuestas para registro histórico si existe en el entorno
-- y no cuenta con detalle en sea_evaluacion_estudiante_respuestas
INSERT INTO sea_evaluacion_estudiante_respuestas (registro_id, criterio_id, puntuacion)
SELECT 'REG-EST-C0BCD8EA-CEE', c.id, 
       CASE 
           WHEN c.numero IN ('1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '4.1', '4.2', '5.1', '5.2', '5.3', '5.4') THEN 2
           ELSE 1
       END AS puntuacion
FROM sea_evaluacion_criterios c
JOIN sea_evaluacion_secciones s ON s.id = c.seccion_id
WHERE s.instrumento_id = 'inst-estudiante-unitepc-v1'
  AND EXISTS (
      SELECT 1 FROM sea_evaluacion_estudiante_registros reg 
      WHERE reg.id = 'REG-EST-C0BCD8EA-CEE'
  )
  AND NOT EXISTS (
      SELECT 1 FROM sea_evaluacion_estudiante_respuestas r 
      WHERE r.registro_id = 'REG-EST-C0BCD8EA-CEE'
  );
