import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConfiguracionRespaldos {
  activo: boolean;
  frecuenciaMinutos: number;
  retencionDias: number;
  destinoExternoConfigurado: string;
  repositorioLocalConfigurado: string;
  repositorioExternoConfigurado: string;
  proximaEjecucion?: string;
  actualizadoEn?: string;
}

export interface Respaldo {
  id: string;
  tipo: string;
  estado: string;
  snapshotLocalId?: string;
  snapshotExternoId?: string;
  rutaLocal?: string;
  rutaExterna?: string;
  tamanoBytes?: number;
  archivosCount?: number;
  solicitadoPor: string;
  solicitadoEn: string;
  iniciadoEn?: string;
  finalizadoEn?: string;
  externoCopiadoEn?: string;
  verificadoEn?: string;
  localEliminadoEn?: string;
  errorMensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class RespaldosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/backups';

  obtenerConfiguracion(): Observable<ConfiguracionRespaldos> { return this.http.get<ConfiguracionRespaldos>(`${this.baseUrl}/config`); }
  actualizarConfiguracion(request: Pick<ConfiguracionRespaldos, 'activo' | 'frecuenciaMinutos' | 'retencionDias'>): Observable<ConfiguracionRespaldos> { return this.http.put<ConfiguracionRespaldos>(`${this.baseUrl}/config`, request); }
  listar(): Observable<Respaldo[]> { return this.http.get<Respaldo[]>(this.baseUrl); }
  generar(): Observable<Respaldo> { return this.http.post<Respaldo>(this.baseUrl, {}); }
  copiarExterno(id: string): Observable<Respaldo> { return this.http.post<Respaldo>(`${this.baseUrl}/${id}/copy-external`, {}); }
  verificar(id: string): Observable<Respaldo> { return this.http.post<Respaldo>(`${this.baseUrl}/${id}/verify`, {}); }
  eliminarLocal(id: string): Observable<Respaldo> { return this.http.delete<Respaldo>(`${this.baseUrl}/${id}/local`); }
  restaurar(id: string, confirmacion: string): Observable<Respaldo> { return this.http.post<Respaldo>(`${this.baseUrl}/${id}/restore`, { confirmacion }); }
}
