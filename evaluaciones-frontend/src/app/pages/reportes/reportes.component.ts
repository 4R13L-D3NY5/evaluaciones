import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  EvaluacionesStorageService, 
  GestionEvaluacionItem, 
  EtapaEvaluacion 
} from '../../core/services/evaluaciones-storage.service';
import * as XLSX from 'xlsx';

type TipoReporte = 'PLANILLA_RECEPCION' | 'COBERTURA_BANCOS' | 'CONSOLIDADO_OMR' | 'AUDITORIA_TRAZABILIDAD';

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
                <option value="Todos">Todas (Con y Sin Cartilla)</option>
                <option value="CON_CARTILLA">Solo Con Cartilla (OMR)</option>
                <option value="SIN_CARTILLA">Solo Sin Cartilla (Manual)</option>
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
                Formato Oficial SEA-DOC-04
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
                          OMR Óptico
                        </span>
                      } @else {
                        <span class="bg-slate-100 text-slate-800 text-[9.5px] font-black px-2 py-0.5 rounded uppercase">
                          Manual
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
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? '10:20' : '___:___' }}
                    </td>
                    <td class="p-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? '42 resueltas' : '____' }}
                    </td>
                    <td class="p-3 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                      <div class="h-8 border-b border-dashed border-emerald-300 flex items-center justify-center text-[10px] text-emerald-400 italic">
                        {{ item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? 'Sello Jefatura' : 'Firma Jefatura' }}
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
                <span class="font-bold text-foreground">Ing. Ariel Denys Cámara Arze</span>
              </div>
              <p class="text-[11px] text-muted-foreground font-bold uppercase">Jefatura de Evaluaciones SEA</p>
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
                100% Bancos Validados con Typst
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
                  <th class="p-3 text-center">Compilación Typst</th>
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
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? '42 (100%)' : '0' }}
                    </td>
                    <td class="p-3 text-center font-mono font-black text-foreground">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? '74.5' : '--' }}
                    </td>
                    <td class="p-3 text-center font-mono font-bold text-emerald-600">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? '38 (90%)' : '--' }}
                    </td>
                    <td class="p-3 text-center font-mono font-bold text-rose-600">
                      {{ item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? '4 (10%)' : '--' }}
                    </td>
                    <td class="p-3 text-center">
                      @if (item.etapa === 'Subido' || item.etapa === 'Recibido') {
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
              <p class="text-xs text-muted-foreground">Registro inmutable de transiciones, compilaciones Typst, restablecimientos y restauraciones.</p>
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

  public tipoReporteActivo = signal<TipoReporte>('PLANILLA_RECEPCION');

  public filtroSede = 'Todos';
  public filtroCarrera = 'Todos';
  public filtroModalidad = 'Todos';
  public filtroFecha = '';

  public datosFiltrados = computed(() => {
    return this.storage.gestionEvaluaciones().filter(item => {
      if (this.filtroSede !== 'Todos' && !item.carrera.toLowerCase().includes(this.filtroSede.toLowerCase())) {
        // En mock se filtra por sede o carrera
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

  public getEstadoBadge(etapa: EtapaEvaluacion): string {
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

  public exportarReporteActualExcel(): void {
    const tipo = this.tipoReporteActivo();
    const gestion = this.storage.gestionActiva();
    const items = this.datosFiltrados();

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
        'MODALIDAD': item.conCartilla ? 'CON CARTILLA (OMR)' : 'SIN CARTILLA (MANUAL)',
        'HORA RETIRO': item.etapa !== 'Programado' ? '07:45' : '',
        'CANT. ENTREGADA': item.etapa !== 'Programado' ? '45 unid.' : '',
        'FIRMA ENTREGA DOCENTE': item.etapa !== 'Programado' && item.etapa !== 'Generado' ? 'REGISTRADA' : '',
        'HORA DEVOLUCIÓN': item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? '10:20' : '',
        'CANT. CARTILLAS DEVUELTAS': item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? '42' : '',
        'FIRMA RECEPCIÓN JEFATURA': item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? 'SELLO OFICIAL' : '',
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
        'CARTILLAS LEÍDAS': item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? 42 : 0,
        'PROMEDIO NOTA': item.etapa === 'Devuelto' || item.etapa === 'Revisado' || item.etapa === 'Subido' || item.etapa === 'Recibido' ? 74.5 : '--',
        'ESTADO SINCRONIZACIÓN': item.etapa === 'Subido' || item.etapa === 'Recibido' ? 'SINCRONIZADO' : 'PENDIENTE'
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
