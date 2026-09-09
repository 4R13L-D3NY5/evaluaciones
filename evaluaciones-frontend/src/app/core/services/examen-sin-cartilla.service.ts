import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DocumentoSinCartilla {
  id: string;
  rolExamenId: string;
  nombreArchivo: string;
  tipoArchivo: string;
  tamanoBytes: number;
  hashSha256: string;
  cargadoPor: string;
  cargadoEn: string;
}

export interface NotaDocente {
  id?: number;
  codigoEstudiante: string;
  estudianteNombreCompleto: string;
  notaSobre60: number | null;
  notaSobre100: number | null;
  guardadoEn?: string;
  guardadoPor?: string;
}

@Injectable({ providedIn: 'root' })
export class ExamenSinCartillaService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/examenes-sin-cartilla';

  public obtenerDocumento(rolExamenId: string): Observable<DocumentoSinCartilla> {
    return this._http.get<DocumentoSinCartilla>(`${this._baseUrl}/${rolExamenId}/documento`);
  }

  public cargarDocumento(rolExamenId: string, file: File): Observable<DocumentoSinCartilla> {
    const formData = new FormData();
    formData.append('file', file);
    return this._http.post<DocumentoSinCartilla>(`${this._baseUrl}/${rolExamenId}/documento`, formData);
  }

  public eliminarDocumento(rolExamenId: string): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${rolExamenId}/documento`);
  }

  public urlDocumento(rolExamenId: string): string {
    return `${this._baseUrl}/${rolExamenId}/documento/archivo`;
  }

  public descargarDocumento(rolExamenId: string): Observable<Blob> {
    return this._http.get(this.urlDocumento(rolExamenId), { responseType: 'blob' });
  }

  public listarNotas(rolExamenId: string): Observable<NotaDocente[]> {
    return this._http.get<NotaDocente[]>(`${this._baseUrl}/${rolExamenId}/notas`);
  }

  public guardarNotas(rolExamenId: string, notas: { codigoEstudiante: string; notaSobre60: number }[]): Observable<NotaDocente[]> {
    return this._http.post<NotaDocente[]>(`${this._baseUrl}/${rolExamenId}/notas`, { notas });
  }
}
