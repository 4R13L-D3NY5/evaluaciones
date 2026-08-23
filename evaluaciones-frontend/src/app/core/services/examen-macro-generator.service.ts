import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface OpcionPregunta {
  letra: 'A' | 'B' | 'C' | 'D' | 'E';
  texto: string;
  esCorrecta: boolean;
}

export interface ReactivoExamen {
  id: number;
  numero: number;
  tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA';
  enunciado: string;
  formulaLatex?: string;
  dificultad: 'Fácil' | 'Medio' | 'Difícil';
  grupoTipo: 'G1' | 'G2' | 'G3';
  opciones: OpcionPregunta[];
  opcionCorrectaOriginal: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface VarianteCompilada {
  tipo: 'TIPO A' | 'TIPO B' | 'TIPO C' | 'TIPO D' | 'TIPO E';
  letraVariante: 'A' | 'B' | 'C' | 'D' | 'E';
  semilla: number;
  paginaInicio: number;
  totalPaginas: number;
  todasLasPreguntas: ReactivoExamen[];
  preguntasPagina1: ReactivoExamen[]; // 1 a 10
  preguntasPagina2: ReactivoExamen[]; // 11 a 22
  preguntasPagina3: ReactivoExamen[]; // 23 a 34
  preguntasPagina4: ReactivoExamen[]; // 35 a 46
  preguntasPagina5: ReactivoExamen[]; // 47 a 60
  patronClaves: { [numeroPregunta: number]: 'A' | 'B' | 'C' | 'D' | 'E' };
}

@Injectable({
  providedIn: 'root'
})
export class ExamenMacroGeneratorService {

