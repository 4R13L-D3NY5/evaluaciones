import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UnitepcGatewayService } from '../../../core/services/unitepc-gateway.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppRole } from '../../../core/models/auth.models';

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  description: string;
  roles: AppRole[];
}

@Component({
  selector: 'sea-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .sea-sidebar-shell {
      width: 16rem;
      transition: width 250ms ease;
    }

    .sea-sidebar-shell--collapsed {
      width: 4.75rem;
    }

    .sea-sidebar-shell--collapsed .sea-sidebar__section-title,
    .sea-sidebar-shell--collapsed .sea-sidebar__item-label,
    .sea-sidebar-shell--collapsed .sea-sidebar__item-badge,
    .sea-sidebar-shell--collapsed .sea-sidebar__security-copy,
    .sea-sidebar-shell--collapsed .sea-sidebar__user-copy {
      display: none;
    }

    .sea-sidebar-shell--collapsed .sea-sidebar__nav-link {
      justify-content: center;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }

    .sea-sidebar-shell--collapsed .sea-sidebar__security {
      justify-content: center;
      padding: 0.75rem;
    }

    .sea-sidebar-shell--collapsed .sea-sidebar__user {
      justify-content: center;
      padding-left: 0;
      padding-right: 0;
    }

    .sea-sidebar__item-label,
    .sea-sidebar__section-title,
    .sea-sidebar__security-copy,
    .sea-sidebar__user-copy {
      transition: opacity 150ms ease;
    }

    .sea-sidebar__security {
      flex-direction: column;
    }

    .sea-sidebar-shell--collapsed .sea-sidebar__security {
      flex-direction: row;
      align-items: center;
    }

    @media (max-width: 768px) {
      .sea-sidebar-shell,
      .sea-sidebar-shell--collapsed {
        width: 16rem;
      }

      .sea-sidebar-shell--collapsed .sea-sidebar__section-title,
      .sea-sidebar-shell--collapsed .sea-sidebar__item-label,
      .sea-sidebar-shell--collapsed .sea-sidebar__item-badge,
      .sea-sidebar-shell--collapsed .sea-sidebar__security-copy,
      .sea-sidebar-shell--collapsed .sea-sidebar__user-copy {
        display: block;
      }

      .sea-sidebar-shell--collapsed .sea-sidebar__nav-link {
        justify-content: flex-start;
        padding-left: 0.875rem;
        padding-right: 0.875rem;
      }

      .sea-sidebar-shell--collapsed .sea-sidebar__security {
        justify-content: flex-start;
        padding: 0.875rem;
        flex-direction: column;
        align-items: flex-start;
      }

      .sea-sidebar-shell--collapsed .sea-sidebar__user {
        justify-content: flex-start;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }
    }
  `],
  template: `
    <aside
      class="sea-sidebar-shell bg-card border-r border-border h-full p-4 flex flex-col justify-between shrink-0 overflow-y-auto"
      [class.sea-sidebar-shell--collapsed]="sidebarColapsado()">
      
      <!-- Menús de Navegación -->
      <div class="space-y-6">
        
        <div>
          <div class="flex items-center justify-between px-3 mb-2">
            <span class="sea-sidebar__section-title text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-widest">
            Módulos del Proceso
            </span>
            <button
              type="button"
              [attr.aria-label]="sidebarColapsado() ? 'Mostrar menú' : 'Ocultar menú'"
              [attr.title]="sidebarColapsado() ? 'Mostrar menú' : 'Ocultar menú'"
              (click)="alternarSidebar()"
              class="h-7 w-7 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-primary transition-colors flex items-center justify-center">
              <i [class]="sidebarColapsado() ? 'pi pi-angle-double-right text-xs' : 'pi pi-angle-double-left text-xs'"></i>
            </button>
          </div>
          
          <nav class="space-y-1">
            @for (item of visibleMenuItems(); track item.route) {
              <a 
                [routerLink]="item.route" 
              routerLinkActive="bg-primary/10 text-primary border-primary font-bold shadow-2xs"
              [routerLinkActiveOptions]="{ exact: false }"
              [title]="sidebarColapsado() ? item.label : item.description"
              class="sea-sidebar__nav-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent transition-all group">
                <i [class]="item.icon + ' text-base transition-colors group-hover:text-primary'"></i>
                <span
                  class="sea-sidebar__item-label flex-1 min-w-0"
                  [class.truncate]="item.route !== '/catalogo-academico'"
                  [class.whitespace-nowrap]="item.route === '/catalogo-academico'">
                  {{ item.label }}
                </span>
                <span
                  *ngIf="item.badge as badge"
                  class="sea-sidebar__item-badge shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-emerald-700">
                  {{ badge }}
                </span>
              </a>
            }
          </nav>
        </div>

        <!-- Banner de Ayuda / Información de Evaluación -->
        <div class="sea-sidebar__security bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2 flex items-start gap-2" title="Por seguridad, cambia periódicamente tu contraseña.">
          <div class="flex items-center gap-2 text-primary font-bold text-xs shrink-0">
            <i class="pi pi-shield"></i>
            <span class="sea-sidebar__security-copy">Seguridad de la cuenta</span>
          </div>
          <p class="sea-sidebar__security-copy text-[11px] text-muted-foreground leading-relaxed m-0">
            Por seguridad, cambia periódicamente tu contraseña y no la compartas.
          </p>
        </div>

      </div>

      <!-- Pie de Navegación: Usuario y Sede -->
      @if (authService.usuario(); as usuario) {
        <div class="sea-sidebar__user border-t border-border pt-4 px-2">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-primary font-black text-xs">
              {{ obtenerIniciales(usuario.nombreCompleto) }}
            </div>
            <div class="sea-sidebar__user-copy flex-1 min-w-0">
              <h4 class="text-xs font-bold text-foreground truncate">{{ usuario.nombreCompleto }}</h4>
              <p class="text-[10px] text-muted-foreground truncate">{{ usuario.rolNombre }}</p>
            </div>
            <button
              type="button"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              (click)="cerrarSesion()"
              class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-primary transition-colors">
              <i class="pi pi-sign-out text-xs"></i>
            </button>
          </div>
        </div>
      }

    </aside>
  `
})
export class SidebarComponent implements OnInit {
  public readonly gatewayService = inject(UnitepcGatewayService);
  public readonly authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _sidebarStorageKey = 'sea.sidebar.collapsed';
  public readonly sidebarColapsado = signal(this._leerEstadoSidebar());
  public readonly visibleMenuItems = computed(() => {
    const usuario = this.authService.usuario();
    if (!usuario) return [];
    if (usuario.rol === 'ADMINISTRADOR_SISTEMA') return this.menuItems;
    return this.menuItems.filter(item => item.roles.includes(usuario.rol));
  });

  public readonly menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'pi pi-chart-pie',
      description: 'Métricas, KPIs y estadísticas generales de evaluaciones',
      roles: ['ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES', 'PERSONAL_EVALUACIONES', 'DOCENTE', 'VICERRECTOR', 'DIRECTOR_CARRERA']
    },
    {
      label: 'Plan de Estudios',
      route: '/plan-estudios',
      icon: 'pi pi-book',
      description: 'Asignaturas, docentes y estado de banco por carrera',
      roles: ['DIRECTOR_CARRERA', 'VICERRECTOR']
    },
    {
      label: 'Banco de Preguntas',
      route: '/banco-preguntas',
      icon: 'pi pi-question-circle',
      description: 'Descarga de plantillas, validación y previsualización de preguntas',
      roles: ['DOCENTE']
    },
    {
      label: 'Lista de Evaluaciones por Día',
      route: '/evaluaciones-dia',
      icon: 'pi pi-calendar-clock',
      description: 'Exámenes del día, horarios y generación de paquetes',
      roles: ['RESPONSABLE_EVALUACIONES', 'PERSONAL_EVALUACIONES', 'DIRECTOR_CARRERA', 'VICERRECTOR']
    },
    {
      label: 'Rol de Exámenes',
      route: '/rol-examenes',
      icon: 'pi pi-calendar',
      description: 'Calendarización, grilla semanal y subida de Excel',
      roles: ['DIRECTOR_CARRERA', 'VICERRECTOR']
    },
    {
      label: 'Servicios académicos',
      route: '/catalogo-academico',
      icon: 'pi pi-building-columns',
      badge: 'Live',
      description: 'Sedes, carreras, materias, grupos, horarios y campus sincronizados',
      roles: []
    },
    {
      label: 'Salas Virtuales',
      route: '/salas-virtuales',
      icon: 'pi pi-desktop',
      description: 'Ingreso, espera, inicio y seguimiento de exámenes virtuales',
      roles: ['ADMINISTRADOR_SISTEMA', 'DOCENTE']
    },
    {
      label: 'Calificación OMR',
      route: '/calificacion-omr',
      icon: 'pi pi-check-square',
      description: 'Lector óptico interactivo, verificación de marcas y comparación con patrón',
      roles: ['RESPONSABLE_EVALUACIONES']
    },
    {
      label: 'Administración de Evaluaciones',
      route: '/administracion-evaluaciones',
      icon: 'pi pi-sliders-h',
      description: 'Parámetros institucionales, cuotas de dificultad y tiempos',
      roles: ['ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES']
    },
    {
      label: 'Auditoría & Bitácora',
      route: '/auditoria',
      icon: 'pi pi-history',
      description: 'Seguimiento de accesos, terminales MAC, IPs públicas y trazabilidad',
      roles: ['ADMINISTRADOR_SISTEMA']
    },
    {
      label: 'Respaldos y contingencia',
      route: '/respaldos',
      icon: 'pi pi-cloud-upload',
      description: 'Respaldos cifrados, copia externa y recuperación controlada',
      roles: ['ADMINISTRADOR_SISTEMA']
    },
    {
      label: 'Reporte de Evaluaciones',
      route: '/reporte-evaluaciones',
      icon: 'pi pi-file-excel',
      description: 'Auditoría, cobertura de bancos y consolidado nacional',
      roles: ['RESPONSABLE_EVALUACIONES', 'VICERRECTOR', 'DIRECTOR_CARRERA']
    },
    {
      label: 'Usuarios y accesos',
      route: '/usuarios-sistema',
      icon: 'pi pi-users',
      description: 'Cuentas, roles y alcance por sede y carrera',
      roles: ['ADMINISTRADOR_SISTEMA']
    }
  ];

  public ngOnInit(): void {
    // Chequeo inicial inteligente (con caché mínima de 2 minutos para evitar saturación)
    this.gatewayService.checkSeaHealth();
  }

  public alternarSidebar(): void {
    const nuevoEstado = !this.sidebarColapsado();
    this.sidebarColapsado.set(nuevoEstado);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this._sidebarStorageKey, String(nuevoEstado));
    }
  }

  private _leerEstadoSidebar(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(this._sidebarStorageKey) === 'true';
  }

  public obtenerIniciales(nombre: string): string {
    return nombre.split(' ').filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
  }

  public cerrarSesion(): void {
    this.authService.cerrarSesion().subscribe({
      next: () => this._router.navigateByUrl('/login'),
      error: () => {
        this.authService.usuario.set(null);
        this._router.navigateByUrl('/login');
      }
    });
  }
}
