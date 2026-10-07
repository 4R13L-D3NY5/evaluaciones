import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GeneracionTypstService } from '../../core/services/generacion-typst.service';
import { 
  EvaluacionesStorageService, 
  GestionEvaluacionItem, 
  EtapaEvaluacion 
} from '../../core/services/evaluaciones-storage.service';
import { RolExamenService, RolExamenResponse } from '../../core/services/rol-examen.service';
import { OmrLecturaResponse, OmrProcesamientoService } from '../../core/services/omr-procesamiento.service';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { AuthService } from '../../core/services/auth.service';
import { BranchOffice, Career } from '../../core/models/unitepc-gateway.models';
import { 
  ReportesService, 
  ReporteCalidadResumen, 
  ReporteCalidadItem, 
  ReporteCoberturaBancosResumen, 
  ReporteCoberturaBancosItem, 
  ReporteConsolidadoOmrResumen, 
  ReporteConsolidadoOmrItem 
} from '../../core/services/reportes.service';
import { MathContentDirective } from '../../shared/components/math-content.directive';
import { VerificacionHistorialDevolucion, VerificacionPregunta, VerificacionOpcion } from '../../core/services/verificacion-examen.service';
import * as XLSX from 'xlsx';

type TipoReporte = 
  | 'REPORTE_EVALUACIONES' 
  | 'CALIDAD_VERIFICACION' 
  | 'COBERTURA_BANCOS' 
  | 'CONSOLIDADO_OMR' 
  | 'PLANILLA_RECEPCION' 
  | 'CONCILIACION_REMARK';

type EstadoConciliacion = 'COINCIDE' | 'DIFERENCIA_RESPUESTAS' | 'SOLO_REMARK' | 'SOLO_SISTEMA';

interface DiferenciaPregunta {
  numero: number;
  remark: string;
  sistema: string;
}

interface ResultadoConciliacion {
  codigoEstudiante: string;
  nombreRemark: string;
  nombreSistema: string;
  estado: EstadoConciliacion;
  diferencias: DiferenciaPregunta[];
  respuestasRemark: Record<string, string>;
  respuestasSistema: Record<string, string>;
}

interface FilaRemark {
  codigoEstudiante: string;
  nombre: string;
  respuestas: Record<string, string>;
}

