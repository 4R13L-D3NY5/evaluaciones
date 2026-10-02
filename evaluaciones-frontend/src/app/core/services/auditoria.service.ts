import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditoriaGlobalItem {
  id: string;
  tipo: 'EVALUACION' | 'USUARIO' | 'RESPALDO' | 'VERIFICACION';
  modulo: string;
  accion: string;
  codigoAccion: string;
  usuario: string;
  usuarioNombre: string;
  usuarioCargo: string;
  ipOrigen: string;
  campus: string;
  nivel: 'INFO' | 'ADVERTENCIA' | 'OPERACION_CRITICA';
  detallesJson?: string;
  fechaEvento: string;
}

export interface AuditoriaResumen {
  totalEventos: number;
  ipsUnicas: number;
  operacionesCriticas: number;
  alertasSeguridad: number;
  items: AuditoriaGlobalItem[];
}

export interface FiltrosAuditoria {
  modulo?: string;
  nivel?: string;
  busqueda?: string;
  limite?: number;
}

export interface AuditoriaEvaluacionItem {
  rolExamenId: string;
  materiaCodigo?: string;
  materiaNombre: string;
  grupo: string;
  carreraCodigo?: string;
  carreraNombre?: string;
  sedeNombre?: string;
  campus?: string;
  docenteNombre?: string;
  estadoFlujo?: string;
  modalidad?: string;
  estudiantesInscritosCount?: number;
  seaGroupId?: string;
  fechaGeneracion?: string;
  fechaExamen?: string;
}

export interface AuditoriaTomaGrupoEstudiante {
  studentCode: string;
  fullName: string;
  courseState: string;
  groupId: string;
  groupCode?: string;
  syllabusCourseId?: string;
  materiaNombre?: string;
  carreraCodigo?: string;
  carreraNombre?: string;
  sedeNombre?: string;
  docenteNombre?: string;
  enrollCreatedAt?: string;
  enrollUpdatedAt?: string;
  rolExamenId?: string;
  estadoExamen?: string;
  fechaGeneracionExamen?: string;
  fechaImpresionExamen?: string;
  letraVariante?: string;
  estadoForense: 'REGULAR' | 'TOMA_TARDIA' | 'EXTEMPORANEO_POST_IMPRESION' | 'SIN_EXAMEN_GENERADO' | 'SIN_FECHA_SEA';
  nivelAlerta: 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  mensajeForense: string;
  diferenciaMinutosConGeneracion?: number;

  // Calificaciones, reprogramaciones y modificaciones manuales
  notaSobre100?: number;
  notaSobre60?: number;
  estadoCalificacion?: 'APROBADO' | 'REPROBADO' | 'AUSENTE' | 'PENDIENTE' | string;
  origenCalificacion?: 'OMR_AUTOMATICO' | 'EXAMEN_ORAL_REPROGRAMADO' | 'AJUSTADO_MANUAL' | 'DOCENTE_SIN_CARTILLA' | 'PENDIENTE' | string;
  esReprogramado?: boolean;
  reprogramadoPor?: string;
  fechaReprogramacion?: string;
  motivoReprogramacion?: string;
  comprobanteReprogramacion?: string;
  observacionReprogramacion?: string;
  procesadoPor?: string;
  fechaProcesamiento?: string;
  modificadoManualmente?: boolean;
  detalleAjusteManual?: string;
}

export interface AuditoriaTomaGrupoReporte {
  groupId: string;
  groupCode?: string;
  syllabusCourseId?: string;
  materiaNombre: string;
  carreraCodigo?: string;
  carreraNombre?: string;
  sedeNombre?: string;
  docenteNombre?: string;
  term?: string;
  rolExamenId?: string;
  estadoExamen?: string;
  fechaGeneracionExamen?: string;
  fechaImpresionExamen?: string;
  totalEstudiantes: number;
  totalRegulares: number;
  totalTardios: number;
  totalExtemporaneos: number;

  // Métricas de calificaciones y peritaje forense
  totalCalificados: number;
  totalAprobados: number;
  totalReprobados: number;
  totalReprogramados: number;
  totalAjustados: number;
  eventosAuditoria?: AuditoriaGlobalItem[];

  estudiantes: AuditoriaTomaGrupoEstudiante[];
}

export interface AuditoriaEstudianteGlobal {
  studentCode: string;
  fullName: string;
  carreraCodigo?: string;
  carreraNombre?: string;
  sedeNombre?: string;
  totalMateriasInscritas: number;
  totalRegulares: number;
  totalTardios: number;
  totalExtemporaneos: number;
  materias: AuditoriaTomaGrupoEstudiante[];
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auditoria';

  public obtenerAuditoria(filtros?: FiltrosAuditoria): Observable<AuditoriaResumen> {
    let params = new HttpParams();
    if (filtros?.modulo && filtros.modulo !== 'TODOS') {
      params = params.set('modulo', filtros.modulo);
    }
    if (filtros?.nivel && filtros.nivel !== 'TODOS') {
      params = params.set('nivel', filtros.nivel);
    }
    if (filtros?.busqueda && filtros.busqueda.trim()) {
      params = params.set('busqueda', filtros.busqueda.trim());
    }
    if (filtros?.limite) {
      params = params.set('limite', filtros.limite.toString());
    }
    return this.http.get<AuditoriaResumen>(this.baseUrl, { params });
  }

  public buscarEvaluaciones(criterio?: string, sede?: string, carrera?: string): Observable<AuditoriaEvaluacionItem[]> {
    let params = new HttpParams();
    if (criterio && criterio.trim()) {
      params = params.set('criterio', criterio.trim());
    }
    if (sede && sede !== 'TODAS') {
      params = params.set('sede', sede);
    }
    if (carrera && carrera !== 'TODAS') {
      params = params.set('carrera', carrera);
    }
    return this.http.get<AuditoriaEvaluacionItem[]>(`${this.baseUrl}/toma-grupos/buscar-evaluaciones`, { params });
  }

  public obtenerAuditoriaTomaGrupo(groupId: string): Observable<AuditoriaTomaGrupoReporte> {
    const params = new HttpParams().set('groupId', groupId);
    return this.http.get<AuditoriaTomaGrupoReporte>(`${this.baseUrl}/toma-grupos/grupo`, { params });
  }

  public obtenerAuditoriaTomaRol(rolExamenId: string): Observable<AuditoriaTomaGrupoReporte> {
    return this.http.get<AuditoriaTomaGrupoReporte>(`${this.baseUrl}/toma-grupos/rol/${rolExamenId}`);
  }

  public obtenerAuditoriaPorGrupo(groupId: string): Observable<AuditoriaTomaGrupoReporte> {
    return this.obtenerAuditoriaTomaGrupo(groupId);
  }

  public obtenerAuditoriaPorRol(rolExamenId: string): Observable<AuditoriaTomaGrupoReporte> {
    return this.obtenerAuditoriaTomaRol(rolExamenId);
  }

  public buscarEstudianteTomaGrupos(studentCode: string, term?: string): Observable<AuditoriaEstudianteGlobal> {
    let params = new HttpParams().set('studentCode', studentCode);
    if (term) {
      params = params.set('term', term);
    }
    return this.http.get<AuditoriaEstudianteGlobal>(`${this.baseUrl}/toma-grupos/estudiante`, { params });
  }

  public descargarActaForenseExcel(groupId: string): Observable<Blob> {
    const params = new HttpParams().set('groupId', groupId);
    return this.http.get(`${this.baseUrl}/toma-grupos/exportar-excel`, {
      params,
      responseType: 'blob'
    });
  }
}
