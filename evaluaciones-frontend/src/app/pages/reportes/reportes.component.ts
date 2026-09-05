import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import * as XLSX from 'xlsx';

type TipoReporte = 'REPORTE_EVALUACIONES' | 'PLANILLA_RECEPCION' | 'COBERTURA_BANCOS' | 'CONSOLIDADO_OMR' | 'AUDITORIA_TRAZABILIDAD' | 'CONCILIACION_REMARK';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      
      <!-- 1. CABECERA PRINCIPAL DEL MÓDULO DE REPORTES (referencia SIDOPA) -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="h-11 w-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <i class="pi pi-clipboard text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">Reporte Evaluaciones</h1>
              <p class="text-xs text-muted-foreground font-medium">Seguimiento institucional de evaluaciones programadas y su flujo operativo.</p>
            </div>
          </div>
        </div>

        <!-- Botones de Acción Global -->
        <div class="flex flex-wrap items-center gap-3">
          <button (click)="actualizarReportePrincipal()" [disabled]="cargandoReporte()" class="bg-card hover:bg-muted border border-border text-foreground font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50">
            <i class="pi" [class.pi-refresh]="!cargandoReporte()" [class.pi-spin]="cargandoReporte()" [class.pi-spinner]="cargandoReporte()"></i>
            <span>Actualizar reporte</span>
          </button>
          <button 
            (click)="exportarReportePrincipal()"
            [disabled]="tipoReporteActivo() === 'CONCILIACION_REMARK' && !resultadosConciliacion().length"
            class="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <i class="pi pi-download text-sm"></i>
            <span>Exportar PDF</span>
          </button>
          <button 
            (click)="imprimirReporte()" 
            class="bg-card hover:bg-muted border border-border text-foreground font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer">
            <i class="pi pi-print text-sm"></i>
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <!-- 2. El reporte principal sigue el patrón de SIDOPA; los demás quedan pendientes. -->
      <div class="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          (click)="tipoReporteActivo.set('REPORTE_EVALUACIONES')"
          [class]="tipoReporteActivo() === 'REPORTE_EVALUACIONES' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-chart-bar"></i>
          <span>Reporte de evaluaciones</span>
        </button>
        <span class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 bg-muted text-muted-foreground font-bold"><i class="pi pi-clock"></i> Cobertura de bancos · Pendiente</span>
        <span class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 bg-muted text-muted-foreground font-bold"><i class="pi pi-clock"></i> Consolidado OMR · Pendiente</span>
        <span class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 bg-muted text-muted-foreground font-bold"><i class="pi pi-clock"></i> Auditoría · Pendiente</span>

        @if (puedeConciliarRemark()) {
          <button
          (click)="abrirConciliacionRemark()"
          [class]="tipoReporteActivo() === 'CONCILIACION_REMARK' ? 'bg-primary text-white shadow-xs font-black' : 'bg-card text-muted-foreground hover:text-foreground border border-border font-bold'"
          class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <i class="pi pi-sync"></i>
          <span>5. Conciliación Remark vs. OMR</span>
          </button>
        }
      </div>

      <!-- 3. BARRA DE FILTROS ESPECÍFICOS SEGÚN EL REPORTE -->
      <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-4">
          
          <div class="flex flex-wrap items-center gap-3">
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Alcance:</label>
              <select [ngModel]="filtroAlcance" (ngModelChange)="filtroAlcance = $event" class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"><option value="nacional">Nacional</option><option value="sede">Por sede</option><option value="carrera">Por carrera</option></select>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Gestión:</label>
              <select [ngModel]="storage.gestionActiva()" (ngModelChange)="storage.setGestionActiva($event)" class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"><option value="II-2026">II-2026 (Activa)</option><option value="I-2026">I-2026</option><option value="II-2025">II-2025</option></select>
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

            <!-- Filtro de Modalidad (Con/Sin Cartilla) -->
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

            <!-- Filtro de Fecha -->
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Fecha de Evaluación:</label>
              <input 
                type="text" 
                [ngModel]="filtroFecha"
                (ngModelChange)="filtroFecha = $event; refrescarFiltros()"
                placeholder="Ej. 08/06/2026 o vacio para todas"
                class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none placeholder:text-muted-foreground/60 w-44" />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Desde:</label>
              <input type="date" [ngModel]="filtroFechaInicio" (ngModelChange)="filtroFechaInicio = $event; refrescarFiltros()" class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Hasta:</label>
              <input type="date" [ngModel]="filtroFechaFin" (ngModelChange)="filtroFechaFin = $event; refrescarFiltros()" class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none" />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Parcial:</label>
              <select [ngModel]="filtroParcial" (ngModelChange)="filtroParcial = $event; refrescarFiltros()" class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                <option value="Todos">Todos los parciales</option><option value="1er Parcial">1er Parcial</option><option value="2do Parcial">2do Parcial</option><option value="Final">Final</option><option value="2da Instancia">2da Instancia</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Estado:</label>
              <select [ngModel]="filtroEstadoReporte" (ngModelChange)="filtroEstadoReporte = $event; refrescarFiltros()" class="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer">
                <option value="Todos">Todos los estados</option><option value="PROGRAMADO">Programado</option><option value="VALIDADO">Validado</option><option value="GENERADO">Generado</option><option value="IMPRESO">Impreso</option><option value="ENTREGADO">Entregado</option><option value="DEVUELTO">Devuelto</option><option value="CALIFICADO">Calificado</option>
              </select>
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

      @if (esConsultaAcademica() && !cargandoSedes() && sedes().length === 0) {
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900 shadow-xs">
          <i class="pi pi-lock mt-0.5"></i>
          <div>
            <p class="font-black">No tienes sedes académicas asignadas</p>
            <p class="text-xs mt-1">Solicita al administrador que registre las sedes correspondientes bajo tu alcance institucional.</p>
          </div>
        </div>
      } @else if (esConsultaAcademica() && !cargandoCarreras() && filtroSede && carreras().length === 0) {
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900 shadow-xs">
          <i class="pi pi-lock mt-0.5"></i>
          <div>
            <p class="font-black">No hay carreras disponibles para la sede seleccionada</p>
            <p class="text-xs mt-1">Verifica que la sede esté publicada correctamente en el catálogo académico oficial.</p>
          </div>
        </div>
      }

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
          <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden"><div class="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-sm font-black text-foreground">Detalle de evaluaciones</h2><p class="text-xs text-muted-foreground mt-1">Inspección de las evaluaciones programadas, su estado y cobertura de banco.</p></div><div class="relative"><i class="pi pi-search absolute left-3 top-2.5 text-muted-foreground text-xs"></i><input [(ngModel)]="busquedaReporte" placeholder="Buscar materia, docente o aula..." class="bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs outline-none w-72" /></div></div>@if (cargandoReporte()) {<div class="p-10 text-center text-sm text-muted-foreground"><i class="pi pi-spinner pi-spin mr-2"></i>Cargando reporte...</div>} @else {<div class="overflow-x-auto"><table class="w-full text-left border-collapse text-xs"><thead><tr class="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground"><th class="p-3">Materia / Grupo</th><th class="p-3">Docente titular</th><th class="p-3">Sede / Campus</th><th class="p-3">Carrera</th><th class="p-3">Parcial</th><th class="p-3">Fecha / Hora</th><th class="p-3 text-center">Banco</th><th class="p-3 text-center">Estado</th></tr></thead><tbody class="divide-y divide-border">@for (rol of rolesReporteFiltrados(); track rol.id) {<tr class="hover:bg-muted/30"><td class="p-3"><span class="font-mono text-primary font-black">{{ rol.materiaCodigo }}</span><div class="font-bold text-foreground">{{ rol.materiaNombre }}</div><span class="text-[10px] text-muted-foreground">Grupo {{ rol.grupo }}</span></td><td class="p-3 font-medium uppercase">{{ rol.docenteNombre || 'Por asignar' }}</td><td class="p-3"><div class="font-bold">{{ rol.sedeNombre }}</div><span class="text-[10px] text-muted-foreground">{{ rol.campus || 'Campus no informado' }}</span></td><td class="p-3 font-medium">{{ rol.carreraNombre }} <span class="text-[10px] text-muted-foreground">({{ rol.carreraCodigo }})</span></td><td class="p-3 whitespace-nowrap">{{ rol.tipoParcial }}</td><td class="p-3 whitespace-nowrap"><div class="font-mono font-bold">{{ rol.fecha }}</div><span class="text-[10px] text-muted-foreground">{{ rol.horario || 'Horario no informado' }}</span></td><td class="p-3 text-center"><span [class]="rol.bancoPreguntasCargado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'" class="px-2 py-1 rounded-lg text-[10px] font-black">{{ rol.bancoPreguntasCargado ? 'Sí' : 'Pendiente' }}</span></td><td class="p-3 text-center"><span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-[10px] font-black">{{ etiquetaEstadoReporte(rol.estadoFlujo) }}</span></td></tr>} @empty {<tr><td colspan="8" class="p-10 text-center text-sm text-muted-foreground">No hay evaluaciones para los filtros seleccionados.</td></tr>}</tbody></table></div>}</div>
        </section>
      }

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
export class ReporteEvaluacionesComponent implements OnInit {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly _roles = inject(RolExamenService);
  private readonly _omr = inject(OmrProcesamientoService);
  private readonly _gateway = inject(UnitepcGatewayService);
  private readonly _auth = inject(AuthService);

