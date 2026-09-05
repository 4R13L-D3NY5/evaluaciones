# Configuración de exámenes

## Objetivo

La pantalla **Administración de evaluaciones → Configuración de Exámenes** define los parámetros oficiales que utiliza el sistema al generar los cuadernillos PDF y al preparar los exámenes virtuales. La configuración no es únicamente informativa: se guarda en la base de datos y se envía al motor de generación Typst mediante el backend y la cola RabbitMQ.

## Parámetros de generación

Los valores iniciales son:

| Parámetro | Valor inicial | Uso |
| --- | --- | --- |
| Ratio de estudiantes por variante | `5` | Calcula cuántas variantes se requieren para una nómina. |
| Formato de hoja | `Oficio (Folio UNITEPC)` | Define el tamaño de página del PDF. Si se configura A4, el worker utiliza A4. |
| Tipo de letra | `Times New Roman` | Nombre institucional seleccionado en la pantalla. En el contenedor Linux se utiliza `Liberation Serif` como sustitución compatible para mantener la misma apariencia serif. |
| Tamaño de letra | `11 pt` | Tamaño base del texto del cuadernillo. |
| Espaciado | `0.8em (línea) · 1.2em (pregunta)` | El primer valor se aplica al interlineado y el segundo separa preguntas o bloques. |

## Estructura por parcial

Cada examen utiliza la fila correspondiente a su tipo de parcial:

| Parcial | Total | Fácil | Medio | Difícil |
| --- | ---: | ---: | ---: | ---: |
| 1er Parcial | 30 | 7 | 16 | 7 |
| 2do Parcial | 30 | 7 | 16 | 7 |
| Examen Final | 60 | 15 | 30 | 15 |
| 2da Instancia | 50 | 10 | 25 | 15 |

La suma de fácil, medio y difícil debe ser exactamente igual al total del parcial. Cada cantidad se valida entre 0 y 1000, y el total entre 1 y 1000. Si la distribución no coincide, el backend rechaza el guardado para evitar que la generación use cuotas contradictorias.

El banco de preguntas puede contener más reactivos que el mínimo. La selección del examen toma la cantidad configurada para el parcial y respeta las cuotas de dificultad; si el banco no tiene suficientes reactivos para una cuota, la generación se detiene y devuelve el motivo.

## Parámetros de tiempos

La pestaña **Configuración de Tiempos** guarda estos valores iniciales:

| Parámetro | Valor inicial | Significado |
| --- | ---: | --- |
| Minutos antes del examen para entrega | `15` | Anticipación mínima configurada para habilitar el retiro o entrega operativa. |
| Duración predeterminada del examen virtual | `45 min` | Duración usada al crear una sala virtual. |
| Cuenta regresiva antes de iniciar el virtual | `15 s` | Tiempo visible antes de liberar las preguntas al iniciar la sala. |
| Horas antes para mostrar “Generar Examen” | `144 h` | Ventana anticipada de generación. |
| Horas post-entrega para mostrar patrón | `8 h` | Ventana de protección del patrón oficial después de la entrega. |
| Horas antes para liberar la lista | `24 h` | Anticipación para publicar la lista de exámenes. |
| Candado del Rol de Exámenes | `72 h` | Anticipación usada para bloquear cambios o reprogramaciones. |

La duración virtual y la cuenta regresiva se aplican al servicio de examen virtual. Los demás valores quedan persistidos como política operativa para que las validaciones de disponibilidad y cambios de estado puedan consultarlos desde una única configuración.

## Persistencia y API

La configuración se almacena como un registro único en `sea_configuracion_evaluaciones`. La estructura por parcial se guarda en `estructura_preguntas_json`; los tiempos se almacenan en columnas separadas para facilitar auditoría y consultas.

| Operación | Método | Endpoint | Permiso |
| --- | --- | --- | --- |
| Consultar | `GET` | `/api/configuracion-evaluaciones` | Administrador del sistema o responsable de evaluaciones |
| Guardar | `PUT` | `/api/configuracion-evaluaciones` | Administrador del sistema o responsable de evaluaciones |

La respuesta incluye los parámetros completos, la estructura por parcial y los datos de última actualización. Si una versión antigua de la base no tiene todavía estos campos, Flyway ejecuta la migración `V32__configuracion_estructura_y_tiempos.sql` y carga los valores iniciales sin borrar los datos académicos.

## Cómo se aplica al generar

1. El usuario guarda la configuración en la pantalla administrativa.
2. El backend valida y persiste los datos.
3. Al solicitar una generación o previsualización, el backend consulta la configuración vigente.
4. El backend envía al worker el parcial, la estructura, el formato, la fuente, el tamaño y el espaciado.
5. El worker identifica el parcial (`1P`, `2P`, `FINAL` o `2DA_INSTANCIA`) y selecciona las cuotas correspondientes.
6. Typst genera el PDF con el tamaño de hoja, tipografía, tamaño y espaciado configurados.
7. El resultado se registra junto con el rol y queda disponible para auditoría de la generación.

## Verificación rápida

Para comprobar que la configuración está siendo respetada:

1. Guardar una combinación visible, por ejemplo Final `60 / 15 / 30 / 15`.
2. Abrir **Lista de Evaluaciones** y seleccionar un rol de tipo Final.
3. Verificar que el resumen indique 60 preguntas y las cuotas `15`, `30`, `15`.
4. Generar o previsualizar el examen.
5. Confirmar que el PDF corresponde al parcial, que el número de preguntas coincide y que la distribución de dificultad se pudo cubrir.
6. Cambiar temporalmente el formato o el tamaño de letra, guardar y repetir la previsualización para comprobar la diferencia visual.

Las configuraciones aplican a nuevas generaciones y previsualizaciones. Los PDF ya generados conservan los parámetros con los que fueron creados y no se regeneran automáticamente al cambiar la configuración.
