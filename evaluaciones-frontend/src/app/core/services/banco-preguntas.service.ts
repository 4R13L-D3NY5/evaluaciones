import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface BancoPreguntasResponse {
  id: string;
  rolExamenId: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  tipoParcial: string;
  totalReactivos: number;
  facilesCount: number;
  mediasCount: number;
  dificilesCount: number;
  nombreArchivoExcel: string;
  hashSha256Integridad: string;
  estado: string;
  docenteAprobador: string;
  fechaAprobacion: string;
}

export interface CargaBancoResponse {
  exito: boolean;
  mensaje: string;
  bancoPreguntasId?: string;
  rolExamenId: string;
  nuevoEstado?: string;
  totalReactivos?: number;
  facilesCount?: number;
  mediasCount?: number;
  dificilesCount?: number;
  hashSha256?: string;
  erroresValidacion: string[];
}

/**
 * Servicio frontend para consultar bancos de preguntas cargados en el backend.
 */
@Injectable({
  providedIn: 'root'
})
export class BancoPreguntasService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/bancos-preguntas';

  public obtenerPorRol(rolExamenId: string): Observable<BancoPreguntasResponse> {
    return this._http.get<BancoPreguntasResponse>(`${this._baseUrl}/${rolExamenId}`).pipe(
      catchError(err => {
        console.error('[BancoPreguntasService] Error al obtener banco:', err);
        return throwError(() => err);
      })
    );
  }

  public cargarPorRol(
    rolExamenId: string,
    file: File,
    docenteAprobador?: string
  ): Observable<CargaBancoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (docenteAprobador) {
      formData.append('docenteAprobador', docenteAprobador);
    }

    return this._http.post<CargaBancoResponse>(`${this._baseUrl}/${rolExamenId}/upload`, formData).pipe(
      catchError(err => {
        console.error(`[BancoPreguntasService] Error al cargar banco para rol ${rolExamenId}:`, err);
        return throwError(() => err);
      })
    );
  }

  public eliminarPorRol(rolExamenId: string, confirmacion: string, usuario?: string): Observable<void> {
    let params = { confirmacion } as Record<string, string>;
    if (usuario) params['usuario'] = usuario;
    return this._http.delete<void>(`${this._baseUrl}/${rolExamenId}`, { params }).pipe(
      catchError(err => {
        console.error(`[BancoPreguntasService] Error al eliminar banco del rol ${rolExamenId}:`, err);
        return throwError(() => err);
      })
    );
  }
}
