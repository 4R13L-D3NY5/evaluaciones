import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneracionTypstResultado } from '../models/generacion-typst.model';
import { VerificacionHistorialDevolucion } from './verificacion-examen.service';

export interface HistorialObservacionItem {
  devolucionId: number;
  fechaDevolucion: string;
  verificadoPor: string;
  observacionesGenerales?: string;
  observacionesPreguntasJson?: string;
  totalPreguntasObservadas: number;
}

export type EstadoCalidadExamen =
  | 'APROBADO_DIRECTO'
  | 'OBSERVADO_Y_APROBADO'
  | 'OBSERVADO_PENDIENTE'
  | 'PENDIENTE_REVISION'
  | 'SIN_BANCO';

export interface ReporteCalidadItem {
  rolExamenId: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  carreraCodigo: string;
  carreraNombre: string;
  sedeCodigo: string;
  sedeNombre: string;
  campus?: string;
  docenteNombre?: string;
  docenteCi?: string;
  tipoParcial: string;
  fechaExamen: string;
  horaExamen?: string;
  estadoFlujo: string;
  estadoCalidad: EstadoCalidadExamen | string;
  totalObservaciones: number;
  ultimaObservacionFecha?: string;
  ultimoVerificador?: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  observaciones: HistorialObservacionItem[];
}

export interface ReporteCalidadResumen {
  totalExamenes: number;
  aprobadosDirectos: number;
  observadosYLuegoAprobados: number;
  observadosPendientes: number;
  pendientesRevision: number;
  sinBanco: number;
  porcentajeAprobadosDirectos: number;
  porcentajeObservados: number;
  items: ReporteCalidadItem[];
}

export interface ReporteCoberturaBancosItem {
  rolExamenId: string;
  carreraCodigo: string;
  carreraNombre: string;
  sedeCodigo: string;
  sedeNombre: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  semestre?: number;
  docenteNombre?: string;
  docenteCi?: string;
  tipoParcial: string;
  fechaExamen: string;
  horaExamen?: string;
  tieneBanco: boolean;
  estadoBanco: string;
  totalReactivos: number;
  facilesCount: number;
  mediasCount: number;
  dificilesCount: number;
  fechaAprobacionBanco?: string;
}

export interface ReporteCoberturaCarrera {
  carreraCodigo: string;
  carreraNombre: string;
  sedeCodigo: string;
  sedeNombre: string;
  totalMaterias: number;
  materiasConBanco: number;
  materiasSinBanco: number;
  porcentajeCobertura: number;
}

export interface ReporteCoberturaBancosResumen {
  sedeCodigo?: string;
  sedeNombre?: string;
  carreraCodigo?: string;
  carreraNombre?: string;
  totalMaterias: number;
  materiasConBanco: number;
  materiasSinBanco: number;
  porcentajeCobertura: number;
  carreras: ReporteCoberturaCarrera[];
  items: ReporteCoberturaBancosItem[];
}

export interface ReporteConsolidadoOmrItem {
  rolExamenId: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  sedeCodigo: string;
  sedeNombre: string;
  carreraCodigo: string;
  carreraNombre: string;
  docenteNombre?: string;
  tipoParcial: string;
  fechaExamen: string;
  horaExamen?: string;
  totalInscritos: number;
  totalCalificados: number;
  totalAprobados: number;
  totalReprobados: number;
  promedioNota: number;
  porcentajeAprobacion: number;
  estadoSincronizacionSea: string;
}

export interface ReporteConsolidadoOmrResumen {
  totalExamenesCalificados: number;
  totalInscritos: number;
  totalCalificados: number;
  totalAprobados: number;
  totalReprobados: number;
  promedioGeneral: number;
  porcentajeAprobacionGeneral: number;
  items: ReporteConsolidadoOmrItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/reportes';

  public obtenerReporteCalidad(filtros?: {
    sedeCodigo?: string;
    carreraCodigo?: string;
    tipoParcial?: string;
    estadoCalidad?: string;
    busqueda?: string;
  }): Observable<ReporteCalidadResumen> {
    let params = new HttpParams();
    if (filtros?.sedeCodigo && filtros.sedeCodigo !== 'Todos') {
      params = params.set('sedeCodigo', filtros.sedeCodigo);
    }
    if (filtros?.carreraCodigo && filtros.carreraCodigo !== 'Todos') {
      params = params.set('carreraCodigo', filtros.carreraCodigo);
    }
    if (filtros?.tipoParcial && filtros.tipoParcial !== 'Todos') {
      params = params.set('tipoParcial', filtros.tipoParcial);
    }
    if (filtros?.estadoCalidad && filtros.estadoCalidad !== 'TODOS') {
      params = params.set('estadoCalidad', filtros.estadoCalidad);
    }
    if (filtros?.busqueda && filtros.busqueda.trim()) {
      params = params.set('busqueda', filtros.busqueda.trim());
    }

    return this._http.get<ReporteCalidadResumen>(`${this._baseUrl}/calidad-verificacion`, { params });
  }

  public obtenerCoberturaBancos(filtros?: {
    sedeCodigo?: string;
    carreraCodigo?: string;
    tipoParcial?: string;
  }): Observable<ReporteCoberturaBancosResumen> {
    let params = new HttpParams();
    if (filtros?.sedeCodigo && filtros.sedeCodigo !== 'Todos') {
      params = params.set('sedeCodigo', filtros.sedeCodigo);
    }
    if (filtros?.carreraCodigo && filtros.carreraCodigo !== 'Todos') {
      params = params.set('carreraCodigo', filtros.carreraCodigo);
    }
    if (filtros?.tipoParcial && filtros.tipoParcial !== 'Todos') {
      params = params.set('tipoParcial', filtros.tipoParcial);
    }

    return this._http.get<ReporteCoberturaBancosResumen>(`${this._baseUrl}/cobertura-bancos`, { params });
  }

  public obtenerConsolidadoOmr(filtros?: {
    sedeCodigo?: string;
    carreraCodigo?: string;
    tipoParcial?: string;
  }): Observable<ReporteConsolidadoOmrResumen> {
    let params = new HttpParams();
    if (filtros?.sedeCodigo && filtros.sedeCodigo !== 'Todos') {
      params = params.set('sedeCodigo', filtros.sedeCodigo);
    }
    if (filtros?.carreraCodigo && filtros.carreraCodigo !== 'Todos') {
      params = params.set('carreraCodigo', filtros.carreraCodigo);
    }
    if (filtros?.tipoParcial && filtros.tipoParcial !== 'Todos') {
      params = params.set('tipoParcial', filtros.tipoParcial);
    }

    return this._http.get<ReporteConsolidadoOmrResumen>(`${this._baseUrl}/consolidado-omr`, { params });
  }

  public solicitarPrevisualizacionTypst(rolExamenId: string): Observable<GeneracionTypstResultado> {
    return this._http.post<GeneracionTypstResultado>(`${this._baseUrl}/evaluaciones/${rolExamenId}/previsualizacion-typst`, {});
  }

  public obtenerHistorialDevoluciones(rolExamenId: string): Observable<VerificacionHistorialDevolucion[]> {
    return this._http.get<VerificacionHistorialDevolucion[]>(`${this._baseUrl}/evaluaciones/${rolExamenId}/historial-devoluciones`);
  }
}
