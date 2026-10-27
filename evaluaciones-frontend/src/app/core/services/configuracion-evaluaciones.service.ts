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
  minutosMinimosDevolucion?: number;
  examenEnCurso?: string;
  actualizadoEn?: string;
  actualizadoPor?: string;
}

export interface ConfiguracionVerificacion {
  id?: number;
  sedeCodigo: string;
  sedeNombre: string;
  carreraCodigo?: string;
  carreraNombre?: string;
  habilitada: boolean;
  actualizadoEn?: string;
  actualizadoPor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionEvaluacionesService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/configuracion-evaluaciones';

  private static obtenerExamenEnCursoCache(): string {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('sea_config_examen_en_curso') || '1ER_PARCIAL';
      }
    } catch (_) {}
    return '1ER_PARCIAL';
  }

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
    horasCandado72: 72,
    minutosMinimosDevolucion: 45,
    examenEnCurso: ConfiguracionEvaluacionesService.obtenerExamenEnCursoCache()
  });

  public resolverParcialDisplay(valor?: string): '1er Parcial' | '2do Parcial' | 'Examen Final' | '2da Instancia' {
    const v = (valor || this.configuracion().examenEnCurso || '1ER_PARCIAL').toUpperCase();
    if (v.includes('2DO') || v.includes('2P') || v.includes('SEGUNDO')) return '2do Parcial';
    if (v.includes('FINAL')) return 'Examen Final';
    if (v.includes('2DA') || v.includes('INSTANCIA')) return '2da Instancia';
    return '1er Parcial';
  }

  public resolverParcialDisplayCorto(valor?: string): '1er Parcial' | '2do Parcial' | 'Final' | '2da Instancia' {
    const v = (valor || this.configuracion().examenEnCurso || '1ER_PARCIAL').toUpperCase();
    if (v.includes('2DO') || v.includes('2P') || v.includes('SEGUNDO')) return '2do Parcial';
    if (v.includes('FINAL')) return 'Final';
    if (v.includes('2DA') || v.includes('INSTANCIA')) return '2da Instancia';
    return '1er Parcial';
  }

  public resolverParcialClavePlan(valor?: string): '1P' | '2P' | 'FINAL' | '2DA_INSTANCIA' {
    const v = (valor || this.configuracion().examenEnCurso || '1ER_PARCIAL').toUpperCase();
    if (v.includes('2DO') || v.includes('2P') || v.includes('SEGUNDO')) return '2P';
    if (v.includes('FINAL')) return 'FINAL';
    if (v.includes('2DA') || v.includes('INSTANCIA')) return '2DA_INSTANCIA';
    return '1P';
  }

  public cargar(): Observable<ConfiguracionEvaluaciones> {
    return this._http.get<ConfiguracionEvaluaciones>(this._baseUrl).pipe(
      tap(configuracion => {
        if (configuracion?.examenEnCurso) {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('sea_config_examen_en_curso', configuracion.examenEnCurso);
            }
          } catch (_) {}
        }
        this.configuracion.set(configuracion);
      }),
      catchError(error => {
        console.error('[ConfiguracionEvaluacionesService] Error al cargar configuración:', error);
        return throwError(() => error);
      })
    );
  }

  public guardar(configuracion: Partial<ConfiguracionEvaluaciones> & { ratioEstudiantesPorVariante: number }): Observable<ConfiguracionEvaluaciones> {
    return this._http.put<ConfiguracionEvaluaciones>(this._baseUrl, configuracion).pipe(
      tap(configuracion => {
        if (configuracion?.examenEnCurso) {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('sea_config_examen_en_curso', configuracion.examenEnCurso);
            }
          } catch (_) {}
        }
        this.configuracion.set(configuracion);
      }),
      catchError(error => {
        console.error('[ConfiguracionEvaluacionesService] Error al guardar configuración:', error);
        return throwError(() => error);
      })
    );
  }

  public listarVerificacion(): Observable<ConfiguracionVerificacion[]> {
    return this._http.get<ConfiguracionVerificacion[]>(`${this._baseUrl}/verificacion`);
  }

  public guardarVerificacion(configuracion: ConfiguracionVerificacion): Observable<ConfiguracionVerificacion[]> {
    return this._http.put<ConfiguracionVerificacion[]>(`${this._baseUrl}/verificacion`, configuracion);
  }
}
