const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function createSampleExcels() {
  const publicDir = path.join(__dirname, 'evaluaciones-frontend', 'public', 'samples');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // =========================================================================
  // 1. ARCHIVO VÁLIDO: 60 PREGUNTAS (15 FÁCILES, 30 MEDIAS, 15 DIFÍCILES)
  // =========================================================================
  const wbValido = new ExcelJS.Workbook();
  wbValido.creator = 'Sistema de Evaluaciones UNITEPC';

  // HOJA 1: Instrucciones
  const wsInst = wbValido.addWorksheet('Instrucciones');
  wsInst.getColumn(1).width = 38;
  wsInst.getColumn(2).width = 85;
  const tRow = wsInst.addRow(['BANCO DE PREGUNTAS - GUÍA OFICIAL']);
  tRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  tRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4527A0' } };
  wsInst.addRow([]);
  wsInst.addRow(['1. CÓDIGOS DE PREGUNTA', 'FALSO_VERDADERO, PREGUNTA_CON_CLAVE, SELECCION_SIMPLE, RESPUESTA_COMPUESTA, PROBLEMA, SUBPROBLEMA, EMPAREJAMIENTO']);
  wsInst.addRow(['2. REGLA DE CUOTAS 2DO PARCIAL', '15 Fáciles (1), 30 Medias (2), 15 Difíciles (3) - Total: 60 preguntas']);

  // HOJA 2: Banco (60 Preguntas Reales)
  const wsBanco = wbValido.addWorksheet('Banco');
  wsBanco.views = [{ state: 'frozen', ySplit: 1 }];
  const headers = ['tipo', 'grupo', 'enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'opcion_e', 'respuesta_correcta', 'dificultad', 'peso', 'observaciones'];
  
  const hRow = wsBanco.addRow(headers);
  hRow.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4527A0' } };
    c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  wsBanco.columns = [
    { width: 24 }, { width: 16 }, { width: 60 }, { width: 25 }, { width: 25 },
    { width: 25 }, { width: 25 }, { width: 25 }, { width: 20 }, { width: 12 },
    { width: 10 }, { width: 28 }
  ];

  // 15 FÁCILES (1)
  const faciles = [
    { tipo: 'FALSO_VERDADERO', grupo: '', enun: 'La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.', a: 'Verdadero', b: 'Falso', c: '', d: '', e: '', r: 'A' },
    { tipo: 'SELECCION_SIMPLE', grupo: '', enun: '¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?', a: 'Control de acceso al medio (MAC) y direccionamiento físico', b: 'Enrutamiento de paquetes', c: 'Cifrado de datos', d: 'Control de sesiones', e: 'Compresión', r: 'A' },
    { tipo: 'FALSO_VERDADERO', grupo: '', enun: 'El protocolo UDP es orientado a la conexión y garantiza la entrega secuencial.', a: 'Verdadero', b: 'Falso', c: '', d: '', e: '', r: 'B' },
    { tipo: 'SELECCION_SIMPLE', grupo: '', enun: '¿Qué longitud de onda se usa comúnmente en la 3ra ventana de telecomunicaciones ópticas?', a: '850 nm', b: '1310 nm', c: '1550 nm', d: '1625 nm', e: '1490 nm', r: 'C' },
    { tipo: 'RESPUESTA_COMPUESTA', grupo: '', enun: 'I. HTTP es un protocolo de capa de aplicación.\nII. DNS traduce nombres de dominio a direcciones IP.', a: 'A. Si la primera es verdadera', b: 'B. Si la segunda es verdadera', c: 'C. Si ambas son verdaderas', d: 'D. Si ninguna es verdadera', e: '', r: 'C' },
    { tipo: 'FALSO_VERDADERO', grupo: '', enun: 'La modulación AM varía la amplitud de la señal portadora manteniendo la frecuencia constante.', a: 'Verdadero', b: 'Falso', c: '', d: '', e: '', r: 'A' },
    { tipo: 'SELECCION_SIMPLE', grupo: '', enun: '¿Cuál es la impedancia característica estándar del cable coaxial RG-6 para TV por cable?', a: '50 Ohmios', b: '75 Ohmios', c: '100 Ohmios', d: '120 Ohmios', e: '300 Ohmios', r: 'B' },
    { tipo: 'PREGUNTA_CON_CLAVE', grupo: '', enun: 'Son medios de transmisión no guiados: 1. Ondas de radio, 2. Microondas, 3. Infrarrojos, 4. Cable STP.', a: '1, 2 y 3 son correctas', b: '1 y 3 son correctas', c: '2 y 4 son correctas', d: 'Solo 4 es correcta', e: 'Todas son correctas', r: 'A' },
    { tipo: 'SELECCION_SIMPLE', grupo: '', enun: '¿Qué tipo de conector se utiliza comúnmente en el cableado de par trenzado UTP Categoría 6?', a: 'RJ-11', b: 'RJ-45', c: 'BNC', d: 'SC/APC', e: 'SMA', r: 'B' },
    { tipo: 'FALSO_VERDADERO', grupo: '', enun: 'El ancho de banda de un canal es independiente de la relación señal a ruido (SNR).', a: 'Verdadero', b: 'Falso', c: '', d: '', e: '', r: 'B' },
    { tipo: 'RESPUESTA_COMPUESTA', grupo: '', enun: 'I. La conmutación de paquetes no requiere un camino físico dedicado.\nII. La conmutación de circuitos reserva ancho de banda.', a: 'A. Si la primera es verdadera', b: 'B. Si la segunda es verdadera', c: 'C. Si ambas son verdaderas', d: 'D. Si ninguna es verdadera', e: '', r: 'C' },
    { tipo: 'SELECCION_SIMPLE', grupo: '', enun: '¿Cuál es la topología de red física más común en redes LAN Ethernet cableadas modernas?', a: 'Bus', b: 'Anillo', c: 'Estrella', d: 'Malla completa', e: 'Árbol invertido', r: 'C' },
    { tipo: 'FALSO_VERDADERO', grupo: '', enun: 'Una dirección MAC tiene una longitud estándar de 48 bits expresada en hexadecimal.', a: 'Verdadero', b: 'Falso', c: '', d: '', e: '', r: 'A' },
    { tipo: 'PREGUNTA_CON_CLAVE', grupo: '', enun: 'Son protocolos de la capa de transporte en la suite TCP/IP: 1. TCP, 2. UDP, 3. SCTP, 4. ICMP.', a: '1, 2 y 3 son correctas', b: '1 y 3 son correctas', c: '2 y 4 son correctas', d: 'Solo 4 es correcta', e: 'Todas son correctas', r: 'A' },
    { tipo: 'SELECCION_SIMPLE', grupo: '', enun: '¿Qué dispositivo de red opera principalmente en la capa 2 del modelo OSI reenviando tramas por MAC?', a: 'Hub pasivo', b: 'Switch', c: 'Repetidor', d: 'Gateway', e: 'Transceptor', r: 'B' }
  ];

  faciles.forEach(p => {
    wsBanco.addRow([p.tipo, p.grupo, p.enun, p.a, p.b, p.c, p.d, p.e, p.r, '1', 5, 'OK']);
  });

  // 30 MEDIAS (2)
  for (let i = 1; i <= 30; i++) {
    const tipos = ['SELECCION_SIMPLE', 'RESPUESTA_COMPUESTA', 'PREGUNTA_CON_CLAVE', 'FALSO_VERDADERO'];
    const t = tipos[(i - 1) % tipos.length];
    if (t === 'FALSO_VERDADERO') {
      wsBanco.addRow([t, '', `Pregunta Media ${i}: En modulaciones QPSK cada símbolo transporta 2 bits de información en cuadratura.`, 'Verdadero', 'Falso', '', '', '', 'A', '2', 5, 'OK']);
    } else if (t === 'RESPUESTA_COMPUESTA') {
      wsBanco.addRow([t, '', `Pregunta Media ${i}: I. El retardo de propagación depende de la distancia física.\nII. El retardo de transmisión depende de la tasa de bits.`, 'A. Si la primera es verdadera', 'B. Si la segunda es verdadera', 'C. Si ambas son verdaderas', 'D. Si ninguna es verdadera', '', 'C', '2', 5, 'OK']);
    } else if (t === 'PREGUNTA_CON_CLAVE') {
      wsBanco.addRow([t, '', `Pregunta Media ${i}: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.`, '1, 2 y 3 son correctas', '1 y 3 son correctas', '2 y 4 son correctas', 'Solo 4 es correcta', 'Todas son correctas', 'A', '2', 5, 'OK']);
    } else {
      wsBanco.addRow([t, '', `Pregunta Media ${i}: ¿Qué algoritmo de enrutamiento utiliza el vector de distancias con el algoritmo Bellman-Ford?`, 'OSPF', 'RIP', 'BGP', 'IS-IS', 'EIGRP', 'B', '2', 5, 'OK']);
    }
  }

  // 15 DIFÍCILES (3)
  for (let i = 1; i <= 15; i++) {
    if (i <= 5) {
      wsBanco.addRow(['PROBLEMA', `CASO-0${i}`, `Problema Difícil ${i}: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: $ FSPL = 20 log(d) + 20 log(f) + 92.45 $`, '112.4 dB', '126.4 dB', '140.2 dB', '98.5 dB', '150.0 dB', 'B', '3', 5, 'OK']);
    } else if (i <= 10) {
      wsBanco.addRow(['SUBPROBLEMA', `CASO-0${i-5}`, `Subproblema ${i}: De acuerdo al cálculo anterior de FSPL, determine la potencia recibida en dBm si la PIRE es 30 dBm y ganancia Rx 20 dBi:`, '-76.4 dBm', '-86.4 dBm', '-96.4 dBm', '-66.4 dBm', '-56.4 dBm', 'A', '3', 5, 'OK']);
    } else {
      wsBanco.addRow(['SELECCION_SIMPLE', '', `Pregunta Difícil ${i}: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:`, '128 Mbps', '106.6 Mbps', '160 Mbps', '80 Mbps', '64 Mbps', 'A', '3', 5, 'OK']);
    }
  }

  // HOJA 3: Ejemplos
  const wsEj = wbValido.addWorksheet('Ejemplos');
  const ejHRow = wsEj.addRow(headers);
  ejHRow.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006064' } };
    c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  wsEj.columns = wsBanco.columns;
  wsEj.addRow(['FALSO_VERDADERO', '', 'El agua hierve a 100 grados Celsius al nivel del mar.', 'Verdadero', 'Falso', '', '', '', 'A', '1', 5, 'OK']);
  wsEj.addRow(['SELECCION_SIMPLE', '', '¿Qué órgano bombea la sangre en el cuerpo humano?', 'Pulmón', 'Hígado', 'Corazón', 'Estómago', 'Riñón', 'C', '2', 5, 'OK']);

  await wbValido.xlsx.writeFile(path.join(publicDir, 'BANCO_PRUEBA_VALIDO_60PREGUNTAS.xlsx'));
  await wbValido.xlsx.writeFile(path.join(__dirname, 'BANCO_PRUEBA_VALIDO_60PREGUNTAS.xlsx'));
  console.log('✅ Archivo 1 Válido Creado: BANCO_PRUEBA_VALIDO_60PREGUNTAS.xlsx');

  // =========================================================================
  // 2. ARCHIVO INVÁLIDO: CON ERRORES DE CUOTAS Y FORMATOS (PARA PRUEBAS)
  // =========================================================================
  const wbInvalido = new ExcelJS.Workbook();
  wbInvalido.creator = 'Sistema de Evaluaciones UNITEPC';

  const wsInstInv = wbInvalido.addWorksheet('Instrucciones');
  wsInstInv.addRow(['BANCO CON ERRORES DE PRUEBA']);

  const wsBancoInv = wbInvalido.addWorksheet('Banco');
  const hRowInv = wsBancoInv.addRow(headers);
  hRowInv.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };
    c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
  });
  wsBancoInv.columns = wsBanco.columns;

  // Solo 20 preguntas (Faltan para llegar a 60) + Errores intencionales
  wsBancoInv.addRow(['FALSO_VERDADERO', '', 'Pregunta con respuesta incorrecta', 'Verdadero', 'Falso', '', '', '', 'C', '1', 5, 'Error: Respuesta debe ser A o B']);
  wsBancoInv.addRow(['SELECCION_SIMPLE', '', '', 'A', 'B', 'C', 'D', 'E', 'A', '1', 5, 'Error: Falta enunciado']);
  wsBancoInv.addRow(['SELECCION_SIMPLE', '', 'Pregunta de selección con pocas opciones', 'Opción 1', 'Opción 2', '', '', '', 'A', '2', 5, 'Error: Requiere al menos 4 opciones']);
  wsBancoInv.addRow(['SUBPROBLEMA', '', 'Subproblema sin grupo de caso padre asignado', 'A', 'B', 'C', 'D', 'E', 'B', '3', 5, 'Error: Falta grupo']);
  wsBancoInv.addRow(['RESPUESTA_COMPUESTA', '', 'I. Premisa uno.\nII. Premisa dos.', 'A', 'B', 'C', 'D', '', 'Z', '2', 5, 'Error: Respuesta debe ser A, B, C o D']);

  for (let i = 6; i <= 25; i++) {
    wsBancoInv.addRow(['SELECCION_SIMPLE', '', `Pregunta de relleno ${i}`, 'Distractor A', 'Distractor B', 'Distractor C', 'Distractor D', 'Distractor E', 'A', '2', 5, 'OK']);
  }

  await wbInvalido.xlsx.writeFile(path.join(publicDir, 'BANCO_PRUEBA_CON_ERRORES.xlsx'));
  await wbInvalido.xlsx.writeFile(path.join(__dirname, 'BANCO_PRUEBA_CON_ERRORES.xlsx'));
  console.log('❌ Archivo 2 Inválido Creado: BANCO_PRUEBA_CON_ERRORES.xlsx');
}

createSampleExcels().catch(console.error);
