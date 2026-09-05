import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OmrJobResponse {
  jobId: string;
  rolExamenId?: string;
  estado: 'EN_COLA' | 'COMPLETADO' | 'ERROR' | 'NO_ENCONTRADO';
  mensaje?: string;
  totalPaginas?: number;
  resultados?: OmrLecturaResponse[];
}

export interface OmrLecturaResponse {
  pagina: number;
  codigoEstudiante?: string | null;
  codigoOcr: string[];
  codigoValidado?: boolean;
  letraVariante?: string | null;
  estado: 'CALIFICADO' | 'REVISION_MANUAL';
  mensaje?: string;
  respuestas: Record<string, string>;
  grilla?: { x: number; y: number; ancho: number; alto: number };
  perfilEscaneo?: 'ESCANEO_FISICO' | 'PDF_RECORTADO';
  zonaCodigoDetectada?: { x: number; y: number; ancho: number; alto: number };
  detalles: Array<{
    pregunta: number;
    respuesta: string;
    respuestaCorrecta?: string;
    estado?: 'CORRECTA' | 'INCORRECTA' | 'EN_BLANCO' | 'DOBLE_MARCA' | 'LEIDA' | 'SIN_PATRON';
    densidades: number[];
  }>;
  estudianteNombre?: string;
  totalReactivos?: number;
  aciertos?: number;
  fallos?: number;
  blancos?: number;
  doblesMarcas?: number;
  notaSobre100?: number;
  notaSobre30?: number;
  estadoCalificacion?: string;
}

export interface AjustarCalificacionOmrRequest {
  pagina: number;
  codigoAnterior?: string | null;
  codigoEstudiante: string;
  respuestas: Record<string, string>;
  usuario?: string;
}

export interface CalificacionOmrResponse {
  id: number;
  rolExamenId: string;
  codigoEstudiante: string;
  estudianteNombreCompleto: string;
  letraVariante: string;
  totalReactivos: number;
  aciertos: number;
  fallos: number;
  blancos: number;
  doblesMarcas: number;
  notaSobre30: number;
  notaSobre100: number;
  estadoCalificacion: string;
  respuestasDetectadasJson: string;
  detalles?: Array<{
    pregunta: number;
    respuesta: string;
    respuestaCorrecta?: string;
    estado?: 'CORRECTA' | 'INCORRECTA' | 'EN_BLANCO' | 'DOBLE_MARCA' | 'LEIDA' | 'SIN_PATRON';
    densidades: number[];
  }>;
  imagenCartillaAnotadaPath?: string;
  archivoEscaneadoPath?: string;
  procesadoPor?: string;
  fechaProcesamiento?: string;
}

export interface ConfiguracionOmr {
  umbralDensidadMarca: number;
  umbralDiferencialDoble: number;
  umbralBinarioGrilla: number;
  nivelTintaMarca: number;
  zonaCodigoX: number;
  zonaCodigoY: number;
  zonaCodigoAncho: number;
  zonaCodigoAlto: number;
  escalaOcr: number;
  radioBusquedaPixeles: number;
  actualizadoEn?: string;
  actualizadoPor?: string;
}

@Injectable({ providedIn: 'root' })
export class OmrProcesamientoService {
  private readonly _http = inject(HttpClient);

  public procesar(rolExamenId: string, archivo: File): Observable<OmrJobResponse> {
    return this._enviarArchivo(rolExamenId, archivo, 'procesar');
  }

  public procesarLecturaConciliacion(rolExamenId: string, archivo: File): Observable<OmrJobResponse> {
    return this._enviarArchivo(rolExamenId, archivo, 'procesar-lectura');
  }

  private _enviarArchivo(rolExamenId: string, archivo: File, operacion: string): Observable<OmrJobResponse> {
    const datos = new FormData();
    datos.append('file', archivo, archivo.name);
    return this._http.post<OmrJobResponse>(`/api/omr/${rolExamenId}/${operacion}`, datos);
  }

  public consultar(jobId: string): Observable<OmrJobResponse> {
    return this._http.get<OmrJobResponse>(`/api/omr/jobs/${jobId}`);
  }

  public listarCalificaciones(rolExamenId: string): Observable<CalificacionOmrResponse[]> {
    return this._http.get<CalificacionOmrResponse[]>(`/api/omr/${rolExamenId}/calificaciones`);
  }

  public obtenerEscaneado(rolExamenId: string, calificacionId: number): Observable<Blob> {
    return this._http.get(`/api/omr/${encodeURIComponent(rolExamenId)}/calificaciones/${calificacionId}/escaneado`, {
      responseType: 'blob'
    });
  }

  public obtenerConfiguracion(): Observable<ConfiguracionOmr> {
    return this._http.get<ConfiguracionOmr>('/api/omr/configuracion');
  }

  public guardarConfiguracion(configuracion: ConfiguracionOmr): Observable<ConfiguracionOmr> {
    return this._http.put<ConfiguracionOmr>('/api/omr/configuracion', configuracion);
  }

  public ajustarCalificacion(rolExamenId: string, request: AjustarCalificacionOmrRequest): Observable<CalificacionOmrResponse> {
    return this._http.put<CalificacionOmrResponse>(`/api/omr/${rolExamenId}/calificaciones/ajustar`, request);
  }
}
