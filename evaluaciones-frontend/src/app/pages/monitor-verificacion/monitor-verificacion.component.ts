import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { 
  ReportesService, 
  ReporteCalidadResumen, 
  ReporteCalidadItem,
  HistorialObservacionItem 
} from '../../core/services/reportes.service';
import { VerificacionHistorialDevolucion, VerificacionPregunta, VerificacionOpcion } from '../../core/services/verificacion-examen.service';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { AuthService } from '../../core/services/auth.service';
import { BranchOffice, Career } from '../../core/models/unitepc-gateway.models';
import { ConfiguracionEvaluacionesService } from '../../core/services/configuracion-evaluaciones.service';
import { MathContentDirective } from '../../shared/components/math-content.directive';

export interface BloqueHorarioGrupo {
  hora: string;
  total: number;
  verificados: number;
  pendientes: number;
  observados: number;
  sinBanco: number;
  items: ReporteCalidadItem[];
}

export interface BloqueFechaGrupo {
  fecha: string;
  fechaFormateada: string;
  esHoy: boolean;
  esManana: boolean;
  total: number;
  verificados: number;
  pendientes: number;
  observados: number;
  sinBanco: number;
  bloquesHorarios: BloqueHorarioGrupo[];
}

@Component({
  selector: 'sea-monitor-verificacion',
  standalone: true,
  imports: [CommonModule, FormsModule, MathContentDirective],
  template: `
    <div class="space-y-6 animate-fade-in pb-16">
      
      <!-- 1. ENCABEZADO PRINCIPAL -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
              <i class="pi pi-calendar-clock text-2xl"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
                  Monitor de Verificación de Exámenes
                </h1>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  EN VIVO
                </span>
              </div>
              <p class="text-xs text-muted-foreground font-medium mt-0.5">
                Seguimiento cronológico y auditoría en tiempo real del flujo de validación y verificación por fecha, turno y sede.
              </p>
            </div>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Switch Auto-refresco -->
          <button
            type="button"
            (click)="toggleAutoRefresco()"
            [class]="autoRefresco() ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 font-bold' : 'bg-card border-border text-muted-foreground font-medium'"
            class="text-xs px-3 py-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors shadow-2xs">
            <i class="pi" [class.pi-bolt]="autoRefresco()" [class.pi-power-off]="!autoRefresco()"></i>
            <span>{{ autoRefresco() ? 'Auto (60s)' : 'Auto-refresco' }}</span>
          </button>

          <!-- Botón Actualizar -->
          <button 
            type="button"
            (click)="cargarDatos(true)" 
            [disabled]="cargando()" 
            class="bg-card hover:bg-muted border border-border text-foreground font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50 transition-colors">
            <i class="pi" [class.pi-refresh]="!cargando()" [class.pi-spin]="cargando()" [class.pi-spinner]="cargando()"></i>
            <span>Actualizar</span>
          </button>

          <!-- Botón Exportar Excel -->
          <button 
            type="button"
            (click)="exportarExcel()"
            [disabled]="itemsFiltrados().length === 0"
            class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <i class="pi pi-file-excel"></i>
            <span>Exportar Sábana Excel</span>
          </button>
        </div>
      </div>

      <!-- 2. ALERTA DE EXÁMENES PRÓXIMOS SIN VERIFICAR -->
      @if (examenesUrgentesSinVerificar() > 0) {
        <div class="rounded-2xl border-2 border-rose-300 bg-rose-50/90 dark:border-rose-800 dark:bg-rose-950/30 p-4 flex items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <i class="pi pi-exclamation-triangle text-xl"></i>
            </div>
            <div>
              <h4 class="text-xs sm:text-sm font-black text-rose-950 dark:text-rose-200">
                ¡Atención Operativa! Hay {{ examenesUrgentesSinVerificar() }} examen(es) programado(s) para las próximas 48 horas sin verificación final.
              </h4>
              <p class="text-xs text-rose-800/90 dark:text-rose-300/80 mt-0.5">
                Exámenes en estado Programado u Observado que aún no pueden ser generados ni impresos para el turno correspondiente.
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="aplicarFiltroUrgentes()"
            class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shrink-0 cursor-pointer shadow-xs transition-colors">
            Ver urgentes
          </button>
        </div>
      }

      <!-- 3. BARRA DE FILTROS AVANZADA (SEDE, CARRERA, FECHAS, TURNO, ESTADO, PARCIAL) -->
      <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs space-y-3.5">
        
        <!-- Fila Superior de Filtros: Sede, Carrera, Tipo de Evaluación, Rango Fechas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <!-- Sede -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Sede / Campus</label>
            <select
              [(ngModel)]="filtroSede"
              (ngModelChange)="onSedeChange($event)"
              [disabled]="cargandoSedes() || (esDirectorCarrera() && sedes().length <= 1)"
              class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary disabled:opacity-60">
              <option value="Todos">Todas las Sedes (Nacional)</option>
              @for (sede of sedes(); track sede.code) {
                <option [value]="sede.code">{{ sede.name }} ({{ sede.code }})</option>
              }
            </select>
          </div>

          <!-- Carrera -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Carrera</label>
            <select
              [(ngModel)]="filtroCarrera"
              (ngModelChange)="onCarreraChange($event)"
              [disabled]="cargandoCarreras() || esDirectorCarrera()"
              class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary disabled:opacity-60">
              <option value="Todos">Todas las Carreras</option>
              @for (carrera of carreras(); track carrera.careerCode) {
                <option [value]="carrera.careerCode">{{ carrera.careerName }}</option>
              }
            </select>
          </div>

          <!-- Tipo Parcial / Evaluación -->
          <div>
            <label class="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Periodo / Tipo Parcial</label>
            <select
              [(ngModel)]="filtroTipoParcial"
              (ngModelChange)="cargarDatos(false)"
              class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary">
              <option value="Todos">Todos los Periodos</option>
              <option value="PRIMER_PARCIAL">1er Parcial</option>
              <option value="SEGUNDO_PARCIAL">2do Parcial</option>
              <option value="EXAMEN_FINAL">Examen Final</option>
              <option value="SEGUNDA_INSTANCIA">2da Instancia</option>
            </select>
          </div>

          <!-- Selector de Fechas Rango -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Fecha Desde</label>
              <input
                type="date"
                [(ngModel)]="filtroFechaDesde"
                (ngModelChange)="cargarDatos(false)"
                class="w-full bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-xs font-mono text-foreground outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Fecha Hasta</label>
              <input
                type="date"
                [(ngModel)]="filtroFechaHasta"
                (ngModelChange)="cargarDatos(false)"
                class="w-full bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-xs font-mono text-foreground outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        <!-- Fila Inferior: Atajos Rápidos de Fecha, Filtro por Estado y Buscador -->
        <div class="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3">
          
          <!-- Atajos de Fechas -->
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[10px] font-black uppercase text-muted-foreground mr-1">Rango rápido:</span>
            <button
              type="button"
              (click)="establecerRangoFecha('HOY')"
              [class]="rangoActivo === 'HOY' ? 'bg-primary text-primary-foreground font-black shadow-xs' : 'bg-muted hover:bg-muted/80 text-muted-foreground font-semibold'"
              class="px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors">
              Hoy
            </button>
            <button
              type="button"
              (click)="establecerRangoFecha('MANANA')"
              [class]="rangoActivo === 'MANANA' ? 'bg-primary text-primary-foreground font-black shadow-xs' : 'bg-muted hover:bg-muted/80 text-muted-foreground font-semibold'"
              class="px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors">
              Mañana
            </button>
            <button
              type="button"
              (click)="establecerRangoFecha('SEMANA')"
              [class]="rangoActivo === 'SEMANA' ? 'bg-primary text-primary-foreground font-black shadow-xs' : 'bg-muted hover:bg-muted/80 text-muted-foreground font-semibold'"
              class="px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors">
              Esta Semana
            </button>
            <button
              type="button"
              (click)="establecerRangoFecha('PROXIMOS_7_DIAS')"
              [class]="rangoActivo === 'PROXIMOS_7_DIAS' ? 'bg-primary text-primary-foreground font-black shadow-xs' : 'bg-muted hover:bg-muted/80 text-muted-foreground font-semibold'"
              class="px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors">
              Próx. 7 Días
            </button>
            <button
              type="button"
              (click)="establecerRangoFecha('TODOS')"
              [class]="rangoActivo === 'TODOS' ? 'bg-primary text-primary-foreground font-black shadow-xs' : 'bg-muted hover:bg-muted/80 text-muted-foreground font-semibold'"
              class="px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors">
              Todos los Exámenes
            </button>
          </div>

          <!-- Selector de Modo de Vista y Buscador -->
          <div class="flex items-center gap-2">
            <!-- Selector de Vista -->
            <div class="inline-flex rounded-xl bg-muted p-1 border border-border text-xs">
              <button
                type="button"
                (click)="vistaModo.set('CRONOGRAMA')"
                [class]="vistaModo() === 'CRONOGRAMA' ? 'bg-card text-foreground font-black shadow-2xs' : 'text-muted-foreground hover:text-foreground font-semibold'"
                class="px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all">
                <i class="pi pi-calendar"></i>
                <span class="hidden sm:inline">Cronograma</span>
              </button>
              <button
                type="button"
                (click)="vistaModo.set('TABLA')"
                [class]="vistaModo() === 'TABLA' ? 'bg-card text-foreground font-black shadow-2xs' : 'text-muted-foreground hover:text-foreground font-semibold'"
                class="px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all">
                <i class="pi pi-table"></i>
                <span class="hidden sm:inline">Sábana</span>
              </button>
            </div>

            <!-- Buscador en Vivo -->
            <div class="relative">
              <i class="pi pi-search absolute left-3 top-2.5 text-muted-foreground text-xs"></i>
              <input
                type="text"
                [(ngModel)]="busquedaTexto"
                placeholder="Buscar materia, código, docente, grupo, aula..."
                class="bg-muted border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none w-52 sm:w-64 focus:border-primary text-foreground" />
              @if (busquedaTexto) {
                <button 
                  type="button" 
                  (click)="busquedaTexto = ''" 
                  class="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer">
                  <i class="pi pi-times text-[10px]"></i>
                </button>
              }
            </div>
          </div>
        </div>

      </div>

      <!-- 4. TARJETAS DE KPIS EN TIEMPO REAL -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        <!-- Total Exámenes en Alcance -->
        <div 
          (click)="filtrarPorEstado('TODOS')"
          [class.ring-2]="filtroEstado === 'TODOS'"
          class="bg-card border border-border rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-primary/50 transition-all ring-primary">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Total en Rango</span>
            <i class="pi pi-file text-muted-foreground text-xs"></i>
          </div>
          <strong class="block text-2xl font-black text-foreground mt-1">{{ kpis().total }}</strong>
          <span class="text-[11px] text-muted-foreground">exámenes calendarizados</span>
        </div>

        <!-- Verificados / Validados (Listos) -->
        <div 
          (click)="filtrarPorEstado('VERIFICADOS')"
          [class.ring-2]="filtroEstado === 'VERIFICADOS'"
          class="bg-card border border-emerald-200/70 dark:border-emerald-800/40 bg-emerald-50/20 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-emerald-500 transition-all ring-emerald-500">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-black">Verificados / Listos</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {{ kpis().porcentajeVerificados }}%
            </span>
          </div>
          <strong class="block text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{{ kpis().verificados }}</strong>
          <span class="text-[11px] text-muted-foreground">aprobados para imprimir</span>
        </div>

        <!-- En Cola de Verificación -->
        <div 
          (click)="filtrarPorEstado('PENDIENTES')"
          [class.ring-2]="filtroEstado === 'PENDIENTES'"
          class="bg-card border border-blue-200/70 dark:border-blue-800/40 bg-blue-50/20 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-blue-500 transition-all ring-blue-500">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase tracking-wider text-blue-700 dark:text-blue-400 font-black">En Cola Verificación</span>
            <i class="pi pi-clock text-blue-600 text-xs"></i>
          </div>
          <strong class="block text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{{ kpis().pendientes }}</strong>
          <span class="text-[11px] text-muted-foreground">banco subido, sin revisar</span>
        </div>

        <!-- Observados con Motivo -->
        <div 
          (click)="filtrarPorEstado('OBSERVADOS')"
          [class.ring-2]="filtroEstado === 'OBSERVADOS'"
          class="bg-card border border-amber-200/70 dark:border-amber-800/40 bg-amber-50/20 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-amber-500 transition-all ring-amber-500">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-black">Observados</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Devueltos
            </span>
          </div>
          <strong class="block text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{{ kpis().observados }}</strong>
          <span class="text-[11px] text-muted-foreground">esperando corrección</span>
        </div>

        <!-- Sin Banco Cargado -->
        <div 
          (click)="filtrarPorEstado('SIN_BANCO')"
          [class.ring-2]="filtroEstado === 'SIN_BANCO'"
          class="bg-card border border-rose-200/70 dark:border-rose-800/40 bg-rose-50/20 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-rose-500 transition-all ring-rose-500 col-span-2 sm:col-span-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-black">Sin Banco (Programados)</span>
            <i class="pi pi-exclamation-circle text-rose-600 text-xs"></i>
          </div>
          <strong class="block text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{{ kpis().sinBanco }}</strong>
          <span class="text-[11px] text-muted-foreground">docente no cargó reactivos</span>
        </div>

      </div>

      <!-- 5. CONTENIDO SEGÚN MODO DE VISTA (CRONOGRAMA O TABLA) -->
      @if (cargando()) {
        <div class="bg-card border border-border rounded-2xl p-16 text-center shadow-2xs">
          <i class="pi pi-spinner pi-spin text-3xl text-primary block mb-3"></i>
          <p class="text-sm font-bold text-foreground">Sincronizando estado de exámenes en tiempo real...</p>
          <span class="text-xs text-muted-foreground">Consultando roles de exámenes y verificaciones por sede</span>
        </div>
      } @else if (error()) {
        <div class="rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 p-6 text-sm flex items-center gap-3">
          <i class="pi pi-exclamation-triangle text-xl"></i>
          <div>
            <p class="font-black">Error al consultar el monitor</p>
            <p class="text-xs mt-0.5">{{ error() }}</p>
          </div>
        </div>
      } @else if (itemsFiltrados().length === 0) {
        <div class="bg-card border border-border rounded-2xl p-16 text-center shadow-2xs space-y-2">
          <div class="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
            <i class="pi pi-search text-xl"></i>
          </div>
          <h3 class="text-sm font-black text-foreground">No se encontraron exámenes para el criterio seleccionado</h3>
          <p class="text-xs text-muted-foreground max-w-md mx-auto">
            Prueba cambiando el rango de fechas, seleccionando otra sede o limpiando el texto del buscador.
          </p>
          <button
            type="button"
            (click)="limpiarFiltros()"
            class="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black cursor-pointer shadow-xs">
            Restablecer filtros
          </button>
        </div>
      } @else {

        <!-- ================================================================= -->
        <!-- MODO 1: VISTA CRONOGRAMA POR FECHA Y FRANJA HORARIA               -->
        <!-- ================================================================= -->
        @if (vistaModo() === 'CRONOGRAMA') {
          <div class="space-y-6">
            @for (grupoFecha of gruposPorFecha(); track grupoFecha.fecha) {
              <div class="bg-card border border-border rounded-3xl overflow-hidden shadow-2xs transition-all">
                
                <!-- Encabezado de la Fecha -->
                <div class="p-4 sm:p-5 border-b border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div 
                      [class]="grupoFecha.esHoy ? 'bg-indigo-600 text-white' : (grupoFecha.esManana ? 'bg-amber-600 text-white' : 'bg-card text-foreground border border-border')"
                      class="h-11 w-11 rounded-2xl flex flex-col items-center justify-center font-mono shrink-0 shadow-2xs">
                      <span class="text-[9px] uppercase font-bold tracking-tight">{{ grupoFecha.fecha | date:'MMM' }}</span>
                      <strong class="text-sm font-black leading-none">{{ grupoFecha.fecha | date:'dd' }}</strong>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-sm sm:text-base font-black text-foreground capitalize">
                          {{ grupoFecha.fechaFormateada }}
                        </h3>
                        @if (grupoFecha.esHoy) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                            HOY
                          </span>
                        } @else if (grupoFecha.esManana) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                            MAÑANA
                          </span>
                        }
                      </div>
                      <p class="text-xs text-muted-foreground mt-0.5">
                        {{ grupoFecha.total }} examen(es) programado(s) en este día
                      </p>
                    </div>
                  </div>

                  <!-- Resumen Semafórico del Día -->
                  <div class="flex items-center gap-2 text-xs font-mono font-bold">
                    <span class="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1.5" title="Verificados">
                      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>{{ grupoFecha.verificados }} Listos</span>
                    </span>
                    @if (grupoFecha.pendientes > 0) {
                      <span class="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 flex items-center gap-1.5" title="En Cola">
                        <span class="h-2 w-2 rounded-full bg-blue-500"></span>
                        <span>{{ grupoFecha.pendientes }} En cola</span>
                      </span>
                    }
                    @if (grupoFecha.observados > 0) {
                      <span class="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1.5" title="Observados">
                        <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                        <span>{{ grupoFecha.observados }} Observados</span>
                      </span>
                    }
                    @if (grupoFecha.sinBanco > 0) {
                      <span class="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 flex items-center gap-1.5" title="Sin Banco">
                        <span class="h-2 w-2 rounded-full bg-rose-500"></span>
                        <span>{{ grupoFecha.sinBanco }} Sin Banco</span>
                      </span>
                    }
                  </div>
                </div>

                <!-- Bloques por Turno / Horario -->
                <div class="p-4 sm:p-5 space-y-6">
                  @for (bloque of grupoFecha.bloquesHorarios; track bloque.hora) {
                    <div class="space-y-3">
                      
                      <!-- Header del Turno -->
                      <div class="flex items-center justify-between border-b border-border/60 pb-2">
                        <div class="flex items-center gap-2">
                          <span class="h-7 px-3 rounded-lg bg-primary/10 text-primary font-mono font-black text-xs inline-flex items-center gap-1.5">
                            <i class="pi pi-clock text-[11px]"></i>
                            {{ bloque.hora || 'Horario a confirmar' }}
                          </span>
                          <span class="text-xs text-muted-foreground font-semibold">
                            ({{ bloque.total }} {{ bloque.total === 1 ? 'examen' : 'exámenes' }})
                          </span>
                        </div>

                        <!-- Indicador de Alerta si faltan verificar -->
                        @if (bloque.pendientes > 0 || bloque.observados > 0 || bloque.sinBanco > 0) {
                          <span class="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <i class="pi pi-exclamation-circle text-xs"></i>
                            {{ (bloque.pendientes + bloque.observados + bloque.sinBanco) }} pendiente(s) de verificar
                          </span>
                        } @else {
                          <span class="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <i class="pi pi-check-circle text-xs"></i>
                            Turno 100% verificado
                          </span>
                        }
                      </div>

                      <!-- Grid de Tarjetas de Exámenes del Turno -->
                      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                        @for (item of bloque.items; track item.rolExamenId) {
                          <div 
                            [class]="obtenerBordeCard(item.estadoCalidad)"
                            class="bg-card border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between">
                            
                            <!-- Materia y Badges -->
                            <div class="space-y-2">
                              <div class="flex items-start justify-between gap-2">
                                <div>
                                  <span class="font-mono text-primary font-black text-xs tracking-tight">{{ item.materiaCodigo }}</span>
                                  <h4 class="font-black text-sm text-foreground leading-snug line-clamp-2">
                                    {{ item.materiaNombre }}
                                  </h4>
                                </div>
                                <span [class]="obtenerClaseDictamen(item.estadoCalidad)" class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase shrink-0 border">
                                  {{ obtenerEtiquetaDictamen(item.estadoCalidad) }}
                                </span>
                              </div>

                              <!-- Sede, Carrera, Semestre, Grupo y Aula -->
                              <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                                <span class="bg-muted px-2 py-0.5 rounded-md font-bold text-foreground">
                                  {{ item.sedeNombre }}
                                </span>
                                <span class="bg-muted px-2 py-0.5 rounded-md font-semibold">
                                  {{ item.carreraNombre }}
                                </span>
                                <span class="bg-muted px-2 py-0.5 rounded-md font-mono">
                                  G-{{ item.grupo }}
                                </span>
                                @if (item.semestre) {
                                  <span class="bg-muted px-2 py-0.5 rounded-md font-mono">
                                    Sem. {{ item.semestre }}
                                  </span>
                                }
                                @if (item.aula) {
                                  <span class="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md font-mono font-bold">
                                    Aula {{ item.aula }}
                                  </span>
                                }
                              </div>

                              <!-- Docente Titular -->
                              <div class="text-xs text-muted-foreground pt-1 border-t border-border/50">
                                <span class="text-[10px] uppercase font-bold text-muted-foreground block">Docente Titular:</span>
                                <span class="font-bold text-foreground uppercase truncate block">{{ item.docenteNombre || 'Sin asignar' }}</span>
                                @if (item.docenteCi) {
                                  <span class="text-[10px] font-mono text-muted-foreground">CI: {{ item.docenteCi }}</span>
                                }
                              </div>
                            </div>

                            <!-- Footer de la Tarjeta: Verificador o Motivo de Observación -->
                            <div class="pt-2 border-t border-border flex items-center justify-between gap-2 text-[11px]">
                              @if (item.estadoCalidad === 'APROBADO_DIRECTO' || item.estadoCalidad === 'OBSERVADO_Y_APROBADO') {
                                <div class="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 truncate">
                                  <i class="pi pi-check-circle text-xs shrink-0"></i>
                                  <span class="truncate">Por: {{ item.aprobadoPor || item.ultimoVerificador || 'Verificado' }}</span>
                                </div>
                                @if (item.fechaAprobacion) {
                                  <span class="text-[10px] font-mono text-muted-foreground shrink-0">
                                    {{ item.fechaAprobacion | date:'dd/MM HH:mm' }}
                                  </span>
                                }
                              } @else if (item.estadoCalidad === 'OBSERVADO_PENDIENTE') {
                                <div class="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 truncate">
                                  <i class="pi pi-exclamation-triangle text-xs shrink-0"></i>
                                  <span>{{ item.totalObservaciones }} obs. pendientes</span>
                                </div>
                                <button
                                  type="button"
                                  (click)="abrirModalObservaciones(item)"
                                  class="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer transition-colors shadow-2xs">
                                  Ver motivo
                                </button>
                              } @else if (item.estadoCalidad === 'PENDIENTE_REVISION') {
                                <div class="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1.5">
                                  <i class="pi pi-clock text-xs shrink-0"></i>
                                  <span>En cola de verificación</span>
                                </div>
                              } @else {
                                <div class="text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1.5">
                                  <i class="pi pi-times-circle text-xs shrink-0"></i>
                                  <span>Docente no cargó banco</span>
                                </div>
                              }
                            </div>

                          </div>
                        }
                      </div>

                    </div>
                  }
                </div>

              </div>
            }
          </div>
        }

        <!-- ================================================================= -->
        <!-- MODO 2: VISTA TABLA / SÁBANA DETALLADA AUDITABLE                   -->
        <!-- ================================================================= -->
        @if (vistaModo() === 'TABLA') {
          <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
            <div class="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 class="text-sm font-black text-foreground">Sábana Completa de Exámenes en Rango</h3>
                <p class="text-xs text-muted-foreground mt-0.5">Listado detallado ordenable cronológicamente para conciliación operativa.</p>
              </div>
              <span class="text-xs font-mono font-bold text-muted-foreground">
                {{ itemsFiltrados().length }} registros
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <th class="p-3">Fecha / Hora</th>
                    <th class="p-3">Aula / Sede</th>
                    <th class="p-3">Materia / Carrera</th>
                    <th class="p-3">Docente Titular</th>
                    <th class="p-3 text-center">Estado Verificación</th>
                    <th class="p-3 text-center">Verificador / Aprobador</th>
                    <th class="p-3 text-center">Observaciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  @for (item of itemsFiltrados(); track item.rolExamenId) {
                    <tr class="hover:bg-muted/30 transition-colors">
                      <td class="p-3 whitespace-nowrap">
                        <span class="font-mono font-black text-foreground block">{{ item.fechaExamen }}</span>
                        <span class="text-[10px] font-mono text-primary font-bold">{{ item.horaExamen || 'Sin hora' }}</span>
                      </td>
                      <td class="p-3">
                        <div class="font-bold text-foreground">{{ item.sedeNombre }}</div>
                        <span class="text-[10px] text-muted-foreground font-mono">Aula: {{ item.aula || 'N/A' }}</span>
                      </td>
                      <td class="p-3">
                        <span class="font-mono text-primary font-black">{{ item.materiaCodigo }} (G-{{ item.grupo }})</span>
                        <div class="font-bold text-foreground leading-tight">{{ item.materiaNombre }}</div>
                        <span class="text-[10px] text-muted-foreground">{{ item.carreraNombre }}</span>
                      </td>
                      <td class="p-3">
                        <div class="font-bold text-foreground uppercase">{{ item.docenteNombre || 'Por asignar' }}</div>
                        <span class="text-[10px] text-muted-foreground font-mono">{{ item.docenteCi ? 'CI: ' + item.docenteCi : 'Sin CI' }}</span>
                      </td>
                      <td class="p-3 text-center">
                        <span [class]="obtenerClaseDictamen(item.estadoCalidad)" class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 border">
                          {{ obtenerEtiquetaDictamen(item.estadoCalidad) }}
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        @if (item.aprobadoPor) {
                          <div class="font-bold text-foreground truncate max-w-36">{{ item.aprobadoPor }}</div>
                          <span class="text-[9.5px] text-muted-foreground font-mono block">{{ item.fechaAprobacion | date:'dd/MM/yyyy HH:mm' }}</span>
                        } @else if (item.ultimoVerificador) {
                          <div class="font-medium text-foreground truncate max-w-36">{{ item.ultimoVerificador }}</div>
                          <span class="text-[9.5px] text-muted-foreground font-mono block">{{ item.ultimaObservacionFecha | date:'dd/MM/yyyy HH:mm' }}</span>
                        } @else {
                          <span class="text-muted-foreground text-[10px] font-mono">Pendiente</span>
                        }
                      </td>
                      <td class="p-3 text-center">
                        @if (item.totalObservaciones > 0) {
                          <button
                            type="button"
                            (click)="abrirModalObservaciones(item)"
                            class="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
                            <i class="pi pi-comments text-[10px]"></i>
                            <span>{{ item.totalObservaciones }} obs.</span>
                          </button>
                        } @else {
                          <span class="text-muted-foreground text-[10px] font-mono">0</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

      }

      <!-- 6. MODAL DETALLADO DE OBSERVACIONES Y TIMELINE -->
      @if (itemSeleccionado(); as item) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            
            <!-- Header Modal -->
            <div class="p-4 sm:p-5 border-b border-border bg-amber-50/60 dark:bg-amber-950/20 flex items-start justify-between gap-3 shrink-0">
              <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shrink-0">
                  <i class="pi pi-comments text-lg"></i>
                </span>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono font-black text-xs">{{ item.materiaCodigo }}</span>
                    <h3 class="text-sm font-black text-foreground">{{ item.materiaNombre }} (G-{{ item.grupo }})</h3>
                  </div>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Docente: <strong class="text-foreground">{{ item.docenteNombre }}</strong> · {{ item.sedeNombre }} · {{ item.carreraNombre }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Cerrar modal"
                (click)="cerrarModalObservaciones()"
                class="text-muted-foreground hover:text-foreground cursor-pointer p-1">
                <i class="pi pi-times text-lg"></i>
              </button>
            </div>

            <!-- Cuerpo Modal: Historial de Devoluciones y Observaciones -->
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              @if (cargandoHistorial()) {
                <div class="py-12 text-center text-sm text-muted-foreground">
                  <i class="pi pi-spinner pi-spin text-2xl text-primary block mb-2"></i>
                  Cargando observaciones detalladas...
                </div>
              } @else if (historialDevoluciones().length > 0) {
                <div class="space-y-4">
                  @for (dev of historialDevoluciones(); track dev.id || $index; let idx = $index) {
                    <div class="rounded-2xl border border-amber-300 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20 p-4 space-y-3">
                      <div class="flex items-center justify-between text-xs font-bold text-amber-950 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800/60 pb-2">
                        <span class="uppercase tracking-wide">Devolución #{{ historialDevoluciones().length - idx }}</span>
                        <div class="flex items-center gap-2 text-muted-foreground font-mono">
                          <span>{{ dev.fechaDevolucion | date:'dd/MM/yyyy HH:mm' }}</span>
                          <span>·</span>
                          <span>Por: {{ dev.verificadoPor || 'Verificador' }}</span>
                        </div>
                      </div>

                      @if (dev.observacionesGenerales) {
                        <div>
                          <span class="text-[10px] uppercase font-black text-amber-900 dark:text-amber-300 block mb-0.5">Observación General:</span>
                          <p class="text-xs text-foreground bg-card/80 p-3 rounded-xl border border-border whitespace-pre-wrap leading-relaxed">
                            {{ dev.observacionesGenerales }}
                          </p>
                        </div>
                      }

                      @if (dev.preguntasObservadas && dev.preguntasObservadas.length > 0) {
                        <div>
                          <span class="text-[10px] uppercase font-black text-amber-900 dark:text-amber-300 block mb-1">
                            Preguntas observadas ({{ dev.preguntasObservadas.length }}):
                          </span>
                          <div class="space-y-2">
                            @for (preg of dev.preguntasObservadas; track preg.numeroPregunta) {
                              <div class="p-3 rounded-xl bg-card border border-border text-xs space-y-1">
                                <div class="flex items-center justify-between">
                                  <strong class="text-primary font-mono font-bold">Pregunta {{ preg.numeroPregunta }}</strong>
                                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-muted">{{ preg.preguntaEnviada?.nivelDificultad || 'Dificultad' }}</span>
                                </div>
                                @if (preg.preguntaEnviada?.enunciado) {
                                  <div [seaMathContent]="preg.preguntaEnviada?.enunciado || ''" class="text-muted-foreground italic"></div>
                                }
                                <div class="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2 rounded-lg text-rose-900 dark:text-rose-200 mt-1 font-medium">
                                  <strong>Motivo:</strong> {{ preg.observacion }}
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="p-8 text-center text-sm text-muted-foreground">
                  No hay detalles de devolución registrados para este examen.
                </div>
              }
            </div>

            <!-- Footer Modal -->
            <div class="p-4 border-t border-border bg-muted/30 flex justify-end">
              <button
                type="button"
                (click)="cerrarModalObservaciones()"
                class="px-4 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-black cursor-pointer shadow-2xs">
                Cerrar
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class MonitorVerificacionComponent implements OnInit, OnDestroy {
  private readonly _reportesService = inject(ReportesService);
  private readonly _gateway = inject(UnitepcGatewayService);
  private readonly _auth = inject(AuthService);
  private readonly _configService = inject(ConfiguracionEvaluacionesService);

  // Estados reactivos principales
  public cargando = signal<boolean>(false);
  public error = signal<string | null>(null);
  public todosLosItems = signal<ReporteCalidadItem[]>([]);
  public resumenBackend = signal<ReporteCalidadResumen | null>(null);

  // Modo de vista: 'CRONOGRAMA' | 'TABLA'
  public vistaModo = signal<'CRONOGRAMA' | 'TABLA'>('CRONOGRAMA');

  // Filtros
  public sedes = signal<BranchOffice[]>([]);
  public carreras = signal<Career[]>([]);
  public cargandoSedes = signal<boolean>(false);
  public cargandoCarreras = signal<boolean>(false);

  public filtroSede = 'Todos';
  public filtroCarrera = 'Todos';
  public filtroTipoParcial = 'Todos';
  public filtroFechaDesde = '';
  public filtroFechaHasta = '';
  public filtroEstado = 'TODOS'; // 'TODOS' | 'VERIFICADOS' | 'PENDIENTES' | 'OBSERVADOS' | 'SIN_BANCO'
  public busquedaTexto = '';
  public rangoActivo = 'SEMANA';

  // Auto-refresco
  public autoRefresco = signal<boolean>(false);
  private _intervalId: any = null;

  // Modal de observaciones
  public itemSeleccionado = signal<ReporteCalidadItem | null>(null);
  public historialDevoluciones = signal<VerificacionHistorialDevolucion[]>([]);
  public cargandoHistorial = signal<boolean>(false);

  // Permisos según rol
  public esDirectorCarrera = computed(() => this._auth.usuario()?.rol === 'DIRECTOR_CARRERA');
  public esVicerrector = computed(() => this._auth.usuario()?.rol === 'VICERRECTOR');
  public esConsultaAcademica = computed(() => this.esDirectorCarrera() || this.esVicerrector());

  public ngOnInit(): void {
    this.inicializarRangoSemana();
    this.cargarSedes();
  }

  public ngOnDestroy(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }

  public toggleAutoRefresco(): void {
    const nuevo = !this.autoRefresco();
    this.autoRefresco.set(nuevo);
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    if (nuevo) {
      this._intervalId = setInterval(() => {
        this.cargarDatos(false);
      }, 60000); // Cada 60 segundos
    }
  }

  private inicializarRangoSemana(): void {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0: Dom, 1: Lun...
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    this.filtroFechaDesde = inicio.toISOString().slice(0, 10);
    this.filtroFechaHasta = fin.toISOString().slice(0, 10);
    this.rangoActivo = 'SEMANA';
  }

  public establecerRangoFecha(tipo: 'HOY' | 'MANANA' | 'SEMANA' | 'PROXIMOS_7_DIAS' | 'TODOS'): void {
    this.rangoActivo = tipo;
    const hoy = new Date();

    if (tipo === 'HOY') {
      const hoyStr = hoy.toISOString().slice(0, 10);
      this.filtroFechaDesde = hoyStr;
      this.filtroFechaHasta = hoyStr;
    } else if (tipo === 'MANANA') {
      const manana = new Date(hoy);
      manana.setDate(hoy.getDate() + 1);
      const mananaStr = manana.toISOString().slice(0, 10);
      this.filtroFechaDesde = mananaStr;
      this.filtroFechaHasta = mananaStr;
    } else if (tipo === 'SEMANA') {
      this.inicializarRangoSemana();
    } else if (tipo === 'PROXIMOS_7_DIAS') {
      const hoyStr = hoy.toISOString().slice(0, 10);
      const fin = new Date(hoy);
      fin.setDate(hoy.getDate() + 7);
      this.filtroFechaDesde = hoyStr;
      this.filtroFechaHasta = fin.toISOString().slice(0, 10);
    } else if (tipo === 'TODOS') {
      this.filtroFechaDesde = '';
      this.filtroFechaHasta = '';
    }

    this.cargarDatos(false);
  }

  public aplicarFiltroUrgentes(): void {
    this.establecerRangoFecha('PROXIMOS_7_DIAS');
    this.filtroEstado = 'TODOS';
  }

  public limpiarFiltros(): void {
    this.filtroSede = 'Todos';
    this.filtroCarrera = 'Todos';
    this.filtroTipoParcial = 'Todos';
    this.filtroEstado = 'TODOS';
    this.busquedaTexto = '';
    this.inicializarRangoSemana();
    this.cargarDatos(false);
  }

  public cargarDatos(manual: boolean = false): void {
    if (manual) {
      this.cargando.set(true);
    }
    this.error.set(null);

    this._reportesService.obtenerMonitorVerificacion({
      sedeCodigo: this.filtroSede,
      carreraCodigo: this.filtroCarrera,
      tipoParcial: this.filtroTipoParcial,
      fechaDesde: this.filtroFechaDesde || undefined,
      fechaHasta: this.filtroFechaHasta || undefined,
      estadoCalidad: 'TODOS',
      busqueda: undefined
    }).subscribe({
      next: (res) => {
        this.resumenBackend.set(res);
        this.todosLosItems.set(res.items || []);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'No se pudo cargar la información del monitor de verificación.');
        this.cargando.set(false);
      }
    });
  }

  public filtrarPorEstado(estado: 'TODOS' | 'VERIFICADOS' | 'PENDIENTES' | 'OBSERVADOS' | 'SIN_BANCO'): void {
    this.filtroEstado = estado;
  }

  // Filtrado reactivo en cliente (por estado seleccionado y búsqueda)
  public itemsFiltrados = computed(() => {
    let items = this.todosLosItems();

    // Filtro por Estado
    if (this.filtroEstado === 'VERIFICADOS') {
      items = items.filter(i => i.estadoCalidad === 'APROBADO_DIRECTO' || i.estadoCalidad === 'OBSERVADO_Y_APROBADO');
    } else if (this.filtroEstado === 'PENDIENTES') {
      items = items.filter(i => i.estadoCalidad === 'PENDIENTE_REVISION');
    } else if (this.filtroEstado === 'OBSERVADOS') {
      items = items.filter(i => i.estadoCalidad === 'OBSERVADO_PENDIENTE');
    } else if (this.filtroEstado === 'SIN_BANCO') {
      items = items.filter(i => i.estadoCalidad === 'SIN_BANCO');
    }

    // Buscador en vivo
    const texto = this.busquedaTexto.trim().toLowerCase();
    if (texto) {
      items = items.filter(i => {
        const str = `${i.materiaCodigo} ${i.materiaNombre} ${i.docenteNombre} ${i.docenteCi} ${i.grupo} ${i.aula} ${i.carreraNombre} ${i.sedeNombre}`.toLowerCase();
        return str.includes(texto);
      });
    }

    return items;
  });

  // KPIs en tiempo real
  public kpis = computed(() => {
    const items = this.todosLosItems();
    const total = items.length;
    const verificados = items.filter(i => i.estadoCalidad === 'APROBADO_DIRECTO' || i.estadoCalidad === 'OBSERVADO_Y_APROBADO').length;
    const pendientes = items.filter(i => i.estadoCalidad === 'PENDIENTE_REVISION').length;
    const observados = items.filter(i => i.estadoCalidad === 'OBSERVADO_PENDIENTE').length;
    const sinBanco = items.filter(i => i.estadoCalidad === 'SIN_BANCO').length;

    const porcentajeVerificados = total > 0 ? Math.round((verificados * 1000) / total) / 10 : 0;

    return { total, verificados, pendientes, observados, sinBanco, porcentajeVerificados };
  });

  // Alerta de próximos sin verificar (en las próximas 48 horas)
  public examenesUrgentesSinVerificar = computed(() => {
    const hoy = new Date();
    const limite = new Date(hoy);
    limite.setDate(hoy.getDate() + 2);
    const hoyStr = hoy.toISOString().slice(0, 10);
    const limiteStr = limite.toISOString().slice(0, 10);

    return this.todosLosItems().filter(i => {
      if (!i.fechaExamen) return false;
      const enRango = i.fechaExamen >= hoyStr && i.fechaExamen <= limiteStr;
      const sinVerificar = i.estadoCalidad === 'PENDIENTE_REVISION' || i.estadoCalidad === 'OBSERVADO_PENDIENTE' || i.estadoCalidad === 'SIN_BANCO';
      return enRango && sinVerificar;
    }).length;
  });

  // Agrupación por Fecha y luego por Franja Horaria para la vista Cronograma
  public gruposPorFecha = computed<BloqueFechaGrupo[]>(() => {
    const items = this.itemsFiltrados();
    const mapaFechas = new Map<string, ReporteCalidadItem[]>();

    const hoyStr = new Date().toISOString().slice(0, 10);
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const mananaStr = manana.toISOString().slice(0, 10);

    for (const item of items) {
      const f = item.fechaExamen || 'Sin Fecha Definida';
      if (!mapaFechas.has(f)) {
        mapaFechas.set(f, []);
      }
      mapaFechas.get(f)!.push(item);
    }

    const fechasOrdenadas = Array.from(mapaFechas.keys()).sort();
    const resultado: BloqueFechaGrupo[] = [];

    for (const fecha of fechasOrdenadas) {
      const itemsFecha = mapaFechas.get(fecha)!;
      
      // Agrupar por horario dentro de la fecha
      const mapaHorarios = new Map<string, ReporteCalidadItem[]>();
      for (const item of itemsFecha) {
        const h = item.horaExamen || 'Horario a confirmar';
        if (!mapaHorarios.has(h)) {
          mapaHorarios.set(h, []);
        }
        mapaHorarios.get(h)!.push(item);
      }

      const horariosOrdenados = Array.from(mapaHorarios.keys()).sort();
      const bloquesHorarios: BloqueHorarioGrupo[] = [];

      for (const hora of horariosOrdenados) {
        const itemsHora = mapaHorarios.get(hora)!;
        const verificados = itemsHora.filter(i => i.estadoCalidad === 'APROBADO_DIRECTO' || i.estadoCalidad === 'OBSERVADO_Y_APROBADO').length;
        const pendientes = itemsHora.filter(i => i.estadoCalidad === 'PENDIENTE_REVISION').length;
        const observados = itemsHora.filter(i => i.estadoCalidad === 'OBSERVADO_PENDIENTE').length;
        const sinBanco = itemsHora.filter(i => i.estadoCalidad === 'SIN_BANCO').length;

        bloquesHorarios.push({
          hora,
          total: itemsHora.length,
          verificados,
          pendientes,
          observados,
          sinBanco,
          items: itemsHora
        });
      }

      // Formatear fecha amigable
      let fechaFormateada = fecha;
      if (fecha !== 'Sin Fecha Definida') {
        const partes = fecha.split('-');
        if (partes.length === 3) {
          const d = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
          fechaFormateada = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
      }

      resultado.push({
        fecha,
        fechaFormateada,
        esHoy: fecha === hoyStr,
        esManana: fecha === mananaStr,
        total: itemsFecha.length,
        verificados: itemsFecha.filter(i => i.estadoCalidad === 'APROBADO_DIRECTO' || i.estadoCalidad === 'OBSERVADO_Y_APROBADO').length,
        pendientes: itemsFecha.filter(i => i.estadoCalidad === 'PENDIENTE_REVISION').length,
        observados: itemsFecha.filter(i => i.estadoCalidad === 'OBSERVADO_PENDIENTE').length,
        sinBanco: itemsFecha.filter(i => i.estadoCalidad === 'SIN_BANCO').length,
        bloquesHorarios
      });
    }

    return resultado;
  });

  // Modal de Observaciones
  public abrirModalObservaciones(item: ReporteCalidadItem): void {
    this.itemSeleccionado.set(item);
    this.cargandoHistorial.set(true);
    this.historialDevoluciones.set([]);

    this._reportesService.obtenerHistorialDevoluciones(item.rolExamenId).subscribe({
      next: (devoluciones) => {
        this.historialDevoluciones.set(devoluciones || []);
        this.cargandoHistorial.set(false);
      },
      error: () => {
        this.cargandoHistorial.set(false);
      }
    });
  }

  public cerrarModalObservaciones(): void {
    this.itemSeleccionado.set(null);
    this.historialDevoluciones.set([]);
  }

  // Exportar Excel
  public exportarExcel(): void {
    const items = this.itemsFiltrados();
    if (!items.length) return;

    const filas = items.map(item => {
      let estadoTexto = this.obtenerEtiquetaDictamen(item.estadoCalidad);
      return {
        'Fecha Examen': item.fechaExamen,
        'Horario': item.horaExamen || 'Sin horario',
        'Aula': item.aula || 'N/A',
        'Sede': item.sedeNombre,
        'Carrera': item.carreraNombre,
        'Semestre': item.semestre || '',
        'Código Materia': item.materiaCodigo,
        'Materia': item.materiaNombre,
        'Grupo': item.grupo,
        'Docente': item.docenteNombre || 'Por asignar',
        'CI Docente': item.docenteCi || '',
        'Parcial': item.tipoParcial,
        'Estado Verificación': estadoTexto,
        'Total Observaciones': item.totalObservaciones,
        'Verificador / Aprobador': item.aprobadoPor || item.ultimoVerificador || '',
        'Fecha Verificación': item.fechaAprobacion || item.ultimaObservacionFecha || ''
      };
    });

    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Monitor Verificacion');
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Monitor_Verificacion_Examenes_${fecha}.xlsx`);
  }

  // Estilos y badges
  public obtenerEtiquetaDictamen(estado: string): string {
    switch (estado) {
      case 'APROBADO_DIRECTO': return 'Verificado Directo';
      case 'OBSERVADO_Y_APROBADO': return 'Observado & Verificado';
      case 'OBSERVADO_PENDIENTE': return 'Observado (Devuelto)';
      case 'PENDIENTE_REVISION': return 'En Cola de Verificación';
      case 'SIN_BANCO': return 'Sin Banco (Docente)';
      default: return estado || 'Programado';
    }
  }

  public obtenerClaseDictamen(estado: string): string {
    switch (estado) {
      case 'APROBADO_DIRECTO':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      case 'OBSERVADO_Y_APROBADO':
        return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800';
      case 'OBSERVADO_PENDIENTE':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      case 'PENDIENTE_REVISION':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'SIN_BANCO':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }

  public obtenerBordeCard(estado: string): string {
    switch (estado) {
      case 'APROBADO_DIRECTO':
      case 'OBSERVADO_Y_APROBADO':
        return 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10';
      case 'OBSERVADO_PENDIENTE':
        return 'border-amber-300 dark:border-amber-900/60 bg-amber-50/15';
      case 'PENDIENTE_REVISION':
        return 'border-blue-200 dark:border-blue-900/60 bg-blue-50/10';
      case 'SIN_BANCO':
        return 'border-rose-200 dark:border-rose-900/60 bg-rose-50/10';
      default:
        return 'border-border';
    }
  }

  // Carga de Sedes y Carreras
  private cargarSedes(): void {
    this.cargandoSedes.set(true);
    this._gateway.getBranchOffices().subscribe({
      next: (sedes) => {
        this.sedes.set(sedes || []);
        this.cargandoSedes.set(false);
        if (this.esConsultaAcademica()) {
          const sedeInicial = this._gateway.resolverSedeInicial(sedes || []);
          if (sedeInicial) {
            this.filtroSede = sedeInicial.code;
            this.cargarCarreras(sedeInicial.code);
          }
        }
        this.cargarDatos(true);
      },
      error: () => {
        this.sedes.set([]);
        this.cargandoSedes.set(false);
        this.cargarDatos(true);
      }
    });
  }

  private cargarCarreras(codigoSede: string): void {
    this.cargandoCarreras.set(true);
    this._gateway.getCareers(codigoSede).subscribe({
      next: (carreras) => {
        this.carreras.set(carreras || []);
        this.cargandoCarreras.set(false);
        if (this.esDirectorCarrera()) {
          this.filtroCarrera = carreras?.[0]?.careerCode || '';
        } else {
          this.filtroCarrera = 'Todos';
        }
      },
      error: () => {
        this.carreras.set([]);
        this.cargandoCarreras.set(false);
      }
    });
  }

  public onSedeChange(codigoSede: string): void {
    this.filtroSede = codigoSede;
    this.filtroCarrera = 'Todos';
    this.carreras.set([]);
    if (codigoSede && codigoSede !== 'Todos') {
      this.cargarCarreras(codigoSede);
    }
    this.cargarDatos(false);
  }

  public onCarreraChange(codigoCarrera: string): void {
    this.filtroCarrera = codigoCarrera;
    this.cargarDatos(false);
  }
}
