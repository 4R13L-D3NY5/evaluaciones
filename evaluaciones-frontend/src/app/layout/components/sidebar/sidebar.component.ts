import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UnitepcGatewayService } from '../../../core/services/unitepc-gateway.service';

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  description: string;
}

@Component({
  selector: 'sea-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-card border-r border-border h-full p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
      
      <!-- Menús de Navegación -->
      <div class="space-y-6">
        
        <div>
          <span class="text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-widest px-3 block mb-2">
            Módulos del Proceso
          </span>
          
          <nav class="space-y-1">
            @for (item of menuItems; track item.route) {
              <a 
                [routerLink]="item.route" 
                routerLinkActive="bg-primary/10 text-primary border-primary font-bold shadow-2xs"
                [routerLinkActiveOptions]="{ exact: false }"
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent transition-all group">
                <i [class]="item.icon + ' text-base transition-colors group-hover:text-primary'"></i>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="truncate">{{ item.label }}</span>
                    @if (item.route === '/catalogo-academico') {
                      @if (seaStatus() === 'online') {
                        <span 
                          (click)="forzarChequeoSea($event)"
                          title="Gateway SEA Conectado (Último chequeo: {{ getHoraChequeo() }}). Clic para re-verificar."
                          class="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs hover:scale-105 transition-transform cursor-pointer">
                          <i class="pi pi-arrow-up text-[9px] text-emerald-600 dark:text-emerald-400 font-black"></i>
                          <span>Live</span>
                        </span>
                      } @else if (seaStatus() === 'offline') {
                        <span 
                          (click)="forzarChequeoSea($event)"
                          title="Gateway SEA Desconectado/Caído (Último chequeo: {{ getHoraChequeo() }}). Clic para re-verificar."
                          class="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs hover:scale-105 transition-transform cursor-pointer animate-pulse">
                          <i class="pi pi-arrow-down text-[9px] text-rose-600 dark:text-rose-400 font-black"></i>
                          <span>Offline</span>
                        </span>
                      } @else {
                        <span 
                          class="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                          <i class="pi pi-spin pi-spinner text-[9px] text-amber-600"></i>
                          <span>Sync</span>
                        </span>
                      }
                    } @else if (item.badge) {
                      <span class="bg-indigo-100 text-primary text-[10px] font-black px-1.5 py-0.5 rounded-md">
                        {{ item.badge }}
                      </span>
                    }
                  </div>
                </div>
              </a>
            }
          </nav>
        </div>

        <!-- Banner de Ayuda / Información de Evaluación -->
        <div class="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2">
          <div class="flex items-center gap-2 text-primary font-bold text-xs">
            <i class="pi pi-shield"></i>
            <span>Seguridad de Exámenes</span>
          </div>
          <p class="text-[11px] text-muted-foreground leading-relaxed">
            Bloqueo de rol activo a 72h. Patrones oficiales cifrados hasta 3h post-inicio.
          </p>
        </div>

      </div>

      <!-- Pie de Navegación: Usuario y Sede -->
      <div class="border-t border-border pt-4 px-2">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-primary font-black text-xs">
            AD
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-foreground truncate">Ariel Camara</h4>
            <p class="text-[10px] text-muted-foreground truncate">Sede Cochabamba · Admin</p>
          </div>
        </div>
      </div>

    </aside>
  `
})
export class SidebarComponent implements OnInit {
  public readonly gatewayService = inject(UnitepcGatewayService);
  public readonly seaStatus = this.gatewayService.seaStatus;

  public readonly menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'pi pi-chart-pie',
      description: 'Métricas, KPIs y estadísticas generales de evaluaciones'
    },
    {
      label: 'Servicios SEA',
      route: '/catalogo-academico',
      icon: 'pi pi-building-columns',
      badge: 'Live',
      description: 'Sedes, Carreras, Materias, Grupos, Horarios y Campus sincronizados del SEA'
    },
    {
      label: 'Plan de Estudios',
      route: '/plan-estudios',
      icon: 'pi pi-book',
      description: 'Asignaturas, docentes y estado de banco por carrera'
    },
    {
      label: 'Lista de Evaluaciones por Día',
      route: '/evaluaciones-dia',
      icon: 'pi pi-calendar-clock',
      badge: 'Hoy',
      description: 'Exámenes del día, horarios y generación de paquetes'
    },
    {
      label: 'Calificación OMR',
      route: '/calificacion-omr',
      icon: 'pi pi-check-square',
      badge: 'OMR',
      description: 'Lector óptico interactivo, verificación de marcas y comparación con patrón'
    },
    {
      label: 'Banco de Preguntas',
      route: '/banco-preguntas',
      icon: 'pi pi-question-circle',
      description: 'Descarga de plantillas, validación y previsualización de preguntas'
    },
    {
      label: 'Administración de Evaluaciones',
      route: '/administracion-evaluaciones',
      icon: 'pi pi-sliders-h',
      description: 'Parámetros institucionales, cuotas de dificultad y tiempos'
    },
    {
      label: 'Reporte de Evaluaciones',
      route: '/reporte-evaluaciones',
      icon: 'pi pi-file-excel',
      description: 'Auditoría, cobertura de bancos y consolidado nacional'
    },
    {
      label: 'Rol de Exámenes',
      route: '/rol-examenes',
      icon: 'pi pi-calendar',
      description: 'Calendarización, grilla semanal y subida de Excel'
    },
    {
      label: 'Auditoría & Bitácora',
      route: '/auditoria',
      icon: 'pi pi-shield-check',
      badge: 'Seguridad',
      description: 'Seguimiento de accesos, terminales MAC, IPs públicas y trazabilidad'
    }
  ];

  public ngOnInit(): void {
    // Chequeo inicial inteligente (con caché mínima de 2 minutos para evitar saturación)
    this.gatewayService.checkSeaHealth();
  }

  public forzarChequeoSea(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.gatewayService.checkSeaHealth(true);
  }

  public getHoraChequeo(): string {
    const u = this.gatewayService.ultimoChequeo();
    if (!u) return 'Verificando...';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(u.getHours())}:${pad(u.getMinutes())}:${pad(u.getSeconds())}`;
  }
}