  // Banco Base de 60 Reactivos Oficiales UNITEPC (Todas con 5 incisos: A, B, C, D, E)
  private readonly _banco60Reactivos: Omit<ReactivoExamen, 'numero'>[] = [
    {
      id: 1,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'En la determinación de la base imponible del Impuesto sobre las Utilidades de las Empresas (IUE), los gastos no deducibles corresponden a:',
      dificultad: 'Fácil',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'B',
      opciones: [
        { letra: 'A', texto: 'Gastos vinculados directamente con la actividad gravada', esCorrecta: false },
        { letra: 'B', texto: 'Gastos personales de los socios o sin respaldo de factura legal', esCorrecta: true },
        { letra: 'C', texto: 'Depreciaciones conforme a la tabla del D.S. 24051', esCorrecta: false },
        { letra: 'D', texto: 'Aportes patronales y beneficios sociales devengados', esCorrecta: false },
        { letra: 'E', texto: 'Intereses bancarios por préstamos destinados al giro del negocio', esCorrecta: false }
      ]
    },
    {
      id: 2,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de control, investigación y fiscalización de la Administración Tributaria es de:',
      dificultad: 'Fácil',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'E',
      opciones: [
        { letra: 'A', texto: '2 años calendario continuos', esCorrecta: false },
        { letra: 'B', texto: '4 años improrrogables', esCorrecta: false },
        { letra: 'C', texto: '5 años para personas naturales únicamente', esCorrecta: false },
        { letra: 'D', texto: '20 años en materia de contravenciones', esCorrecta: false },
        { letra: 'E', texto: '8 años para tributos de periodicidad anual y contravenciones', esCorrecta: true }
      ]
    },
    {
      id: 3,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe cumplir obligatoriamente con:',
      dificultad: 'Medio',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'E',
      opciones: [
        { letra: 'A', texto: 'Haber sido emitido exclusivamente en moneda extranjera', esCorrecta: false },
        { letra: 'B', texto: 'Ser cancelado únicamente en efectivo al momento de la entrega', esCorrecta: false },
        { letra: 'C', texto: 'Contar con autorización de la Jefatura Departamental de Trabajo', esCorrecta: false },
        { letra: 'D', texto: 'Tener una antigüedad mayor a 180 días desde su emisión', esCorrecta: false },
        { letra: 'E', texto: 'Estar vinculado a la actividad gravada, emitido a nombre y NIT del sujeto pasivo y respaldado fehacientemente', esCorrecta: true }
      ]
    },
    {
      id: 4,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'En una auditoría tributaria, la técnica de confirmación de saldos con terceros permite verificar principalmente el objetivo de:',
      dificultad: 'Fácil',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'D',
      opciones: [
        { letra: 'A', texto: 'Capacidad de pago futura de la entidad', esCorrecta: false },
        { letra: 'B', texto: 'Estructura societaria y tenencia accionaria', esCorrecta: false },
        { letra: 'C', texto: 'Cálculo de coeficientes de solvencia', esCorrecta: false },
        { letra: 'D', texto: 'Existencia, integridad y exactitud de las cuentas por cobrar y pagar comerciales', esCorrecta: true },
        { letra: 'E', texto: 'Depreciación acumulada de activos fijos intangibles', esCorrecta: false }
      ]
    },
    {
      id: 5,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'El método de determinación de la base imponible sobre base presunta procede cuando:',
      dificultad: 'Difícil',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'C',
      opciones: [
        { letra: 'A', texto: 'El contribuyente presenta todos sus libros de compras y ventas debidamente notariados', esCorrecta: false },
        { letra: 'B', texto: 'Se cuenta con estados financieros auditados con dictamen limpio', esCorrecta: false },
        { letra: 'C', texto: 'El sujeto pasivo no presenta libros contables ni documentación fidedigna que permita conocer los hechos imponibles', esCorrecta: true },
        { letra: 'D', texto: 'Las ventas declaradas superan los límites del Régimen Simplificado', esCorrecta: false },
        { letra: 'E', texto: 'Se solicita una prórroga ordinaria para el pago de la deuda tributaria', esCorrecta: false }
      ]
    },
    {
      id: 6,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'La alícuota general del Impuesto a las Transacciones (IT) establecida en la Ley 843 es del:',
      dificultad: 'Fácil',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'A',
      opciones: [
        { letra: 'A', texto: '3% sobre los ingresos brutos devengados o percibidos', esCorrecta: true },
        { letra: 'B', texto: '13% sobre el valor neto de la factura', esCorrecta: false },
        { letra: 'C', texto: '25% sobre la utilidad neta imponible', esCorrecta: false },
        { letra: 'D', texto: '1.5% sobre transacciones financieras en moneda nacional', esCorrecta: false },
        { letra: 'E', texto: '0.30% aplicable al débito y crédito bancario', esCorrecta: false }
      ]
    },
    {
      id: 7,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'Las compensaciones del IUE pagado efectivamente contra el Impuesto a las Transacciones (IT) operan:',
      dificultad: 'Medio',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'D',
      opciones: [
        { letra: 'A', texto: 'De forma retroactiva a los períodos del año anterior', esCorrecta: false },
        { letra: 'B', texto: 'Únicamente contra el Impuesto al Valor Agregado (IVA)', esCorrecta: false },
        { letra: 'C', texto: 'Hasta un máximo del 50% de la utilidad bruta', esCorrecta: false },
        { letra: 'D', texto: 'A partir del mes siguiente al pago del IUE hasta su total agotamiento o nuevo vencimiento', esCorrecta: true },
        { letra: 'E', texto: 'Exclusivamente en empresas del sector minero y petrolero', esCorrecta: false }
      ]
    },
    {
      id: 8,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'En el examen de pasivos tributarios, la omisión de pago se configura cuando:',
      dificultad: 'Fácil',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'B',
      opciones: [
        { letra: 'A', texto: 'El contribuyente presenta su declaración jurada y cancela el importe total en fecha', esCorrecta: false },
        { letra: 'B', texto: 'El sujeto pasivo, por acción u omisión, no paga el tributo dentro de los plazos legales', esCorrecta: true },
        { letra: 'C', texto: 'Se solicita una facilidad de pago antes del vencimiento', esCorrecta: false },
        { letra: 'D', texto: 'Se efectúa una rectificatoria a favor del fisco con pago inmediato', esCorrecta: false },
        { letra: 'E', texto: 'La empresa realiza ventas exentas debidamente autorizadas', esCorrecta: false }
      ]
    },
    {
      id: 9,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'La bancarización obligatoria según normativa tributaria vigente aplica a operaciones de compra o venta de bienes y servicios cuyo importe sea igual o superior a:',
      dificultad: 'Fácil',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'C',
      opciones: [
        { letra: 'A', texto: 'Bs. 10.000 (Diez mil bolivianos)', esCorrecta: false },
        { letra: 'B', texto: 'Bs. 25.000 (Veinticinco mil bolivianos)', esCorrecta: false },
        { letra: 'C', texto: 'Bs. 50.000 (Cincuenta mil bolivianos)', esCorrecta: true },
        { letra: 'D', texto: 'Bs. 100.000 (Cien mil bolivianos)', esCorrecta: false },
        { letra: 'E', texto: 'Bs. 200.000 (Doscientos mil bolivianos)', esCorrecta: false }
      ]
    },
    {
      id: 10,
      tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
      enunciado: 'El Régimen Complementario al Impuesto al Valor Agregado (RC-IVA) para dependientes permite el descargo mediante presentación del Formulario 110 con facturas de antigüedad no mayor a:',
      dificultad: 'Fácil',
      grupoTipo: 'G2',
      opcionCorrectaOriginal: 'D',
      opciones: [
        { letra: 'A', texto: '30 días calendario anteriores a la fecha de presentación', esCorrecta: false },
        { letra: 'B', texto: '60 días corridos desde su emisión', esCorrecta: false },
        { letra: 'C', texto: '90 días exclusivamente para gastos médicos', esCorrecta: false },
        { letra: 'D', texto: '120 días calendario anteriores al día de presentación del formulario', esCorrecta: true },
        { letra: 'E', texto: '365 días del ejercicio fiscal correspondiente', esCorrecta: false }
      ]
    }
  ];

