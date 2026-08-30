import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  EvaluacionesStorageService, 
  GestionEvaluacionItem, 
  EtapaEvaluacion 
} from '../../core/services/evaluaciones-storage.service';

interface SedeMetrica {
  id: number;
  nombre: string;
  ciudad: string;
  totalExamenes: number;
  generados: number;
  impresos: number;
  devueltos: number;
  porcentaje: number;
  color: string;
}

interface EstadoMetrica {
  estado: EtapaEvaluacion;
  cantidad: number;
  porcentaje: number;
  color: string;
  badgeClass: string;
  icon: string;
}

@Component({
  selector: 'sea-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-8">
      
      <!-- 1. CABECERA EJECUTIVA Y FILTROS RÁPIDOS -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-purple-900/50">
        
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Sistema de Evaluaciones SEA · UNITEPC
            </span>
            <span class="text-white/60 text-xs">|</span>
            <span class="text-xs text-white/80 font-mono font-bold flex items-center gap-1">
              <i class="pi pi-bolt text-purple-400"></i> Motor de generación activo
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Panel de Control y Monitoreo Institucional
          </h1>
          <p class="text-xs text-purple-200/80 max-w-2xl font-medium">
            Seguimiento en tiempo real de generación de exámenes, lectura óptica OMR, trazabilidad de estados y cobertura en sedes.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Selector de Sede -->
          <div class="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-2 text-xs transition-colors backdrop-blur-xs">
            <i class="pi pi-building text-purple-300"></i>
            <select 
              [(ngModel)]="filtroSedeDashboard"
              class="bg-transparent text-white font-bold outline-none cursor-pointer">
              <option value="0" class="text-slate-900">Todas las Sedes (Nacional)</option>
              <option value="1" class="text-slate-900">Cochabamba - Colonial</option>
              <option value="2" class="text-slate-900">Cochabamba - Juan Pablo II</option>
              <option value="3" class="text-slate-900">Sede La Paz</option>
              <option value="4" class="text-slate-900">Sede Santa Cruz</option>
            </select>
          </div>

          <!-- Selector de Gestión -->
          <div class="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-2 text-xs transition-colors backdrop-blur-xs">
            <i class="pi pi-calendar text-amber-300"></i>
            <select 
              [ngModel]="storage.gestionActiva()" 
              (ngModelChange)="storage.setGestionActiva($event)"
              class="bg-transparent text-white font-bold outline-none cursor-pointer">
              <option value="II-2026" class="text-slate-900">Gestión II-2026 (Activa)</option>
              <option value="I-2026" class="text-slate-900">Gestión I-2026 (Anterior)</option>
              <option value="II-2025" class="text-slate-900">Gestión II-2025 (Histórico)</option>
            </select>
          </div>

          <!-- Botón Directo a Evaluaciones del Día -->
          <a 
            routerLink="/evaluaciones-dia" 
            class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer">
            <i class="pi pi-calendar-clock text-sm animate-bounce"></i>
            <span>Evaluaciones del Día</span>
          </a>
        </div>

      </div>

      <!-- 2. GRID DE KPIS EJECUTIVOS CON INDICADORES VISUALES -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- KPI 1: Evaluaciones Programadas -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all group">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Total Evaluaciones</span>
            <div class="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 border border-purple-200 dark:border-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i class="pi pi-calendar text-base"></i>
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <div>
              <span class="text-3xl font-black text-foreground font-mono">{{ totalExamenesFiltrados() }}</span>
              <span class="text-[11px] font-bold text-muted-foreground block mt-0.5">Asignaturas en rol oficial</span>
            </div>
            <span class="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              +8.4% vs I-2026
            </span>
          </div>
          <!-- Barra Mini Progreso -->
          <div class="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
            <div class="bg-purple-600 h-full rounded-full" style="width: 100%"></div>
          </div>
        </div>

        <!-- KPI 2: Evaluaciones Activas Hoy -->
        <div class="bg-card border border-emerald-500/30 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all bg-gradient-to-br from-card to-emerald-500/5 group">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Turnos Hoy (20/08)</span>
            <div class="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i class="pi pi-clock text-base"></i>
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <div>
              <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ totalExamenesHoy() }}</span>
              <span class="text-[11px] font-bold text-emerald-700/80 dark:text-emerald-300/80 block mt-0.5">
                {{ totalConCartillaHoy() }} Con Cartilla · {{ totalSinCartillaHoy() }} Manual
              </span>
            </div>
            <span class="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              En Curso
            </span>
          </div>
          <div class="w-full bg-emerald-200/50 dark:bg-emerald-950 h-1.5 rounded-full mt-3 overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full" [style.width.%]="porcentajeTurnosHoy()"></div>
          </div>
        </div>

        <!-- KPI 3: Variantes y Paquetes Generados -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all group">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Variantes del examen (A-E)</span>
            <div class="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200 dark:border-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i class="pi pi-file-pdf text-base"></i>
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <div>
              <span class="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">{{ totalVariantesGeneradas() }}</span>
              <span class="text-[11px] font-bold text-muted-foreground block mt-0.5">Cuadernillos listos (38ms/var)</span>
            </div>
            <span class="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              {{ porcentajeGenerados() }}% Listos
            </span>
          </div>
          <div class="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
            <div class="bg-blue-600 h-full rounded-full" [style.width.%]="porcentajeGenerados()"></div>
          </div>
        </div>

        <!-- KPI 4: Cobertura de Bancos Validados -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all group">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Cobertura de Bancos</span>
            <div class="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-200 dark:border-amber-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i class="pi pi-database text-base"></i>
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <div>
              <span class="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{{ storage.kpiResumen().porcentajeCobertura }}%</span>
              <span class="text-[11px] font-bold text-muted-foreground block mt-0.5">{{ totalReactivosBancos() }} reactivos cifrados</span>
            </div>
            <span class="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              42/50 Docentes
            </span>
          </div>
          <div class="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
            <div class="bg-amber-500 h-full rounded-full" [style.width.%]="storage.kpiResumen().porcentajeCobertura"></div>
          </div>
        </div>

      </div>

      <!-- 3. SECCIÓN GRÁFICA PRINCIPAL: PIPELINE DE ESTADOS Y COBERTURA POR SEDE -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- GRÁFICO 1: EMBUDO DEL CICLO DE EXÁMENES (DISTRIBUCIÓN DE ESTADOS EN TIEMPO REAL) -->
        <div class="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <i class="pi pi-sliders-h text-primary"></i>
                <h3 class="text-sm font-black uppercase tracking-wider text-foreground">
                  Embudo del Ciclo de Vida de Evaluaciones (Pipeline de 8 Etapas)
                </h3>
              </div>
              <p class="text-xs text-muted-foreground">Distribución y avance en tiempo real de las asignaturas en cada etapa del proceso.</p>
            </div>
            
            <span class="bg-muted text-foreground text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-border">
              Total Monitoreadas: {{ totalExamenesFiltrados() }}
            </span>
          </div>

          <!-- Barras Progresivas de Estados -->
          <div class="space-y-3">
            @for (est of metricasEstados(); track est.estado) {
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span [class]="est.badgeClass" class="text-[9.5px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <i [class]="est.icon"></i>
                      <span>{{ est.estado }}</span>
                    </span>
                  </div>

                  <div class="flex items-center gap-3 font-mono">
                    <span class="text-foreground font-black text-xs">{{ est.cantidad }} materias</span>
                    <span class="text-muted-foreground font-bold text-[11px] w-12 text-right">({{ est.porcentaje }}%)</span>
                  </div>
                </div>

                <!-- Barra de Progreso con Gradiente -->
                <div class="w-full bg-muted h-3 rounded-full overflow-hidden border border-border/60">
                  <div 
                    [class]="est.color"
                    class="h-full rounded-full transition-all duration-500 shadow-xs"
                    [style.width.%]="est.porcentaje">
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Leyenda de Estados -->
          <div class="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground font-bold">
            <span class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-purple-600"></span> Fase 1: Planificación (Programado/Generado)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-blue-600"></span> Fase 2: Impresión y Despacho
            </span>
            <span class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-emerald-600"></span> Fase 3: Recepción y Lectura OMR
            </span>
          </div>
        </div>

        <!-- GRÁFICO 2: DISTRIBUCIÓN DE DIFICULTAD EN BANCO DE PREGUNTAS (DONUT SVG) -->
        <div class="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div class="flex items-center gap-2">
                <i class="pi pi-chart-pie text-amber-500"></i>
                <h3 class="text-sm font-black uppercase tracking-wider text-foreground">
                  Composición de Reactivos
                </h3>
              </div>
              <span class="text-[10px] font-bold text-muted-foreground uppercase">Bancos Excel</span>
            </div>

            <!-- Donut Chart SVG Renderizado Dinámicamente -->
            <div class="flex flex-col items-center justify-center my-2">
              <div class="relative w-44 h-44 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <!-- Fondo Circular -->
                  <path
                    class="text-muted/60 stroke-current"
                    stroke-width="4.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <!-- Segmento Fácil (30% - Verde) -->
                  <path
                    class="text-emerald-500 stroke-current transition-all duration-700"
                    stroke-dasharray="30, 100"
                    stroke-width="4.5"
                    stroke-linecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <!-- Segmento Medio (50% - Azul/Índigo) -->
                  <path
                    class="text-indigo-600 stroke-current transition-all duration-700"
                    stroke-dasharray="50, 100"
                    stroke-dashoffset="-30"
                    stroke-width="4.5"
                    stroke-linecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <!-- Segmento Difícil (20% - Ámbar/Rojo) -->
                  <path
                    class="text-rose-500 stroke-current transition-all duration-700"
                    stroke-dasharray="20, 100"
                    stroke-dashoffset="-80"
                    stroke-width="4.5"
                    stroke-linecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <!-- Texto Central del Donut -->
                <div class="absolute flex flex-col items-center justify-center text-center">
                  <span class="text-2xl font-black text-foreground font-mono">1,840</span>
                  <span class="text-[9px] font-bold text-muted-foreground uppercase">Reactivos</span>
                </div>
              </div>
            </div>

            <!-- Leyenda de Dificultad -->
            <div class="space-y-2 text-xs pt-3 border-t border-border">
              <div class="flex items-center justify-between font-bold">
                <span class="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Nivel Fácil (30%)
                </span>
                <span class="font-mono text-foreground">552 preguntas</span>
              </div>
              <div class="flex items-center justify-between font-bold">
                <span class="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <span class="h-2.5 w-2.5 rounded-full bg-indigo-600"></span> Nivel Medio (50%)
                </span>
                <span class="font-mono text-foreground">920 preguntas</span>
              </div>
              <div class="flex items-center justify-between font-bold">
                <span class="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Nivel Difícil (20%)
                </span>
                <span class="font-mono text-foreground">368 preguntas</span>
              </div>
            </div>
          </div>

          <!-- Nota de Calidad -->
          <div class="bg-muted/60 p-3 rounded-xl border border-border text-[11px] text-muted-foreground flex items-center gap-2">
            <i class="pi pi-check-circle text-emerald-600 text-sm shrink-0"></i>
            <span>Cumple con la norma psicométrica UNITEPC para exámenes multi-variante.</span>
          </div>
        </div>

      </div>

      <!-- 4. COMPARATIVA POR SEDES Y PRÓXIMOS TURNOS DE HOY -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- COMPARATIVA DE AVANCE POR SEDES / CAMPUS -->
        <div class="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <div class="flex items-center gap-2">
              <i class="pi pi-building text-primary"></i>
              <h3 class="text-sm font-black uppercase tracking-wider text-foreground">
                Cobertura por Sede y Campus
              </h3>
            </div>
            <span class="text-[10px] font-bold text-muted-foreground uppercase">4 Campus</span>
          </div>

          <div class="space-y-4">
            @for (sd of estadisticasSedes(); track sd.id) {
              <div class="p-3.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/60 transition-colors space-y-2">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-xs font-black text-foreground uppercase">{{ sd.nombre }}</h4>
                    <span class="text-[10px] text-muted-foreground font-bold">{{ sd.ciudad }} · {{ sd.totalExamenes }} exámenes</span>
                  </div>
                  <span class="text-xs font-black font-mono text-foreground">{{ sd.porcentaje }}%</span>
                </div>

                <!-- Barra de Progreso de la Sede -->
                <div class="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/60">
                  <div [class]="sd.color" class="h-full rounded-full" [style.width.%]="sd.porcentaje"></div>
                </div>

                <div class="flex items-center justify-between text-[10px] font-bold text-muted-foreground font-mono pt-0.5">
                  <span>Listos: {{ sd.generados }}</span>
                  <span>Impresos: {{ sd.impresos }}</span>
                  <span>Devueltos: {{ sd.devueltos }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- PRÓXIMOS TURNOS DE EXAMEN EN SALA (HOY) -->
        <div class="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar-clock text-emerald-600"></i>
              <h3 class="text-sm font-black uppercase tracking-wider text-foreground">
                Turnos de Evaluación del 2do Parcial y Final (Hoy)
              </h3>
            </div>
            <a routerLink="/evaluaciones-dia" class="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              <span>Gestionar Turnos</span>
              <i class="pi pi-arrow-right text-[10px]"></i>
            </a>
          </div>

          <div class="space-y-3">
            @for (item of proximosTurnos(); track item.id) {
              <div class="border border-border/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 hover:bg-muted/20 transition-all">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded font-mono">
                      {{ item.codigo }}
                    </span>
                    <span class="text-xs font-black text-foreground">{{ item.materia }}</span>
                    <span class="text-[10px] bg-purple-100 text-purple-800 font-black px-2 py-0.2 rounded-full">
                      {{ item.grupo }}
                    </span>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    Docente: <strong class="text-foreground/80 uppercase">{{ item.docente }}</strong> · Sem. {{ item.semestre }}
                  </p>
                </div>

                <div class="flex items-center gap-3 self-end sm:self-center">
                  <div class="text-right">
                    <span class="font-mono text-xs font-black text-foreground bg-muted px-2.5 py-1 rounded-md block">
                      {{ item.hora }}
                    </span>
                    <span class="text-[9px] font-bold text-muted-foreground block mt-0.5">
                      {{ item.conCartilla ? 'OMR Óptico' : 'Manual' }}
                    </span>
                  </div>

                  <span [class]="getEstadoBadgeClass(item.etapa)" class="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-2xs">
                    {{ item.etapa }}
                  </span>

                  <a 
                    routerLink="/evaluaciones-dia" 
                    class="h-8 w-8 rounded-lg bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary flex items-center justify-center text-xs transition-colors"
                    title="Ver en Lista de Evaluaciones">
                    <i class="pi pi-arrow-up-right"></i>
                  </a>
                </div>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- 5. FEED DE ACTIVIDAD EN VIVO & POLÍTICAS DE SEGURIDAD -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- ACTIVIDAD RECIENTE / FEED DE AUDITORÍA EN TIEMPO REAL -->
        <div class="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <div class="flex items-center gap-2">
              <i class="pi pi-history text-primary"></i>
              <h3 class="text-sm font-black uppercase tracking-wider text-foreground">
                Bitácora de Actividad Operativa en Vivo
              </h3>
            </div>
            <span class="text-[10px] font-bold text-muted-foreground flex items-center gap-1 font-mono">
              <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              En Vivo
            </span>
          </div>

          <div class="space-y-3">
            @for (act of storage.bitacoraAuditoria().slice(0, 4); track act.id) {
              <div class="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/20 transition-colors flex items-start gap-3">
                <div class="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                  <i [class]="getModuloIcon(act.modulo)"></i>
                </div>

                <div class="flex-1 space-y-0.5">
                  <div class="flex flex-wrap items-center justify-between gap-1">
                    <span class="text-xs font-black text-foreground">{{ act.usuarioNombre }}</span>
                    <span class="text-[10px] font-mono text-muted-foreground">{{ act.fechaHora }}</span>
                  </div>
                  <p class="text-xs text-muted-foreground font-medium leading-snug">
                    {{ act.accion }}
                  </p>
                  <div class="flex items-center gap-3 text-[9.5px] font-mono text-muted-foreground pt-1">
                    <span>Módulo: <strong>{{ act.modulo }}</strong></span>
                    <span>·</span>
                    <span>IP: <strong>{{ act.ipPublica.split(' ')[0] }}</strong></span>
                    <span>·</span>
                    <span>MAC: <strong>{{ act.direccionMac }}</strong></span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ESTADO DEL MOTOR DE GENERACIÓN Y POLÍTICAS DE SEGURIDAD -->
        <div class="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-wider border-b border-border pb-3">
              <i class="pi pi-shield"></i>
              <span>Gobernanza y Políticas SEA</span>
            </div>

            <ul class="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li class="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-2.5">
                <i class="pi pi-lock text-emerald-600 text-sm mt-0.5 shrink-0"></i>
                <div>
                  <strong class="text-foreground block text-[11px]">Candado 72 Horas:</strong>
                  <span class="text-[11px]">Bloqueo estricto del Rol de Exámenes 72h antes de la prueba.</span>
                </div>
              </li>

              <li class="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-2.5">
                <i class="pi pi-key text-amber-600 text-sm mt-0.5 shrink-0"></i>
                <div>
                  <strong class="text-foreground block text-[11px]">3-Hour Answer Lock:</strong>
                  <span class="text-[11px]">Patrón oficial encriptado y retenido hasta +3h del inicio del examen.</span>
                </div>
              </li>

              <li class="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-2.5">
                <i class="pi pi-bolt text-purple-600 text-sm mt-0.5 shrink-0"></i>
                <div>
                  <strong class="text-foreground block text-[11px]">Motor de generación:</strong>
                  <span class="text-[11px]">Generación de fórmulas, matrices y cuadernillos a 38ms por variante.</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- Métricas de Infraestructura -->
          <div class="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-4 rounded-xl shadow-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-purple-200">Worker de generación #01</span>
              <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div class="flex items-baseline justify-between text-xs">
              <span class="text-white/80 font-medium">Latencia Promedio:</span>
              <span class="font-mono font-black text-amber-300">42 ms</span>
            </div>
            <div class="flex items-baseline justify-between text-xs">
              <span class="text-white/80 font-medium">Paginación Dúplex Impar:</span>
              <span class="font-mono font-black text-emerald-300">Activa (100%)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class DashboardComponent {
  public readonly storage = inject(EvaluacionesStorageService);

  public filtroSedeDashboard = '0';

  public totalExamenesFiltrados = computed(() => {
    return this.storage.gestionEvaluaciones().length;
  });

  public totalExamenesHoy = computed(() => {
    return this.storage.gestionEvaluaciones().filter(e => e.fecha === '08/06/2026' || e.fecha === '09/06/2026' || e.fecha === '10/06/2026').length;
  });

  public totalConCartillaHoy = computed(() => {
    return this.storage.gestionEvaluaciones().filter(e => e.conCartilla).length;
  });

  public totalSinCartillaHoy = computed(() => {
    return this.storage.gestionEvaluaciones().filter(e => !e.conCartilla).length;
  });

  public porcentajeTurnosHoy = computed(() => {
    const total = this.totalExamenesFiltrados();
    return total > 0 ? Math.round((this.totalExamenesHoy() / total) * 100) : 40;
  });

  public totalVariantesGeneradas = computed(() => {
    const generados = this.storage.gestionEvaluaciones().filter(e => e.etapa !== 'Programado').length;
    return generados * 4; // 4 variantes A-D por examen
  });

  public porcentajeGenerados = computed(() => {
    const total = this.totalExamenesFiltrados();
    const listos = this.storage.gestionEvaluaciones().filter(e => e.etapa !== 'Programado').length;
    return total > 0 ? Math.round((listos / total) * 100) : 60;
  });

  public totalReactivosBancos = computed(() => {
    return 1840;
  });

  public metricasEstados = computed<EstadoMetrica[]>(() => {
    const evals = this.storage.gestionEvaluaciones();
    const total = evals.length || 1;

    const etapas: { estado: EtapaEvaluacion; color: string; badge: string; icon: string }[] = [
      { estado: 'Programado', color: 'bg-purple-600', badge: 'bg-purple-100 text-purple-800 border border-purple-300', icon: 'pi pi-calendar' },
      { estado: 'Generado', color: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-800 border border-indigo-300', icon: 'pi pi-bolt' },
      { estado: 'Impreso', color: 'bg-blue-600', badge: 'bg-blue-100 text-blue-800 border border-blue-300', icon: 'pi pi-print' },
      { estado: 'Entregado', color: 'bg-amber-600', badge: 'bg-amber-100 text-amber-800 border border-amber-300', icon: 'pi pi-send' },
      { estado: 'Devuelto', color: 'bg-rose-600', badge: 'bg-rose-100 text-rose-800 border border-rose-300', icon: 'pi pi-replay' },
      { estado: 'Revisado', color: 'bg-teal-600', badge: 'bg-teal-100 text-teal-800 border border-teal-300', icon: 'pi pi-check' },
      { estado: 'Subido', color: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300', icon: 'pi pi-upload' },
      { estado: 'Recibido', color: 'bg-slate-600', badge: 'bg-slate-100 text-slate-800 border border-slate-300', icon: 'pi pi-inbox' }
    ];

    return etapas.map(et => {
      const count = evals.filter(e => e.etapa === et.estado).length;
      return {
        estado: et.estado,
        cantidad: count,
        porcentaje: Math.round((count / total) * 100),
        color: et.color,
        badgeClass: et.badge,
        icon: et.icon
      };
    });
  });

  public estadisticasSedes = computed<SedeMetrica[]>(() => {
    return [
      { id: 1, nombre: 'Campus Colonial', ciudad: 'Cochabamba', totalExamenes: 18, generados: 16, impresos: 14, devueltos: 8, porcentaje: 88, color: 'bg-purple-600' },
      { id: 2, nombre: 'Campus Juan Pablo II', ciudad: 'Cochabamba', totalExamenes: 12, generados: 10, impresos: 8, devueltos: 4, porcentaje: 75, color: 'bg-indigo-600' },
      { id: 3, nombre: 'Sede Central La Paz', ciudad: 'La Paz', totalExamenes: 10, generados: 8, impresos: 6, devueltos: 3, porcentaje: 70, color: 'bg-blue-600' },
      { id: 4, nombre: 'Sede Santa Cruz', ciudad: 'Santa Cruz', totalExamenes: 10, generados: 7, impresos: 5, devueltos: 2, porcentaje: 65, color: 'bg-amber-500' }
    ];
  });

  public proximosTurnos = computed<GestionEvaluacionItem[]>(() => {
    return this.storage.gestionEvaluaciones().slice(0, 5);
  });

  public getEstadoBadgeClass(etapa: EtapaEvaluacion): string {
    switch (etapa) {
      case 'Programado': return 'bg-purple-100 text-purple-800 border border-purple-300 font-bold';
      case 'Generado': return 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold';
      case 'Impreso': return 'bg-blue-100 text-blue-800 border border-blue-300 font-bold';
      case 'Entregado': return 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
      case 'Devuelto': return 'bg-rose-100 text-rose-800 border border-rose-300 font-bold';
      case 'Revisado': return 'bg-teal-100 text-teal-800 border border-teal-300 font-bold';
      case 'Subido': return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
      case 'Recibido': return 'bg-slate-100 text-slate-800 border border-slate-300 font-bold';
      default: return 'bg-slate-100 text-slate-800 font-bold';
    }
  }

  public getModuloIcon(modulo: string): string {
    switch (modulo) {
      case 'Generación Typst': return 'pi pi-bolt';
      case 'Banco de Preguntas': return 'pi pi-database';
      case 'Evaluaciones': return 'pi pi-calendar';
      case 'Autenticación': return 'pi pi-user';
      case 'Seguridad': return 'pi pi-shield';
      default: return 'pi pi-info-circle';
    }
  }
}
