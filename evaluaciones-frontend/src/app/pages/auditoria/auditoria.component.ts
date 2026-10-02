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
  AuditoriaEstudianteGlobal,
  AuditoriaEvaluacionItem
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
              <h2 class="text-2xl font-black tracking-tight text-foreground">Auditoría, Peritaje & Bitácora SEA</h2>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Certificación forense de calificaciones, alteraciones de notas, reprogramaciones orales y trazabilidad inmutable de toma de grupos.
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (tabActual() === 'bitacora') {
            <!-- Botón Refrescar Bitácora -->
            <button 
              (click)="cargarAuditoria()"
              [disabled]="cargando()"
              class="bg-muted hover:bg-muted/80 text-foreground border border-border font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              title="Recargar eventos">
              <i class="pi pi-refresh" [class.animate-spin]="cargando()"></i>
              <span class="hidden sm:inline">Actualizar</span>
            </button>

            <!-- Botón Exportar Bitácora a Excel -->
            <button 
              (click)="exportarExcel()"
              [disabled]="cargando() || registrosFiltrados().length === 0"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer">
              <i class="pi pi-file-excel"></i>
              <span>Exportar Bitácora (.xlsx)</span>
            </button>

            <!-- Botón Imprimir Reporte Oficial de Auditoría -->
            <button 
              (click)="imprimirActa()"
              [disabled]="cargando() || registrosFiltrados().length === 0"
              class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer">
              <i class="pi pi-print"></i>
              <span>Imprimir Acta</span>
            </button>
          } @else {
            <!-- Acciones en Pestaña Toma de Grupos y Peritaje -->
            @if (reporteGrupo()) {
              <button 
                (click)="exportarTablaGrupoExcel()"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 cursor-pointer">
                <i class="pi pi-file-excel"></i>
                <span>Exportar Calificaciones (.xlsx)</span>
              </button>

              <button 
                (click)="descargarActaExcel()"
                [disabled]="descargandoExcel() || cargandoForense()"
                class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer">
                <i class="pi" [ngClass]="descargandoExcel() ? 'pi-spin pi-spinner' : 'pi-shield'"></i>
                <span>Acta Forense Institucional</span>
              </button>
            } @else if (modoBusquedaToma() === 'estudiante' && reporteEstudiante()) {
              <button 
                (click)="exportarEstudianteExcel()"
                [disabled]="cargandoForense()"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer">
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
          <i class="pi pi-verified text-sm"></i>
          <span>Peritaje de Calificaciones, Alteraciones & Toma de Grupos</span>
          <span class="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Auditoría Forense
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
      <!-- PESTAÑA 1: PERITAJE DE CALIFICACIONES & TRAZABILIDAD DE NÓMINA     -->
      <!-- =================================================================== -->
      @if (tabActual() === 'toma-grupos') {
        
        <div class="space-y-6">

          <!-- Selector de Sub-Modalidad: Buscador de Evaluaciones / ID Grupo / Por Estudiante -->
          <div class="bg-card border border-border rounded-2xl p-4 shadow-xs">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div class="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border self-start">
                <button 
                  (click)="modoBusquedaToma.set('evaluacion')"
                  [class]="modoBusquedaToma() === 'evaluacion' ? 'bg-card text-purple-800 dark:text-purple-300 shadow-xs font-black' : 'text-muted-foreground hover:text-foreground font-bold'"
                  class="px-3.5 py-2 text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer">
                  <i class="pi pi-search"></i>
                  <span>Buscador de Evaluaciones</span>
                </button>
                <button 
                  (click)="modoBusquedaToma.set('grupo')"
                  [class]="modoBusquedaToma() === 'grupo' ? 'bg-card text-purple-800 dark:text-purple-300 shadow-xs font-black' : 'text-muted-foreground hover:text-foreground font-bold'"
                  class="px-3.5 py-2 text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer">
                  <i class="pi pi-hashtag"></i>
                  <span>Por ID Grupo SEA</span>
                </button>
                <button 
                  (click)="modoBusquedaToma.set('estudiante')"
                  [class]="modoBusquedaToma() === 'estudiante' ? 'bg-card text-purple-800 dark:text-purple-300 shadow-xs font-black' : 'text-muted-foreground hover:text-foreground font-bold'"
                  class="px-3.5 py-2 text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer">
                  <i class="pi pi-user"></i>
                  <span>Historial por Estudiante</span>
                </button>
              </div>

              <div class="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <i class="pi pi-info-circle text-blue-600"></i>
                <span>Permite auditar el origen OMR vs reprogramaciones orales y modificaciones manuales.</span>
              </div>

            </div>

            <!-- Formulario de Búsqueda según la sub-modalidad -->
            <div class="mt-4 pt-4 border-t border-border">
              
              <!-- MODO 1: BUSCADOR INTERACTIVO DE EVALUACIONES -->
              @if (modoBusquedaToma() === 'evaluacion') {
                <div class="space-y-3">
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    
                    <div class="md:col-span-6">
                      <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                        <i class="pi pi-book text-primary text-[10px]"></i> Asignatura, Grupo (ej. TA-02), Código o Docente
                      </label>
                      <div class="relative">
                        <input 
                          type="text" 
                          [ngModel]="criterioBusquedaEvaluacion()"
                          (ngModelChange)="criterioBusquedaEvaluacion.set($event)"
                          (keyup.enter)="buscarEvaluaciones()"
                          placeholder="Ej. Farmacología, TA-01, MED-101, Pérez..."
                          class="w-full bg-muted/60 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary">
                        <i class="pi pi-search absolute left-3 top-3 text-muted-foreground text-xs"></i>
                      </div>
                    </div>

                    <div class="md:col-span-3">
                      <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                        <i class="pi pi-map-marker text-primary text-[10px]"></i> Sede
                      </label>
                      <select 
                        [ngModel]="filtroSedeEvaluacion()"
                        (ngModelChange)="filtroSedeEvaluacion.set($event)"
                        class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary">
                        <option value="TODAS">Todas las sedes</option>
                        <option value="CBBA">Cochabamba</option>
                        <option value="LPZ">La Paz</option>
                        <option value="SCZ">Santa Cruz</option>
                        <option value="CAR">Caranavi</option>
                        <option value="YAC">Yacuiba</option>
                      </select>
                    </div>

                    <div class="md:col-span-3 flex gap-2">
                      <button 
                        (click)="buscarEvaluaciones()"
                        [disabled]="buscandoEvaluaciones()"
                        class="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform hover:scale-102 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer">
                        <i class="pi" [ngClass]="buscandoEvaluaciones() ? 'pi-spin pi-spinner' : 'pi-search'"></i>
                        <span>Buscar Evaluaciones</span>
                      </button>
                      
                      @if (criterioBusquedaEvaluacion()) {
                        <button 
                          (click)="limpiarBusquedaEvaluaciones()"
                          class="bg-muted hover:bg-muted/80 text-foreground border border-border p-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                          title="Limpiar">
                          <i class="pi pi-times"></i>
                        </button>
                      }
                    </div>

                  </div>

                  <!-- Resultados rápidos del buscador de evaluaciones -->
                  @if (listaEvaluaciones().length > 0) {
                    <div class="mt-4 pt-4 border-t border-border space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-black uppercase tracking-wider text-foreground">
                          Evaluaciones Encontradas ({{ listaEvaluaciones().length }})
                        </span>
                        <span class="text-[10px] text-muted-foreground">Selecciona una para iniciar el peritaje forense</span>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                        @for (ev of listaEvaluaciones(); track ev.rolExamenId) {
                          <div 
                            class="p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-2.5"
                            [class.bg-purple-50]="reporteGrupo()?.rolExamenId === ev.rolExamenId"
                            [class.border-purple-400]="reporteGrupo()?.rolExamenId === ev.rolExamenId"
                            [class.bg-card]="reporteGrupo()?.rolExamenId !== ev.rolExamenId"
                            [class.border-border]="reporteGrupo()?.rolExamenId !== ev.rolExamenId"
                            [class.hover:border-purple-300]="reporteGrupo()?.rolExamenId !== ev.rolExamenId">
                            
                            <div>
                              <div class="flex items-center justify-between gap-1 mb-1">
                                <span class="bg-purple-100 text-purple-900 font-mono font-black text-[9px] px-1.5 py-0.5 rounded">
                                  Grupo {{ ev.grupo }}
                                </span>
                                <span class="bg-muted text-muted-foreground font-mono text-[9px] px-1.5 py-0.5 rounded">
                                  {{ ev.sedeNombre || ev.campus || 'General' }}
                                </span>
                              </div>
                              <h5 class="font-black text-foreground text-xs leading-snug line-clamp-1" [title]="ev.materiaNombre">
                                {{ ev.materiaNombre }}
                              </h5>
                              <p class="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                {{ ev.carreraNombre || ev.carreraCodigo }} · Docente: <span class="font-bold text-foreground">{{ ev.docenteNombre || 'No asignado' }}</span>
                              </p>
                              <div class="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                                <span>{{ ev.estudiantesInscritosCount || 0 }} inscritos</span>
                                <span>·</span>
                                <span class="text-purple-700 dark:text-purple-300 font-bold">{{ ev.modalidad || 'PRESENCIAL' }}</span>
                              </div>
                            </div>

                            <button 
                              (click)="seleccionarEvaluacion(ev)"
                              class="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer">
                              <i class="pi pi-shield-check text-xs"></i>
                              <span>Auditar Esta Evaluación</span>
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- MODO 2: BUSCADOR POR ID DE GRUPO SEA -->
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
                        class="bg-muted hover:bg-muted/80 text-foreground border border-border p-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                        title="Limpiar">
                        <i class="pi pi-times"></i>
                      </button>
                    }
                  </div>

                </div>
              }

              <!-- MODO 3: HISTORIAL GLOBAL POR ESTUDIANTE -->
              @if (modoBusquedaToma() === 'estudiante') {
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
                        class="bg-muted hover:bg-muted/80 text-foreground border border-border p-2.5 rounded-xl text-xs transition-colors cursor-pointer"
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
              <h4 class="text-sm font-black text-foreground">Consultando Trazabilidad Forense & Calificaciones</h4>
              <p class="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Verificando calificaciones OMR automáticas, notas de reprogramación oral, alteraciones manuales e inscripciones de nómina...
              </p>
            </div>
          }

          <!-- =============================================================== -->
          <!-- RESULTADO MODO A: AUDITORÍA POR MATERIA / EVALUACIÓN           -->
          <!-- =============================================================== -->
          @if (!cargandoForense() && reporteGrupo()) {
            
            <div class="space-y-6 animate-fade-in">
              
              <!-- Ficha Informativa de la Evaluación -->
              <div class="bg-card border border-border rounded-2xl p-6 shadow-xs">
                
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
                  <div>
                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span class="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        Grupo: {{ reporteGrupo()?.groupCode || reporteGrupo()?.groupId }}
                      </span>
                      @if (reporteGrupo()?.syllabusCourseId) {
                        <span class="bg-muted text-muted-foreground text-[10px] font-mono px-2 py-0.5 rounded-md">
                          Código: {{ reporteGrupo()?.syllabusCourseId }}
                        </span>
                      }
                      @if (reporteGrupo()?.estadoExamen) {
                        <span class="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Estado: {{ reporteGrupo()?.estadoExamen }}
                        </span>
                      }
                      @if (reporteGrupo()?.term) {
                        <span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
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

                <!-- KPI Summary Cards Forenses & Calificaciones -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6">
                  
                  <!-- Total Estudiantes -->
                  <div class="bg-muted/30 border border-border rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-1">Total Estudiantes</span>
                    <div class="text-2xl font-black text-foreground font-mono">
                      {{ reporteGrupo()?.totalEstudiantes }}
                    </div>
                    <span class="text-[10px] text-muted-foreground mt-0.5 block">Nómina auditada</span>
                  </div>

                  <!-- Calificados (Aprobados / Reprobados) -->
                  <div class="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                    <span class="text-[10px] font-mono font-bold uppercase text-emerald-800 dark:text-emerald-400 block mb-1">Calificados</span>
                    <div class="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                      {{ reporteGrupo()?.totalCalificados }}
                    </div>
                    <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5 block">
                      {{ reporteGrupo()?.totalAprobados }} Aprobados · {{ reporteGrupo()?.totalReprobados }} Reprobados
                    </span>
                  </div>

                  <!-- Notas Reprogramadas / Examen Oral -->
                  <div 
                    class="rounded-xl p-4 border"
                    [ngClass]="(reporteGrupo()?.totalReprogramados ?? 0) !== 0 ? 'bg-amber-50 border-amber-300' : 'bg-muted/30 border-border'">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[10px] font-mono font-bold uppercase text-amber-900 dark:text-amber-300">
                        🚨 Reprogramados Orales
                      </span>
                      @if ((reporteGrupo()?.totalReprogramados ?? 0) > 0) {
                        <span class="bg-amber-200 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">ALERTA</span>
                      }
                    </div>
                    <div class="text-2xl font-black font-mono text-amber-800 dark:text-amber-300">
                      {{ reporteGrupo()?.totalReprogramados }}
                    </div>
                    <span class="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-0.5 block">
                      Sin cartilla OMR (Oral)
                    </span>
                  </div>

                  <!-- Ajustes Manuales -->
                  <div 
                    class="rounded-xl p-4 border"
                    [ngClass]="(reporteGrupo()?.totalAjustados ?? 0) !== 0 ? 'bg-purple-50 border-purple-300' : 'bg-muted/30 border-border'">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[10px] font-mono font-bold uppercase text-purple-900 dark:text-purple-300">
                        ⚠️ Ajustes Manuales
                      </span>
                      @if ((reporteGrupo()?.totalAjustados ?? 0) > 0) {
                        <span class="bg-purple-200 text-purple-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">AUDITAR</span>
                      }
                    </div>
                    <div class="text-2xl font-black font-mono text-purple-800 dark:text-purple-300">
                      {{ reporteGrupo()?.totalAjustados }}
                    </div>
                    <span class="text-[10px] text-purple-700 dark:text-purple-400 font-bold mt-0.5 block">
                      Modificaciones registradas
                    </span>
                  </div>

                  <!-- Tomas Tardías y Extemporáneas -->
                  <div 
                    class="rounded-xl p-4 border"
                    [ngClass]="((reporteGrupo()?.totalExtemporaneos ?? 0) + (reporteGrupo()?.totalTardios ?? 0)) !== 0 ? 'bg-rose-50 border-rose-300' : 'bg-muted/30 border-border'">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[10px] font-mono font-bold uppercase text-rose-900 dark:text-rose-300">
                        Inscripción Tardía
                      </span>
                    </div>
                    <div class="text-2xl font-black font-mono text-rose-800 dark:text-rose-300">
                      {{ (reporteGrupo()?.totalExtemporaneos ?? 0) + (reporteGrupo()?.totalTardios ?? 0) }}
                    </div>
                    <span class="text-[10px] text-rose-700 dark:text-rose-400 font-bold mt-0.5 block">
                      {{ reporteGrupo()?.totalExtemporaneos }} Post-Impr · {{ reporteGrupo()?.totalTardios }} Post-Gen
                    </span>
                  </div>

                </div>

                <!-- Dictamen / Alerta Pericial si hay alteraciones de notas o extemporáneos -->
                @if ((reporteGrupo()?.totalReprogramados ?? 0) > 0 || (reporteGrupo()?.totalAjustados ?? 0) > 0 || (reporteGrupo()?.totalExtemporaneos ?? 0) > 0) {
                  <div class="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                    <i class="pi pi-exclamation-triangle text-xl text-amber-600 mt-0.5 shrink-0"></i>
                    <div>
                      <h5 class="text-xs font-black uppercase tracking-wide">Dictamen Institucional de Peritaje & Auditoría</h5>
                      <p class="text-xs mt-1 leading-relaxed">
                        @if ((reporteGrupo()?.totalReprogramados ?? 0) > 0 || (reporteGrupo()?.totalAjustados ?? 0) > 0) {
                          Se identificaron <strong>{{ reporteGrupo()?.totalReprogramados }} notas de examen oral reprogramado</strong> y <strong>{{ reporteGrupo()?.totalAjustados }} alteraciones manuales</strong> en las calificaciones. Cada una cuenta con responsable, fecha y justificación auditable.
                        }
                        @if ((reporteGrupo()?.totalExtemporaneos ?? 0) > 0) {
                          Adicionalmente, <strong>{{ reporteGrupo()?.totalExtemporaneos }} estudiantes</strong> fueron incorporados a la nómina con posterioridad a la impresión de cartillas OMR.
                        }
                      </p>
                    </div>
                  </div>
                }

              </div>

              <!-- SECCIÓN DESPLEGABLE: LÍNEA DE TIEMPO & BITÁCORA INMUTABLE DE LA EVALUACIÓN -->
              <div class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                <button 
                  (click)="mostrarTimelineEvaluacion.set(!mostrarTimelineEvaluacion())"
                  class="w-full p-4 flex items-center justify-between bg-muted/40 hover:bg-muted/60 transition-colors text-left cursor-pointer">
                  <div class="flex items-center gap-2.5">
                    <div class="h-8 w-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                      <i class="pi pi-history text-sm"></i>
                    </div>
                    <div>
                      <h4 class="text-xs font-black text-foreground uppercase tracking-wider">
                        Línea de Tiempo & Bitácora Inmutable de la Evaluación
                      </h4>
                      <p class="text-[11px] text-muted-foreground">
                        Trazabilidad forense de transiciones, impresiones y calificaciones ({{ reporteGrupo()?.eventosAuditoria?.length || 0 }} eventos)
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-bold text-purple-700">
                      {{ mostrarTimelineEvaluacion() ? 'Ocultar Bitácora' : 'Ver Bitácora de la Evaluación' }}
                    </span>
                    <i class="pi" [ngClass]="mostrarTimelineEvaluacion() ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
                  </div>
                </button>

                @if (mostrarTimelineEvaluacion()) {
                  <div class="p-4 border-t border-border space-y-3">
                    @if (!reporteGrupo()?.eventosAuditoria || reporteGrupo()!.eventosAuditoria!.length === 0) {
                      <p class="text-xs text-muted-foreground italic py-3 text-center">
                        No hay eventos de auditoría específicos registrados aún para este rol de examen.
                      </p>
                    } @else {
                      <div class="overflow-x-auto">
                        <table class="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr class="bg-muted/60 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                              <th class="p-3 w-36">Fecha y Hora</th>
                              <th class="p-3 w-44">Operador & Cargo</th>
                              <th class="p-3 w-28">IP Origen</th>
                              <th class="p-3">Acción Registrada</th>
                              <th class="p-3 w-28 text-center">Severidad</th>
                              <th class="p-3 w-16 text-center">JSON</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-border">
                            @for (ev of reporteGrupo()!.eventosAuditoria; track ev.id) {
                              <tr class="hover:bg-muted/20 transition-colors">
                                <td class="p-3 font-mono text-[11px] text-foreground font-bold">
                                  {{ formatearFechaHora(ev.fechaEvento) }}
                                </td>
                                <td class="p-3">
                                  <div class="font-bold text-foreground">{{ ev.usuarioNombre || ev.usuario }}</div>
                                  <div class="text-[10px] text-muted-foreground">{{ ev.usuarioCargo }}</div>
                                </td>
                                <td class="p-3 font-mono text-[11px] text-muted-foreground">
                                  {{ ev.ipOrigen }}
                                </td>
                                <td class="p-3">
                                  <div class="font-bold text-foreground">{{ ev.accion }}</div>
                                  <div class="text-[10px] text-muted-foreground font-mono">{{ ev.codigoAccion }}</div>
                                </td>
                                <td class="p-3 text-center">
                                  @if (ev.nivel === 'OPERACION_CRITICA') {
                                    <span class="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                      CRÍTICO
                                    </span>
                                  } @else if (ev.nivel === 'ADVERTENCIA') {
                                    <span class="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                      ALERTA
                                    </span>
                                  } @else {
                                    <span class="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                      INFO
                                    </span>
                                  }
                                </td>
                                <td class="p-3 text-center">
                                  <button 
                                    (click)="abrirDetalle(ev)"
                                    class="h-7 w-7 rounded-lg bg-muted hover:bg-purple-100 text-muted-foreground hover:text-purple-800 inline-flex items-center justify-center transition-colors cursor-pointer"
                                    title="Ver Ficha Completa del Evento">
                                    <i class="pi pi-eye text-xs"></i>
                                  </button>
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

              <!-- Tabla de Alumnos con Calificaciones, Reprogramaciones & Dictamen Forense -->
              <div class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                
                <div class="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-black text-foreground uppercase tracking-wider">
                      Nómina de Estudiantes & Peritaje de Calificaciones
                    </span>
                    <span class="bg-purple-100 text-purple-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                      {{ estudiantesGrupoFiltrados().length }} de {{ reporteGrupo()?.totalEstudiantes }} alumnos
                    </span>
                  </div>

                  <!-- Filtro Rápido de Tabla -->
                  <div class="flex items-center gap-2">
                    <label class="text-[10px] font-bold text-muted-foreground uppercase">Filtrar:</label>
                    <select 
                      [ngModel]="filtroEstudiantesTabla()"
                      (ngModelChange)="filtroEstudiantesTabla.set($event)"
                      class="bg-card border border-border rounded-xl px-2.5 py-1 text-xs font-bold text-foreground outline-none">
                      <option value="TODOS">Todos los alumnos</option>
                      <option value="REPROGRAMADOS_MODIFICADOS">🚨 Solo Reprogramados & Modificados</option>
                      <option value="CALIFICADOS">Solo Calificados</option>
                      <option value="APROBADOS">Solo Aprobados (>= 51)</option>
                      <option value="REPROBADOS">Solo Reprobados (< 51)</option>
                      <option value="EXTEMPORANEOS_TARDIOS">Solo Extemporáneos & Tardíos</option>
                      <option value="PENDIENTES">Solo Pendientes / Ausentes</option>
                    </select>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr class="bg-muted/60 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        <th class="p-3.5 w-12 text-center">N°</th>
                        <th class="p-3.5 w-28">Código SIS</th>
                        <th class="p-3.5 min-w-[200px]">Apellidos y Nombres</th>
                        <th class="p-3.5 w-36 text-center">Nota / 100 & Estado</th>
                        <th class="p-3.5 min-w-[180px]">Origen Calificación</th>
                        <th class="p-3.5 min-w-[200px]">Modificado / Reprog. Por</th>
                        <th class="p-3.5 text-center w-36">Dictamen Nómina</th>
                        <th class="p-3.5 min-w-[220px]">Diagnóstico Forense</th>
                        <th class="p-3.5 text-center w-16">Variante</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border font-medium text-foreground">
                      @for (est of estudiantesGrupoFiltrados(); track est.studentCode; let idx = $index) {
                        <tr 
                          class="hover:bg-muted/20 transition-colors"
                          [class.bg-amber-50]="est.esReprogramado"
                          [class.bg-purple-50]="est.modificadoManualmente && !est.esReprogramado"
                          [class.bg-rose-50]="est.estadoForense === 'EXTEMPORANEO_POST_IMPRESION' && !est.esReprogramado && !est.modificadoManualmente">
                          
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
                            <span class="text-[10px] text-muted-foreground">Estado SEA: {{ est.courseState }}</span>
                          </td>

                          <!-- Nota / 100 & Estado -->
                          <td class="p-3.5 text-center">
                            @if (est.notaSobre100 !== null && est.notaSobre100 !== undefined) {
                              <div class="font-mono font-black text-sm" [class.text-emerald-700]="est.estadoCalificacion === 'APROBADO'" [class.text-rose-700]="est.estadoCalificacion === 'REPROBADO'">
                                {{ est.notaSobre100 }} <span class="text-[10px] font-normal text-muted-foreground">/ 100</span>
                              </div>
                              <span 
                                class="text-[9px] font-black px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block"
                                [class.bg-emerald-100]="est.estadoCalificacion === 'APROBADO'"
                                [class.text-emerald-800]="est.estadoCalificacion === 'APROBADO'"
                                [class.bg-rose-100]="est.estadoCalificacion === 'REPROBADO'"
                                [class.text-rose-800]="est.estadoCalificacion === 'REPROBADO'">
                                {{ est.estadoCalificacion }}
                              </span>
                            } @else {
                              <span class="bg-muted text-muted-foreground text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                                PENDIENTE
                              </span>
                            }
                          </td>

                          <!-- Origen Calificación (Badge Oficial) -->
                          <td class="p-3.5">
                            <span 
                              [class]="obtenerClaseBadgeOrigen(est.origenCalificacion)"
                              class="text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 uppercase tracking-tight">
                              <i [class]="obtenerIconoOrigen(est.origenCalificacion)" class="text-[9px]"></i>
                              <span>{{ obtenerTextoOrigen(est.origenCalificacion) }}</span>
                            </span>
                            @if (est.esReprogramado) {
                              <span class="text-[10px] text-amber-800 font-bold block mt-1">
                                Examen Oral Reprogramado
                              </span>
                            } @else if (est.modificadoManualmente) {
                              <span class="text-[10px] text-purple-800 font-bold block mt-1">
                                Alteración Registrada
                              </span>
                            }
                          </td>

                          <!-- Modificado / Reprogramado Por -->
                          <td class="p-3.5">
                            @if (est.esReprogramado) {
                              <div class="font-bold text-amber-900 dark:text-amber-300 text-xs flex items-center gap-1">
                                <i class="pi pi-user text-[10px]"></i> {{ est.reprogramadoPor || 'Comisión / Dirección' }}
                              </div>
                              <div class="text-[10px] text-muted-foreground font-mono">
                                {{ formatearFechaHora(est.fechaReprogramacion) }}
                              </div>
                              <button 
                                (click)="abrirModalEstudiante(est)"
                                class="text-[10px] text-amber-700 hover:text-amber-800 underline font-bold mt-0.5 inline-flex items-center gap-1 cursor-pointer">
                                <i class="pi pi-file text-[9px]"></i> Ver Motivo & Comprobante
                              </button>
                            } @else if (est.modificadoManualmente) {
                              <div class="font-bold text-purple-900 dark:text-purple-300 text-xs flex items-center gap-1">
                                <i class="pi pi-user text-[10px]"></i> {{ est.procesadoPor || 'Operador' }}
                              </div>
                              <div class="text-[10px] text-muted-foreground font-mono">
                                {{ formatearFechaHora(est.fechaProcesamiento) }}
                              </div>
                              <button 
                                (click)="abrirModalEstudiante(est)"
                                class="text-[10px] text-purple-700 hover:text-purple-800 underline font-bold mt-0.5 inline-flex items-center gap-1 cursor-pointer">
                                <i class="pi pi-info-circle text-[9px]"></i> Ver Detalle de Ajuste
                              </button>
                            } @else {
                              <span class="text-muted-foreground text-[11px]">— Proceso Normal</span>
                            }
                          </td>

                          <!-- Dictamen Forense Nómina SEA -->
                          <td class="p-3.5 text-center">
                            <span 
                              [class]="obtenerClaseBadgeForense(est.estadoForense)"
                              class="text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 uppercase tracking-tight">
                              <i [class]="obtenerIconoForense(est.estadoForense)" class="text-[8px]"></i>
                              <span>{{ obtenerTextoEstadoForense(est.estadoForense) }}</span>
                            </span>
                          </td>

                          <!-- Diagnóstico Forense -->
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
                      Historial de Asignaturas & Calificaciones Obtenidas
                    </span>
                    <span class="bg-purple-100 text-purple-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                      {{ reporteEstudiante()?.materias?.length || 0 }} materias
                    </span>
                  </div>
                  <span class="text-[11px] text-muted-foreground">
                    Peritaje cruzado con exámenes e inscripciones
                  </span>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr class="bg-muted/60 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        <th class="p-3.5 w-12 text-center">N°</th>
                        <th class="p-3.5 min-w-[200px]">Asignatura</th>
                        <th class="p-3.5 min-w-[130px]">Grupo & Docente</th>
                        <th class="p-3.5 text-center w-28">Nota / 100</th>
                        <th class="p-3.5 min-w-[160px]">Origen Nota</th>
                        <th class="p-3.5 w-32">Registro SEA</th>
                        <th class="p-3.5 text-center w-32">Dictamen Nómina</th>
                        <th class="p-3.5 min-w-[220px]">Diagnóstico</th>
                        <th class="p-3.5 text-center w-16">Variante</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border font-medium text-foreground">
                      @for (mat of reporteEstudiante()?.materias; track mat.groupId; let idx = $index) {
                        <tr class="hover:bg-muted/20 transition-colors">
                          
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

                          <!-- Nota / 100 -->
                          <td class="p-3.5 text-center">
                            @if (mat.notaSobre100 !== null && mat.notaSobre100 !== undefined) {
                              <div class="font-mono font-black text-sm" [class.text-emerald-700]="mat.estadoCalificacion === 'APROBADO'" [class.text-rose-700]="mat.estadoCalificacion === 'REPROBADO'">
                                {{ mat.notaSobre100 }} pts.
                              </div>
                              <span class="text-[9px] font-bold text-muted-foreground">{{ mat.estadoCalificacion }}</span>
                            } @else {
                              <span class="text-muted-foreground text-[10px] italic">Sin nota</span>
                            }
                          </td>

                          <!-- Origen Nota -->
                          <td class="p-3.5">
                            <span 
                              [class]="obtenerClaseBadgeOrigen(mat.origenCalificacion)"
                              class="text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 uppercase tracking-tight">
                              <i [class]="obtenerIconoOrigen(mat.origenCalificacion)" class="text-[9px]"></i>
                              <span>{{ obtenerTextoOrigen(mat.origenCalificacion) }}</span>
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
                <i class="pi pi-bolt"></i>
              </div>
            </div>

            <!-- Alertas de Seguridad -->
            <div class="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span class="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider block mb-1">Alertas & Advertencias</span>
                <div class="text-2xl font-black text-amber-600 font-mono">
                  @if (cargando()) {
                    <span class="text-base text-muted-foreground animate-pulse">...</span>
                  } @else {
                    {{ alertasSeguridadKpi() }}
                  }
                </div>
                <span class="text-[10px] text-amber-600 font-bold mt-1 inline-flex items-center gap-1">
                  <i class="pi pi-exclamation-triangle text-[9px]"></i> Auditoría de seguridad
                </span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                <i class="pi pi-shield"></i>
              </div>
            </div>

          </div>

          <!-- Filtros de Bitácora -->
          <div class="bg-card border border-border rounded-2xl p-4 shadow-xs">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              
              <div class="md:col-span-5">
                <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  Buscar en Bitácora
                </label>
                <div class="relative">
                  <input 
                    type="text" 
                    [ngModel]="busquedaTexto()"
                    (ngModelChange)="busquedaTexto.set($event)"
                    placeholder="Buscar por usuario, acción, IP, campus o detalle técnico..."
                    class="w-full bg-muted/60 border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
                  <i class="pi pi-search absolute left-3 top-2.5 text-muted-foreground text-xs"></i>
                </div>
              </div>

              <div class="md:col-span-3">
                <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  Módulo
                </label>
                <select 
                  [ngModel]="filtroModulo()"
                  (ngModelChange)="filtroModulo.set($event)"
                  class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
                  <option value="TODOS">Todos los módulos</option>
                  <option value="Evaluaciones">Evaluaciones</option>
                  <option value="Banco de Preguntas">Banco de Preguntas</option>
                  <option value="Calificación OMR">Calificación OMR</option>
                  <option value="Generación Typst">Generación Typst</option>
                  <option value="Usuarios y Accesos">Usuarios y Accesos</option>
                  <option value="Respaldos">Respaldos</option>
                  <option value="Verificación de Exámenes">Verificación de Exámenes</option>
                </select>
              </div>

              <div class="md:col-span-3">
                <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  Nivel de Severidad
                </label>
                <select 
                  [ngModel]="filtroNivel()"
                  (ngModelChange)="filtroNivel.set($event)"
                  class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
                  <option value="TODOS">Todos los niveles</option>
                  <option value="INFO">Informativo (INFO)</option>
                  <option value="ADVERTENCIA">Advertencias (ADVERTENCIA)</option>
                  <option value="OPERACION_CRITICA">Operación Crítica (CRÍTICA)</option>
                </select>
              </div>

              <div class="md:col-span-1 flex justify-end">
                <button 
                  (click)="busquedaTexto.set(''); filtroModulo.set('TODOS'); filtroNivel.set('TODOS')"
                  class="w-full bg-muted hover:bg-muted/80 text-foreground border border-border py-2 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Restablecer Filtros">
                  <i class="pi pi-filter-slash"></i>
                </button>
              </div>

            </div>
          </div>

          <!-- Tabla de Eventos de Bitácora -->
          <div class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
            <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <span class="text-xs font-black text-foreground uppercase tracking-wider">
                Registros de Auditoría Institucional
              </span>
              <span class="text-[11px] text-muted-foreground font-mono">
                Mostrando {{ registrosFiltrados().length }} de {{ items().length }} eventos
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-left text-xs">
                <thead>
                  <tr class="bg-muted/60 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <th class="p-3.5 w-36">Fecha y Hora</th>
                    <th class="p-3.5 w-44">Usuario & Terminal</th>
                    <th class="p-3.5 w-36">Módulo</th>
                    <th class="p-3.5">Acción Ejecutada</th>
                    <th class="p-3.5 w-28 text-center">Nivel</th>
                    <th class="p-3.5 w-16 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border font-medium text-foreground">
                  @if (cargando()) {
                    <tr>
                      <td colspan="6" class="p-8 text-center text-muted-foreground">
                        <i class="pi pi-spin pi-spinner text-2xl text-purple-700 mb-2 block mx-auto"></i>
                        Cargando bitácora de auditoría...
                      </td>
                    </tr>
                  } @else if (registrosFiltrados().length === 0) {
                    <tr>
                      <td colspan="6" class="p-8 text-center text-muted-foreground">
                        No se encontraron registros que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  } @else {
                    @for (item of registrosFiltrados(); track item.id) {
                      <tr class="hover:bg-muted/20 transition-colors">
                        
                        <!-- Fecha y Hora Oficial -->
                        <td class="p-3.5 font-mono text-[11px] text-foreground font-bold whitespace-nowrap">
                          {{ formatearFechaHora(item.fechaEvento) }}
                        </td>

                        <!-- Usuario & Terminal -->
                        <td class="p-3.5">
                          <div class="font-black text-foreground">{{ item.usuarioNombre || item.usuario }}</div>
                          <div class="text-[10px] text-muted-foreground font-mono">
                            IP: {{ item.ipOrigen }} · {{ item.campus || 'General' }}
                          </div>
                        </td>

                        <!-- Módulo -->
                        <td class="p-3.5">
                          <span class="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-foreground border border-border">
                            {{ item.modulo }}
                          </span>
                        </td>

                        <!-- Acción Realizada -->
                        <td class="p-3.5">
                          <p class="font-bold text-foreground leading-snug">{{ item.accion }}</p>
                          <span class="text-[10px] text-muted-foreground font-mono">{{ item.codigoAccion }}</span>
                        </td>

                        <!-- Nivel de Severidad -->
                        <td class="p-3.5 text-center">
                          @if (item.nivel === 'OPERACION_CRITICA') {
                            <span class="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                              CRÍTICA
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
                            class="h-7 w-7 rounded-lg bg-muted hover:bg-purple-100 text-muted-foreground hover:text-purple-800 inline-flex items-center justify-center transition-colors cursor-pointer">
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

      <!-- =================================================================== -->
      <!-- MODAL 1: DETALLE DE EVENTO DE AUDITORÍA / BITÁCORA                 -->
      <!-- =================================================================== -->
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
              <button (click)="cerrarDetalle()" class="text-white/80 hover:text-white text-base cursor-pointer">
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
                class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                Cerrar
              </button>
            </div>

          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- MODAL 2: DETALLE FORENSE DE REPROGRAMACIÓN O AJUSTE MANUAL         -->
      <!-- =================================================================== -->
      @if (estudianteModalDetalle()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in">
            
            <div class="bg-gradient-to-r from-amber-700 to-purple-800 text-white p-5 flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg">
                  <i class="pi" [ngClass]="estudianteModalDetalle()?.esReprogramado ? 'pi-microphone' : 'pi-pencil'"></i>
                </div>
                <div>
                  <h3 class="text-base font-black tracking-tight">
                    {{ estudianteModalDetalle()?.esReprogramado ? 'Peritaje de Examen Oral Reprogramado' : 'Peritaje de Modificación Manual de Nota' }}
                  </h3>
                  <p class="text-xs text-white/90">Estudiante: {{ estudianteModalDetalle()?.fullName }} ({{ estudianteModalDetalle()?.studentCode }})</p>
                </div>
              </div>
              <button (click)="cerrarModalEstudiante()" class="text-white/80 hover:text-white text-base cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="p-6 space-y-4 text-xs">
              
              <!-- Calificación Registrada -->
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3.5 rounded-xl bg-muted/60 border border-border">
                  <span class="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Nota Final Sobre 100</span>
                  <div class="text-xl font-mono font-black" [class.text-emerald-600]="estudianteModalDetalle()?.estadoCalificacion === 'APROBADO'" [class.text-rose-600]="estudianteModalDetalle()?.estadoCalificacion === 'REPROBADO'">
                    {{ estudianteModalDetalle()?.notaSobre100 !== null && estudianteModalDetalle()?.notaSobre100 !== undefined ? estudianteModalDetalle()?.notaSobre100 : '—' }} pts.
                  </div>
                  <span class="text-[10px] font-bold" [class.text-emerald-700]="estudianteModalDetalle()?.estadoCalificacion === 'APROBADO'" [class.text-rose-700]="estudianteModalDetalle()?.estadoCalificacion === 'REPROBADO'">
                    Estado: {{ estudianteModalDetalle()?.estadoCalificacion }}
                  </span>
                </div>

                <div class="p-3.5 rounded-xl bg-muted/60 border border-border">
                  <span class="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Nota Sobre 60</span>
                  <div class="text-xl font-mono font-black text-foreground">
                    {{ estudianteModalDetalle()?.notaSobre60 !== null && estudianteModalDetalle()?.notaSobre60 !== undefined ? estudianteModalDetalle()?.notaSobre60 : '—' }} pts.
                  </div>
                  <span class="text-[10px] text-muted-foreground">Ponderación Oficial</span>
                </div>
              </div>

              <!-- Responsable y Fecha -->
              <div class="p-3.5 rounded-xl bg-card border border-border space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-bold text-muted-foreground">
                    {{ estudianteModalDetalle()?.esReprogramado ? 'Reprogramado Por' : 'Modificado / Procesado Por' }}
                  </span>
                  <span class="font-mono font-bold text-foreground">
                    {{ estudianteModalDetalle()?.reprogramadoPor || estudianteModalDetalle()?.procesadoPor || 'Sistema' }}
                  </span>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-border">
                  <span class="text-[10px] uppercase font-bold text-muted-foreground">Fecha y Hora de la Acción</span>
                  <span class="font-mono text-muted-foreground">
                    {{ formatearFechaHora(estudianteModalDetalle()?.fechaReprogramacion || estudianteModalDetalle()?.fechaProcesamiento) }}
                  </span>
                </div>
                @if (estudianteModalDetalle()?.comprobanteReprogramacion) {
                  <div class="flex items-center justify-between pt-2 border-t border-border">
                    <span class="text-[10px] uppercase font-bold text-muted-foreground">N° Comprobante / Solicitud</span>
                    <span class="font-mono font-black text-purple-700 dark:text-purple-300">
                      {{ estudianteModalDetalle()?.comprobanteReprogramacion }}
                    </span>
                  </div>
                }
              </div>

              <!-- Motivo / Justificación Forense -->
              <div class="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-1">
                <span class="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">
                  Motivo / Justificación Pericial Registrada
                </span>
                <p class="text-xs text-foreground font-medium leading-relaxed">
                  {{ estudianteModalDetalle()?.motivoReprogramacion || estudianteModalDetalle()?.detalleAjusteManual || 'Sin justificación detallada registrada.' }}
                </p>
              </div>

              <!-- Observaciones Adicionales -->
              @if (estudianteModalDetalle()?.observacionReprogramacion) {
                <div class="p-3.5 rounded-xl bg-muted/60 border border-border space-y-1">
                  <span class="text-[10px] uppercase font-bold text-muted-foreground block">
                    Observaciones Adicionales
                  </span>
                  <p class="text-xs text-muted-foreground">
                    {{ estudianteModalDetalle()?.observacionReprogramacion }}
                  </p>
                </div>
              }

            </div>

            <div class="bg-muted/30 border-t border-border p-4 flex justify-end">
              <button 
                (click)="cerrarModalEstudiante()"
                class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                Cerrar Ficha
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

  // Control de Pestañas Principales
  public tabActual = signal<'toma-grupos' | 'bitacora'>('toma-grupos');

  // Bitácora de Accesos
  public cargando = signal<boolean>(false);
  public resumen = signal<AuditoriaResumen | null>(null);
  public items = signal<AuditoriaGlobalItem[]>([]);
  public busquedaTexto = signal<string>('');
  public filtroModulo = signal<string>('TODOS');
  public filtroNivel = signal<string>('TODOS');
  public registroSeleccionado = signal<AuditoriaGlobalItem | null>(null);

  // Peritaje de Calificaciones y Trazabilidad Forense
  public modoBusquedaToma = signal<'evaluacion' | 'grupo' | 'estudiante'>('evaluacion');
  public cargandoForense = signal<boolean>(false);
  public descargandoExcel = signal<boolean>(false);
  
  // Búsqueda interactiva de evaluaciones
  public buscandoEvaluaciones = signal<boolean>(false);
  public criterioBusquedaEvaluacion = signal<string>('');
  public filtroSedeEvaluacion = signal<string>('TODAS');
  public listaEvaluaciones = signal<AuditoriaEvaluacionItem[]>([]);

  // Búsqueda por Grupo y Estudiante
  public inputGrupoId = signal<string>('');
  public inputEstudianteCodigo = signal<string>('');
  public inputEstudianteGestion = signal<string>('2-2026');
  public reporteGrupo = signal<AuditoriaTomaGrupoReporte | null>(null);
  public reporteEstudiante = signal<AuditoriaEstudianteGlobal | null>(null);
  public filtroEstudiantesTabla = signal<string>('TODOS');

  // Detalle de estudiante y timeline
  public mostrarTimelineEvaluacion = signal<boolean>(false);
  public estudianteModalDetalle = signal<AuditoriaTomaGrupoEstudiante | null>(null);

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
      } else if (rolExamenId) {
        this.tabActual.set('toma-grupos');
        this.modoBusquedaToma.set('evaluacion');
        this.consultarPorRol(rolExamenId);
      } else if (groupId) {
        this.tabActual.set('toma-grupos');
        this.modoBusquedaToma.set('grupo');
        this.inputGrupoId.set(groupId);
        this.buscarTomaGrupo();
      } else if (studentCode) {
        this.tabActual.set('toma-grupos');
        this.modoBusquedaToma.set('estudiante');
        this.inputEstudianteCodigo.set(studentCode);
        this.buscarTomaEstudiante();
      } else {
        // Carga por defecto: buscar evaluaciones disponibles para auditar
        this.tabActual.set('toma-grupos');
        this.buscarEvaluaciones();
      }
    });
  }

  public cambiarTab(tab: 'toma-grupos' | 'bitacora'): void {
    this.tabActual.set(tab);
    if (tab === 'bitacora' && this.items().length === 0) {
      this.cargarAuditoria();
    } else if (tab === 'toma-grupos' && this.listaEvaluaciones().length === 0 && !this.reporteGrupo()) {
      this.buscarEvaluaciones();
    }
  }

  // =========================================================================
  // Métodos de Peritaje de Evaluaciones y Calificaciones
  // =========================================================================

  public buscarEvaluaciones(): void {
    this.buscandoEvaluaciones.set(true);
    const crit = this.criterioBusquedaEvaluacion().trim() || undefined;
    const sede = this.filtroSedeEvaluacion() !== 'TODAS' ? this.filtroSedeEvaluacion() : undefined;

    this.auditoriaService.buscarEvaluaciones(crit, sede).subscribe({
      next: (data) => {
        this.listaEvaluaciones.set(data || []);
        this.buscandoEvaluaciones.set(false);
      },
      error: (err) => {
        console.error('Error al buscar evaluaciones para auditoría:', err);
        this.buscandoEvaluaciones.set(false);
      }
    });
  }

  public limpiarBusquedaEvaluaciones(): void {
    this.criterioBusquedaEvaluacion.set('');
    this.filtroSedeEvaluacion.set('TODAS');
    this.buscarEvaluaciones();
  }

  public seleccionarEvaluacion(ev: AuditoriaEvaluacionItem): void {
    this.consultarPorRol(ev.rolExamenId);
  }

  public consultarPorRol(rolExamenId: string): void {
    this.cargandoForense.set(true);
    this.reporteGrupo.set(null);

    this.auditoriaService.obtenerAuditoriaPorRol(rolExamenId).subscribe({
      next: (data) => {
        this.reporteGrupo.set(data);
        this.inputGrupoId.set(data.groupId || '');
        this.cargandoForense.set(false);
        const anomalos = (data.totalReprogramados ?? 0) + (data.totalAjustados ?? 0) + (data.totalExtemporaneos ?? 0);
        if (anomalos > 0) {
          void this.feedback.mostrar(
            `Auditoría cargada: Se identificaron ${data.totalReprogramados} reprogramaciones, ${data.totalAjustados} alteraciones y ${data.totalExtemporaneos} extemporáneos.`,
            'Peritaje Forense Activo',
            'warning'
          );
        } else {
          void this.feedback.mostrar(
            `Evaluación auditada: Todos los ${data.totalEstudiantes} estudiantes se encuentran regulares y calificados por OMR estándar.`,
            'Conforme',
            'success'
          );
        }
      },
      error: (err) => {
        console.error('Error al consultar auditoría por rol:', err);
        this.cargandoForense.set(false);
        void this.feedback.mostrar('No se encontró el rol de examen solicitado.', 'Error', 'error');
      }
    });
  }

  public buscarTomaGrupo(): void {
    const groupId = this.inputGrupoId().trim();
    if (!groupId) {
      void this.feedback.mostrar('Ingresa un ID de Grupo para auditar.', 'Atención', 'warning');
      return;
    }

    this.cargandoForense.set(true);
    this.reporteGrupo.set(null);

    this.auditoriaService.obtenerAuditoriaPorGrupo(groupId).subscribe({
      next: (data) => {
        this.reporteGrupo.set(data);
        this.cargandoForense.set(false);
        const anomalos = (data.totalReprogramados ?? 0) + (data.totalAjustados ?? 0) + (data.totalExtemporaneos ?? 0);
        if (anomalos > 0) {
          void this.feedback.mostrar(
            `Auditoría completada: Se identificaron ${data.totalReprogramados} reprogramaciones y ${data.totalAjustados} ajustes manuales.`,
            'Dictamen Forense Detectado',
            'warning'
          );
        } else {
          void this.feedback.mostrar(
            `Nómina auditada: Todos los ${data.totalEstudiantes} estudiantes cuentan con calificación y registro conforme.`,
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

  public abrirModalEstudiante(est: AuditoriaTomaGrupoEstudiante): void {
    this.estudianteModalDetalle.set(est);
  }

  public cerrarModalEstudiante(): void {
    this.estudianteModalDetalle.set(null);
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
        a.download = `ACTA_FORENSE_CALIFICACIONES_${rep.groupId}_${materiaLimpia}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        void this.feedback.mostrar(
          'Acta forense oficial de calificaciones descargada en formato Excel institucional.',
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

  public exportarTablaGrupoExcel(): void {
    const rep = this.reporteGrupo();
    if (!rep || !rep.estudiantes || rep.estudiantes.length === 0) {
      void this.feedback.mostrar('No hay estudiantes para exportar.', 'Atención', 'warning');
      return;
    }

    const lista = this.estudiantesGrupoFiltrados();
    const datos = lista.map((e, idx) => ({
      'N°': idx + 1,
      'Código SIS': e.studentCode,
      'Apellidos y Nombres': e.fullName,
      'Estado Alumno': e.courseState,
      'Nota / 100': e.notaSobre100 !== null && e.notaSobre100 !== undefined ? e.notaSobre100 : '—',
      'Nota / 60': e.notaSobre60 !== null && e.notaSobre60 !== undefined ? e.notaSobre60 : '—',
      'Estado Calificación': e.estadoCalificacion || 'PENDIENTE',
      'Origen Calificación': this.obtenerTextoOrigen(e.origenCalificacion),
      'Es Reprogramado': e.esReprogramado ? 'SÍ (ORAL)' : 'NO',
      'Reprogramado Por': e.reprogramadoPor || '—',
      'Fecha Reprogramación': this.formatearFechaHora(e.fechaReprogramacion),
      'Motivo Reprogramación': e.motivoReprogramacion || '—',
      'Comprobante Reprogramación': e.comprobanteReprogramacion || '—',
      'Modificado Manualmente': e.modificadoManualmente ? 'SÍ' : 'NO',
      'Procesado / Modificado Por': e.procesadoPor || '—',
      'Fecha Procesamiento': this.formatearFechaHora(e.fechaProcesamiento),
      'Detalle Ajuste Manual': e.detalleAjusteManual || '—',
      'Variante Cartilla': e.letraVariante || '—',
      'Dictamen Forense SEA': this.obtenerTextoEstadoForense(e.estadoForense),
      'Fecha Registro SEA': this.formatearFechaHora(e.enrollCreatedAt),
      'Fecha Modif. SEA': this.formatearFechaHora(e.enrollUpdatedAt),
      'Diagnóstico Pericial': e.mensajeForense
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Peritaje_Calificaciones');
    const fechaStr = new Date().toISOString().slice(0, 10);
    const materiaLimpia = (rep.materiaNombre || 'MATERIA').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(libro, `PERITAJE_CALIFICACIONES_${rep.groupId}_${materiaLimpia}_${fechaStr}.xlsx`);

    void this.feedback.mostrar(
      `Planilla de peritaje y calificaciones exportada exitosamente (${datos.length} alumnos).`,
      'Exportación Completa',
      'success'
    );
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
      'Nota / 100': m.notaSobre100 !== null && m.notaSobre100 !== undefined ? m.notaSobre100 : '—',
      'Nota / 60': m.notaSobre60 !== null && m.notaSobre60 !== undefined ? m.notaSobre60 : '—',
      'Estado Calificación': m.estadoCalificacion || 'PENDIENTE',
      'Origen Calificación': this.obtenerTextoOrigen(m.origenCalificacion),
      'Fecha Registro SEA': this.formatearFechaHora(m.enrollCreatedAt),
      'Fecha Generación Examen': this.formatearFechaHora(m.fechaGeneracionExamen),
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
    const filtro = this.filtroEstudiantesTabla();

    switch (filtro) {
      case 'REPROGRAMADOS_MODIFICADOS':
        return rep.estudiantes.filter(e => e.esReprogramado || e.modificadoManualmente);
      case 'CALIFICADOS':
        return rep.estudiantes.filter(e => e.notaSobre100 !== null && e.notaSobre100 !== undefined);
      case 'APROBADOS':
        return rep.estudiantes.filter(e => e.estadoCalificacion?.toUpperCase() === 'APROBADO');
      case 'REPROBADOS':
        return rep.estudiantes.filter(e => e.estadoCalificacion?.toUpperCase() === 'REPROBADO');
      case 'EXTEMPORANEOS_TARDIOS':
        return rep.estudiantes.filter(e => e.estadoForense === 'EXTEMPORANEO_POST_IMPRESION' || e.estadoForense === 'TOMA_TARDIA');
      case 'PENDIENTES':
        return rep.estudiantes.filter(e => e.notaSobre100 === null || e.notaSobre100 === undefined);
      default:
        return rep.estudiantes;
    }
  });

  public obtenerClaseBadgeOrigen(origen?: string): string {
    switch (origen) {
      case 'OMR_AUTOMATICO':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-bold';
      case 'EXAMEN_ORAL_REPROGRAMADO':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 font-black';
      case 'AJUSTADO_MANUAL':
        return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800 font-black';
      case 'DOCENTE_SIN_CARTILLA':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  }

  public obtenerIconoOrigen(origen?: string): string {
    switch (origen) {
      case 'OMR_AUTOMATICO':
        return 'pi pi-check-circle';
      case 'EXAMEN_ORAL_REPROGRAMADO':
        return 'pi pi-megaphone';
      case 'AJUSTADO_MANUAL':
        return 'pi pi-pencil';
      case 'DOCENTE_SIN_CARTILLA':
        return 'pi pi-file';
      default:
        return 'pi pi-clock';
    }
  }

  public obtenerTextoOrigen(origen?: string): string {
    switch (origen) {
      case 'OMR_AUTOMATICO':
        return 'OMR Automático';
      case 'EXAMEN_ORAL_REPROGRAMADO':
        return '🚨 Oral Reprog.';
      case 'AJUSTADO_MANUAL':
        return '⚠️ Ajuste Manual';
      case 'DOCENTE_SIN_CARTILLA':
        return 'Docente s/ Cartilla';
      default:
        return 'Pendiente';
    }
  }

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

  public formatearFechaHora(fecha?: string | null): string {
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

  public formatearSoloFecha(fecha?: string | null): string {
    const completa = this.formatearFechaHora(fecha);
    return completa.split(',')[0] || completa;
  }

  public formatearSoloHora(fecha?: string | null): string {
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
