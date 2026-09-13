# Anulación de preguntas OMR desde Calificación

## Alcance

La anulación de preguntas está disponible en **Calificación OMR** para los roles **Responsable de Evaluaciones** y **Administrador del Sistema**. Se reutiliza la persistencia existente de anulaciones por rol, variante y número de pregunta.

## Regla de negocio

- Solo se puede anular una pregunta cuando el rol de examen está en `DEVUELTO` o `PENDIENTE_NOTAS`.
- La operación aplica únicamente a exámenes presenciales con cartilla OMR.
- La anulación se registra por variante; por eso afecta a todos los estudiantes que tengan esa variante.
- El motivo es obligatorio y debe tener al menos cinco caracteres.
- Reactivar una pregunta la devuelve al cálculo y también queda auditado.

## Flujo en la pantalla de calificación

1. Seleccionar el rol de examen y cargar el escaneado.
2. Ejecutar el procesamiento OMR.
3. En resultados, revisar la variante y las respuestas de cada estudiante.
4. Usar el botón de anulación en la fila de la pregunta y registrar el motivo.
5. El sistema recalcula la nota, aciertos, fallos, blancos y dobles marcas de todos los estudiantes de la variante.
6. Para deshacer la acción, usar el botón de reactivación y confirmar.

Las preguntas anuladas se muestran como **Anulada**, no suman al total ni a la nota y conservan el motivo visible en la interfaz.

## Seguridad, auditoría y API

La interfaz se muestra únicamente en el módulo protegido para los dos roles autorizados. El backend mantiene la autorización y el alcance académico mediante estos endpoints existentes:

- `GET /api/omr/{rolExamenId}/anulaciones-preguntas`
- `POST /api/omr/{rolExamenId}/anulaciones-preguntas`
- `DELETE /api/omr/{rolExamenId}/anulaciones-preguntas/{letraVariante}/{numeroPregunta}`

Cada anulación y reactivación genera un evento de auditoría con rol, usuario, IP, variante, pregunta y motivo. La migración `V36__anulaciones_preguntas_omr.sql` conserva el historial sin modificar los bancos cifrados ni los archivos oficiales.

## Verificación realizada

- Compilación de Angular completada correctamente con `npm run build`.
- La pantalla dedicada carga las anulaciones activas al seleccionar el rol.
- La variante recibida por el OMR se conserva en cada resultado.
- El recálculo visual excluye las preguntas anuladas y se sincroniza para todos los estudiantes de la variante.
- El recálculo persistente y la auditoría siguen ejecutándose en el backend existente.
- El worker OMR también consulta las anulaciones activas al reprocesar un escaneado, evitando que una nueva carga las ignore.
