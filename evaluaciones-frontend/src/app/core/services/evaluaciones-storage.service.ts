import { Injectable, signal, computed } from '@angular/core';
import { 
  Sede, 
  Carrera, 
  Asignatura, 
  Docente, 
  RolExamen, 
  EvaluacionConfiguracion, 
  EvaluacionesKpi 
} from '../models/evaluacion.model';

export interface PlanEstudioSemestre {
  numero: number;
  nombre: string;
  horasTotales: number;
  asignaturas: PlanEstudioItem[];
}

export interface DificultadesBanco {
  facil: number;
  medio: number;
  dificil: number;
  total: number;
}

export interface PlanEstudioItem {
  id: number;
  codigo: string;
  nombre: string;
  horas: number;
  docenteNombre: string;
  docenteCi: string;
  grupo: string;
  asignada: boolean;
  esMateriaComun: boolean;
  conCartilla: boolean;
  progresoDoc: number;
  preguntas1P: DificultadesBanco;
  preguntas2P: DificultadesBanco;
  preguntasFinal: DificultadesBanco;
  fecha1P: string;
  fecha2P: string;
  fechaFinal: string;
  estadoExamen1P: 'Subido' | 'Devuelto' | 'Pendiente' | 'Generado';
  estadoExamen2P: 'Subido' | 'Devuelto' | 'Pendiente' | 'Generado';
  estadoExamenFinal: 'Subido' | 'Devuelto' | 'Pendiente' | 'Generado';
}

export type EtapaEvaluacion = 
  | 'Programado' 
  | 'Generado' 
  | 'Impreso' 
  | 'Entregado' 
  | 'Devuelto' 
  | 'Revisado' 
  | 'Subido' 
  | 'Recibido';

export interface BitacoraRegistro {
  estado: EtapaEvaluacion;
  usuario: string;
  fechaHora: string;
  detalle?: string;
}

export interface EventoSeguimiento {
  id: string;
  tipo: 'CAMBIO_ESTADO' | 'RESTABLECIMIENTO' | 'RESTAURACION' | 'GENERACION_TYPST' | 'MODIFICACION';
  estadoAnterior?: EtapaEvaluacion;
  estadoNuevo: EtapaEvaluacion;
  usuario: string;
  cargo?: string;
  fechaHora: string;
  motivo?: string;
  ipPublica?: string;
  macAddress?: string;
  detalles?: string;
}

export interface ParametrizacionExamen {
  duracionMinutos: number;
  toleranciaMinutos: number;
  totalPreguntas: number;
  distribucionDificultad: { facil: number; medio: number; dificil: number };
  mezclarPreguntas: boolean;
  mezclarOpciones: boolean;
  cantidadVariantes: number;
}

export interface GestionEvaluacionItem {
  id: number;
  codigo: string;
  materia: string;
  carrera: string;
  semestre: number;
  grupo: string;
  docente: string;
  parcial: '1er Parcial' | '2do Parcial' | 'Final' | '2da Instancia';
  fecha: string;
  hora: string;
  conCartilla: boolean;
  bancoExcelCargado: boolean;
  nombreArchivoExcel?: string;
  parametrizacion?: ParametrizacionExamen;
  etapa: EtapaEvaluacion;
  bitacora: BitacoraRegistro[];
  documentos: {
    pdfExamen?: boolean;
    patronRespuestas?: boolean;
    cartilla?: boolean;
  };
  variantesGeneradas?: string[];
  
  // Soporte para Reestablecer / Restaurar
  fueRestablecido?: boolean;
  estadoPrevioRestablecimiento?: EtapaEvaluacion;
  fechaRestablecimiento?: string;
  usuarioRestablecimiento?: string;
  motivoRestablecimiento?: string;
  historialSeguimiento?: EventoSeguimiento[];
}

