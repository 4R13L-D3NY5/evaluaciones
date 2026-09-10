import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const templatePath = 'C:/Users/S1ST3M4S/XpertiFlow/projects/evaluaciones/bases/formato_banco_preguntas_asig_EF.xlsx';
const outputDir = 'C:/Users/S1ST3M4S/XpertiFlow/projects/evaluaciones/outputs/examen-10-por-tipo-20260909-1p';
const outputPath = `${outputDir}/examen-10-preguntas-por-tipo.xlsx`;

const TYPES = {
  simple: 'Verdadero o Falso Simple',
  complex: 'Verdadero o Falso Complejas',
  premises: 'Respuesta A/B/Ambas/Ninguna',
  best: 'Selección de la mejor respuesta',
  caseMother: 'Ítems agrupados por caso clínico o problema',
  caseChild: 'Subítem de caso o problema',
  matchMother: 'Emparejamiento Ampliado',
  matchChild: 'Opción de Emparejamiento Ampliado',
};

const rows = [];
const partial = '1P';
const add = (row) => rows.push(row);

const simpleQuestions = [
  ['La memoria RAM almacena temporalmente los datos que están siendo utilizados por los programas.', 'A', 1],
  ['El protocolo HTTPS cifra la comunicación entre el navegador y el servidor mediante TLS.', 'A', 1],
  ['Una dirección IP identifica de forma lógica una interfaz dentro de una red.', 'A', 1],
  ['El sistema operativo administra los recursos de hardware y ofrece servicios a las aplicaciones.', 'A', 1],
  ['El lenguaje HTML es un lenguaje de marcado utilizado para estructurar páginas web.', 'A', 1],
  ['Un archivo con extensión .jpg normalmente contiene una imagen comprimida.', 'A', 1],
  ['La autenticación multifactor utiliza más de una evidencia para verificar la identidad.', 'A', 1],
  ['Una copia de seguridad permite recuperar información después de una pérdida o daño.', 'A', 1],
  ['El algoritmo de búsqueda binaria puede aplicarse directamente a una lista desordenada sin ninguna condición adicional.', 'B', 1],
  ['El protocolo FTP cifra por defecto todas las credenciales y contenidos que transmite.', 'B', 1],
];
simpleQuestions.forEach(([enunciado, respuesta, dificultad], i) => add({ tipo: TYPES.simple, grupo: null, enunciado, respuesta, dificultad, partial, opcionE: null, kind: 'simple', id: i + 1 }));

const complexQuestions = [
  ['Analiza las siguientes afirmaciones sobre redes de computadoras.', ['1. Un switch conecta dispositivos dentro de una red local.', '2. Un router puede interconectar redes diferentes.', '3. DNS traduce nombres de dominio a direcciones IP.', '4. DHCP asigna automáticamente direcciones IP a los equipos.'], 'E', 2],
  ['Analiza las siguientes afirmaciones sobre bases de datos.', ['1. Una clave primaria identifica de forma única cada fila.', '2. Una clave foránea puede establecer una relación entre tablas.', '3. La normalización ayuda a reducir redundancias.', '4. Un índice siempre elimina la necesidad de una clave primaria.'], 'A', 2],
  ['Analiza las siguientes afirmaciones sobre seguridad informática.', ['1. El phishing intenta engañar al usuario para obtener información.', '2. El principio de mínimo privilegio limita los permisos al nivel necesario.', '3. Una contraseña larga y única mejora la seguridad.', '4. Compartir credenciales por correo es una práctica recomendada.'], 'A', 2],
  ['Analiza las siguientes afirmaciones sobre desarrollo de software.', ['1. Las pruebas unitarias verifican unidades pequeñas de código.', '2. El control de versiones permite registrar cambios del proyecto.', '3. La integración continua automatiza comprobaciones frecuentes.', '4. La documentación técnica carece de utilidad cuando el software funciona.'], 'A', 2],
  ['Analiza las siguientes afirmaciones sobre sistemas operativos.', ['1. Un proceso es un programa en ejecución.', '2. La memoria virtual puede utilizar almacenamiento secundario.', '3. El planificador decide qué proceso obtiene tiempo de CPU.', '4. Un sistema operativo no administra dispositivos periféricos.'], 'A', 2],
  ['Analiza las siguientes afirmaciones sobre programación.', ['1. Una variable puede almacenar un valor que cambia durante la ejecución.', '2. Un bucle repite instrucciones mientras se cumple una condición.', '3. Una función puede encapsular una operación reutilizable.', '4. Un comentario siempre se ejecuta como una instrucción del programa.'], 'A', 2],
  ['Analiza las siguientes afirmaciones sobre servicios web.', ['1. Una API define una forma de comunicación entre componentes.', '2. JSON es un formato de intercambio de datos ampliamente utilizado.', '3. Un código HTTP 404 indica que el recurso no fue encontrado.', '4. Todo servicio web debe responder únicamente con imágenes.'], 'A', 2],
  ['Analiza las siguientes afirmaciones sobre almacenamiento de datos.', ['1. Un SSD no utiliza platos magnéticos giratorios como un HDD tradicional.', '2. La redundancia puede mejorar la disponibilidad de la información.', '3. El cifrado protege los datos frente a accesos no autorizados.', '4. El almacenamiento en la nube elimina toda responsabilidad de respaldo.'], 'A', 2],
  ['Analiza las siguientes afirmaciones sobre gestión de proyectos.', ['1. Un requisito describe una necesidad o condición del sistema.', '2. Un riesgo es un evento incierto que puede afectar los objetivos.', '3. Un entregable es un resultado verificable del proyecto.', '4. Un cronograma no necesita fechas ni responsables.'], 'A', 2],
  ['Analiza las siguientes afirmaciones sobre calidad de software.', ['1. Una prueba de regresión verifica que cambios recientes no rompan funciones existentes.', '2. La mantenibilidad se relaciona con la facilidad de modificar el software.', '3. La usabilidad considera la facilidad de uso para la persona usuaria.', '4. Un defecto no necesita registrarse si el programa compila.'], 'A', 2],
];
complexQuestions.forEach(([enunciado, proposiciones, respuesta, dificultad], i) => add({ tipo: TYPES.complex, grupo: null, enunciado, proposiciones, respuesta, dificultad, partial, kind: 'complex', id: i + 1 }));

