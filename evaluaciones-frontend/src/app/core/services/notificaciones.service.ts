import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { RolExamenService, RolExamenResponse } from './rol-examen.service';
import { Router } from '@angular/router';

export type TipoNotificacion = 'OBSERVACION_BANCO' | 'VERIFICACION_PENDIENTE' | 'SISTEMA' | 'INFO';

export interface NotificacionUsuario {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  materiaCodigo?: string;
  materiaNombre?: string;
  grupo?: string;
  parcial?: string;
  mensaje: string;
  fecha?: string | Date;
  leida: boolean;
  ruta?: string;
  queryParams?: Record<string, any>;
  nivel: 'info' | 'warning' | 'error' | 'success';
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private readonly _authService = inject(AuthService);
  private readonly _rolService = inject(RolExamenService);
  private readonly _router = inject(Router);

  private readonly _storageKey = 'sea_notificaciones_leidas_v1';

  public readonly notificaciones = signal<NotificacionUsuario[]>([]);
  public readonly cargando = signal<boolean>(false);

  public readonly noLeidasCount = computed(() =>
    this.notificaciones().filter(n => !n.leida).length
  );

  constructor() {
    this.cargarNotificaciones();
  }

  public cargarNotificaciones(): void {
    const usuario = this._authService.usuario();
    if (!usuario) {
      this.notificaciones.set([]);
      return;
    }

    const esDocente = usuario.rol === 'DOCENTE';

    if (esDocente) {
      this._cargarNotificacionesDocente();
    } else {
      // Arquitectura extensible para otros roles en fases posteriores
      this.notificaciones.set([]);
    }
  }

  private _cargarNotificacionesDocente(): void {
    this.cargando.set(true);
    this._rolService.listar().subscribe({
      next: (roles: RolExamenResponse[]) => {
        const leidas = this._obtenerIdsLeidos();
        const lista: NotificacionUsuario[] = [];

        roles.forEach(rol => {
          if (rol.estadoVerificacion === 'DEVUELTO') {
            const id = 'obs-' + rol.id;
            lista.push({
              id,
              tipo: 'OBSERVACION_BANCO',
              titulo: 'Banco de preguntas observado',
              materiaCodigo: rol.materiaCodigo,
              materiaNombre: rol.materiaNombre,
              grupo: rol.grupo,
              parcial: rol.tipoParcial,
              mensaje: `El banco de ${rol.materiaNombre} (${rol.grupo}) fue devuelto con observaciones por el verificador.`,
              fecha: rol.fechaVerificacion || rol.actualizadoEn || new Date(),
              leida: leidas.has(id),
              ruta: '/banco-preguntas',
              queryParams: { rolId: rol.id },
              nivel: 'error'
            });
          }
        });

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
