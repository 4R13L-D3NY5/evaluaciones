import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export type TipoNotificacion = 'OBSERVACION_BANCO' | 'BANCO_VERIFICADO' | 'VERIFICACION_PENDIENTE' | 'EXAMEN_SIN_BANCO_72H' | 'NOTAS_SIN_CARTILLA_PENDIENTES' | 'SISTEMA' | 'INFO';

export interface NotificacionUsuario {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  materiaCodigo?: string;
  materiaNombre?: string;
  grupo?: string;
  parcial?: string;
  docenteNombre?: string;
  mensaje: string;
  fecha?: string | Date;
  leida: boolean;
  ruta?: string;
  queryParams?: Record<string, any>;
  nivel: 'info' | 'warning' | 'error' | 'success';
  textoAccion?: string;
  horasRestantes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private readonly _http = inject(HttpClient);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  private readonly _storageKey = 'sea_notificaciones_leidas_v1';

  public readonly notificaciones = signal<NotificacionUsuario[]>([]);
  public readonly cargando = signal<boolean>(false);

  /**
   * Alertas pendientes totales que deben llamar la atención del usuario en la campana.
   * Las observaciones de banco devuelto y los exámenes sin cartilla pendientes de notas
   * representan acciones obligatorias y permanecen visibles como alerta hasta su subsanación.
   */
  public readonly totalAlertasCount = computed(() =>
    this.notificaciones().filter(n => n.tipo === 'OBSERVACION_BANCO' || n.tipo === 'NOTAS_SIN_CARTILLA_PENDIENTES' || !n.leida).length
  );

  public readonly noLeidasCount = computed(() =>
    this.notificaciones().filter(n => !n.leida).length
  );

  constructor() {
    // Sincronización reactiva inmediata ante inicio de sesión o restauración de token
    effect(() => {
      const usuario = this._authService.usuario();
      untracked(() => {
        if (usuario && usuario.rol !== 'ADMINISTRADOR_SISTEMA') {
          this.cargarNotificaciones();
        } else {
          this.notificaciones.set([]);
        }
      });
    }, { allowSignalWrites: true });

    // Sondeo periódico inteligente (cada 3 min): no se ejecuta si la pestaña está oculta o si es administrador
    if (typeof window !== 'undefined') {
      setInterval(() => {
        const usuario = this._authService.usuario();
        if (usuario && usuario.rol !== 'ADMINISTRADOR_SISTEMA' && !document.hidden) {
          this.cargarNotificaciones();
        }
      }, 180000); // 3 minutos

      // Al volver a la pestaña tras estar inactiva, refrescar si es docente o director
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          const usuario = this._authService.usuario();
          if (usuario && usuario.rol !== 'ADMINISTRADOR_SISTEMA') {
            this.cargarNotificaciones();
          }
        }
      });
    }
  }

  public cargarNotificaciones(): void {
    const usuario = this._authService.usuario();
    if (!usuario || usuario.rol === 'ADMINISTRADOR_SISTEMA') {
      this.notificaciones.set([]);
      return;
    }

    const esDocente = usuario.rol === 'DOCENTE';
    const esDirector = usuario.rol === 'DIRECTOR_CARRERA';

    if (!esDocente && !esDirector) {
      this.notificaciones.set([]);
      return;
    }

    this.cargando.set(true);
    this._http.get<NotificacionUsuario[]>('/api/notificaciones/resumen').subscribe({
      next: (items) => {
        const leidas = this._obtenerIdsLeidos();
        const lista: NotificacionUsuario[] = (items || []).map(item => ({
          ...item,
          leida: leidas.has(item.id)
        }));

        // Limpiar automáticamente de localStorage IDs de alertas que ya fueron subsanadas
        const idsActuales = new Set(lista.map(i => i.id));
        const leidasActualizadas = new Set(Array.from(leidas).filter(id => idsActuales.has(id)));
        if (leidasActualizadas.size !== leidas.size) {
          this._guardarIdsLeidos(leidasActualizadas);
        }

        this.notificaciones.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  public marcarComoLeida(id: string): void {
    const leidas = this._obtenerIdsLeidos();
    leidas.add(id);
    this._guardarIdsLeidos(leidas);

    this.notificaciones.update(items =>
      items.map(item => item.id === id ? { ...item, leida: true } : item)
    );
  }

  public marcarTodasComoLeidas(): void {
    const leidas = this._obtenerIdsLeidos();
    this.notificaciones().forEach(n => leidas.add(n.id));
    this._guardarIdsLeidos(leidas);

    this.notificaciones.update(items =>
      items.map(item => ({ ...item, leida: true }))
    );
  }

  public abrirNotificacion(notif: NotificacionUsuario): void {
    this.marcarComoLeida(notif.id);
    if (notif.ruta) {
      this._router.navigate([notif.ruta], { queryParams: notif.queryParams });
    }
  }

  /**
   * Elimina el estado de observación devuelta cuando el docente reenvía el examen corregido,
   * forzando la actualización inmediata de la campana.
   */
  public limpiarObservacion(rolId: string): void {
    const leidas = this._obtenerIdsLeidos();
    leidas.delete('obs-' + rolId);
    leidas.delete('dir-obs-' + rolId);
    this._guardarIdsLeidos(leidas);
    this.cargarNotificaciones();
  }

  /**
   * Elimina la alerta de notas pendientes cuando el docente concluye y guarda las notas sobre 60 puntos.
   */
  public limpiarNotasPendientes(rolId: string): void {
    const leidas = this._obtenerIdsLeidos();
    leidas.delete('sin-cartilla-notas-' + rolId);
    this._guardarIdsLeidos(leidas);
    this.cargarNotificaciones();
  }

  private _obtenerIdsLeidos(): Set<string> {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) {
        return new Set(JSON.parse(raw));
      }
    } catch {
      // Ignorar error de storage
    }
    return new Set<string>();
  }

  private _guardarIdsLeidos(ids: Set<string>): void {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(Array.from(ids)));
    } catch {
      // Ignorar error de storage
    }
  }
}
