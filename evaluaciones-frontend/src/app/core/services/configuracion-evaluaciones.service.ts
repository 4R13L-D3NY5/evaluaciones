import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ConfiguracionEvaluaciones {
  ratioEstudiantesPorVariante: number;
  duracionExamenVirtualMinutos: number;
  cuentaRegresivaInicioVirtualSegundos: number;
  formatoHoja: string;
  tipoLetra: string;
  tamanoLetraPt: number;
  espaciadoLeading: string;
  estructuraPreguntas: Record<string, { totalPreguntas: number; facil: number; medio: number; dificil: number }>;
  minutosAntesEntrega: number;
  horasAntesGeneracion: number;
  horasPostPatron: number;
  horasAntesLista: number;
  horasCandado72: number;
  actualizadoEn?: string;
  actualizadoPor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionEvaluacionesService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/configuracion-evaluaciones';

  public readonly configuracion = signal<ConfiguracionEvaluaciones>({
    ratioEstudiantesPorVariante: 5,
    duracionExamenVirtualMinutos: 45,
    cuentaRegresivaInicioVirtualSegundos: 15,
    formatoHoja: 'Oficio (Folio UNITEPC)',
    tipoLetra: 'Times New Roman',
    tamanoLetraPt: 11,
    espaciadoLeading: '0.8em (línea) · 1.2em (pregunta)',
    estructuraPreguntas: {
      '1P': { totalPreguntas: 30, facil: 7, medio: 16, dificil: 7 },
      '2P': { totalPreguntas: 30, facil: 7, medio: 16, dificil: 7 },
      'FINAL': { totalPreguntas: 60, facil: 15, medio: 30, dificil: 15 },
      '2DA_INSTANCIA': { totalPreguntas: 50, facil: 10, medio: 25, dificil: 15 }
    },
    minutosAntesEntrega: 15,
    horasAntesGeneracion: 144,
    horasPostPatron: 8,
    horasAntesLista: 24,
    horasCandado72: 72
  });

  public cargar(): Observable<ConfiguracionEvaluaciones> {
    return this._http.get<ConfiguracionEvaluaciones>(this._baseUrl).pipe(
      tap(configuracion => this.configuracion.set(configuracion)),
      catchError(error => {
        console.error('[ConfiguracionEvaluacionesService] Error al cargar configuración:', error);
        return throwError(() => error);
      })
    );
  }

  public guardar(configuracion: Partial<ConfiguracionEvaluaciones> & { ratioEstudiantesPorVariante: number }): Observable<ConfiguracionEvaluaciones> {
    return this._http.put<ConfiguracionEvaluaciones>(this._baseUrl, configuracion).pipe(
      tap(configuracion => this.configuracion.set(configuracion)),
      catchError(error => {
        console.error('[ConfiguracionEvaluacionesService] Error al guardar configuración:', error);
        return throwError(() => error);
      })
    );
  }
}
