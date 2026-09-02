# Módulo de cartillas OMR preimpresas

## Alcance de la primera iteración

El módulo prepara la sobreimpresión de cartillas OMR separada del cuadernillo de examen. La nómina oficial se consulta siempre al abrir la operación y el PDF se genera bajo demanda en memoria, con un estudiante por página A4. No se guarda el PDF ni se crean lotes de cartillas para la impresión normal. El PDF no reproduce la cartilla preimpresa: contiene únicamente los datos operativos que deben caer dentro de sus tres casillas:

- N° correlativo de la impresión.
- Carrera oficial.
- Código de materia.
- Grupo.
- Código del estudiante.
- Nombre completo del estudiante.

La letra de variante no se imprime ni se marca en la cartilla. El sistema mantiene la relación de variante mediante `sea_mapeo_estudiantes_variantes`, resuelta por `rol_examen_id + codigo_estudiante` durante la calificación OMR. En la revisión del escaneo sí se muestra la variante confirmada para que el docente pueda verificar que el patrón aplicado sea el correcto.

## Actores y flujo

1. El administrador genera el examen oficial, lo que persiste el mapeo confidencial estudiante-variante.
2. Desde **Lista de Evaluaciones**, abre el icono de cartillas de un rol previo a `ENTREGADO`.
3. El sistema muestra la nómina oficial y, al pulsar **Imprimir marcas**, genera temporalmente un PDF con un estudiante por página A4 y lo entrega al navegador.
4. El administrador imprime el documento y selecciona **Marcar como impreso**. Solo queda una auditoría mínima de la confirmación; el PDF no queda almacenado.
5. En la futura carga OMR se escanea solamente el cuerpo superior de la cartilla. El talón inferior se conserva para el estudiante y se ignora en la lectura.
6. Si la nómina oficial cambia antes de imprimir, se cierra y se vuelve a abrir la operación para consultar la lista actualizada; al imprimir se genera una nueva copia temporal.

## Reglas de negocio

| Regla | Aplicación |
| --- | --- |
| Precondición | Solo se imprimen marcas para roles habilitados y con nómina oficial disponible; el mapeo estudiante-variante no se imprime. |
| Disponibilidad | Las marcas se pueden generar y gestionar en `PROGRAMADO`, `VALIDADO`, `GENERADO` e `IMPRESO`; desde `ENTREGADO` en adelante quedan bloqueadas. |
| Datos impresos | Carrera, N°, código de materia, grupo, código y nombre completo. |
| Variante | Confidencial e interna; nunca se imprime ni se marca en A-E. |
| Formato | Una sobreimpresión por página A4, alineada con la cartilla de referencia. No se dibuja cartilla ni talón. |
| Coordenadas | Carrera en el campo blanco oficial superior (`190,24`); datos `250,90`, código `315,90` con desplazamiento efectivo de 10 puntos a la izquierda, nombre `250,120`. El código se imprime a 22 pt, la carrera a 6.5 pt y el nombre completo a 10.5 pt. |
| Impresión | El botón **Imprimir marcas** genera el PDF temporalmente en memoria. La confirmación de impresión es una acción explícita y auditable. |
| Persistencia | La impresión normal no guarda el PDF, la nómina ni cartillas temporales. Solo se conserva la auditoría de la confirmación. |
| Flujo de examen | La impresión de cartillas no cambia por sí sola el estado del rol; evita avanzar el examen sin haber realizado las demás tareas de impresión/control. |
| Escaneo | La lectura usa exclusivamente el código preimpreso del estudiante para recuperar la clave correcta; no coteja N°, materia, grupo ni nombre, y el talón inferior no forma parte del área OMR. |

## Modelo de datos

```text
sea_roles_evaluaciones 1 --- N sea_auditoria_evaluaciones (confirmaciones de impresión)
          |
          +--- N sea_mapeo_estudiantes_variantes (clave interna por código)
```

### Entidades

