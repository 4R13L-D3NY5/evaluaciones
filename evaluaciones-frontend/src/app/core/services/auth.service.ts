import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, finalize, map, retry, tap } from 'rxjs/operators';
import { AppRole, UsuarioSesion } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private _sessionRequest: Observable<UsuarioSesion | null> | null = null;

  public readonly usuario = signal<UsuarioSesion | null>(null);
  public readonly cargando = signal(false);
  public readonly mostrarAvisoSesion = signal(false);
  public readonly segundosSesion = signal(0);
  public readonly sesionTerminadaVisible = signal(false);
  public readonly renovandoSesion = signal(false);
  private readonly sesionExpirada = signal(false);
  private _sesionExpiraEn = 0;
  private _sesionDuracionSegundos = 0;
  private _temporizadorSesion: ReturnType<typeof setInterval> | null = null;
  private readonly _umbralAvisoSegundos = 5 * 60;

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
        this._establecerSesion(sesion);
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
        this._establecerSesion(sesion);
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
        this._limpiarSesionLocal();
      })
    );
  }

  /** Limpia el estado local cuando el servidor informa que la sesión ya no es válida. */
  public notificarSesionExpirada(): boolean {
    if (this.sesionExpirada() && this.sesionTerminadaVisible()) return false;
    this.sesionExpirada.set(true);
    this.usuario.set(null);
    this._sessionRequest = of(null);
    this.mostrarAvisoSesion.set(false);
    this.sesionTerminadaVisible.set(true);
    this._detenerTemporizadorSesion();
    return true;
  }

  /** Renueva la ventana de inactividad de la sesión HTTP en el backend. */
  public renovarSesion(): Observable<UsuarioSesion> {
    this.renovandoSesion.set(true);
    return this._http.post<UsuarioSesion>('/api/auth/renew', {}).pipe(
      tap(sesion => this._establecerSesion(sesion)),
      finalize(() => this.renovandoSesion.set(false))
    );
  }

  /** Sincroniza el contador con cada petición autenticada exitosa. */
  public registrarActividadSesion(): void {
    if (!this.usuario() || this._sesionDuracionSegundos <= 0 || this.sesionExpirada()) return;
    this._sesionExpiraEn = Date.now() + this._sesionDuracionSegundos * 1000;
    this._actualizarContadorSesion();
  }

  public cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Observable<UsuarioSesion> {
    return this._http.post<UsuarioSesion>('/api/auth/cambiar-contrasena', {
      contrasenaActual,
      contrasenaNueva
    }).pipe(
      tap(sesion => {
        this._establecerSesion(sesion);
      })
    );
  }

  public verificarContrasenaActual(contrasenaActual: string): Observable<void> {
    return this._http.post<void>('/api/auth/verificar-contrasena-actual', { contrasenaActual });
  }

  public tieneRol(roles: AppRole[]): boolean {
    const usuario = this.usuario();
    return !!usuario && roles.includes(usuario.rol);
  }

  private _establecerSesion(sesion: UsuarioSesion): void {
    this.usuario.set(sesion);
    this._sessionRequest = of(sesion);
    this.sesionExpirada.set(false);
    this.sesionTerminadaVisible.set(false);
    this._sesionDuracionSegundos = sesion.sesionDuracionSegundos ?? 30 * 60;
    this._sesionExpiraEn = sesion.sesionExpiraEn
      ?? Date.now() + this._sesionDuracionSegundos * 1000;
    this._iniciarTemporizadorSesion();
  }

  private _iniciarTemporizadorSesion(): void {
    this._detenerTemporizadorSesion();
    this._actualizarContadorSesion();
    this._temporizadorSesion = setInterval(() => this._actualizarContadorSesion(), 1000);
  }

  private _actualizarContadorSesion(): void {
    if (!this.usuario() || this.sesionExpirada()) return;
    const segundosRestantes = Math.max(0, Math.ceil((this._sesionExpiraEn - Date.now()) / 1000));
    this.segundosSesion.set(segundosRestantes);
    if (segundosRestantes === 0) {
      this.mostrarAvisoSesion.set(false);
      this.sesionTerminadaVisible.set(true);
      this.sesionExpirada.set(true);
      this._detenerTemporizadorSesion();
      return;
    }
    this.mostrarAvisoSesion.set(segundosRestantes <= this._umbralAvisoSegundos);
  }

  private _detenerTemporizadorSesion(): void {
    if (this._temporizadorSesion !== null) {
      clearInterval(this._temporizadorSesion);
      this._temporizadorSesion = null;
    }
  }

  private _limpiarSesionLocal(): void {
    this.usuario.set(null);
    this._sessionRequest = of(null);
    this.sesionExpirada.set(false);
    this.mostrarAvisoSesion.set(false);
    this.sesionTerminadaVisible.set(false);
    this.segundosSesion.set(0);
    this._sesionExpiraEn = 0;
    this._sesionDuracionSegundos = 0;
    this._detenerTemporizadorSesion();
  }
}
