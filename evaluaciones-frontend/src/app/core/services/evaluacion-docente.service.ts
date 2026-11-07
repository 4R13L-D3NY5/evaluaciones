import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EvaluacionInstrumento,
  EvaluacionDocenteRegistro,
  EvaluacionDocenteAplicarRequest
} from '../models/evaluacion-docente.models';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionDocenteService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/evaluacion-docente';

  public obtenerInstrumentoVigente(): Observable<EvaluacionInstrumento> {
    return this._http.get<EvaluacionInstrumento>(`${this._baseUrl}/instrumento-vigente`);
  }

  public listarInstrumentos(): Observable<EvaluacionInstrumento[]> {
    return this._http.get<EvaluacionInstrumento[]>(`${this._baseUrl}/instrumentos`);
  }

  public obtenerInstrumentoPorId(id: string): Observable<EvaluacionInstrumento> {
    return this._http.get<EvaluacionInstrumento>(`${this._baseUrl}/instrumentos/${id}`);
  }

  public guardarInstrumento(instrumento: Partial<EvaluacionInstrumento>): Observable<EvaluacionInstrumento> {
    return this._http.post<EvaluacionInstrumento>(`${this._baseUrl}/instrumentos`, instrumento);
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
}
