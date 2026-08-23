import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionesStorageService, PlanEstudioItem, PlanEstudioSemestre } from '../../core/services/evaluaciones-storage.service';

@Component({
  selector: 'sea-plan-estudios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <i class="pi pi-book text-base"></i>
            </div>
            <h2 class="text-2xl font-black tracking-tight text-foreground">Plan de Estudios</h2>
          </div>
          <p class="text-xs text-muted-foreground mt-1">Vista general del plan de estudios por semestre y gestión de modalidades de examen.</p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="descargarMalla()" class="bg-card hover:bg-muted text-primary border border-border font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 shadow-2xs transition-colors">
            <i class="pi pi-download"></i>
            <span>Descargar Malla</span>
          </button>
        </div>
      </div>

      <!-- Filtros Superiores -->
      <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <!-- Selector de Gestión (Default II-2026) -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-calendar text-primary text-[10px]"></i> Gestión Académica
            </label>
            <select 
              [ngModel]="storage.gestionActiva()" 
              (ngModelChange)="onGestionChange($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-black text-foreground outline-none cursor-pointer focus:border-primary">
              <option value="II-2026">II-2026 (Gestión Activa)</option>
              <option value="I-2026">I-2026 (Anterior)</option>
              <option value="II-2025">II-2025 (Histórico)</option>
            </select>
          </div>

          <!-- Sede Académica -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-building text-primary text-[10px]"></i> Sede Académica
            </label>
            <select 
              [(ngModel)]="filtroSedeId"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              @for (sede of storage.sedes(); track sede.id) {
                <option [value]="sede.id">{{ sede.nombre }}</option>
              }
            </select>
          </div>

          <!-- Carrera -->
          <div class="lg:col-span-2">
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-graduation-cap text-primary text-[10px]"></i> Carrera
            </label>
            <select 
              [(ngModel)]="filtroCarreraId"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              @for (carrera of storage.carreras(); track carrera.id) {
                <option [value]="carrera.id">{{ carrera.nombre }}</option>
              }
            </select>
          </div>

          <!-- Buscar Plan de Estudios -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-search text-primary text-[10px]"></i> Búsqueda
            </label>
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="busquedaTexto" 
                placeholder="Buscar plan de estudios..."
                class="w-full bg-muted/70 border border-border rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary">
              <i class="pi pi-search absolute left-2.5 top-2.5 text-muted-foreground text-xs"></i>
            </div>
          </div>

        </div>

        <!-- Fila Inferior de Filtros: Plan Curricular, Toggle y Tabs de Parcial -->
        <div class="pt-3 border-t border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <!-- Selector Plan Curricular y Toggle -->
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-extrabold uppercase text-muted-foreground">Plan Curricular:</span>
              <select 
                [(ngModel)]="filtroPlanCurricular" 
                class="bg-muted/70 border border-border rounded-lg px-2.5 py-1 text-xs font-bold text-foreground outline-none">
                <option value="todos">Todos los Planes</option>
                <option value="2024-V2">Plan 2024-V2</option>
                <option value="MED-2022">Plan MED-2022</option>
              </select>
            </div>

            <!-- Toggle Ocultar sin asignar -->
            <label class="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
              <input 
                type="checkbox" 
                [(ngModel)]="ocultarSinAsignar" 
                class="rounded text-amber-500 focus:ring-amber-500 h-4 w-4">
              <span class="text-muted-foreground">Ocultar sin asignar</span>
            </label>
          </div>

          <!-- Tabs de Seguimiento de Examen (Pills interactivas) -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mr-1">Seguimiento de Examen:</span>
            
            <button 
              [class]="parcialActivo() === '1P' ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'"
              (click)="parcialActivo.set('1P')"
              class="font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <i class="pi pi-flag text-xs"></i>
              <span>1er Parcial</span>
            </button>

            <button 
              [class]="parcialActivo() === '2P' ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'"
              (click)="parcialActivo.set('2P')"
              class="font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <i class="pi pi-check-circle text-xs"></i>
              <span>2do Parcial</span>
            </button>

            <button 
              [class]="parcialActivo() === 'FINAL' ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'"
              (click)="parcialActivo.set('FINAL')"
              class="font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <i class="pi pi-star text-xs"></i>
              <span>Examen Final</span>
            </button>

            <button 
              [class]="parcialActivo() === '2DA_INSTANCIA' ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'"
              (click)="parcialActivo.set('2DA_INSTANCIA')"
              class="font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <i class="pi pi-refresh text-xs"></i>
              <span>2da Instancia</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Tarjetas de Estadísticas -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- Total Plan de Estudios -->
        <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="text-3xl font-black text-primary font-mono">77</span>
            <p class="text-xs font-bold text-muted-foreground">Total Plan de Estudios</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <i class="pi pi-book text-xl"></i>
          </div>
        </div>

        <!-- Asignadas con Docente -->
        <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="text-3xl font-black text-emerald-600 font-mono">51</span>
            <p class="text-xs font-bold text-muted-foreground">Asignadas con Docente</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <i class="pi pi-user-plus text-xl"></i>
          </div>
        </div>

        <!-- Vacantes / Por Designar -->
        <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="text-3xl font-black text-amber-500 font-mono">26</span>
            <p class="text-xs font-bold text-muted-foreground">Vacantes / Por Designar</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <i class="pi pi-user-minus text-xl"></i>
          </div>
        </div>

      </div>

      <!-- Lista de Semestres (Acordeones Expandibles por Semestre) -->
      <div class="space-y-4">
        @for (sem of semestresFiltrados(); track sem.numero) {
          <div class="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            
            <!-- Cabecera del Semestre (Acordeón) -->
            <div 
              (click)="toggleSemestre(sem.numero)"
              class="p-4 bg-card hover:bg-muted/30 border-b border-border flex items-center justify-between cursor-pointer transition-colors select-none">
              
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs font-mono shadow-xs">
                  {{ sem.numero }}°
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">{{ sem.nombre }}</h3>
                  <p class="text-[11px] text-muted-foreground font-medium">
                    {{ sem.asignaturas.length }} planes de estudio · {{ sem.horasTotales }} horas
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <i [class]="isExpanded(sem.numero) ? 'pi pi-chevron-up text-primary' : 'pi pi-chevron-down text-muted-foreground'" class="text-sm"></i>
              </div>
            </div>

            <!-- Tabla de Asignaturas del Semestre (Sin columna de conteo de preguntas) -->
            @if (isExpanded(sem.numero)) {
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th class="p-3.5">Código</th>
                      <th class="p-3.5">Plan de Estudios</th>
                      <th class="p-3.5 text-center">Horas</th>
                      <th class="p-3.5">Docente / Grupo</th>
                      <th class="p-3.5 text-center">Modalidad Cartilla</th>
                      <th class="p-3.5 text-center">Fecha {{ parcialLabel() }}</th>
                      <th class="p-3.5 text-center">Estado Examen</th>
                      <th class="p-3.5 text-center">Estado</th>
                      <th class="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border text-xs">
                    @for (asig of sem.asignaturas; track asig.id) {
                      <tr class="hover:bg-muted/20 transition-colors">
                        
                        <!-- Código -->
                        <td class="p-3.5 font-mono font-bold text-primary">
                          {{ asig.codigo }}
                        </td>

                        <!-- Plan de Estudios -->
                        <td class="p-3.5">
                          <div class="font-black text-foreground">{{ asig.nombre }}</div>
                          @if (asig.esMateriaComun) {
                            <span class="bg-indigo-50 border border-indigo-200 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              Materia Común
                            </span>
                          }
                        </td>

                        <!-- Horas -->
                        <td class="p-3.5 text-center font-mono font-bold text-muted-foreground">
                          {{ asig.horas }}
                        </td>

                        <!-- Docente / Grupo -->
                        <td class="p-3.5">
                          @if (asig.asignada) {
                            <div class="flex items-center gap-2">
                              <div class="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                <i class="pi pi-user"></i>
                              </div>
                              <div class="min-w-0">
                                <div class="font-bold text-foreground text-[11px] truncate">{{ asig.docenteNombre }}</div>
                                <span class="text-[10px] text-primary font-bold">
                                  <i class="pi pi-users text-[9px]"></i> {{ asig.grupo }}
                                </span>
                              </div>
                            </div>
                          } @else {
                            <div class="flex items-center gap-1.5 text-amber-600 text-xs italic font-medium">
                              <i class="pi pi-exclamation-triangle"></i>
                              <span>Sin asignar</span>
                            </div>
                          }
                        </td>

                        <!-- Modalidad Cartilla -->
                        <td class="p-3.5 text-center">
                          @if (asig.conCartilla) {
                            <span class="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <i class="pi pi-file-check text-[9px]"></i> Con Cartilla
                            </span>
                          } @else {
                            <span class="bg-muted text-muted-foreground border border-border text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <i class="pi pi-file text-[9px]"></i> Sin Cartilla (Físico)
                            </span>
                          }
                        </td>

                        <!-- Fecha del Parcial Activo -->
                        <td class="p-3.5 text-center">
                          <span class="bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                            {{ getFecha(asig) }}
                          </span>
                        </td>

                        <!-- Estado del Examen -->
                        <td class="p-3.5 text-center">
                          @let est = getEstadoExamen(asig);
                          @if (est === 'Subido' || est === 'Generado') {
                            <span class="bg-indigo-900 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md uppercase shadow-2xs">
                              {{ est }}
                            </span>
                          } @else if (est === 'Devuelto') {
                            <span class="bg-rose-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md uppercase shadow-2xs">
                              Devuelto
                            </span>
                          } @else {
                            <span class="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-md">
                              Pendiente
                            </span>
                          }
                        </td>

                        <!-- Estado de Asignación -->
                        <td class="p-3.5 text-center">
                          @if (asig.asignada) {
                            <span class="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded-md">
                              Asignada
                            </span>
                          } @else {
                            <span class="bg-amber-100 text-amber-800 font-black text-[10px] px-2 py-0.5 rounded-md">
                              Vacante
                            </span>
                          }
                        </td>

                        <!-- Columna Acciones: Abre Modal de Confirmación y Advertencia de Estados -->
                        <td class="p-3.5 text-right">
                          <div class="inline-flex items-center gap-1.5">
                            @if (asig.conCartilla) {
                              <button 
                                (click)="solicitarCambioCartilla(asig)"
                                title="Cambiar a Sin Cartilla (Examen físico/manual)"
                                class="bg-muted hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 text-muted-foreground border border-border font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all">
                                <i class="pi pi-times-circle text-[10px]"></i>
                                <span>Sin Cartilla</span>
                              </button>
                            } @else {
                              <button 
                                (click)="solicitarCambioCartilla(asig)"
                                title="Cambiar a Con Cartilla (Generación digital/Typst)"
                                class="bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all">
                                <i class="pi pi-check-circle text-[10px]"></i>
                                <span>Con Cartilla</span>
                              </button>
                            }
                          </div>
                        </td>

                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

          </div>
        }
      </div>

      <!-- Modal de Advertencia de Transición de Estados -->
      @if (itemSeleccionadoParaCambio()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            
            <!-- Cabecera del Modal con Icono de Advertencia -->
            <div class="flex items-start gap-3.5">
              <div class="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <i class="pi pi-exclamation-triangle text-xl"></i>
              </div>
              <div class="space-y-1">
                <h3 class="text-base font-black text-foreground">Cambio en la Secuencia de Estados</h3>
                <p class="text-xs font-bold text-primary font-mono">
                  {{ itemSeleccionadoParaCambio()?.codigo }} · {{ itemSeleccionadoParaCambio()?.nombre }}
                </p>
              </div>
            </div>

            <!-- Cuerpo de la Advertencia según la transición -->
            <div class="bg-muted/60 border border-border rounded-xl p-4 space-y-3 text-xs text-foreground">
              @if (itemSeleccionadoParaCambio()?.conCartilla) {
                <!-- Transición: De Con Cartilla -> Sin Cartilla -->
                <p class="text-muted-foreground leading-relaxed">
                  Está a punto de cambiar la modalidad de evaluación a <strong>Sin Cartilla (Examen Físico / Manual)</strong>.
                </p>

                <div class="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-lg space-y-1.5">
                  <div class="font-extrabold text-amber-800 flex items-center gap-1.5">
                    <i class="pi pi-info-circle"></i>
                    <span>Impacto en el Flujo de Estados:</span>
                  </div>
                  <ul class="list-disc list-inside text-amber-900/90 text-[11px] space-y-1 font-medium">
                    <li>No se requerirá la carga de archivo Excel con banco de preguntas.</li>
                    <li>No se compilarán variantes automáticas ni cartillas con Typst.</li>
                    <li>El estado del examen pasará a <strong>Gestión Manual / Exento de Banco</strong>.</li>
                  </ul>
                </div>
              } @else {
                <!-- Transición: De Sin Cartilla -> Con Cartilla -->
                <p class="text-muted-foreground leading-relaxed">
                  Está a punto de activar la modalidad <strong>Con Cartilla (Generación Digital / Typst)</strong>.
                </p>

                <div class="bg-indigo-500/10 border-l-4 border-indigo-600 p-3 rounded-r-lg space-y-1.5">
                  <div class="font-extrabold text-indigo-900 flex items-center gap-1.5">
                    <i class="pi pi-info-circle"></i>
                    <span>Impacto en el Flujo de Estados:</span>
                  </div>
                  <ul class="list-disc list-inside text-indigo-900/90 text-[11px] space-y-1 font-medium">
                    <li>El encargado de evaluaciones subirá el archivo Excel con las preguntas y fórmulas.</li>
                    <li>El ciclo requerirá: <strong>Programado $\rightarrow$ Generado (Typst) $\rightarrow$ Impreso $\rightarrow$ Entregado $\rightarrow$ Devuelto $\rightarrow$ Revisado $\rightarrow$ Subido $\rightarrow$ Recibido</strong>.</li>
                  </ul>
                </div>
              }
            </div>

            <!-- Botones de Acción -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button 
                (click)="cancelarCambio()"
                class="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
              
              <button 
                (click)="confirmarCambio()"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black shadow-xs transition-colors flex items-center gap-2">
                <i class="pi pi-check"></i>
                <span>Confirmar y Cambiar Secuencia</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- Toast Notificación -->
      @if (toastMessage()) {
        <div class="fixed bottom-6 right-6 bg-foreground text-background px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-bounce">
          <i class="pi pi-check-circle text-emerald-400 text-lg"></i>
          <span class="text-xs font-bold">{{ toastMessage() }}</span>
        </div>
      }

    </div>
  `
})
export class PlanEstudiosComponent {
  public readonly storage = inject(EvaluacionesStorageService);

  public filtroSedeId = 1;
  public filtroCarreraId = 1;
  public filtroPlanCurricular = 'todos';
  public busquedaTexto = '';
  public ocultarSinAsignar = false;

  public parcialActivo = signal<'1P' | '2P' | 'FINAL' | '2DA_INSTANCIA'>('1P');
  public toastMessage = signal<string | null>(null);
  public itemSeleccionadoParaCambio = signal<PlanEstudioItem | null>(null);

  private _expandedSemestres = signal<number[]>([1, 2, 3]);

  public parcialLabel = computed(() => {
    switch (this.parcialActivo()) {
      case '1P': return '1P';
      case '2P': return '2P';
      case 'FINAL': return 'Final';
      case '2DA_INSTANCIA': return '2da Inst.';
    }
  });

  public semestresFiltrados = computed(() => {
    let list = this.storage.planSemestres();
    const query = this.busquedaTexto.trim().toLowerCase();

    if (query) {
      list = list.map(sem => ({
        ...sem,
        asignaturas: sem.asignaturas.filter(a => 
          a.nombre.toLowerCase().includes(query) || 
          a.codigo.toLowerCase().includes(query) ||
          a.docenteNombre.toLowerCase().includes(query)
        )
      })).filter(sem => sem.asignaturas.length > 0);
    }

    if (this.ocultarSinAsignar) {
      list = list.map(sem => ({
        ...sem,
        asignaturas: sem.asignaturas.filter(a => a.asignada)
      })).filter(sem => sem.asignaturas.length > 0);
    }

    return list;
  });

  public isExpanded(semestreNum: number): boolean {
    return this._expandedSemestres().includes(semestreNum);
  }

  public toggleSemestre(semestreNum: number): void {
    const current = this._expandedSemestres();
    if (current.includes(semestreNum)) {
      this._expandedSemestres.set(current.filter(n => n !== semestreNum));
    } else {
      this._expandedSemestres.set([...current, semestreNum]);
    }
  }

  public getFecha(asig: PlanEstudioItem): string {
    switch (this.parcialActivo()) {
      case '1P': return asig.fecha1P;
      case '2P': return asig.fecha2P;
      case 'FINAL':
      case '2DA_INSTANCIA': return asig.fechaFinal;
    }
  }

  public getEstadoExamen(asig: PlanEstudioItem): string {
    switch (this.parcialActivo()) {
      case '1P': return asig.estadoExamen1P;
      case '2P': return asig.estadoExamen2P;
      case 'FINAL':
      case '2DA_INSTANCIA': return asig.estadoExamenFinal;
    }
  }

  public solicitarCambioCartilla(asig: PlanEstudioItem): void {
    this.itemSeleccionadoParaCambio.set(asig);
  }

  public cancelarCambio(): void {
    this.itemSeleccionadoParaCambio.set(null);
  }

  public confirmarCambio(): void {
    const item = this.itemSeleccionadoParaCambio();
    if (!item) return;

    this.storage.toggleCartillaPlan(item.id);
    const nuevaModalidad = !item.conCartilla ? 'Con Cartilla (Digital)' : 'Sin Cartilla (Físico/Manual)';
    this.itemSeleccionadoParaCambio.set(null);
    this._mostrarToast(`${item.codigo}: Modalidad cambiada a '${nuevaModalidad}'. La secuencia de estados ha sido actualizada.`);
  }

  public onGestionChange(gestion: string): void {
    this.storage.setGestionActiva(gestion);
  }

  public descargarMalla(): void {
    alert('Simulación: Descargando Malla Curricular PDF oficial de la Carrera.');
  }

  private _mostrarToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
