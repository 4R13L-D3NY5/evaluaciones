import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { AppRole, UsuarioSesion } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private _sessionRequest: Observable<UsuarioSesion | null> | null = null;

  public readonly usuario = signal<UsuarioSesion | null>(null);
  public readonly cargando = signal(false);

  public iniciarSesion(usuario: string, contrasena: string): Observable<UsuarioSesion> {
    this.cargando.set(true);
    return this._http.post<UsuarioSesion>('/api/auth/login', { usuario, contrasena }).pipe(
      retry({
        count: 3,
        delay: (error, intento) => this._esFalloTransitorio(error)
          ? timer(intento * 1000)
          : throwError(() => error)
      }),
      tap(sesion => {
        this.usuario.set(sesion);
        this._sessionRequest = of(sesion);
        this.cargando.set(false);
      }),
      catchError(error => {
        this.cargando.set(false);
        return throwError(() => error);
      })
    );
  }

  public restaurarSesion(): Observable<UsuarioSesion | null> {
    const usuarioActual = this.usuario();
    if (usuarioActual) return of(usuarioActual);
    if (this._sessionRequest) return this._sessionRequest;

    this.cargando.set(true);
    this._sessionRequest = this._http.get<UsuarioSesion>('/api/auth/session').pipe(
      retry({
        count: 3,
        delay: (error, intento) => this._esFalloTransitorio(error)
          ? timer(intento * 1000)
          : throwError(() => error)
      }),
      tap(sesion => {
        this.usuario.set(sesion);
        this.cargando.set(false);
      }),
      map(sesion => sesion),
      catchError(error => {
        this.usuario.set(null);
        this.cargando.set(false);
        this._sessionRequest = of(null);
        if (error.status === 401) return of(null);
        return throwError(() => error);
      })
    );

    return this._sessionRequest;
  }

  private _esFalloTransitorio(error: { status?: number }): boolean {
    return error?.status === 0 || [502, 503, 504].includes(error?.status || 0);
  }

  public cerrarSesion(): Observable<void> {
    return this._http.post<void>('/api/auth/logout', {}).pipe(
      tap(() => {
        this.usuario.set(null);
        this._sessionRequest = of(null);
      })
    );
  }

  public tieneRol(roles: AppRole[]): boolean {
    const usuario = this.usuario();
    return !!usuario && roles.includes(usuario.rol);
  }
}
