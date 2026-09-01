# Módulo de examen virtual

## Alcance

La modalidad virtual reutiliza la secuencia de generación, las variantes, el ratio institucional y el mapeo estudiante-variante del examen con cartilla. No genera una segunda versión pedagógica del examen.

La diferencia operativa es que cada estudiante resuelve su variante en una sala web, con respuestas persistidas, cronómetro controlado por servidor y calificación automática.

## Flujo funcional

1. El rol debe estar en modalidad `VIRTUAL`, con banco validado.
2. Desde Lista de Evaluaciones, la acción **Preparar sala virtual y accesos** genera las variantes usando el mismo ratio del examen con cartilla, pero no crea PDF ni cartilla.
3. El sistema crea una sala y un intento por cada mapeo oficial, con un token individual temporal y un token grupal para facilitar la distribución.
4. El operador abre la sala y entrega el código de sala y el token grupal al grupo. Cada estudiante ingresa además su código institucional; los tokens individuales se conservan como alternativa.
5. Los estudiantes ingresan a una sala de espera; todavía no reciben preguntas.
6. El docente verifica la nómina y el operador o docente autorizado inicia la sala.
7. El servidor fija `iniciadaEn` y `terminaEn` y entrega los segundos restantes como valores numéricos, sin depender de la zona horaria del navegador. Antes de entregar las preguntas, la vista del estudiante muestra la cuenta regresiva configurada en Administración de Evaluaciones (15 segundos por defecto, con un rango de 0 a 120 segundos). Todos los navegadores muestran el mismo tiempo oficial.
8. Cada estudiante recibe el contenido virtual de su variante, con el mismo orden de preguntas e incisos que la versión impresa. La vista se organiza por secciones, conserva sus instrucciones y presenta los bloques de contexto de emparejamiento o caso clínico igual que el formato PDF institucional. La cabecera identifica la institución, carrera, sede, parcial, asignatura, grupo, docente, fecha, modalidad y estudiante. En verdadero o falso complejo, las cuatro afirmaciones se muestran como `1` a `4` y debajo se presenta la clave seleccionable de `A` a `E`. En emparejamiento ampliado, la tarjeta de referencia se muestra primero y cada pregunta relacionada tiene debajo el grupo seleccionable `A` a `E`. Los macros de contexto no se cuentan como preguntas: el examen debe mostrar 30 preguntas respondibles, aunque el contenido interno incluya tarjetas de contexto adicionales.
9. Cada respuesta se guarda automáticamente y puede continuar después de una reconexión.
10. El envío manual o el vencimiento califica el intento y registra los eventos.
11. Al cerrar la sala, el rol pasa directamente de `VALIDADO` a `REVISADO`; no se usan `GENERADO`, `IMPRESO`, `ENTREGADO` ni `DEVUELTO` para virtual.
12. Personal autorizado puede consultar la nota, la variante y cada inciso marcado por estudiante.
13. Si ocurre una interrupción de internet u otro incidente, una sala `ABIERTA`, `EN_CURSO`, `PAUSADA`, `CERRADA` o `CALIFICADA` puede restablecerse a `ABIERTA` indicando un motivo obligatorio y confirmando la acción. Se conservan las respuestas guardadas, se reabren los intentos no anulados y se amplía su vigencia de acceso. Después se inicia nuevamente la sala para continuar; la calificación calculada se limpia y la acción queda registrada en la bitácora.

## Estados

### Sala

`PREPARADA`, `ABIERTA`, `EN_CURSO`, `PAUSADA`, `CERRADA`, `CALIFICADA`, `ANULADA`.

### Intento

`PENDIENTE`, `VALIDADO`, `EN_ESPERA`, `EN_CURSO`, `ENVIADO`, `CALIFICADO`, `ANULADO`.

## Acceso inicial sin cuentas estudiantiles

La primera versión no requiere crear usuarios del sistema para estudiantes. El acceso se valida mediante:

- código de sala;
- token aleatorio individual o token grupal;
- código institucional del estudiante, obligatorio cuando se usa el token grupal.

Los tokens nunca se guardan en texto plano. El token individual queda vinculado a una sola sala, estudiante e intento. El token grupal queda vinculado a una sola sala y, al validarse con el código institucional, genera un token de sesión exclusivo para el intento del estudiante. Ningún token contiene la variante ni la clave de respuestas.

El token grupal se muestra en texto plano únicamente al crear la sala o al solicitar explícitamente su emisión desde la pantalla administrativa. En la lista de evaluaciones se puede emitir desde el popup de la sala mediante **Emitir token grupal** y copiarlo para compartirlo con el grupo. Si se emite otro, el anterior deja de funcionar y la actividad queda registrada en la bitácora.

Para evaluaciones oficiales de alto impacto se recomienda una segunda etapa con SSO/OTP institucional, conservando este mismo modelo de sala e intento.

## Persistencia

- `sea_salas_examen_virtual`: configuración, ciclo de vida, horario oficial y huella del token grupal.
- `sea_intentos_examen_virtual`: identidad, variante, huella del token individual, huella del token de sesión y resultado.
- `sea_respuestas_examen_virtual`: última respuesta por pregunta.
- `sea_eventos_examen_virtual`: trazabilidad de creación, ingreso, inicio, envío y cierre.
- `sea_examenes_variantes.contenido_virtual_json`: preguntas e incisos renderizables sin respuestas correctas.

## API

### Personal autenticado

- `POST /api/examenes-virtuales/salas`
- `POST /api/examenes-virtuales/salas/{id}/token-grupo`
- `POST /api/examenes-virtuales/salas/{id}/abrir`
- `POST /api/examenes-virtuales/salas/{id}/iniciar`
- `POST /api/examenes-virtuales/salas/{id}/cerrar`
- `POST /api/examenes-virtuales/salas/{id}/restablecer`
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

Las migraciones `V10__examen_virtual.sql`, `V13__acceso_grupal_sala_virtual.sql` y `V14__cuenta_regresiva_examen_virtual.sql`, el backend Spring Boot y las interfaces Angular compilan correctamente. Las variantes generadas antes de esta funcionalidad no tienen `contenido_virtual_json`; deben regenerarse antes de abrir una sala virtual.

## Pendiente para una versión institucional

- rate limiting y bloqueo progresivo del endpoint de acceso;
- recuperación de respuestas en la pantalla después de una recarga;
- monitor en tiempo real para el docente;
- políticas avanzadas de ingreso tardío y pausa; el restablecimiento básico por incidencia ya está disponible;
- integración SSO/OTP de estudiantes;
- pruebas de concurrencia con un grupo completo;
- restricciones definitivas por sede, carrera, grupo y docente.
