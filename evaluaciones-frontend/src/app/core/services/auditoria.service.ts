import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditoriaGlobalItem {
  id: string;
  tipo: 'EVALUACION' | 'USUARIO' | 'RESPALDO' | 'VERIFICACION';
  modulo: string;
  accion: string;
  codigoAccion: string;
  usuario: string;
  usuarioNombre: string;
  usuarioCargo: string;
  ipOrigen: string;
  campus: string;
  nivel: 'INFO' | 'ADVERTENCIA' | 'OPERACION_CRITICA';
  detallesJson?: string;
  fechaEvento: string;
}

export interface AuditoriaResumen {
  totalEventos: number;
  ipsUnicas: number;
  operacionesCriticas: number;
  alertasSeguridad: number;
  items: AuditoriaGlobalItem[];
}

export interface FiltrosAuditoria {
  modulo?: string;
  nivel?: string;
  busqueda?: string;
  limite?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auditoria';

  public obtenerAuditoria(filtros?: FiltrosAuditoria): Observable<AuditoriaResumen> {
    let params = new HttpParams();
    if (filtros?.modulo && filtros.modulo !== 'TODOS') {
      params = params.set('modulo', filtros.modulo);
    }
    if (filtros?.nivel && filtros.nivel !== 'TODOS') {
      params = params.set('nivel', filtros.nivel);
    }
    if (filtros?.busqueda && filtros.busqueda.trim()) {
      params = params.set('busqueda', filtros.busqueda.trim());
    }
    if (filtros?.limite) {
      params = params.set('limite', filtros.limite.toString());
    }
    return this.http.get<AuditoriaResumen>(this.baseUrl, { params });
  }
}
