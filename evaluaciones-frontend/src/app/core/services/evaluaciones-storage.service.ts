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

export interface PlanExamenResumen extends DificultadesBanco {
  clave: string;
  etiqueta: string;
  modalidad: string;
  estado: string;
  bancoCargado: boolean;
  tieneRol: boolean;
  cumple: boolean;
}

export interface PlanEstudioItem {
  id: number;
  codigo: string;
  nombre: string;
  planCurricular: string;
  semestre: number;
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
  examenes?: Record<string, PlanExamenResumen>;
  fecha1P: string;
  fecha2P: string;
  fechaFinal: string;
  estadoExamen1P: 'Calificado' | 'Devuelto' | 'Pendiente' | 'Generado';
  estadoExamen2P: 'Calificado' | 'Devuelto' | 'Pendiente' | 'Generado';
  estadoExamenFinal: 'Calificado' | 'Devuelto' | 'Pendiente' | 'Generado';
}

export type EtapaEvaluacion = 
  | 'Programado' 
  | 'Generado' 
  | 'Impreso' 
  | 'Entregado' 
  | 'Devuelto' 
  | 'Pendiente de notas'
  | 'Calificado';

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
    // No se cargan semillas ni datos de demostración. Los datos oficiales
    // deben provenir del backend/SEA y las señales viven solo en la sesión.
    this.gestionActiva.set('II-2026');
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
  }

  public toggleCartillaGestionEvaluacion(id: number): void {
    const current = this.gestionEvaluaciones().map(item => {
      if (item.id === id) {
        return { ...item, conCartilla: !item.conCartilla };
      }
      return item;
    });
    this.gestionEvaluaciones.set(current);
  }

  public avanzarEstado(id: number, usuario: string = 'Sistema', detalle?: string): { anterior: EtapaEvaluacion; nuevo: EtapaEvaluacion } | null {
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
            cargo: 'Sistema',
            fechaHora: nowStr,
            ipPublica: '',
            macAddress: '',
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
    }

    return result;
  }

  public reestablecerEvaluacion(
    id: number, 
    motivo: string = 'Reestablecimiento manual a Programado', 
    usuario: string = 'Sistema'
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
          cargo: 'Sistema',
          fechaHora: nowStr,
          motivo,
          ipPublica: '',
          macAddress: '',
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
    usuario: string = 'Sistema'
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
          cargo: 'Sistema',
          fechaHora: nowStr,
          motivo,
          ipPublica: '',
          macAddress: '',
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
        'Programado', 'Generado', 'Impreso', 'Entregado', 'Devuelto', 'Pendiente de notas', 'Calificado'
      ];
      const idx = flujoConCartilla.indexOf(item.etapa);
      return idx >= 0 && idx < flujoConCartilla.length - 1 ? flujoConCartilla[idx + 1] : null;
    } else {
      const flujoSinCartilla: EtapaEvaluacion[] = [
        'Programado', 'Impreso', 'Entregado', 'Devuelto', 'Pendiente de notas', 'Calificado'
      ];
      const idx = flujoSinCartilla.indexOf(item.etapa);
      return idx >= 0 && idx < flujoSinCartilla.length - 1 ? flujoSinCartilla[idx + 1] : null;
    }
  }

  public cargarBancoExcelYGenerarConParametros(
    id: number, 
    nombreArchivo: string,
    params: ParametrizacionExamen,
    usuario: string = 'Sistema'
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
  }

  public registrarAccionAuditoria(entry: Partial<AuditoriaAccesoItem>): void {
    const nowStr = new Date().toLocaleString('es-BO', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const nuevo: AuditoriaAccesoItem = {
      id: 'AUD-' + Date.now().toString().slice(-4),
      usuarioNombre: entry.usuarioNombre || 'Sistema',
      usuarioCi: entry.usuarioCi || '',
      usuarioCargo: entry.usuarioCargo || '',
      campus: entry.campus || '',
      ipPublica: entry.ipPublica || '',
      direccionMac: entry.direccionMac || '',
      nombreEquipo: entry.nombreEquipo || '',
      fechaHora: nowStr,
      modulo: entry.modulo || 'Evaluaciones',
      accion: entry.accion || 'Operación registrada en el sistema',
      nivel: entry.nivel || 'INFO',
      navegador: entry.navegador || '',
      sistemaOperativo: entry.sistemaOperativo || ''
    };

    const actualizados = [nuevo, ...this.bitacoraAuditoria()];
    this.bitacoraAuditoria.set(actualizados);
  }
}
