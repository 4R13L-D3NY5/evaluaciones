import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluacionesStorageService } from '../../../core/services/evaluaciones-storage.service';

@Component({
  selector: 'sea-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="border-b border-border bg-card shadow-xs px-6 py-3.5 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <!-- Logo y Nombre del Sistema -->
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <i class="pi pi-check-square text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-extrabold text-lg tracking-tight text-foreground">Sistema de Evaluaciones</h1>
            </div>
            <p class="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Gestión Integral del Proceso de Evaluaciones Académicas</p>
          </div>
        </div>

        <!-- Selector de Gestión Académica (Default II-2026) -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-muted/70 border border-border rounded-xl px-3.5 py-1.5 shadow-2xs">
            <i class="pi pi-calendar text-xs text-primary font-bold"></i>
            <span class="text-[10px] font-extrabold text-muted-foreground uppercase">Gestión:</span>
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

  public onGestionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.storage.setGestionActiva(target.value);
    }
  }
}