  constructor() {
    this._completarBancoHasta60();
  }

  private _completarBancoHasta60(): void {
    const temas = [
      'la auditoría de activos fijos y su revalúo técnico tributario',
      'las retenciones tributarias del IUE e IT por servicios de personas no inscritas',
      'la determinación del Débito Fiscal IVA en notas de crédito/débito',
      'el tratamiento tributario de las pérdidas no compensadas del IUE',
      'los precios de transferencia y operaciones entre partes vinculadas',
      'el Impuesto a las Salidas Aéreas al Exterior (ISAE)',
      'el Impuesto Especial a los Hidrocarburos y sus Derivados (IEHD)',
      'el procedimiento de Determinación de Oficio y la Vista de Cargo',
      'el Recurso de Alzada ante la Autoridad de Impugnación Tributaria (AIT)',
      'la clausura por no emisión de factura o documento equivalente',
      'el Régimen Tributario Simplificado y sus límites de capital y ventas',
      'el Sistema de Facturación Electrónica en Línea y sus modalidades',
      'el cómputo del mantenimiento de valor en UFV según Código Tributario',
      'la auditoría tributaria preventiva y la matriz de riesgos impositivos',
      'el tratamiento contable-tributario del arrendamiento financiero (Leasing)',
      'las provisiones y previsiones deducibles para incobrabilidad',
      'los inventarios físicos y las mermas o desmedros justificados',
      'la responsabilidad solidaria de los administradores y directores',
      'el pago indebido o en exceso y la Acción de Repetición',
      'las multas por Incumplimiento a Deberes Formales (IDF)',
      'la fiscalización integral y la fiscalización puntual externa',
      'el tratamiento impositivo de dividendos y remesas al exterior',
      'el Impuesto a los Consumos Específicos (ICE) en bebidas alcohólicas',
      'la calificación de la conducta tributaria: omisión de pago vs defraudación',
      'las pruebas periciales en procesos contenciosos tributarios',
      'la conciliación tributaria en el dictamen sobre la información tributaria complementaria',
      'la validez de la firma digital en documentos tributarios electrónicos',
      'la exclusión de crédito fiscal por compras en zonas francas o exentas',
      'el devengamiento de intereses moratorios a favor de la Administración Tributaria',
      'el procedimiento de cobro coactivo y las medidas precautorias',
      'la prescripción de sanciones pecuniarias por contravenciones',
      'la deducibilidad de donaciones a entidades sin fines de lucro autorizadas',
      'el cálculo de la alícuota adicional del IUE para entidades financieras (AA-IUE)',
      'las fiscalizaciones electrónicas y cruces masivos de información',
      'el Registro de Compras y Ventas (RCV) y los plazos de confirmación',
      'el Libro de Ventas Menores del día para comerciantes minoristas',
      'las exenciones tributarias a colegios, universidades y entidades educativas',
      'el tratamiento impositivo de las cooperativas mineras y de servicios',
      'la auditoría de ingresos extraordinarios y ganancias por diferencia de cambio',
      'la deducibilidad de sueldos pagados al cónyuge o parientes del dueño',
      'la determinación de la tasa efectiva de tributación (TET)',
      'el informe de procedimientos acordados en auditoría fiscal',
      'las diferencias temporales y permanentes en la Norma Contable 6 y D.S. 24051',
      'el valor probatorio de los libros de contabilidad manuales vs electrónicos',
      'la verificación del cumplimiento de la Ley 843 y decretos reglamentarios',
      'el acta de recepción final de la fiscalización tributaria',
      'la resolución determinativa y sus requisitos de validez legal',
      'el recurso jerárquico ante la Autoridad General de Impugnación Tributaria (AGIT)',
      'el régimen de incentivos tributarios para la industrialización y exportaciones',
      'el acta de custodia de cuadernillos y exámenes de evaluación institucional'
    ];

    for (let i = 11; i <= 60; i++) {
      const tema = temas[(i - 11) % temas.length];
      const letrasCorrectas: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
      const correcta = letrasCorrectas[(i * 3) % 5];

      this._banco60Reactivos.push({
        id: i,
        tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
        enunciado: `En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a ${tema}, señale el criterio técnico y legal correcto:`,
        dificultad: i % 3 === 0 ? 'Difícil' : (i % 2 === 0 ? 'Medio' : 'Fácil'),
        grupoTipo: 'G2',
        opcionCorrectaOriginal: correcta,
        opciones: [
          { letra: 'A', texto: `El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051`, esCorrecta: correcta === 'A' },
          { letra: 'B', texto: `Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio fiscal`, esCorrecta: correcta === 'B' },
          { letra: 'C', texto: `Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa`, esCorrecta: correcta === 'C' },
          { letra: 'D', texto: `Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo`, esCorrecta: correcta === 'D' },
          { letra: 'E', texto: `Aplica la alícuota general con respaldo en extractos bancarios y comprobantes de diario debidamente foliados`, esCorrecta: correcta === 'E' }
        ]
      });
    }
  }

