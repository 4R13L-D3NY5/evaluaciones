import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlcanceAcademico {
  codigo: string;
  nombre: string;
}

export interface AsignacionAcademica {
  sedeCodigo: string;
  sedeNombre: string;
  carreraCodigo: string;
  carreraNombre: string;
  asignaturaCodigo?: string;
  asignaturaNombre?: string;
}

export interface AlcanceCampus {
  sedeCodigo: string;
  sedeNombre: string;
  campusId?: string;
  campusCodigo?: string;
  campusNombre: string;
  habilitado: boolean;
}

export interface RolSistema {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface UsuarioSistema {
  id: number;
  ci: string;
  usuario: string;
  nombreCompleto: string;
  rol: string;
  rolNombre: string;
  activo: boolean;
  debeCambiarContrasena: boolean;
  proveedorIdentidad: string;
  sedes: AlcanceAcademico[];
  carreras: AlcanceAcademico[];
  campuses: AlcanceCampus[];
  asignaciones: AsignacionAcademica[];
  ultimoIngreso?: string;
  creadoEn?: string;
}

export interface UsuarioSistemaRequest {
  ci: string;
  nombreCompleto: string;
  rolCodigo: string;
  activo: boolean;
  sedes: AlcanceAcademico[];
  carreras: AlcanceAcademico[];
  campuses: AlcanceCampus[];
  asignaciones: AsignacionAcademica[];
}

export interface CredencialTemporal {
  fila: number;
  ci: string;
  nombreCompleto: string;
  rol: string;
  usuario: string;
  contrasenaTemporal: string;
  operacion: string;
}

export interface ErrorImportacionUsuario {
  fila: number;
  ci: string;
  detalle: string;
}

export interface ImportacionUsuariosResponse {
  totalFilas: number;
  creados: number;
  actualizados: number;
  credencialesTemporales: CredencialTemporal[];
  errores: ErrorImportacionUsuario[];
}

export interface DocenteSeaAnalisis {
  ci: string;
  nombreCompleto: string;
  gruposSea: number;
  presenteEnSea: boolean;
  tieneCuenta: boolean;
  cuentaActiva: boolean;
  usuarioId?: number;
  rolCodigo?: string;
  proveedorIdentidad?: string;
  estado: 'CON_ACCESO' | 'NUEVO' | 'SIN_ACCESO' | 'ROL_DIFERENTE' | 'YA_NO_ESTA';
}

export interface AnalisisDocentesSeaResponse {
  gestion: string;
  consultadoEn: string;
  docentesEnSea: number;
  conAcceso: number;
  nuevos: number;
  sinAcceso: number;
  yaNoEstan: number;
  cuentasConRolDiferente: number;
  docentesSinCi: number;
  docentes: DocenteSeaAnalisis[];
}

export interface SincronizacionDocentesSeaResponse {
  solicitados: number;
  creados: number;
  actualizados: number;
  reactivados: number;
  desactivados: number;
  credencialesTemporales: CredencialTemporal[];
  errores: ErrorImportacionUsuario[];
}

@Injectable({ providedIn: 'root' })
export class UsuariosSistemaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/usuarios';

  listar(contexto: 'EVALUACIONES' | 'INSTITUCIONAL' = 'INSTITUCIONAL'): Observable<UsuarioSistema[]> {
    return this.http.get<UsuarioSistema[]>(this.baseUrl, { params: { contexto } });
  }

  listarRoles(): Observable<RolSistema[]> {
    return this.http.get<RolSistema[]>(`${this.baseUrl}/roles`);
  }

  analizarDocentesSea(gestion = '2-2026'): Observable<AnalisisDocentesSeaResponse> {
    return this.http.get<AnalisisDocentesSeaResponse>(`${this.baseUrl}/docentes-sea`, { params: { gestion } });
  }

  sincronizarDocentesSea(cis: string[] = [], desactivarAusentes = false, gestion = '2-2026'): Observable<SincronizacionDocentesSeaResponse> {
    return this.http.post<SincronizacionDocentesSeaResponse>(`${this.baseUrl}/docentes-sea/sincronizar`, {
      cis,
      desactivarAusentes
    }, { params: { gestion } });
  }

  crear(request: UsuarioSistemaRequest): Observable<UsuarioSistema> {
    return this.http.post<UsuarioSistema>(this.baseUrl, request);
  }

  actualizar(id: number, request: UsuarioSistemaRequest): Observable<UsuarioSistema> {
    return this.http.put<UsuarioSistema>(`${this.baseUrl}/${id}`, request);
  }

  importar(archivo: File): Observable<ImportacionUsuariosResponse> {
    const data = new FormData();
    data.append('archivo', archivo);
    return this.http.post<ImportacionUsuariosResponse>(`${this.baseUrl}/importar`, data);
  }

  restablecerContrasena(id: number): Observable<CredencialTemporal> {
    return this.http.post<CredencialTemporal>(`${this.baseUrl}/${id}/restablecer-contrasena`, {});
  }

  descargarPlantilla(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/plantilla`, { responseType: 'blob' });
  }
}
