import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EvaluacionesStorageService } from '../../../core/services/evaluaciones-storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutPreferencesService, VistaContenido } from '../../../core/services/layout-preferences.service';

@Component({
  selector: 'sea-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="border-b border-border bg-card shadow-xs px-4 sm:px-6 py-3 sticky top-0 z-10">
      <div class="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        <!-- Logo y Nombre del Sistema -->
        <div class="flex items-center gap-3">
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
              class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-colors">
              <i class="pi pi-sliders-h text-xs"></i>
              <span>Parametrizar</span>
            </button>
          }
          <div class="flex items-center gap-2 bg-muted/70 border border-border rounded-xl px-2.5 sm:px-3.5 py-1.5 shadow-2xs">
            <i class="pi pi-calendar text-xs text-primary font-bold"></i>
            <span class="hidden sm:inline text-[10px] font-extrabold text-muted-foreground uppercase">Gestión:</span>
            <select 
              [value]="storage.gestionActiva()" 
              (change)="onGestionChange($event)"
              class="bg-transparent text-xs font-black text-foreground outline-none cursor-pointer">
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
export class TopbarComponent {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  public readonly preferencias = inject(LayoutPreferencesService);
  public readonly menuVistaAbierto = signal(false);

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
