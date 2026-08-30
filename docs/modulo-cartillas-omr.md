# Módulo de cartillas OMR preimpresas

## Alcance de la primera iteración

El módulo prepara la sobreimpresión de cartillas OMR separada del cuadernillo de examen. Genera un PDF con un estudiante por página A4 y registra las cartillas que pertenecen a cada estudiante. El PDF no reproduce la cartilla preimpresa: contiene únicamente los datos operativos que deben caer dentro de sus tres casillas:

- N° correlativo del lote.
- Código de materia.
- Grupo.
- Código del estudiante.
- Nombre completo del estudiante.

La letra de variante no se imprime, no se marca y no se expone en la interfaz. El sistema mantiene la relación de variante de manera interna mediante `sea_mapeo_estudiantes_variantes`, resuelta por `rol_examen_id + codigo_estudiante` durante la calificación OMR.

## Actores y flujo

1. El administrador genera el examen oficial, lo que persiste el mapeo confidencial estudiante-variante.
2. Desde **Lista de Evaluaciones**, abre el icono de cartillas de un rol previo a `ENTREGADO`.
3. El sistema crea un lote PDF con un estudiante por página A4 y guarda únicamente la capa de datos.
4. El administrador revisa/abre el PDF e indica **Marcar como impreso** solo cuando el lote salió físicamente de la impresora.
5. En la futura carga OMR se escanea solamente el cuerpo superior de la cartilla. El talón inferior se conserva para el estudiante y se ignora en la lectura.

## Reglas de negocio

| Regla | Aplicación |
| --- | --- |
| Precondición | Solo se generan cartillas si ya existen mapeos oficiales de estudiantes, creados al generar el examen. |
| Disponibilidad | Las marcas se pueden generar y gestionar en `PROGRAMADO`, `VALIDADO`, `GENERADO` e `IMPRESO`; desde `ENTREGADO` en adelante quedan bloqueadas. |
| Datos impresos | N°, código de materia, grupo, código y nombre completo. |
| Variante | Confidencial e interna; nunca se imprime ni se marca en A-E. |
| Formato | Una sobreimpresión por página A4, alineada con la cartilla de referencia. No se dibuja cartilla ni talón. |
| Coordenadas | X/Y del documento, con origen superior izquierdo: datos `250,90`, código `315,90` con desplazamiento efectivo de 10 puntos a la izquierda, nombre `250,120`. El código se imprime a 22 pt y el nombre completo a 10.5 pt. |
| Impresión | Generar no significa imprimir. La confirmación de impresión es una acción explícita y auditable. |
| Flujo de examen | La impresión de cartillas no cambia por sí sola el estado del rol; evita avanzar el examen sin haber realizado las demás tareas de impresión/control. |
| Escaneo | La lectura usa exclusivamente el código preimpreso del estudiante para recuperar la clave correcta; no coteja N°, materia, grupo ni nombre, y el talón inferior no forma parte del área OMR. |

## Modelo de datos

```text
sea_roles_evaluaciones 1 --- N sea_lotes_cartillas_omr 1 --- N sea_cartillas_omr
          |
          +--- N sea_mapeo_estudiantes_variantes (clave interna por código)
```

### Entidades

- `sea_lotes_cartillas_omr`: identidad, rol, estado, archivo PDF, cantidad y evidencia de impresión.
- `sea_cartillas_omr`: N°, materia, grupo, código, nombre y estado individual de cada cartilla.
- `sea_mapeo_estudiantes_variantes`: asignación confidencial existente. No se duplica la variante en el lote para evitar exposición innecesaria.

Estados del lote: `GENERADO`, `IMPRESO`, `ANULADO`.

Estados de cartilla: `GENERADA`, `IMPRESA`, `ANULADA`.

