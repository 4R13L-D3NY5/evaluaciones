import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InterpretacionVocacional,
  TestVocacionalActualizarRequest,
  TestVocacionalFiltros,
  TestVocacionalItem,
  TestVocacionalProcesarResponse
} from '../models/test-vocacional.models';

@Injectable({ providedIn: 'root' })
export class TestVocacionalService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/test-vocacional';

  public procesar(
    archivo: File,
    colegio: string,
    curso: string,
    fecha?: string,
    guardarPdf: boolean = false,
    ocrNombre: boolean = false,
    ocrCelular: boolean = false,
    ocrCorreo: boolean = false,
    sede?: string,
    gestion?: string,
    municipio?: string
  ): Observable<TestVocacionalProcesarResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('colegio', colegio);
    formData.append('curso', curso);
    if (fecha) {
      formData.append('fecha', fecha);
    }
    if (sede) {
      formData.append('sede', sede);
    }
    if (gestion) {
      formData.append('gestion', gestion);
    }
    if (municipio) {
      formData.append('municipio', municipio);
    }
    formData.append('guardarPdf', String(guardarPdf));
    formData.append('ocrNombre', String(ocrNombre));
    formData.append('ocrCelular', String(ocrCelular));
    formData.append('ocrCorreo', String(ocrCorreo));
    return this._http.post<TestVocacionalProcesarResponse>(`${this._baseUrl}/procesar`, formData);
  }

  public consultarJob(jobId: string): Observable<TestVocacionalProcesarResponse> {
    return this._http.get<TestVocacionalProcesarResponse>(`${this._baseUrl}/jobs/${jobId}`);
  }

  public listar(
    colegio?: string,
    curso?: string,
    fecha?: string,
    busqueda?: string
  ): Observable<TestVocacionalItem[]> {
    let params = new HttpParams();
    if (colegio) params = params.set('colegio', colegio);
    if (curso) params = params.set('curso', curso);
    if (fecha) params = params.set('fecha', fecha);
    if (busqueda) params = params.set('busqueda', busqueda);
    return this._http.get<TestVocacionalItem[]>(this._baseUrl, { params });
  }

  public obtenerFiltros(): Observable<TestVocacionalFiltros> {
    return this._http.get<TestVocacionalFiltros>(`${this._baseUrl}/filtros`);
  }

  public obtenerPorId(id: number): Observable<TestVocacionalItem> {
    return this._http.get<TestVocacionalItem>(`${this._baseUrl}/${id}`);
  }

  public obtenerInterpretacion(id: number): Observable<InterpretacionVocacional> {
    return this._http.get<InterpretacionVocacional>(`${this._baseUrl}/${id}/interpretacion`);
  }

  public actualizar(id: number, data: TestVocacionalActualizarRequest): Observable<TestVocacionalItem> {
    return this._http.put<TestVocacionalItem>(`${this._baseUrl}/${id}`, data);
  }

  public eliminar(id: number): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${id}`);
  }

  public eliminarPaquete(colegio: string, curso: string): Observable<{ mensaje: string; eliminados: number }> {
    let params = new HttpParams().set('colegio', colegio).set('curso', curso);
    return this._http.delete<{ mensaje: string; eliminados: number }>(`${this._baseUrl}/paquete`, { params });
  }

  public exportarExcel(
    colegio?: string,
    curso?: string,
    fecha?: string,
    busqueda?: string
  ): Observable<Blob> {
    let params = new HttpParams();
    if (colegio) params = params.set('colegio', colegio);
    if (curso) params = params.set('curso', curso);
    if (fecha) params = params.set('fecha', fecha);
    if (busqueda) params = params.set('busqueda', busqueda);
    return this._http.get(`${this._baseUrl}/exportar`, {
      params,
      responseType: 'blob'
    });
  }

  public getPreviewUrl(id: number, version: number = 0): string {
    return version ? `${this._baseUrl}/${id}/preview?v=${version}` : `${this._baseUrl}/${id}/preview`;
  }
}