- `sea_lotes_cartillas_omr` y `sea_cartillas_omr`: estructuras históricas de la primera implementación; ya no se utilizan para la impresión temporal normal.
- `sea_auditoria_evaluaciones`: confirmación mínima de impresión, usuario, fecha y cantidad consultada.
- `sea_mapeo_estudiantes_variantes`: asignación confidencial existente. No se duplica la variante en el lote para evitar exposición innecesaria.

Estado operativo de impresión: `PENDIENTE` o `IMPRESO`.

## API

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/roles-examen/{rolId}/cartillas/preparacion` | Consulta la nómina oficial y el estado mínimo de impresión. |
| POST | `/api/roles-examen/{rolId}/cartillas/imprimir` | Genera el PDF en memoria y lo devuelve al navegador; no guarda archivo. |
| POST | `/api/roles-examen/{rolId}/cartillas/marcar-impreso` | Registra la confirmación de impresión en auditoría. |

La confirmación genera un registro en `sea_auditoria_evaluaciones` con la cantidad de estudiantes involucrados; no se registra una ruta de PDF temporal.

## Verificación operativa

1. Generar el examen de un rol y confirmar que existen estudiantes mapeados.
2. Abrir **Lista de Evaluaciones** y seleccionar el icono de cartillas.
3. Verificar que la lista oficial aparezca sin generar un lote y que **Imprimir marcas** devuelva un PDF con un estudiante por página A4, sin cartilla dibujada ni letras A-E de variante.
4. Confirmar que cada fila contiene N°, código de materia, grupo, código y nombre completo.
5. Imprimir desde la ventana del PDF y validar los datos contra la lista oficial.
6. Marcar impreso únicamente después de imprimirlo; revisar que solo quede la auditoría y que no se genere un archivo en `storage/generados`.
7. En la etapa de OMR, validar que el código leído identifica la clave interna y mostrar la variante confirmada únicamente en la inspección de resultados.

## Procesamiento OMR con escaneo real

El lector no reproduce ni redibuja la cartilla institucional. Recibe el PDF o las imágenes generadas por el escáner y trabaja sobre la primera cara completa de cada cartilla. El talón inferior se ignora.

El worker `worker-omr` realiza la primera iteración oficial:

1. Renderiza cada página del PDF o abre la imagen escaneada.
2. Detecta el contorno de la grilla principal de 60 reactivos (tres bloques de 20),
   incluso cuando el PDF A4 conserva margen blanco lateral; no utiliza el borde
   completo de la hoja como área de respuestas.
3. Clasifica automáticamente la presentación como `ESCANEO_FISICO` o
   `PDF_RECORTADO` según cuánto ocupa la grilla en la hoja. La grilla detectada
   se usa como ancla para ubicar también el recuadro del código del estudiante;
   por ello el código no depende de una posición fija del A4.
4. Calibra los 15 centros de opciones y las 20 filas mediante las
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

Al terminar el procesamiento, la pantalla presenta cada página en una fila de dos zonas: a la izquierda la previsualización de la página escaneada y a la derecha la lista de respuestas en dos columnas. Cada pregunta muestra la respuesta leída y su estado (`Correcta`, `Incorrecta`, `Doble`, `Blanco` o `Sin patrón`), además del código detectado, la variante confirmada y los aciertos/notas calculados. La interfaz normaliza las lecturas a incisos `A`–`E` (o combina dos incisos únicamente cuando se detecta doble marca); la clave oficial siempre se trata como un solo inciso. Una página sin código válido permanece en revisión manual y no se asigna a un estudiante por el orden del PDF.

El código se puede escribir manualmente cuando el OCR no lo reconoce. El botón **Validar código y recalibrar** solicita confirmación y coteja el código contra la nómina oficial del grupo; si pertenece al rol, recupera el patrón de su variante, recalcula las respuestas y persiste el resultado. El botón final para pasar a `CALIFICADO` solo se habilita cuando todas las páginas tienen grilla y código validado.

La guía de alineación visual toma la matriz detectada en cada página y deriva desde ella el recuadro exclusivo del código: aproximadamente desde `73 %` del ancho de la matriz, por encima de su borde superior, hasta su extremo derecho. Así la guía se desplaza con la cartilla y no queda fija en el A4 cuando existe margen blanco lateral. Los presets siguen disponibles como respaldo para una página sin contorno recuperable.

### Condiciones del escaneo

- La primera cara completa de la cartilla debe estar dentro de la imagen; el talón puede permanecer visible porque se descarta por geometría.
- El código estudiantil debe estar preimpreso en la zona de identificación y pertenecer a la nómina del rol.
- El archivo de referencia `img20260829_15254285.pdf` es válido para calibrar geometría, pero al estar vacío y no contener un código estudiantil del rol debe terminar en `REVISION_MANUAL`.
- Las respuestas devueltas por el lector incluyen densidades por burbuja y estado por pregunta para auditoría; la clave interna no se imprime en la cartilla. La variante se expone únicamente después de validar el código dentro del rol.

### Configuración de parámetros de lectura

El módulo **Calificación Óptica OMR** incluye el apartado **Parámetros OMR** para consultar y ajustar la calibración sin editar código. La configuración se guarda en `sea_configuracion_omr` y el worker la consulta al iniciar cada procesamiento; por tanto, los cambios aplican a nuevos escaneos y no recalculan automáticamente resultados ya guardados.

| Parámetro | Default | Rango | Efecto |
| --- | ---: | ---: | --- |
| Densidad mínima de marca | 60 | 40–95 | Decide cuándo una burbuja tiene tinta suficiente; se complementa con una separación mínima frente a las demás opciones. |
| Diferencial de doble marca | 18 | 1–50 | Identifica dos opciones cuando sus densidades quedan próximas. |
| Umbral binario de grilla | 185 | 80–240 | Ayuda a localizar el cuadro de respuestas. |
| Nivel de tinta de marca | 120 | 40–220 | Umbral de gris medido dentro del anillo de la burbuja. |
| Zona código X/Y/ancho/alto | 0.70/0.16/0.27/0.06 | 0–1 | Recuadro exclusivo del código estudiantil, normalizado sobre la página. |
| Escala OCR | 3.0 | 1–5 | Ampliación aplicada al código antes de OCR. |
| Búsqueda del centro | 2 px | 0–5 | Vecindad de tolerancia para compensar pequeños desplazamientos. |

La lectura de marcas utiliza un anillo interno alejado del centro tipográfico de la burbuja. Esto evita que las letras preimpresas, especialmente `B` y `D`, se interpreten como respuestas cuando la cartilla está en blanco. El umbral operativo es `60%` y se exige además una diferencia mínima de `10` puntos frente a la segunda opción; así se recuperan marcas claras sin aceptar el ruido parejo de una burbuja vacía. Los valores deben validarse con una cartilla vacía y otra correctamente marcada antes de una aplicación masiva.

API administrativa de la configuración:

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/omr/configuracion` | Consulta los parámetros oficiales vigentes. |
| PUT | `/api/omr/configuracion` | Guarda cambios validados y registra fecha/usuario de actualización. |

Los rangos se validan en el backend para evitar una configuración que inutilice la lectura. La pantalla permite restaurar los defaults en el formulario, pero estos solo se aplican después de presionar **Guardar configuración**.

## Límite conocido y siguiente iteración

La sobreimpresión usa la página A4 del documento de referencia y las coordenadas X/Y ajustadas para las tres casillas: datos `250,90`, código `315,90` con 10 puntos adicionales hacia la izquierda, y nombre `250,120`. El código del estudiante se imprime a 22 pt y el nombre completo a 10.5 pt. Antes de usarla para impresión masiva se debe hacer una prueba física con una hoja preimpresa y ajustar el desplazamiento fino de impresora si fuera necesario; ese ajuste no cambia las tablas, la API ni el flujo de impresión.
