import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { AuthService } from './auth.service';
import { RolExamenService, RolExamenResponse } from './rol-examen.service';
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
  private readonly _authService = inject(AuthService);
  private readonly _rolService = inject(RolExamenService);
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
        if (usuario) {
          this.cargarNotificaciones();
        } else {
          this.notificaciones.set([]);
        }
      });
    }, { allowSignalWrites: true });

    // Sondeo periódico ligero (cada 60 s) para detectar observaciones sin necesidad de recargar la página
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this._authService.usuario()) {
          this.cargarNotificaciones();
        }
      }, 60000);
    }
  }

  public cargarNotificaciones(): void {
    const usuario = this._authService.usuario();
    if (!usuario) {
      this.notificaciones.set([]);
      return;
    }

    const esDocente = usuario.rol === 'DOCENTE';
    const esDirector = usuario.rol === 'DIRECTOR_CARRERA';
    const esAdmin = usuario.rol === 'ADMINISTRADOR_SISTEMA';

    if (esDocente) {
      this._cargarNotificacionesDocente();
    } else if (esDirector || esAdmin) {
      this._cargarNotificacionesDirector();
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
              docenteNombre: rol.docenteNombre,
              mensaje: `El banco de ${rol.materiaNombre} (${rol.grupo}) fue devuelto con observaciones por el verificador.`,
              fecha: rol.fechaVerificacion || rol.actualizadoEn || new Date(),
              leida: leidas.has(id),
              ruta: '/banco-preguntas',
              queryParams: { rolId: rol.id },
              textoAccion: 'Ver banco',
              nivel: 'error'
            });
          } else if (rol.estadoVerificacion === 'VERIFICADO') {
            const id = 'verif-' + rol.id;
            lista.push({
              id,
              tipo: 'BANCO_VERIFICADO',
              titulo: 'Examen validado y verificado',
              materiaCodigo: rol.materiaCodigo,
              materiaNombre: rol.materiaNombre,
              grupo: rol.grupo,
              parcial: rol.tipoParcial,
              docenteNombre: rol.docenteNombre,
              mensaje: `El examen de ${rol.materiaNombre} (${rol.grupo}) fue verificado y aprobado conforme por la dirección académica.`,
              fecha: rol.fechaVerificacion || rol.actualizadoEn || new Date(),
              leida: leidas.has(id),
              ruta: '/banco-preguntas',
              queryParams: { rolId: rol.id },
              textoAccion: 'Ver examen',
              nivel: 'success'
            });
          }

          // 3. Examen sin cartilla pendiente de notas (no subió notas aún)
          const esSinCartilla = rol.modalidad === 'PRESENCIAL_SIN_CARTILLA';
          if (esSinCartilla && rol.estadoFlujo === 'PENDIENTE_NOTAS') {
            const id = 'sin-cartilla-notas-' + rol.id;
            lista.push({
              id,
              tipo: 'NOTAS_SIN_CARTILLA_PENDIENTES',
              titulo: 'Examen sin cartilla: Subir notas',
              materiaCodigo: rol.materiaCodigo,
              materiaNombre: rol.materiaNombre,
              grupo: rol.grupo,
              parcial: rol.tipoParcial,
              docenteNombre: rol.docenteNombre,
              mensaje: `El examen sin cartilla de ${rol.materiaNombre} (${rol.grupo}) no tiene notas subidas aún. Ingresa a registrar las calificaciones sobre 60 puntos.`,
              fecha: rol.actualizadoEn || new Date(),
              leida: leidas.has(id),
              ruta: '/banco-preguntas',
              queryParams: { rolId: rol.id, abrirNotas: 'true' },
              textoAccion: 'Cargar notas',
              nivel: 'warning'
            });
          }
        });

        // Limpiar automáticamente de localStorage las alertas de roles que ya fueron corregidos o calificados
        const rolesIdsDevueltos = new Set(roles.filter(r => r.estadoVerificacion === 'DEVUELTO').map(r => 'obs-' + r.id));
        const rolesIdsPendientesNotas = new Set(
          roles.filter(r => r.modalidad === 'PRESENCIAL_SIN_CARTILLA' && r.estadoFlujo === 'PENDIENTE_NOTAS')
               .map(r => 'sin-cartilla-notas-' + r.id)
        );
        const leidasActualizadas = new Set(Array.from(leidas).filter(id => {
          if (id.startsWith('obs-')) return rolesIdsDevueltos.has(id);
          if (id.startsWith('sin-cartilla-notas-')) return rolesIdsPendientesNotas.has(id);
          return true;
        }));
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

  private _cargarNotificacionesDirector(): void {
    this.cargando.set(true);
    this._rolService.listar().subscribe({
      next: (roles: RolExamenResponse[]) => {
        const leidas = this._obtenerIdsLeidos();
        const lista: NotificacionUsuario[] = [];
        const ahora = new Date();

        roles.forEach(rol => {
          const docente = rol.docenteNombre?.trim() || 'Docente por designar';

          // 1. Grupos con observaciones en la verificación (DEVUELTO)
          if (rol.estadoVerificacion === 'DEVUELTO') {
            const id = 'dir-obs-' + rol.id;
            lista.push({
              id,
              tipo: 'OBSERVACION_BANCO',
              titulo: 'Examen observado en verificación',
              materiaCodigo: rol.materiaCodigo,
              materiaNombre: rol.materiaNombre,
              grupo: rol.grupo,
              parcial: rol.tipoParcial,
              docenteNombre: docente,
              mensaje: `Docente: ${docente}. El banco de preguntas de ${rol.materiaNombre} (${rol.grupo}) fue devuelto con observaciones por el verificador. Comuníquese con el docente para su corrección urgente.`,
              fecha: rol.fechaVerificacion || rol.actualizadoEn || new Date(),
              leida: leidas.has(id),
              ruta: '/rol-examenes',
              queryParams: { busqueda: rol.materiaCodigo || rol.materiaNombre },
              textoAccion: 'Ver en rol',
              nivel: 'error',
              horasRestantes: 0
            });
          }

          // 2. Grupos a menos de 72 horas del examen sin banco de preguntas validado
          const noEstaValidado = rol.estadoFlujo === 'PROGRAMADO' ||
            (!rol.bancoPreguntasCargado && rol.estadoFlujo !== 'VALIDADO' && rol.estadoFlujo !== 'GENERADO' &&
             rol.estadoFlujo !== 'IMPRESO' && rol.estadoFlujo !== 'ENTREGADO' && rol.estadoFlujo !== 'CALIFICADO');
          const noEstaSuspendido = rol.estadoFlujo !== 'SUSPENDIDO';
          const noEsDevuelto = rol.estadoVerificacion !== 'DEVUELTO';

          if (noEstaValidado && noEstaSuspendido && noEsDevuelto && rol.fecha) {
            const fechaExamen = this._parseFechaExamen(rol.fecha, rol.horario);
            if (fechaExamen) {
              const diffMs = fechaExamen.getTime() - ahora.getTime();
              const diffHoras = diffMs / (1000 * 60 * 60);

              // Alerta activa si faltan 72 horas o menos y hasta el día del examen (margen de gracia de -12h)
              if (diffHoras <= 72 && diffHoras >= -12) {
                const id = 'dir-72h-' + rol.id;
                let tiempoRestante = '';
                if (diffHoras <= 0) {
                  tiempoRestante = 'Examen programado para hoy';
                } else if (diffHoras < 24) {
                  tiempoRestante = `Faltan ${Math.round(diffHoras)}h`;
                } else {
                  const dias = Math.floor(diffHoras / 24);
                  const horas = Math.round(diffHoras % 24);
                  tiempoRestante = `Faltan ${dias}d ${horas}h`;
                }

                lista.push({
                  id,
                  tipo: 'EXAMEN_SIN_BANCO_72H',
                  titulo: 'Examen en < 72h sin banco validado',
                  materiaCodigo: rol.materiaCodigo,
                  materiaNombre: rol.materiaNombre,
                  grupo: rol.grupo,
                  parcial: rol.tipoParcial,
                  docenteNombre: docente,
                  mensaje: `Docente: ${docente}. Examen el ${rol.fechaDisplay || rol.fecha} a las ${rol.horario || 'horario regular'} (${tiempoRestante}). Aún no ha cargado ni validado su banco de preguntas.`,
                  fecha: rol.fecha,
                  leida: leidas.has(id),
                  ruta: '/rol-examenes',
                  queryParams: { busqueda: rol.materiaCodigo || rol.materiaNombre },
                  textoAccion: 'Ver en rol',
                  nivel: 'error',
                  horasRestantes: Math.max(0, Math.round(diffHoras))
                });
              }
            }
          }
        });

        // Orden: No leídas primero, luego por proximidad del examen (menor horasRestantes)
        lista.sort((a, b) => {
          if (a.leida !== b.leida) return a.leida ? 1 : -1;
          return (a.horasRestantes ?? 999) - (b.horasRestantes ?? 999);
        });

        this.notificaciones.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  private _parseFechaExamen(fechaStr: string, horarioStr?: string): Date | null {
    if (!fechaStr) return null;
    const partes = fechaStr.split('-').map(Number);
    if (partes.length !== 3) return null;
    let hora = 8;
    let min = 0;
    if (horarioStr) {
      const match = horarioStr.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        hora = parseInt(match[1], 10);
        min = parseInt(match[2], 10);
      }
    }
    return new Date(partes[0], partes[1] - 1, partes[2], hora, min, 0);
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