const premiseQuestions = [
  ['I. La autenticación verifica la identidad de una persona usuaria.\nII. La autorización determina qué acciones puede realizar después de autenticarse.', 'C', 2],
  ['I. Un índice puede acelerar ciertas consultas sobre una tabla.\nII. Un índice elimina físicamente las filas que no participan en la consulta.', 'A', 2],
  ['I. La compresión reduce el tamaño de algunos archivos.\nII. La compresión siempre mejora la calidad visual de una imagen con pérdida.', 'A', 2],
  ['I. Una transacción agrupa operaciones que deben mantener una unidad lógica.\nII. El aislamiento ayuda a controlar la interacción entre transacciones concurrentes.', 'C', 2],
  ['I. Un firewall puede filtrar tráfico según reglas configuradas.\nII. Un firewall sustituye todas las medidas de seguridad de una organización.', 'A', 2],
  ['I. Una clase puede definir atributos y métodos.\nII. La herencia permite reutilizar características de otra clase.', 'C', 2],
  ['I. Una dirección MAC se asigna a una interfaz de red.\nII. Una dirección MAC es exactamente igual que una dirección IP y cumple la misma función.', 'A', 2],
  ['I. La latencia mide el tiempo que tarda en llegar una respuesta.\nII. El ancho de banda representa la capacidad de transmisión de datos.', 'C', 2],
  ['I. Un requisito funcional describe una función que el sistema debe realizar.\nII. Un requisito no funcional describe una restricción o atributo de calidad.', 'C', 2],
  ['I. El respaldo incremental copia todos los datos cada vez.\nII. El respaldo completo copia el conjunto seleccionado de datos.', 'B', 2],
];
premiseQuestions.forEach(([enunciado, respuesta, dificultad], i) => add({ tipo: TYPES.premises, grupo: null, enunciado, respuesta, dificultad, partial, opcionE: null, kind: 'premises', id: i + 1 }));

