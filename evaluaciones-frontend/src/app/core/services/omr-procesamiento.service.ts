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
    estado?: 'CORRECTA' | 'INCORRECTA' | 'EN_BLANCO' | 'DOBLE_MARCA' | 'LEIDA' | 'SIN_PATRON' | 'ANULADA';
    densidades: number[];
  }>;
  estudianteNombre?: string;
  totalReactivos?: number;
  aciertos?: number;
  fallos?: number;
  blancos?: number;
  doblesMarcas?: number;
  notaSobre100?: number;
  notaSobre60?: number;
  estadoCalificacion?: string;
}

export interface AjustarCalificacionOmrRequest {
  pagina: number;
  codigoAnterior?: string | null;
  codigoEstudiante: string;
  respuestas: Record<string, string>;
  ajusteManual?: boolean;
  respuestasOriginales?: Record<string, string>;
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
  notaSobre60: number;
  notaSobre100: number;
  estadoCalificacion: string;
  respuestasDetectadasJson: string;
  detalles?: Array<{
    pregunta: number;
    respuesta: string;
    respuestaCorrecta?: string;
    estado?: 'CORRECTA' | 'INCORRECTA' | 'EN_BLANCO' | 'DOBLE_MARCA' | 'LEIDA' | 'SIN_PATRON' | 'ANULADA';
    anulada?: boolean;
    motivoAnulacion?: string;
    densidades: number[];
  }>;
  imagenCartillaAnotadaPath?: string;
  archivoEscaneadoPath?: string;
  procesadoPor?: string;
  fechaProcesamiento?: string;
}

export interface AnulacionPreguntaOmr {
  id: number;
  rolExamenId: string;
  letraVariante: string;
  numeroPregunta: number;
  motivo: string;
  anuladoPor: string;
  anuladoEn?: string;
  activo: boolean;
}

export interface AnulacionPreguntaOmrRequest {
  letraVariante: string;
  numeroPregunta: number;
  motivo: string;
}

export interface ConfiguracionOmr {
  id?: number;
  alcance?: 'GENERAL' | 'CAMPUS' | 'IMPRESORA';
  campusClave?: string | null;
  campusNombre?: string | null;
  impresoraClave?: string | null;
  activo?: boolean;
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

export interface PatronCalificadoVariante {
  letra: string;
  totalPreguntas: number;
  respuestas: Record<string, string>;
  estudiantes?: Array<{
    codigoEstudiante: string;
    nombreCompleto: string;
  }>;
  trazabilidad?: Array<{
    numeroPresentado: number;
    numeroBanco?: number;
    reactivoId?: string;
    respuestaCorrectaBanco?: string;
    respuestaCorrectaVariante?: string;
  }>;
}

export interface PatronCalificadoResponse {
  rolExamenId: string;
  estado: 'DEVUELTO' | 'PENDIENTE_NOTAS' | 'CALIFICADO';
  variantes: PatronCalificadoVariante[];
}

@Injectable({ providedIn: 'root' })
export class OmrProcesamientoService {
  private readonly _http = inject(HttpClient);

  public procesar(rolExamenId: string, archivo: File, impresora = ''): Observable<OmrJobResponse> {
    return this._enviarArchivo(rolExamenId, archivo, 'procesar', impresora);
  }

  public procesarLecturaConciliacion(rolExamenId: string, archivo: File, impresora = ''): Observable<OmrJobResponse> {
    return this._enviarArchivo(rolExamenId, archivo, 'procesar-lectura', impresora);
  }

  private _enviarArchivo(rolExamenId: string, archivo: File, operacion: string, impresora = ''): Observable<OmrJobResponse> {
    const datos = new FormData();
    datos.append('file', archivo, archivo.name);
    const valorImpresora = impresora.trim();
    const url = valorImpresora
      ? `/api/omr/${rolExamenId}/${operacion}?impresora=${encodeURIComponent(valorImpresora)}`
      : `/api/omr/${rolExamenId}/${operacion}`;
    return this._http.post<OmrJobResponse>(url, datos);
  }

  public consultar(jobId: string): Observable<OmrJobResponse> {
    return this._http.get<OmrJobResponse>(`/api/omr/jobs/${jobId}`);
  }

  public listarCalificaciones(rolExamenId: string): Observable<CalificacionOmrResponse[]> {
    return this._http.get<CalificacionOmrResponse[]>(`/api/omr/${rolExamenId}/calificaciones`);
  }

  public consultarPatronCalificado(rolExamenId: string): Observable<PatronCalificadoResponse> {
    return this._http.get<PatronCalificadoResponse>(`/api/omr/${encodeURIComponent(rolExamenId)}/patron-calificado`);
  }

  public imprimirPatronCalificado(rolExamenId: string): Observable<Blob> {
    return this._http.get(`/api/omr/${encodeURIComponent(rolExamenId)}/patron-calificado/pdf`, {
      responseType: 'blob'
    });
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

  public listarConfiguraciones(): Observable<ConfiguracionOmr[]> {
    return this._http.get<ConfiguracionOmr[]>('/api/omr/configuraciones');
  }

  public guardarConfiguracionPorAlcance(configuracion: ConfiguracionOmr): Observable<ConfiguracionOmr> {
    return this._http.put<ConfiguracionOmr>('/api/omr/configuraciones', configuracion);
  }

  public eliminarConfiguracion(id: number): Observable<void> {
    return this._http.delete<void>(`/api/omr/configuraciones/${id}`);
  }

  public ajustarCalificacion(rolExamenId: string, request: AjustarCalificacionOmrRequest): Observable<CalificacionOmrResponse> {
    return this._http.put<CalificacionOmrResponse>(`/api/omr/${rolExamenId}/calificaciones/ajustar`, request);
  }

  public listarAnulaciones(rolExamenId: string): Observable<AnulacionPreguntaOmr[]> {
    return this._http.get<AnulacionPreguntaOmr[]>(`/api/omr/${encodeURIComponent(rolExamenId)}/anulaciones-preguntas`);
  }

  public anularPregunta(rolExamenId: string, request: AnulacionPreguntaOmrRequest): Observable<AnulacionPreguntaOmr> {
    return this._http.post<AnulacionPreguntaOmr>(`/api/omr/${encodeURIComponent(rolExamenId)}/anulaciones-preguntas`, request);
  }

  public reactivarPregunta(rolExamenId: string, letraVariante: string, numeroPregunta: number): Observable<void> {
    return this._http.delete<void>(`/api/omr/${encodeURIComponent(rolExamenId)}/anulaciones-preguntas/${encodeURIComponent(letraVariante)}/${numeroPregunta}`);
  }
}