export interface AuditoriaAccesoItem {
  id: string;
  usuarioNombre: string;
  usuarioCi: string;
  usuarioCargo: string;
  campus: string;
  ipPublica: string;
  direccionMac: string;
  nombreEquipo: string;
  fechaHora: string;
  modulo: 'Autenticación' | 'Evaluaciones' | 'Generación Typst' | 'Banco de Preguntas' | 'Administración' | 'Reportes' | 'Seguridad';
  accion: string;
  nivel: 'INFO' | 'ADVERTENCIA' | 'OPERACION_CRITICA';
  navegador: string;
  sistemaOperativo: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluacionesStorageService {
  private readonly _STORAGE_KEYS = {
    SEDES: 'sea_eval_sedes',
    CARRERAS: 'sea_eval_carreras',
    ASIGNATURAS: 'sea_eval_asignaturas',
    DOCENTES: 'sea_eval_docentes',
    ROLES_EXAMENES: 'sea_eval_roles_examenes',
    CONFIGURACIONES: 'sea_eval_configuraciones',
    GESTION_ACTIVA: 'sea_eval_gestion_activa',
    PLAN_ESTUDIOS: 'sea_eval_plan_estudios',
    GESTION_EVALUACIONES: 'sea_eval_gestion_evaluaciones',
    BITACORA_AUDITORIA: 'sea_eval_bitacora_auditoria'
  };

  // Signals reactivos
  public sedes = signal<Sede[]>([]);
  public carreras = signal<Carrera[]>([]);
  public asignaturas = signal<Asignatura[]>([]);
  public docentes = signal<Docente[]>([]);
  public rolesExamenes = signal<RolExamen[]>([]);
  public planSemestres = signal<PlanEstudioSemestre[]>([]);
  public gestionEvaluaciones = signal<GestionEvaluacionItem[]>([]);
  public bitacoraAuditoria = signal<AuditoriaAccesoItem[]>([]);
  
  // Gestión activa por defecto: II-2026
  public gestionActiva = signal<string>('II-2026');

  // KPI Computados
  public kpiResumen = computed<EvaluacionesKpi>(() => {
    const examenes = this.rolesExamenes();
    const todayStr = '2026-08-18';
    
    const totalProgramados = examenes.length;
    const totalHoy = examenes.filter(e => e.fecha === todayStr).length;
    const totalGenerados = examenes.filter(e => e.estado === 'GENERADO' || e.estado === 'FINALIZADO').length;
    const pendientesBanco = examenes.filter(e => e.estado === 'PENDIENTE_BANCO').length;
    const bancosListos = examenes.filter(e => e.totalBanco >= e.bancoRequerido).length;
    const porcentajeCobertura = totalProgramados > 0 
      ? Math.round((bancosListos / totalProgramados) * 100) 
      : 0;

    return {
      totalProgramados,
      totalHoy,
      totalGenerados,
      pendientesBanco,
      porcentajeCobertura,
      bancosListos
    };
  });

  constructor() {
    this._initialize();
  }

  private _initialize(): void {
    this._loadOrSeedData();
  }

  private _loadOrSeedData(): void {
    // 0. Gestión activa
    const storedGestion = localStorage.getItem(this._STORAGE_KEYS.GESTION_ACTIVA);
    this.gestionActiva.set(storedGestion || 'II-2026');

    // 1. Sedes
    const rawSedes = localStorage.getItem(this._STORAGE_KEYS.SEDES);
    if (rawSedes) {
      this.sedes.set(JSON.parse(rawSedes));
    } else {
      const seedSedes: Sede[] = [
        { id: 1, nombre: 'Cochabamba', codigo: 'CBBA', campus: 'Campus Juan Pablo II' },
        { id: 2, nombre: 'Santa Cruz', codigo: 'SCZ', campus: 'Campus Norte' },
        { id: 3, nombre: 'La Paz', codigo: 'LPZ', campus: 'Campus Miraflores' },
        { id: 4, nombre: 'Cobija', codigo: 'COB', campus: 'Campus Central' },
        { id: 5, nombre: 'Guayaramerin', codigo: 'GYM', campus: 'Campus Amazonía' }
      ];
      this.sedes.set(seedSedes);
      localStorage.setItem(this._STORAGE_KEYS.SEDES, JSON.stringify(seedSedes));
    }

    // 2. Carreras
    const rawCarreras = localStorage.getItem(this._STORAGE_KEYS.CARRERAS);
    if (rawCarreras) {
      this.carreras.set(JSON.parse(rawCarreras));
    } else {
      const seedCarreras: Carrera[] = [
        { id: 1, nombre: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS', codigo: 'SIS', sedeId: 1, facultad: 'Facultad de Tecnología' },
        { id: 2, nombre: 'LICENCIATURA EN MEDICINA', codigo: 'MED', sedeId: 1, facultad: 'Facultad de Ciencias de la Salud' },
        { id: 3, nombre: 'LICENCIATURA EN BIOQUÍMICA Y FARMACIA', codigo: 'BYF', sedeId: 1, facultad: 'Facultad de Ciencias de la Salud' },
        { id: 4, nombre: 'LICENCIATURA EN INGENIERÍA COMERCIAL', codigo: 'ICO', sedeId: 1, facultad: 'Facultad de Ciencias Económicas' },
        { id: 5, nombre: 'LICENCIATURA EN ODONTOLOGÍA', codigo: 'ODO', sedeId: 1, facultad: 'Facultad de Ciencias de la Salud' }
      ];
      this.carreras.set(seedCarreras);
      localStorage.setItem(this._STORAGE_KEYS.CARRERAS, JSON.stringify(seedCarreras));
    }

    // 3. Plan de Estudios Semestral
    const rawPlan = localStorage.getItem(this._STORAGE_KEYS.PLAN_ESTUDIOS);
    if (rawPlan) {
      this.planSemestres.set(JSON.parse(rawPlan));
    } else {
      const seedPlan: PlanEstudioSemestre[] = [
        {
          numero: 1,
          nombre: 'Primer Semestre',
          horasTotales: 590,
          asignaturas: [
            {
              id: 1,
              codigo: 'SIS-114',
              nombre: 'ALGEBRA',
              horas: 120,
              docenteNombre: 'ELIANA LESLY MICORDIA ROMERO',
              docenteCi: '6522053',
              grupo: 'Grupo 1',
              asignada: true,
              esMateriaComun: false,
              conCartilla: true,
              progresoDoc: 0,
              preguntas1P: { facil: 15, medio: 30, dificil: 15, total: 60 },
              preguntas2P: { facil: 15, medio: 30, dificil: 15, total: 60 },
              preguntasFinal: { facil: 30, medio: 60, dificil: 30, total: 120 },
              fecha1P: '16/04/2026 09:45-11:15',
              fecha2P: '18/08/2026 09:45-11:15',
              fechaFinal: '02/12/2026 09:45-11:15',
              estadoExamen1P: 'Subido',
              estadoExamen2P: 'Generado',
              estadoExamenFinal: 'Pendiente'
            },
            {
              id: 2,
              codigo: 'SIS-111',
              nombre: 'CALCULO I',
              horas: 120,
              docenteNombre: 'JIMENA GIOVANNA ARNEZ MARTINEZ',
              docenteCi: '4820194',
              grupo: 'Grupo 1',
              asignada: true,
              esMateriaComun: true,
              conCartilla: true,
              progresoDoc: 37,
              preguntas1P: { facil: 20, medio: 25, dificil: 15, total: 60 },
              preguntas2P: { facil: 15, medio: 30, dificil: 15, total: 60 },
              preguntasFinal: { facil: 30, medio: 60, dificil: 30, total: 120 },
              fecha1P: '01/04/2026 11:15-12:45',
              fecha2P: '19/08/2026 11:15-12:45',
              fechaFinal: '03/12/2026 11:15-12:45',
              estadoExamen1P: 'Devuelto',
              estadoExamen2P: 'Subido',
              estadoExamenFinal: 'Pendiente'
            },
            {
              id: 3,
              codigo: 'SIS-115',
              nombre: 'INGLES TECNICO I',
              horas: 80,
              docenteNombre: 'KARINA PAOLA LOPEZ ECHEVERRIA',
              docenteCi: '3910283',
              grupo: 'Grupo 1',
              asignada: true,
              esMateriaComun: false,
              conCartilla: false,
              progresoDoc: 0,
              preguntas1P: { facil: 10, medio: 30, dificil: 20, total: 60 },
              preguntas2P: { facil: 15, medio: 30, dificil: 15, total: 60 },
              preguntasFinal: { facil: 30, medio: 60, dificil: 30, total: 120 },
              fecha1P: '07/04/2026 08:15-09:45',
              fecha2P: '20/08/2026 08:15-09:45',
              fechaFinal: '04/12/2026 08:15-09:45',
              estadoExamen1P: 'Devuelto',
              estadoExamen2P: 'Devuelto',
              estadoExamenFinal: 'Pendiente'
            }
          ]
        }
      ];
      this.planSemestres.set(seedPlan);
      localStorage.setItem(this._STORAGE_KEYS.PLAN_ESTUDIOS, JSON.stringify(seedPlan));
    }

    // 4. Lista de Evaluaciones con Flujo de Estados y Bitácora Completa
    const rawGestion = localStorage.getItem(this._STORAGE_KEYS.GESTION_EVALUACIONES);
    if (rawGestion) {
      this.gestionEvaluaciones.set(JSON.parse(rawGestion));
    } else {
      const seedGestion: GestionEvaluacionItem[] = [
        {
          id: 1,
          codigo: 'SIS-121',
          materia: 'CÁLCULO II',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 2,
          grupo: 'G. 1',
          docente: 'EDSON LUIS BASCOPE GALARZA',
          parcial: 'Final',
          fecha: '13/06/2026',
          hora: '08:45',
          conCartilla: true,
          bancoExcelCargado: false,
          etapa: 'Programado',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara (Encargado)', fechaHora: '01/06/2026 08:00', detalle: 'Evaluación calendarizada en el Rol' }
          ],
          documentos: {}
        },
        {
          id: 2,
          codigo: 'SIS-114',
          materia: 'ANÁLISIS DE SISTEMAS I',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 5,
          grupo: 'G. 1',
          docente: 'MARIA LUZ DEL CASTILLO GONZALES',
          parcial: 'Final',
          fecha: '08/06/2026',
          hora: '08:15',
          conCartilla: true,
          bancoExcelCargado: true,
          nombreArchivoExcel: 'BANCO_SIS114_FINAL.xlsx',
          parametrizacion: {
            duracionMinutos: 90,
            toleranciaMinutos: 15,
            totalPreguntas: 30,
            distribucionDificultad: { facil: 15, medio: 30, dificil: 15 },
            mezclarPreguntas: true,
            mezclarOpciones: true,
            cantidadVariantes: 4
          },
          etapa: 'Devuelto',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara', fechaHora: '01/06/2026 08:00', detalle: 'Calendarizado' },
            { estado: 'Generado', usuario: 'Ariel Camara', fechaHora: '05/06/2026 10:30', detalle: 'Compilado con Typst (Variantes Tipo A-D)' },
            { estado: 'Impreso', usuario: 'Ariel Camara', fechaHora: '06/06/2026 16:00', detalle: 'Cuadernillos y cartillas impresos' },
            { estado: 'Entregado', usuario: 'Ariel Camara', fechaHora: '08/06/2026 07:45', detalle: 'Entregado al docente Maria Luz del Castillo' },
            { estado: 'Devuelto', usuario: 'Ariel Camara', fechaHora: '08/06/2026 10:00', detalle: 'Recepcionado tras la prueba' }
          ],
          documentos: { pdfExamen: true, patronRespuestas: true, cartilla: true },
          variantesGeneradas: ['TIPO A', 'TIPO B', 'TIPO C', 'TIPO D']
        },
        {
          id: 3,
          codigo: 'SIS-211',
          materia: 'ECUACIONES DIFERENCIALES',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 3,
          grupo: 'G. 1',
          docente: 'MAURICIO QUIROZ LAFUENTE',
          parcial: 'Final',
          fecha: '09/06/2026',
          hora: '08:15',
          conCartilla: true,
          bancoExcelCargado: true,
          nombreArchivoExcel: 'BANCO_SIS211_FINAL.xlsx',
          etapa: 'Devuelto',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara', fechaHora: '01/06/2026 08:00' },
            { estado: 'Generado', usuario: 'Ariel Camara', fechaHora: '06/06/2026 11:20' },
            { estado: 'Impreso', usuario: 'Ariel Camara', fechaHora: '07/06/2026 14:00' },
            { estado: 'Entregado', usuario: 'Ariel Camara', fechaHora: '09/06/2026 07:50' },
            { estado: 'Devuelto', usuario: 'Ariel Camara', fechaHora: '09/06/2026 10:15' }
          ],
          documentos: { pdfExamen: true, patronRespuestas: true, cartilla: true },
          variantesGeneradas: ['TIPO A', 'TIPO B', 'TIPO C', 'TIPO D']
        },
        {
          id: 4,
          codigo: 'SIS-212',
          materia: 'SISTEMAS DIGITALES',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 3,
          grupo: 'G. 1',
          docente: 'DANIEL CAMACHO PASTOR',
          parcial: 'Final',
          fecha: '10/06/2026',
          hora: '08:15',
          conCartilla: false,
          bancoExcelCargado: false,
          etapa: 'Entregado',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara', fechaHora: '01/06/2026 08:00' },
            { estado: 'Impreso', usuario: 'Ariel Camara', fechaHora: '09/06/2026 15:00', detalle: 'Prueba manual preparada' },
            { estado: 'Entregado', usuario: 'Ariel Camara', fechaHora: '10/06/2026 08:00', detalle: 'Entregado a Daniel Camacho' }
          ],
          documentos: {}
        },
        {
          id: 5,
          codigo: 'SIS-221',
          materia: 'MÉTODOS NUMÉRICOS',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 4,
          grupo: 'G. 1',
          docente: 'JANETH GIOVANA ALANEZ VILLEGAS',
          parcial: 'Final',
          fecha: '12/06/2026',
          hora: '08:15',
          conCartilla: false,
          bancoExcelCargado: false,
          etapa: 'Impreso',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara', fechaHora: '01/06/2026 08:00' },
            { estado: 'Impreso', usuario: 'Ariel Camara', fechaHora: '11/06/2026 12:00' }
          ],
          documentos: {}
        },
        {
          id: 6,
          codigo: 'SIS-215',
          materia: 'INGLÉS TÉCNICO II',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 3,
          grupo: 'G. 1',
          docente: 'KARINA PAOLA LOPEZ ECHEVERRIA',
          parcial: 'Final',
          fecha: '15/06/2026',
          hora: '08:15',
          conCartilla: true,
          bancoExcelCargado: false,
          etapa: 'Programado',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara', fechaHora: '01/06/2026 08:00' }
          ],
          documentos: {}
        },
        {
          id: 7,
          codigo: 'SIS-115',
          materia: 'INGLÉS TÉCNICO I',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 1,
          grupo: 'G. 1',
          docente: 'KARINA PAOLA LOPEZ ECHEVERRIA',
          parcial: 'Final',
          fecha: '16/06/2026',
          hora: '08:15',
          conCartilla: true,
          bancoExcelCargado: false,
          etapa: 'Programado',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara', fechaHora: '01/06/2026 08:00' }
          ],
          documentos: {}
        },
        {
          id: 8,
          codigo: 'SIS-325',
          materia: 'TALLER DE REDES',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 6,
          grupo: 'G. 1',
          docente: 'ING. ARIEL DENYS CAMARA ARZE',
          parcial: 'Final',
          fecha: '17/06/2026',
          hora: '08:15',
          conCartilla: false,
          bancoExcelCargado: false,
          etapa: 'Programado',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara', fechaHora: '01/06/2026 08:00' }
          ],
          documentos: {}
        },
        {
          id: 9,
          codigo: 'SIS-317',
          materia: 'ÉTICA E INTRODUCCIÓN AL DERECHO INFORMÁTICO',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 5,
          grupo: 'G. 1',
          docente: 'MARIA DE LOS ANGELES MENESES PARRA',
          parcial: 'Final',
          fecha: '19/06/2026',
          hora: '08:15',
          conCartilla: true,
          bancoExcelCargado: false,
          etapa: 'Programado',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara', fechaHora: '01/06/2026 08:00' }
          ],
          documentos: {}
        },
        {
          id: 10,
          codigo: 'SIS-414',
          materia: 'INGENIERÍA DE SOFTWARE',
          carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
          semestre: 7,
          grupo: 'G. 1',
          docente: 'WALTER JOSE CAZAS CASTRO',
          parcial: 'Final',
          fecha: '20/06/2026',
          hora: '08:15',
          conCartilla: false,
          bancoExcelCargado: false,
          etapa: 'Programado',
          bitacora: [
            { estado: 'Programado', usuario: 'Ariel Camara', fechaHora: '01/06/2026 08:00' }
          ],
          documentos: {}
        }
      ];
      this.gestionEvaluaciones.set(seedGestion);
      localStorage.setItem(this._STORAGE_KEYS.GESTION_EVALUACIONES, JSON.stringify(seedGestion));
    }

    // 9. Bitácora de Auditoría y Accesos (MAC, IP, Usuarios, Acciones)
    const rawAuditoria = localStorage.getItem(this._STORAGE_KEYS.BITACORA_AUDITORIA);
    if (rawAuditoria) {
      this.bitacoraAuditoria.set(JSON.parse(rawAuditoria));
    } else {
      const seedAuditoria: AuditoriaAccesoItem[] = [
        {
          id: 'AUD-901',
          usuarioNombre: 'Ing. Ariel Denys Cámara Arze',
          usuarioCi: '6849201 Cbba',
          usuarioCargo: 'Administrador / Docente Investigador',
          campus: 'COLONIAL (Cochabamba)',
          ipPublica: '181.188.142.50 (ENTEL Bolivia)',
          direccionMac: 'E4:5F:01:8A:2C:99',
          nombreEquipo: 'WS-EVAL-CBBA-01',
          fechaHora: '19/08/2026 15:45:10',
          modulo: 'Generación Typst',
          accion: 'Compiló 4 variantes (A-D) en Oficio / Times New Roman para SIS-121 (CÁLCULO II - G. 1)',
          nivel: 'OPERACION_CRITICA',
          navegador: 'Chrome 128.0 (Windows 11 x64)',
          sistemaOperativo: 'Windows 11 Pro 64-bit'
        },
        {
          id: 'AUD-902',
          usuarioNombre: 'Ing. Ariel Denys Cámara Arze',
          usuarioCi: '6849201 Cbba',
          usuarioCargo: 'Administrador / Docente Investigador',
          campus: 'COLONIAL (Cochabamba)',
          ipPublica: '181.188.142.50 (ENTEL Bolivia)',
          direccionMac: 'E4:5F:01:8A:2C:99',
          nombreEquipo: 'WS-EVAL-CBBA-01',
          fechaHora: '19/08/2026 15:30:22',
          modulo: 'Banco de Preguntas',
          accion: 'Validó 120 reactivos Excel para SIS-121 y generó paquete cifrado BANCO_SIS121_FINAL_2026.pkg',
          nivel: 'INFO',
          navegador: 'Chrome 128.0 (Windows 11 x64)',
          sistemaOperativo: 'Windows 11 Pro 64-bit'
        },
        {
          id: 'AUD-903',
          usuarioNombre: 'Ing. José James Claure Ricaldi',
          usuarioCi: '4329108 Cbba',
          usuarioCargo: 'Director de Carrera / Evaluador',
          campus: 'JUAN PABLO II (Cochabamba)',
          ipPublica: '190.181.42.12 (AXS Bolivia)',
          direccionMac: 'F0:18:98:C2:55:1A',
          nombreEquipo: 'DIR-SISTEMAS-JPII',
          fechaHora: '19/08/2026 14:15:00',
          modulo: 'Administración',
          accion: 'Actualizó buzones institucionales de recepción para Campus Colonial y Santa Cruz',
          nivel: 'ADVERTENCIA',
          navegador: 'Firefox 130.0 (Windows 11)',
          sistemaOperativo: 'Windows 11 Pro 64-bit'
        },
        {
          id: 'AUD-904',
          usuarioNombre: 'Ing. Harold Marco Antonio Rojas Torres',
          usuarioCi: '5192843 Cbba',
          usuarioCargo: 'Líder de Calidad / Auditor',
          campus: 'COLONIAL (Cochabamba)',
          ipPublica: '200.87.160.85 (COMTECO)',
          direccionMac: 'B8:27:EB:44:A1:70',
          nombreEquipo: 'LAB-QUAS-CBBA-03',
          fechaHora: '19/08/2026 12:40:15',
          modulo: 'Evaluaciones',
          accion: 'Aprobó estado IMPRESO para 5 evaluaciones con cartilla óptica del 1er Parcial',
          nivel: 'INFO',
          navegador: 'Chrome 128.0 (Linux Ubuntu 24.04)',
          sistemaOperativo: 'Ubuntu Linux 24.04 LTS'
        },
        {
          id: 'AUD-905',
          usuarioNombre: 'Dra. María Lorena Orellana Aguilar',
          usuarioCi: '3819204 Cbba',
          usuarioCargo: 'Jefatura de Evaluaciones / Salud',
          campus: 'FLORIDA NORTE (Cochabamba)',
          ipPublica: '181.188.130.14 (ENTEL Bolivia)',
          direccionMac: '00:1A:2B:3C:4D:5E',
          nombreEquipo: 'JEF-SALUD-FLORIDA',
          fechaHora: '19/08/2026 10:20:00',
          modulo: 'Autenticación',
          accion: 'Inicio de sesión institucional exitoso mediante SSO / Credenciales Token',
          nivel: 'INFO',
          navegador: 'Edge 128.0 (Windows 11)',
          sistemaOperativo: 'Windows 11 Enterprise'
        },
        {
          id: 'AUD-906',
          usuarioNombre: 'Lic. Carlos Mendoza Rojas',
          usuarioCi: '7192834 LPZ',
          usuarioCargo: 'Encargado de Evaluaciones Sede La Paz',
          campus: 'Campus La Paz',
          ipPublica: '186.2.144.90 (Tigo Bolivia)',
          direccionMac: 'D4:3D:7E:11:92:AA',
          nombreEquipo: 'TERM-EVAL-LPZ-01',
          fechaHora: '19/08/2026 09:15:30',
          modulo: 'Seguridad',
          accion: 'Intento de descarga de clave de respuestas fuera de horario (+3h no cumplidas) — Bloqueado por regla',
          nivel: 'ADVERTENCIA',
          navegador: 'Chrome 128.0 (Windows 10)',
          sistemaOperativo: 'Windows 10 Pro 64-bit'
        },
        {
          id: 'AUD-907',
          usuarioNombre: 'Ing. Ariel Denys Cámara Arze',
          usuarioCi: '6849201 Cbba',
          usuarioCargo: 'Administrador / Docente Investigador',
          campus: 'COLONIAL (Cochabamba)',
          ipPublica: '181.188.142.50 (ENTEL Bolivia)',
          direccionMac: 'E4:5F:01:8A:2C:99',
          nombreEquipo: 'WS-EVAL-CBBA-01',
          fechaHora: '19/08/2026 08:00:12',
          modulo: 'Autenticación',
          accion: 'Inicio de sesión administrador - Sede Central Cochabamba',
          nivel: 'INFO',
          navegador: 'Chrome 128.0 (Windows 11 x64)',
          sistemaOperativo: 'Windows 11 Pro 64-bit'
        }
      ];
      this.bitacoraAuditoria.set(seedAuditoria);
      localStorage.setItem(this._STORAGE_KEYS.BITACORA_AUDITORIA, JSON.stringify(seedAuditoria));
    }
  }

  public campusList = signal<any[]>([]);
  public carrerasCampusList = signal<any[]>([]);
  public usuariosEvaluadores = signal<any[]>([]);
  public configuracionExamenes = signal<any>({
    nacional: {
      parciales: [
        { nombre: '1º Parcial', totalPreguntas: 30, distribucion: { facil: 7, medio: 16, dificil: 7 } },
        { nombre: '2º Parcial', totalPreguntas: 30, distribucion: { facil: 7, medio: 16, dificil: 7 } },
        { nombre: 'Examen Final', totalPreguntas: 60, distribucion: { facil: 15, medio: 30, dificil: 15 } },
        { nombre: '2da Instancia', totalPreguntas: 50, distribucion: { facil: 10, medio: 25, dificil: 15 } }
      ],
      tiempos: {
        minutos_antes_entrega: 15,
        horas_antes_generacion: 144,
        horas_post_patron: 0,
        horas_antes_lista: 24,
        gestion: '1/2026'
      }
    }
  });

  public setGestionActiva(gestion: string): void {
    this.gestionActiva.set(gestion);
    localStorage.setItem(this._STORAGE_KEYS.GESTION_ACTIVA, gestion);
  }

  public toggleCartillaPlan(itemId: number): void {
    const current = this.planSemestres().map(sem => ({
      ...sem,
      asignaturas: sem.asignaturas.map(item => {
        if (item.id === itemId) {
          return { ...item, conCartilla: !item.conCartilla };
        }
        return item;
      })
    }));
    this.planSemestres.set(current);
    localStorage.setItem(this._STORAGE_KEYS.PLAN_ESTUDIOS, JSON.stringify(current));
  }

  public toggleCartillaGestionEvaluacion(id: number): void {
    const current = this.gestionEvaluaciones().map(item => {
      if (item.id === id) {
        return { ...item, conCartilla: !item.conCartilla };
      }
      return item;
    });
    this.gestionEvaluaciones.set(current);
    localStorage.setItem(this._STORAGE_KEYS.GESTION_EVALUACIONES, JSON.stringify(current));
  }

  public avanzarEstado(id: number, usuario: string = 'Ariel Camara (Encargado)', detalle?: string): { anterior: EtapaEvaluacion; nuevo: EtapaEvaluacion } | null {
    let result: { anterior: EtapaEvaluacion; nuevo: EtapaEvaluacion } | null = null;
    
    const current = this.gestionEvaluaciones().map(item => {
      if (item.id === id) {
        const siguiente = this.getSiguienteEtapa(item);
        if (siguiente) {
          const nowStr = new Date().toLocaleString('es-BO', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          });

          const nuevoRegistro: BitacoraRegistro = {
            estado: siguiente,
            usuario,
            fechaHora: nowStr,
            detalle: detalle || `Transición a ${siguiente}`
          };

          const evento: EventoSeguimiento = {
            id: 'EVT-' + Date.now().toString().slice(-4),
            tipo: 'CAMBIO_ESTADO',
            estadoAnterior: item.etapa,
            estadoNuevo: siguiente,
            usuario,
            cargo: 'Administrador / Evaluador',
            fechaHora: nowStr,
            ipPublica: '181.188.142.50 (ENTEL Bolivia)',
            macAddress: 'E4:5F:01:8A:2C:99',
            detalles: detalle || `Avanzó exitosamente de ${item.etapa} a ${siguiente}.`
          };

          const historialActual = item.historialSeguimiento || [];

          result = { anterior: item.etapa, nuevo: siguiente };

          return {
            ...item,
            etapa: siguiente,
            bitacora: [...item.bitacora, nuevoRegistro],
            historialSeguimiento: [evento, ...historialActual]
          };
        }
      }
      return item;
    });

    if (result) {
      this.gestionEvaluaciones.set(current);
      localStorage.setItem(this._STORAGE_KEYS.GESTION_EVALUACIONES, JSON.stringify(current));
    }

    return result;
  }

  public reestablecerEvaluacion(
    id: number, 
    motivo: string = 'Reestablecimiento manual a Programado', 
    usuario: string = 'Ing. Ariel Denys Cámara Arze'
  ): boolean {
    let ok = false;
    const nowStr = new Date().toLocaleString('es-BO', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    const current = this.gestionEvaluaciones().map(item => {
      if (item.id === id) {
        ok = true;
        const estadoOriginal = item.etapa;
        const bitacoraReg: BitacoraRegistro = {
          estado: 'Programado',
          usuario,
          fechaHora: nowStr,
          detalle: `REESTABLECIMIENTO: Retornado a Programado desde ${estadoOriginal}. Motivo: ${motivo}. Exámenes generados preservados.`
        };

        const evento: EventoSeguimiento = {
          id: 'EVT-' + Date.now().toString().slice(-4),
          tipo: 'RESTABLECIMIENTO',
          estadoAnterior: estadoOriginal,
          estadoNuevo: 'Programado',
          usuario,
          cargo: 'Administrador / Docente Investigador',
          fechaHora: nowStr,
          motivo,
          ipPublica: '181.188.142.50 (ENTEL Bolivia)',
          macAddress: 'E4:5F:01:8A:2C:99',
          detalles: `Examen retornado a Programado. Estado previo '${estadoOriginal}' salvado para posible restauración.`
        };

        const historialActual = item.historialSeguimiento || [];

        return {
          ...item,
          etapa: 'Programado' as EtapaEvaluacion,
          fueRestablecido: true,
          estadoPrevioRestablecimiento: estadoOriginal,
          fechaRestablecimiento: nowStr,
          usuarioRestablecimiento: usuario,
          motivoRestablecimiento: motivo,
          bitacora: [...item.bitacora, bitacoraReg],
          historialSeguimiento: [evento, ...historialActual]
        };
      }
      return item;
    });

    if (ok) {
      this.gestionEvaluaciones.set(current);
      localStorage.setItem(this._STORAGE_KEYS.GESTION_EVALUACIONES, JSON.stringify(current));
      
      this.registrarAccionAuditoria({
        usuarioNombre: usuario,
        modulo: 'Evaluaciones',
        accion: `Reestableció a Programado la evaluación ID ${id}. Estado previo salvado para restauración. Motivo: ${motivo}`,
        nivel: 'ADVERTENCIA'
      });
    }

    return ok;
  }

  public restaurarEvaluacion(
    id: number, 
    motivo: string = 'Restauración de estado previa', 
    usuario: string = 'Ing. Ariel Denys Cámara Arze'
  ): boolean {
    let ok = false;
    const nowStr = new Date().toLocaleString('es-BO', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    const current = this.gestionEvaluaciones().map(item => {
      if (item.id === id && item.fueRestablecido && item.estadoPrevioRestablecimiento) {
        ok = true;
        const estadoARestaurar = item.estadoPrevioRestablecimiento;
        const bitacoraReg: BitacoraRegistro = {
          estado: estadoARestaurar,
          usuario,
          fechaHora: nowStr,
          detalle: `RESTAURACIÓN: Recuperado estado previo ${estadoARestaurar}. Motivo: ${motivo}.`
        };

        const evento: EventoSeguimiento = {
          id: 'EVT-' + Date.now().toString().slice(-4),
          tipo: 'RESTAURACION',
          estadoAnterior: 'Programado',
          estadoNuevo: estadoARestaurar,
          usuario,
          cargo: 'Administrador / Docente Investigador',
          fechaHora: nowStr,
          motivo,
          ipPublica: '181.188.142.50 (ENTEL Bolivia)',
          macAddress: 'E4:5F:01:8A:2C:99',
          detalles: `Estado restaurado con éxito a '${estadoARestaurar}'.`
        };

        const historialActual = item.historialSeguimiento || [];

        return {
          ...item,
          etapa: estadoARestaurar,
          fueRestablecido: false,
          estadoPrevioRestablecimiento: undefined,
          bitacora: [...item.bitacora, bitacoraReg],
          historialSeguimiento: [evento, ...historialActual]
        };
      }
      return item;
    });

    if (ok) {
      this.gestionEvaluaciones.set(current);
      localStorage.setItem(this._STORAGE_KEYS.GESTION_EVALUACIONES, JSON.stringify(current));
      
      this.registrarAccionAuditoria({
        usuarioNombre: usuario,
        modulo: 'Evaluaciones',
        accion: `Restauró el estado original de la evaluación ID ${id}. Motivo: ${motivo}`,
        nivel: 'INFO'
      });
    }

    return ok;
  }

  public getSiguienteEtapa(item: GestionEvaluacionItem): EtapaEvaluacion | null {
    if (item.conCartilla) {
      const flujoConCartilla: EtapaEvaluacion[] = [
        'Programado', 'Generado', 'Impreso', 'Entregado', 'Devuelto', 'Revisado', 'Subido', 'Recibido'
      ];
      const idx = flujoConCartilla.indexOf(item.etapa);
      return idx >= 0 && idx < flujoConCartilla.length - 1 ? flujoConCartilla[idx + 1] : null;
    } else {
      const flujoSinCartilla: EtapaEvaluacion[] = [
        'Programado', 'Impreso', 'Entregado', 'Devuelto', 'Revisado', 'Subido', 'Recibido'
      ];
      const idx = flujoSinCartilla.indexOf(item.etapa);
      return idx >= 0 && idx < flujoSinCartilla.length - 1 ? flujoSinCartilla[idx + 1] : null;
    }
  }

  public cargarBancoExcelYGenerarConParametros(
    id: number, 
    nombreArchivo: string,
    params: ParametrizacionExamen,
    usuario: string = 'Ariel Camara (Encargado)'
  ): void {
    const nowStr = new Date().toLocaleString('es-BO', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    const current = this.gestionEvaluaciones().map(item => {
      if (item.id === id) {
        const nuevoRegistro: BitacoraRegistro = {
          estado: 'Generado',
          usuario,
          fechaHora: nowStr,
          detalle: `Banco Excel '${nombreArchivo}' cargado y 4 variantes Typst compiladas.`
        };

        return {
          ...item,
          bancoExcelCargado: true,
          nombreArchivoExcel: nombreArchivo,
          parametrizacion: params,
          etapa: 'Generado' as EtapaEvaluacion,
          documentos: { pdfExamen: true, patronRespuestas: true, cartilla: item.conCartilla },
          variantesGeneradas: ['TIPO A', 'TIPO B', 'TIPO C', 'TIPO D'],
          bitacora: [...item.bitacora, nuevoRegistro]
        };
      }
      return item;
    });

    this.gestionEvaluaciones.set(current);
    localStorage.setItem(this._STORAGE_KEYS.GESTION_EVALUACIONES, JSON.stringify(current));
  }

  public registrarAccionAuditoria(entry: Partial<AuditoriaAccesoItem>): void {
    const nowStr = new Date().toLocaleString('es-BO', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const nuevo: AuditoriaAccesoItem = {
      id: 'AUD-' + Date.now().toString().slice(-4),
      usuarioNombre: entry.usuarioNombre || 'Ing. Ariel Denys Cámara Arze',
      usuarioCi: entry.usuarioCi || '6849201 Cbba',
      usuarioCargo: entry.usuarioCargo || 'Administrador / Docente Investigador',
      campus: entry.campus || 'COLONIAL (Cochabamba)',
      ipPublica: entry.ipPublica || '181.188.142.50 (ENTEL Bolivia)',
      direccionMac: entry.direccionMac || 'E4:5F:01:8A:2C:99',
      nombreEquipo: entry.nombreEquipo || 'WS-EVAL-CBBA-01',
      fechaHora: nowStr,
      modulo: entry.modulo || 'Evaluaciones',
      accion: entry.accion || 'Operación registrada en el sistema',
      nivel: entry.nivel || 'INFO',
      navegador: entry.navegador || 'Chrome 128.0 (Windows 11 x64)',
      sistemaOperativo: entry.sistemaOperativo || 'Windows 11 Pro 64-bit'
    };

    const actualizados = [nuevo, ...this.bitacoraAuditoria()];
    this.bitacoraAuditoria.set(actualizados);
    localStorage.setItem(this._STORAGE_KEYS.BITACORA_AUDITORIA, JSON.stringify(actualizados));
  }
}