  public readonly esDirectorCarrera = computed(
    () => this._auth.usuario()?.rol === 'DIRECTOR_CARRERA'
  );
  public readonly esVicerrector = computed(
    () => this._auth.usuario()?.rol === 'VICERRECTOR'
  );
  public readonly puedeConciliarRemark = computed(() => {
    const rol = this._auth.usuario()?.rol;
    return rol === 'ADMINISTRADOR_SISTEMA' || rol === 'RESPONSABLE_EVALUACIONES';
  });
  public readonly esConsultaAcademica = computed(
    () => this.esDirectorCarrera() || this.esVicerrector()
  );
  public sedes = signal<BranchOffice[]>([]);
  public carreras = signal<Career[]>([]);
  public cargandoSedes = signal(false);
  public cargandoCarreras = signal(false);

  public tipoReporteActivo = signal<TipoReporte>('REPORTE_EVALUACIONES');

  public rolesReporte = signal<RolExamenResponse[]>([]);
  public cargandoReporte = signal(false);
  public errorReporte = signal<string | null>(null);
  public reporteGeneradoEn = signal(new Date());
  public busquedaReporte = '';
  public filtroParcial = 'Todos';
  public filtroEstadoReporte = 'Todos';
  public filtroFechaInicio = '';
  public filtroFechaFin = '';
  public filtroAlcance = 'nacional';

