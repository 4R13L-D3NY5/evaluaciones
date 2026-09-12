import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GeneracionTypstResultado } from '../models/generacion-typst.model';

export interface VerificacionExamenLista {
  rolExamenId: string;
  bancoPreguntasId: string;
  sedeCodigo: string;
  sedeNombre: string;
  carreraCodigo: string;
  carreraNombre: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  tipoParcial: string;
  version: string;
  modalidad: string;
  fechaExamen: string;
  horario: string;
  fechaSubida: string;
  docenteNombre: string;
  estadoVerificacion: 'PENDIENTE' | 'VERIFICADO' | 'DEVUELTO' | string;
  observacionesGenerales?: string;
}

export interface VerificacionOpcion { letra: string; texto: string; correcta: boolean; }
export interface VerificacionPregunta {
  numeroOriginal: number;
  identificadorOriginal: string;
  tipoReactivo: string;
  dificultad: number;
  nivelDificultad?: string;
  grupoContexto?: string;
  enunciado: string;
  imagenBase64?: string;
  respuestaCorrecta?: string;
  pesoPuntos?: number;
  observacion?: string;
  opciones: VerificacionOpcion[];
}

export interface VerificacionExamenDetalle extends VerificacionExamenLista {
  preguntas: VerificacionPregunta[];
}

export interface VerificacionDecision {
  decision: 'APROBAR' | 'DEVOLVER';
  observacionesGenerales?: string;
  observacionesPreguntas?: Record<string, string>;
}

export interface ConfiguracionVerificacion {
  id?: number;
  sedeCodigo: string;
  sedeNombre: string;
  carreraCodigo?: string;
  carreraNombre?: string;
  habilitada: boolean;
  actualizadoEn?: string;
  actualizadoPor?: string;
}

@Injectable({ providedIn: 'root' })
export class VerificacionExamenService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/verificacion-examenes';

  listar(filtros: Record<string, string | undefined> = {}): Observable<VerificacionExamenLista[]> {
    let params = new HttpParams().set('orden', filtros['orden'] || 'FECHA_EXAMEN_ASC');
    Object.entries(filtros).forEach(([key, value]) => {
      if (key !== 'orden' && value) params = params.set(key, value);
    });
    return this.http.get<VerificacionExamenLista[]>(this.baseUrl, { params }).pipe(catchError(this.error));
  }

  obtener(rolExamenId: string): Observable<VerificacionExamenDetalle> {
    return this.http.get<VerificacionExamenDetalle>(`${this.baseUrl}/${rolExamenId}`).pipe(catchError(this.error));
  }

  previsualizar(rolExamenId: string): Observable<GeneracionTypstResultado> {
    return this.http.post<GeneracionTypstResultado>(`${this.baseUrl}/${rolExamenId}/previsualizacion`, {}).pipe(catchError(this.error));
  }

  decidir(rolExamenId: string, decision: VerificacionDecision): Observable<VerificacionExamenDetalle> {
    return this.http.post<VerificacionExamenDetalle>(`${this.baseUrl}/${rolExamenId}/decision`, decision).pipe(catchError(this.error));
  }

  private error(error: unknown): Observable<never> {
    console.error('[VerificacionExamenService] Error:', error);
    return throwError(() => error);
  }
}
