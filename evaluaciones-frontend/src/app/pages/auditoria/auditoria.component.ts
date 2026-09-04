import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  EvaluacionesStorageService, 
  AuditoriaAccesoItem 
} from '../../core/services/evaluaciones-storage.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

@Component({
  selector: 'sea-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Cabecera de Página -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-9 w-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <i class="pi pi-shield-check text-lg"></i>
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tight text-foreground">Auditoría & Bitácora de Accesos</h2>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Trazabilidad integral, registro de IPs públicas, direcciones MAC de terminales y control de acciones críticas.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Botón Exportar Bitácora a Excel -->
          <button 
            (click)="exportarExcel()"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105">
            <i class="pi pi-file-excel"></i>
            <span>Exportar Bitácora (.xlsx)</span>
          </button>

          <!-- Botón Imprimir Reporte Oficial de Auditoría -->
          <button 
            (click)="imprimirActa()"
            class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105">
            <i class="pi pi-print"></i>
            <span>Imprimir Acta de Seguridad</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Registros -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider block mb-1">Total Accesos & Eventos</span>
            <div class="text-2xl font-black text-foreground font-mono">{{ storage.bitacoraAuditoria().length }}</div>
            <span class="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
              <i class="pi pi-check-circle text-[9px]"></i> 100% Trazabilidad activa
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">
            <i class="pi pi-history"></i>
          </div>
        </div>

        <!-- Terminales MAC Únicas -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider block mb-1">Terminales MAC Identificadas</span>
            <div class="text-2xl font-black text-blue-600 font-mono">{{ terminalesUnicas() }}</div>
            <span class="text-[10px] text-muted-foreground font-medium mt-1 block">Equipos autorizados</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <i class="pi pi-desktop"></i>
          </div>
        </div>

        <!-- Operaciones Críticas -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider block mb-1">Operaciones Críticas</span>
            <div class="text-2xl font-black text-rose-600 font-mono">{{ operacionesCriticas() }}</div>
            <span class="text-[10px] text-rose-600 font-bold mt-1 inline-flex items-center gap-1">
              <i class="pi pi-bolt text-[9px]"></i> Generaciones de exámenes
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <i class="pi pi-shield"></i>
          </div>
        </div>

        <!-- Bloqueos / Advertencias -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider block mb-1">Alertas de Seguridad</span>
            <div class="text-2xl font-black text-amber-600 font-mono">{{ alertasSeguridad() }}</div>
            <span class="text-[10px] text-amber-600 font-bold mt-1 inline-flex items-center gap-1">
              <i class="pi pi-exclamation-triangle text-[9px]"></i> Reglas de tiempo
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <i class="pi pi-lock"></i>
          </div>
        </div>

      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <!-- Búsqueda General -->
          <div class="lg:col-span-2">
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-search text-primary text-[10px]"></i> Buscar por Usuario, MAC, IP o Acción
            </label>
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="busquedaTexto"
                placeholder="Ej. Ariel Camara, E4:5F:01:8A:2C:99, 181.188, Generó..."
                class="w-full bg-muted/60 border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
              <i class="pi pi-search absolute left-3 top-2.5 text-muted-foreground text-xs"></i>
            </div>
          </div>

          <!-- Filtro por Módulo -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-th-large text-primary text-[10px]"></i> Módulo
            </label>
            <select 
              [(ngModel)]="filtroModulo"
              class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
              <option value="TODOS">Todos los Módulos</option>
              <option value="Autenticación">Autenticación</option>
              <option value="Evaluaciones">Evaluaciones</option>
              <option value="Generación Typst">Generación de exámenes</option>
              <option value="Banco de Preguntas">Banco de Preguntas</option>
              <option value="Administración">Administración</option>
              <option value="Seguridad">Seguridad</option>
            </select>
          </div>

          <!-- Filtro por Nivel de Criticidad -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-flag text-primary text-[10px]"></i> Nivel de Severidad
            </label>
            <select 
              [(ngModel)]="filtroNivel"
              class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
              <option value="TODOS">Todos los Niveles</option>
              <option value="INFO">INFO (Informativo)</option>
              <option value="ADVERTENCIA">ADVERTENCIA (Alerta)</option>
              <option value="OPERACION_CRITICA">OPERACIÓN CRÍTICA</option>
            </select>
          </div>

        </div>

      </div>

      <!-- Tabla Principal de Auditoría -->
      <div class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        
        <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-foreground uppercase tracking-wider">Registros de Trazabilidad</span>
            <span class="bg-purple-100 text-purple-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
              {{ registrosFiltrados().length }} eventos
            </span>
          </div>
          <span class="text-[11px] text-muted-foreground">
            Sincronización en tiempo real con firma hash
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="bg-muted/60 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th class="p-3.5 w-28">Fecha / Hora</th>
                <th class="p-3.5 min-w-[200px]">Usuario & Cargo</th>
                <th class="p-3.5 min-w-[170px]">Terminal MAC & IP Pública</th>
                <th class="p-3.5 w-32">Módulo</th>
                <th class="p-3.5 min-w-[260px]">Acción Realizada</th>
                <th class="p-3.5 text-center w-28">Nivel</th>
                <th class="p-3.5 text-right w-16">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border font-medium text-foreground">
              @for (item of registrosFiltrados(); track item.id) {
                <tr class="hover:bg-muted/20 transition-colors">
                  
                  <!-- Fecha y Hora -->
                  <td class="p-3.5 font-mono text-[11px]">
                    <div class="font-bold text-foreground">{{ item.fechaHora.split(' ')[0] }}</div>
                    <div class="text-[10px] text-muted-foreground">{{ item.fechaHora.split(' ')[1] }}</div>
                  </td>

                  <!-- Usuario & Cargo -->
                  <td class="p-3.5">
                    <div class="font-black text-foreground text-xs">{{ item.usuarioNombre }}</div>
                    <div class="text-[10px] text-muted-foreground mt-0.5">
                      {{ item.usuarioCargo }} · <span class="font-mono text-purple-700 dark:text-purple-400 font-bold">{{ item.campus }}</span>
                    </div>
                  </td>

                  <!-- Terminal MAC & IP Pública -->
                  <td class="p-3.5 font-mono text-[11px]">
                    <div class="flex items-center gap-1.5 font-bold text-foreground">
                      <i class="pi pi-desktop text-blue-600 text-[10px]"></i>
                      <span class="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded text-[10px]">
                        {{ item.direccionMac }}
                      </span>
                    </div>
                    <div class="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <i class="pi pi-globe text-[10px]"></i>
                      <span>{{ item.ipPublica }}</span>
                    </div>
                  </td>

                  <!-- Módulo -->
                  <td class="p-3.5">
                    <span class="bg-muted px-2.5 py-1 rounded-lg text-[10px] font-bold border border-border inline-block">
                      {{ item.modulo }}
                    </span>
                  </td>

                  <!-- Acción Realizada -->
                  <td class="p-3.5">
                    <p class="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                      {{ item.accion }}
                    </p>
                    <span class="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                      Equipo: {{ item.nombreEquipo }} · {{ item.sistemaOperativo }}
                    </span>
                  </td>

                  <!-- Nivel de Severidad -->
                  <td class="p-3.5 text-center">
                    @if (item.nivel === 'OPERACION_CRITICA') {
                      <span class="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        CRÍTICO
                      </span>
                    } @else if (item.nivel === 'ADVERTENCIA') {
                      <span class="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        ALERTA
                      </span>
                    } @else {
                      <span class="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        INFO
                      </span>
                    }
                  </td>

                  <!-- Ver Detalle Modal -->
                  <td class="p-3.5 text-right">
                    <button 
                      (click)="abrirDetalle(item)"
                      title="Ver Ficha Completa del Evento"
                      class="h-7 w-7 rounded-lg bg-muted hover:bg-purple-100 text-muted-foreground hover:text-purple-800 inline-flex items-center justify-center transition-colors">
                      <i class="pi pi-eye text-xs"></i>
                    </button>
                  </td>

                </tr>
              }
            </tbody>
          </table>
        </div>

      </div>

      <!-- MODAL DETALLE DE EVENTO DE AUDITORÍA -->
      @if (registroSeleccionado()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in">
            
            <div class="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center text-white text-lg">
                  <i class="pi pi-shield"></i>
                </div>
                <div>
                  <h3 class="text-base font-black tracking-tight">Ficha de Auditoría #{{ registroSeleccionado()?.id }}</h3>
                  <p class="text-xs text-white/80 font-mono">{{ registroSeleccionado()?.fechaHora }}</p>
                </div>
              </div>
              <button (click)="cerrarDetalle()" class="text-white/80 hover:text-white text-base">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="p-6 space-y-4 text-xs">
              
              <!-- Usuario y Campus -->
              <div class="p-3.5 rounded-xl bg-muted/60 border border-border">
                <span class="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Identificación del Operador</span>
                <div class="text-sm font-black text-foreground">{{ registroSeleccionado()?.usuarioNombre }}</div>
                <div class="text-xs text-muted-foreground mt-0.5 font-medium">
                  CI: {{ registroSeleccionado()?.usuarioCi }} · {{ registroSeleccionado()?.usuarioCargo }}
                </div>
                <div class="text-xs font-bold text-purple-700 dark:text-purple-400 mt-1">
                  Sede / Campus: {{ registroSeleccionado()?.campus }}
                </div>
              </div>

              <!-- Terminal, MAC e IP -->
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <span class="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block mb-0.5">Dirección MAC Terminal</span>
                  <div class="font-mono font-black text-xs text-blue-900 dark:text-blue-200">{{ registroSeleccionado()?.direccionMac }}</div>
                  <div class="text-[10px] text-blue-600 mt-0.5">{{ registroSeleccionado()?.nombreEquipo }}</div>
                </div>

                <div class="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <span class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">IP Pública & ISP</span>
                  <div class="font-mono font-black text-xs text-emerald-900 dark:text-emerald-200">{{ registroSeleccionado()?.ipPublica }}</div>
                  <div class="text-[10px] text-emerald-600 mt-0.5">Geolocalización Bolivia</div>
                </div>
              </div>

              <!-- Acción y Entorno -->
              <div class="p-3.5 rounded-xl bg-card border border-border space-y-2">
                <div>
                  <span class="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Acción Ejecutada</span>
                  <p class="text-xs font-bold text-foreground leading-relaxed">{{ registroSeleccionado()?.accion }}</p>
                </div>
                <div class="pt-2 border-t border-border/80 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Navegador: {{ registroSeleccionado()?.navegador }}</span>
                  <span>{{ registroSeleccionado()?.sistemaOperativo }}</span>
                </div>
              </div>

            </div>

            <div class="bg-muted/30 border-t border-border p-4 flex justify-end">
              <button 
                (click)="cerrarDetalle()"
                class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors">
                Cerrar
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class AuditoriaComponent {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly feedback = inject(UiFeedbackService);

  public busquedaTexto = '';
  public filtroModulo = 'TODOS';
  public filtroNivel = 'TODOS';

  public registroSeleccionado = signal<AuditoriaAccesoItem | null>(null);

  public registrosFiltrados = computed(() => {
    let items = this.storage.bitacoraAuditoria();

    if (this.filtroModulo !== 'TODOS') {
      items = items.filter(i => i.modulo === this.filtroModulo);
    }

    if (this.filtroNivel !== 'TODOS') {
      items = items.filter(i => i.nivel === this.filtroNivel);
    }

    if (this.busquedaTexto.trim()) {
      const q = this.busquedaTexto.toLowerCase();
      items = items.filter(i => 
        i.usuarioNombre.toLowerCase().includes(q) ||
        i.direccionMac.toLowerCase().includes(q) ||
        i.ipPublica.toLowerCase().includes(q) ||
        i.accion.toLowerCase().includes(q) ||
        i.campus.toLowerCase().includes(q)
      );
    }

    return items;
  });

  public terminalesUnicas = computed(() => {
    const macs = new Set(this.storage.bitacoraAuditoria().map(i => i.direccionMac));
    return macs.size;
  });

  public operacionesCriticas = computed(() => {
    return this.storage.bitacoraAuditoria().filter(i => i.nivel === 'OPERACION_CRITICA').length;
  });

  public alertasSeguridad = computed(() => {
    return this.storage.bitacoraAuditoria().filter(i => i.nivel === 'ADVERTENCIA').length;
  });

  public abrirDetalle(item: AuditoriaAccesoItem): void {
    this.registroSeleccionado.set(item);
  }

  public cerrarDetalle(): void {
    this.registroSeleccionado.set(null);
  }

  public exportarExcel(): void {
    void this.feedback.mostrar(
      `La bitácora se preparará como BITACORA_AUDITORIA_UNITEPC_${new Date().toISOString().slice(0, 10)}.xlsx.`,
      'Exportación de bitácora',
      'info'
    );
  }

  public imprimirActa(): void {
    window.print();
  }
}