  /**
   * Genera el conjunto completo de variantes (A, B, C, D, E) con 60 reactivos de 5 opciones cada uno
   */
  public generarVariantesCompletas(cantidadVariantes: number = 3): VarianteCompilada[] {
    const tipos: ('TIPO A' | 'TIPO B' | 'TIPO C' | 'TIPO D' | 'TIPO E')[] = [
      'TIPO A', 'TIPO B', 'TIPO C', 'TIPO D', 'TIPO E'
    ];
    const letras: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

    const variantesResult: VarianteCompilada[] = [];
    let cursorPagina = 1;
    const paginasPorVariante = 5;

    for (let v = 0; v < Math.min(cantidadVariantes, 5); v++) {
      const tipo = tipos[v];
      const letraVar = letras[v];
      const semilla = (v + 1) * 53;

      // Permutar los 60 reactivos
      const bancoMezclado = this._permutarArray([...this._banco60Reactivos], semilla);
      const patronClaves: { [numeroPregunta: number]: 'A' | 'B' | 'C' | 'D' | 'E' } = {};

      const todasLasPreguntas: ReactivoExamen[] = bancoMezclado.map((base, idx) => {
        const num = idx + 1;
        const seedOp = semilla + num * 19;
        const opcionesMezcladas = this._permutarArray([...base.opciones], seedOp);
        
        const letrasOpciones: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
        let letraCorrecta: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';

        const opcionesFinales: OpcionPregunta[] = opcionesMezcladas.map((op, opIdx) => {
          const l = letrasOpciones[opIdx];
          if (op.esCorrecta) {
            letraCorrecta = l;
          }
          return {
            letra: l,
            texto: op.texto,
            esCorrecta: op.esCorrecta
          };
        });

        patronClaves[num] = letraCorrecta;

        return {
          id: base.id,
          numero: num,
          tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA',
          enunciado: base.enunciado,
          formulaLatex: base.formulaLatex,
          dificultad: base.dificultad,
          grupoTipo: base.grupoTipo,
          opcionCorrectaOriginal: letraCorrecta,
          opciones: opcionesFinales
        };
      });

      const paginaInicio = cursorPagina;
      cursorPagina += paginasPorVariante;

      variantesResult.push({
        tipo,
        letraVariante: letraVar,
        semilla,
        paginaInicio,
        totalPaginas: paginasPorVariante,
        todasLasPreguntas,
        preguntasPagina1: todasLasPreguntas.slice(0, 10),  // 1 a 10 (Hoja 1 con cartilla 15%)
        preguntasPagina2: todasLasPreguntas.slice(10, 22), // 11 a 22 (Hoja 2)
        preguntasPagina3: todasLasPreguntas.slice(22, 34), // 23 a 34 (Hoja 3)
        preguntasPagina4: todasLasPreguntas.slice(34, 46), // 35 a 46 (Hoja 4)
        preguntasPagina5: todasLasPreguntas.slice(46, 60), // 47 a 60 (Hoja 5)
        patronClaves
      });
    }

    return variantesResult;
  }

  /**
   * Exporta la matriz de patrones oficial en formato Remark OMR Excel (.xlsx)
   */
  public exportarRemarkExcel(codigoAsignatura: string, variantes: VarianteCompilada[]): void {
    const headers = ['Codigo', 'Variante', 'ID_Pregunta'];
    for (let i = 1; i <= 60; i++) {
      headers.push(`P${i}`);
    }

    const data: any[][] = [headers];

    for (const v of variantes) {
      const row: any[] = [codigoAsignatura, v.letraVariante, 'Respuesta'];
      for (let i = 1; i <= 60; i++) {
        row.push(v.patronClaves[i] || 'A');
      }
      data.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patrones_OMR_60');

    const fileName = `${codigoAsignatura}_Patron_OMR_60_Preguntas.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  private _permutarArray<T>(array: T[], seed: number): T[] {
    let s = seed;
    const random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
