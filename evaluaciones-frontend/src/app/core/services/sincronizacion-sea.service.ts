import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GrupoSincronizacionResumen,
  SincronizacionMasivaReporte,
  SincronizacionMasivaRequest,
  SincronizacionNotasSeaReporte,
  DiscrepanciaGrupoReporte,
  DetectarDiscrepanciasRequest,
  TrasladoCalificacionesRequest,
  TrasladoCalificacionesResultado
} from '../models/sincronizacion-sea.models';

export type {
  EstudianteSincronizadoDetalle,
  SincronizacionNotasSeaReporte,
  GrupoSincronizacionResumen,
  SincronizacionMasivaRequest,
  SincronizacionMasivaReporte,
  DiscrepanciaGrupoItem,
  DiscrepanciaGrupoReporte,
  DetectarDiscrepanciasRequest,
  TrasladoCalificacionItemRequest,
  TrasladoCalificacionesRequest,
  TrasladoCalificacionItemResultado,
  TrasladoCalificacionesResultado
} from '../models/sincronizacion-sea.models';

@Injectable({
  providedIn: 'root'
})
export class SincronizacionSeaService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/integracion/sincronizacion-sea';
  private readonly _individualUrl = '/api/integracion/roles';
  private readonly _discrepanciasUrl = '/api/integracion/sincronizacion-sea/discrepancias';

  public obtenerGrupos(
    sedeCodigo: string,
    carreraCodigo: string,
    tipoClase: 'TEORICO' | 'PRACTICO' | 'TODOS' = 'TEORICO',
    tipoParcial: 'PRIMER_PARCIAL' | 'SEGUNDO_PARCIAL' | 'FINAL' | 'SEGUNDA_INSTANCIA' | 'TODOS' = 'PRIMER_PARCIAL',
    estadoSincronizacion: 'TODOS' | 'PENDIENTE' | 'SINCRONIZADO' | 'NO_CALIFICADO' = 'TODOS'
  ): Observable<GrupoSincronizacionResumen[]> {
    let params = new HttpParams()
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo)
      .set('tipoClase', tipoClase)
      .set('tipoParcial', tipoParcial)
      .set('estadoSincronizacion', estadoSincronizacion);

    return this._http.get<GrupoSincronizacionResumen[]>(`${this._baseUrl}/grupos`, { params });
  }

  public obtenerVistaPrevia(rolExamenId: string): Observable<SincronizacionNotasSeaReporte> {
    return this._http.get<SincronizacionNotasSeaReporte>(`${this._individualUrl}/${rolExamenId}/sincronizar-sea/previa`);
  }

  public sincronizarIndividual(rolExamenId: string): Observable<SincronizacionNotasSeaReporte> {
    return this._http.post<SincronizacionNotasSeaReporte>(`${this._individualUrl}/${rolExamenId}/sincronizar-sea`, {});
  }

  /**
   * Alias de compatibilidad para sincronizar notas de un rol de examen individual
   */
  public sincronizarNotas(rolExamenId: string): Observable<SincronizacionNotasSeaReporte> {
    return this.sincronizarIndividual(rolExamenId);
  }

  public sincronizarMasivo(request: SincronizacionMasivaRequest): Observable<SincronizacionMasivaReporte> {
    return this._http.post<SincronizacionMasivaReporte>(`${this._baseUrl}/masiva`, request);
  }

  /**
   * Detecta discrepancias de nómina institucional para un conjunto de grupos (uno o más)
   */
  public detectarDiscrepancias(request: DetectarDiscrepanciasRequest): Observable<DiscrepanciaGrupoReporte> {
    return this._http.post<DiscrepanciaGrupoReporte>(`${this._discrepanciasUrl}/detectar`, request);
  }

  /**
   * Detecta discrepancias para un grupo específico frente a sus paralelos
   */
  public detectarDiscrepanciasIndividual(rolExamenId: string): Observable<DiscrepanciaGrupoReporte> {
    return this._http.get<DiscrepanciaGrupoReporte>(`${this._discrepanciasUrl}/rol/${rolExamenId}`);
  }

  /**
   * Traslada calificaciones de estudiantes a su grupo destino oficial en SEA
   */
  public trasladarCalificaciones(request: TrasladoCalificacionesRequest): Observable<TrasladoCalificacionesResultado> {
    return this._http.post<TrasladoCalificacionesResultado>(`${this._discrepanciasUrl}/trasladar`, request);
  }
}