## API

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/roles-examen/{rolId}/cartillas/ultimo` | Consulta el último lote y sus cartillas. |
| POST | `/api/roles-examen/{rolId}/cartillas/generar` | Crea un nuevo lote PDF desde los mapeos oficiales. |
| POST | `/api/roles-examen/{rolId}/cartillas/lotes/{loteId}/marcar-impreso` | Confirma la impresión física del lote. |

Las acciones generan registros en `sea_auditoria_evaluaciones` con el lote y la cantidad de cartillas involucradas.

## Verificación operativa

1. Generar el examen de un rol y confirmar que existen estudiantes mapeados.
2. Abrir **Lista de Evaluaciones** y seleccionar el icono de cartillas.
3. Generar el lote y verificar que el PDF tenga un estudiante por página A4, sin cartilla dibujada ni letras A-E de variante.
4. Confirmar que cada fila contiene N°, código de materia, grupo, código y nombre completo.
5. Abrir el PDF desde el modal y validar los datos contra la lista oficial.
6. Marcar impreso únicamente después de imprimirlo; revisar la auditoría del rol.
7. En la etapa de OMR, validar que el código leído identifica la clave interna sin mostrar la variante al usuario.

## Procesamiento OMR con escaneo real

El lector no reproduce ni redibuja la cartilla institucional. Recibe el PDF o las imágenes generadas por el escáner y trabaja sobre la primera cara completa de cada cartilla. El talón inferior se ignora.

El worker `worker-omr` realiza la primera iteración oficial:

1. Renderiza cada página del PDF o abre la imagen escaneada.
2. Detecta el contorno de la grilla principal de 60 reactivos (tres bloques de 20)
   y calibra los 15 centros de opciones y las 20 filas mediante las
   circunferencias impresas. Así se compensan desplazamientos, escala y las dos
   distribuciones verticales de la cartilla que están en uso.
3. Lee la densidad en un anillo interno de cada burbuja A-E, excluyendo las
   letras preimpresas y el borde circular. Se tolera un desplazamiento de hasta
   dos píxeles del centro y se considera marcada una opción cuando la densidad
   alcanza al menos el 70%. Una segunda opción solo se informa como doble cuando
   también supera ese umbral y la diferencia frente a la primera es menor a
   18 puntos; así una letra impresa o un trazo parcial no se convierte en doble
   marca.
4. Busca mediante OCR únicamente el recuadro superior derecho del código estudiantil, en la zona normalizada `x 53%-75%`, `y 9%-14%`; usa ampliación y binarización para tolerar escaneos, y no procesa tipo de examen, N°, materia, grupo, nombre ni los seriales rojos superior e inferior.
5. Acepta el resultado solo si el código pertenece a `sea_mapeo_estudiantes_variantes` del rol seleccionado.
6. Recupera internamente el patrón de la variante asignada, califica y persiste en `sea_calificaciones_omr`.

Un código no reconocido no se asigna por posición, orden de página ni datos de ejemplo: queda como `REVISION_MANUAL` y no crea una calificación en la base de datos. Si el OCR detecta dígitos pero no están en el rol seleccionado, la interfaz lo informa como **código fuera del rol**; se debe seleccionar la evaluación cuya nómina contiene ese código.

### API de procesamiento

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/omr/{rolId}/procesar` | Encola un PDF o imagen escaneada (`multipart/form-data`, campo `file`). |
| GET | `/api/omr/jobs/{jobId}` | Consulta `EN_COLA`, `COMPLETADO` o `ERROR` y las lecturas por página. |

La pantalla **Calificación Óptica OMR** debe seleccionar primero un rol con variantes generadas, cargar el escaneo y ejecutar el procesamiento. La modalidad del rol no limita el acceso al lector: también pueden calificarse roles creados como `PRESENCIAL_SIN_CARTILLA`, porque la cartilla física ya se administra como material preimpreso independiente. Los datos mostrados salen del resultado del worker; no se utiliza `localStorage` ni una nómina ficticia para completar códigos, nombres o notas.

Al terminar el procesamiento, la pantalla presenta todas las páginas devueltas por el worker en una inspección independiente. Cada página muestra su imagen escaneada, si el código fue reconocido dentro de la nómina oficial, si se detectó el cuadro principal de respuestas y cuántas marcas fueron leídas. Una página sin código válido permanece en revisión manual y no se asigna a un estudiante por el orden del PDF.

La guía de alineación visual utiliza por defecto la geometría del escaneo de referencia: grilla principal aproximada en `top 16,9 %`, `left 1,1 %`, `width 73,2 %`, `height 42,7 %`; el recuadro exclusivo de código `top 9 %`, `left 53 %`, `width 22 %`, `height 5 %` se resalta por separado para verificarlo antes de procesar.

### Condiciones del escaneo

- La primera cara completa de la cartilla debe estar dentro de la imagen; el talón puede permanecer visible porque se descarta por geometría.
- El código estudiantil debe estar preimpreso en la zona de identificación y pertenecer a la nómina del rol.
- El archivo de referencia `img20260829_15254285.pdf` es válido para calibrar geometría, pero al estar vacío y no contener un código estudiantil del rol debe terminar en `REVISION_MANUAL`.
- Las respuestas devueltas por el lector incluyen densidades por burbuja para auditoría; la clave interna no se imprime en la cartilla ni se expone durante la lectura.

## Límite conocido y siguiente iteración

La sobreimpresión usa la página A4 del documento de referencia y las coordenadas X/Y ajustadas para las tres casillas: datos `250,90`, código `315,90` con 10 puntos adicionales hacia la izquierda, y nombre `250,120`. El código del estudiante se imprime a 22 pt y el nombre completo a 10.5 pt. Antes de usarla para impresión masiva se debe hacer una prueba física con una hoja preimpresa y ajustar el desplazamiento fino de impresora si fuera necesario; ese ajuste no cambia las tablas, la API ni el flujo de impresión.
