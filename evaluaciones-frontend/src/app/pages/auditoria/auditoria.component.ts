import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { 
  AuditoriaService, 
  AuditoriaGlobalItem, 
  AuditoriaResumen,
  AuditoriaTomaGrupoReporte,
  AuditoriaTomaGrupoEstudiante,
  AuditoriaEstudianteGlobal
} from '../../core/services/auditoria.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

@Component({
  selector: 'sea-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Cabecera de Página Oficial -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-xs">
              <i class="pi pi-shield-check text-xl"></i>
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tight text-foreground">Auditoría, Trazabilidad & Peritaje SEA</h2>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Certificación forense de fechas de toma de grupo en SEA vs generación e impresión de exámenes, y bitácora de seguridad institucional.
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (tabActual() === 'bitacora') {
            <!-- Botón Refrescar Bitácora -->
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
              <span>Imprimir Acta</span>
            </button>
          } @else {
            <!-- Acciones en Pestaña Toma de Grupos -->
            @if (modoBusquedaToma() === 'grupo' && reporteGrupo()) {
              <button 
                (click)="descargarActaExcel()"
                [disabled]="descargandoExcel() || cargandoForense()"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                <i class="pi" [ngClass]="descargandoExcel() ? 'pi-spin pi-spinner' : 'pi-file-excel'"></i>
                <span>Descargar Acta Forense (.xlsx)</span>
              </button>
            } @else if (modoBusquedaToma() === 'estudiante' && reporteEstudiante()) {
              <button 
                (click)="exportarEstudianteExcel()"
                [disabled]="cargandoForense()"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                <i class="pi pi-file-excel"></i>
                <span>Exportar Historial (.xlsx)</span>
              </button>
            }
          }
        </div>
      </div>

      <!-- Selector de Pestañas Principales -->
      <div class="flex items-center border-b border-border bg-card px-3 pt-2 gap-2 rounded-2xl shadow-xs border overflow-x-auto">
        
        <button 
          (click)="cambiarTab('toma-grupos')"
          [class]="tabActual() === 'toma-grupos' ? 'border-purple-700 text-purple-800 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/40 font-black shadow-xs' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
          class="px-4 py-3 border-b-2 text-xs flex items-center gap-2 rounded-t-xl transition-all cursor-pointer">
          <i class="pi pi-user-edit text-sm"></i>
          <span>Trazabilidad Forense de Nómina & Toma de Grupos</span>
          <span class="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Peritaje SEA
          </span>
        </button>

        <button 
          (click)="cambiarTab('bitacora')"
          [class]="tabActual() === 'bitacora' ? 'border-purple-700 text-purple-800 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/40 font-black shadow-xs' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
          class="px-4 py-3 border-b-2 text-xs flex items-center gap-2 rounded-t-xl transition-all cursor-pointer">
          <i class="pi pi-shield text-sm"></i>
          <span>Bitácora de Accesos & Seguridad</span>
          <span class="bg-muted text-muted-foreground text-[10px] font-mono px-2 py-0.5 rounded-full">
            {{ items().length }}
          </span>
        </button>

      </div>

      <!-- =================================================================== -->
      <!-- PESTAÑA 1: TRAZABILIDAD FORENSE DE NÓMINA & TOMA DE GRUPOS         -->
      <!-- =================================================================== -->
      @if (tabActual() === 'toma-grupos') {
        
        <div class="space-y-6">

          <!-- Selector de Sub-Modalidad: Por Grupo vs Por Estudiante -->
          <div class="bg-card border border-border rounded-2xl p-4 shadow-xs">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div class="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border self-start">
                <button 
                  (click)="modoBusquedaToma.set('grupo')"
                  [class]="modoBusquedaToma() === 'grupo' ? 'bg-card text-purple-800 dark:text-purple-300 shadow-xs font-black' : 'text-muted-foreground hover:text-foreground font-bold'"
                  class="px-4 py-2 text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer">
                  <i class="pi pi-book"></i>
                  <span>Peritaje por Materia / Grupo</span>
                </button>
                <button 
                  (click)="modoBusquedaToma.set('estudiante')"
                  [class]="modoBusquedaToma() === 'estudiante' ? 'bg-card text-purple-800 dark:text-purple-300 shadow-xs font-black' : 'text-muted-foreground hover:text-foreground font-bold'"
                  class="px-4 py-2 text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer">
                  <i class="pi pi-user"></i>
                  <span>Historial Global por Estudiante</span>
                </button>
              </div>

              <div class="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <i class="pi pi-info-circle text-blue-600"></i>
                <span>Compara el timestamp exacto de inscripción del SEA contra el hito de impresión de cartillas.</span>
              </div>

            </div>

            <!-- Formulario de Búsqueda según la modalidad -->
            <div class="mt-4 pt-4 border-t border-border">
              
              @if (modoBusquedaToma() === 'grupo') {
                <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  
                  <div class="md:col-span-8">
                    <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <i class="pi pi-hashtag text-primary text-[10px]"></i> ID de Grupo SEA o Código de Grupo
                    </label>
                    <div class="relative">
                      <input 
                        type="text" 
                        [ngModel]="inputGrupoId()"
                        (ngModelChange)="inputGrupoId.set($event)"
                        (keyup.enter)="buscarTomaGrupo()"
                        placeholder="Ej. 293370 o ingresa el ID del grupo asignado..."
                        class="w-full bg-muted/60 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary">
                      <i class="pi pi-search absolute left-3 top-3 text-muted-foreground text-xs"></i>
                    </div>
                  </div>

                  <div class="md:col-span-4 flex gap-2">
                    <button 
                      (click)="buscarTomaGrupo()"
                      [disabled]="cargandoForense() || !inputGrupoId().trim()"
                      class="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform hover:scale-102 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer">
                      <i class="pi" [ngClass]="cargandoForense() ? 'pi-spin pi-spinner' : 'pi-shield'"></i>
                      <span>Auditar Nómina</span>
                    </button>
                    
                    @if (inputGrupoId()) {
                      <button 
                        (click)="limpiarBusquedaGrupo()"
                        class="bg-muted hover:bg-muted/80 text-foreground border border-border p-2.5 rounded-xl text-xs transition-colors"
                        title="Limpiar">
                        <i class="pi pi-times"></i>
                      </button>
                    }
                  </div>

                </div>
              } @else {
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  
                  <div class="sm:col-span-6">
                    <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <i class="pi pi-id-card text-primary text-[10px]"></i> Código SIS / SEA del Estudiante
                    </label>
                    <div class="relative">
                      <input 
                        type="text" 
                        [ngModel]="inputEstudianteCodigo()"
                        (ngModelChange)="inputEstudianteCodigo.set($event)"
                        (keyup.enter)="buscarTomaEstudiante()"
                        placeholder="Ej. 1601667 o 1601772..."
                        class="w-full bg-muted/60 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary">
                      <i class="pi pi-user absolute left-3 top-3 text-muted-foreground text-xs"></i>
                    </div>
                  </div>

                  <div class="sm:col-span-3">
                    <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <i class="pi pi-calendar text-primary text-[10px]"></i> Periodo / Gestión
                    </label>
                    <input 
                      type="text" 
                      [ngModel]="inputEstudianteGestion()"
                      (ngModelChange)="inputEstudianteGestion.set($event)"
                      placeholder="2-2026"
                      class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary">
                  </div>

                  <div class="sm:col-span-3 flex gap-2">
                    <button 
                      (click)="buscarTomaEstudiante()"
                      [disabled]="cargandoForense() || !inputEstudianteCodigo().trim()"
                      class="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform hover:scale-102 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer">
                      <i class="pi" [ngClass]="cargandoForense() ? 'pi-spin pi-spinner' : 'pi-search'"></i>
                      <span>Buscar Historial</span>
                    </button>
                    
                    @if (inputEstudianteCodigo()) {
                      <button 
                        (click)="limpiarBusquedaEstudiante()"
                        class="bg-muted hover:bg-muted/80 text-foreground border border-border p-2.5 rounded-xl text-xs transition-colors"
                        title="Limpiar">
                        <i class="pi pi-times"></i>
                      </button>
                    }
                  </div>

                </div>
              }

            </div>

          </div>

          <!-- Spinner de Carga Forense -->
          @if (cargandoForense()) {
            <div class="bg-card border border-border rounded-2xl p-12 text-center shadow-xs">
              <i class="pi pi-spin pi-spinner text-3xl text-purple-700 mb-3 inline-block"></i>
              <h4 class="text-sm font-black text-foreground">Consultando Trazabilidad Forense en UNITEPC Gateway</h4>
              <p class="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Verificando fechas exactas de inscripción (<code class="font-mono text-[10px]">enrollCreatedAt</code>) y contrastando con las marcas de tiempo de generación e impresión de cartillas OMR...
              </p>
            </div>
          }

          <!-- =============================================================== -->
          <!-- RESULTADO MODO A: AUDITORÍA POR MATERIA / GRUPO               -->
          <!-- =============================================================== -->
          @if (!cargandoForense() && modoBusquedaToma() === 'grupo' && reporteGrupo()) {
            
            <div class="space-y-6 animate-fade-in">
              
              <!-- Ficha Informativa del Grupo y Fechas de Examen -->
              <div class="bg-card border border-border rounded-2xl p-6 shadow-xs">
                
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        Grupo ID: {{ reporteGrupo()?.groupId }}
                      </span>
                      @if (reporteGrupo()?.groupCode) {
                        <span class="bg-muted text-muted-foreground text-[10px] font-mono px-2 py-0.5 rounded-md">
                          Código: {{ reporteGrupo()?.groupCode }}
                        </span>
                      }
                      @if (reporteGrupo()?.term) {
                        <span class="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Gestión: {{ reporteGrupo()?.term }}
                        </span>
                      }
                    </div>
                    <h3 class="text-xl font-black text-foreground tracking-tight">
                      {{ reporteGrupo()?.materiaNombre }}
                    </h3>
                    <p class="text-xs text-muted-foreground mt-1 font-medium">
                      {{ reporteGrupo()?.carreraNombre }} ({{ reporteGrupo()?.carreraCodigo }}) · Sede: <span class="font-bold text-foreground">{{ reporteGrupo()?.sedeNombre || 'No especificada' }}</span>
                      @if (reporteGrupo()?.docenteNombre) {
                        · Docente: <span class="font-bold text-foreground">{{ reporteGrupo()?.docenteNombre }}</span>
                      }
                    </p>
                  </div>

                  <!-- Hitos de Generación e Impresión del Examen -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[320px]">
                    
                    <!-- Hito 1: Generación -->
                    <div class="bg-muted/40 border border-border rounded-xl p-3">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] uppercase font-bold text-muted-foreground">Generación Typst</span>
                        <i class="pi pi-file-pdf text-purple-600 text-xs"></i>
                      </div>
                      @if (reporteGrupo()?.fechaGeneracionExamen) {
                        <div class="text-xs font-mono font-black text-foreground">
                          {{ formatearFechaHora(reporteGrupo()?.fechaGeneracionExamen) }}
                        </div>
                        <span class="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1 mt-0.5">
                          <i class="pi pi-check text-[9px]"></i> Examen Generado
                        </span>
                      } @else {
                        <div class="text-xs font-bold text-muted-foreground">No registrado</div>
                        <span class="text-[10px] text-amber-600 font-medium mt-0.5 block">Pendiente de generación</span>
                      }
                    </div>

                    <!-- Hito 2: Impresión -->
                    <div class="bg-muted/40 border border-border rounded-xl p-3">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] uppercase font-bold text-muted-foreground">Impresión OMR</span>
                        <i class="pi pi-print text-blue-600 text-xs"></i>
                      </div>
                      @if (reporteGrupo()?.fechaImpresionExamen) {
                        <div class="text-xs font-mono font-black text-foreground">
                          {{ formatearFechaHora(reporteGrupo()?.fechaImpresionExamen) }}
                        </div>
                        <span class="text-[10px] text-blue-600 font-bold inline-flex items-center gap-1 mt-0.5">
                          <i class="pi pi-check text-[9px]"></i> Cartillas Impresas
                        </span>
                      } @else {
                        <div class="text-xs font-bold text-muted-foreground">Sin impresión</div>
                        <span class="text-[10px] text-muted-foreground font-medium mt-0.5 block">Hito abierto</span>
                      }
                    </div>

                  </div>

                </div>

                <!-- KPI Summary Cards Forenses -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  
                  <!-- Total Estudiantes -->
                  <div class="bg-muted/30 border border-border rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-1">Total Alumnos Nómina SEA</span>
                    <div class="text-2xl font-black text-foreground font-mono">
                      {{ reporteGrupo()?.totalEstudiantes }}
                    </div>
                    <span class="text-[10px] text-muted-foreground mt-0.5 block">Registrados en Gateway</span>
                  </div>

                  <!-- Regulares -->
                  <div class="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 block mb-1">Nómina Regular (Oportuna)</span>
                    <div class="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      {{ reporteGrupo()?.totalRegulares }}
                    </div>
                    <span class="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold mt-0.5 block">
                      Inscritos antes de generar examen
                    </span>
                  </div>

                  <!-- Toma Tardía -->
                  <div class="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400 block mb-1">Toma Tardía (Post-Gen)</span>
                    <div class="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
                      {{ reporteGrupo()?.totalTardios }}
                    </div>
                    <span class="text-[10px] text-amber-600 dark:text-amber-500 font-bold mt-0.5 block">
                      Inscritos post-generación Typst
                    </span>
                  </div>

                  <!-- Extemporáneos Post-Impresión -->
                  <div class="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-rose-700 dark:text-rose-400 block mb-1">Extemporáneo (Post-Impr)</span>
                    <div class="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
                      {{ reporteGrupo()?.totalExtemporaneos }}
                    </div>
                    <span class="text-[10px] text-rose-600 dark:text-rose-500 font-bold mt-0.5 block">
                      Inscritos DESPUÉS de imprimir
                    </span>
                  </div>

                </div>

                <!-- Dictamen / Alerta Pericial si hay extemporáneos o tardíos -->
                @if ((reporteGrupo()?.totalExtemporaneos ?? 0) > 0 || (reporteGrupo()?.totalTardios ?? 0) > 0) {
                  <div class="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                    <i class="pi pi-exclamation-triangle text-xl text-amber-600 mt-0.5 shrink-0"></i>
                    <div>
                      <h5 class="text-xs font-black uppercase tracking-wide">Dictamen Institucional de Trazabilidad</h5>
                      <p class="text-xs mt-1 leading-relaxed">
                        Se evidencia que <strong>{{ (reporteGrupo()?.totalExtemporaneos ?? 0) + (reporteGrupo()?.totalTardios ?? 0) }} estudiantes</strong> fueron incorporados a la nómina de esta materia con posterioridad a la fecha en que se generaron o imprimieron los instrumentos de evaluación. 
                        Las cartillas físicas no incluyeron a estos estudiantes debido a que su toma de grupo fue realizada de forma extemporánea por la Dirección de Carrera o la administración académica.
                      </p>
                    </div>
                  </div>
                }

              </div>

              <!-- Tabla de Alumnos con su Dictamen Forense Individual -->
              <div class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                
                <div class="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-foreground uppercase tracking-wider">
                      Detalle de Estudiantes & Peritaje Individual
                    </span>
                    <span class="bg-purple-100 text-purple-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                      {{ estudiantesGrupoFiltrados().length }} alumnos
                    </span>
                  </div>

                  <!-- Filtro por Dictamen Forense -->
                  <div class="flex items-center gap-2">
                    <label class="text-[10px] font-bold text-muted-foreground uppercase">Filtrar:</label>
                    <select 
                      [ngModel]="filtroDictamenEstudiantes()"
                      (ngModelChange)="filtroDictamenEstudiantes.set($event)"
                      class="bg-card border border-border rounded-xl px-2.5 py-1 text-xs font-bold text-foreground outline-none">
                      <option value="TODOS">Todos los alumnos</option>
                      <option value="REGULAR">Solo Regulares (Oportunos)</option>
                      <option value="TOMA_TARDIA">Solo Tomas Tardías</option>
                      <option value="EXTEMPORANEO_POST_IMPRESION">Solo Extemporáneos Post-Impresión</option>
                    </select>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr class="bg-muted/60 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        <th class="p-3.5 w-12 text-center">N°</th>
                        <th class="p-3.5 w-32">Código SIS</th>
                        <th class="p-3.5 min-w-[200px]">Apellidos y Nombres</th>
                        <th class="p-3.5 w-36">Fecha Registro SEA</th>
                        <th class="p-3.5 w-36">Última Modif. SEA</th>
                        <th class="p-3.5 text-center w-36">Dictamen Forense</th>
                        <th class="p-3.5 min-w-[260px]">Diagnóstico Pericial</th>
                        <th class="p-3.5 text-center w-20">Variante</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border font-medium text-foreground">
                      @for (est of estudiantesGrupoFiltrados(); track est.studentCode; let idx = $index) {
                        <tr class="hover:bg-muted/20 transition-colors" [class.bg-rose-50]="est.estadoForense === 'EXTEMPORANEO_POST_IMPRESION'">
                          
                          <!-- N° -->
                          <td class="p-3.5 text-center font-mono text-muted-foreground text-[11px]">
                            {{ idx + 1 }}
                          </td>

                          <!-- Código SIS -->
                          <td class="p-3.5 font-mono font-bold text-foreground text-xs">
                            {{ est.studentCode }}
                          </td>

                          <!-- Nombre Completo -->
                          <td class="p-3.5">
                            <div class="font-black text-foreground">{{ est.fullName }}</div>
                            <span class="text-[10px] text-muted-foreground">Estado: {{ est.courseState }}</span>
                          </td>

                          <!-- Fecha de Registro en SEA -->
                          <td class="p-3.5 font-mono text-[11px]">
                            @if (est.enrollCreatedAt) {
                              <div class="font-bold text-foreground">
                                {{ formatearSoloFecha(est.enrollCreatedAt) }}
                              </div>
                              <div class="text-[10px] text-muted-foreground">
                                {{ formatearSoloHora(est.enrollCreatedAt) }}
                              </div>
                            } @else {
                              <span class="text-muted-foreground italic text-[10px]">No registrado</span>
                            }
                          </td>

                          <!-- Fecha de Modificación en SEA -->
                          <td class="p-3.5 font-mono text-[11px]">
                            @if (est.enrollUpdatedAt) {
                              <div class="font-bold text-foreground">
                                {{ formatearSoloFecha(est.enrollUpdatedAt) }}
                              </div>
                              <div class="text-[10px] text-muted-foreground">
                                {{ formatearSoloHora(est.enrollUpdatedAt) }}
                              </div>
                            } @else {
                              <span class="text-muted-foreground italic text-[10px]">-</span>
                            }
                          </td>

                          <!-- Dictamen Forense Badge -->
                          <td class="p-3.5 text-center">
                            <span 
                              [class]="obtenerClaseBadgeForense(est.estadoForense)"
                              class="text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 uppercase tracking-tight">
                              <i [class]="obtenerIconoForense(est.estadoForense)" class="text-[8px]"></i>
                              <span>{{ obtenerTextoEstadoForense(est.estadoForense) }}</span>
                            </span>
                          </td>

                          <!-- Diagnóstico Pericial -->
                          <td class="p-3.5">
                            <p class="text-xs leading-snug" [class.text-rose-700]="est.estadoForense === 'EXTEMPORANEO_POST_IMPRESION'" [class.text-amber-700]="est.estadoForense === 'TOMA_TARDIA'">
                              {{ est.mensajeForense }}
                            </p>
                          </td>

                          <!-- Letra Variante -->
                          <td class="p-3.5 text-center font-mono">
                            @if (est.letraVariante) {
                              <span class="bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 font-black px-2 py-0.5 rounded text-xs border border-purple-200 dark:border-purple-800">
                                {{ est.letraVariante }}
                              </span>
                            } @else {
                              <span class="text-muted-foreground text-[10px]">-</span>
                            }
                          </td>

                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

          }

          <!-- =============================================================== -->
          <!-- RESULTADO MODO B: HISTORIAL GLOBAL POR ESTUDIANTE             -->
          <!-- =============================================================== -->
          @if (!cargandoForense() && modoBusquedaToma() === 'estudiante' && reporteEstudiante()) {
            
            <div class="space-y-6 animate-fade-in">
              
              <!-- Ficha del Estudiante -->
              <div class="bg-card border border-border rounded-2xl p-6 shadow-xs">
                
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                  <div class="flex items-center gap-3">
                    <div class="h-12 w-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl font-black">
                      <i class="pi pi-user"></i>
                    </div>
                    <div>
                      <h3 class="text-xl font-black text-foreground tracking-tight">
                        {{ reporteEstudiante()?.fullName }}
                      </h3>
                      <p class="text-xs text-muted-foreground mt-0.5">
                        Código SIS / SEA: <span class="font-mono font-bold text-foreground">{{ reporteEstudiante()?.studentCode }}</span>
                        · Carrera: <span class="font-bold text-foreground">{{ reporteEstudiante()?.carreraNombre || reporteEstudiante()?.carreraCodigo }}</span>
                        · Sede: <span class="font-bold text-foreground">{{ reporteEstudiante()?.sedeNombre || 'General' }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- KPI Summary Cards Estudiante -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  
                  <!-- Total Materias -->
                  <div class="bg-muted/30 border border-border rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-1">Materias Registradas</span>
                    <div class="text-2xl font-black text-foreground font-mono">
                      {{ reporteEstudiante()?.totalMateriasInscritas }}
                    </div>
                    <span class="text-[10px] text-muted-foreground mt-0.5 block">Historial en el sistema</span>
                  </div>

                  <!-- Regulares -->
                  <div class="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 block mb-1">Tomas Regulares</span>
                    <div class="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      {{ reporteEstudiante()?.totalRegulares }}
                    </div>
                    <span class="text-[10px] text-emerald-600 font-bold mt-0.5 block">Previas a generación</span>
                  </div>

                  <!-- Tardíos -->
                  <div class="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400 block mb-1">Tomas Tardías</span>
                    <div class="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
                      {{ reporteEstudiante()?.totalTardios }}
                    </div>
                    <span class="text-[10px] text-amber-600 font-bold mt-0.5 block">Post-generación Typst</span>
                  </div>

                  <!-- Extemporáneos -->
                  <div class="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-rose-700 dark:text-rose-400 block mb-1">Extemporáneos</span>
                    <div class="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
                      {{ reporteEstudiante()?.totalExtemporaneos }}
                    </div>
                    <span class="text-[10px] text-rose-600 font-bold mt-0.5 block">Post-impresión de examen</span>
                  </div>

                </div>

              </div>

              <!-- Tabla de Todas las Materias del Estudiante -->
              <div class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                
                <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-foreground uppercase tracking-wider">
                      Historial de Inscripciones & Materias Asignadas
                    </span>
                    <span class="bg-purple-100 text-purple-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                      {{ reporteEstudiante()?.materias?.length || 0 }} materias
                    </span>
                  </div>
                  <span class="text-[11px] text-muted-foreground">
                    Peritaje cruzado con exámenes impresos
                  </span>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr class="bg-muted/60 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        <th class="p-3.5 w-12 text-center">N°</th>
                        <th class="p-3.5 min-w-[220px]">Asignatura / Materia</th>
                        <th class="p-3.5 min-w-[140px]">Grupo & Docente</th>
                        <th class="p-3.5 w-36">Fecha Registro SEA</th>
                        <th class="p-3.5 w-36">Generación Examen</th>
                        <th class="p-3.5 text-center w-36">Dictamen Forense</th>
                        <th class="p-3.5 min-w-[260px]">Diagnóstico Pericial</th>
                        <th class="p-3.5 text-center w-20">Variante</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border font-medium text-foreground">
                      @for (mat of reporteEstudiante()?.materias; track mat.groupId; let idx = $index) {
                        <tr class="hover:bg-muted/20 transition-colors" [class.bg-rose-50]="mat.estadoForense === 'EXTEMPORANEO_POST_IMPRESION'">
                          
                          <!-- N° -->
                          <td class="p-3.5 text-center font-mono text-muted-foreground text-[11px]">
                            {{ idx + 1 }}
                          </td>

                          <!-- Asignatura -->
                          <td class="p-3.5">
                            <div class="font-black text-foreground">{{ mat.materiaNombre || mat.syllabusCourseId }}</div>
                            <span class="text-[10px] text-muted-foreground">
                              {{ mat.carreraNombre }} ({{ mat.carreraCodigo }})
                            </span>
                          </td>

                          <!-- Grupo & Docente -->
                          <td class="p-3.5">
                            <div class="font-bold text-foreground">Grupo: {{ mat.groupId }}</div>
                            <span class="text-[10px] text-muted-foreground block truncate max-w-[180px]">
                              {{ mat.docenteNombre || 'Sin docente asignado' }}
                            </span>
                          </td>

                          <!-- Fecha Registro SEA -->
                          <td class="p-3.5 font-mono text-[11px]">
                            @if (mat.enrollCreatedAt) {
                              <div class="font-bold text-foreground">
                                {{ formatearSoloFecha(mat.enrollCreatedAt) }}
                              </div>
                              <div class="text-[10px] text-muted-foreground">
                                {{ formatearSoloHora(mat.enrollCreatedAt) }}
                              </div>
                            } @else {
                              <span class="text-muted-foreground italic text-[10px]">No registrado</span>
                            }
                          </td>

                          <!-- Fecha de Generación de Examen -->
                          <td class="p-3.5 font-mono text-[11px]">
                            @if (mat.fechaGeneracionExamen) {
                              <div class="font-bold text-foreground">
                                {{ formatearSoloFecha(mat.fechaGeneracionExamen) }}
                              </div>
                              <div class="text-[10px] text-muted-foreground">
                                {{ formatearSoloHora(mat.fechaGeneracionExamen) }}
                              </div>
                            } @else {
                              <span class="text-muted-foreground italic text-[10px]">Sin examen</span>
                            }
                          </td>

                          <!-- Dictamen Forense Badge -->
                          <td class="p-3.5 text-center">
                            <span 
                              [class]="obtenerClaseBadgeForense(mat.estadoForense)"
                              class="text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 uppercase tracking-tight">
                              <i [class]="obtenerIconoForense(mat.estadoForense)" class="text-[8px]"></i>
                              <span>{{ obtenerTextoEstadoForense(mat.estadoForense) }}</span>
                            </span>
                          </td>

                          <!-- Diagnóstico Pericial -->
                          <td class="p-3.5">
                            <p class="text-xs leading-snug" [class.text-rose-700]="mat.estadoForense === 'EXTEMPORANEO_POST_IMPRESION'" [class.text-amber-700]="mat.estadoForense === 'TOMA_TARDIA'">
                              {{ mat.mensajeForense }}
                            </p>
                          </td>

                          <!-- Letra Variante -->
                          <td class="p-3.5 text-center font-mono">
                            @if (mat.letraVariante) {
                              <span class="bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 font-black px-2 py-0.5 rounded text-xs border border-purple-200 dark:border-purple-800">
                                {{ mat.letraVariante }}
                              </span>
                            } @else {
                              <span class="text-muted-foreground text-[10px]">-</span>
                            }
                          </td>

                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

          }

        </div>

      }

      <!-- =================================================================== -->
      <!-- PESTAÑA 2: BITÁCORA GENERAL DE ACCESOS & SEGURIDAD                 -->
      <!-- =================================================================== -->
      @if (tabActual() === 'bitacora') {
        
        <div class="space-y-6">

          <!-- KPI Summary Cards de Bitácora -->
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
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              
              <!-- Búsqueda General -->
              <div class="lg:col-span-4">
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
              <div class="lg:col-span-3">
                <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <i class="pi pi-th-large text-primary text-[10px]"></i> Módulo
                </label>
                <select 
                  [ngModel]="filtroModulo()"
                  (ngModelChange)="filtroModulo.set($event)"
                  class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
                  <option value="TODOS">Todos los Módulos</option>
                  <option value="Autenticación y Sesiones">Autenticación y Sesiones</option>
                  <option value="Usuarios y Accesos">Usuarios y Accesos</option>
                  <option value="Administración de Evaluaciones">Administración de Evaluaciones</option>
                  <option value="Evaluaciones">Evaluaciones</option>
                  <option value="Banco de Preguntas">Banco de Preguntas</option>
                  <option value="Generación Typst">Generación de exámenes</option>
                  <option value="Calificación OMR">Calificación OMR</option>
                  <option value="Examen Virtual">Examen Virtual</option>
                  <option value="Sincronización Institucional (SEA)">Sincronización Institucional (SEA)</option>
                  <option value="Respaldos">Respaldos</option>
                  <option value="Verificación de Exámenes">Verificación de Exámenes</option>
                </select>
              </div>

              <!-- Filtro por Nivel de Criticidad -->
              <div class="lg:col-span-2">
                <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <i class="pi pi-flag text-primary text-[10px]"></i> Severidad
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

              <!-- Filtro por Rango de Fechas -->
              <div class="lg:col-span-3 flex gap-2 items-end">
                <div class="flex-1 min-w-0">
                  <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <i class="pi pi-calendar text-primary text-[10px]"></i> Desde
                  </label>
                  <input 
                    type="date" 
                    [ngModel]="fechaInicio()"
                    (ngModelChange)="fechaInicio.set($event); cargarAuditoria()"
                    class="w-full bg-muted/60 border border-border rounded-xl px-2 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary">
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <i class="pi pi-calendar text-primary text-[10px]"></i> Hasta
                  </label>
                  <input 
                    type="date" 
                    [ngModel]="fechaFin()"
                    (ngModelChange)="fechaFin.set($event); cargarAuditoria()"
                    class="w-full bg-muted/60 border border-border rounded-xl px-2 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary">
                </div>
                @if (fechaInicio() || fechaFin()) {
                  <button 
                    (click)="limpiarFechas()"
                    class="bg-muted hover:bg-muted/80 text-foreground border border-border p-2 rounded-xl text-xs transition-colors shrink-0"
                    title="Limpiar fechas">
                    <i class="pi pi-times"></i>
                  </button>
                }
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

        </div>

      }

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Control de Pestañas
  public tabActual = signal<'toma-grupos' | 'bitacora'>('toma-grupos');

  // Bitácora de Accesos
  public cargando = signal<boolean>(false);
  public resumen = signal<AuditoriaResumen | null>(null);
  public items = signal<AuditoriaGlobalItem[]>([]);
  public busquedaTexto = signal<string>('');
  public filtroModulo = signal<string>('TODOS');
  public filtroNivel = signal<string>('TODOS');
  public fechaInicio = signal<string>('');
  public fechaFin = signal<string>('');
  public registroSeleccionado = signal<AuditoriaGlobalItem | null>(null);

  // Trazabilidad Forense de Toma de Grupos
  public modoBusquedaToma = signal<'grupo' | 'estudiante'>('grupo');
  public cargandoForense = signal<boolean>(false);
  public descargandoExcel = signal<boolean>(false);
  public inputGrupoId = signal<string>('');
  public inputEstudianteCodigo = signal<string>('');
  public inputEstudianteGestion = signal<string>('2-2026');
  public reporteGrupo = signal<AuditoriaTomaGrupoReporte | null>(null);
  public reporteEstudiante = signal<AuditoriaEstudianteGlobal | null>(null);
  public filtroDictamenEstudiantes = signal<string>('TODOS');

  public ngOnInit(): void {
    // Escuchar parámetros de consulta en la URL (permite navegación directa desde otros módulos)
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      const groupId = params['groupId'];
      const rolExamenId = params['rolExamenId'];
      const studentCode = params['studentCode'];

      if (tab === 'bitacora') {
        this.tabActual.set('bitacora');
        this.cargarAuditoria();
      } else if (groupId) {
        this.tabActual.set('toma-grupos');
        this.modoBusquedaToma.set('grupo');
        this.inputGrupoId.set(groupId);
        this.buscarTomaGrupo();
      } else if (rolExamenId) {
        this.tabActual.set('toma-grupos');
        this.modoBusquedaToma.set('grupo');
        this.consultarPorRol(rolExamenId);
      } else if (studentCode) {
        this.tabActual.set('toma-grupos');
        this.modoBusquedaToma.set('estudiante');
        this.inputEstudianteCodigo.set(studentCode);
        this.buscarTomaEstudiante();
      } else {
        // Carga por defecto
        this.tabActual.set('toma-grupos');
      }
    });
  }

  public cambiarTab(tab: 'toma-grupos' | 'bitacora'): void {
    this.tabActual.set(tab);
    if (tab === 'bitacora' && this.items().length === 0) {
      this.cargarAuditoria();
    }
  }

  // =========================================================================
  // Métodos de Trazabilidad Forense de Toma de Grupos
  // =========================================================================

  public buscarTomaGrupo(): void {
    const groupId = this.inputGrupoId().trim();
    if (!groupId) {
      void this.feedback.mostrar('Ingresa un ID de Grupo para auditar.', 'Atención', 'warning');
      return;
    }

    this.cargandoForense.set(true);
    this.reporteGrupo.set(null);

    this.auditoriaService.obtenerAuditoriaTomaGrupo(groupId).subscribe({
      next: (data) => {
        this.reporteGrupo.set(data);
        this.cargandoForense.set(false);
        const tardios = data.totalTardios + data.totalExtemporaneos;
        if (tardios > 0) {
          void this.feedback.mostrar(
            `Auditoría completada: Se identificaron ${tardios} estudiante(s) con registro posterior a la generación/impresión.`,
            'Dictamen Forense Detectado',
            'warning'
          );
        } else {
          void this.feedback.mostrar(
            `Nómina auditada: Todos los ${data.totalEstudiantes} estudiantes cuentan con registro oportuno previo al examen.`,
            'Nómina Conforme',
            'success'
          );
        }
      },
      error: (err) => {
        console.error('Error al consultar auditoría de toma de grupo:', err);
        this.cargandoForense.set(false);
        void this.feedback.mostrar(
          'No se pudo obtener la información de la nómina. Verifica que el ID de grupo sea válido.',
          'Error de Consulta',
          'error'
        );
      }
    });
  }

  public consultarPorRol(rolExamenId: string): void {
    this.cargandoForense.set(true);
    this.reporteGrupo.set(null);

    this.auditoriaService.obtenerAuditoriaTomaRol(rolExamenId).subscribe({
      next: (data) => {
        this.reporteGrupo.set(data);
        this.inputGrupoId.set(data.groupId || '');
        this.cargandoForense.set(false);
      },
      error: (err) => {
        console.error('Error al consultar auditoría por rol:', err);
        this.cargandoForense.set(false);
        void this.feedback.mostrar('No se encontró el rol de examen solicitado.', 'Error', 'error');
      }
    });
  }

  public limpiarBusquedaGrupo(): void {
    this.inputGrupoId.set('');
    this.reporteGrupo.set(null);
  }

  public buscarTomaEstudiante(): void {
    const studentCode = this.inputEstudianteCodigo().trim();
    if (!studentCode) {
      void this.feedback.mostrar('Ingresa el código del estudiante.', 'Atención', 'warning');
      return;
    }

    this.cargandoForense.set(true);
    this.reporteEstudiante.set(null);

    const term = this.inputEstudianteGestion().trim() || undefined;

    this.auditoriaService.buscarEstudianteTomaGrupos(studentCode, term).subscribe({
      next: (data) => {
        this.reporteEstudiante.set(data);
        this.cargandoForense.set(false);
        const anomalos = data.totalTardios + data.totalExtemporaneos;
        if (anomalos > 0) {
          void this.feedback.mostrar(
            `Estudiante analizado: Presenta ${anomalos} materia(s) con toma de grupo extemporánea o tardía.`,
            'Alerta de Trazabilidad',
            'warning'
          );
        } else {
          void this.feedback.mostrar(
            `Estudiante analizado: Todas sus ${data.totalMateriasInscritas} materias presentan registro oportuno.`,
            'Historial Conforme',
            'success'
          );
        }
      },
      error: (err) => {
        console.error('Error al consultar historial del estudiante:', err);
        this.cargandoForense.set(false);
        void this.feedback.mostrar(
          'No se encontraron asignaciones o materias para el código de estudiante indicado.',
          'Sin Registros',
          'warning'
        );
      }
    });
  }

  public limpiarBusquedaEstudiante(): void {
    this.inputEstudianteCodigo.set('');
    this.reporteEstudiante.set(null);
  }

  public descargarActaExcel(): void {
    const rep = this.reporteGrupo();
    if (!rep || !rep.groupId) {
      void this.feedback.mostrar('No hay un grupo consultado para exportar.', 'Atención', 'warning');
      return;
    }

    this.descargandoExcel.set(true);
    this.auditoriaService.descargarActaForenseExcel(rep.groupId).subscribe({
      next: (blob: Blob) => {
        this.descargandoExcel.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const materiaLimpia = (rep.materiaNombre || 'MATERIA').replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `DICTAMEN_FORENSE_GRUPO_${rep.groupId}_${materiaLimpia}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        void this.feedback.mostrar(
          'Acta forense oficial descargada exitosamente en formato Excel institucional.',
          'Descarga Completa',
          'success'
        );
      },
      error: (err) => {
        this.descargandoExcel.set(false);
        console.error('Error al descargar acta forense Excel:', err);
        void this.feedback.mostrar('No se pudo descargar el archivo Excel del servidor.', 'Error', 'error');
      }
    });
  }

  public exportarEstudianteExcel(): void {
    const est = this.reporteEstudiante();
    if (!est || !est.materias || est.materias.length === 0) {
      void this.feedback.mostrar('No hay materias para exportar.', 'Atención', 'warning');
      return;
    }

    const datos = est.materias.map((m, idx) => ({
      'N°': idx + 1,
      'Código Estudiante': est.studentCode,
      'Estudiante': est.fullName,
      'Carrera': est.carreraNombre || est.carreraCodigo || '',
      'Sede': est.sedeNombre || '',
      'Materia': m.materiaNombre || m.syllabusCourseId || '',
      'Grupo ID': m.groupId,
      'Docente': m.docenteNombre || '',
      'Fecha Registro SEA': this.formatearFechaHora(m.enrollCreatedAt),
      'Fecha Modificación SEA': this.formatearFechaHora(m.enrollUpdatedAt),
      'Fecha Generación Examen': this.formatearFechaHora(m.fechaGeneracionExamen),
      'Fecha Impresión Examen': this.formatearFechaHora(m.fechaImpresionExamen),
      'Dictamen Forense': this.obtenerTextoEstadoForense(m.estadoForense),
      'Diagnóstico Pericial': m.mensajeForense,
      'Variante Cartilla': m.letraVariante || 'N/A'
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Historial_Forense');
    const fechaStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `HISTORIAL_FORENSE_${est.studentCode}_${fechaStr}.xlsx`);

    void this.feedback.mostrar(
      `Historial forense del estudiante exportado exitosamente.`,
      'Exportación Completa',
      'success'
    );
  }

  public estudiantesGrupoFiltrados = computed(() => {
    const rep = this.reporteGrupo();
    if (!rep || !rep.estudiantes) return [];
    const filtro = this.filtroDictamenEstudiantes();
    if (filtro === 'TODOS') return rep.estudiantes;
    return rep.estudiantes.filter(e => e.estadoForense === filtro);
  });

  public obtenerClaseBadgeForense(estado: string): string {
    switch (estado) {
      case 'REGULAR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'TOMA_TARDIA':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'EXTEMPORANEO_POST_IMPRESION':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-black';
      case 'SIN_EXAMEN_GENERADO':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  }

  public obtenerIconoForense(estado: string): string {
    switch (estado) {
      case 'REGULAR':
        return 'pi pi-check-circle';
      case 'TOMA_TARDIA':
        return 'pi pi-clock';
      case 'EXTEMPORANEO_POST_IMPRESION':
        return 'pi pi-exclamation-triangle';
      case 'SIN_EXAMEN_GENERADO':
        return 'pi pi-info-circle';
      default:
        return 'pi pi-question-circle';
    }
  }

  public obtenerTextoEstadoForense(estado: string): string {
    switch (estado) {
      case 'REGULAR':
        return 'REGULAR';
      case 'TOMA_TARDIA':
        return 'TOMA TARDÍA';
      case 'EXTEMPORANEO_POST_IMPRESION':
        return 'EXTEMPORÁNEO';
      case 'SIN_EXAMEN_GENERADO':
        return 'SIN EXAMEN';
      default:
        return 'PENDIENTE';
    }
  }

  // =========================================================================
  // Métodos de Bitácora de Accesos
  // =========================================================================

  public cargarAuditoria(): void {
    this.cargando.set(true);
    this.auditoriaService.obtenerAuditoria({
      limite: 500,
      fechaInicio: this.fechaInicio() || undefined,
      fechaFin: this.fechaFin() || undefined
    }).subscribe({
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

  public limpiarFechas(): void {
    this.fechaInicio.set('');
    this.fechaFin.set('');
    this.cargarAuditoria();
  }

  public registrosFiltrados = computed(() => {
    let list = this.items();
    const modulo = this.filtroModulo();
    const nivel = this.filtroNivel();
    const q = this.busquedaTexto().trim().toLowerCase();
    const inicio = this.fechaInicio();
    const fin = this.fechaFin();

    if (modulo !== 'TODOS') {
      list = list.filter(i => i.modulo === modulo);
    }

    if (nivel !== 'TODOS') {
      list = list.filter(i => i.nivel === nivel);
    }

    if (inicio) {
      list = list.filter(i => {
        if (!i.fechaEvento) return false;
        const fechaStr = i.fechaEvento.slice(0, 10);
        return fechaStr >= inicio;
      });
    }

    if (fin) {
      list = list.filter(i => {
        if (!i.fechaEvento) return false;
        const fechaStr = i.fechaEvento.slice(0, 10);
        return fechaStr <= fin;
      });
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
      void this.feedback.mostrar('No hay registros para exportar con los filtros actuales.', 'Atención', 'warning');
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