const bestQuestions = [
  ['¿Cuál es la medida más adecuada para proteger una cuenta institucional?', ['Usar la misma contraseña en todos los servicios', 'Compartir la contraseña con el equipo', 'Usar una contraseña única y activar MFA', 'Guardar la contraseña en un archivo público', 'Desactivar las alertas de inicio de sesión'], 'C', 1],
  ['¿Qué estructura de datos representa mejor una cola de atención?', ['LIFO', 'FIFO', 'Acceso aleatorio sin orden', 'Árbol binario obligatorio', 'Tabla hash sin claves'], 'B', 1],
  ['¿Cuál es el propósito principal de una clave primaria?', ['Permitir valores duplicados', 'Identificar de manera única cada registro', 'Ordenar siempre por fecha', 'Almacenar archivos multimedia', 'Reemplazar todas las claves foráneas'], 'B', 1],
  ['¿Qué respuesta HTTP indica normalmente que una solicitud fue procesada correctamente?', ['Código HTTP 200', 'Código HTTP 301', 'Código HTTP 404', 'Código HTTP 500', 'Código HTTP 503'], 'A', 1],
  ['¿Qué práctica reduce mejor el riesgo de perder cambios de código?', ['Editar directamente en producción', 'Eliminar el historial', 'Usar control de versiones y revisiones', 'Compartir una única carpeta sin permisos', 'Evitar pruebas automatizadas'], 'C', 1],
  ['¿Qué mecanismo permite separar una red en segmentos lógicos?', ['VLAN', 'JPEG', 'SMTP', 'CSS', 'CSV'], 'A', 2],
  ['¿Qué propiedad asegura que una transacción se complete totalmente o no produzca cambios parciales?', ['Atomicidad', 'Latencia', 'Portabilidad', 'Compresión', 'Herencia'], 'A', 2],
  ['¿Qué enfoque es más apropiado para detectar vulnerabilidades antes de publicar una aplicación?', ['Omitir las pruebas hasta después del incidente', 'Combinar revisión de código, pruebas y análisis de seguridad', 'Usar únicamente colores de interfaz', 'Eliminar los registros de auditoría', 'Permitir permisos administrativos a todo usuario'], 'B', 2],
  ['¿Cuál es la mejor estrategia para una recuperación ante ransomware?', ['Pagar siempre sin analizar el incidente', 'Mantener respaldos aislados y probar su restauración', 'Desactivar todos los respaldos', 'Guardar el único respaldo en el mismo equipo', 'Publicar las credenciales de recuperación'], 'B', 3],
  ['¿Qué decisión mejora más la escalabilidad de un servicio con muchas lecturas repetidas?', ['Agregar caché con una política de invalidación definida', 'Duplicar contraseñas en el código', 'Eliminar los identificadores', 'Deshabilitar el monitoreo', 'Guardar todas las respuestas en logs sin límite'], 'A', 3],
];
bestQuestions.forEach(([enunciado, opciones, respuesta, dificultad], i) => add({ tipo: TYPES.best, grupo: null, enunciado, opciones, respuesta, dificultad, partial, kind: 'options', id: i + 1 }));

