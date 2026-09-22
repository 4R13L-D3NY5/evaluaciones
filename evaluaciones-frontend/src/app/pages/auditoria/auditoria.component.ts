import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { 
  AuditoriaService, 
  AuditoriaGlobalItem, 
  AuditoriaResumen 
} from '../../core/services/auditoria.service';
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
            Trazabilidad integral, registro de IPs públicas, direcciones de terminales y control de acciones críticas.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Botón Refrescar -->
          <button 
            (click)="cargarAuditoria()"
            [disabled]="cargando()"
            class="bg-muted hover:bg-muted/80 text-foreground border border-border font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            title="Recargar eventos">
            <i class="pi pi-refresh" [class.animate-spin]="cargando()"></i>
            <span class="hidden sm:inline">Actualizar</span>
          </button>

          <!-- Botón Exportar Bitácora a Excel -->
          <button 
            (click)="exportarExcel()"
            [disabled]="cargando() || registrosFiltrados().length === 0"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
            <i class="pi pi-file-excel"></i>
            <span>Exportar Bitácora (.xlsx)</span>
          </button>

          <!-- Botón Imprimir Reporte Oficial de Auditoría -->
          <button 
            (click)="imprimirActa()"
            [disabled]="cargando() || registrosFiltrados().length === 0"
            class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
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
            <div class="text-2xl font-black text-foreground font-mono">
              @if (cargando()) {
                <span class="text-base text-muted-foreground animate-pulse">Cargando...</span>
              } @else {
                {{ totalEventosKpi() }}
              }
            </div>
            <span class="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
              <i class="pi pi-check-circle text-[9px]"></i> 100% Trazabilidad activa
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">
            <i class="pi pi-history"></i>
          </div>
        </div>

        <!-- Terminales / IPs Únicas -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider block mb-1">Terminales & IPs Identificadas</span>
            <div class="text-2xl font-black text-blue-600 font-mono">
              @if (cargando()) {
                <span class="text-base text-muted-foreground animate-pulse">...</span>
              } @else {
                {{ terminalesUnicasKpi() }}
              }
            </div>
            <span class="text-[10px] text-muted-foreground font-medium mt-1 block">Equipos y terminales activas</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <i class="pi pi-desktop"></i>
          </div>
        </div>

        <!-- Operaciones Críticas -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider block mb-1">Operaciones Críticas</span>
            <div class="text-2xl font-black text-rose-600 font-mono">
              @if (cargando()) {
                <span class="text-base text-muted-foreground animate-pulse">...</span>
              } @else {
                {{ operacionesCriticasKpi() }}
              }
            </div>
            <span class="text-[10px] text-rose-600 font-bold mt-1 inline-flex items-center gap-1">
              <i class="pi pi-bolt text-[9px]"></i> Generaciones, cambios y resets
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
            <div class="text-2xl font-black text-amber-600 font-mono">
              @if (cargando()) {
                <span class="text-base text-muted-foreground animate-pulse">...</span>
              } @else {
                {{ alertasSeguridadKpi() }}
              }
            </div>
            <span class="text-[10px] text-amber-600 font-bold mt-1 inline-flex items-center gap-1">
              <i class="pi pi-exclamation-triangle text-[9px]"></i> Devoluciones y alertas
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
              <i class="pi pi-search text-primary text-[10px]"></i> Buscar por Usuario, IP, Acción o Detalle
            </label>
            <div class="relative">
              <input 
                type="text" 
                [ngModel]="busquedaTexto()"
                (ngModelChange)="busquedaTexto.set($event)"
                placeholder="Ej. Docente, 192.168, Creación, Impresión, ROL-..."
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
              [ngModel]="filtroModulo()"
              (ngModelChange)="filtroModulo.set($event)"
              class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
              <option value="TODOS">Todos los Módulos</option>
              <option value="Evaluaciones">Evaluaciones</option>
              <option value="Banco de Preguntas">Banco de Preguntas</option>
              <option value="Generación Typst">Generación de exámenes</option>
              <option value="Calificación OMR">Calificación OMR</option>
              <option value="Examen Virtual">Examen Virtual</option>
              <option value="Usuarios y Accesos">Usuarios y Accesos</option>
              <option value="Respaldos">Respaldos</option>
              <option value="Verificación de Exámenes">Verificación de Exámenes</option>
            </select>
          </div>

          <!-- Filtro por Nivel de Criticidad -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-flag text-primary text-[10px]"></i> Nivel de Severidad
            </label>
            <select 
              [ngModel]="filtroNivel()"
              (ngModelChange)="filtroNivel.set($event)"
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
          <span class="text-[11px] text-muted-foreground flex items-center gap-1">
            <i class="pi pi-shield text-[10px] text-emerald-600"></i>
            Trazabilidad institucional en tiempo real
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="bg-muted/60 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th class="p-3.5 w-32">Fecha / Hora</th>
                <th class="p-3.5 min-w-[200px]">Usuario & Cargo</th>
                <th class="p-3.5 min-w-[150px]">IP & Origen</th>
                <th class="p-3.5 w-36">Módulo</th>
                <th class="p-3.5 min-w-[260px]">Acción Realizada</th>
                <th class="p-3.5 text-center w-28">Nivel</th>
                <th class="p-3.5 text-right w-16">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border font-medium text-foreground">
              @if (cargando()) {
                <tr>
                  <td colspan="7" class="p-10 text-center text-xs text-muted-foreground">
                    <i class="pi pi-spin pi-spinner text-xl text-purple-700 block mb-2"></i>
                    Cargando bitácora de auditoría desde el servidor...
                  </td>
                </tr>
              } @else if (registrosFiltrados().length === 0) {
                <tr>
                  <td colspan="7" class="p-10 text-center text-xs text-muted-foreground">
                    <i class="pi pi-inbox text-2xl block mb-2 text-slate-400"></i>
                    No se encontraron registros de auditoría que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              } @else {
                @for (item of registrosFiltrados(); track item.id) {
                  <tr class="hover:bg-muted/20 transition-colors">
                    
                    <!-- Fecha y Hora Formateada en Hora Boliviana -->
                    <td class="p-3.5 font-mono text-[11px]">
                      <div class="font-bold text-foreground">
                        {{ formatearSoloFecha(item.fechaEvento) }}
                      </div>
                      <div class="text-[10px] text-muted-foreground">
                        {{ formatearSoloHora(item.fechaEvento) }}
                      </div>
                    </td>

                    <!-- Usuario & Cargo -->
                    <td class="p-3.5">
                      <div class="font-black text-foreground text-xs">{{ item.usuarioNombre || item.usuario }}</div>
                      <div class="text-[10px] text-muted-foreground mt-0.5">
                        {{ item.usuarioCargo }}
                        @if (item.campus) {
                          · <span class="font-mono text-purple-700 dark:text-purple-400 font-bold">{{ item.campus }}</span>
                        }
                      </div>
                    </td>

                    <!-- IP Pública / Origen -->
                    <td class="p-3.5 font-mono text-[11px]">
                      <div class="flex items-center gap-1.5 font-bold text-foreground">
                        <i class="pi pi-globe text-blue-600 text-[10px]"></i>
                        <span class="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded text-[10px]">
                          {{ item.ipOrigen }}
                        </span>
                      </div>
                      <div class="text-[10px] text-muted-foreground mt-1 font-sans">
                        Terminal Segura
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
                      @if (item.codigoAccion && item.codigoAccion !== item.accion) {
                        <span class="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                          Código: {{ item.codigoAccion }}
                        </span>
                      }
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
                  <p class="text-xs text-white/80 font-mono">{{ formatearFechaHora(registroSeleccionado()?.fechaEvento) }}</p>
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
                <div class="text-sm font-black text-foreground">{{ registroSeleccionado()?.usuarioNombre || registroSeleccionado()?.usuario }}</div>
                <div class="text-xs text-muted-foreground mt-0.5 font-medium">
                  Usuario: {{ registroSeleccionado()?.usuario }} · {{ registroSeleccionado()?.usuarioCargo }}
                </div>
                @if (registroSeleccionado()?.campus) {
                  <div class="text-xs font-bold text-purple-700 dark:text-purple-400 mt-1">
                    Sede / Campus: {{ registroSeleccionado()?.campus }}
                  </div>
                }
              </div>

              <!-- Origen, IP y Nivel -->
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <span class="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block mb-0.5">IP Origen Registrada</span>
                  <div class="font-mono font-black text-xs text-blue-900 dark:text-blue-200">{{ registroSeleccionado()?.ipOrigen }}</div>
                  <div class="text-[10px] text-blue-600 mt-0.5">Terminal Autenticada</div>
                </div>

                <div class="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                  <span class="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block mb-0.5">Módulo & Severidad</span>
                  <div class="font-black text-xs text-purple-900 dark:text-purple-200">{{ registroSeleccionado()?.modulo }}</div>
                  <div class="text-[10px] text-purple-700 mt-0.5 font-bold">{{ registroSeleccionado()?.nivel }}</div>
                </div>
              </div>

              <!-- Acción y Código Técnico -->
              <div class="p-3.5 rounded-xl bg-card border border-border space-y-2">
                <div>
                  <span class="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Acción Ejecutada</span>
                  <p class="text-xs font-bold text-foreground leading-relaxed">{{ registroSeleccionado()?.accion }}</p>
                </div>
                @if (registroSeleccionado()?.codigoAccion) {
                  <div class="pt-2 border-t border-border/80 text-[10px] text-muted-foreground font-mono">
                    Código Técnico: {{ registroSeleccionado()?.codigoAccion }}
                  </div>
                }
                @if (registroSeleccionado()?.detallesJson) {
                  <div class="pt-2 border-t border-border/80">
                    <span class="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Detalle del Registro</span>
                    <pre class="bg-muted p-2 rounded-lg text-[10px] font-mono text-foreground overflow-x-auto max-h-32 whitespace-pre-wrap">{{ formatearDetallesJson(registroSeleccionado()?.detallesJson) }}</pre>
                  </div>
                }
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
export class AuditoriaComponent implements OnInit {
  private readonly auditoriaService = inject(AuditoriaService);
  private readonly feedback = inject(UiFeedbackService);

  public cargando = signal<boolean>(false);
  public resumen = signal<AuditoriaResumen | null>(null);
  public items = signal<AuditoriaGlobalItem[]>([]);

  public busquedaTexto = signal<string>('');
  public filtroModulo = signal<string>('TODOS');
  public filtroNivel = signal<string>('TODOS');

  public registroSeleccionado = signal<AuditoriaGlobalItem | null>(null);

  public ngOnInit(): void {
    this.cargarAuditoria();
  }

  public cargarAuditoria(): void {
    this.cargando.set(true);
    this.auditoriaService.obtenerAuditoria({ limite: 500 }).subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.items.set(data.items || []);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al consultar auditoría:', err);
        this.cargando.set(false);
        void this.feedback.mostrar(
          'No se pudo obtener la bitácora de auditoría del servidor. Verifica tu sesión.',
          'Error de Auditoría',
          'error'
        );
      }
    });
  }

  public registrosFiltrados = computed(() => {
    let list = this.items();
    const modulo = this.filtroModulo();
    const nivel = this.filtroNivel();
    const q = this.busquedaTexto().trim().toLowerCase();

    if (modulo !== 'TODOS') {
      list = list.filter(i => i.modulo === modulo);
    }

    if (nivel !== 'TODOS') {
      list = list.filter(i => i.nivel === nivel);
    }

    if (q) {
      list = list.filter(i =>
        (i.usuario && i.usuario.toLowerCase().includes(q)) ||
        (i.usuarioNombre && i.usuarioNombre.toLowerCase().includes(q)) ||
        (i.accion && i.accion.toLowerCase().includes(q)) ||
        (i.codigoAccion && i.codigoAccion.toLowerCase().includes(q)) ||
        (i.ipOrigen && i.ipOrigen.toLowerCase().includes(q)) ||
        (i.campus && i.campus.toLowerCase().includes(q)) ||
        (i.modulo && i.modulo.toLowerCase().includes(q)) ||
        (i.detallesJson && i.detallesJson.toLowerCase().includes(q))
      );
    }

    return list;
  });

  public totalEventosKpi = computed(() => {
    return this.resumen()?.totalEventos ?? this.items().length;
  });

  public terminalesUnicasKpi = computed(() => {
    return this.resumen()?.ipsUnicas ?? 0;
  });

  public operacionesCriticasKpi = computed(() => {
    return this.resumen()?.operacionesCriticas ?? 0;
  });

  public alertasSeguridadKpi = computed(() => {
    return this.resumen()?.alertasSeguridad ?? 0;
  });

  public abrirDetalle(item: AuditoriaGlobalItem): void {
    this.registroSeleccionado.set(item);
  }

  public cerrarDetalle(): void {
    this.registroSeleccionado.set(null);
  }

  public formatearFechaHora(fecha?: string): string {
    if (!fecha) return 'Fecha no disponible';
    const fechaNormalizada = fecha.includes('T') ? fecha : fecha.replace(' ', 'T');
    const tieneZona = fechaNormalizada.endsWith('Z') || /[+-]\d{2}(:\d{2})?$/.test(fechaNormalizada);
    const fechaIso = tieneZona ? fechaNormalizada : `${fechaNormalizada}Z`;
    const valor = new Date(fechaIso);
    if (Number.isNaN(valor.getTime())) return fecha.replace('T', ' ');
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/La_Paz'
    }).format(valor);
  }

  public formatearSoloFecha(fecha?: string): string {
    const completa = this.formatearFechaHora(fecha);
    return completa.split(',')[0] || completa;
  }

  public formatearSoloHora(fecha?: string): string {
    const completa = this.formatearFechaHora(fecha);
    const partes = completa.split(',');
    return partes[1] ? partes[1].trim() : '';
  }

  public formatearDetallesJson(detalles?: string): string {
    if (!detalles) return 'Sin detalle adicional';
    try {
      const parsed = JSON.parse(detalles);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return detalles;
    }
  }

  public exportarExcel(): void {
    const lista = this.registrosFiltrados();
    if (lista.length === 0) {
      void this.feedback.mostrar('No hay registros para exportar con los filtros actuales.', 'Atención', 'warn');
      return;
    }

    const datos = lista.map((item, idx) => ({
      'N°': idx + 1,
      'Identificador': item.id,
      'Fecha y Hora': this.formatearFechaHora(item.fechaEvento),
      'Usuario': item.usuarioNombre || item.usuario,
      'Cargo / Rol': item.usuarioCargo,
      'IP Origen': item.ipOrigen,
      'Módulo': item.modulo,
      'Acción Realizada': item.accion,
      'Código Técnico': item.codigoAccion,
      'Nivel': item.nivel,
      'Sede / Campus': item.campus || 'General',
      'Detalles': item.detallesJson || ''
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Bitacora_Auditoria');

    const fechaStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `BITACORA_AUDITORIA_UNITEPC_${fechaStr}.xlsx`);

    void this.feedback.mostrar(
      `Se exportaron exitosamente ${datos.length} registros a Excel.`,
      'Bitácora Exportada',
      'success'
    );
  }

  public imprimirActa(): void {
    window.print();
  }
}
