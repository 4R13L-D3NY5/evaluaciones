import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EvaluacionInstrumento,
  EvaluacionDocenteRegistro,
  EvaluacionDocenteAplicarRequest,
  EstudianteAvanceEvaluacion,
  EvaluacionEstudianteAplicarRequest,
  EvaluacionConsolidadaDocenteMateria,
  SemestreHabilitacionEstado,
  HabilitarSemestresRequest
} from '../models/evaluacion-docente.models';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionDocenteService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/evaluacion-docente';
  private readonly _estudianteBaseUrl = '/api/evaluacion-docente-estudiante';

  public obtenerInstrumentoVigente(): Observable<EvaluacionInstrumento> {
    return this._http.get<EvaluacionInstrumento>(`${this._baseUrl}/instrumento-vigente`);
  }

  public listarInstrumentos(): Observable<EvaluacionInstrumento[]> {
    return this._http.get<EvaluacionInstrumento[]>(`${this._baseUrl}/instrumentos`);
  }

  public obtenerInstrumentoPorId(id: string): Observable<EvaluacionInstrumento> {
    return this._http.get<EvaluacionInstrumento>(`${this._baseUrl}/instrumentos/${id}`);
  }

  public guardarInstrumento(payload: any): Observable<EvaluacionInstrumento> {
    return this._http.post<EvaluacionInstrumento>(`${this._baseUrl}/instrumentos`, payload);
  }

  public ponerEnVigencia(id: string): Observable<EvaluacionInstrumento> {
    return this._http.put<EvaluacionInstrumento>(`${this._baseUrl}/instrumentos/${id}/poner-en-vigencia`, {});
  }

  public listarRegistros(gestion: string, sedeCodigo: string, carreraCodigo?: string): Observable<EvaluacionDocenteRegistro[]> {
    let params = new HttpParams()
      .set('gestion', gestion)
      .set('sedeCodigo', sedeCodigo);

    if (carreraCodigo && carreraCodigo !== 'TODAS') {
      params = params.set('carreraCodigo', carreraCodigo);
    }

    return this._http.get<EvaluacionDocenteRegistro[]>(`${this._baseUrl}/registros`, { params });
  }

  public obtenerRegistroPorId(id: string): Observable<EvaluacionDocenteRegistro> {
    return this._http.get<EvaluacionDocenteRegistro>(`${this._baseUrl}/registros/${id}`);
  }

  public aplicarEvaluacion(payload: EvaluacionDocenteAplicarRequest): Observable<EvaluacionDocenteRegistro> {
    return this._http.post<EvaluacionDocenteRegistro>(`${this._baseUrl}/aplicar`, payload);
  }

  public restablecerEvaluacion(id: string): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/registros/${id}`);
  }

  // --- Evaluaciones de Estudiantes ---

  public consultarMateriasEstudiante(codigoEstudiante: string, gestion?: string): Observable<EstudianteAvanceEvaluacion> {
    let params = new HttpParams().set('codigoEstudiante', codigoEstudiante);
    if (gestion) params = params.set('gestion', gestion);
    return this._http.get<EstudianteAvanceEvaluacion>(`${this._estudianteBaseUrl}/materias`, { params });
  }

  public obtenerInstrumentoEstudianteVigente(): Observable<EvaluacionInstrumento> {
    return this._http.get<EvaluacionInstrumento>(`${this._estudianteBaseUrl}/instrumento-vigente`);
  }

  public aplicarEvaluacionEstudiante(payload: EvaluacionEstudianteAplicarRequest): Observable<any> {
    return this._http.post<any>(`${this._estudianteBaseUrl}/evaluar`, payload);
  }

  public listarAvanceEstudiantesPorCarrera(sedeCodigo: string, carreraCodigo: string, gestion?: string): Observable<EstudianteAvanceEvaluacion[]> {
    let params = new HttpParams()
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo);
    if (gestion) params = params.set('gestion', gestion);
    return this._http.get<EstudianteAvanceEvaluacion[]>(`${this._baseUrl}/avance-estudiantes`, { params });
  }

  public listarResumenConsolidado(sedeCodigo: string, carreraCodigo: string, gestion?: string): Observable<EvaluacionConsolidadaDocenteMateria[]> {
    let params = new HttpParams()
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo);
    if (gestion) params = params.set('gestion', gestion);
    return this._http.get<EvaluacionConsolidadaDocenteMateria[]>(`${this._baseUrl}/resumen-consolidado`, { params });
  }

  // --- Habilitación de Semestres por Director (Ventana de 90 Minutos) ---

  public listarEstadosSemestres(sedeCodigo: string, carreraCodigo: string, gestion?: string): Observable<SemestreHabilitacionEstado[]> {
    let params = new HttpParams()
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo);
    if (gestion) params = params.set('gestion', gestion);
    return this._http.get<SemestreHabilitacionEstado[]>(`${this._baseUrl}/semestres/estados`, { params });
  }

  public habilitarSemestres(request: HabilitarSemestresRequest): Observable<SemestreHabilitacionEstado[]> {
    return this._http.post<SemestreHabilitacionEstado[]>(`${this._baseUrl}/semestres/habilitar`, request);
  }

  public deshabilitarSemestre(sedeCodigo: string, carreraCodigo: string, semestre: number, gestion?: string): Observable<SemestreHabilitacionEstado[]> {
    let params = new HttpParams()
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo)
      .set('semestre', semestre.toString());
    if (gestion) params = params.set('gestion', gestion);
    return this._http.post<SemestreHabilitacionEstado[]>(`${this._baseUrl}/semestres/deshabilitar`, null, { params });
  }
}
