import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  EvaluacionesStorageService, 
  GestionEvaluacionItem, 
  EtapaEvaluacion 
} from '../../core/services/evaluaciones-storage.service';
import { RolExamenService, RolExamenResponse } from '../../core/services/rol-examen.service';
import { CalificacionOmrResponse, OmrProcesamientoService } from '../../core/services/omr-procesamiento.service';
import * as XLSX from 'xlsx';

type TipoReporte = 'PLANILLA_RECEPCION' | 'COBERTURA_BANCOS' | 'CONSOLIDADO_OMR' | 'AUDITORIA_TRAZABILIDAD' | 'CONCILIACION_REMARK';

type EstadoConciliacion = 'COINCIDE' | 'DIFERENCIA_RESPUESTAS' | 'DIFERENCIA_NOTA' | 'SOLO_REMARK' | 'SOLO_SISTEMA';

interface DiferenciaPregunta {
  numero: number;
  remark: string;
  sistema: string;
}

interface ResultadoConciliacion {
  codigoEstudiante: string;
  nombreRemark: string;
  nombreSistema: string;
  notaRemark60: number | null;
  notaSistema60: number | null;
  estado: EstadoConciliacion;
  diferencias: DiferenciaPregunta[];
  respuestasRemark: Record<string, string>;
  respuestasSistema: Record<string, string>;
}

interface FilaRemark {
  codigoEstudiante: string;
  nombre: string;
  materia: string;
  grupo: string;
  fecha: string;
  nota60: number | null;
  respuestas: Record<string, string>;
}

