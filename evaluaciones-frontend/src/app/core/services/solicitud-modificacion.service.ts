import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SolicitudModificacionResponse,
  CrearSolicitudModificacionRequest,
  ResolverSolicitudModificacionRequest
} from '../models/solicitud-modificacion.models';

@Injectable({
  providedIn: 'root'
})
export class SolicitudModificacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/solicitudes-modificacion-rol';

  // Signals para actualización reactiva
  readonly pendientesVicerrector = signal<SolicitudModificacionResponse[]>([]);
  readonly cargando = signal<boolean>(false);

  crearSolicitud(request: CrearSolicitudModificacionRequest): Observable<SolicitudModificacionResponse> {
    return this.http.post<SolicitudModificacionResponse>(this.baseUrl, request);
  }

  obtenerPendientesVicerrector(): Observable<SolicitudModificacionResponse[]> {
    this.cargando.set(true);
    return this.http.get<SolicitudModificacionResponse[]>(`${this.baseUrl}/pendientes`);
  }

  obtenerMisSolicitudes(): Observable<SolicitudModificacionResponse[]> {
    return this.http.get<SolicitudModificacionResponse[]>(`${this.baseUrl}/mis-solicitudes`);
  }

  obtenerActivaPorRol(rolExamenId: string): Observable<SolicitudModificacionResponse | null> {
    return this.http.get<SolicitudModificacionResponse | null>(`${this.baseUrl}/examen/${rolExamenId}`);
  }

  resolverSolicitud(id: string, request: ResolverSolicitudModificacionRequest): Observable<SolicitudModificacionResponse> {
    return this.http.put<SolicitudModificacionResponse>(`${this.baseUrl}/${id}/resolver`, request);
  }
}
