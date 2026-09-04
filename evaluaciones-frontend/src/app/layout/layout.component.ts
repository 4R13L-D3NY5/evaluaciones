import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LayoutPreferencesService } from '../core/services/layout-preferences.service';

@Component({
  selector: 'sea-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarComponent, SidebarComponent],
  template: `
    <div class="h-screen max-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <!-- Topbar Superior Fijo -->
      <sea-topbar class="shrink-0"></sea-topbar>

      <!-- Cuerpo: Sidebar Lateral Anclado + Contenido Principal con Scroll Independiente -->
      <div class="flex-1 flex overflow-hidden">
        <sea-sidebar class="shrink-0 h-full flex flex-col"></sea-sidebar>

        <main class="flex-1 min-w-0 overflow-y-auto overflow-x-auto p-4 sm:p-8 scroll-smooth">
          <div
            class="w-full min-w-0 mx-auto"
            [class.max-w-7xl]="preferencias.vistaContenido() === 'centrado'">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  public readonly preferencias = inject(LayoutPreferencesService);
}
