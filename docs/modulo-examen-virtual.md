# Módulo de examen virtual

## Alcance

La modalidad virtual reutiliza la secuencia de generación, las variantes, el ratio institucional y el mapeo estudiante-variante del examen con cartilla. No genera una segunda versión pedagógica del examen.

La diferencia operativa es que cada estudiante resuelve su variante en una sala web, con respuestas persistidas, cronómetro controlado por servidor y calificación automática.

## Flujo funcional

1. El rol debe estar en modalidad `VIRTUAL`, con banco validado.
2. Desde Lista de Evaluaciones, la acción **Preparar sala virtual y accesos** genera las variantes usando el mismo ratio del examen con cartilla, pero no crea PDF ni cartilla.
3. El sistema crea una sala y un intento por cada mapeo oficial, con un token individual temporal.
4. El operador abre la sala y entrega el código de sala y cada token a su estudiante.
5. Los estudiantes ingresan a una sala de espera; todavía no reciben preguntas.
6. El docente verifica la nómina y el operador o docente autorizado inicia la sala.
7. El servidor fija `iniciadaEn` y `terminaEn`. Todos los navegadores muestran el mismo tiempo oficial.
8. Cada estudiante recibe el contenido virtual de su variante, con el mismo orden de preguntas e incisos que la versión impresa.
9. Cada respuesta se guarda automáticamente y puede continuar después de una reconexión.
10. El envío manual o el vencimiento califica el intento y registra los eventos.
11. Al cerrar la sala, el rol pasa directamente de `VALIDADO` a `REVISADO`; no se usan `GENERADO`, `IMPRESO`, `ENTREGADO` ni `DEVUELTO` para virtual.
12. Personal autorizado puede consultar la nota, la variante y cada inciso marcado por estudiante.

## Estados

### Sala

`PREPARADA`, `ABIERTA`, `EN_CURSO`, `PAUSADA`, `CERRADA`, `CALIFICADA`, `ANULADA`.

### Intento

`PENDIENTE`, `VALIDADO`, `EN_ESPERA`, `EN_CURSO`, `ENVIADO`, `CALIFICADO`, `ANULADO`.

## Acceso inicial sin cuentas estudiantiles

La primera versión no requiere crear usuarios del sistema para estudiantes. El acceso se valida mediante:

- código de sala;
- token aleatorio individual;
- código institucional opcional, recomendado para confirmar identidad.

El token nunca se guarda en texto plano, no contiene la variante ni la clave de respuestas y queda vinculado a una sola sala, estudiante e intento. No se debe utilizar un token común para todo el grupo.

Para evaluaciones oficiales de alto impacto se recomienda una segunda etapa con SSO/OTP institucional, conservando este mismo modelo de sala e intento.

## Persistencia

- `sea_salas_examen_virtual`: configuración, ciclo de vida y horario oficial.
- `sea_intentos_examen_virtual`: identidad, variante, token hash, estado y resultado.
- `sea_respuestas_examen_virtual`: última respuesta por pregunta.
- `sea_eventos_examen_virtual`: trazabilidad de creación, ingreso, inicio, envío y cierre.
- `sea_examenes_variantes.contenido_virtual_json`: preguntas e incisos renderizables sin respuestas correctas.

## API

### Personal autenticado

- `POST /api/examenes-virtuales/salas`
- `POST /api/examenes-virtuales/salas/{id}/abrir`
- `POST /api/examenes-virtuales/salas/{id}/iniciar`
- `POST /api/examenes-virtuales/salas/{id}/cerrar`
- `GET /api/examenes-virtuales/salas/{id}`

### Acceso estudiantil

- `POST /api/acceso-virtual/validar`
- `GET /api/examen-virtual/actual` con `X-Examen-Token`
- `PUT /api/examen-virtual/respuestas` con `X-Examen-Token`
- `POST /api/examen-virtual/enviar` con `X-Examen-Token`

### Resultados virtuales

- `GET /api/examenes-virtuales/roles/{rolExamenId}/resultados`

Devuelve los intentos calificados, la variante asignada, aciertos, notas sobre 30 y 100, y las respuestas guardadas por pregunta.

## Verificación

La migración `V10__examen_virtual.sql`, el backend Spring Boot, el worker y las interfaces Angular compilan correctamente. Las variantes generadas antes de esta funcionalidad no tienen `contenido_virtual_json`; deben regenerarse antes de abrir una sala virtual.

## Pendiente para una versión institucional

- rate limiting y bloqueo progresivo del endpoint de acceso;
- recuperación de respuestas en la pantalla después de una recarga;
- monitor en tiempo real para el docente;
- políticas de ingreso tardío, pausa y reapertura;
- integración SSO/OTP de estudiantes;
- pruebas de concurrencia con un grupo completo;
- restricciones definitivas por sede, carrera, grupo y docente.
