import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ConfiguracionParcial {
  totalPreguntas: number;
  facil: number;
  medio: number;
  dificil: number;
  bancoTotal?: number;
  bancoFacil?: number;
  bancoMedio?: number;
  bancoDificil?: number;
  bancoG1?: number;
  bancoG2?: number;
  bancoG3?: number;
}

export interface ConfiguracionEvaluaciones {
  ratioEstudiantesPorVariante: number;
  duracionExamenVirtualMinutos: number;
  cuentaRegresivaInicioVirtualSegundos: number;
  formatoHoja: string;
  tipoLetra: string;
  tamanoLetraPt: number;
  espaciadoLeading: string;
  estructuraPreguntas: Record<string, ConfiguracionParcial>;
  minutosAntesEntrega: number;
  horasAntesGeneracion: number;
  horasPostPatron: number;
  horasAntesLista: number;
  horasCandado72: number;
  minutosMinimosDevolucion?: number;
  examenEnCurso?: string;
  validarCuotasGrupos?: boolean;
  permitirDirectorEdicionRoles?: boolean;
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

export interface VicerrectorEdicionRol {
  id: number;
  usuario: string;
  ci: string;
  nombreCompleto: string;
  sedesAsignadas: string[];
  puedeEditarRolesExamen: boolean;
  puedeAprobarSolicitudesRol: boolean;
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

  private static obtenerPermitirDirectorCache(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem('sea_config_permitir_director_edicion_roles');
        if (val !== null) return val === 'true';
      }
    } catch (_) {}
    return true;
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
    examenEnCurso: ConfiguracionEvaluacionesService.obtenerExamenEnCursoCache(),
    validarCuotasGrupos: true,
    permitirDirectorEdicionRoles: ConfiguracionEvaluacionesService.obtenerPermitirDirectorCache()
  });

  public obtenerExamenesEnCurso(valor?: string): string[] {
    const raw = valor || this.configuracion().examenEnCurso || '1ER_PARCIAL';
    const lista = raw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    return lista.length > 0 ? lista : ['1ER_PARCIAL'];
  }

  public esParcialHabilitado(parcial: string, valor?: string): boolean {
    const habilitados = this.obtenerExamenesEnCurso(valor);
    const target = (parcial || '').toUpperCase();
    return habilitados.some(h => {
      if (h === target) return true;
      if ((target.includes('1ER') || target === '1P' || target.includes('PRIMER')) && 
          (h.includes('1ER') || h === '1P' || h.includes('PRIMER'))) return true;
      if ((target.includes('2DO') || target === '2P' || target.includes('SEGUNDO')) && 
          (h.includes('2DO') || h === '2P' || h.includes('SEGUNDO'))) return true;
      if (target.includes('FINAL') && h.includes('FINAL')) return true;
      if ((target.includes('2DA') || target.includes('INSTANCIA')) && 
          (h.includes('2DA') || h.includes('INSTANCIA'))) return true;
      return false;
    });
  }

  public resolverListaParcialesDisplay(valor?: string): ('1er Parcial' | '2do Parcial' | 'Examen Final' | '2da Instancia')[] {
    const habilitados = this.obtenerExamenesEnCurso(valor);
    const resultado: ('1er Parcial' | '2do Parcial' | 'Examen Final' | '2da Instancia')[] = [];
    for (const h of habilitados) {
      if (h.includes('1ER') || h === '1P' || h.includes('PRIMER')) {
        if (!resultado.includes('1er Parcial')) resultado.push('1er Parcial');
      } else if (h.includes('2DO') || h === '2P' || h.includes('SEGUNDO')) {
        if (!resultado.includes('2do Parcial')) resultado.push('2do Parcial');
      } else if (h.includes('FINAL')) {
        if (!resultado.includes('Examen Final')) resultado.push('Examen Final');
      } else if (h.includes('2DA') || h.includes('INSTANCIA')) {
        if (!resultado.includes('2da Instancia')) resultado.push('2da Instancia');
      }
    }
    return resultado.length > 0 ? resultado : ['1er Parcial'];
  }

  public resolverListaParcialesDisplayTexto(valor?: string): string {
    return this.resolverListaParcialesDisplay(valor).join(', ');
  }

  public resolverParcialDisplay(valor?: string): '1er Parcial' | '2do Parcial' | 'Examen Final' | '2da Instancia' {
    if (valor && !valor.includes(',')) {
      const v = valor.toUpperCase();
      if (v.includes('2DO') || v.includes('2P') || v.includes('SEGUNDO')) return '2do Parcial';
      if (v.includes('FINAL')) return 'Examen Final';
      if (v.includes('2DA') || v.includes('INSTANCIA')) return '2da Instancia';
      return '1er Parcial';
    }
    const lista = this.resolverListaParcialesDisplay(valor);
    return lista[0] || '1er Parcial';
  }

  public resolverParcialDisplayCorto(valor?: string): '1er Parcial' | '2do Parcial' | 'Final' | '2da Instancia' {
    if (valor && !valor.includes(',')) {
      const v = valor.toUpperCase();
      if (v.includes('2DO') || v.includes('2P') || v.includes('SEGUNDO')) return '2do Parcial';
      if (v.includes('FINAL')) return 'Final';
      if (v.includes('2DA') || v.includes('INSTANCIA')) return '2da Instancia';
      return '1er Parcial';
    }
    const display = this.resolverParcialDisplay(valor);
    if (display === 'Examen Final') return 'Final';
    return display;
  }

  public resolverParcialClavePlan(valor?: string): '1P' | '2P' | 'FINAL' | '2DA_INSTANCIA' {
    if (valor && !valor.includes(',')) {
      const v = valor.toUpperCase();
      if (v.includes('2DO') || v.includes('2P') || v.includes('SEGUNDO')) return '2P';
      if (v.includes('FINAL')) return 'FINAL';
      if (v.includes('2DA') || v.includes('INSTANCIA')) return '2DA_INSTANCIA';
      return '1P';
    }
    const display = this.resolverParcialDisplay(valor);
    if (display === '2do Parcial') return '2P';
    if (display === 'Examen Final') return 'FINAL';
    if (display === '2da Instancia') return '2DA_INSTANCIA';
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
        if (configuracion?.permitirDirectorEdicionRoles !== undefined) {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('sea_config_permitir_director_edicion_roles', String(configuracion.permitirDirectorEdicionRoles));
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
        if (configuracion?.permitirDirectorEdicionRoles !== undefined) {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('sea_config_permitir_director_edicion_roles', String(configuracion.permitirDirectorEdicionRoles));
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

  public listarVicerrectoresEdicion(): Observable<VicerrectorEdicionRol[]> {
    return this._http.get<VicerrectorEdicionRol[]>(`${this._baseUrl}/vicerrectores-edicion`);
  }

  public actualizarPermisoVicerrector(usuarioId: number, puedeEditarRolesExamen: boolean): Observable<VicerrectorEdicionRol> {
    return this._http.put<VicerrectorEdicionRol>(`${this._baseUrl}/vicerrectores-edicion/${usuarioId}`, {
      puedeEditarRolesExamen
    });
  }

  public actualizarPermisoAprobacionVicerrector(usuarioId: number, puedeAprobarSolicitudesRol: boolean): Observable<VicerrectorEdicionRol> {
    return this._http.put<VicerrectorEdicionRol>(`${this._baseUrl}/vicerrectores-aprobacion/${usuarioId}`, {
      puedeAprobarSolicitudesRol
    });
  }
}
