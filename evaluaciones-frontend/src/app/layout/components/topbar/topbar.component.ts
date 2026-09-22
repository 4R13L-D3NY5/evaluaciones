import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EvaluacionesStorageService } from '../../../core/services/evaluaciones-storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutPreferencesService, VistaContenido } from '../../../core/services/layout-preferences.service';
import { NotificacionesService, NotificacionUsuario } from '../../../core/services/notificaciones.service';

@Component({
  selector: 'sea-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="border-b border-border bg-card shadow-xs px-4 sm:px-6 py-3 sticky top-0 z-10">
      <div class="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        <!-- Logo y Nombre del Sistema -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            title="Abrir menú"
            aria-label="Abrir menú"
            [attr.aria-expanded]="!preferencias.sidebarColapsado()"
            (click)="preferencias.abrirSidebar()"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary hover:bg-primary/5 transition-colors md:hidden">
            <i class="pi pi-bars text-sm"></i>
          </button>
          <div class="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <i class="pi pi-check-square text-lg"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h1 class="font-extrabold text-base sm:text-lg tracking-tight text-foreground truncate">Sistema de Evaluaciones</h1>
            </div>
            <p class="hidden sm:block text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate">Gestión Integral del Proceso de Evaluaciones Académicas</p>
          </div>
        </div>

        <!-- Selector de Gestión Académica (Default II-2026) -->
        <div class="relative flex items-center gap-2 shrink-0">
          <!-- Apartado de Notificaciones (Campana) -->
          @if (puedeVerNotificaciones()) {
            <div class="relative">
            <button
              type="button"
              title="Notificaciones"
              aria-label="Notificaciones"
              [attr.aria-expanded]="menuNotificacionesAbierto()"
              (click)="toggleMenuNotificaciones()"
              class="relative inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-card text-foreground hover:bg-primary/5 transition-colors cursor-pointer">
              <i class="pi pi-bell text-sm" [class.text-primary]="notificacionesService.totalAlertasCount() > 0"></i>
              @if (notificacionesService.totalAlertasCount() > 0) {
                <span class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white shadow-xs animate-pulse">
                  {{ notificacionesService.totalAlertasCount() }}
                </span>
              }
            </button>

            @if (menuNotificacionesAbierto()) {
              <div class="absolute right-0 top-[calc(100%+8px)] z-40 w-80 sm:w-96 rounded-2xl border border-border bg-card p-3 shadow-2xl animate-fade-in">
                <div class="flex items-center justify-between border-b border-border pb-2.5 mb-2">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-bell text-primary text-sm font-bold"></i>
                    <h3 class="text-xs font-extrabold text-foreground">Notificaciones</h3>
                    @if (notificacionesService.totalAlertasCount() > 0) {
                      <span class="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black text-rose-700">
                        {{ notificacionesService.totalAlertasCount() }} pendientes
                      </span>
                    }
                  </div>
                  @if (notificacionesService.notificaciones().length > 0) {
                    <button
                      type="button"
                      (click)="notificacionesService.marcarTodasComoLeidas()"
                      class="text-[10px] font-bold text-primary hover:underline cursor-pointer">
                      Marcar leídas
                    </button>
                  }
                </div>

                <div class="max-h-80 overflow-y-auto space-y-2 pr-1">
                  @if (notificacionesService.notificaciones().length === 0) {
                    <div class="py-6 text-center text-muted-foreground flex flex-col items-center gap-1.5">
                      <i class="pi pi-check-circle text-2xl text-emerald-500"></i>
                      <p class="text-xs font-bold text-foreground">Sin notificaciones</p>
                      <p class="text-[10px]">No tienes observaciones ni alertas pendientes.</p>
                    </div>
                  } @else {
                    @for (notif of notificacionesService.notificaciones(); track notif.id) {
                      <div
                        (click)="abrirNotificacion(notif)"
                        [ngClass]="{
                          'bg-muted/40': notif.leida,
                          'bg-rose-50/70': !notif.leida && notif.nivel === 'error',
                          'border-rose-200': !notif.leida && notif.nivel === 'error',
                          'bg-amber-50/70': !notif.leida && notif.nivel === 'warning',
                          'border-amber-300': !notif.leida && notif.nivel === 'warning',
                          'bg-emerald-50/70': !notif.leida && notif.nivel === 'success',
                          'border-emerald-200': !notif.leida && notif.nivel === 'success'
                        }"
                        class="p-2.5 rounded-xl border border-border transition-all cursor-pointer hover:shadow-xs hover:border-primary/40">
                        <div class="flex items-start gap-2.5">
                          <div
                            [class.bg-rose-100]="notif.nivel === 'error'"
                            [class.text-rose-700]="notif.nivel === 'error'"
                            [class.bg-amber-100]="notif.nivel === 'warning'"
                            [class.text-amber-800]="notif.nivel === 'warning'"
                            [class.bg-emerald-100]="notif.nivel === 'success'"
                            [class.text-emerald-800]="notif.nivel === 'success'"
                            class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0">
                            <i class="pi text-xs"
                               [class.pi-exclamation-triangle]="notif.nivel === 'error'"
                               [class.pi-pencil]="notif.tipo === 'NOTAS_SIN_CARTILLA_PENDIENTES'"
                               [class.pi-check-circle]="notif.nivel === 'success'"
                               [class.pi-info-circle]="notif.nivel !== 'error' && notif.nivel !== 'success' && notif.tipo !== 'NOTAS_SIN_CARTILLA_PENDIENTES'"></i>
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center justify-between gap-1 mb-0.5">
                              <span class="text-xs font-black text-foreground truncate">{{ notif.titulo }}</span>
                              @if (!notif.leida) {
                                <span class="h-2 w-2 rounded-full shrink-0"
                                      [class.bg-rose-600]="notif.nivel === 'error'"
                                      [class.bg-amber-500]="notif.nivel === 'warning'"
                                      [class.bg-emerald-600]="notif.nivel === 'success'"></span>
                              }
                            </div>
                            @if (notif.materiaNombre) {
                              <p class="text-[10px] font-bold text-primary truncate">
                                {{ notif.materiaCodigo ? notif.materiaCodigo + ' · ' : '' }}{{ notif.materiaNombre }} ({{ notif.grupo }})
                              </p>
                            }
                            @if (notif.docenteNombre) {
                              <p class="text-[10px] font-bold text-foreground truncate flex items-center gap-1 mt-0.5">
                                <i class="pi pi-user text-[9px] text-muted-foreground"></i>
                                <span>Docente: {{ notif.docenteNombre }}</span>
                              </p>
                            }
                            <p class="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{{ notif.mensaje }}</p>
                            <div class="mt-1.5 flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
                              <div class="flex items-center gap-1.5">
                                <span>{{ notif.parcial || '' }}</span>
                                @if (notif.horasRestantes !== undefined && notif.horasRestantes > 0) {
                                  <span class="rounded bg-rose-100 px-1 py-0.5 text-[8px] font-black text-rose-700">
                                    {{ notif.horasRestantes }}h rest.
                                  </span>
                                }
                              </div>
                              <span class="text-primary font-bold inline-flex items-center gap-1">
                                {{ notif.textoAccion || 'Ver detalle' }} <i class="pi pi-arrow-right text-[8px]"></i>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            }
            </div>
          }

          <button
            type="button"
            title="Parametrizar vista"
            aria-label="Parametrizar vista"
            [attr.aria-expanded]="menuVistaAbierto()"
            (click)="menuVistaAbierto.set(!menuVistaAbierto())"
            class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-colors">
            <i class="pi pi-arrows-alt text-xs"></i>
            <span class="hidden md:inline">Parametrizar vista</span>
          </button>

          @if (menuVistaAbierto()) {
            <div class="absolute right-0 top-[calc(100%+8px)] z-30 w-56 rounded-xl border border-border bg-card p-2 shadow-xl">
              <p class="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Ancho del contenido</p>
              <button
                type="button"
                (click)="seleccionarVista('centrado')"
                class="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted">
                <span class="flex items-center gap-2"><i class="pi pi-align-center text-primary"></i>Centrado</span>
                @if (preferencias.vistaContenido() === 'centrado') { <i class="pi pi-check text-primary"></i> }
              </button>
              <button
                type="button"
                (click)="seleccionarVista('fluido')"
                class="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted">
                <span class="flex items-center gap-2"><i class="pi pi-arrows-h text-primary"></i>Fluido</span>
                @if (preferencias.vistaContenido() === 'fluido') { <i class="pi pi-check text-primary"></i> }
              </button>
            </div>
          }

          @if (puedeParametrizar()) {
            <button
              type="button"
              title="Parametrizar evaluaciones"
              aria-label="Parametrizar evaluaciones"
              (click)="irAParametrizacion()"
              class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-colors sm:px-3.5">
              <i class="pi pi-sliders-h text-xs"></i>
              <span class="hidden sm:inline">Parametrizar</span>
            </button>
          }
          <div class="flex min-w-0 items-center gap-1.5 bg-muted/70 border border-border rounded-xl px-2 sm:gap-2 sm:px-3.5 py-1.5 shadow-2xs">
            <i class="pi pi-calendar text-xs text-primary font-bold"></i>
            <span class="hidden sm:inline text-[10px] font-extrabold text-muted-foreground uppercase">Gestión:</span>
            <select 
              [value]="storage.gestionActiva()" 
              (change)="onGestionChange($event)"
              class="max-w-[5.5rem] bg-transparent text-[11px] font-black text-foreground outline-none cursor-pointer sm:max-w-none sm:text-xs">
              <option value="II-2026">II-2026 (Activa)</option>
              <option value="I-2026">I-2026 (Anterior)</option>
              <option value="II-2025">II-2025 (Histórico)</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  `
})
export class TopbarComponent implements OnInit {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  public readonly preferencias = inject(LayoutPreferencesService);
  public readonly notificacionesService = inject(NotificacionesService);
  public readonly menuVistaAbierto = signal(false);
  public readonly menuNotificacionesAbierto = signal(false);

  public ngOnInit(): void {
    if (this.puedeVerNotificaciones()) {
      this.notificacionesService.cargarNotificaciones();
    }
  }

  public puedeVerNotificaciones(): boolean {
    const rol = this._authService.usuario()?.rol;
    return rol === 'DOCENTE' || rol === 'DIRECTOR_CARRERA';
  }

  public toggleMenuNotificaciones(): void {
    const estado = !this.menuNotificacionesAbierto();
    this.menuNotificacionesAbierto.set(estado);
    if (estado) {
      this.menuVistaAbierto.set(false);
      this.notificacionesService.cargarNotificaciones();
    }
  }

  public abrirNotificacion(notif: NotificacionUsuario): void {
    this.menuNotificacionesAbierto.set(false);
    this.notificacionesService.abrirNotificacion(notif);
  }

  public puedeParametrizar(): boolean {
    return this._authService.tieneRol(['RESPONSABLE_EVALUACIONES']);
  }

  public irAParametrizacion(): void {
    this._router.navigateByUrl('/administracion-evaluaciones');
  }

  public seleccionarVista(vista: VistaContenido): void {
    this.preferencias.cambiarVista(vista);
    this.menuVistaAbierto.set(false);
  }

  public onGestionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.storage.setGestionActiva(target.value);
    }
  }
}