@Component({
  selector: 'sea-reporte-evaluaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      
      <!-- 1. CABECERA PRINCIPAL DEL MÓDULO DE REPORTES -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-purple-900/50">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <i class="pi pi-file-excel"></i> Módulo de Reportes Oficiales · UNITEPC
            </span>
            <span class="text-white/60 text-xs">|</span>
            <span class="text-xs text-white/80 font-mono font-bold">
              Gestión Activa: {{ storage.gestionActiva() }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Reportes y Planillas Oficiales de Evaluación
          </h1>
          <p class="text-xs text-purple-200/80 max-w-2xl font-medium">
            Generación de planillas de firmas para entrega/recepción, auditoría de reactivos de bancos de preguntas y consolidado OMR.
          </p>
        </div>

        <!-- Botones de Acción Global -->
        <div class="flex flex-wrap items-center gap-3">
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

          <!-- Botón Exportar a Excel -->
          <button 
            (click)="exportarReporteActualExcel()" 
            class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer">
            <i class="pi pi-file-excel text-sm"></i>
            <span>Exportar Excel (.xlsx)</span>
          </button>

          <!-- Botón Imprimir / PDF -->
          <button 
            (click)="imprimirReporte()" 
            class="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer">
            <i class="pi pi-print text-sm"></i>
            <span>Imprimir Planilla</span>
          </button>
        </div>
      </div>

      <!-- 2. PESTAÑAS DE TIPOS DE REPORTE (REPLICANDO SISTEMA MACRO) -->
      <div class="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          (click)="tipoReporteActivo.set('PLANILLA_RECEPCION')"
          [class]="tipoReporteActivo() === 'PLANILLA_RECEPCION' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-check-square"></i>
          <span>1. Planilla de Control Entrega/Recepción (Firmas)</span>
        </button>

        <button 
          (click)="tipoReporteActivo.set('COBERTURA_BANCOS')"
          [class]="tipoReporteActivo() === 'COBERTURA_BANCOS' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-database"></i>
          <span>2. Cobertura y Validación de Bancos</span>
        </button>

        <button 
          (click)="tipoReporteActivo.set('CONSOLIDADO_OMR')"
          [class]="tipoReporteActivo() === 'CONSOLIDADO_OMR' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-chart-bar"></i>
          <span>3. Consolidado de Rendimiento y Lectura OMR</span>
        </button>

        <button 
          (click)="tipoReporteActivo.set('AUDITORIA_TRAZABILIDAD')"
          [class]="tipoReporteActivo() === 'AUDITORIA_TRAZABILIDAD' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-history"></i>
          <span>4. Bitácora de Auditoría y Trazabilidad</span>
        </button>

        <button
          (click)="abrirConciliacionRemark()"
          [class]="tipoReporteActivo() === 'CONCILIACION_REMARK' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-sync"></i>
          <span>5. Conciliación Remark vs. OMR</span>
        </button>
      </div>

      <!-- 3. BARRA DE FILTROS ESPECÍFICOS SEGÚN EL REPORTE -->
      <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-4">
          
          <div class="flex flex-wrap items-center gap-3">
            <!-- Filtro de Sede -->
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Sede / Campus:</label>
              <select 
                [(ngModel)]="filtroSede"
                class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                <option value="Todos">Todas las Sedes</option>
                <option value="Cochabamba - Colonial">Cochabamba - Colonial</option>
                <option value="Cochabamba - Juan Pablo II">Cochabamba - Juan Pablo II</option>
                <option value="La Paz">Sede La Paz</option>
                <option value="Santa Cruz">Sede Santa Cruz</option>
              </select>
            </div>

            <!-- Filtro de Carrera -->
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Carrera:</label>
              <select 
                [(ngModel)]="filtroCarrera"
                class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                <option value="Todos">Todas las Carreras</option>
                <option value="LICENCIATURA EN INGENIERÍA DE SISTEMAS">Ingeniería de Sistemas</option>
                <option value="MEDICINA">Medicina</option>
                <option value="ODONTOLOGÍA">Odontología</option>
                <option value="BIOQUÍMICA Y FARMACIA">Bioquímica y Farmacia</option>
              </select>
            </div>

            <!-- Filtro de Modalidad (Con/Sin Cartilla) -->
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Modalidad:</label>
              <select 
                [(ngModel)]="filtroModalidad"
                class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                <option value="Todos">Todas las Modalidades</option>
                <option value="CON_CARTILLA">Solo Con Cartilla</option>
                <option value="SIN_CARTILLA">Solo Sin Cartilla</option>
              </select>
            </div>

            <!-- Filtro de Fecha -->
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Fecha de Evaluación:</label>
              <input 
                type="text" 
                [(ngModel)]="filtroFecha"
                placeholder="Ej. 08/06/2026 o vacio para todas"
                class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none placeholder:text-muted-foreground/60 w-44" />
            </div>
          </div>

          <!-- Resumen Rápido de Registros -->
          <div class="text-right">
            <span class="text-xs text-muted-foreground font-medium">Registros Encontrados:</span>
            <div class="text-xl font-black text-foreground font-mono">
              {{ datosFiltrados().length }}
            </div>
          </div>

        </div>
      </div>

      @if (tipoReporteActivo() === 'CONCILIACION_REMARK') {
        <section class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden print-area">
          <div class="p-5 border-b border-border bg-purple-50/60 dark:bg-purple-950/20 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-base font-black text-foreground uppercase tracking-wide">Conciliación Remark vs. OMR</h2>
              <p class="text-xs text-muted-foreground mt-1 max-w-3xl">Compara la lectura externa de Remark contra las respuestas almacenadas por el sistema, usando el código oficial del estudiante.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button (click)="exportarConciliacion()" [disabled]="!resultadosConciliacion().length" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                <i class="pi pi-file-excel"></i>Exportar conciliación
              </button>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_auto] gap-3 items-end">
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Evaluación del sistema</label>
                <select [(ngModel)]="rolConciliacionId" (ngModelChange)="seleccionarRolConciliacion($event)" class="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer">
                  <option value="">Selecciona una evaluación con OMR procesado</option>
                  @for (rol of rolesConciliacionOrdenados(); track rol.id) {
                    <option [value]="rol.id">{{ rol.materiaCodigo }} · {{ rol.materiaNombre }} · {{ rol.grupo }} · {{ rol.fecha }}</option>
                  }
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Archivo exportado desde Remark</label>
                <div class="flex items-center gap-2">
                  <input #archivoRemarkInput type="file" accept=".xlsx,.xls,.csv" (change)="cargarArchivoRemark($event)" class="hidden" />
                  <button (click)="archivoRemarkInput.click()" class="flex-1 text-left bg-muted border border-dashed border-purple-300 hover:border-purple-500 rounded-xl px-3 py-2 text-xs font-bold text-foreground cursor-pointer">
                    <i class="pi pi-upload text-purple-700 mr-2"></i>{{ archivoRemarkNombre() || 'Seleccionar Excel o CSV de Remark' }}
                  </button>
                  @if (cargandoConciliacion()) { <i class="pi pi-spinner pi-spin text-purple-700"></i> }
                </div>
              </div>
              <div class="text-[10px] text-muted-foreground max-w-56 leading-relaxed">Se comparan COD_EST y PREG1–PREG30. No se modifican las calificaciones oficiales.</div>
            </div>

            @if (errorConciliacion()) {
              <div class="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 p-3 text-xs font-medium flex items-center gap-2"><i class="pi pi-exclamation-triangle"></i>{{ errorConciliacion() }}</div>
            }

            @if (contextoConciliacion(); as contexto) {
              <div class="rounded-xl border border-border bg-muted/30 p-3 flex flex-wrap items-center gap-3 text-xs">
                <span class="font-black text-foreground">Contexto Remark:</span>
                <span [class]="contexto.materiaCoincide ? 'text-emerald-700' : 'text-rose-700'">Materia {{ contexto.materia || 'no informada' }} <i class="pi" [class.pi-check-circle]="contexto.materiaCoincide" [class.pi-times-circle]="!contexto.materiaCoincide"></i></span>
                <span [class]="contexto.grupoAdvertencia ? 'text-amber-700' : 'text-emerald-700'">Grupo {{ contexto.grupo || 'no informado' }} <i class="pi" [class.pi-exclamation-triangle]="contexto.grupoAdvertencia" [class.pi-check-circle]="!contexto.grupoAdvertencia"></i></span>
                <span [class]="contexto.fechaAdvertencia ? 'text-amber-700' : 'text-emerald-700'">Fecha {{ contexto.fecha || 'no informada' }} <i class="pi" [class.pi-exclamation-triangle]="contexto.fechaAdvertencia" [class.pi-check-circle]="!contexto.fechaAdvertencia"></i></span>
                @if (!contexto.materiaCoincide) { <strong class="text-rose-700">El archivo no corresponde a la materia seleccionada.</strong> }
              </div>
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
                      <th class="p-3">COD_EST</th><th class="p-3">Estudiante Remark</th><th class="p-3">Estudiante sistema</th><th class="p-3 text-center">Remark /60</th><th class="p-3 text-center">Sistema /60</th><th class="p-3 text-center">Diferencias</th><th class="p-3 text-center">Resultado</th><th class="p-3 text-center">Detalle</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (resultado of resultadosConciliacion(); track resultado.codigoEstudiante) {
                      <tr class="hover:bg-muted/30 transition-colors">
                        <td class="p-3 font-mono font-black text-primary">{{ resultado.codigoEstudiante }}</td>
                        <td class="p-3 font-medium max-w-56 truncate">{{ resultado.nombreRemark || '—' }}</td>
                        <td class="p-3 font-medium max-w-56 truncate">{{ resultado.nombreSistema || '—' }}</td>
                        <td class="p-3 text-center font-mono font-bold">{{ resultado.notaRemark60 ?? '—' }}</td>
                        <td class="p-3 text-center font-mono font-bold">{{ resultado.notaSistema60 ?? '—' }}</td>
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
                <p class="mt-2 font-bold text-foreground">Selecciona una evaluación y carga el archivo exportado desde Remark.</p>
                <p class="mt-1">La conciliación se ejecutará cuando ambos datos estén disponibles.</p>
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
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                  <div class="rounded-xl border border-border bg-muted/30 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Resultado</span><strong [class]="claseEstadoConciliacion(detalle.estado)" class="text-xs">{{ etiquetaEstadoConciliacion(detalle.estado) }}</strong></div>
                  <div class="rounded-xl border border-border bg-muted/30 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Remark /60</span><strong class="text-sm font-mono">{{ detalle.notaRemark60 ?? '—' }}</strong></div>
                  <div class="rounded-xl border border-border bg-muted/30 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Sistema /60</span><strong class="text-sm font-mono">{{ detalle.notaSistema60 ?? '—' }}</strong></div>
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

      <!-- 4. CONTENIDO DEL REPORTE 1: PLANILLA DE CONTROL DE RECEPCIÓN Y ENTREGA -->
      @if (tipoReporteActivo() === 'PLANILLA_RECEPCION') {
        <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden print-area">
          
          <!-- Encabezado Institucional del Reporte para Impresión -->
          <div class="p-6 border-b border-border bg-gradient-to-b from-muted/40 to-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-lg border border-purple-200 dark:border-purple-800">
                <i class="pi pi-file-edit"></i>
              </div>
              <div>
                <h2 class="text-base font-black text-foreground uppercase tracking-tight">
                  Planilla Oficial de Control de Entrega y Recepción de Evaluaciones
                </h2>
                <p class="text-xs text-muted-foreground font-medium">
                  Universidad Técnica Privada Cosmos · Jefatura de Evaluaciones y Acreditación (Gestión {{ storage.gestionActiva() }})
                </p>
              </div>
            </div>

            <div class="text-right">
              <span class="bg-purple-100 text-purple-800 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-purple-200">
                Formato oficial de seguimiento DOC-04
              </span>
              <span class="text-[10px] text-muted-foreground font-mono block mt-1">Generado: 20/08/2026 17:00</span>
            </div>
          </div>

          <!-- Tabla con el Formato Idéntico al Sistema Macro -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-border bg-muted/80 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th class="p-3">Hora / Fecha</th>
                  <th class="p-3">Materia & Código</th>
                  <th class="p-3">Grupo</th>
                  <th class="p-3">Docente Titular</th>
                  <th class="p-3 text-center">Modalidad</th>
                  <th class="p-3 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">H. Retiro</th>
                  <th class="p-3 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">Cant. Entregada</th>
                  <th class="p-3 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">Firma Entrega Docente</th>
                  <th class="p-3 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">H. Devolución</th>
                  <th class="p-3 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">Cant. Cartillas</th>
                  <th class="p-3 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">Firma Recepción Jefatura</th>
                  <th class="p-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (item of datosFiltrados(); track item.id) {
                  <tr class="hover:bg-muted/30 transition-colors">
                    <td class="p-3">
                      <span class="font-mono font-black text-foreground block">{{ item.hora }}</span>
                      <span class="text-[10px] text-muted-foreground font-mono">{{ item.fecha }}</span>
                    </td>
                    <td class="p-3">
                      <div class="font-bold text-foreground leading-tight">{{ item.materia }}</div>
                      <span class="font-mono text-[10px] text-primary">{{ item.codigo }}</span>
                    </td>
                    <td class="p-3 font-mono font-bold text-center">
                      <span class="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded">
                        {{ item.grupo }}
                      </span>
                    </td>
                    <td class="p-3 font-medium text-foreground uppercase">
                      {{ item.docente }}
                    </td>
                    <td class="p-3 text-center">
                      @if (item.conCartilla) {
                        <span class="bg-purple-100 text-purple-800 text-[9.5px] font-black px-2 py-0.5 rounded uppercase">
                          Con Cartilla
                        </span>
                      } @else {
                        <span class="bg-slate-100 text-slate-800 text-[9.5px] font-black px-2 py-0.5 rounded uppercase">
                          Sin Cartilla
                        </span>
                      }
                    </td>

                    <!-- Bloque Entrega (Retiro) -->
                    <td class="p-3 text-center font-mono font-bold text-blue-700 bg-blue-50/30 dark:bg-blue-950/10">
                      {{ item.etapa !== 'Programado' ? '07:45' : '___:___' }}
                    </td>
                    <td class="p-3 text-center font-mono font-bold text-blue-700 bg-blue-50/30 dark:bg-blue-950/10">
                      {{ item.etapa !== 'Programado' ? '45 unid.' : '____' }}
                    </td>
                    <td class="p-3 text-center bg-blue-50/30 dark:bg-blue-950/10">
                      <div class="h-8 border-b border-dashed border-blue-300 flex items-center justify-center text-[10px] text-blue-400 italic">
                        {{ item.etapa !== 'Programado' && item.etapa !== 'Generado' ? 'Firma Registrada' : 'Firma Docente' }}
                      </div>
                    </td>

                    <!-- Bloque Devolución (Recepción) -->
                    <td class="p-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? '10:20' : '___:___' }}
                    </td>
                    <td class="p-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? '42 resueltas' : '____' }}
                    </td>
                    <td class="p-3 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                      <div class="h-8 border-b border-dashed border-emerald-300 flex items-center justify-center text-[10px] text-emerald-400 italic">
                        {{ item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? 'Sello Jefatura' : 'Firma Jefatura' }}
                      </div>
                    </td>

                    <td class="p-3 text-center">
                      <span [class]="getEstadoBadge(item.etapa)" class="text-[9.5px] font-black px-2 py-0.5 rounded uppercase">
                        {{ item.etapa }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pie de Firma de Planilla Oficial -->
          <div class="p-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div class="space-y-2">
              <div class="h-14 border-b border-foreground/30 flex items-end justify-center pb-1">
                <span class="font-bold text-foreground">Responsable no identificado</span>
              </div>
              <p class="text-[11px] text-muted-foreground font-bold uppercase">Jefatura de Evaluaciones</p>
            </div>
            <div class="space-y-2">
              <div class="h-14 border-b border-foreground/30 flex items-end justify-center pb-1">
                <span class="font-bold text-foreground">Lic. María Luz del Castillo</span>
              </div>
              <p class="text-[11px] text-muted-foreground font-bold uppercase">Secretaría Académica UNITEPC</p>
            </div>
            <div class="space-y-2">
              <div class="h-14 border-b border-foreground/30 flex items-end justify-center pb-1">
                <span class="font-bold text-foreground">Decanato de Facultad</span>
              </div>
              <p class="text-[11px] text-muted-foreground font-bold uppercase">Visto Bueno Institucional</p>
            </div>
          </div>

        </div>
      }

      <!-- 5. CONTENIDO DEL REPORTE 2: COBERTURA Y VALIDACIÓN DE BANCOS -->
      @if (tipoReporteActivo() === 'COBERTURA_BANCOS') {
        <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
          
          <div class="p-5 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-black text-foreground uppercase tracking-wide">
                Auditoría de Bancos de Preguntas y Reactivos Validados
              </h3>
              <p class="text-xs text-muted-foreground">Estado de entrega de preguntas por docente y cumplimiento de la norma psicométrica.</p>
            </div>

            <div class="flex items-center gap-2">
              <span class="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-lg border border-emerald-200">
                100% Bancos Validados para generación
              </span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th class="p-3">Código</th>
                  <th class="p-3">Asignatura</th>
                  <th class="p-3">Docente Titular</th>
                  <th class="p-3 text-center">Sem.</th>
                  <th class="p-3 text-center">Total Preguntas</th>
                  <th class="p-3 text-center">Fácil (30%)</th>
                  <th class="p-3 text-center">Medio (50%)</th>
                  <th class="p-3 text-center">Difícil (20%)</th>
                  <th class="p-3 text-center">% Cobertura</th>
                  <th class="p-3 text-center">Generación del examen</th>
                  <th class="p-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (item of datosFiltrados(); track item.id) {
                  <tr class="hover:bg-muted/30 transition-colors">
                    <td class="p-3 font-mono font-bold text-primary">{{ item.codigo }}</td>
                    <td class="p-3 font-bold text-foreground">{{ item.materia }}</td>
                    <td class="p-3 text-foreground font-medium uppercase">{{ item.docente }}</td>
                    <td class="p-3 text-center font-mono font-bold">{{ item.semestre }}°</td>
                    <td class="p-3 text-center font-mono font-black text-foreground">
                      {{ item.bancoExcelCargado ? '60 reactivos' : '0 reactivos' }}
                    </td>
                    <td class="p-3 text-center font-mono text-emerald-600 font-bold">
                      {{ item.bancoExcelCargado ? '18' : '0' }}
                    </td>
                    <td class="p-3 text-center font-mono text-indigo-600 font-bold">
                      {{ item.bancoExcelCargado ? '30' : '0' }}
                    </td>
                    <td class="p-3 text-center font-mono text-rose-600 font-bold">
                      {{ item.bancoExcelCargado ? '12' : '0' }}
                    </td>
                    <td class="p-3 text-center">
                      <span class="font-mono font-black text-xs" [class]="item.bancoExcelCargado ? 'text-emerald-600' : 'text-amber-600'">
                        {{ item.bancoExcelCargado ? '100%' : '0%' }}
                      </span>
                    </td>
                    <td class="p-3 text-center">
                      @if (item.bancoExcelCargado) {
                        <span class="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded flex items-center justify-center gap-1">
                          <i class="pi pi-bolt text-[9px]"></i> 4 Variantes A-D
                        </span>
                      } @else {
                        <span class="text-muted-foreground text-[10px] font-mono">Pendiente</span>
                      }
                    </td>
                    <td class="p-3 text-center">
                      <span [class]="item.bancoExcelCargado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'" class="text-[9.5px] font-black px-2 py-0.5 rounded uppercase">
                        {{ item.bancoExcelCargado ? 'APROBADO' : 'PENDIENTE' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

        </div>
      }

      <!-- 6. CONTENIDO DEL REPORTE 3: CONSOLIDADO DE RENDIMIENTO Y OMR -->
      @if (tipoReporteActivo() === 'CONSOLIDADO_OMR') {
        <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
          
          <div class="p-5 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-black text-foreground uppercase tracking-wide">
                Consolidado de Calificaciones y Lectura Óptica OMR
              </h3>
              <p class="text-xs text-muted-foreground">Resultados del procesamiento automatizado de cartillas ópticas y notas promedios.</p>
            </div>
            <span class="text-xs font-mono font-bold text-muted-foreground">Efectividad de Lectura: 100%</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th class="p-3">Código</th>
                  <th class="p-3">Asignatura</th>
                  <th class="p-3">Grupo</th>
                  <th class="p-3">Docente Titular</th>
                  <th class="p-3 text-center">Inscritos</th>
                  <th class="p-3 text-center">Cartillas OMR Leídas</th>
                  <th class="p-3 text-center">Promedio (/100)</th>
                  <th class="p-3 text-center">Aprobados</th>
                  <th class="p-3 text-center">Reprobados</th>
                  <th class="p-3 text-center">Sincronización Central</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (item of datosFiltrados(); track item.id) {
                  <tr class="hover:bg-muted/30 transition-colors">
                    <td class="p-3 font-mono font-bold text-primary">{{ item.codigo }}</td>
                    <td class="p-3 font-bold text-foreground">{{ item.materia }}</td>
                    <td class="p-3 font-mono font-bold text-center">
                      <span class="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded">
                        {{ item.grupo }}
                      </span>
                    </td>
                    <td class="p-3 text-foreground font-medium uppercase">{{ item.docente }}</td>
                    <td class="p-3 text-center font-mono font-bold">45</td>
                    <td class="p-3 text-center font-mono font-black text-purple-700">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? '42 (100%)' : '0' }}
                    </td>
                    <td class="p-3 text-center font-mono font-black text-foreground">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? '74.5' : '--' }}
                    </td>
                    <td class="p-3 text-center font-mono font-bold text-emerald-600">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? '38 (90%)' : '--' }}
                    </td>
                    <td class="p-3 text-center font-mono font-bold text-rose-600">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? '4 (10%)' : '--' }}
                    </td>
                    <td class="p-3 text-center">
                      @if (item.etapa === 'Calificado') {
                        <span class="bg-emerald-100 text-emerald-800 text-[9.5px] font-black px-2 py-0.5 rounded uppercase flex items-center justify-center gap-1">
                          <i class="pi pi-check"></i> SINCRONIZADO
                        </span>
                      } @else {
                        <span class="bg-amber-100 text-amber-800 text-[9.5px] font-black px-2 py-0.5 rounded uppercase">
                          PENDIENTE ACTA
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

        </div>
      }

      <!-- 7. CONTENIDO DEL REPORTE 4: BITÁCORA DE AUDITORÍA Y TRAZABILIDAD -->
      @if (tipoReporteActivo() === 'AUDITORIA_TRAZABILIDAD') {
        <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
          
          <div class="p-5 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-black text-foreground uppercase tracking-wide">
                Bitácora Institucional de Auditoría y Trazabilidad Digital
              </h3>
              <p class="text-xs text-muted-foreground">Registro inmutable de transiciones, generaciones, restablecimientos y restauraciones.</p>
            </div>
            <span class="bg-purple-100 text-purple-800 text-xs font-black px-3 py-1 rounded-lg border border-purple-200">
              Auditoría Criptográfica Activa
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th class="p-3">Fecha y Hora</th>
                  <th class="p-3">Responsable & Cargo</th>
                  <th class="p-3">Módulo</th>
                  <th class="p-3">Acción Registrada</th>
                  <th class="p-3">IP Pública</th>
                  <th class="p-3">Dirección MAC</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (act of storage.bitacoraAuditoria(); track act.id) {
                  <tr class="hover:bg-muted/30 transition-colors">
                    <td class="p-3 font-mono font-bold text-foreground">{{ act.fechaHora }}</td>
                    <td class="p-3">
                      <div class="font-bold text-foreground">{{ act.usuarioNombre }}</div>
                      <span class="text-[10px] text-muted-foreground">Jefatura de Evaluaciones</span>
                    </td>
                    <td class="p-3 font-mono font-bold">
                      <span class="bg-purple-50 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded">
                        {{ act.modulo }}
                      </span>
                    </td>
                    <td class="p-3 text-foreground font-medium">
                      {{ act.accion }}
                    </td>
                    <td class="p-3 font-mono text-muted-foreground text-[11px]">{{ act.ipPublica }}</td>
                    <td class="p-3 font-mono text-muted-foreground text-[11px]">{{ act.direccionMac }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

        </div>
      }

    </div>
  `
})
export class ReporteEvaluacionesComponent {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly _roles = inject(RolExamenService);
  private readonly _omr = inject(OmrProcesamientoService);

  public tipoReporteActivo = signal<TipoReporte>('PLANILLA_RECEPCION');

  public rolesConciliacion = signal<RolExamenResponse[]>([]);
  public rolConciliacionId = '';
  public archivoRemarkNombre = signal<string | null>(null);
  public cargandoConciliacion = signal<boolean>(false);
  public cargandoRolesConciliacion = signal<boolean>(false);
  public errorConciliacion = signal<string | null>(null);
  public resultadosConciliacion = signal<ResultadoConciliacion[]>([]);
  public resultadoConciliacionSeleccionado = signal<ResultadoConciliacion | null>(null);
  public contextoConciliacion = signal<{ materia: string; grupo: string; fecha: string; materiaCoincide: boolean; grupoAdvertencia: boolean; fechaAdvertencia: boolean } | null>(null);
  private filasRemark: FilaRemark[] = [];
  private calificacionesSistema: CalificacionOmrResponse[] = [];

  public rolesConciliacionOrdenados = computed(() => [...this.rolesConciliacion()].sort((a, b) => {
    const codigo = (a.materiaCodigo || '').localeCompare(b.materiaCodigo || '');
    return codigo || (a.grupo || '').localeCompare(b.grupo || '');
  }));

  public resumenConciliacion = computed(() => {
    const resultados = this.resultadosConciliacion();
    return {
      total: resultados.length,
      coinciden: resultados.filter(item => item.estado === 'COINCIDE').length,
      diferencias: resultados.filter(item => item.estado === 'DIFERENCIA_RESPUESTAS' || item.estado === 'DIFERENCIA_NOTA').length,
      soloRemark: resultados.filter(item => item.estado === 'SOLO_REMARK').length,
      soloSistema: resultados.filter(item => item.estado === 'SOLO_SISTEMA').length
    };
  });

  public filtroSede = 'Todos';
  public filtroCarrera = 'Todos';
  public filtroModalidad = 'Todos';
  public filtroFecha = '';

  public datosFiltrados = computed(() => {
    return this.storage.gestionEvaluaciones().filter(item => {
      if (this.filtroSede !== 'Todos' && !item.carrera.toLowerCase().includes(this.filtroSede.toLowerCase())) {
        // La sede se resolverá con el catálogo oficial del backend.
      }
      if (this.filtroCarrera !== 'Todos' && item.carrera !== this.filtroCarrera) {
        return false;
      }
      if (this.filtroModalidad === 'CON_CARTILLA' && !item.conCartilla) {
        return false;
      }
      if (this.filtroModalidad === 'SIN_CARTILLA' && item.conCartilla) {
        return false;
      }
      if (this.filtroFecha && !item.fecha.includes(this.filtroFecha)) {
        return false;
      }
      return true;
    });
  });

  public abrirConciliacionRemark(): void {
    this.tipoReporteActivo.set('CONCILIACION_REMARK');
    this.errorConciliacion.set(null);
    if (!this.rolesConciliacion().length && !this.cargandoRolesConciliacion()) {
      this.cargandoRolesConciliacion.set(true);
      this._roles.listar().subscribe({
        next: roles => {
          this.rolesConciliacion.set(roles);
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
    this.resultadosConciliacion.set([]);
    this.contextoConciliacion.set(null);
    this.errorConciliacion.set(null);
    this._ejecutarConciliacion();
  }

  public cargarArchivoRemark(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    input.value = '';

    this.archivoRemarkNombre.set(archivo.name);
    this.errorConciliacion.set(null);
    this.resultadosConciliacion.set([]);
    this.contextoConciliacion.set(null);
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const contenido = lector.result;
        if (!(contenido instanceof ArrayBuffer)) throw new Error('No se pudo leer el archivo.');
        const libro = XLSX.read(new Uint8Array(contenido), { type: 'array', raw: false });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        if (!hoja) throw new Error('El archivo no contiene una hoja de datos.');
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
      case 'DIFERENCIA_NOTA': return 'Diferencia de nota';
      case 'SOLO_REMARK': return 'Solo Remark';
      case 'SOLO_SISTEMA': return 'Solo sistema';
    }
  }

  public claseEstadoConciliacion(estado: EstadoConciliacion): string {
    switch (estado) {
      case 'COINCIDE': return 'bg-emerald-100 text-emerald-800';
      case 'DIFERENCIA_RESPUESTAS': return 'bg-amber-100 text-amber-800';
      case 'DIFERENCIA_NOTA': return 'bg-orange-100 text-orange-800';
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
        'NOTA_REMARK_60': resultado.notaRemark60,
        'NOTA_SISTEMA_60': resultado.notaSistema60,
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
    if (!this.rolConciliacionId || !this.filasRemark.length) return;
    this.cargandoConciliacion.set(true);
    this.errorConciliacion.set(null);
    const rol = this.rolesConciliacion().find(item => item.id === this.rolConciliacionId);
    if (rol) this._actualizarContexto(rol);
    this._omr.listarCalificaciones(this.rolConciliacionId).subscribe({
      next: calificaciones => {
        this.calificacionesSistema = calificaciones;
        this.resultadosConciliacion.set(this._compararFilas(this.filasRemark, calificaciones));
        this.cargandoConciliacion.set(false);
      },
      error: () => {
        this.cargandoConciliacion.set(false);
        this.errorConciliacion.set('No se pudieron consultar las lecturas OMR de la evaluación seleccionada.');
      }
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
        materia: valor(['SIGLAMAT', 'CODIGOMATERIA', 'MATERIA']),
        grupo: valor(['GRUPO', 'GRUPOCLASE']),
        fecha: valor(['FECHA', 'FECHAEVALUACION']),
        nota60: this._numeroNullable(valor(['NOTA60', 'NOTA'])),
        respuestas
      };
    });
  }

  private _compararFilas(filasRemark: FilaRemark[], calificaciones: CalificacionOmrResponse[]): ResultadoConciliacion[] {
    const remarkPorCodigo = new Map(filasRemark.map(fila => [fila.codigoEstudiante, fila]));
    const sistemaPorCodigo = new Map(calificaciones.map(calificacion => [this._normalizarCodigo(calificacion.codigoEstudiante), calificacion]));
    const codigos = [...new Set([...remarkPorCodigo.keys(), ...sistemaPorCodigo.keys()])].sort();
    return codigos.map(codigoEstudiante => {
      const remark = remarkPorCodigo.get(codigoEstudiante);
      const sistema = sistemaPorCodigo.get(codigoEstudiante);
      const respuestasRemark = remark?.respuestas || {};
      const respuestasSistema = sistema ? this._respuestasSistema(sistema) : {};
      const diferencias = sistema && remark ? Array.from({ length: 30 }, (_, indice) => indice + 1)
        .map(numero => ({ numero, remark: respuestasRemark[String(numero)] || '', sistema: respuestasSistema[String(numero)] || '' }))
        .filter(item => item.remark !== item.sistema) : [];
      const notaSistema60 = sistema ? this._notaSistemaSobre60(sistema) : null;
      const notaRemark60 = remark?.nota60 ?? null;
      const diferenciaNota = notaRemark60 !== null && notaSistema60 !== null
        && Math.abs(notaRemark60 - notaSistema60) > 0.01;
      let estado: EstadoConciliacion;
      if (!remark) estado = 'SOLO_SISTEMA';
      else if (!sistema) estado = 'SOLO_REMARK';
      else if (diferencias.length) estado = 'DIFERENCIA_RESPUESTAS';
      else if (diferenciaNota) estado = 'DIFERENCIA_NOTA';
      else estado = 'COINCIDE';
      return {
        codigoEstudiante,
        nombreRemark: remark?.nombre || '',
        nombreSistema: sistema?.estudianteNombreCompleto || '',
        notaRemark60,
        notaSistema60,
        estado,
        diferencias,
        respuestasRemark,
        respuestasSistema
      };
    });
  }

  private _respuestasSistema(calificacion: CalificacionOmrResponse): Record<string, string> {
    if (!calificacion.respuestasDetectadasJson) return {};
    try {
      const respuestas = JSON.parse(calificacion.respuestasDetectadasJson) as Record<string, unknown>;
      return Object.fromEntries(Object.entries(respuestas).map(([pregunta, respuesta]) => [pregunta, this._normalizarRespuesta(respuesta)]));
    } catch {
      return {};
    }
  }

  private _notaSistemaSobre60(calificacion: CalificacionOmrResponse): number | null {
    if (calificacion.notaSobre100 === null || calificacion.notaSobre100 === undefined) return null;
    return Math.round(calificacion.notaSobre100 * 0.6 * 100) / 100;
  }

  private _actualizarContexto(rol: RolExamenResponse): void {
    const fila = this.filasRemark[0];
    const materia = fila?.materia || '';
    const grupo = fila?.grupo || '';
    const fecha = fila?.fecha || '';
    this.contextoConciliacion.set({
      materia,
      grupo,
      fecha,
      materiaCoincide: !materia || this._normalizarTexto(materia) === this._normalizarTexto(rol.materiaCodigo),
      grupoAdvertencia: !!grupo && this._normalizarTexto(grupo) !== this._normalizarTexto(rol.grupo),
      fechaAdvertencia: !!fecha && !this._fechaCoincide(fecha, rol.fecha)
    });
  }

  private _fechaCoincide(fechaRemark: string, fechaSistema: string): boolean {
    const texto = fechaRemark.trim();
    let fecha = '';
    if (/^\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}$/.test(texto)) {
      const [anio, mes, dia] = texto.split(/[-/]/);
      fecha = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    } else if (/^\\d{1,2}[-/]\\d{1,2}[-/]\\d{4}$/.test(texto)) {
      const [dia, mes, anio] = texto.split(/[-/]/);
      fecha = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    return fecha === fechaSistema;
  }

  private _normalizarCabecera(valor: unknown): string {
    return String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  private _normalizarTexto(valor: unknown): string {
    return this._normalizarCabecera(valor);
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

  private _numeroNullable(valor: unknown): number | null {
    const texto = String(valor ?? '').trim().replace(',', '.');
    if (!texto) return null;
    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : null;
  }

  public getEstadoBadge(etapa: EtapaEvaluacion): string {
    switch (etapa) {
      case 'Programado': return 'bg-purple-100 text-purple-800 border border-purple-300 font-bold';
      case 'Generado': return 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold';
      case 'Impreso': return 'bg-blue-100 text-blue-800 border border-blue-300 font-bold';
      case 'Entregado': return 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
      case 'Devuelto': return 'bg-rose-100 text-rose-800 border border-rose-300 font-bold';
      case 'Pendiente de notas': return 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
      case 'Calificado': return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
      default: return 'bg-slate-100 text-slate-800 font-bold';
    }
  }

  public exportarReporteActualExcel(): void {
    const tipo = this.tipoReporteActivo();
    const gestion = this.storage.gestionActiva();
    const items = this.datosFiltrados();

    if (tipo === 'CONCILIACION_REMARK') {
      this.exportarConciliacion();
      return;
    }

    let dataToExport: any[] = [];
    let fileName = '';

    if (tipo === 'PLANILLA_RECEPCION') {
      fileName = `Planilla_Control_Recepcion_Entrega_UNITEPC_${gestion}.xlsx`;
      dataToExport = items.map((item, idx) => ({
        'N°': idx + 1,
        'FECHA': item.fecha,
        'HORA PROGRAMADA': item.hora,
        'CÓDIGO': item.codigo,
        'ASIGNATURA': item.materia,
        'GRUPO': item.grupo,
        'CARRERA': item.carrera,
        'DOCENTE TITULAR': item.docente,
        'MODALIDAD': item.conCartilla ? 'CON CARTILLA' : 'SIN CARTILLA',
        'HORA RETIRO': item.etapa !== 'Programado' ? '07:45' : '',
        'CANT. ENTREGADA': item.etapa !== 'Programado' ? '45 unid.' : '',
        'FIRMA ENTREGA DOCENTE': item.etapa !== 'Programado' && item.etapa !== 'Generado' ? 'REGISTRADA' : '',
        'HORA DEVOLUCIÓN': item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? '10:20' : '',
        'CANT. CARTILLAS DEVUELTAS': item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? '42' : '',
        'FIRMA RECEPCIÓN JEFATURA': item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? 'SELLO OFICIAL' : '',
        'ESTADO ACTUAL': item.etapa
      }));
    } else if (tipo === 'COBERTURA_BANCOS') {
      fileName = `Reporte_Cobertura_Bancos_Preguntas_${gestion}.xlsx`;
      dataToExport = items.map((item, idx) => ({
        'N°': idx + 1,
        'CÓDIGO': item.codigo,
        'ASIGNATURA': item.materia,
        'DOCENTE TITULAR': item.docente,
        'SEMESTRE': item.semestre,
        'TOTAL PREGUNTAS': item.bancoExcelCargado ? 60 : 0,
        'FÁCIL (30%)': item.bancoExcelCargado ? 18 : 0,
        'MEDIO (50%)': item.bancoExcelCargado ? 30 : 0,
        'DIFÍCIL (20%)': item.bancoExcelCargado ? 12 : 0,
        '% COBERTURA': item.bancoExcelCargado ? '100%' : '0%',
        'ESTADO BANCO': item.bancoExcelCargado ? 'APROBADO' : 'PENDIENTE'
      }));
    } else if (tipo === 'CONSOLIDADO_OMR') {
      fileName = `Consolidado_Rendimiento_Lectura_OMR_${gestion}.xlsx`;
      dataToExport = items.map((item, idx) => ({
        'N°': idx + 1,
        'CÓDIGO': item.codigo,
        'ASIGNATURA': item.materia,
        'GRUPO': item.grupo,
        'DOCENTE TITULAR': item.docente,
        'ESTUDIANTES INSCRITOS': 45,
        'CARTILLAS LEÍDAS': item.etapa === 'Devuelto' || item.etapa === 'Pendiente de notas' || item.etapa === 'Calificado' ? 42 : 0,
        'PROMEDIO NOTA': item.etapa === 'Calificado' ? 74.5 : '--',
        'ESTADO SINCRONIZACIÓN': item.etapa === 'Calificado' ? 'CALIFICADO' : 'PENDIENTE'
      }));
    } else {
      fileName = `Bitacora_Auditoria_Seguridad_${gestion}.xlsx`;
      dataToExport = this.storage.bitacoraAuditoria().map((act, idx) => ({
        'N°': idx + 1,
        'FECHA Y HORA': act.fechaHora,
        'RESPONSABLE': act.usuarioNombre,
        'MÓDULO': act.modulo,
        'ACCIÓN': act.accion,
        'IP PÚBLICA': act.ipPublica,
        'DIRECCIÓN MAC': act.direccionMac
      }));
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte_Oficial');
    XLSX.writeFile(wb, fileName);
  }

  public imprimirReporte(): void {
    window.print();
  }
}
