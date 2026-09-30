import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstudianteSincronizadoDetalle {
  codigoEstudiante: string;
  studentOldCode?: number;
  nombreCompleto: string;
  score: number;
  completado?: boolean | null;
  observacion?: string;
  esReprogramado?: boolean;
}

export interface SincronizacionNotasSeaReporte {
  rolExamenId: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  modalidad: string;
  tipoParcial: string;
  syllabusCourseId?: string;
  groupId?: string;
  totalEstudiantes: number;
  totalExitosos: number;
  totalFallidos: number;
  fechaSincronizacion?: string;
  sincronizadoPor?: string;
  estudiantes: EstudianteSincronizadoDetalle[];
}

@Injectable({ providedIn: 'root' })
export class SincronizacionSeaService {
  private readonly _http = inject(HttpClient);

  public obtenerVistaPrevia(rolExamenId: string): Observable<SincronizacionNotasSeaReporte> {
    return this._http.get<SincronizacionNotasSeaReporte>(
      `/api/integracion/roles/${encodeURIComponent(rolExamenId)}/sincronizar-sea/previa`
    );
  }

  public sincronizarNotas(rolExamenId: string): Observable<SincronizacionNotasSeaReporte> {
    return this._http.post<SincronizacionNotasSeaReporte>(
      `/api/integracion/roles/${encodeURIComponent(rolExamenId)}/sincronizar-sea`,
      {}
    );
  }
}
