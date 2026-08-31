import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { interval } from 'rxjs';
import {
  GeneracionTypstRequest,
  GeneracionTypstResultado,
  GeneracionColaResponse,
  DocumentoExamen,
  ConfiguracionGeneracion
} from '../models/generacion-typst.model';

/**
 * Servicio frontend para la generación de exámenes Typst.
 * Envía la solicitud al backend (que publica en RabbitMQ)
 * y consulta/escucha el resultado hasta que termine.
 */
@Injectable({
  providedIn: 'root'
})
export class GeneracionTypstService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/generacion-typst';

  /**
   * Envía la solicitud de generación al backend.
   * El backend debe publicar el payload en la cola
   * evaluaciones.generacion.typst y devolver el jobId.
   */
  public solicitarGeneracion(request: GeneracionTypstRequest): Observable<{ jobId: string }> {
    return this._http.post<{ jobId: string }>(this._baseUrl, request).pipe(
      catchError(err => {
        console.error('[GeneracionTypstService] Error al solicitar generación:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Consulta el resultado de un job de generación.
   * El backend lee la cola evaluaciones.generacion.resultado
   * o el estado persistido del job.
   */
  public consultarResultado(jobId: string): Observable<GeneracionTypstResultado> {
    return this._http.get<GeneracionTypstResultado>(`${this._baseUrl}/${jobId}/resultado`).pipe(
      catchError(err => {
        console.error(`[GeneracionTypstService] Error al consultar resultado ${jobId}:`, err);
        return throwError(() => err);
      })
    );
  }

  public consultarCola(): Observable<GeneracionColaResponse> {
    return this._http.get<GeneracionColaResponse>(`${this._baseUrl}/cola`).pipe(
      catchError(err => {
        console.error('[GeneracionTypstService] Error al consultar la cola:', err);
        return throwError(() => err);
      })
    );
  }

  public consultarDocumentoExamen(rolExamenId: string): Observable<DocumentoExamen> {
    return this._http.get<DocumentoExamen>(`${this._baseUrl}/roles/${rolExamenId}/documento`).pipe(
      catchError(err => {
        console.error(`[GeneracionTypstService] Error al consultar el PDF del rol ${rolExamenId}:`, err);
        return throwError(() => err);
      })
    );
  }

  public consultarConfiguracion(rolExamenId: string): Observable<ConfiguracionGeneracion> {
    return this._http.get<ConfiguracionGeneracion>(`${this._baseUrl}/roles/${rolExamenId}/configuracion`).pipe(
      catchError(err => {
        console.error(`[GeneracionTypstService] Error al consultar configuración del rol ${rolExamenId}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Polling simple hasta recibir COMPLETADO o ERROR.
   * Por defecto consulta cada 2 segundos durante un máximo de 60 intentos.
   */
  public esperarResultado(
    jobId: string,
    intervalMs = 2000,
    maxIntentos = 60
  ): Observable<GeneracionTypstResultado> {
    return interval(intervalMs).pipe(
      take(maxIntentos),
      switchMap(() => this.consultarResultado(jobId)),
      filter(resultado => resultado.estado === 'COMPLETADO' || resultado.estado === 'ERROR'),
      take(1),
      catchError(err => throwError(() => err))
    );
  }
}