add({ tipo: TYPES.caseMother, grupo: 'CASO-VERIF-01', enunciado: 'Caso práctico: una institución debe publicar un sistema de evaluaciones. El equipo necesita proteger las cuentas, mantener trazabilidad de los cambios y asegurar que el servicio pueda recuperarse ante fallas. Se solicita analizar las decisiones técnicas más apropiadas para este escenario.', respuesta: null, dificultad: null, partial, kind: 'caseMother' });
const caseQuestions = [
  ['¿Qué control debe priorizarse para reducir accesos indebidos a las cuentas?', ['Contraseñas compartidas', 'Autenticación multifactor y permisos mínimos', 'Usuarios administradores para todos', 'Desactivar la expiración de sesión', 'Guardar claves en texto plano'], 'B', 2],
  ['¿Qué mecanismo aporta trazabilidad sobre los cambios realizados?', ['Bitácora con actor, fecha y acción', 'Eliminar los registros antiguos inmediatamente', 'Usar solo mensajes informales', 'Deshabilitar los identificadores', 'Registrar únicamente el resultado final'], 'A', 2],
  ['¿Qué práctica protege mejor la recuperación de la base de datos?', ['Un único respaldo local sin pruebas', 'Respaldos periódicos con restauraciones verificadas', 'Copiar datos manualmente sin fecha', 'Guardar el respaldo en la misma carpeta pública', 'No documentar el procedimiento'], 'B', 2],
  ['¿Qué medida ayuda a limitar el impacto de una credencial comprometida?', ['Mínimo privilegio y separación de funciones', 'Permisos globales permanentes', 'Desactivar la bitácora', 'Compartir una cuenta de servicio', 'Usar una sola clave para todos'], 'A', 2],
  ['¿Qué debe hacerse antes de habilitar una nueva versión?', ['Publicarla sin pruebas', 'Validar pruebas, migraciones y plan de reversión', 'Eliminar el ambiente de prueba', 'Cambiar los nombres de los usuarios', 'Omitir la revisión de configuración'], 'B', 2],
  ['¿Qué evidencia permite relacionar una acción con la persona autenticada?', ['El usuario obtenido de la sesión del servidor', 'Un nombre escrito libremente en el formulario', 'El color del botón usado', 'El navegador sin autenticación', 'Un dato enviado sin validación'], 'A', 3],
  ['¿Qué estrategia mejora la disponibilidad del servicio ante la caída de un componente?', ['Eliminar las alertas', 'Definir monitoreo, redundancia y procedimientos de contingencia', 'Concentrar todo en un solo proceso', 'Deshabilitar los tiempos de espera', 'Usar datos sin respaldo'], 'B', 3],
  ['¿Qué principio evita que una cuenta pueda consultar funciones que no necesita?', ['Mínimo privilegio', 'Duplicación de datos', 'Compresión sin pérdida', 'Ordenamiento alfabético', 'Interfaz responsiva'], 'A', 3],
  ['¿Qué acción valida que los respaldos sean realmente utilizables?', ['Comprobar periódicamente la restauración en un entorno controlado', 'Medir solo el tamaño del archivo', 'Renombrar el archivo cada semana', 'Eliminar las copias anteriores', 'Revisar únicamente el icono del respaldo'], 'A', 3],
  ['¿Cuál es la respuesta más adecuada si una alerta indica una sesión expirada?', ['Continuar enviando operaciones con el token vencido', 'Solicitar renovación o nuevo inicio de sesión y explicar el motivo', 'Ocultar la alerta', 'Borrar el perfil', 'Reiniciar la base de datos'], 'B', 3],
];
caseQuestions.forEach(([enunciado, opciones, respuesta, dificultad], i) => add({ tipo: TYPES.caseChild, grupo: 'CASO-VERIF-01', enunciado, opciones, respuesta, dificultad, partial, kind: 'options', id: i + 1 }));

add({ tipo: TYPES.matchMother, grupo: 'EMP-VERIF-01', enunciado: null, opciones: ['Autenticación', 'Autorización', 'Disponibilidad', 'Integridad', 'Confidencialidad'], respuesta: null, dificultad: null, partial, kind: 'matchMother' });
const matchQuestions = [
  ['Proceso para comprobar que una persona es quien dice ser.', 'A', 2],
  ['Definición de las acciones y recursos que una cuenta puede utilizar.', 'B', 2],
  ['Propiedad de un servicio que permanece accesible cuando se necesita.', 'C', 3],
  ['Garantía de que la información no fue alterada sin autorización.', 'D', 3],
  ['Protección de la información frente a revelaciones no autorizadas.', 'E', 3],
  ['Uso de una contraseña, un código o un factor biométrico para validar la identidad.', 'A', 3],
  ['Asignación de permisos para leer, crear o modificar un recurso.', 'B', 3],
  ['Capacidad de continuar operando ante fallas mediante medidas de continuidad.', 'C', 3],
  ['Uso de hash o firmas para detectar modificaciones en un archivo.', 'D', 3],
  ['Cifrado de datos para impedir que terceros no autorizados comprendan su contenido.', 'E', 3],
];
matchQuestions.forEach(([enunciado, respuesta, dificultad], i) => add({ tipo: TYPES.matchChild, grupo: 'EMP-VERIF-01', enunciado, respuesta, dificultad, partial, kind: 'matchChild', id: i + 1 }));

if (rows.length !== 62) throw new Error(`Se esperaban 62 filas con madres y reactivos, se obtuvieron ${rows.length}`);

const input = await FileBlob.load(templatePath);
const wb = await SpreadsheetFile.importXlsx(input);
const sheet = wb.worksheets.getItem('Banco');

// Limpiar únicamente los valores editables de las filas de datos no utilizadas.
sheet.getRange('A64:B121').values = Array.from({ length: 58 }, () => [null, null]);
sheet.getRange('H64:H121').values = Array.from({ length: 58 }, () => [null]);
sheet.getRange('J64:K121').values = Array.from({ length: 58 }, () => [null, null]);

sheet.getRange('A2:A63').values = rows.map((r) => [r.tipo]);
sheet.getRange('B2:B63').values = rows.map((r) => [r.grupo]);
sheet.getRange('K2:K63').values = rows.map((r) => [r.partial]);

