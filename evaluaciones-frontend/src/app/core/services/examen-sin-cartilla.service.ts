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
  notaSobre30: number | null;
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

  public cargarDocumento(rolExamenId: string, file: File, usuario = 'DOCENTE'): Observable<DocumentoSinCartilla> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('usuario', usuario);
    return this._http.post<DocumentoSinCartilla>(`${this._baseUrl}/${rolExamenId}/documento`, formData);
  }

  public urlDocumento(rolExamenId: string): string {
    return `${this._baseUrl}/${rolExamenId}/documento/archivo`;
  }

  public listarNotas(rolExamenId: string): Observable<NotaDocente[]> {
    return this._http.get<NotaDocente[]>(`${this._baseUrl}/${rolExamenId}/notas`);
  }

  public guardarNotas(rolExamenId: string, notas: { codigoEstudiante: string; notaSobre30: number }[], usuario = 'DOCENTE'): Observable<NotaDocente[]> {
    return this._http.post<NotaDocente[]>(`${this._baseUrl}/${rolExamenId}/notas`, { notas, usuario });
  }
}
