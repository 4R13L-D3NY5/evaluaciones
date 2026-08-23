import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

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

        <main class="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {}
