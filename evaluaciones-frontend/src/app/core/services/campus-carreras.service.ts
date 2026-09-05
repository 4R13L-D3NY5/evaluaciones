import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface CarreraCampusAsignada {
  codigo: string;
  nombre: string;
}

export interface IdentidadCampus {
  sedeCodigo?: string;
  campusId?: string;
  campusCodigo?: string;
  campusNombre: string;
}

@Injectable({ providedIn: 'root' })
export class CampusCarrerasService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/catalogo-academico/campus-carreras';
  private readonly _storageKey = 'sea.campus.carreras.asignadas.v1';

  public listarRemoto(campus: IdentidadCampus): Observable<CarreraCampusAsignada[]> {
    let params = new HttpParams()
      .set('sedeCodigo', campus.sedeCodigo || '')
      .set('campusNombre', campus.campusNombre);
    if (campus.campusId) params = params.set('campusId', campus.campusId);
    if (campus.campusCodigo) params = params.set('campusCodigo', campus.campusCodigo);
    return this._http.get<CarreraCampusAsignada[]>(this._baseUrl, { params });
  }

  public guardarRemoto(
    campus: IdentidadCampus,
    carreras: { id: number; nombre: string }[]
  ): Observable<CarreraCampusAsignada[]> {
    const payload = {
      sedeCodigo: campus.sedeCodigo || '',
      campusId: campus.campusId || '',
      campusCodigo: campus.campusCodigo || '',
      campusNombre: campus.campusNombre,
      carreras: carreras
        .map(carrera => ({ codigo: this.codigoCarrera(carrera.nombre), nombre: this.nombreCarrera(carrera.nombre) }))
        .filter(carrera => !!carrera.codigo && !!carrera.nombre)
    };
    return this._http.put<CarreraCampusAsignada[]>(this._baseUrl, payload).pipe(
      tap(respuesta => this.guardarRespuesta(campus, respuesta))
    );
  }

  public guardar(campus: IdentidadCampus, carreras: { id: number; nombre: string }[]): void {
    this.guardarRespuesta(campus, carreras
      .map(carrera => ({ codigo: this.codigoCarrera(carrera.nombre), nombre: this.nombreCarrera(carrera.nombre) }))
      .filter(carrera => !!carrera.codigo && !!carrera.nombre));
  }

  public listar(campus: IdentidadCampus): CarreraCampusAsignada[] {
    const registro = this.leer().find(item => this.clave(item) === this.clave(campus));
    return registro?.carreras || [];
  }

  public estaConfigurado(campus: IdentidadCampus): boolean {
    return this.leer().some(item => this.clave(item) === this.clave(campus));
  }

  private leer(): (IdentidadCampus & { carreras: CarreraCampusAsignada[] })[] {
    try {
      const contenido = localStorage.getItem(this._storageKey);
      if (!contenido) return [];
      const registros = JSON.parse(contenido) as unknown;
      if (!Array.isArray(registros)) return [];
      return registros.filter(item => item && typeof item === 'object').map(item => {
        const registro = item as Partial<IdentidadCampus & { carreras: CarreraCampusAsignada[] }>;
        return {
          sedeCodigo: registro.sedeCodigo || '',
          campusId: registro.campusId || '',
          campusCodigo: registro.campusCodigo || '',
          campusNombre: registro.campusNombre || '',
          carreras: Array.isArray(registro.carreras)
            ? registro.carreras.filter(carrera => carrera && !!carrera.codigo && !!carrera.nombre)
            : []
        };
      });
    } catch {
      return [];
    }
  }

  private escribir(registros: (IdentidadCampus & { carreras: CarreraCampusAsignada[] })[]): void {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(registros));
    } catch {
      return;
    }
  }

  private clave(campus: IdentidadCampus): string {
    const identificador = campus.campusId || campus.campusCodigo || campus.campusNombre;
    return `${this.normalizar(String(campus.sedeCodigo ?? ''))}|${this.normalizar(String(identificador ?? ''))}`;
  }

  private codigoCarrera(nombre: string): string {
    const separador = nombre.indexOf(' · ');
    return (separador >= 0 ? nombre.slice(0, separador) : nombre.split(' ')[0]).trim().toUpperCase();
  }

  private nombreCarrera(nombre: string): string {
    const separador = nombre.indexOf(' · ');
    const codigo = this.codigoCarrera(nombre);
    let resultado = (separador >= 0 ? nombre.slice(separador + 3) : nombre).trim();
    const prefijo = `${codigo} · `;
    while (resultado.toUpperCase().startsWith(prefijo.toUpperCase())) resultado = resultado.slice(prefijo.length).trim();
    return resultado;
  }

  private guardarRespuesta(campus: IdentidadCampus, carreras: CarreraCampusAsignada[]): void {
    const registros = this.leer();
    const registro = {
      sedeCodigo: campus.sedeCodigo || '',
      campusId: campus.campusId || '',
      campusCodigo: campus.campusCodigo || '',
      campusNombre: campus.campusNombre,
      carreras: carreras || []
    };
    const clave = this.clave(campus);
    this.escribir([...registros.filter(item => this.clave(item) !== clave), registro]);
  }

  private normalizar(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  }
}
