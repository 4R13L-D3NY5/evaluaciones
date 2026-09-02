-- Unifica los estados finales y elimina los estados de remisión que ya no
-- representan una actividad del flujo de evaluaciones.
UPDATE sea_roles_evaluaciones
SET estado_flujo = 'CALIFICADO'
WHERE estado_flujo IN ('REVISADO', 'SUBIDO', 'RECIBIDO');

ALTER TABLE sea_roles_evaluaciones
  DROP CONSTRAINT IF EXISTS sea_roles_evaluaciones_estado_flujo_check;

ALTER TABLE sea_roles_evaluaciones
  ADD CONSTRAINT sea_roles_evaluaciones_estado_flujo_check
  CHECK (estado_flujo IN (
    'PROGRAMADO', 'VALIDADO', 'GENERADO', 'IMPRESO', 'ENTREGADO',
    'DEVUELTO', 'PENDIENTE_NOTAS', 'CALIFICADO', 'SUSPENDIDO'
  ));
