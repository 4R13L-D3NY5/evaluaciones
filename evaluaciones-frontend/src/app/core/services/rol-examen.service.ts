import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RolExamenResponse {
  id: string;
  seaGroupId: string;
  seaSyllabusCourseId: string;
  sedeCodigo: string;
  sedeNombre: string;
  carreraCodigo: string;
  carreraNombre: string;
  materiaCodigo: string;
  materiaNombre: string;
  semestre: number;
  grupo: string;
  tipoClase: string;
  docenteNombre: string;
  docenteCi: string;
  tipoParcial: string;
  version: number;
  modalidad: 'PRESENCIAL_CARTILLA' | 'PRESENCIAL_SIN_CARTILLA' | 'VIRTUAL';
  estadoFlujo: 'PROGRAMADO' | 'VALIDADO' | 'GENERADO' | 'IMPRESO' | 'ENTREGADO' | 'DEVUELTO' | 'PENDIENTE_NOTAS' | 'CALIFICADO' | 'SUSPENDIDO';
  semana: number;
  dia: string;
  fecha: string;
  fechaDisplay: string;
  horario: string;
  aula: string;
  campus: string;
  estudiantesInscritosCount: number;
  variantesGeneradasCount: number;
  hashEncriptacion?: string;
  fechaValidacion?: string;
  fechaGeneracion?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface RolExamenCreateRequest {
  id: string;
  seaGroupId: string;
  seaSyllabusCourseId: string;
  sedeCodigo: string;
  sedeNombre: string;
  carreraCodigo: string;
  carreraNombre: string;
  materiaCodigo: string;
  materiaNombre: string;
  semestre: number;
  grupo: string;
  tipoClase: string;
  tipoParcial: string;
  version?: number;
  modalidad: 'PRESENCIAL_CARTILLA' | 'PRESENCIAL_SIN_CARTILLA' | 'VIRTUAL';
  semana: number;
  dia: string;
  fecha: string;
  fechaDisplay: string;
  horario: string;
  aula: string;
  campus: string;
}

export interface RolExamenEstadoRequest {
  nuevoEstado: RolExamenResponse['estadoFlujo'];
  motivo?: string;
  usuario?: string;
  ipOrigen?: string;
}

export interface RestablecerRolRequest {
  motivo: string;
  usuario?: string;
  ipOrigen?: string;
}

export interface AuditoriaRolExamen {
  id: number;
  rolExamenId: string;
  etapaOrigen: string;
  etapaDestino: string;
  accion: string;
  usuario: string;
  ipOrigen?: string;
  detallesJson?: string;
  fechaEvento?: string;
}

/**
 * Servicio frontend para gestionar Roles de Examen desde el backend.
 */
@Injectable({
  providedIn: 'root'
})
export class RolExamenService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/roles-examen';

  /**
   * Lista los roles de examen filtrando opcionalmente por sede y/o carrera.
   */
  public listar(sedeCodigo?: string, carreraCodigo?: string): Observable<RolExamenResponse[]> {
    let params = new HttpParams();
    if (sedeCodigo) {
      params = params.set('sedeCodigo', sedeCodigo);
    }
    if (carreraCodigo) {
      params = params.set('carreraCodigo', carreraCodigo);
    }

    return this._http.get<RolExamenResponse[]>(this._baseUrl, { params }).pipe(
      catchError(err => {
        console.error('[RolExamenService] Error al listar roles de examen:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene un rol de examen por su ID.
   */
  public obtenerPorId(id: string): Observable<RolExamenResponse> {
    return this._http.get<RolExamenResponse>(`${this._baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`[RolExamenService] Error al obtener rol de examen ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Crea un nuevo rol de examen.
   */
  public crear(dto: RolExamenCreateRequest): Observable<RolExamenResponse> {
    return this._http.post<RolExamenResponse>(this._baseUrl, dto).pipe(
      catchError(err => {
        console.error('[RolExamenService] Error al crear rol de examen:', err);
        return throwError(() => err);
      })
    );
  }

  public actualizar(id: string, dto: RolExamenCreateRequest): Observable<RolExamenResponse> {
    return this._http.put<RolExamenResponse>(`${this._baseUrl}/${id}`, dto).pipe(
      catchError(err => {
        console.error(`[RolExamenService] Error al actualizar rol de examen ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  public eliminar(id: string): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`[RolExamenService] Error al eliminar rol de examen ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Transiciona el estado de un rol de examen.
   */
  public transicionarEstado(id: string, dto: RolExamenEstadoRequest): Observable<RolExamenResponse> {
    return this._http.post<RolExamenResponse>(`${this._baseUrl}/${id}/transicion`, dto).pipe(
      catchError(err => {
        console.error(`[RolExamenService] Error al transicionar estado del rol ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  public restablecerAValidado(id: string, dto: RestablecerRolRequest): Observable<RolExamenResponse> {
    return this._http.post<RolExamenResponse>(`${this._baseUrl}/${id}/restablecer`, dto).pipe(
      catchError(err => {
        console.error(`[RolExamenService] Error al restablecer el rol ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  public listarAuditoria(id: string): Observable<AuditoriaRolExamen[]> {
    return this._http.get<AuditoriaRolExamen[]>(`${this._baseUrl}/${id}/auditoria`).pipe(
      catchError(err => {
        console.error(`[RolExamenService] Error al cargar la bitácora del rol ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
