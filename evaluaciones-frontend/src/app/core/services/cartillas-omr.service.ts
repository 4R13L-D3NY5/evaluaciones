import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartillaOmr {
  id: number;
  numeroOrden: number;
  codigoMateria: string;
  grupo: string;
  codigoEstudiante: string;
  nombreCompleto: string;
  estado: 'GENERADA' | 'IMPRESA' | 'ANULADA';
  impresaEn?: string;
}

export interface LoteCartillasOmr {
  id: string;
  rolExamenId: string;
  estado: 'GENERADO' | 'IMPRESO' | 'ANULADO';
  totalCartillas: number;
  archivoPdfPath: string;
  generadoEn?: string;
  impresoEn?: string;
  usuarioImpresion?: string;
  cartillas: CartillaOmr[];
}

@Injectable({ providedIn: 'root' })
export class CartillasOmrService {
  private readonly _http = inject(HttpClient);

  public obtenerUltimo(rolExamenId: string): Observable<LoteCartillasOmr | null> {
    return this._http.get<LoteCartillasOmr | null>(`/api/roles-examen/${rolExamenId}/cartillas/ultimo`);
  }

  public generar(rolExamenId: string): Observable<LoteCartillasOmr> {
    return this._http.post<LoteCartillasOmr>(`/api/roles-examen/${rolExamenId}/cartillas/generar`, {
      usuario: 'ADMIN_EVALUACIONES'
    });
  }

  public marcarImpreso(rolExamenId: string, loteId: string): Observable<LoteCartillasOmr> {
    return this._http.post<LoteCartillasOmr>(
      `/api/roles-examen/${rolExamenId}/cartillas/lotes/${loteId}/marcar-impreso`,
      { usuario: 'ADMIN_EVALUACIONES' }
    );
  }
}
