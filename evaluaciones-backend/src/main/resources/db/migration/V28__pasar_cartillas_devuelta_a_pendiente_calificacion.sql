-- En las evaluaciones con cartilla, la devolución entrega el material al
-- personal de Evaluaciones para iniciar la lectura y calificación OMR.
-- Regulariza los roles históricos que quedaron detenidos en DEVUELTO.
UPDATE sea_roles_evaluaciones
SET estado_flujo = 'PENDIENTE_NOTAS'
WHERE modalidad = 'PRESENCIAL_CARTILLA'
  AND estado_flujo = 'DEVUELTO';