// El contenido escrito manualmente se coloca por bloque para conservar las fórmulas oficiales del template.
const writeColumn = (col, rowNumbers, valueFn) => {
  rowNumbers.forEach((rowNumber) => {
    sheet.getRange(`${col}${rowNumber}`).values = [[valueFn(rows[rowNumber - 2])]];
  });
};

const manualEnunciadoRows = rows.map((r, i) => r.kind !== 'matchMother' ? i + 2 : null).filter(Boolean);
writeColumn('C', manualEnunciadoRows, (r) => r.enunciado);

const optionRows = rows.map((r, i) => (r.kind === 'options' ? i + 2 : null)).filter(Boolean);
optionRows.forEach((rowNumber) => {
  const r = rows[rowNumber - 2];
  sheet.getRange(`D${rowNumber}:H${rowNumber}`).values = [r.opciones];
});

const complexRows = rows.map((r, i) => (r.kind === 'complex' ? i + 2 : null)).filter(Boolean);
complexRows.forEach((rowNumber) => {
  const r = rows[rowNumber - 2];
  sheet.getRange(`D${rowNumber}:H${rowNumber}`).values = [[...r.proposiciones, null]];
});

const matchMotherRow = rows.findIndex((r) => r.kind === 'matchMother') + 2;
sheet.getRange(`D${matchMotherRow}:H${matchMotherRow}`).values = [rows[matchMotherRow - 2].opciones];

// El template autocompleta V/F simple, premisas y el enunciado madre del emparejamiento.
// Se dejan vacías las columnas deshabilitadas por tipología.
const nullRows = rows.map((r, i) => (['simple', 'premises', 'complex', 'caseMother', 'matchChild'].includes(r.kind) ? i + 2 : null)).filter(Boolean);
nullRows.forEach((rowNumber) => sheet.getRange(`H${rowNumber}`).values = [[null]]);

// Las filas madre de caso y las filas hijas de emparejamiento no llevan opciones.
rows.forEach((r, i) => {
  const rowNumber = i + 2;
  if (r.kind === 'caseMother' || r.kind === 'matchChild') {
    sheet.getRange(`D${rowNumber}:H${rowNumber}`).values = [[null, null, null, null, null]];
  }
});

const directResponseRows = rows.map((r, i) => (r.respuesta != null ? i + 2 : null)).filter(Boolean);
writeColumn('I', directResponseRows, (r) => r.respuesta);
const difficultyRows = rows.map((r, i) => (r.dificultad != null ? i + 2 : null)).filter(Boolean);
writeColumn('J', difficultyRows, (r) => r.dificultad);

// Quitar respuestas/dificultad de filas madre sin borrar las fórmulas de observaciones y validaciones.
[42, 53].forEach((rowNumber) => {
  sheet.getRange(`I${rowNumber}:J${rowNumber}`).values = [[null, null]];
});

// Ajustes mínimos de legibilidad, sin alterar el formato oficial ni sus validaciones.
sheet.getRange('A1:L63').format.verticalAlignment = 'center';
sheet.getRange('C2:C63').format.wrapText = true;
sheet.getRange('D2:H63').format.wrapText = true;
sheet.getRange('A1:L63').format.font = { name: 'Calibri', size: 11 };
sheet.getRange('A1:L63').format.rowHeight = 30;
sheet.getRange('C2:C63').format.rowHeight = 48;
sheet.getRange('D2:H63').format.rowHeight = 48;
sheet.getRange('A1:L1').format.rowHeight = 30;
sheet.freezePanes.freezeRows(1);

wb.recalculate();

const keyCheck = await wb.inspect({
  kind: 'table',
  sheetId: 'Banco',
  range: 'A1:L63',
  include: 'values,formulas',
  tableMaxRows: 63,
  tableMaxCols: 12,
  tableMaxCellChars: 240,
  maxChars: 40000,
});
console.log(keyCheck.ndjson);

const errors = await wb.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 300 },
  summary: 'final formula error scan',
});
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(wb);
await fs.mkdir(outputDir, { recursive: true });
await output.save(outputPath);

const preview = await wb.render({ sheetName: 'Banco', range: 'A1:L20', scale: 1, format: 'png' });
await fs.writeFile(`${outputDir}/preview.png`, new Uint8Array(await preview.arrayBuffer()));

console.log(JSON.stringify({ outputPath, previewPath: `${outputDir}/preview.png`, rows: rows.length }));