@Component({
  selector: 'sea-reporte-evaluaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, MathContentDirective],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      
      <!-- 1. CABECERA PRINCIPAL DEL MÓDULO DE REPORTES -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="h-11 w-11 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800">
              <i class="pi pi-clipboard text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">Reportes y Control de Calidad</h1>
              <p class="text-xs text-muted-foreground font-medium">Auditoría institucional, control de calidad de bancos, seguimiento operativo y rendimiento OMR.</p>
            </div>
          </div>
        </div>

        <!-- Botones de Acción Global -->
        <div class="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            (click)="actualizarReportePrincipal()" 
            [disabled]="cargandoReporte() || cargandoCalidad() || cargandoCobertura() || cargandoConsolidado()" 
            class="bg-card hover:bg-muted border border-border text-foreground font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50">
            <i class="pi" 
               [class.pi-refresh]="!(cargandoReporte() || cargandoCalidad() || cargandoCobertura() || cargandoConsolidado())" 
               [class.pi-spin]="cargandoReporte() || cargandoCalidad() || cargandoCobertura() || cargandoConsolidado()" 
               [class.pi-spinner]="cargandoReporte() || cargandoCalidad() || cargandoCobertura() || cargandoConsolidado()"></i>
            <span>Actualizar reporte</span>
          </button>
          <button 
            type="button"
            (click)="exportarReportePrincipal()"
            [disabled]="tipoReporteActivo() === 'CONCILIACION_REMARK' && !resultadosConciliacion().length"
            class="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <i class="pi" [class.pi-file-excel]="tipoReporteActivo() !== 'REPORTE_EVALUACIONES'" [class.pi-download]="tipoReporteActivo() === 'REPORTE_EVALUACIONES'"></i>
            <span>{{ tipoReporteActivo() === 'REPORTE_EVALUACIONES' ? 'Exportar PDF' : 'Exportar Excel' }}</span>
          </button>
          <button 
            type="button"
            (click)="imprimirReporte()" 
            class="bg-card hover:bg-muted border border-border text-foreground font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer">
            <i class="pi pi-print text-sm"></i>
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <!-- 2. PESTAÑAS DE NAVEGACIÓN DE REPORTES -->
      <div class="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          (click)="cambiarPestana('REPORTE_EVALUACIONES')"
          [class]="tipoReporteActivo() === 'REPORTE_EVALUACIONES' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-chart-bar"></i>
          <span>1. Seguimiento operativo</span>
        </button>

        <button
          type="button"
          (click)="cambiarPestana('CALIDAD_VERIFICACION')"
          [class]="tipoReporteActivo() === 'CALIDAD_VERIFICACION' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-verified"></i>
          <span>2. Control de Calidad</span>
        </button>

        <button
          type="button"
          (click)="cambiarPestana('COBERTURA_BANCOS')"
          [class]="tipoReporteActivo() === 'COBERTURA_BANCOS' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-database"></i>
          <span>3. Cobertura de bancos</span>
        </button>

        <button
          type="button"
          (click)="cambiarPestana('CONSOLIDADO_OMR')"
          [class]="tipoReporteActivo() === 'CONSOLIDADO_OMR' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-check-square"></i>
          <span>4. Consolidado OMR</span>
        </button>

        @if (puedeConciliarRemark()) {
          <button
            type="button"
            (click)="abrirConciliacionRemark()"
            [class]="tipoReporteActivo() === 'CONCILIACION_REMARK' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
            class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
            <i class="pi pi-sync"></i>
            <span>5. Conciliación Remark vs. OMR</span>
          </button>
        }
      </div>

      <!-- 3. BARRA DE FILTROS GLOBALES -->
      <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Gestión:</label>
              <select [ngModel]="storage.gestionActiva()" (ngModelChange)="storage.setGestionActiva($event)" class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                <option value="II-2026">II-2026 (Activa)</option>
                <option value="I-2026">I-2026</option>
                <option value="II-2025">II-2025</option>
              </select>
            </div>

            <!-- Filtro de Sede -->
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Sede / Campus:</label>
              <select 
                [ngModel]="filtroSede"
                (ngModelChange)="onSedeChange($event)"
                [disabled]="cargandoSedes()"
                class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                @if (!esDirectorCarrera() && !esVicerrector()) { <option value="Todos">Todas las Sedes</option> }
                @for (sede of sedes(); track sede.branchOfficeId) {
                  <option [value]="sede.code">{{ sede.name }} ({{ sede.code }})</option>
                }
              </select>
            </div>

            <!-- Filtro de Carrera -->
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Carrera:</label>
              <select 
                [ngModel]="filtroCarrera"
                (ngModelChange)="onCarreraChange($event)"
                [disabled]="cargandoCarreras() || !filtroSede || filtroSede === 'Todos'"
                class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                @if (!esDirectorCarrera()) { <option value="Todos">Todas las Carreras</option> }
                @for (carrera of carreras(); track carrera.careerId) {
                  <option [value]="carrera.careerCode">{{ carrera.careerName }} ({{ carrera.careerCode }})</option>
                }
              </select>
            </div>

            <!-- Filtro de Parcial -->
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Parcial:</label>
              <select [ngModel]="filtroParcial" (ngModelChange)="filtroParcial = $event; refrescarFiltros()" class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                <option value="Todos">Todos los parciales</option>
                <option value="1er Parcial">1er Parcial</option>
                <option value="2do Parcial">2do Parcial</option>
                <option value="Final">Final</option>
                <option value="2da Instancia">2da Instancia</option>
              </select>
            </div>

            @if (tipoReporteActivo() === 'REPORTE_EVALUACIONES') {
              <!-- Filtro de Modalidad -->
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Modalidad:</label>
                <select 
                  [ngModel]="filtroModalidad"
                  (ngModelChange)="filtroModalidad = $event; refrescarFiltros()"
                  class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                  <option value="Todos">Todas las Modalidades</option>
                  <option value="CON_CARTILLA">Solo Con Cartilla</option>
                  <option value="SIN_CARTILLA">Solo Sin Cartilla</option>
                </select>
              </div>

              <!-- Filtro de Estado Operativo -->
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Estado flujo:</label>
                <select [ngModel]="filtroEstadoReporte" (ngModelChange)="filtroEstadoReporte = $event; refrescarFiltros()" class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                  <option value="Todos">Todos los estados</option>
                  <option value="PROGRAMADO">Programado</option>
                  <option value="VALIDADO">Validado</option>
                  <option value="GENERADO">Generado</option>
                  <option value="IMPRESO">Impreso</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="DEVUELTO">Devuelto</option>
                  <option value="CALIFICADO">Calificado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                </select>
              </div>

              <!-- Buscador Rápido por código o materia -->
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Buscar código / materia:</label>
                <div class="relative">
                  <i class="pi pi-search absolute left-2.5 top-2 text-muted-foreground text-xs"></i>
                  <input
                    type="text"
                    [(ngModel)]="busquedaReporte"
                    placeholder="SIS-114, materia, docente..."
                    class="bg-muted border border-border rounded-xl pl-7 pr-6 py-1.5 text-xs font-semibold text-foreground outline-none w-52 focus:border-primary shadow-2xs" />
                  @if (busquedaReporte) {
                    <button type="button" (click)="busquedaReporte = ''" class="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground text-xs cursor-pointer">
                      <i class="pi pi-times text-[10px]"></i>
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Resumen Rápido de Registros -->
          <div class="text-right">
            <span class="text-xs text-muted-foreground font-medium">Registros Visibles:</span>
            <div class="text-xl font-black text-foreground font-mono">
              @if (tipoReporteActivo() === 'CALIDAD_VERIFICACION') {
                {{ itemsCalidadFiltrados().length }}
              } @else if (tipoReporteActivo() === 'COBERTURA_BANCOS') {
                {{ itemsCoberturaFiltrados().length }}
              } @else if (tipoReporteActivo() === 'CONSOLIDADO_OMR') {
                {{ itemsConsolidadoFiltrados().length }}
              } @else {
                {{ rolesReporteFiltrados().length }}
              }
            </div>
          </div>
        </div>
      </div>

      <!-- ALERTA DE ALCANCE ACADÉMICO -->
      @if (esConsultaAcademica() && !cargandoSedes() && sedes().length === 0) {
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900 shadow-xs">
          <i class="pi pi-lock mt-0.5"></i>
          <div>
            <p class="font-black">No tienes sedes académicas asignadas</p>
            <p class="text-xs mt-1">Solicita al administrador que registre las sedes correspondientes bajo tu alcance institucional.</p>
          </div>
        </div>
      }

      <!-- ========================================================================= -->
      <!-- PESTAÑA 2: CONTROL DE CALIDAD Y OBSERVACIONES DE VERIFICACIÓN (REPORTE CALIDAD) -->
      <!-- ========================================================================= -->
      @if (tipoReporteActivo() === 'CALIDAD_VERIFICACION') {
        <section class="space-y-4 print-area">
          @if (errorCalidad()) {
            <div class="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 p-4 text-sm flex items-center gap-2">
              <i class="pi pi-exclamation-triangle"></i>{{ errorCalidad() }}
            </div>
          }

          <!-- Tarjetas KPI -->
          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <!-- Total Evaluadas -->
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Total Evaluadas</span>
              <strong class="block text-2xl font-black text-foreground mt-2">{{ resumenCalidad().totalExamenes }}</strong>
              <span class="text-[11px] text-muted-foreground">exámenes en alcance</span>
            </div>
            
            <!-- Aprobados Directos -->
            <div class="bg-card border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/20 rounded-2xl p-4 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-black">Aprobados Directos</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {{ resumenCalidad().porcentajeAprobadosDirectos }}%
                </span>
              </div>
              <strong class="block text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">{{ resumenCalidad().aprobadosDirectos }}</strong>
              <span class="text-[11px] text-muted-foreground">sin observaciones</span>
            </div>

            <!-- Observados y Aprobados -->
            <div class="bg-card border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/20 rounded-2xl p-4 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-black">Observados & Aprobados</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {{ resumenCalidad().porcentajeObservados }}%
                </span>
              </div>
              <strong class="block text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">{{ resumenCalidad().observadosYLuegoAprobados }}</strong>
              <span class="text-[11px] text-muted-foreground">corregidos y validados</span>
            </div>

            <!-- Observados Pendientes -->
            <div class="bg-card border border-rose-200/60 dark:border-rose-800/40 bg-rose-50/20 rounded-2xl p-4 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-black">Observados Pendientes</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Alerta</span>
              </div>
              <strong class="block text-2xl font-black text-rose-700 dark:text-rose-400 mt-2">{{ resumenCalidad().observadosPendientes }}</strong>
              <span class="text-[11px] text-muted-foreground">requieren corrección</span>
            </div>

            <!-- Pendientes de Revisión -->
            <div class="bg-card border border-blue-200/60 dark:border-blue-800/40 bg-blue-50/20 rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-blue-700 dark:text-blue-400 font-black">Pendientes Revisión</span>
              <strong class="block text-2xl font-black text-blue-700 dark:text-blue-400 mt-2">{{ resumenCalidad().pendientesRevision }}</strong>
              <span class="text-[11px] text-muted-foreground">en cola de verificación</span>
            </div>

            <!-- Sin Banco de Preguntas -->
            <div class="bg-card border border-orange-200/60 dark:border-orange-800/40 bg-orange-50/20 rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-orange-700 dark:text-orange-400 font-black">Sin Banco</span>
              <strong class="block text-2xl font-black text-orange-700 dark:text-orange-400 mt-2">{{ resumenCalidad().sinBanco }}</strong>
              <span class="text-[11px] text-muted-foreground">sin preguntas cargadas</span>
            </div>
          </div>

          <!-- Filtros Rápidos por Estado de Calidad y Buscador -->
          <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[10px] font-black uppercase text-muted-foreground mr-1">Dictamen:</span>
              <button
                type="button"
                (click)="filtrarCalidadEstado('TODOS')"
                [class]="filtroCalidadEstado === 'TODOS' ? 'bg-primary text-white shadow-xs font-black' : 'bg-muted text-muted-foreground hover:text-foreground font-bold'"
                class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer">
                Todos ({{ resumenCalidad().totalExamenes }})
              </button>
              <button
                type="button"
                (click)="filtrarCalidadEstado('APROBADO_DIRECTO')"
                [class]="filtroCalidadEstado === 'APROBADO_DIRECTO' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'"
                class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5">
                <span>🟢 Aprobados Directos ({{ resumenCalidad().aprobadosDirectos }})</span>
              </button>
              <button
                type="button"
                (click)="filtrarCalidadEstado('OBSERVADO_Y_APROBADO')"
                [class]="filtroCalidadEstado === 'OBSERVADO_Y_APROBADO' ? 'bg-amber-600 text-white shadow-xs font-black' : 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'"
                class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5">
                <span>🟡 Observados y Aprobados ({{ resumenCalidad().observadosYLuegoAprobados }})</span>
              </button>
              <button
                type="button"
                (click)="filtrarCalidadEstado('OBSERVADO_PENDIENTE')"
                [class]="filtroCalidadEstado === 'OBSERVADO_PENDIENTE' ? 'bg-rose-600 text-white shadow-xs font-black' : 'bg-rose-50 text-rose-800 border border-rose-200 font-bold'"
                class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5">
                <span>🔴 Observados Pendientes ({{ resumenCalidad().observadosPendientes }})</span>
              </button>
              <button
                type="button"
                (click)="filtrarCalidadEstado('PENDIENTE_REVISION')"
                [class]="filtroCalidadEstado === 'PENDIENTE_REVISION' ? 'bg-blue-600 text-white shadow-xs font-black' : 'bg-blue-50 text-blue-800 border border-blue-200 font-bold'"
                class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5">
                <span>⏳ Pendientes de Revisión ({{ resumenCalidad().pendientesRevision }})</span>
              </button>
              <button
                type="button"
                (click)="filtrarCalidadEstado('SIN_BANCO')"
                [class]="filtroCalidadEstado === 'SIN_BANCO' ? 'bg-orange-600 text-white shadow-xs font-black' : 'bg-orange-50 text-orange-800 border border-orange-200 font-bold'"
                class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5">
                <span>⚠️ Sin Banco ({{ resumenCalidad().sinBanco }})</span>
              </button>
            </div>

            <!-- Buscador y Exportar Excel -->
            <div class="flex items-center gap-2">
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-2.5 text-muted-foreground text-xs"></i>
                <input
                  type="text"
                  [(ngModel)]="busquedaCalidad"
                  placeholder="Buscar materia, docente, código, grupo..."
                  class="bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs outline-none w-64 focus:border-primary" />
              </div>
              <button
                type="button"
                (click)="exportarCalidadExcel()"
                [disabled]="!itemsCalidadFiltrados().length"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-xs">
                <i class="pi pi-file-excel"></i>
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>

          <!-- Tabla de Calidad de Verificación -->
          <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
            <div class="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 class="text-sm font-black text-foreground">Sábana de Control de Calidad de Exámenes</h3>
                <p class="text-xs text-muted-foreground mt-0.5">Auditoría retroactiva del flujo de verificación y observaciones por docente.</p>
              </div>
              <span class="text-xs font-mono font-bold text-muted-foreground">
                {{ itemsCalidadFiltrados().length }} registros mostrados
              </span>
            </div>

            @if (cargandoCalidad()) {
              <div class="p-12 text-center text-sm text-muted-foreground">
                <i class="pi pi-spinner pi-spin mr-2 text-primary"></i>Cargando control de calidad...
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <th class="p-3">Materia / Grupo</th>
                      <th class="p-3">Docente Titular</th>
                      <th class="p-3">Sede / Carrera</th>
                      <th class="p-3">Parcial / Fecha</th>
                      <th class="p-3 text-center">Dictamen de Calidad</th>
                      <th class="p-3 text-center">Observaciones</th>
                      <th class="p-3 text-center">Aprobación / Verificación</th>
                      <th class="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (item of itemsCalidadFiltrados(); track item.rolExamenId) {
                      <tr class="hover:bg-muted/30 transition-colors">
                        <td class="p-3">
                          <span class="font-mono text-primary font-black">{{ item.materiaCodigo }}</span>
                          <div class="font-bold text-foreground leading-tight">{{ item.materiaNombre }}</div>
                          <span class="text-[10px] text-muted-foreground font-semibold">Grupo {{ item.grupo }}</span>
                        </td>
                        <td class="p-3">
                          <div class="font-medium text-foreground uppercase">{{ item.docenteNombre || 'Por asignar' }}</div>
                          <span class="text-[10px] text-muted-foreground font-mono">{{ item.docenteCi ? 'CI: ' + item.docenteCi : 'Sin CI' }}</span>
                        </td>
                        <td class="p-3">
                          <div class="font-bold text-foreground">{{ item.sedeNombre }}</div>
                          <span class="text-[10px] text-muted-foreground">{{ item.carreraNombre }}</span>
                        </td>
                        <td class="p-3 whitespace-nowrap">
                          <div class="font-bold text-foreground">{{ item.tipoParcial }}</div>
                          <span class="text-[10px] text-muted-foreground font-mono block">{{ item.fechaExamen }} {{ item.horaExamen || '' }}</span>
                        </td>
                        <td class="p-3 text-center">
                          <span [class]="obtenerClaseDictamen(item.estadoCalidad)" class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 border">
                            {{ obtenerEtiquetaDictamen(item.estadoCalidad) }}
                          </span>
                        </td>
                        <td class="p-3 text-center">
                          @if (item.totalObservaciones > 0) {
                            <span class="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-black inline-flex items-center gap-1">
                              <i class="pi pi-history text-[9px]"></i>
                              {{ item.totalObservaciones }} {{ item.totalObservaciones === 1 ? 'observación' : 'observaciones' }}
                            </span>
                          } @else {
                            <span class="text-muted-foreground text-[10px] font-mono">0 observaciones</span>
                          }
                        </td>
                        <td class="p-3 text-center">
                          @if (item.aprobadoPor) {
                            <div class="text-[11px] font-bold text-foreground truncate max-w-40">{{ item.aprobadoPor }}</div>
                            <span class="text-[9.5px] text-muted-foreground font-mono block">{{ formatearFechaBoliviana(item.fechaAprobacion) }}</span>
                          } @else if (item.ultimoVerificador) {
                            <div class="text-[11px] font-medium text-foreground truncate max-w-40">{{ item.ultimoVerificador }}</div>
                            <span class="text-[9.5px] text-muted-foreground font-mono block">{{ formatearFechaBoliviana(item.ultimaObservacionFecha) }}</span>
                          } @else {
                            <span class="text-muted-foreground text-[10px] font-mono">Sin verificación</span>
                          }
                        </td>
                        <td class="p-3 text-center">
                          @if (item.observaciones && item.observaciones.length > 0) {
                            <button
                              type="button"
                              (click)="abrirModalObservaciones(item)"
                              title="Ver observaciones previas"
                              class="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-black inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
                              <i class="pi pi-comments"></i>
                              <span>Ver historial</span>
                            </button>
                          } @else {
                            <span class="text-muted-foreground/60 text-[10px]">—</span>
                          }
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="8" class="p-12 text-center text-sm text-muted-foreground">
                          No existen registros de exámenes para los filtros seleccionados.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </section>
      }

      <!-- MODAL DETALLADO DE OBSERVACIONES Y TIMELINE -->
      @if (itemCalidadSeleccionado(); as item) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" (click)="cerrarModalObservaciones()">
          <div class="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl overflow-hidden flex flex-col" (click)="$event.stopPropagation()">
            <div class="p-5 border-b border-border bg-purple-50/60 dark:bg-purple-950/20 flex items-start justify-between gap-3 shrink-0">
              <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 shrink-0">
                  <i class="pi pi-history text-lg"></i>
                </span>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono font-black text-xs">{{ item.materiaCodigo }}</span>
                    <h3 class="text-sm font-black text-foreground">{{ item.materiaNombre }} (Grupo {{ item.grupo }})</h3>
                    <span [class]="obtenerClaseDictamen(item.estadoCalidad)" class="px-2 py-0.5 rounded-lg text-[10px] font-black border">
                      {{ obtenerEtiquetaDictamen(item.estadoCalidad) }}
                    </span>
                  </div>
                  <p class="text-xs text-muted-foreground mt-1">
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

            <div class="p-5 overflow-y-auto space-y-5 flex-1">
              @if (cargandoHistorialCalidad()) {
                <div class="py-12 text-center text-sm text-muted-foreground">
                  <i class="pi pi-spinner pi-spin text-2xl text-primary block mb-2"></i>
                  Cargando detalle de preguntas y observaciones...
                </div>
              } @else if (historialCalidadModal().length > 0) {
                <div class="space-y-6">
                  @for (devolucion of historialCalidadModal(); track devolucion.id || $index; let idx = $index) {
                    <article class="rounded-2xl border-2 border-amber-300/80 bg-amber-50/30 dark:border-amber-700/60 dark:bg-amber-950/15 overflow-hidden shadow-xs">
                      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 dark:border-amber-800/80 bg-amber-100/60 dark:bg-amber-900/30 px-4 py-3">
                        <div class="flex items-center gap-2">
                          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-black">
                            {{ historialCalidadModal().length - idx }}
                          </span>
                          <span class="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                            Devolución #{{ historialCalidadModal().length - idx }}
                          </span>
                        </div>
                        <div class="flex items-center gap-2 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                          <i class="pi pi-calendar"></i>
                          <span>{{ devolucion.fechaDevolucion | date:'dd/MM/yyyy HH:mm' }}</span>
                          <span class="text-amber-400">·</span>
                          <i class="pi pi-user"></i>
                          <span>Por: {{ devolucion.verificadoPor || 'Verificador oficial' }}</span>
                        </div>
                      </div>

                      <div class="p-4 space-y-4">
                        @if (devolucion.observacionesGenerales) {
                          <div class="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs text-amber-950 dark:text-amber-100 shadow-2xs">
                            <div class="flex items-center gap-1.5 font-black text-amber-900 dark:text-amber-300 mb-1">
                              <i class="pi pi-comment"></i>
                              <span>Observación General del Verificador:</span>
                            </div>
                            <p class="leading-relaxed whitespace-pre-wrap pl-5">{{ devolucion.observacionesGenerales }}</p>
                          </div>
                        }

                        @if (devolucion.preguntasObservadas && devolucion.preguntasObservadas.length > 0) {
                          <div>
                            <p class="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                              <i class="pi pi-list"></i>
                              <span>Preguntas observadas en esta revisión ({{ devolucion.preguntasObservadas.length }}):</span>
                            </p>

                            <div class="space-y-4">
                              @for (itemPregunta of devolucion.preguntasObservadas; track itemPregunta.numeroPregunta) {
                                <div class="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-3">
                                  <div class="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-2.5">
                                    <div class="flex items-center gap-2">
                                      <span class="rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 text-xs font-black border border-purple-200 dark:border-purple-700">
                                        Pregunta {{ itemPregunta.numeroPregunta }}
                                      </span>
                                      @if (itemPregunta.preguntaEnviada?.tipoReactivo) {
                                        <span class="text-[10px] font-bold uppercase text-muted-foreground">
                                          {{ itemPregunta.preguntaEnviada?.tipoReactivo }}
                                        </span>
                                      }
                                    </div>
                                    @if (itemPregunta.preguntaCorregida) {
                                      <span class="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                                        <i class="pi pi-check mr-1"></i>Corregida en versión posterior
                                      </span>
                                    }
                                  </div>

                                  <div class="rounded-lg border border-rose-200 bg-rose-50/80 dark:bg-rose-950/30 dark:border-rose-900 p-2.5 text-xs text-rose-900 dark:text-rose-200">
                                    <strong class="text-rose-950 dark:text-rose-100 font-black flex items-center gap-1 mb-1">
                                      <i class="pi pi-exclamation-triangle text-rose-600"></i> Observación del verificador:
                                    </strong>
                                    <p class="leading-relaxed whitespace-pre-wrap pl-4">{{ itemPregunta.observacion }}</p>
                                  </div>

                                  @if (itemPregunta.preguntaEnviada) {
                                    <div class="rounded-lg bg-muted/40 p-3 border border-border/60 text-xs space-y-2">
                                      <div class="font-extrabold uppercase text-[10px] text-muted-foreground">Enunciado de la pregunta:</div>
                                      <div [seaMathContent]="itemPregunta.preguntaEnviada.enunciado" class="whitespace-pre-wrap text-foreground font-medium"></div>

                                      @if (imagenDataUrl(itemPregunta.preguntaEnviada.imagenBase64); as img) {
                                        <img [src]="img" alt="Imagen del reactivo" class="max-h-56 max-w-full rounded-lg border border-border object-contain my-2" />
                                      }

                                      @if (itemPregunta.preguntaEnviada.opciones && itemPregunta.preguntaEnviada.opciones.length > 0) {
                                        <div class="mt-2.5 pt-2.5 border-t border-border/50 space-y-1.5">
                                          <div class="font-bold text-[10px] uppercase text-muted-foreground">Opciones registradas:</div>
                                          <div class="space-y-1">
                                            @for (opc of itemPregunta.preguntaEnviada.opciones; track opc.letra) {
                                              <div class="flex items-start gap-1.5 text-xs" [class.font-black]="esOpcionCorrecta(itemPregunta.preguntaEnviada, opc)" [class.text-emerald-700]="esOpcionCorrecta(itemPregunta.preguntaEnviada, opc)">
                                                <span class="w-5 shrink-0">{{ opc.letra }})</span>
                                                <span [seaMathContent]="opc.texto" class="flex-1"></span>
                                                @if (esOpcionCorrecta(itemPregunta.preguntaEnviada, opc)) {
                                                  <span class="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] px-1.5 py-0.2 font-black shrink-0 border border-emerald-300 dark:border-emerald-800">CLAVE</span>
                                                }
                                              </div>
                                            }
                                          </div>
                                        </div>
                                      }
                                      @if (itemPregunta.preguntaEnviada.respuestaCorrecta) {
                                        <div class="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mt-1">
                                          Clave correcta indicada: <strong>{{ itemPregunta.preguntaEnviada.respuestaCorrecta }}</strong>
                                        </div>
                                      }
                                    </div>
                                  } @else {
                                    <p class="text-xs text-muted-foreground italic">No se pudo recuperar el reactivo original.</p>
                                  }
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </article>
                  }
                </div>
              } @else if (item.observaciones && item.observaciones.length > 0) {
                <!-- Vista de respaldo si no se obtuvo detalle completo de reactivos -->
                <div class="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-purple-200">
                  @for (obs of item.observaciones; track obs.devolucionId; let i = $index) {
                    <div class="relative flex items-start gap-3 pl-1">
                      <div class="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 z-10 shadow-xs">
                        {{ item.observaciones.length - i }}
                      </div>
                      <div class="flex-1 bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                          <div>
                            <span class="text-[10px] font-black uppercase text-purple-700">Devolución #{{ item.observaciones.length - i }}</span>
                            <div class="text-xs font-bold text-foreground">
                              Verificado por: {{ obs.verificadoPor || 'Verificador oficial' }}
                            </div>
                          </div>
                          <span class="text-[11px] font-mono font-bold text-muted-foreground bg-card px-2.5 py-1 rounded-lg border border-border">
                            <i class="pi pi-calendar mr-1 text-[10px]"></i>
                            {{ formatearFechaBoliviana(obs.fechaDevolucion) }}
                          </span>
                        </div>

                        @if (obs.observacionesGenerales) {
                          <div>
                            <span class="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Motivo general de la observación:</span>
                            <p class="text-xs text-foreground bg-card border border-border/70 rounded-lg p-2.5 leading-relaxed font-medium">
                              {{ obs.observacionesGenerales }}
                            </p>
                          </div>
                        }

                        @if (parsearPreguntasObservadas(obs.observacionesPreguntasJson); as preguntas) {
                          @if (preguntas.length > 0) {
                            <div>
                              <span class="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1.5">
                                Preguntas observadas en detalle ({{ preguntas.length }}):
                              </span>
                              <div class="grid grid-cols-1 gap-2">
                                @for (p of preguntas; track p.numero) {
                                  <div class="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-2.5 flex items-start gap-2.5">
                                    <span class="px-2 py-0.5 rounded bg-rose-600 text-white font-black font-mono text-[10px] shrink-0 mt-0.5">
                                      P{{ p.numero }}
                                    </span>
                                    <p class="text-xs text-rose-900 dark:text-rose-200 font-medium leading-relaxed">
                                      {{ p.motivo }}
                                    </p>
                                  </div>
                                }
                              </div>
                            </div>
                          }
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="rounded-xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  <i class="pi pi-info-circle text-2xl text-muted-foreground block mb-2"></i>
                  No se registran devoluciones ni observaciones para esta evaluación.
                </div>
              }
            </div>

            <div class="p-4 border-t border-border flex justify-end shrink-0 bg-muted/30">
              <button
                type="button"
                (click)="cerrarModalObservaciones()"
                class="px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold text-foreground cursor-pointer transition">
                Cerrar bitácora
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ========================================================================= -->
      <!-- PESTAÑA 3: COBERTURA Y VALIDACIÓN DE BANCOS DE PREGUNTAS -->
      <!-- ========================================================================= -->
      @if (tipoReporteActivo() === 'COBERTURA_BANCOS') {
        <section class="space-y-4 print-area">
          @if (errorCobertura()) {
            <div class="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 p-4 text-sm flex items-center gap-2">
              <i class="pi pi-exclamation-triangle"></i>{{ errorCobertura() }}
            </div>
          }

          <!-- Tarjetas KPI Cobertura -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Total Asignaturas</span>
              <strong class="block text-2xl font-black text-foreground mt-2">{{ resumenCobertura().totalMaterias }}</strong>
              <span class="text-[11px] text-muted-foreground">materias programadas</span>
            </div>
            <div class="bg-card border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/20 rounded-2xl p-4 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-black">Con Banco Cargado</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {{ resumenCobertura().porcentajeCobertura }}%
                </span>
              </div>
              <strong class="block text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">{{ resumenCobertura().materiasConBanco }}</strong>
              <span class="text-[11px] text-muted-foreground">bancos validados</span>
            </div>
            <div class="bg-card border border-rose-200/60 dark:border-rose-800/40 bg-rose-50/20 rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-black">Sin Banco (Pendientes)</span>
              <strong class="block text-2xl font-black text-rose-700 dark:text-rose-400 mt-2">{{ resumenCobertura().materiasSinBanco }}</strong>
              <span class="text-[11px] text-muted-foreground">requieren entrega</span>
            </div>
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-purple-700 font-black">Efectividad General</span>
              <strong class="block text-2xl font-black text-purple-700 mt-2">{{ resumenCobertura().porcentajeCobertura }}%</strong>
              <span class="text-[11px] text-muted-foreground">cumplimiento global</span>
            </div>
          </div>

          <!-- Barra de Búsqueda y Exportación -->
          <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-black text-foreground">Auditoría de Bancos de Preguntas</h3>
              <p class="text-xs text-muted-foreground mt-0.5">Control de cumplimiento docente por carrera y asignatura.</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-2.5 text-muted-foreground text-xs"></i>
                <input
                  type="text"
                  [(ngModel)]="busquedaCobertura"
                  placeholder="Buscar asignatura, docente o carrera..."
                  class="bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs outline-none w-64 focus:border-primary" />
              </div>
              <button
                type="button"
                (click)="exportarCoberturaExcel()"
                [disabled]="!itemsCoberturaFiltrados().length"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-xs">
                <i class="pi pi-file-excel"></i>
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>

          <!-- Tabla de Cobertura -->
          <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
            @if (cargandoCobertura()) {
              <div class="p-12 text-center text-sm text-muted-foreground">
                <i class="pi pi-spinner pi-spin mr-2 text-primary"></i>Cargando cobertura de bancos...
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <th class="p-3">Carrera / Sede</th>
                      <th class="p-3">Asignatura & Código</th>
                      <th class="p-3">Grupo / Sem.</th>
                      <th class="p-3">Docente Titular</th>
                      <th class="p-3">Parcial & Fecha</th>
                      <th class="p-3 text-center">Estado del Banco</th>
                      <th class="p-3 text-center">Reactivos</th>
                      <th class="p-3 text-center">Alerta de Seguimiento</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (item of itemsCoberturaFiltrados(); track item.rolExamenId) {
                      <tr class="hover:bg-muted/30 transition-colors">
                        <td class="p-3">
                          <div class="font-bold text-foreground">{{ item.carreraNombre }}</div>
                          <span class="text-[10px] text-muted-foreground">{{ item.sedeNombre }}</span>
                        </td>
                        <td class="p-3">
                          <span class="font-mono text-primary font-black">{{ item.materiaCodigo }}</span>
                          <div class="font-bold text-foreground leading-tight">{{ item.materiaNombre }}</div>
                        </td>
                        <td class="p-3 font-mono font-bold">
                          <span class="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded">
                            G{{ item.grupo }}
                          </span>
                          <span class="text-[10px] text-muted-foreground ml-1">{{ item.semestre ? item.semestre + '°' : '' }}</span>
                        </td>
                        <td class="p-3">
                          <div class="font-medium text-foreground uppercase">{{ item.docenteNombre || 'Por asignar' }}</div>
                          <span class="text-[10px] text-muted-foreground font-mono">{{ item.docenteCi ? 'CI: ' + item.docenteCi : '' }}</span>
                        </td>
                        <td class="p-3 whitespace-nowrap">
                          <div class="font-bold">{{ item.tipoParcial }}</div>
                          <span class="text-[10px] text-muted-foreground font-mono">{{ item.fechaExamen }}</span>
                        </td>
                        <td class="p-3 text-center">
                          <span [class]="item.tieneBanco ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'" class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 border">
                            <i class="pi" [class.pi-check-circle]="item.tieneBanco" [class.pi-times-circle]="!item.tieneBanco"></i>
                            {{ item.tieneBanco ? 'Cargado (' + item.estadoBanco + ')' : 'Sin Banco' }}
                          </span>
                        </td>
                        <td class="p-3 text-center">
                          @if (item.tieneBanco) {
                            <div class="font-mono font-black text-foreground">{{ item.totalReactivos }} reactivos</div>
                            <span class="text-[9.5px] text-muted-foreground font-mono">
                              {{ item.facilesCount }}F / {{ item.mediasCount }}M / {{ item.dificilesCount }}D
                            </span>
                          } @else {
                            <span class="text-muted-foreground text-[10px] font-mono">0 reactivos</span>
                          }
                        </td>
                        <td class="p-3 text-center">
                          @if (!item.tieneBanco) {
                            <span class="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl text-[10px] font-black inline-flex items-center gap-1">
                              <i class="pi pi-exclamation-triangle text-[9px]"></i>
                              Docente pendiente
                            </span>
                          } @else {
                            <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl text-[10px] font-black inline-flex items-center gap-1">
                              <i class="pi pi-check text-[9px]"></i>
                              Validado
                            </span>
                          }
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="8" class="p-12 text-center text-sm text-muted-foreground">
                          No existen registros de cobertura para los filtros seleccionados.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </section>
      }

      <!-- ========================================================================= -->
      <!-- PESTAÑA 4: CONSOLIDADO DE CALIFICACIONES Y RENDIMIENTO OMR -->
      <!-- ========================================================================= -->
      @if (tipoReporteActivo() === 'CONSOLIDADO_OMR') {
        <section class="space-y-4 print-area">
          @if (errorConsolidado()) {
            <div class="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 p-4 text-sm flex items-center gap-2">
              <i class="pi pi-exclamation-triangle"></i>{{ errorConsolidado() }}
            </div>
          }

          <!-- Tarjetas KPI Consolidado OMR -->
          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Exámenes Evaluados</span>
              <strong class="block text-2xl font-black text-foreground mt-2">{{ resumenConsolidado().totalExamenesCalificados }}</strong>
              <span class="text-[11px] text-muted-foreground">procesados con OMR</span>
            </div>
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-blue-700 font-black">Total Inscritos</span>
              <strong class="block text-2xl font-black text-blue-700 mt-2">{{ resumenConsolidado().totalInscritos }}</strong>
              <span class="text-[11px] text-muted-foreground">estudiantes convocados</span>
            </div>
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-purple-700 font-black">Cartillas Calificadas</span>
              <strong class="block text-2xl font-black text-purple-700 mt-2">{{ resumenConsolidado().totalCalificados }}</strong>
              <span class="text-[11px] text-muted-foreground">hojas procesadas</span>
            </div>
            <div class="bg-card border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/20 rounded-2xl p-4 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-black">Total Aprobados</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {{ resumenConsolidado().porcentajeAprobacionGeneral }}%
                </span>
              </div>
              <strong class="block text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">{{ resumenConsolidado().totalAprobados }}</strong>
              <span class="text-[11px] text-muted-foreground">nota &ge; 51</span>
            </div>
            <div class="bg-card border border-rose-200/60 dark:border-rose-800/40 bg-rose-50/20 rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-black">Total Reprobados</span>
              <strong class="block text-2xl font-black text-rose-700 dark:text-rose-400 mt-2">{{ resumenConsolidado().totalReprobados }}</strong>
              <span class="text-[11px] text-muted-foreground">nota &lt; 51</span>
            </div>
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs">
              <span class="text-[10px] uppercase tracking-wider text-foreground font-black">Promedio General</span>
              <strong class="block text-2xl font-black text-foreground mt-2">{{ resumenConsolidado().promedioGeneral }}</strong>
              <span class="text-[11px] text-muted-foreground">escala sobre 100</span>
            </div>
          </div>

          <!-- Barra de Búsqueda y Exportación -->
          <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-black text-foreground">Rendimiento por Grupo y Asignatura</h3>
              <p class="text-xs text-muted-foreground mt-0.5">Consolidado de lecturas ópticas procesadas y aprobaciones institucionales.</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-2.5 text-muted-foreground text-xs"></i>
                <input
                  type="text"
                  [(ngModel)]="busquedaConsolidado"
                  placeholder="Buscar materia, docente o carrera..."
                  class="bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs outline-none w-64 focus:border-primary" />
              </div>
              <button
                type="button"
                (click)="exportarConsolidadoExcel()"
                [disabled]="!itemsConsolidadoFiltrados().length"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-xs">
                <i class="pi pi-file-excel"></i>
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>

          <!-- Tabla de Consolidado OMR -->
          <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
            @if (cargandoConsolidado()) {
              <div class="p-12 text-center text-sm text-muted-foreground">
                <i class="pi pi-spinner pi-spin mr-2 text-primary"></i>Cargando consolidado OMR...
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <th class="p-3">Sede & Carrera</th>
                      <th class="p-3">Asignatura & Código</th>
                      <th class="p-3">Grupo</th>
                      <th class="p-3">Docente Titular</th>
                      <th class="p-3 text-center">Inscritos</th>
                      <th class="p-3 text-center">Calificados OMR</th>
                      <th class="p-3 text-center">Promedio (/100)</th>
                      <th class="p-3 text-center">Aprobados</th>
                      <th class="p-3 text-center">Reprobados</th>
                      <th class="p-3 text-center">Sincronización SEA</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (item of itemsConsolidadoFiltrados(); track item.rolExamenId) {
                      <tr class="hover:bg-muted/30 transition-colors">
                        <td class="p-3">
                          <div class="font-bold text-foreground">{{ item.sedeNombre }}</div>
                          <span class="text-[10px] text-muted-foreground">{{ item.carreraNombre }}</span>
                        </td>
                        <td class="p-3">
                          <span class="font-mono text-primary font-black">{{ item.materiaCodigo }}</span>
                          <div class="font-bold text-foreground leading-tight">{{ item.materiaNombre }}</div>
                        </td>
                        <td class="p-3 font-mono font-bold">
                          <span class="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded">
                            G{{ item.grupo }}
                          </span>
                        </td>
                        <td class="p-3">
                          <div class="font-medium text-foreground uppercase">{{ item.docenteNombre || 'Por asignar' }}</div>
                          <span class="text-[10px] text-muted-foreground font-mono">{{ item.tipoParcial }} · {{ item.fechaExamen }}</span>
                        </td>
                        <td class="p-3 text-center font-mono font-bold text-foreground">
                          {{ item.totalInscritos }}
                        </td>
                        <td class="p-3 text-center font-mono font-black text-purple-700">
                          {{ item.totalCalificados }}
                        </td>
                        <td class="p-3 text-center font-mono font-black text-foreground">
                          {{ item.totalCalificados > 0 ? item.promedioNota : '—' }}
                        </td>
                        <td class="p-3 text-center font-mono font-bold text-emerald-600">
                          {{ item.totalCalificados > 0 ? item.totalAprobados + ' (' + item.porcentajeAprobacion + '%)' : '—' }}
                        </td>
                        <td class="p-3 text-center font-mono font-bold text-rose-600">
                          {{ item.totalCalificados > 0 ? item.totalReprobados : '—' }}
                        </td>
                        <td class="p-3 text-center">
                          <span [class]="item.estadoSincronizacionSea === 'SINCRONIZADO' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'" class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 border">
                            <i class="pi" [class.pi-check]="item.estadoSincronizacionSea === 'SINCRONIZADO'" [class.pi-clock]="item.estadoSincronizacionSea !== 'SINCRONIZADO'"></i>
                            {{ item.estadoSincronizacionSea }}
                          </span>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="10" class="p-12 text-center text-sm text-muted-foreground">
                          No existen registros consolidados OMR para los filtros seleccionados.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </section>
      }

      <!-- ========================================================================= -->
      <!-- PESTAÑA 1: SEGUIMIENTO OPERATIVO SIDOPA (CONSERVADO Y ADAPTADO) -->
      <!-- ========================================================================= -->
      @if (tipoReporteActivo() === 'REPORTE_EVALUACIONES') {
        <section class="space-y-4 print-area">
          @if (errorReporte()) {
            <div class="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 p-4 text-sm flex items-center gap-2"><i class="pi pi-exclamation-triangle"></i>{{ errorReporte() }}</div>
          }
          <div class="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 text-xs text-purple-950 flex flex-wrap items-center justify-between gap-3"><span><i class="pi pi-info-circle mr-1"></i>Reporte generado con los roles de examen visibles para tu usuario. Los filtros se aplican sobre la información oficial del sistema.</span><span class="font-black">Generado: {{ reporteGeneradoEn() | date:'dd/MM/yyyy HH:mm' }}</span></div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs"><span class="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Total evaluaciones</span><strong class="block text-2xl font-black text-foreground mt-2">{{ reporteResumen().total }}</strong><span class="text-[11px] text-muted-foreground">registros filtrados</span></div>
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs"><span class="text-[10px] uppercase tracking-wider text-emerald-700 font-black">Generadas o posteriores</span><strong class="block text-2xl font-black text-emerald-700 mt-2">{{ reporteResumen().generadas }}</strong><span class="text-[11px] text-muted-foreground">listas para seguimiento</span></div>
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs"><span class="text-[10px] uppercase tracking-wider text-purple-700 font-black">Con banco</span><strong class="block text-2xl font-black text-purple-700 mt-2">{{ reporteResumen().conBanco }}</strong><span class="text-[11px] text-muted-foreground">banco cargado</span></div>
            <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs"><span class="text-[10px] uppercase tracking-wider text-amber-700 font-black">Estudiantes inscritos</span><strong class="block text-2xl font-black text-amber-700 mt-2">{{ reporteResumen().estudiantes }}</strong><span class="text-[11px] text-muted-foreground">suma de grupos</span></div>
          </div>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div class="bg-card border border-border rounded-2xl p-5 shadow-2xs"><div class="flex items-center justify-between border-b border-border pb-3 mb-3"><h2 class="text-sm font-black text-foreground">Distribución por estado</h2><span class="text-[11px] text-muted-foreground">{{ reporteResumen().total }} evaluaciones</span></div><div class="space-y-2">@for (estado of reporteEstados(); track estado.nombre) {<div class="flex items-center gap-3 text-xs"><span class="w-24 font-bold text-muted-foreground">{{ estado.nombre }}</span><div class="h-2 flex-1 rounded-full bg-muted overflow-hidden"><div class="h-full rounded-full bg-primary" [style.width.%]="estado.porcentaje"></div></div><strong class="w-8 text-right">{{ estado.total }}</strong></div>}</div></div>
            <div class="bg-card border border-border rounded-2xl p-5 shadow-2xs"><div class="flex items-center justify-between border-b border-border pb-3 mb-3"><h2 class="text-sm font-black text-foreground">Resumen por sede</h2><span class="text-[11px] text-muted-foreground">cobertura del alcance</span></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-2">@for (sede of reportePorSede(); track sede.nombre) {<div class="rounded-xl bg-muted/50 border border-border p-3 flex justify-between gap-2 text-xs"><span class="font-bold truncate">{{ sede.nombre }}</span><strong>{{ sede.total }}</strong></div>} @if (!reportePorSede().length) {<span class="text-xs text-muted-foreground">No existen registros para los filtros seleccionados.</span>}</div></div>
          </div>
          <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
            <div class="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-black text-foreground">Detalle de evaluaciones</h2>
                <p class="text-xs text-muted-foreground mt-1">Inspección de las evaluaciones programadas, su estado y cobertura de banco.</p>
              </div>
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-2.5 text-muted-foreground text-xs"></i>
                <input [(ngModel)]="busquedaReporte" placeholder="Buscar por código (ej. SIS-114), materia, docente o aula..." class="bg-muted border border-border rounded-xl pl-8 pr-7 py-2 text-xs outline-none w-80 focus:border-primary shadow-2xs" />
                @if (busquedaReporte) {
                  <button type="button" (click)="busquedaReporte = ''" class="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground text-xs cursor-pointer p-0.5">
                    <i class="pi pi-times"></i>
                  </button>
                }
              </div>
            </div>
            @if (cargandoReporte()) {
              <div class="p-10 text-center text-sm text-muted-foreground">
                <i class="pi pi-spinner pi-spin mr-2"></i>Cargando reporte...
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <th class="p-3">Materia / Grupo</th>
                      <th class="p-3">Docente titular</th>
                      <th class="p-3">Sede / Campus</th>
                      <th class="p-3">Carrera</th>
                      <th class="p-3">Parcial</th>
                      <th class="p-3">Fecha / Hora</th>
                      <th class="p-3 text-center">Banco</th>
                      <th class="p-3 text-center">Estado</th>
                      @if (esVerificador()) {
                        <th class="p-3 text-center">Examen Typst</th>
                      }
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (rol of rolesReporteFiltrados(); track rol.id) {
                      <tr class="hover:bg-muted/30">
                        <td class="p-3">
                          <span class="font-mono text-primary font-black">{{ rol.materiaCodigo }}</span>
                          <div class="font-bold text-foreground">{{ rol.materiaNombre }}</div>
                          <span class="text-[10px] text-muted-foreground">Grupo {{ rol.grupo }}</span>
                        </td>
                        <td class="p-3 font-medium uppercase">{{ rol.docenteNombre || 'Por asignar' }}</td>
                        <td class="p-3">
                          <div class="font-bold">{{ rol.sedeNombre }}</div>
                          <span class="text-[10px] text-muted-foreground">{{ rol.campus || 'Campus no informado' }}</span>
                        </td>
                        <td class="p-3 font-medium">{{ rol.carreraNombre }} <span class="text-[10px] text-muted-foreground">({{ rol.carreraCodigo }})</span></td>
                        <td class="p-3 whitespace-nowrap">{{ rol.tipoParcial }}</td>
                        <td class="p-3 whitespace-nowrap">
                          <div class="font-mono font-bold">{{ rol.fecha }}</div>
                          <span class="text-[10px] text-muted-foreground">{{ rol.horario || 'Horario no informado' }}</span>
                        </td>
                        <td class="p-3 text-center">
                          <span [class]="rol.bancoPreguntasCargado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'" class="px-2 py-1 rounded-lg text-[10px] font-black">
                            {{ rol.bancoPreguntasCargado ? 'Sí' : 'Pendiente' }}
                          </span>
                        </td>
                        <td class="p-3 text-center">
                          <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-[10px] font-black">
                            {{ etiquetaEstadoReporte(rol.estadoFlujo) }}
                          </span>
                        </td>
                        @if (esVerificador()) {
                          <td class="p-3 text-center">
                            @if (rol.bancoPreguntasCargado) {
                              <button
                                type="button"
                                (click)="previsualizarExamenTypst(rol)"
                                [disabled]="previsualizandoTypst() && rolPrevisualizando() === rol.id"
                                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 text-[11px] font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
                                title="Previsualizar examen generado por Typst (vista docente sin claves)">
                                <i class="pi" [class.pi-file-pdf]="!(previsualizandoTypst() && rolPrevisualizando() === rol.id)" [class.pi-spin]="previsualizandoTypst() && rolPrevisualizando() === rol.id" [class.pi-spinner]="previsualizandoTypst() && rolPrevisualizando() === rol.id"></i>
                                <span>{{ previsualizandoTypst() && rolPrevisualizando() === rol.id ? 'Generando...' : 'Ver examen' }}</span>
                              </button>
                            } @else {
                              <span class="text-[10px] text-muted-foreground italic font-medium">Sin banco</span>
                            }
                          </td>
                        }
                      </tr>
                    } @empty {
                      <tr>
                        <td [attr.colspan]="esVerificador() ? 9 : 8" class="p-10 text-center text-sm text-muted-foreground">
                          No hay evaluaciones para los filtros seleccionados.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </section>
      }

      <!-- ========================================================================= -->
      <!-- PESTAÑA 5: CONCILIACIÓN REMARK VS OMR -->
      <!-- ========================================================================= -->
      @if (tipoReporteActivo() === 'CONCILIACION_REMARK') {
        <section class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden print-area">
          <div class="p-5 border-b border-border bg-purple-50/60 dark:bg-purple-950/20 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-base font-black text-foreground uppercase tracking-wide">Conciliación Remark vs. OMR</h2>
              <p class="text-xs text-muted-foreground mt-1 max-w-3xl">Compara la lectura OMR del PDF contra las respuestas exportadas por Remark, usando únicamente el código del estudiante.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button (click)="exportarConciliacion()" [disabled]="!resultadosConciliacion().length" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                <i class="pi pi-file-excel"></i>Exportar conciliación
              </button>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-3 items-end">
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Referencia técnica del escaneo</label>
                <select [(ngModel)]="rolConciliacionId" (ngModelChange)="seleccionarRolConciliacion($event)" class="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer">
                  <option value="">Selecciona el rol de examen usado para este escaneo</option>
                  @for (rol of rolesConciliacionOrdenados(); track rol.id) {
                    <option [value]="rol.id">{{ rol.fecha }} · {{ rol.tipoParcial }} · {{ rol.id }}</option>
                  }
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Paso 1 · PDF escaneado para OMR</label>
                <div class="flex items-center gap-2">
                  <input #archivoOmrInput type="file" accept="application/pdf,.pdf" (change)="cargarArchivoOmr($event)" class="hidden" />
                  <button (click)="archivoOmrInput.click()" class="flex-1 text-left bg-muted border border-dashed border-purple-300 hover:border-purple-500 rounded-xl px-3 py-2 text-xs font-bold text-foreground cursor-pointer">
                    <i class="pi pi-file-pdf text-purple-700 mr-2"></i>{{ archivoOmrNombre() || 'Seleccionar PDF escaneado' }}
                  </button>
                  <button (click)="procesarPdfOmr()" [disabled]="!archivoOmr || !rolConciliacionId || cargandoOmr()" class="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-black whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    @if (cargandoOmr()) { <i class="pi pi-spinner pi-spin mr-1"></i> } @else { <i class="pi pi-play mr-1"></i> } Procesar OMR
                  </button>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Paso 2 · Archivo exportado desde Remark</label>
                <div class="flex items-center gap-2">
                  <input #archivoRemarkInput type="file" accept=".xlsx,.xls,.csv" (change)="cargarArchivoRemark($event)" class="hidden" />
                  <button (click)="archivoRemarkInput.click()" [disabled]="!omrProcesado()" class="flex-1 text-left bg-muted border border-dashed border-teal-300 hover:border-teal-500 rounded-xl px-3 py-2 text-xs font-bold text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    <i class="pi pi-file-excel text-teal-700 mr-2"></i>{{ archivoRemarkNombre() || 'Seleccionar Excel o CSV de Remark' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="max-w-sm space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Impresora utilizada (opcional)</label>
              <input type="text" [(ngModel)]="impresoraConciliacion" placeholder="Ej. HP-Laser-01" class="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none" />
              <p class="text-[10px] text-muted-foreground">Permite aplicar el ajuste OMR específico de esa impresora y campus.</p>
            </div>

            <div class="rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-xs text-purple-900 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span><i class="pi pi-info-circle mr-1"></i>Flujo: selecciona la evaluación, procesa el PDF escaneado y luego carga el Excel de Remark.</span>
              <span [class]="omrProcesado() ? 'text-emerald-700 font-black' : 'text-muted-foreground'"><i class="pi" [class.pi-check-circle]="omrProcesado()" [class.pi-clock]="!omrProcesado()"></i> OMR: {{ omrProcesado() ? 'procesado' : 'pendiente' }}</span>
              <span class="text-muted-foreground">La materia, grupo, fecha y nota no participan; solo se comparan COD_EST y PREG1–PREG30.</span>
            </div>

            @if (errorConciliacion()) {
              <div class="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 p-3 text-xs font-medium flex items-center gap-2"><i class="pi pi-exclamation-triangle"></i>{{ errorConciliacion() }}</div>
            }

            @if (resultadosConciliacion().length) {
              <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div class="rounded-xl border border-border bg-muted/30 p-3 text-center"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Registros</span><strong class="text-lg font-black text-foreground">{{ resumenConciliacion().total }}</strong></div>
                <div class="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-center"><span class="block text-[10px] uppercase font-bold text-emerald-700">Coinciden</span><strong class="text-lg font-black text-emerald-800">{{ resumenConciliacion().coinciden }}</strong></div>
                <div class="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-center"><span class="block text-[10px] uppercase font-bold text-amber-700">Diferencias</span><strong class="text-lg font-black text-amber-800">{{ resumenConciliacion().diferencias }}</strong></div>
                <div class="rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-center"><span class="block text-[10px] uppercase font-bold text-purple-700">Solo Remark</span><strong class="text-lg font-black text-purple-800">{{ resumenConciliacion().soloRemark }}</strong></div>
                <div class="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-center"><span class="block text-[10px] uppercase font-bold text-rose-700">Solo sistema</span><strong class="text-lg font-black text-rose-800">{{ resumenConciliacion().soloSistema }}</strong></div>
              </div>

              <div class="overflow-x-auto rounded-xl border border-border">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <th class="p-3">COD_EST</th><th class="p-3">Estudiante Remark</th><th class="p-3">Estudiante sistema</th><th class="p-3 text-center">Respuestas diferentes</th><th class="p-3 text-center">Resultado</th><th class="p-3 text-center">Detalle</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (resultado of resultadosConciliacion(); track resultado.codigoEstudiante) {
                      <tr class="hover:bg-muted/30 transition-colors">
                        <td class="p-3 font-mono font-black text-primary">{{ resultado.codigoEstudiante }}</td>
                        <td class="p-3 font-medium max-w-56 truncate">{{ resultado.nombreRemark || '—' }}</td>
                        <td class="p-3 font-medium max-w-56 truncate">{{ resultado.nombreSistema || '—' }}</td>
                        <td class="p-3 text-center font-mono font-black">{{ resultado.diferencias.length }}</td>
                        <td class="p-3 text-center"><span [class]="claseEstadoConciliacion(resultado.estado)" class="text-[9px] font-black px-2 py-1 rounded-lg uppercase whitespace-nowrap">{{ etiquetaEstadoConciliacion(resultado.estado) }}</span></td>
                        <td class="p-3 text-center"><button (click)="verDetalleConciliacion(resultado)" class="h-7 w-7 rounded-lg border border-border text-purple-700 hover:bg-purple-50 cursor-pointer"><i class="pi pi-eye text-xs"></i></button></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else if (!cargandoConciliacion()) {
              <div class="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-xs text-muted-foreground">
                <i class="pi pi-sync text-2xl text-purple-400"></i>
                <p class="mt-2 font-bold text-foreground">Procesa el PDF escaneado y carga el archivo exportado desde Remark.</p>
                <p class="mt-1">La conciliación se ejecutará cuando ambos datos estén disponibles; la materia no es necesaria.</p>
              </div>
            }
          </div>
        </section>

        @if (resultadoConciliacionSeleccionado(); as detalle) {
          <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div class="bg-card border border-border rounded-2xl max-w-5xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
              <div class="p-5 border-b border-border flex items-start justify-between gap-3">
                <div><h3 class="text-sm font-black text-foreground">Detalle de conciliación · {{ detalle.codigoEstudiante }}</h3><p class="text-xs text-muted-foreground">{{ detalle.nombreRemark || detalle.nombreSistema || 'Estudiante' }}</p></div>
                <button (click)="cerrarDetalleConciliacion()" class="text-muted-foreground hover:text-foreground cursor-pointer"><i class="pi pi-times"></i></button>
              </div>
              <div class="p-5 overflow-y-auto space-y-4">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-center">
                  <div class="rounded-xl border border-border bg-muted/30 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Resultado</span><strong [class]="claseEstadoConciliacion(detalle.estado)" class="text-xs">{{ etiquetaEstadoConciliacion(detalle.estado) }}</strong></div>
                  <div class="rounded-xl border border-border bg-muted/30 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Preguntas distintas</span><strong class="text-sm font-mono">{{ detalle.diferencias.length }}</strong></div>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  @for (pregunta of preguntasConciliacion(detalle); track pregunta.numero) {
                    <div [class]="pregunta.remark === pregunta.sistema ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-300 bg-rose-50'" class="rounded-lg border p-2 text-center">
                      <span class="block text-[10px] font-black text-muted-foreground">P{{ pregunta.numero }}</span>
                      <span class="block mt-1 text-xs font-mono font-black">{{ pregunta.remark || 'BLANK' }}</span>
                      <span class="block text-[9px] text-muted-foreground mt-1">Sistema: {{ pregunta.sistema || 'BLANK' }}</span>
                    </div>
                  }
                </div>
              </div>
              <div class="p-4 border-t border-border flex justify-end"><button (click)="cerrarDetalleConciliacion()" class="px-4 py-2 rounded-xl bg-muted hover:bg-border text-xs font-bold text-foreground cursor-pointer">Cerrar</button></div>
            </div>
          </div>
        }
      }

      @if (pdfUrlPrevisualizacion()) {
        <div class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 animate-fade-in" (click)="cerrarModalPrevisualizacionTypst()">
          <div class="h-[94vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-2xl flex flex-col" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/40 shrink-0">
              <div class="flex items-center gap-2">
                <i class="pi pi-file-pdf text-purple-700 text-lg"></i>
                <div>
                  <strong class="text-sm font-black text-foreground">Vista Previa Typst (Versión Docente)</strong>
                  <span class="text-xs text-muted-foreground ml-2">Examen formateado tal como lo previsualizó el docente</span>
                </div>
              </div>
              <button type="button" class="text-muted-foreground hover:text-foreground cursor-pointer p-1" (click)="cerrarModalPrevisualizacionTypst()">
                <i class="pi pi-times text-base"></i>
              </button>
            </div>
            <iframe [src]="pdfUrlPrevisualizacion()" class="flex-1 w-full border-none" title="Previsualización Typst Docente"></iframe>
          </div>
        </div>
      }

    </div>
  `
})
export class ReporteEvaluacionesComponent implements OnInit, OnDestroy {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly _roles = inject(RolExamenService);
  private readonly _omr = inject(OmrProcesamientoService);
  private readonly _gateway = inject(UnitepcGatewayService);
  private readonly _auth = inject(AuthService);
  private readonly _reportes = inject(ReportesService);
  private readonly _generacionTypst = inject(GeneracionTypstService);
  private readonly _sanitizer = inject(DomSanitizer);

  public readonly esDirectorCarrera = computed(
    () => this._auth.usuario()?.rol === 'DIRECTOR_CARRERA'
  );
  public readonly esVicerrector = computed(
    () => this._auth.usuario()?.rol === 'VICERRECTOR'
  );
  public readonly esVerificador = computed(
    () => this._auth.usuario()?.rol === 'VERIFICADOR'
  );
  public readonly puedeConciliarRemark = computed(() => {
    const rol = this._auth.usuario()?.rol;
    return rol === 'ADMINISTRADOR_SISTEMA' || rol === 'RESPONSABLE_EVALUACIONES';
  });
  public readonly esConsultaAcademica = computed(
    () => this.esDirectorCarrera() || this.esVicerrector()
  );

  public readonly previsualizandoTypst = signal(false);
  public readonly rolPrevisualizando = signal<string | null>(null);
  public readonly pdfUrlPrevisualizacion = signal<SafeResourceUrl | null>(null);
  private pdfPrevisualizacionObjectUrl: string | null = null;

  public sedes = signal<BranchOffice[]>([]);
  public carreras = signal<Career[]>([]);
  public cargandoSedes = signal(false);
  public cargandoCarreras = signal(false);

  public tipoReporteActivo = signal<TipoReporte>('REPORTE_EVALUACIONES');

  // Filtros globales
  public filtroSede = 'Todos';
  public filtroCarrera = 'Todos';
  public filtroParcial = 'Todos';
  public filtroModalidad = 'Todos';
  public filtroEstadoReporte = 'Todos';
  public filtroFecha = '';
  public filtroFechaInicio = '';
  public filtroFechaFin = '';
  public filtroAlcance = 'nacional';

  // 1. Reporte Operativo SIDOPA
  public rolesReporte = signal<RolExamenResponse[]>([]);
  public cargandoReporte = signal(false);
  public errorReporte = signal<string | null>(null);
  public reporteGeneradoEn = signal(new Date());
  public busquedaReporte = '';

  // 2. Control de Calidad
  public reporteCalidadResumen = signal<ReporteCalidadResumen | null>(null);
  public cargandoCalidad = signal<boolean>(false);
  public errorCalidad = signal<string | null>(null);
  public filtroCalidadEstado = 'TODOS';
  public busquedaCalidad = '';
  public itemCalidadSeleccionado = signal<ReporteCalidadItem | null>(null);
  public historialCalidadModal = signal<VerificacionHistorialDevolucion[]>([]);
  public cargandoHistorialCalidad = signal<boolean>(false);

  // 3. Cobertura de Bancos
  public reporteCoberturaResumen = signal<ReporteCoberturaBancosResumen | null>(null);
  public cargandoCobertura = signal<boolean>(false);
  public errorCobertura = signal<string | null>(null);
  public busquedaCobertura = '';

  // 4. Consolidado OMR
  public reporteConsolidadoResumen = signal<ReporteConsolidadoOmrResumen | null>(null);
  public cargandoConsolidado = signal<boolean>(false);
  public errorConsolidado = signal<string | null>(null);
  public busquedaConsolidado = '';

  // 5. Conciliación Remark
  public rolesConciliacion = signal<RolExamenResponse[]>([]);
  public rolConciliacionId = '';
  public archivoOmrNombre = signal<string | null>(null);
  public archivoRemarkNombre = signal<string | null>(null);
  public cargandoOmr = signal<boolean>(false);
  public omrProcesado = signal<boolean>(false);
  public cargandoConciliacion = signal<boolean>(false);
  public cargandoRolesConciliacion = signal<boolean>(false);
  public errorConciliacion = signal<string | null>(null);
  public resultadosConciliacion = signal<ResultadoConciliacion[]>([]);
  public resultadoConciliacionSeleccionado = signal<ResultadoConciliacion | null>(null);
  private filasRemark: FilaRemark[] = [];
  private lecturasOmr: OmrLecturaResponse[] = [];
  public archivoOmr: File | null = null;
  public impresoraConciliacion = '';

  public rolesConciliacionOrdenados = computed(() => [...this.rolesConciliacion()].sort((a, b) => {
    const fecha = (a.fecha || '').localeCompare(b.fecha || '');
    return fecha || (a.tipoParcial || '').localeCompare(b.tipoParcial || '') || a.id.localeCompare(b.id);
  }));

  public resumenConciliacion = computed(() => {
    const resultados = this.resultadosConciliacion();
    return {
      total: resultados.length,
      coinciden: resultados.filter(item => item.estado === 'COINCIDE').length,
      diferencias: resultados.filter(item => item.estado === 'DIFERENCIA_RESPUESTAS').length,
      soloRemark: resultados.filter(item => item.estado === 'SOLO_REMARK').length,
      soloSistema: resultados.filter(item => item.estado === 'SOLO_SISTEMA').length
    };
  });

  // Computed Calidad
  public resumenCalidad = computed(() => {
    return this.reporteCalidadResumen() || {
      totalExamenes: 0,
      aprobadosDirectos: 0,
      observadosYLuegoAprobados: 0,
      observadosPendientes: 0,
      pendientesRevision: 0,
      sinBanco: 0,
      porcentajeAprobadosDirectos: 0,
      porcentajeObservados: 0,
      items: []
    };
  });

  public itemsCalidadFiltrados = computed(() => {
    const resumen = this.reporteCalidadResumen();
    if (!resumen) return [];
    let items = resumen.items || [];
    if (this.filtroCalidadEstado !== 'TODOS') {
      items = items.filter(i => i.estadoCalidad === this.filtroCalidadEstado);
    }
    const texto = this.busquedaCalidad.trim().toLowerCase();
    if (texto) {
      items = items.filter(i => {
        const busq = `${i.materiaCodigo} ${i.materiaNombre} ${i.docenteNombre} ${i.docenteCi} ${i.grupo} ${i.carreraNombre} ${i.sedeNombre}`.toLowerCase();
        return busq.includes(texto);
      });
    }
    return [...items].sort((a, b) => {
      const cmp = (a.materiaCodigo || '').localeCompare(b.materiaCodigo || '', undefined, { numeric: true, sensitivity: 'base' });
      if (cmp !== 0) return cmp;
      return (a.grupo || '').localeCompare(b.grupo || '', undefined, { numeric: true, sensitivity: 'base' });
    });
  });

  // Computed Cobertura
  public resumenCobertura = computed(() => {
    return this.reporteCoberturaResumen() || {
      totalMaterias: 0,
      materiasConBanco: 0,
      materiasSinBanco: 0,
      porcentajeCobertura: 0,
      carreras: [],
      items: []
    };
  });

  public itemsCoberturaFiltrados = computed(() => {
    const resumen = this.reporteCoberturaResumen();
    if (!resumen) return [];
    let items = resumen.items || [];
    const texto = this.busquedaCobertura.trim().toLowerCase();
    if (texto) {
      items = items.filter(i => {
        const busq = `${i.materiaCodigo} ${i.materiaNombre} ${i.docenteNombre} ${i.docenteCi} ${i.carreraNombre} ${i.sedeNombre} ${i.grupo}`.toLowerCase();
        return busq.includes(texto);
      });
    }
    return items;
  });

  // Computed Consolidado
  public resumenConsolidado = computed(() => {
    return this.reporteConsolidadoResumen() || {
      totalExamenesCalificados: 0,
      totalInscritos: 0,
      totalCalificados: 0,
      totalAprobados: 0,
      totalReprobados: 0,
      promedioGeneral: 0,
      porcentajeAprobacionGeneral: 0,
      items: []
    };
  });

  public itemsConsolidadoFiltrados = computed(() => {
    const resumen = this.reporteConsolidadoResumen();
    if (!resumen) return [];
    let items = resumen.items || [];
    const texto = this.busquedaConsolidado.trim().toLowerCase();
    if (texto) {
      items = items.filter(i => {
        const busq = `${i.materiaCodigo} ${i.materiaNombre} ${i.docenteNombre} ${i.carreraNombre} ${i.sedeNombre} ${i.grupo}`.toLowerCase();
        return busq.includes(texto);
      });
    }
    return items;
  });

  public ngOnInit(): void {
    this.cargarSedes();
    this.actualizarReportePrincipal();
  }

  public cambiarPestana(tipo: TipoReporte): void {
    this.tipoReporteActivo.set(tipo);
    if (tipo === 'CALIDAD_VERIFICACION') {
      this.cargarReporteCalidad();
    } else if (tipo === 'COBERTURA_BANCOS') {
      this.cargarCoberturaBancos();
    } else if (tipo === 'CONSOLIDADO_OMR') {
      this.cargarConsolidadoOmr();
    } else if (tipo === 'REPORTE_EVALUACIONES') {
      this.cargarReporteEvaluacionesOperativo();
    }
  }

  public actualizarReportePrincipal(): void {
    const activo = this.tipoReporteActivo();
    if (activo === 'CALIDAD_VERIFICACION') {
      this.cargarReporteCalidad();
    } else if (activo === 'COBERTURA_BANCOS') {
      this.cargarCoberturaBancos();
    } else if (activo === 'CONSOLIDADO_OMR') {
      this.cargarConsolidadoOmr();
    } else if (activo === 'CONCILIACION_REMARK') {
      // Sin recarga automática
    } else {
      this.cargarReporteEvaluacionesOperativo();
    }
  }

  public cargarReporteEvaluacionesOperativo(): void {
    this.cargandoReporte.set(true);
    this.errorReporte.set(null);
    this._roles.listar().subscribe({
      next: roles => {
        this.rolesReporte.set(roles || []);
        this.reporteGeneradoEn.set(new Date());
        this.cargandoReporte.set(false);
      },
      error: error => {
        this.rolesReporte.set([]);
        this.cargandoReporte.set(false);
        this.errorReporte.set(error?.status === 403
          ? 'Tu usuario no tiene permiso para consultar este reporte.'
          : 'No se pudo cargar el reporte de evaluaciones. Verifica la conexión con el servidor.');
      }
    });
  }

  public cargarReporteCalidad(): void {
    this.cargandoCalidad.set(true);
    this.errorCalidad.set(null);
    this._reportes.obtenerReporteCalidad({
      sedeCodigo: this.filtroSede,
      carreraCodigo: this.filtroCarrera,
      tipoParcial: this.filtroParcial,
      estadoCalidad: this.filtroCalidadEstado,
      busqueda: this.busquedaCalidad
    }).subscribe({
      next: data => {
        this.reporteCalidadResumen.set(data);
        this.cargandoCalidad.set(false);
      },
      error: err => {
        this.cargandoCalidad.set(false);
        this.errorCalidad.set(err?.status === 403
          ? 'Tu usuario no tiene permisos para ver este reporte de calidad.'
          : 'No se pudo cargar el reporte de calidad. Verifica la conexión con el servidor.');
      }
    });
  }

  public cargarCoberturaBancos(): void {
    this.cargandoCobertura.set(true);
    this.errorCobertura.set(null);
    this._reportes.obtenerCoberturaBancos({
      sedeCodigo: this.filtroSede,
      carreraCodigo: this.filtroCarrera,
      tipoParcial: this.filtroParcial
    }).subscribe({
      next: data => {
        this.reporteCoberturaResumen.set(data);
        this.cargandoCobertura.set(false);
      },
      error: err => {
        this.cargandoCobertura.set(false);
        this.errorCobertura.set(err?.status === 403
          ? 'Tu usuario no tiene permisos para ver la cobertura de bancos.'
          : 'No se pudo cargar la cobertura de bancos. Verifica la conexión con el servidor.');
      }
    });
  }

  public cargarConsolidadoOmr(): void {
    this.cargandoConsolidado.set(true);
    this.errorConsolidado.set(null);
    this._reportes.obtenerConsolidadoOmr({
      sedeCodigo: this.filtroSede,
      carreraCodigo: this.filtroCarrera,
      tipoParcial: this.filtroParcial
    }).subscribe({
      next: data => {
        this.reporteConsolidadoResumen.set(data);
        this.cargandoConsolidado.set(false);
      },
      error: err => {
        this.cargandoConsolidado.set(false);
        this.errorConsolidado.set(err?.status === 403
          ? 'Tu usuario no tiene permisos para ver el consolidado OMR.'
          : 'No se pudo cargar el consolidado OMR. Verifica la conexión con el servidor.');
      }
    });
  }

  public filtrarCalidadEstado(estado: string): void {
    this.filtroCalidadEstado = estado;
    this.cargarReporteCalidad();
  }

  public abrirModalObservaciones(item: ReporteCalidadItem): void {
    this.itemCalidadSeleccionado.set(item);
    this.historialCalidadModal.set([]);
    this.cargandoHistorialCalidad.set(true);
    this._reportes.obtenerHistorialDevoluciones(item.rolExamenId).subscribe({
      next: (historial) => {
        this.historialCalidadModal.set(historial || []);
        this.cargandoHistorialCalidad.set(false);
      },
      error: (err) => {
        console.error('Error cargando historial de devoluciones:', err);
        this.cargandoHistorialCalidad.set(false);
      }
    });
  }

  public cerrarModalObservaciones(): void {
    this.itemCalidadSeleccionado.set(null);
    this.historialCalidadModal.set([]);
    this.cargandoHistorialCalidad.set(false);
  }

  public esOpcionCorrecta(pregunta: VerificacionPregunta, opcion: VerificacionOpcion): boolean {
    if (pregunta.tipoReactivo === 'VERDADERO_O_FALSO_COMPLEJAS') {
      return false;
    }
    const claves: string[] = (pregunta.respuestaCorrecta || '').toUpperCase().match(/[A-Z0-9]+/g) || [];
    return opcion.correcta || (!!opcion.letra && claves.includes(opcion.letra.trim().toUpperCase()));
  }

  public imagenDataUrl(valor?: string): string | null {
    const contenido = (valor || '').split('#', 1)[0].trim();
    if (!contenido) return null;
    const uri = contenido.startsWith('data:')
      ? contenido.replace(/,(.*)$/s, (_coincidencia, base64: string) => `,${base64.replace(/\s+/g, '')}`)
      : `data:image/png;base64,${contenido.replace(/\s+/g, '')}`;
    return /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(uri) ? uri : null;
  }

  public obtenerEtiquetaDictamen(estado: string): string {
    switch (estado) {
      case 'APROBADO_DIRECTO': return 'Aprobado Directo';
      case 'OBSERVADO_Y_APROBADO': return 'Observado y Aprobado';
      case 'OBSERVADO_PENDIENTE': return 'Observado Pendiente';
      case 'PENDIENTE_REVISION': return 'Pendiente de Revisión';
      case 'SIN_BANCO': return 'Sin Banco de Preguntas';
      default: return estado || 'Pendiente';
    }
  }

  public obtenerClaseDictamen(estado: string): string {
    switch (estado) {
      case 'APROBADO_DIRECTO':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      case 'OBSERVADO_Y_APROBADO':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      case 'OBSERVADO_PENDIENTE':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
      case 'PENDIENTE_REVISION':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'SIN_BANCO':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }

  public formatearFechaBoliviana(fechaStr?: string | Date | null): string {
    if (!fechaStr) return '—';
    try {
      const d = new Date(fechaStr);
      if (isNaN(d.getTime())) return String(fechaStr);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = d.getFullYear();
      const hora = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${anio} ${hora}:${min}`;
    } catch {
      return String(fechaStr);
    }
  }

  public parsearPreguntasObservadas(json?: string): Array<{ numero: string; motivo: string }> {
    if (!json || !json.trim() || json.trim() === '{}') return [];
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed)
          .filter(([_, val]) => val && String(val).trim() !== '')
          .map(([key, val]) => ({ numero: key, motivo: String(val) }))
          .sort((a, b) => (parseInt(a.numero, 10) || 0) - (parseInt(b.numero, 10) || 0));
      }
    } catch {
      // Formato no JSON
    }
    return [];
  }

  public exportarCalidadExcel(): void {
    const items = this.itemsCalidadFiltrados();
    if (!items.length) return;
    const filas = items.map(item => {
      const observacionesDetalle = (item.observaciones || [])
        .map((obs, idx) => `[Devolución #${idx + 1} - ${this.formatearFechaBoliviana(obs.fechaDevolucion)} - Por: ${obs.verificadoPor || 'N/A'}]: ${obs.observacionesGenerales || 'Sin motivo general'}`)
        .join(' | ');

      return {
        'Código Rol': item.rolExamenId,
        'Código Materia': item.materiaCodigo,
        'Materia': item.materiaNombre,
        'Grupo': item.grupo,
        'Sede': item.sedeNombre,
        'Campus': item.campus || 'N/A',
        'Carrera': item.carreraNombre,
        'Docente': item.docenteNombre || 'Por asignar',
        'CI Docente': item.docenteCi || '',
        'Parcial': item.tipoParcial,
        'Fecha Examen': item.fechaExamen,
        'Horario': item.horaExamen || '',
        'Estado Flujo': item.estadoFlujo,
        'Dictamen de Calidad': this.obtenerEtiquetaDictamen(item.estadoCalidad),
        'Total Observaciones': item.totalObservaciones,
        'Último Verificador': item.ultimoVerificador || '',
        'Fecha Última Obs': this.formatearFechaBoliviana(item.ultimaObservacionFecha),
        'Aprobado Por': item.aprobadoPor || '',
        'Fecha Aprobación': this.formatearFechaBoliviana(item.fechaAprobacion),
        'Historial Observaciones': observacionesDetalle || 'Ninguna'
      };
    });

    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Calidad de Verificacion');
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Reporte_Calidad_Verificacion_${fecha}.xlsx`);
  }

  public exportarCoberturaExcel(): void {
    const items = this.itemsCoberturaFiltrados();
    if (!items.length) return;
    const filas = items.map(item => ({
      'Código Rol': item.rolExamenId,
      'Sede': item.sedeNombre,
      'Carrera': item.carreraNombre,
      'Código Materia': item.materiaCodigo,
      'Materia': item.materiaNombre,
      'Grupo': item.grupo,
      'Semestre': item.semestre ? `${item.semestre}°` : '',
      'Docente': item.docenteNombre || 'Por asignar',
      'CI Docente': item.docenteCi || '',
      'Parcial': item.tipoParcial,
      'Fecha Examen': item.fechaExamen,
      'Tiene Banco': item.tieneBanco ? 'Sí' : 'No',
      'Estado Banco': item.estadoBanco,
      'Total Reactivos': item.totalReactivos || 0,
      'Fáciles': item.facilesCount || 0,
      'Medias': item.mediasCount || 0,
      'Difíciles': item.dificilesCount || 0,
      'Fecha Aprobación Banco': this.formatearFechaBoliviana(item.fechaAprobacionBanco)
    }));

    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Cobertura de Bancos');
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Reporte_Cobertura_Bancos_${fecha}.xlsx`);
  }

  public exportarConsolidadoExcel(): void {
    const items = this.itemsConsolidadoFiltrados();
    if (!items.length) return;
    const filas = items.map(item => ({
      'Código Rol': item.rolExamenId,
      'Sede': item.sedeNombre,
      'Carrera': item.carreraNombre,
      'Código Materia': item.materiaCodigo,
      'Materia': item.materiaNombre,
      'Grupo': item.grupo,
      'Docente': item.docenteNombre || 'Por asignar',
      'Parcial': item.tipoParcial,
      'Fecha Examen': item.fechaExamen,
      'Total Inscritos': item.totalInscritos,
      'Cartillas Calificadas': item.totalCalificados,
      'Promedio (/100)': item.promedioNota,
      'Aprobados': item.totalAprobados,
      'Reprobados': item.totalReprobados,
      '% Aprobación': `${item.porcentajeAprobacion}%`,
      'Sincronización SEA': item.estadoSincronizacionSea
    }));

    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Consolidado OMR');
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Reporte_Consolidado_OMR_${fecha}.xlsx`);
  }

  public exportarReportePrincipal(): void {
    const tipo = this.tipoReporteActivo();
    if (tipo === 'CONCILIACION_REMARK') {
      this.exportarConciliacion();
      return;
    }
    if (tipo === 'CALIDAD_VERIFICACION') {
      this.exportarCalidadExcel();
      return;
    }
    if (tipo === 'COBERTURA_BANCOS') {
      this.exportarCoberturaExcel();
      return;
    }
    if (tipo === 'CONSOLIDADO_OMR') {
      this.exportarConsolidadoExcel();
      return;
    }
    window.print();
  }

  public onSedeChange(codigoSede: string): void {
    if (codigoSede === 'Todos') {
      this.filtroSede = 'Todos';
      this.filtroCarrera = 'Todos';
      this.carreras.set([]);
      this.recargarReporteSegunPestana();
      return;
    }

    const sede = this.sedes().find(item => item.code === codigoSede);
    if (!sede) return;
    this.filtroSede = sede.code;
    this.filtroCarrera = this.esDirectorCarrera() ? '' : 'Todos';
    this.carreras.set([]);
    this.cargarCarreras(sede.code);
    this.recargarReporteSegunPestana();
  }

  public onCarreraChange(codigoCarrera: string): void {
    if (codigoCarrera === 'Todos') {
      this.filtroCarrera = 'Todos';
      this.recargarReporteSegunPestana();
      return;
    }
    if (this.carreras().some(item => item.careerCode === codigoCarrera)) {
      this.filtroCarrera = codigoCarrera;
      this.recargarReporteSegunPestana();
    }
  }

  public refrescarFiltros(): void {
    this.recargarReporteSegunPestana();
  }

  private recargarReporteSegunPestana(): void {
    const pestana = this.tipoReporteActivo();
    if (pestana === 'CALIDAD_VERIFICACION') {
      this.cargarReporteCalidad();
    } else if (pestana === 'COBERTURA_BANCOS') {
      this.cargarCoberturaBancos();
    } else if (pestana === 'CONSOLIDADO_OMR') {
      this.cargarConsolidadoOmr();
    } else if (pestana === 'REPORTE_EVALUACIONES') {
      // El filtrado en memoria se recalcula reactivamente
    }
  }

  private cargarSedes(): void {
    this.cargandoSedes.set(true);
    this._gateway.getBranchOffices().subscribe({
      next: sedes => {
        this.sedes.set(sedes || []);
        this.cargandoSedes.set(false);
        if (!this.esConsultaAcademica()) return;

        const sedeInicial = this._gateway.resolverSedeInicial(sedes || []);
        if (!sedeInicial) {
          this.filtroSede = '';
          this.filtroCarrera = '';
          return;
        }
        this.filtroSede = sedeInicial.code;
        this.cargarCarreras(sedeInicial.code);
      },
      error: () => {
        this.sedes.set([]);
        this.cargandoSedes.set(false);
        if (this.esDirectorCarrera()) {
          this.filtroSede = '';
          this.filtroCarrera = '';
        }
      }
    });
  }

  private cargarCarreras(codigoSede: string): void {
    this.cargandoCarreras.set(true);
    this._gateway.getCareers(codigoSede).subscribe({
      next: carreras => {
        this.carreras.set(carreras || []);
        this.cargandoCarreras.set(false);
        if (this.esDirectorCarrera()) {
          this.filtroCarrera = carreras?.[0]?.careerCode || '';
        } else if (this.esVicerrector()) {
          this.filtroCarrera = 'Todos';
        }
      },
      error: () => {
        this.carreras.set([]);
        this.cargandoCarreras.set(false);
        if (this.esDirectorCarrera()) this.filtroCarrera = '';
        if (this.esVicerrector()) this.filtroCarrera = 'Todos';
      }
    });
  }

  // Métodos Reporte Operativo SIDOPA
  public rolesReporteFiltrados(): RolExamenResponse[] {
    const texto = this.busquedaReporte.trim().toLowerCase();
    return this.rolesReporte()
      .filter(rol => {
        if (this.filtroSede !== 'Todos' && rol.sedeCodigo !== this.filtroSede) return false;
        if (this.filtroCarrera !== 'Todos' && this.filtroCarrera && rol.carreraCodigo !== this.filtroCarrera) return false;
        if (this.filtroParcial !== 'Todos' && rol.tipoParcial !== this.filtroParcial) return false;
        if (this.filtroEstadoReporte !== 'Todos' && rol.estadoFlujo !== this.filtroEstadoReporte) return false;
        if (this.filtroModalidad === 'CON_CARTILLA' && rol.modalidad !== 'PRESENCIAL_CARTILLA') return false;
        if (this.filtroModalidad === 'SIN_CARTILLA' && rol.modalidad === 'PRESENCIAL_CARTILLA') return false;
        if (this.filtroFechaInicio && rol.fecha < this.filtroFechaInicio) return false;
        if (this.filtroFechaFin && rol.fecha > this.filtroFechaFin) return false;
        if (this.filtroFecha && rol.fecha !== this.filtroFecha) return false;
        if (!texto) return true;
        return `${rol.materiaCodigo} ${rol.materiaNombre} ${rol.docenteNombre} ${rol.aula} ${rol.carreraNombre} ${rol.campus}`.toLowerCase().includes(texto);
      })
      .sort((a, b) => {
        const codA = (a.materiaCodigo || '').trim();
        const codB = (b.materiaCodigo || '').trim();
        const cmp = codA.localeCompare(codB, undefined, { numeric: true, sensitivity: 'base' });
        if (cmp !== 0) return cmp;
        return (a.grupo || '').localeCompare(b.grupo || '', undefined, { numeric: true, sensitivity: 'base' });
      });
  }

  public reporteResumen() {
    const filas = this.rolesReporteFiltrados();
    return {
      total: filas.length,
      generadas: filas.filter(rol => ['GENERADO', 'IMPRESO', 'ENTREGADO', 'DEVUELTO', 'PENDIENTE_NOTAS', 'CALIFICADO'].includes(rol.estadoFlujo)).length,
      conBanco: filas.filter(rol => rol.bancoPreguntasCargado).length,
      estudiantes: filas.reduce((total, rol) => total + (rol.estudiantesInscritosCount || 0), 0)
    };
  }

  public reporteEstados() {
    const filas = this.rolesReporteFiltrados();
    const total = filas.length || 1;
    const estados: Array<[string, RolExamenResponse['estadoFlujo']]> = [
      ['Programado', 'PROGRAMADO'], ['Validado', 'VALIDADO'], ['Generado', 'GENERADO'],
      ['Impreso', 'IMPRESO'], ['Entregado', 'ENTREGADO'], ['Devuelto', 'DEVUELTO'], ['Calificado', 'CALIFICADO']
    ];
    return estados.map(([nombre, codigo]) => {
      const cantidad = filas.filter(rol => rol.estadoFlujo === codigo).length;
      return { nombre, total: cantidad, porcentaje: Math.round((cantidad / total) * 100) };
    }).filter(item => item.total > 0);
  }

  public reportePorSede() { 
    return this.agruparReportePor(rol => rol.sedeNombre); 
  }

  private agruparReportePor(selector: (rol: RolExamenResponse) => string): Array<{ nombre: string; total: number }> {
    const conteo = new Map<string, number>();
    for (const rol of this.rolesReporteFiltrados()) {
      const nombre = selector(rol) || 'Sin dato';
      conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
    }
    return Array.from(conteo, ([nombre, total]) => ({ nombre, total })).sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));
  }

  public etiquetaEstadoReporte(estado: RolExamenResponse['estadoFlujo']): string {
    const etiquetas: Record<string, string> = {
      PROGRAMADO: 'Programado', VALIDADO: 'Validado', GENERADO: 'Generado', IMPRESO: 'Impreso',
      ENTREGADO: 'Entregado', DEVUELTO: 'Devuelto', PENDIENTE_NOTAS: 'Pendiente de notas',
      CALIFICADO: 'Calificado', CONFIRMADO: 'Confirmado', SUSPENDIDO: 'Suspendido'
    };
    return etiquetas[estado] || estado;
  }

  // Métodos Conciliación Remark
  public abrirConciliacionRemark(): void {
    if (!this.puedeConciliarRemark()) return;
    this.tipoReporteActivo.set('CONCILIACION_REMARK');
    this.errorConciliacion.set(null);
    if (!this.rolesConciliacion().length && !this.cargandoRolesConciliacion()) {
      this.cargandoRolesConciliacion.set(true);
      this._roles.listar().subscribe({
        next: roles => {
          this.rolesConciliacion.set(roles);
          if (!this.rolConciliacionId && roles.length > 0) {
            this.seleccionarRolConciliacion(roles[0].id);
          }
          this.cargandoRolesConciliacion.set(false);
        },
        error: () => {
          this.cargandoRolesConciliacion.set(false);
          this.errorConciliacion.set('No se pudieron consultar las evaluaciones del sistema.');
        }
      });
    }
  }

  public seleccionarRolConciliacion(rolId: string): void {
    this.rolConciliacionId = rolId;
    this.impresoraConciliacion = '';
    this.archivoOmr = null;
    this.archivoOmrNombre.set(null);
    this.omrProcesado.set(false);
    this.archivoRemarkNombre.set(null);
    this.filasRemark = [];
    this.lecturasOmr = [];
    this.resultadosConciliacion.set([]);
    this.errorConciliacion.set(null);
  }

  public cargarArchivoOmr(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] || null;
    input.value = '';
    this.archivoOmr = archivo;
    this.archivoOmrNombre.set(archivo?.name || null);
    this.omrProcesado.set(false);
    this.lecturasOmr = [];
    this.resultadosConciliacion.set([]);
    this.errorConciliacion.set(null);
    if (archivo && !(archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf'))) {
      this.archivoOmr = null;
      this.archivoOmrNombre.set(null);
      this.errorConciliacion.set('El archivo OMR debe ser un PDF escaneado.');
    }
  }

  public procesarPdfOmr(): void {
    if (!this.archivoOmr || !this.rolConciliacionId || this.cargandoOmr()) return;
    this.cargandoOmr.set(true);
    this.cargandoConciliacion.set(true);
    this.omrProcesado.set(false);
    this.resultadosConciliacion.set([]);
    this.errorConciliacion.set(null);
    this._omr.procesarLecturaConciliacion(this.rolConciliacionId, this.archivoOmr, this.impresoraConciliacion).subscribe({
      next: aceptado => this._esperarResultadoOmr(aceptado.jobId),
      error: error => {
        this.cargandoOmr.set(false);
        this.cargandoConciliacion.set(false);
        this.errorConciliacion.set(error?.error?.error || error?.error?.message || 'No se pudo enviar el PDF escaneado al motor OMR.');
      }
    });
  }

  public cargarArchivoRemark(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    input.value = '';

    this.archivoRemarkNombre.set(archivo.name);
    this.errorConciliacion.set(null);
    this.resultadosConciliacion.set([]);
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const contenido = lector.result;
        if (!(contenido instanceof ArrayBuffer)) throw new Error('No se pudo leer el archivo.');
        const libro = XLSX.read(new Uint8Array(contenido), { type: 'array', raw: false });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        if (!hoja) throw new Error('El archivo no contiene una hoja de datos.');
        if (!this.omrProcesado()) throw new Error('Primero procesa el PDF escaneado con OMR y luego carga el archivo de Remark.');
        this.filasRemark = this._leerFilasRemark(hoja);
        if (!this.filasRemark.length) throw new Error('No se encontraron filas válidas con COD_EST.');
        this._ejecutarConciliacion();
      } catch (error) {
        this.filasRemark = [];
        this.errorConciliacion.set(error instanceof Error ? error.message : 'No se pudo interpretar el archivo de Remark.');
      }
    };
    lector.onerror = () => this.errorConciliacion.set('No se pudo leer el archivo de Remark.');
    lector.readAsArrayBuffer(archivo);
  }

  public verDetalleConciliacion(resultado: ResultadoConciliacion): void {
    this.resultadoConciliacionSeleccionado.set(resultado);
  }

  public cerrarDetalleConciliacion(): void {
    this.resultadoConciliacionSeleccionado.set(null);
  }

  public preguntasConciliacion(resultado: ResultadoConciliacion): DiferenciaPregunta[] {
    return Array.from({ length: 30 }, (_, indice) => {
      const numero = indice + 1;
      return {
        numero,
        remark: resultado.respuestasRemark[String(numero)] || '',
        sistema: resultado.respuestasSistema[String(numero)] || ''
      };
    });
  }

  public etiquetaEstadoConciliacion(estado: EstadoConciliacion): string {
    switch (estado) {
      case 'COINCIDE': return 'Coincide';
      case 'DIFERENCIA_RESPUESTAS': return 'Diferencia en respuestas';
      case 'SOLO_REMARK': return 'Solo Remark';
      case 'SOLO_SISTEMA': return 'Solo sistema';
    }
  }

  public claseEstadoConciliacion(estado: EstadoConciliacion): string {
    switch (estado) {
      case 'COINCIDE': return 'bg-emerald-100 text-emerald-800';
      case 'DIFERENCIA_RESPUESTAS': return 'bg-amber-100 text-amber-800';
      case 'SOLO_REMARK': return 'bg-purple-100 text-purple-800';
      case 'SOLO_SISTEMA': return 'bg-rose-100 text-rose-800';
    }
  }

  public exportarConciliacion(): void {
    const filas = this.resultadosConciliacion().map(resultado => {
      const fila: Record<string, string | number | null> = {
        'COD_EST': resultado.codigoEstudiante,
        'NOMBRE_REMARK': resultado.nombreRemark,
        'NOMBRE_SISTEMA': resultado.nombreSistema,
        'ESTADO': this.etiquetaEstadoConciliacion(resultado.estado),
        'PREGUNTAS_DIFERENTES': resultado.diferencias.length
      };
      for (const pregunta of this.preguntasConciliacion(resultado)) {
        fila[`PREG${pregunta.numero}_REMARK`] = pregunta.remark || 'BLANK';
        fila[`PREG${pregunta.numero}_SISTEMA`] = pregunta.sistema || 'BLANK';
      }
      return fila;
    });
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Conciliacion');
    XLSX.writeFile(libro, `Conciliacion_Remark_OMR_${this.rolConciliacionId || 'evaluacion'}.xlsx`);
  }

  private _ejecutarConciliacion(): void {
    if (!this.rolConciliacionId || !this.filasRemark.length || !this.omrProcesado()) return;
    this.cargandoConciliacion.set(true);
    this.errorConciliacion.set(null);
    this.resultadosConciliacion.set(this._compararFilas(this.filasRemark, this.lecturasOmr));
    this.cargandoConciliacion.set(false);
  }

  private _esperarResultadoOmr(jobId: string): void {
    this._omr.consultar(jobId).subscribe({
      next: resultado => {
        if (resultado.estado === 'EN_COLA') {
          window.setTimeout(() => this._esperarResultadoOmr(jobId), 1200);
          return;
        }
        if (resultado.estado !== 'COMPLETADO') {
          this.cargandoOmr.set(false);
          this.cargandoConciliacion.set(false);
          this.errorConciliacion.set(resultado.mensaje || 'El motor OMR no pudo completar la lectura del PDF.');
          return;
        }
        this.lecturasOmr = resultado.resultados || [];
        this.cargandoOmr.set(false);
        this.cargandoConciliacion.set(false);
        this.omrProcesado.set(true);
        if (!this.lecturasOmr.length) {
          this.errorConciliacion.set('El PDF terminó de procesarse, pero no se detectaron páginas para leer.');
          return;
        }
        if (this.filasRemark.length) this._ejecutarConciliacion();
      },
      error: () => window.setTimeout(() => this._esperarResultadoOmr(jobId), 1500)
    });
  }

  private _leerFilasRemark(hoja: XLSX.WorkSheet): FilaRemark[] {
    const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: '', raw: false });
    const codigos = new Set<string>();
    return filas.map((fila, indice) => {
      const valor = (alias: string[]): string => {
        const clave = Object.keys(fila).find(actual => alias.includes(this._normalizarCabecera(actual)));
        return clave ? String(fila[clave] ?? '').trim() : '';
      };
      const codigoEstudiante = this._normalizarCodigo(valor(['CODEST', 'CODIGOESTUDIANTE', 'CODIGOALUMNO']));
      if (!codigoEstudiante) throw new Error(`La fila ${indice + 2} no contiene COD_EST.`);
      if (codigos.has(codigoEstudiante)) throw new Error(`El archivo contiene COD_EST duplicado: ${codigoEstudiante}.`);
      codigos.add(codigoEstudiante);
      const respuestas: Record<string, string> = {};
      for (let pregunta = 1; pregunta <= 30; pregunta++) {
        const clave = Object.keys(fila).find(actual => this._normalizarCabecera(actual) === `PREG${pregunta}`);
        respuestas[String(pregunta)] = this._normalizarRespuesta(clave ? fila[clave] : '');
      }
      return {
        codigoEstudiante,
        nombre: valor(['NOMBREEST', 'NOMBRECOMPLETO', 'NOMBREALUMNO']),
        respuestas
      };
    });
  }

  private _compararFilas(filasRemark: FilaRemark[], lecturas: OmrLecturaResponse[]): ResultadoConciliacion[] {
    const remarkPorCodigo = new Map(filasRemark.map(fila => [fila.codigoEstudiante, fila]));
    const sistemaPorCodigo = new Map(lecturas
      .map(lectura => {
        const candidatos = [lectura.codigoEstudiante, ...(lectura.codigoOcr || [])]
          .map(candidato => this._normalizarCodigo(candidato))
          .filter(Boolean);
        const codigo = candidatos.find(candidato => remarkPorCodigo.has(candidato)) || candidatos[0] || '';
        return [codigo, lectura] as const;
      })
      .filter(([codigo]) => !!codigo));
    const codigos = [...new Set([...remarkPorCodigo.keys(), ...sistemaPorCodigo.keys()])].sort();
    return codigos.map(codigoEstudiante => {
      const remark = remarkPorCodigo.get(codigoEstudiante);
      const sistema = sistemaPorCodigo.get(codigoEstudiante);
      const respuestasRemark = remark?.respuestas || {};
      const respuestasSistema = sistema ? this._respuestasSistema(sistema) : {};
      const diferencias = sistema && remark ? Array.from({ length: 30 }, (_, indice) => indice + 1)
        .map(numero => ({ numero, remark: respuestasRemark[String(numero)] || '', sistema: respuestasSistema[String(numero)] || '' }))
        .filter(item => item.remark !== item.sistema) : [];
      let estado: EstadoConciliacion;
      if (!remark) estado = 'SOLO_SISTEMA';
      else if (!sistema) estado = 'SOLO_REMARK';
      else if (diferencias.length) estado = 'DIFERENCIA_RESPUESTAS';
      else estado = 'COINCIDE';
      return {
        codigoEstudiante,
        nombreRemark: remark?.nombre || '',
        nombreSistema: sistema?.estudianteNombre || '',
        estado,
        diferencias,
        respuestasRemark,
        respuestasSistema
      };
    });
  }

  private _respuestasSistema(lectura: OmrLecturaResponse): Record<string, string> {
    return Object.fromEntries(Object.entries(lectura.respuestas || {})
      .map(([pregunta, respuesta]) => [pregunta, this._normalizarRespuesta(respuesta)]));
  }

  private _normalizarCabecera(valor: unknown): string {
    return String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  private _normalizarCodigo(valor: unknown): string {
    const texto = String(valor ?? '').trim();
    return /^\d+[.,]0+$/.test(texto) ? texto.replace(/[.,]0+$/, '') : texto.replace(/\s+/g, '');
  }

  private _normalizarRespuesta(valor: unknown): string {
    const texto = String(valor ?? '').trim().toUpperCase();
    if (!texto || ['BLANK', 'BLANCO', 'VACIO', 'VACÍA', 'VACIA', '—', '-'].includes(texto)) return '';
    return [...new Set(texto.match(/[A-E]/g) || [])].sort().join('');
  }

  public imprimirReporte(): void {
    window.print();
  }

  public previsualizarExamenTypst(rol: RolExamenResponse): void {
    if (!this.esVerificador() || !rol.bancoPreguntasCargado) return;
    this.rolPrevisualizando.set(rol.id);
    this.previsualizandoTypst.set(true);
    this._reportes.solicitarPrevisualizacionTypst(rol.id).subscribe({
      next: resultado => {
        if (resultado.estado === 'COMPLETADO') {
          this.cargarPdfPrevisualizacion(resultado);
        } else {
          this.esperarPdfPrevisualizacion(resultado.jobId);
        }
      },
      error: err => {
        this.previsualizandoTypst.set(false);
        this.rolPrevisualizando.set(null);
        alert(err?.error?.mensaje || err?.error?.message || 'No se pudo generar la previsualización del examen.');
      }
    });
  }

  private esperarPdfPrevisualizacion(jobId: string): void {
    this._generacionTypst.esperarResultado(jobId, 1500, 80).subscribe({
      next: resultado => {
        if (resultado.estado === 'COMPLETADO') {
          this.cargarPdfPrevisualizacion(resultado);
        } else {
          this.previsualizandoTypst.set(false);
          this.rolPrevisualizando.set(null);
          alert(resultado.mensaje || 'Typst no pudo generar la previsualización del examen.');
        }
      },
      error: err => {
        this.previsualizandoTypst.set(false);
        this.rolPrevisualizando.set(null);
        alert(err?.error?.mensaje || 'Error al esperar la generación del PDF.');
      }
    });
  }

  private cargarPdfPrevisualizacion(resultado: any): void {
    this.previsualizandoTypst.set(false);
    this.rolPrevisualizando.set(null);
    const path = resultado?.variantes?.[0]?.archivoPdfPath;
    if (!path) {
      alert('La previsualización finalizó sin archivo PDF generado.');
      return;
    }
    this._generacionTypst.descargarArchivo(path).subscribe({
      next: blob => {
        this.cerrarModalPrevisualizacionTypst();
        this.pdfPrevisualizacionObjectUrl = URL.createObjectURL(blob);
        this.pdfUrlPrevisualizacion.set(this._sanitizer.bypassSecurityTrustResourceUrl(this.pdfPrevisualizacionObjectUrl));
      },
      error: () => {
        alert('No se pudo descargar el archivo PDF para la visualización.');
      }
    });
  }

  public cerrarModalPrevisualizacionTypst(): void {
    if (this.pdfPrevisualizacionObjectUrl) {
      URL.revokeObjectURL(this.pdfPrevisualizacionObjectUrl);
      this.pdfPrevisualizacionObjectUrl = null;
    }
    this.pdfUrlPrevisualizacion.set(null);
  }

  public ngOnDestroy(): void {
    this.cerrarModalPrevisualizacionTypst();
  }
}