  public rolesReporteFiltrados(): RolExamenResponse[] {
    const texto = this.busquedaReporte.trim().toLowerCase();
    return this.rolesReporte().filter(rol => {
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

  public reportePorSede() { return this.agruparReportePor(rol => rol.sedeNombre); }

  private agruparReportePor(selector: (rol: RolExamenResponse) => string): Array<{ nombre: string; total: number }> {
    const conteo = new Map<string, number>();
    for (const rol of this.rolesReporteFiltrados()) {
      const nombre = selector(rol) || 'Sin dato';
      conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
    }
    return Array.from(conteo, ([nombre, total]) => ({ nombre, total })).sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));
  }

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

  public filtroSede = 'Todos';
  public filtroCarrera = 'Todos';
  public filtroModalidad = 'Todos';
  public filtroFecha = '';

  public ngOnInit(): void {
    this.cargarSedes();
    this.actualizarReportePrincipal();
  }

  public actualizarReportePrincipal(): void {
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

  public etiquetaEstadoReporte(estado: RolExamenResponse['estadoFlujo']): string {
    const etiquetas: Record<string, string> = {
      PROGRAMADO: 'Programado', VALIDADO: 'Validado', GENERADO: 'Generado', IMPRESO: 'Impreso',
      ENTREGADO: 'Entregado', DEVUELTO: 'Devuelto', PENDIENTE_NOTAS: 'Pendiente de notas',
      CALIFICADO: 'Calificado', SUSPENDIDO: 'Suspendido'
    };
    return etiquetas[estado] || estado;
  }

  public refrescarFiltros(): void {
    // Los filtros son propiedades simples para mantener compatibles los reportes pendientes;
    // el detalle principal se calcula nuevamente en cada ciclo de renderizado.
  }

  /** El PDF se obtiene mediante el diálogo de impresión, igual que SIDOPA. */
  public exportarReportePrincipal(): void {
    if (this.tipoReporteActivo() === 'CONCILIACION_REMARK') {
      this.exportarConciliacion();
      return;
    }
    window.print();
  }

  public onSedeChange(codigoSede: string): void {
    if (codigoSede === 'Todos') {
      this.filtroSede = 'Todos';
      this.filtroCarrera = 'Todos';
      this.carreras.set([]);
      return;
    }

    const sede = this.sedes().find(item => item.code === codigoSede);
    if (!sede) return;
    this.filtroSede = sede.code;
    this.filtroCarrera = this.esDirectorCarrera() ? '' : 'Todos';
    this.carreras.set([]);
    this.cargarCarreras(sede.code);
  }

  public onCarreraChange(codigoCarrera: string): void {
    if (codigoCarrera === 'Todos') {
      this.filtroCarrera = 'Todos';
      return;
    }
    if (this.carreras().some(item => item.careerCode === codigoCarrera)) {
      this.filtroCarrera = codigoCarrera;
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

  public datosFiltrados = computed(() => {
    return this.storage.gestionEvaluaciones().filter(item => {
      if (this.esConsultaAcademica()) {
        const sedeItem = String((item as GestionEvaluacionItem & { sede?: string; sedeCodigo?: string }).sedeCodigo
          || (item as GestionEvaluacionItem & { sede?: string }).sede || '').trim().toLowerCase();
        if (!this.filtroSede || this.filtroSede === 'Todos' || !sedeItem
            || !sedeItem.includes(this.filtroSede.toLowerCase())) {
          return false;
        }
      }
      const carrera = this.carreras().find(c => c.careerCode === this.filtroCarrera);
      const textoCarrera = `${item.carrera} ${carrera?.careerName || ''} ${carrera?.careerCode || ''}`.toLowerCase();
      if (this.filtroCarrera && this.filtroCarrera !== 'Todos'
          && !textoCarrera.includes(this.filtroCarrera.toLowerCase())) {
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
    this._omr.procesarLecturaConciliacion(this.rolConciliacionId, this.archivoOmr).subscribe({
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
        // El OCR puede devolver varios candidatos. Si Remark contiene uno de ellos,
        // se usa ese candidato para evitar falsos "Solo Remark" por ruido de lectura.
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
