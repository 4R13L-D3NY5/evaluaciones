-- Amplía los estados de flujo para incluir CONFIRMADO tras CALIFICADO en evaluaciones
ALTER TABLE sea_roles_evaluaciones
  DROP CONSTRAINT IF EXISTS sea_roles_evaluaciones_estado_flujo_check;

ALTER TABLE sea_roles_evaluaciones
  ADD CONSTRAINT sea_roles_evaluaciones_estado_flujo_check
  CHECK (estado_flujo IN (
    'PROGRAMADO', 'VALIDADO', 'GENERADO', 'IMPRESO', 'ENTREGADO',
    'DEVUELTO', 'PENDIENTE_NOTAS', 'CALIFICADO', 'CONFIRMADO', 'SUSPENDIDO'
  ));
