import { UNITEPC_LOGO_PNG } from '../../core/constants/unitepc-assets';
import { jsPDF } from 'jspdf';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionesStorageService } from '../../core/services/evaluaciones-storage.service';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { AuthService } from '../../core/services/auth.service';
import { EvaluacionDocenteService } from '../../core/services/evaluacion-docente.service';
import { BranchOffice, Career, Course, GroupItem } from '../../core/models/unitepc-gateway.models';
import {
  EvaluacionInstrumento,
  EvaluacionSeccion,
  EvaluacionCriterio,
  EvaluacionDocenteRegistro,
  EvaluacionDocenteAplicarRequest,
  EvaluacionDocenteRespuesta
} from '../../core/models/evaluacion-docente.models';

export interface FormCriterioItem {
  id?: string;
  numero: string;
  enunciado: string;
}

export interface FormSeccionItem {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  criterios: FormCriterioItem[];
}
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface MateriaDocenteItem {
  cursoId: string;
  materiaCodigo: string;
  materiaNombre: string;
  semestre: number;
  horas: number;
  grupoCodigo: string;
  tipoClase: string;
  registroEvaluacion?: EvaluacionDocenteRegistro;
}

export interface DocenteEvaluacionRow {
  docenteNombre: string;
  docenteCi?: string;
  materias: MateriaDocenteItem[];
  totalMaterias: number;
  evaluadasCount: number;
  porcentajeEvaluacion: number;
  promedioPuntaje: number | null;
}

@Component({
  selector: 'sea-evaluacion-docente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <i class="pi pi-user-edit text-base"></i>
            </div>
            <h2 class="text-2xl font-black tracking-tight text-foreground">Evaluación Docente</h2>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Evaluación de la competencia y desempeño docente por Director de Carrera y Administrador.
          </p>
        </div>

        <!-- Selector de Pestañas y Reporte -->
        <div class="flex items-center gap-2">
          <button 
            type="button" 
            (click)="descargarReporteCarreraPdf()"
            [disabled]="docentesTotales().length === 0"
            title="Descargar reporte oficial consolidado de evaluación docente en formato PDF con firma del Director de Carrera"
            class="bg-card hover:bg-muted text-foreground border border-red-200 hover:border-red-300 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-2 shadow-2xs transition-colors cursor-pointer disabled:opacity-50">
            <i class="pi pi-file-pdf text-red-600 text-sm"></i>
            <span>Descargar Reporte PDF</span>
          </button>
          @if (esAdminOResponsable()) {
            <div class="bg-muted p-1 rounded-xl flex items-center gap-1 border border-border">
              <button 
                type="button"
                (click)="vistaActiva.set('evaluaciones')"
                [class]="vistaActiva() === 'evaluaciones' ? 'bg-card text-primary font-black shadow-2xs' : 'text-muted-foreground hover:text-foreground'"
                class="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5">
                <i class="pi pi-users text-xs"></i>
                <span>Evaluación por Docentes</span>
              </button>
              <button 
                type="button"
                (click)="vistaActiva.set('instrumentos')"
                [class]="vistaActiva() === 'instrumentos' ? 'bg-card text-primary font-black shadow-2xs' : 'text-muted-foreground hover:text-foreground'"
                class="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5">
                <i class="pi pi-sliders-h text-xs"></i>
                <span>Gestor de Tests</span>
              </button>
            </div>
          }
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- VISTA 1: EVALUACIÓN POR DOCENTES (Director / Admin)                 -->
      <!-- =================================================================== -->
      @if (vistaActiva() === 'evaluaciones') {

        <!-- Filtros Superiores -->
        <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <!-- Selector de Gestión -->
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

            <!-- Selector de Sede -->
            <div>
              <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <i class="pi pi-building text-primary text-[10px]"></i> Sede Académica
              </label>
              <select 
                [ngModel]="filtroSedeCodigo" 
                (ngModelChange)="onSedeChange($event)"
                [disabled]="cargandoSedes()"
                class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
                @if (cargandoSedes()) {
                  <option value="">Cargando sedes...</option>
                } @else {
                  @for (sede of sedes(); track sede.branchOfficeId) {
                    <option [value]="sede.code">{{ sede.name }} ({{ sede.code }})</option>
                  }
                }
              </select>
            </div>

            <!-- Selector de Carrera -->
            <div>
              <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <i class="pi pi-graduation-cap text-primary text-[10px]"></i> Carrera
              </label>
              <select 
                [ngModel]="filtroCarreraCodigo" 
                (ngModelChange)="onCarreraChange($event)"
                [disabled]="cargandoCarreras() || !filtroSedeCodigo"
                class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
                @if (cargandoCarreras()) {
                  <option value="">Cargando carreras...</option>
                } @else {
                  @for (carrera of carreras(); track carrera.careerId) {
                    <option [value]="carrera.careerCode">{{ carrera.careerName }} ({{ carrera.careerCode }})</option>
                  }
                }
              </select>
            </div>

            <!-- Buscador -->
            <div>
              <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <i class="pi pi-search text-primary text-[10px]"></i> Buscar Docente o Materia
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  [ngModel]="busquedaTexto()" 
                  (ngModelChange)="busquedaTexto.set($event)"
                  placeholder="Ej: Jaime Santiváñez, Contabilidad..."
                  class="w-full bg-muted/70 border border-border rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary placeholder:text-muted-foreground" />
                <i class="pi pi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"></i>
              </div>
            </div>

          </div>

          <!-- Filtro de Estado Docente -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Estado Evaluación:</span>
              <button 
                type="button" 
                (click)="filtroEstado.set('todos')" 
                [class]="filtroEstado() === 'todos' ? 'bg-primary text-primary-foreground font-black' : 'bg-muted text-muted-foreground hover:text-foreground font-bold'" 
                class="px-2.5 py-1 rounded-lg text-xs transition-colors">
                Todos ({{ docentesTotales().length }})
              </button>
              <button 
                type="button" 
                (click)="filtroEstado.set('completados')" 
                [class]="filtroEstado() === 'completados' ? 'bg-emerald-600 text-white font-black' : 'bg-muted text-muted-foreground hover:text-foreground font-bold'" 
                class="px-2.5 py-1 rounded-lg text-xs transition-colors">
                Completados 100% ({{ totalCompletados() }})
              </button>
              <button 
                type="button" 
                (click)="filtroEstado.set('en_progreso')" 
                [class]="filtroEstado() === 'en_progreso' ? 'bg-blue-600 text-white font-black' : 'bg-muted text-muted-foreground hover:text-foreground font-bold'" 
                class="px-2.5 py-1 rounded-lg text-xs transition-colors">
                En Progreso ({{ totalEnProgreso() }})
              </button>
              <button 
                type="button" 
                (click)="filtroEstado.set('pendientes')" 
                [class]="filtroEstado() === 'pendientes' ? 'bg-amber-600 text-white font-black' : 'bg-muted text-muted-foreground hover:text-foreground font-bold'" 
                class="px-2.5 py-1 rounded-lg text-xs transition-colors">
                Sin Evaluar ({{ totalSinEvaluar() }})
              </button>
            </div>

            <!-- Info Instrumento Vigente -->
            @if (instrumentoVigente(); as inst) {
              <div class="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg border border-border">
                <i class="pi pi-check-circle text-emerald-600 text-xs"></i>
                <span>Test en Vigencia: <strong>{{ inst.titulo }}</strong> ({{ inst.totalCriterios }} ítems)</span>
              </div>
            }
          </div>
        </div>

        <!-- KPIs Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-3xl font-black text-foreground font-mono">{{ docentesTotales().length }}</span>
              <p class="text-xs font-bold text-muted-foreground">Total Docentes en Carrera</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <i class="pi pi-users text-xl"></i>
            </div>
          </div>

          <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-3xl font-black text-emerald-600 font-mono">{{ totalCompletados() }}</span>
              <p class="text-xs font-bold text-muted-foreground">Evaluación Completa (100%)</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i class="pi pi-check-circle text-xl"></i>
            </div>
          </div>

          <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-3xl font-black text-blue-600 font-mono">{{ totalEnProgreso() }}</span>
              <p class="text-xs font-bold text-muted-foreground">En Progreso de Evaluación</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i class="pi pi-spinner text-xl"></i>
            </div>
          </div>

          <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-3xl font-black text-amber-600 font-mono">{{ totalSinEvaluar() }}</span>
              <p class="text-xs font-bold text-muted-foreground">Sin Evaluar (0%)</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i class="pi pi-clock text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Tabla de Docentes y Porcentaje de Evaluación -->
        <div class="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          @if (cargandoDocentes()) {
            <div class="p-12 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
              <span>Cargando lista oficial de docentes y asignaturas...</span>
            </div>
          } @else if (docentesFiltrados().length === 0) {
            <div class="p-12 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <i class="pi pi-info-circle text-2xl"></i>
              <span>No se encontraron docentes con los filtros aplicados en esta carrera.</span>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <th class="p-3.5">Docente</th>
                    <th class="p-3.5">Materias que Dicta</th>
                    <th class="p-3.5 text-center">Porcentaje de Evaluación</th>
                    <th class="p-3.5 text-center">Calificación Promedio</th>
                    <th class="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border text-xs">
                  @for (doc of docentesFiltrados(); track doc.docenteNombre) {
                    <tr class="hover:bg-muted/15 transition-colors">
                      
                      <!-- Docente -->
                      <td class="p-3.5 align-top">
                        <div class="flex items-center gap-2.5">
                          <div class="h-8 w-8 rounded-full bg-indigo-100 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-indigo-200">
                            {{ obtenerIniciales(doc.docenteNombre) }}
                          </div>
                          <div class="min-w-0">
                            <div class="font-black text-foreground text-xs truncate">{{ doc.docenteNombre }}</div>
                            <div class="text-[10px] text-muted-foreground">
                              {{ doc.totalMaterias }} {{ doc.totalMaterias === 1 ? 'materia asignada' : 'materias asignadas' }}
                              @if (doc.docenteCi) {
                                · CI: {{ doc.docenteCi }}
                              }
                            </div>
                          </div>
                        </div>
                      </td>

                      <!-- Materias que dicta (chips) -->
                      <td class="p-3.5 align-top">
                        <div class="flex flex-wrap gap-1.5 max-w-md">
                          @for (materia of doc.materias; track materia.materiaCodigo) {
                            <div 
                              [class]="materia.registroEvaluacion 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-muted/80 border-border text-muted-foreground'"
                              class="border rounded-lg px-2 py-1 text-[11px] font-medium flex items-center gap-1.5 shadow-2xs">
                              @if (materia.registroEvaluacion) {
                                <i class="pi pi-check-circle text-emerald-600 text-[10px]"></i>
                              } @else {
                                <i class="pi pi-clock text-amber-500 text-[10px]"></i>
                              }
                              <span class="font-bold text-foreground">{{ materia.materiaNombre }}</span>
                              @if (materia.registroEvaluacion; as reg) {
                                <span class="bg-emerald-200/60 text-emerald-900 font-mono font-black text-[9px] px-1 rounded">
                                  {{ reg.puntajeTotal }} pts
                                </span>
                              }
                            </div>
                          }
                        </div>
                      </td>

                      <!-- Porcentaje de Evaluación -->
                      <td class="p-3.5 text-center align-top">
                        <div class="flex flex-col items-center gap-1">
                          <div class="flex items-center gap-2">
                            <span 
                              [class]="doc.porcentajeEvaluacion === 100 
                                ? 'text-emerald-600' 
                                : doc.porcentajeEvaluacion > 0 
                                  ? 'text-blue-600' 
                                  : 'text-amber-600'"
                              class="text-sm font-black font-mono">
                              {{ doc.porcentajeEvaluacion }}%
                            </span>
                            <span class="text-[10px] text-muted-foreground font-bold">
                              ({{ doc.evaluadasCount }} de {{ doc.totalMaterias }} evaluadas)
                            </span>
                          </div>
                          
                          <!-- Barra de progreso visual -->
                          <div class="h-2 w-32 bg-muted rounded-full overflow-hidden border border-border/50">
                            <div 
                              [class]="doc.porcentajeEvaluacion === 100 
                                ? 'bg-emerald-500' 
                                : doc.porcentajeEvaluacion > 0 
                                  ? 'bg-blue-600' 
                                  : 'bg-amber-400'"
                              class="h-full transition-all duration-300"
                              [style.width.%]="doc.porcentajeEvaluacion"></div>
                          </div>
                        </div>
                      </td>

                      <!-- Calificación Promedio -->
                      <td class="p-3.5 text-center align-top">
                        @if (doc.promedioPuntaje !== null) {
                          <div class="font-black font-mono text-xs text-foreground">
                            {{ doc.promedioPuntaje }} / 100 Pts
                          </div>
                          <span 
                            [class]="doc.promedioPuntaje >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-blue-700 bg-blue-50 border-blue-200'"
                            class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold border mt-0.5">
                            {{ doc.promedioPuntaje >= 80 ? 'Sobresaliente' : 'Aprobado' }}
                          </span>
                        } @else {
                          <span class="text-muted-foreground text-xs italic">Sin evaluaciones</span>
                        }
                      </td>

                      <!-- Acciones -->
                      <td class="p-3.5 text-right align-top">
                        <div class="flex items-center justify-end gap-1.5">
                          <button 
                            type="button" 
                            (click)="descargarReporteDocentePdf(doc)"
                            [disabled]="doc.evaluadasCount === 0"
                            title="Descargar reporte oficial consolidado de este docente en formato PDF con firma y desglose"
                            class="px-2.5 py-1.5 rounded-xl border border-red-200/80 hover:border-red-300 bg-card hover:bg-red-50/50 text-red-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                            <i class="pi pi-file-pdf text-red-600 text-xs"></i>
                            <span>Reporte PDF</span>
                          </button>
                          <button 
                            type="button" 
                            (click)="alternarExpansionDocente(doc.docenteNombre)"
                            class="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer">
                            <span>{{ docenteExpandido(doc.docenteNombre) ? 'Ocultar Materias' : 'Gestionar / Evaluar' }}</span>
                            <i [class]="docenteExpandido(doc.docenteNombre) ? 'pi pi-chevron-up text-[10px]' : 'pi pi-chevron-down text-[10px]'"></i>
                          </button>
                        </div>
                      </td>

                    </tr>

                    <!-- Panel Expandido de Materias del Docente -->
                    @if (docenteExpandido(doc.docenteNombre)) {
                      <tr class="bg-muted/30">
                        <td colspan="5" class="p-4 pl-12 border-b border-border">
                          <div class="bg-card border border-border rounded-xl p-4 space-y-3 shadow-2xs">
                            <div class="flex items-center justify-between border-b border-border pb-2">
                              <span class="text-xs font-black text-foreground uppercase tracking-wider">
                                Materias asignadas a {{ doc.docenteNombre }}
                              </span>
                              <span class="text-[11px] text-muted-foreground font-bold">
                                Selecciona una materia para aplicar el test oficial
                              </span>
                            </div>

                            <div class="divide-y divide-border/60">
                              @for (mat of doc.materias; track mat.materiaCodigo) {
                                <div class="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div>
                                    <div class="flex items-center gap-2">
                                      <span class="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-black text-[10px]">
                                        {{ mat.materiaCodigo }}
                                      </span>
                                      <strong class="text-xs text-foreground">{{ mat.materiaNombre }}</strong>
                                    </div>
                                    <div class="text-[10px] text-muted-foreground mt-0.5">
                                      Semestre {{ mat.semestre }} · {{ mat.horas }} Horas · Grupo {{ mat.grupoCodigo }}
                                    </div>
                                  </div>

                                  <div class="flex items-center gap-2 self-end sm:self-center">
                                    @if (mat.registroEvaluacion; as reg) {
                                      <div class="text-right mr-2">
                                        <div class="font-black text-xs text-emerald-600 font-mono">
                                          {{ reg.puntajeTotal }} / {{ reg.puntajeMaximo }} Pts ({{ reg.porcentaje }}%)
                                        </div>
                                        <div class="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                                          <span>{{ reg.fechaEvaluacion }}</span>
                                          <span>·</span>
                                          <span class="text-primary font-bold truncate max-w-[200px]" [title]="reg.instrumentoTitulo">
                                            {{ reg.instrumentoTitulo }}
                                          </span>
                                        </div>
                                      </div>
                                      <button 
                                        type="button" 
                                        (click)="abrirFichaEvaluacion(reg)"
                                        class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold inline-flex items-center gap-1 shadow-2xs">
                                        <i class="pi pi-file text-primary"></i>
                                        <span>Ver Ficha</span>
                                      </button>
                                      @if (esAdminOResponsable()) {
                                        <button 
                                          type="button" 
                                          (click)="confirmarRestablecer(doc, mat)"
                                          title="Restablecer evaluación (Exclusivo Administrador)"
                                          class="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer">
                                          <i class="pi pi-undo text-[10px]"></i>
                                          <span>Restablecer</span>
                                        </button>
                                      }
                                    } @else {
                                      <button 
                                        type="button" 
                                        (click)="iniciarEvaluacionMateria(doc, mat)"
                                        class="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer">
                                        <i class="pi pi-pencil text-xs"></i>
                                        <span>Evaluar Docente en esta Materia</span>
                                      </button>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                          </div>
                        </td>
                      </tr>
                    }

                  }
                </tbody>
              </table>
            </div>
          }
        </div>

      }

      <!-- =================================================================== -->
      <!-- VISTA 2: GESTOR DE TESTS E INSTRUMENTOS (ADMIN)                    -->
      <!-- =================================================================== -->
      @if (vistaActiva() === 'instrumentos' && esAdminOResponsable()) {
        <div class="bg-card border border-border rounded-xl shadow-xs overflow-hidden space-y-4 p-5">
          <div class="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 class="text-base font-black text-foreground">Instrumentos de Evaluación Docente</h3>
              <p class="text-xs text-muted-foreground">
                Configura los instrumentos oficiales. <strong>Solo 1 test puede estar en VIGENCIA</strong> en todo el sistema.
              </p>
            </div>
            <button 
              type="button" 
              (click)="crearNuevoInstrumento()"
              class="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-primary/90 transition-all">
              <i class="pi pi-plus"></i>
              <span>Nuevo Instrumento</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th class="p-3.5">Código</th>
                  <th class="p-3.5">Título del Instrumento</th>
                  <th class="p-3.5 text-center">Estado de Vigencia</th>
                  <th class="p-3.5 text-center">Criterios</th>
                  <th class="p-3.5 text-center">Escala</th>
                  <th class="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y border-border text-xs">
                @for (inst of instrumentos(); track inst.id) {
                  <tr class="hover:bg-muted/20 transition-colors">
                    
                    <td class="p-3.5 font-mono font-bold text-primary">{{ inst.codigo }}</td>
                    
                    <td class="p-3.5">
                      <div class="font-bold text-foreground">{{ inst.titulo }}</div>
                      <div class="text-[11px] text-muted-foreground line-clamp-1">{{ inst.descripcion }}</div>
                    </td>

                    <td class="p-3.5 text-center">
                      @if (inst.estado === 'VIGENTE') {
                        <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-2xs">
                          <i class="pi pi-check-circle text-emerald-600"></i> En Vigencia Oficial
                        </span>
                      } @else if (inst.estado === 'HISTORICO') {
                        <span class="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                          Histórico
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                          Borrador
                        </span>
                      }
                    </td>

                    <td class="p-3.5 text-center font-bold text-foreground">
                      {{ inst.totalCriterios }} indicadores
                    </td>

                    <td class="p-3.5 text-center text-muted-foreground">
                      {{ inst.escalaMin }} a {{ inst.escalaMax }}
                    </td>

                    <td class="p-3.5 text-right">
                      <button 
                        type="button" 
                        (click)="verCriteriosInstrumento(inst)"
                        class="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs inline-flex items-center gap-1 transition-colors mr-1 cursor-pointer shadow-2xs">
                        <i class="pi pi-eye text-primary"></i>
                        <span>Ver Criterios</span>
                      </button>
                      <button 
                        type="button" 
                        (click)="duplicarInstrumento(inst)"
                        title="Duplicar este instrumento para crear una nueva versión"
                        class="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs inline-flex items-center gap-1 transition-colors mr-1 cursor-pointer shadow-2xs">
                        <i class="pi pi-copy text-amber-600"></i>
                        <span>Duplicar</span>
                      </button>
                      @if (inst.estado !== 'VIGENTE') {
                        <button 
                          type="button" 
                          (click)="ponerEnVigencia(inst)"
                          class="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors">
                          <i class="pi pi-check"></i>
                          <span>Poner en Vigencia</span>
                        </button>
                      } @else {
                        <span class="text-xs font-bold text-emerald-700 italic">Activo actualmente</span>
                      }
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- MODAL INTERACTIVO: APLICAR EVALUACIÓN DOCENTE                        -->
      <!-- =================================================================== -->
      @if (evaluandoMateria(); as mat) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <!-- Modal Header -->
            <div class="p-5 border-b border-border bg-muted/40 flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-primary/10 text-primary font-black text-[10px] tracking-wide uppercase">
                    Formulario de Evaluación
                  </span>
                  <h3 class="text-lg font-black text-foreground">
                    {{ instrumentoVigente()?.titulo || 'Evaluación de la Competencia Docente' }}
                  </h3>
                </div>
                
                <!-- Datos Generales Precargados -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <span class="text-[10px] font-bold text-muted-foreground uppercase block">Docente</span>
                    <strong class="text-foreground">{{ evaluandoDocente()?.docenteNombre }}</strong>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-muted-foreground uppercase block">Asignatura</span>
                    <strong class="text-foreground">{{ mat.materiaNombre }} ({{ mat.materiaCodigo }})</strong>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-muted-foreground uppercase block">Carrera</span>
                    <strong class="text-foreground">{{ filtroCarreraNombre() }}</strong>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-muted-foreground uppercase block">Evaluador</span>
                    <strong class="text-foreground">{{ auth.usuario()?.nombreCompleto || 'Director de Carrera' }}</strong>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                (click)="cerrarModalEvaluacion()"
                class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition-colors">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Modal Body (Formulario Dinámico de Preguntas) -->
            <div class="p-6 overflow-y-auto space-y-6 flex-1">
              
              <!-- Campos de Fecha y Hora de Aplicación -->
              <div class="bg-primary/5 border border-primary/20 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-black uppercase text-foreground mb-1">
                    <i class="pi pi-calendar text-primary mr-1"></i> Fecha de Aplicación *
                  </label>
                  <input 
                    type="date" 
                    [(ngModel)]="formFechaAplicacion" 
                    class="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="block text-[11px] font-black uppercase text-foreground mb-1">
                    <i class="pi pi-clock text-primary mr-1"></i> Hora de Aplicación
                  </label>
                  <input 
                    type="time" 
                    [(ngModel)]="formHoraAplicacion" 
                    class="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary" />
                </div>
              </div>

              <!-- Escala Referencial -->
              <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/60 rounded-xl border border-border text-[11px]">
                <span class="font-extrabold uppercase text-muted-foreground">Niveles de Logro:</span>
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-0.5 rounded bg-card border border-border font-bold">1 = Deficiente</span>
                  <span class="px-2 py-0.5 rounded bg-card border border-border font-bold">2 = Regular</span>
                  <span class="px-2 py-0.5 rounded bg-card border border-border font-bold">3 = Bueno</span>
                  <span class="px-2 py-0.5 rounded bg-card border border-border font-bold">4 = Muy Bueno</span>
                  <span class="px-2 py-0.5 rounded bg-card border border-border font-bold text-emerald-700">5 = Excelente</span>
                </div>
              </div>

              <!-- Bloques por Sección / Competencia -->
              @for (seccion of instrumentoVigente()?.secciones; track seccion.id) {
                <div class="border border-border rounded-xl overflow-hidden shadow-2xs">
                  <div class="bg-muted/70 px-4 py-3 flex items-center justify-between border-b border-border">
                    <div class="flex items-center gap-2">
                      <span class="h-6 w-6 rounded-md bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                        {{ seccion.orden }}
                      </span>
                      <h4 class="font-black text-sm text-foreground uppercase tracking-tight">{{ seccion.nombre }}</h4>
                    </div>
                    <div class="font-mono text-xs font-black text-primary">
                      Subtotal: {{ calcularSubtotalSeccion(seccion) }} Pts
                    </div>
                  </div>

                  <div class="divide-y divide-border bg-card">
                    @for (criterio of seccion.criterios; track criterio.id) {
                      <div class="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                        <div class="flex items-start gap-2.5 min-w-0 flex-1">
                          <span class="font-mono font-black text-primary text-xs shrink-0 mt-0.5">{{ criterio.numero }}</span>
                          <span class="text-xs font-medium text-foreground leading-relaxed">{{ criterio.enunciado }}</span>
                        </div>

                        <!-- Selector de Escala del 1 al 5 -->
                        <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          @for (puntos of [1, 2, 3, 4, 5]; track puntos) {
                            <button 
                              type="button" 
                              (click)="marcarRespuesta(criterio.id, puntos)"
                              [class]="respuestasMap[criterio.id] === puntos 
                                ? 'bg-primary text-primary-foreground font-black border-primary scale-105 shadow-xs' 
                                : 'bg-muted hover:bg-muted/80 text-foreground font-bold border-border'"
                              class="h-8 w-8 rounded-lg border text-xs flex items-center justify-center transition-all cursor-pointer">
                              {{ puntos }}
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Observaciones -->
              <div>
                <label class="block text-xs font-bold text-foreground mb-1">
                  Observaciones / Retroalimentación al Docente (Opcional):
                </label>
                <textarea 
                  [(ngModel)]="formObservaciones" 
                  rows="3" 
                  placeholder="Aspectos destacados, recomendaciones o comentarios pedagógicos..."
                  class="w-full bg-card border border-border rounded-xl p-3 text-xs outline-none focus:border-primary placeholder:text-muted-foreground"></textarea>
              </div>

            </div>

            <!-- Modal Footer con Totales en Vivo -->
            <div class="p-4 border-t border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <!-- Resumen de Totales -->
              <div class="flex items-center gap-4 text-xs">
                <div>
                  <span class="text-[10px] text-muted-foreground font-bold uppercase block">Puntaje Total</span>
                  <strong class="text-base font-mono font-black text-primary">
                    {{ puntajeTotalCalculado() }} / {{ puntajeMaximoCalculado() }} Pts
                  </strong>
                </div>
                <div class="border-l border-border pl-4">
                  <span class="text-[10px] text-muted-foreground font-bold uppercase block">Porcentaje</span>
                  <strong class="text-base font-mono font-black text-emerald-600">
                    {{ porcentajeCalculado() }}%
                  </strong>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  (click)="cerrarModalEvaluacion()"
                  class="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-colors">
                  Cancelar
                </button>
                <button 
                  type="button" 
                  (click)="guardarEvaluacion()"
                  [disabled]="guardandoEvaluacion() || !formularioCompleto()"
                  class="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer">
                  @if (guardandoEvaluacion()) {
                    <i class="pi pi-spin pi-spinner text-xs"></i>
                    <span>Guardando...</span>
                  } @else {
                    <i class="pi pi-check text-xs"></i>
                    <span>Guardar Evaluación</span>
                  }
                </button>
              </div>

            </div>

          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- MODAL / FICHA OFICIAL DE EVALUACIÓN (IMPRIMIBLE)                   -->
      <!-- =================================================================== -->
      @if (fichaVisualizada(); as reg) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <span class="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <i class="pi pi-file text-primary"></i> Ficha Oficial de Evaluación Docente
              </span>
              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="descargarFichaPdf(reg)" 
                  class="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
                  <i class="pi pi-file-pdf text-red-600"></i> Descargar Ficha PDF
                </button>
                <button 
                  type="button" 
                  (click)="fichaVisualizada.set(null)" 
                  class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>

            <!-- Contenido de la Ficha (Estilo UNITEPC Oficial) -->
            <div id="ficha-evaluacion-print" class="p-8 overflow-y-auto space-y-6 text-foreground bg-white text-black font-sans">
              
              <div class="text-center border-b pb-4">
                <img src="assets/logo_unitepc_clean.png" alt="UNITEPC" class="h-10 mx-auto mb-2 object-contain" />
                <h2 class="text-lg font-black tracking-wide uppercase">EVALUACIÓN DE LA COMPETENCIA DOCENTE</h2>
                <p class="text-xs text-gray-600 font-bold mt-0.5">UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC</p>
                <span class="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase mt-1.5">
                  {{ reg.instrumentoTitulo }}
                </span>
              </div>

              <!-- DATOS GENERALES -->
              <div class="border rounded-lg p-4 bg-gray-50/50 space-y-2 text-xs">
                <h4 class="font-black text-[11px] uppercase tracking-wider text-gray-700 border-b pb-1">DATOS GENERALES</h4>
                <div class="grid grid-cols-2 gap-2">
                  <div><strong>FACULTAD / CARRERA:</strong> {{ reg.carreraNombre }} ({{ reg.carreraCodigo }})</div>
                  <div><strong>SEDE ACADÉMICA:</strong> {{ reg.sedeNombre }}</div>
                  <div><strong>ASIGNATURA:</strong> {{ reg.materiaNombre }} (Grupo {{ reg.grupoCodigo }})</div>
                  <div><strong>NOMBRE DEL DOCENTE:</strong> {{ reg.docenteNombre }}</div>
                  <div><strong>FECHA DE EVALUACIÓN:</strong> {{ reg.fechaEvaluacion }}</div>
                  <div><strong>HORA:</strong> {{ reg.horaEvaluacion || '—' }}</div>
                  <div class="col-span-2"><strong>NOMBRE DEL EVALUADOR:</strong> {{ reg.evaluadorNombre }} ({{ reg.evaluadorRol }})</div>
                </div>
              </div>

              <!-- PUNTAJE TOTAL DE LA EVALUACIÓN -->
              <div class="border rounded-lg p-4 space-y-2 text-xs">
                <h4 class="font-black text-[11px] uppercase tracking-wider text-gray-700 border-b pb-1">PUNTAJE TOTAL DE LA EVALUACIÓN</h4>
                <div class="grid grid-cols-3 gap-2 py-1">
                  <div class="p-2 border rounded bg-gray-50 text-center">
                    <span class="block text-[10px] text-gray-500 font-bold uppercase">Competencia Actitudinal</span>
                    <strong class="text-sm font-black font-mono">{{ reg.puntajeActitudinal }} Pts.</strong>
                  </div>
                  <div class="p-2 border rounded bg-gray-50 text-center">
                    <span class="block text-[10px] text-gray-500 font-bold uppercase">Competencia Procedimental</span>
                    <strong class="text-sm font-black font-mono">{{ reg.puntajeProcedimental }} Pts.</strong>
                  </div>
                  <div class="p-2 border rounded bg-gray-50 text-center">
                    <span class="block text-[10px] text-gray-500 font-bold uppercase">Competencia Cognitiva</span>
                    <strong class="text-sm font-black font-mono">{{ reg.puntajeCognitivo }} Pts.</strong>
                  </div>
                </div>
                <div class="p-3 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-between text-xs font-black">
                  <span>PUNTAJE FINAL CONSOLIDADO:</span>
                  <span class="text-base text-indigo-900 font-mono">{{ reg.puntajeTotal }} / {{ reg.puntajeMaximo }} Pts ({{ reg.porcentaje }}%)</span>
                </div>
              </div>

              @if (reg.observaciones) {
                <div class="border rounded-lg p-3 text-xs bg-gray-50">
                  <strong>OBSERVACIONES / RECOMENDACIONES:</strong>
                  <p class="mt-1 text-gray-700">{{ reg.observaciones }}</p>
                </div>
              }

              <!-- Firmas -->
              <div class="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div class="border-t border-gray-400 mx-auto w-48 pt-2"></div>
                  <strong>FIRMA DEL DOCENTE EVALUADO</strong>
                </div>
                <div>
                  <div class="border-t border-gray-400 mx-auto w-48 pt-2"></div>
                  <strong>RESPONSABLE DE LA EVALUACIÓN</strong>
                  <div class="text-[10px] text-gray-500">{{ reg.evaluadorNombre }}</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      }

      <!-- MODAL CONFIRMAR RESTABLECER (ADMIN) -->
      @if (materiaParaRestablecer(); as item) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div class="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div class="flex items-center gap-3 text-red-600">
              <div class="h-10 w-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-lg shrink-0">
                <i class="pi pi-exclamation-triangle"></i>
              </div>
              <div>
                <h3 class="text-sm font-black text-foreground">¿Restablecer evaluación docente?</h3>
                <p class="text-[11px] text-muted-foreground">Acción exclusiva para Administrador</p>
              </div>
            </div>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Se eliminará la calificación actual de <strong>{{ item.doc.docenteNombre }}</strong> en la asignatura <strong>{{ item.mat.materiaNombre }}</strong>.
              La materia volverá a quedar en estado <strong>Pendiente</strong> para que el Director de Carrera pueda evaluarla nuevamente desde cero.
            </p>
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button 
                type="button" 
                (click)="materiaParaRestablecer.set(null)"
                class="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted text-foreground">
                Cancelar
              </button>
              <button 
                type="button" 
                (click)="ejecutarRestablecer()"
                [disabled]="guardandoEvaluacion()"
                class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer">
                <i class="pi pi-undo"></i>
                <span>Sí, Restablecer</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL VER CRITERIOS DEL TEST -->
      @if (instrumentoParaVer(); as inst) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in">
          <div class="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div class="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div>
                <h3 class="text-sm font-black text-foreground">{{ inst.titulo }}</h3>
                <p class="text-[11px] text-muted-foreground">Código: {{ inst.codigo }} · {{ inst.totalCriterios }} indicadores oficiales</p>
              </div>
              <button (click)="instrumentoParaVer.set(null)" class="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div class="p-5 overflow-y-auto space-y-4">
              @for (sec of inst.secciones; track sec.id) {
                <div class="border border-border rounded-xl p-3.5 bg-muted/20 space-y-2">
                  <h4 class="text-xs font-black text-primary uppercase flex items-center gap-2">
                    <span class="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px]">{{ sec.orden }}</span>
                    <span>{{ sec.nombre }}</span>
                  </h4>
                  <ul class="text-xs space-y-1.5 pl-6 list-disc text-muted-foreground">
                    @for (crit of sec.criterios; track crit.id) {
                      <li>
                        <strong class="text-foreground font-mono">{{ crit.numero }}:</strong> {{ crit.enunciado }}
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- MODAL CREAR / EDITAR INSTRUMENTO DE EVALUACIÓN (ADMIN)              -->
      <!-- =================================================================== -->
      @if (modalCrearInstrumento()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in">
          <div class="bg-card border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            <!-- Modal Header -->
            <div class="p-5 border-b border-border bg-muted/40 flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-primary/10 text-primary font-black text-[10px] tracking-wide uppercase">
                    Configuración de Instrumentos
                  </span>
                  <h3 class="text-base sm:text-lg font-black text-foreground">
                    {{ modoEdicionInstrumento() ? 'Editar Instrumento de Evaluación' : 'Crear Nuevo Instrumento de Evaluación' }}
                  </h3>
                </div>
                <p class="text-xs text-muted-foreground mt-1">
                  Define los datos generales, dimensiones y preguntas/criterios del test. <strong>Solo 1 test puede estar vigente a la vez.</strong>
                </p>
              </div>

              <button 
                type="button" 
                (click)="cerrarModalCrearInstrumento()"
                class="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="p-5 overflow-y-auto space-y-6">
              
              <!-- Barra de Acciones Rápidas de Creación -->
              <div class="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <i class="pi pi-bolt"></i>
                  <span>Opciones rápidas para armar el test:</span>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    type="button" 
                    (click)="clonarDesdeVigente()"
                    title="Carga las 3 dimensiones y 20 criterios oficiales como base para no tipear desde cero"
                    class="px-2.5 py-1.5 rounded-lg border border-primary/30 bg-card hover:bg-primary/10 text-primary font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors">
                    <i class="pi pi-copy"></i>
                    <span>Clonar del Test Vigente</span>
                  </button>

                  <button 
                    type="button" 
                    (click)="mostrarPanelImportar.set(!mostrarPanelImportar())"
                    class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors">
                    <i class="pi pi-file-import"></i>
                    <span>{{ mostrarPanelImportar() ? 'Ocultar Importador' : 'Importar Preguntas' }}</span>
                  </button>

                  <button 
                    type="button" 
                    (click)="limpiarFormularioInstrumento()"
                    class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors">
                    <i class="pi pi-refresh"></i>
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              <!-- Panel Desplegable de Importación por Texto / Archivo -->
              @if (mostrarPanelImportar()) {
                <div class="border border-border rounded-xl p-4 bg-muted/30 space-y-3 animate-in fade-in">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                        <i class="pi pi-file-edit text-primary"></i>
                        <span>Importador rápido de preguntas / criterios</span>
                      </h4>
                      <p class="text-[11px] text-muted-foreground mt-0.5">
                        Pega texto con dimensiones entre corchetes <code class="bg-muted px-1 rounded">[Competencia ...]</code> y criterios numerados <code class="bg-muted px-1 rounded">1. ...</code>, o sube un archivo <code class="bg-muted px-1 rounded">.txt</code>.
                      </p>
                    </div>
                    <label class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                      <i class="pi pi-upload text-primary"></i>
                      <span>Subir archivo .txt</span>
                      <input type="file" accept=".txt,.json,.csv" (change)="onArchivoImportarSeleccionado($event)" class="hidden" />
                    </label>
                  </div>

                  <textarea 
                    [(ngModel)]="textoImportarPreguntas"
                    rows="6"
                    placeholder="Ejemplo:&#10;[Competencia Actitudinal]&#10;1. Cumple puntualmente con el inicio de sus clases.&#10;2. Demuestra empatía y respeto con los estudiantes.&#10;&#10;[Competencia Procedimental]&#10;3. Aplica estrategias dinámicas de enseñanza."
                    class="w-full text-xs font-mono p-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"></textarea>

                  <div class="flex items-center justify-end gap-2">
                    <button 
                      type="button" 
                      (click)="mostrarPanelImportar.set(false)"
                      class="px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-muted text-foreground">
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      (click)="parsearTextoImportado()"
                      class="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer">
                      <i class="pi pi-check"></i>
                      <span>Procesar y Cargar Preguntas</span>
                    </button>
                  </div>
                </div>
              }

              <!-- Datos Generales del Test -->
              <div class="space-y-4">
                <h4 class="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <i class="pi pi-info-circle text-primary"></i>
                  <span>1. Datos Generales del Instrumento</span>
                </h4>

                <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                  
                  <div class="sm:col-span-8 space-y-1">
                    <label class="font-bold text-muted-foreground uppercase text-[10px]">Título del Instrumento *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formInstTitulo"
                      placeholder="Ej: EVALUACIÓN DE LA COMPETENCIA DOCENTE II-2026"
                      class="w-full p-2.5 rounded-lg border border-border bg-card text-foreground font-bold focus:ring-2 focus:ring-primary focus:outline-hidden" />
                  </div>

                  <div class="sm:col-span-4 space-y-1">
                    <label class="font-bold text-muted-foreground uppercase text-[10px]">Código Identificador *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formInstCodigo"
                      (input)="formInstCodigo = formInstCodigo.toUpperCase()"
                      placeholder="Ej: EVAL-DIR-2026-V2"
                      class="w-full p-2.5 rounded-lg border border-border bg-card text-foreground font-mono font-bold uppercase focus:ring-2 focus:ring-primary focus:outline-hidden" />
                  </div>

                  <div class="sm:col-span-8 space-y-1">
                    <label class="font-bold text-muted-foreground uppercase text-[10px]">Descripción Institucional</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formInstDescripcion"
                      placeholder="Ej: Instrumento oficial aplicado por Directores de Carrera a la planta docente"
                      class="w-full p-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden" />
                  </div>

                  <div class="sm:col-span-4 space-y-1">
                    <label class="font-bold text-muted-foreground uppercase text-[10px]">Escala de Valoración</label>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-muted-foreground font-bold">Mín:</span>
                      <input 
                        type="number" 
                        [(ngModel)]="formInstEscalaMin" 
                        min="1" 
                        max="5"
                        class="w-16 p-2 rounded-lg border border-border bg-card text-center font-bold font-mono" />
                      <span class="text-xs text-muted-foreground font-bold">Máx:</span>
                      <input 
                        type="number" 
                        [(ngModel)]="formInstEscalaMax" 
                        min="2" 
                        max="10"
                        class="w-16 p-2 rounded-lg border border-border bg-card text-center font-bold font-mono" />
                    </div>
                  </div>

                  <div class="sm:col-span-12 pt-2">
                    <label class="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="formInstPonerEnVigencia"
                        class="h-4 w-4 rounded text-primary focus:ring-primary" />
                      <div>
                        <strong class="text-xs text-foreground block">Poner este instrumento en VIGENCIA inmediatamente</strong>
                        <span class="text-[11px] text-muted-foreground">Si se activa, pasará a ser el test oficial que aplican los Directores de Carrera en todo el sistema.</span>
                      </div>
                    </label>
                  </div>

                </div>
              </div>

              <!-- Dimensiones y Criterios -->
              <div class="space-y-4 pt-2">
                <div class="flex items-center justify-between border-b border-border pb-2">
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <i class="pi pi-list text-primary"></i>
                      <span>2. Dimensiones y Criterios / Preguntas</span>
                    </h4>
                    <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold text-[10px]">
                      {{ totalCriteriosFormulario() }} preguntas en {{ formInstSecciones.length }} dimensiones
                    </span>
                  </div>

                  <button 
                    type="button" 
                    (click)="agregarSeccion()"
                    class="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs inline-flex items-center gap-1 cursor-pointer">
                    <i class="pi pi-plus text-[10px]"></i>
                    <span>Agregar Dimensión</span>
                  </button>
                </div>

                @if (formInstSecciones.length === 0) {
                  <div class="p-8 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground text-xs space-y-2">
                    <i class="pi pi-inbox text-3xl text-muted-foreground/50"></i>
                    <p>No hay dimensiones definidas aún. Agrega una dimensión o usa las opciones rápidas arriba.</p>
                    <button 
                      type="button" 
                      (click)="agregarSeccion()"
                      class="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs">
                      + Crear Primera Dimensión
                    </button>
                  </div>
                } @else {
                  <div class="space-y-4">
                    @for (sec of formInstSecciones; track $index; let sIdx = $index) {
                      <div class="border border-border rounded-xl bg-card shadow-2xs overflow-hidden">
                        
                        <!-- Encabezado de la Dimensión -->
                        <div class="p-3 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div class="flex items-center gap-2 flex-1">
                            <span class="h-6 w-6 rounded bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shrink-0">
                              {{ sIdx + 1 }}
                            </span>
                            <input 
                              type="text" 
                              [(ngModel)]="sec.nombre" 
                              placeholder="Nombre de la dimensión (ej: Competencia Actitudinal)" 
                              class="font-bold text-xs p-1.5 rounded border border-border bg-card text-foreground flex-1 focus:ring-1 focus:ring-primary" />
                            <input 
                              type="text" 
                              [(ngModel)]="sec.codigo" 
                              placeholder="Código (ej: SEC-1)" 
                              class="font-mono text-[11px] p-1.5 rounded border border-border bg-card text-muted-foreground w-24 uppercase" />
                          </div>

                          <div class="flex items-center gap-2 self-end sm:self-center">
                            <span class="text-[10px] text-muted-foreground font-bold">
                              {{ sec.criterios.length }} criterios
                            </span>
                            <button 
                              type="button" 
                              (click)="agregarCriterio(sIdx)"
                              class="px-2 py-1 rounded bg-card hover:bg-muted border border-border text-foreground font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer">
                              <i class="pi pi-plus text-[9px] text-primary"></i>
                              <span>Pregunta</span>
                            </button>
                            @if (formInstSecciones.length > 1) {
                              <button 
                                type="button" 
                                (click)="eliminarSeccion(sIdx)"
                                title="Eliminar esta dimensión completa"
                                class="h-7 w-7 rounded border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center text-xs cursor-pointer">
                                <i class="pi pi-trash text-[10px]"></i>
                              </button>
                            }
                          </div>
                        </div>

                        <!-- Lista de Criterios de la Dimensión -->
                        <div class="p-3 space-y-2">
                          @for (crit of sec.criterios; track $index; let cIdx = $index) {
                            <div class="flex items-start gap-2 group">
                              <input 
                                type="text" 
                                [(ngModel)]="crit.numero" 
                                placeholder="#" 
                                class="w-10 p-1.5 rounded border border-border bg-muted/20 font-mono font-bold text-xs text-center shrink-0" />
                              <textarea 
                                [(ngModel)]="crit.enunciado" 
                                rows="2"
                                placeholder="Enunciado de la pregunta o indicador de desempeño docente..." 
                                class="flex-1 p-2 rounded border border-border bg-card text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden resize-y"></textarea>
                              <button 
                                type="button" 
                                (click)="eliminarCriterio(sIdx, cIdx)"
                                title="Eliminar este criterio"
                                class="h-8 w-8 rounded border border-border text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center shrink-0 cursor-pointer transition-colors">
                                <i class="pi pi-times text-xs"></i>
                              </button>
                            </div>
                          }

                          <div class="pt-1">
                            <button 
                              type="button" 
                              (click)="agregarCriterio(sIdx)"
                              class="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
                              <i class="pi pi-plus text-[10px]"></i>
                              <span>Agregar otro criterio a esta dimensión</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    }
                  </div>
                }

              </div>

            </div>

            <!-- Modal Footer -->
            <div class="p-4 border-t border-border bg-muted/30 flex items-center justify-between gap-3">
              <div class="text-xs text-muted-foreground">
                <span class="font-bold text-foreground">{{ formInstSecciones.length }}</span> dimensiones · 
                <span class="font-bold text-foreground">{{ totalCriteriosFormulario() }}</span> preguntas en total
              </div>

              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="cerrarModalCrearInstrumento()"
                  class="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted text-foreground">
                  Cancelar
                </button>
                <button 
                  type="button" 
                  (click)="guardarNuevoInstrumento()"
                  [disabled]="guardandoInstrumento()"
                  class="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  @if (guardandoInstrumento()) {
                    <i class="pi pi-spin pi-spinner"></i>
                    <span>Guardando Instrumento...</span>
                  } @else {
                    <i class="pi pi-check"></i>
                    <span>Guardar Instrumento</span>
                  }
                </button>
              </div>
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
export class EvaluacionDocenteComponent implements OnInit {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly gateway = inject(UnitepcGatewayService);
  private readonly evaluacionService = inject(EvaluacionDocenteService);
  public readonly auth = inject(AuthService);

  public vistaActiva = signal<'evaluaciones' | 'instrumentos'>('evaluaciones');

  // Filtros
  public sedes = signal<BranchOffice[]>([]);
  public carreras = signal<Career[]>([]);
  public filtroSedeCodigo = '';
  public filtroCarreraCodigo = '';
  public busquedaTexto = signal('');
  public filtroEstado = signal<'todos' | 'completados' | 'en_progreso' | 'pendientes'>('todos');

  // Estados de carga
  public cargandoSedes = signal(true);
  public cargandoCarreras = signal(false);
  public cargandoDocentes = signal(false);
  public guardandoEvaluacion = signal(false);
  public toastMessage = signal<string | null>(null);

  // Datos
  public instrumentoVigente = signal<EvaluacionInstrumento | null>(null);
  public instrumentos = signal<EvaluacionInstrumento[]>([]);
  public docentesTotales = signal<DocenteEvaluacionRow[]>([]);
  public docentesExpandidos = signal<Set<string>>(new Set());

  // Modal Aplicar
  public evaluandoDocente = signal<DocenteEvaluacionRow | null>(null);
  public evaluandoMateria = signal<MateriaDocenteItem | null>(null);
  public formFechaAplicacion = '';
  public formHoraAplicacion = '';
  public formObservaciones = '';
  public respuestasMap: Record<string, number> = {};

  // Modal Ver Ficha
  public fichaVisualizada = signal<EvaluacionDocenteRegistro | null>(null);

  // Modal Confirmar Restablecer
  public materiaParaRestablecer = signal<{ doc: DocenteEvaluacionRow, mat: MateriaDocenteItem } | null>(null);

  // Modal Ver Criterios
  public instrumentoParaVer = signal<EvaluacionInstrumento | null>(null);

  // Modal Crear / Editar Instrumento
  public modalCrearInstrumento = signal<boolean>(false);
  public modoEdicionInstrumento = signal<boolean>(false);
  public guardandoInstrumento = signal<boolean>(false);
  public mostrarPanelImportar = signal<boolean>(false);
  public textoImportarPreguntas = '';

  public formInstId: string | null = null;
  public formInstCodigo = '';
  public formInstTitulo = '';
  public formInstDescripcion = '';
  public formInstEscalaMin = 1;
  public formInstEscalaMax = 5;
  public formInstPonerEnVigencia = false;
  public formInstSecciones: FormSeccionItem[] = [];

  public totalCriteriosFormulario = computed(() => {
    return this.formInstSecciones.reduce((acc, s) => acc + (s.criterios ? s.criterios.length : 0), 0);
  });

  public esAdminOResponsable = computed(() => {
    const rol = this.auth.usuario()?.rol;
    return rol === 'ADMINISTRADOR_SISTEMA' || rol === 'RESPONSABLE_EVALUACIONES';
  });

  public filtroCarreraNombre = computed(() => {
    const car = this.carreras().find(c => c.careerCode === this.filtroCarreraCodigo);
    return car ? car.careerName : this.filtroCarreraCodigo;
  });

  public totalCompletados = computed(() => this.docentesTotales().filter(d => d.porcentajeEvaluacion === 100).length);
  public totalEnProgreso = computed(() => this.docentesTotales().filter(d => d.porcentajeEvaluacion > 0 && d.porcentajeEvaluacion < 100).length);
  public totalSinEvaluar = computed(() => this.docentesTotales().filter(d => d.porcentajeEvaluacion === 0).length);

  public docentesFiltrados = computed(() => {
    let lista = this.docentesTotales();
    const texto = this.busquedaTexto().trim().toLowerCase();
    const estado = this.filtroEstado();

    if (estado === 'completados') {
      lista = lista.filter(d => d.porcentajeEvaluacion === 100);
    } else if (estado === 'en_progreso') {
      lista = lista.filter(d => d.porcentajeEvaluacion > 0 && d.porcentajeEvaluacion < 100);
    } else if (estado === 'pendientes') {
      lista = lista.filter(d => d.porcentajeEvaluacion === 0);
    }

    if (texto) {
      lista = lista.filter(d =>
        d.docenteNombre.toLowerCase().includes(texto) ||
        (d.docenteCi && d.docenteCi.toLowerCase().includes(texto)) ||
        d.materias.some(m => m.materiaNombre.toLowerCase().includes(texto) || m.materiaCodigo.toLowerCase().includes(texto))
      );
    }

    return lista;
  });

  public puntajeTotalCalculado = computed(() => {
    return Object.values(this.respuestasMap).reduce((a, b) => a + b, 0);
  });

  public puntajeMaximoCalculado = computed(() => {
    const totalCrit = this.instrumentoVigente()?.totalCriterios || 20;
    return totalCrit * (this.instrumentoVigente()?.escalaMax || 5);
  });

  public porcentajeCalculado = computed(() => {
    const max = this.puntajeMaximoCalculado();
    if (!max) return 0;
    return Math.round((this.puntajeTotalCalculado() / max) * 100);
  });

  public formularioCompleto(): boolean {
    const inst = this.instrumentoVigente();
    if (!inst || !inst.secciones) return false;
    let todosRespondidos = true;
    for (const sec of inst.secciones) {
      for (const crit of sec.criterios) {
        if (!this.respuestasMap[crit.id]) {
          todosRespondidos = false;
          break;
        }
      }
    }
    return todosRespondidos && !!this.formFechaAplicacion;
  }

  public ngOnInit(): void {
    const hoy = new Date();
    this.formFechaAplicacion = hoy.toISOString().substring(0, 10);
    this.formHoraAplicacion = hoy.toTimeString().substring(0, 5);

    this.cargarInstrumentoVigente();
    if (this.esAdminOResponsable()) {
      this.cargarTodosInstrumentos();
    }
    this.cargarSedes();
  }

  public cargarInstrumentoVigente(): void {
    this.evaluacionService.obtenerInstrumentoVigente().subscribe({
      next: inst => this.instrumentoVigente.set(inst),
      error: () => console.warn('No se pudo cargar el instrumento vigente')
    });
  }

  public cargarTodosInstrumentos(): void {
    this.evaluacionService.listarInstrumentos().subscribe({
      next: lista => this.instrumentos.set(lista),
      error: () => console.warn('No se pudieron listar los instrumentos')
    });
  }

  public ponerEnVigencia(inst: EvaluacionInstrumento): void {
    this.evaluacionService.ponerEnVigencia(inst.id).subscribe({
      next: updated => {
        this.mostrarToast(`El test '${updated.titulo}' ahora está en VIGENCIA.`);
        this.cargarTodosInstrumentos();
        this.cargarInstrumentoVigente();
      },
      error: () => this.mostrarToast('Error al poner en vigencia el test')
    });
  }

  public onGestionChange(nuevaGestion: string): void {
    this.storage.setGestionActiva(nuevaGestion);
    this.recargarPlan();
  }

  public onSedeChange(codigoSede: string): void {
    this.filtroSedeCodigo = codigoSede;
    this.filtroCarreraCodigo = '';
    this.carreras.set([]);
    this.docentesTotales.set([]);
    this.cargarCarreras(codigoSede);
  }

  public onCarreraChange(codigoCarrera: string): void {
    this.filtroCarreraCodigo = codigoCarrera;
    this.recargarPlan();
  }

  public recargarPlan(): void {
    if (this.filtroSedeCodigo && this.filtroCarreraCodigo) {
      this.cargarDocentesReales(this.filtroSedeCodigo, this.filtroCarreraCodigo);
    }
  }

  private cargarSedes(): void {
    this.cargandoSedes.set(true);
    this.gateway.getBranchOffices().subscribe({
      next: sedes => {
        this.sedes.set(sedes || []);
        this.cargandoSedes.set(false);
        const inicial = this.gateway.resolverSedeInicial(sedes);
        if (inicial) {
          this.filtroSedeCodigo = inicial.code;
          this.cargarCarreras(inicial.code);
        }
      },
      error: () => this.cargandoSedes.set(false)
    });
  }

  private cargarCarreras(codigoSede: string): void {
    this.cargandoCarreras.set(true);
    this.gateway.getCareers(codigoSede).subscribe({
      next: carreras => {
        this.carreras.set(carreras || []);
        this.cargandoCarreras.set(false);
        if (carreras && carreras.length > 0) {
          this.filtroCarreraCodigo = carreras[0].careerCode;
          this.recargarPlan();
        }
      },
      error: () => this.cargandoCarreras.set(false)
    });
  }

  private cargarDocentesReales(codigoSede: string, codigoCarrera: string): void {
    this.cargandoDocentes.set(true);
    const sede = this.sedes().find(s => s.code === codigoSede);
    const carrera = this.carreras().find(c => c.careerCode === codigoCarrera);

    const gestion = this.storage.gestionActiva();
    const grupos$ = sede && carrera
      ? this.gateway.getGroups(this.gestionParaSea(), sede.branchOfficeId, carrera.careerId, undefined, sede.code, carrera.careerCode).pipe(
          catchError(() => of([] as GroupItem[]))
        )
      : of([] as GroupItem[]);

    forkJoin({
      cursos: carrera ? this.gateway.getCourses(codigoSede, carrera.careerId).pipe(catchError(() => of([] as Course[]))) : of([] as Course[]),
      grupos: grupos$,
      registros: this.evaluacionService.listarRegistros(gestion, codigoSede, codigoCarrera).pipe(catchError(() => of([] as EvaluacionDocenteRegistro[])))
    }).subscribe({
      next: ({ cursos, grupos, registros }) => {
        // Mapa de cursos por syllabusCourseId
        const cursosMap = new Map<string, Course>();
        cursos.forEach(c => cursosMap.set(c.syllabusCourseId, c));

        // Mapa de registros de evaluación por clave: DOCENTE_MATERIA
        const regMap = new Map<string, EvaluacionDocenteRegistro>();
        registros.forEach(r => {
          const key = `${r.docenteNombre.trim().toUpperCase()}_${r.materiaCodigo.trim().toUpperCase()}`;
          regMap.set(key, r);
        });

        // Agrupación por Docente
        const docentesMap = new Map<string, {
          docenteNombre: string;
          docenteCi?: string;
          materiasMap: Map<string, MateriaDocenteItem>;
        }>();

        grupos.forEach(g => {
          const rawDocente = (g.teacherFullName || g.teacherName || '').trim();
          // Ignorar materias sin docente asignado
          if (!rawDocente || rawDocente.toUpperCase() === 'POR DESIGNAR' || rawDocente.toUpperCase().includes('SIN ASIGNAR')) {
            return;
          }

          const docKey = rawDocente.toUpperCase();
          let docEntry = docentesMap.get(docKey);
          if (!docEntry) {
            docEntry = {
              docenteNombre: rawDocente,
              docenteCi: g.teacherIdentityNumber || undefined,
              materiasMap: new Map()
            };
            docentesMap.set(docKey, docEntry);
          } else if (!docEntry.docenteCi && g.teacherIdentityNumber) {
            docEntry.docenteCi = g.teacherIdentityNumber;
          }

          const curso = cursosMap.get(g.syllabusCourseId);
          const matCodigo = curso ? curso.courseCode : g.syllabusCourseId;
          const matNombre = curso ? curso.courseName : 'Materia ' + matCodigo;
          const semestre = curso ? curso.semester : 1;
          const horas = curso ? (curso.theoryHours + curso.practiceHours) : 4;

          const matKey = matCodigo.toUpperCase();
          if (!docEntry.materiasMap.has(matKey)) {
            const regKey = `${docKey}_${matKey}`;
            const reg = regMap.get(regKey);

            docEntry.materiasMap.set(matKey, {
              cursoId: g.syllabusCourseId,
              materiaCodigo: matCodigo,
              materiaNombre: matNombre,
              semestre: semestre,
              horas: horas,
              grupoCodigo: g.code,
              tipoClase: g.classType || 'TA',
              registroEvaluacion: reg
            });
          }
        });

        // Construir arreglo final de DocenteEvaluacionRow
        const rows: DocenteEvaluacionRow[] = Array.from(docentesMap.values()).map(entry => {
          const materiasList = Array.from(entry.materiasMap.values()).sort((a, b) => a.semestre - b.semestre || a.materiaNombre.localeCompare(b.materiaNombre));
          const totalMats = materiasList.length;
          const evaluadas = materiasList.filter(m => !!m.registroEvaluacion).length;
          const pct = totalMats > 0 ? Math.round((evaluadas / totalMats) * 100) : 0;

          // Promedio de notas
          let promedio: number | null = null;
          if (evaluadas > 0) {
            const sumaPuntos = materiasList.reduce((acc, m) => acc + (m.registroEvaluacion ? Number(m.registroEvaluacion.puntajeTotal) : 0), 0);
            promedio = Math.round((sumaPuntos / evaluadas) * 10) / 10;
          }

          return {
            docenteNombre: entry.docenteNombre,
            docenteCi: entry.docenteCi,
            materias: materiasList,
            totalMaterias: totalMats,
            evaluadasCount: evaluadas,
            porcentajeEvaluacion: pct,
            promedioPuntaje: promedio
          };
        });

        rows.sort((a, b) => a.docenteNombre.localeCompare(b.docenteNombre));
        this.docentesTotales.set(rows);
        this.cargandoDocentes.set(false);
      },
      error: () => this.cargandoDocentes.set(false)
    });
  }

  public alternarExpansionDocente(docenteNombre: string): void {
    const set = new Set(this.docentesExpandidos());
    if (set.has(docenteNombre)) {
      set.delete(docenteNombre);
    } else {
      set.add(docenteNombre);
    }
    this.docentesExpandidos.set(set);
  }

  public docenteExpandido(docenteNombre: string): boolean {
    return this.docentesExpandidos().has(docenteNombre);
  }

  public iniciarEvaluacionMateria(doc: DocenteEvaluacionRow, mat: MateriaDocenteItem): void {
    this.evaluandoDocente.set(doc);
    this.evaluandoMateria.set(mat);
    this.respuestasMap = {};
    const hoy = new Date();
    this.formFechaAplicacion = hoy.toISOString().substring(0, 10);
    this.formHoraAplicacion = hoy.toTimeString().substring(0, 5);
    this.formObservaciones = '';

    // Asegurar que siempre se cargue la versión actualmente VIGENTE del instrumento oficial
    this.cargarInstrumentoVigente();

    if (mat.registroEvaluacion) {
      this.evaluacionService.obtenerRegistroPorId(mat.registroEvaluacion.id).subscribe({
        next: fullReg => {
          if (fullReg.respuestas) {
            fullReg.respuestas.forEach(r => {
              this.respuestasMap[r.criterioId] = r.puntuacion;
            });
          }
          if (fullReg.observaciones) this.formObservaciones = fullReg.observaciones;
          if (fullReg.fechaEvaluacion) this.formFechaAplicacion = fullReg.fechaEvaluacion;
          if (fullReg.horaEvaluacion) this.formHoraAplicacion = fullReg.horaEvaluacion;
        }
      });
    } else {
      // Valor por defecto 3 (Bueno)
      const inst = this.instrumentoVigente();
      if (inst && inst.secciones) {
        inst.secciones.forEach(sec => {
          sec.criterios.forEach(crit => {
            this.respuestasMap[crit.id] = 3;
          });
        });
      }
    }
  }

  public marcarRespuesta(criterioId: string, puntos: number): void {
    this.respuestasMap[criterioId] = puntos;
  }

  public calcularSubtotalSeccion(seccion: any): number {
    if (!seccion || !seccion.criterios) return 0;
    return seccion.criterios.reduce((acc: number, c: any) => acc + (this.respuestasMap[c.id] || 0), 0);
  }

  public cerrarModalEvaluacion(): void {
    this.evaluandoDocente.set(null);
    this.evaluandoMateria.set(null);
    this.respuestasMap = {};
  }

  public guardarEvaluacion(): void {
    const doc = this.evaluandoDocente();
    const mat = this.evaluandoMateria();
    const inst = this.instrumentoVigente();
    if (!doc || !mat || !inst) return;

    const respuestas: EvaluacionDocenteRespuesta[] = Object.entries(this.respuestasMap).map(([critId, pts]) => ({
      criterioId: critId,
      puntuacion: pts
    }));

    const sede = this.sedes().find(s => s.code === this.filtroSedeCodigo);
    const carrera = this.carreras().find(c => c.careerCode === this.filtroCarreraCodigo);
    const user = this.auth.usuario();

    const payload: EvaluacionDocenteAplicarRequest = {
      instrumentoId: inst.id,
      gestion: this.storage.gestionActiva(),
      sedeId: sede?.branchOfficeId,
      sedeCodigo: this.filtroSedeCodigo,
      sedeNombre: sede?.name || this.filtroSedeCodigo,
      carreraId: carrera?.careerId,
      carreraCodigo: this.filtroCarreraCodigo,
      carreraNombre: carrera?.careerName || this.filtroCarreraCodigo,
      materiaCodigo: mat.materiaCodigo,
      materiaNombre: mat.materiaNombre,
      grupoCodigo: mat.grupoCodigo,
      docenteNombre: doc.docenteNombre,
      docenteIdentificacion: doc.docenteCi,
      evaluadorNombre: user?.nombreCompleto || 'Director de Carrera',
      evaluadorRol: user?.rolNombre || 'DIRECTOR_CARRERA',
      fechaEvaluacion: this.formFechaAplicacion,
      horaEvaluacion: this.formHoraAplicacion,
      observaciones: this.formObservaciones,
      respuestas: respuestas
    };

    this.guardandoEvaluacion.set(true);
    this.evaluacionService.aplicarEvaluacion(payload).subscribe({
      next: guardado => {
        this.guardandoEvaluacion.set(false);
        this.cerrarModalEvaluacion();
        this.mostrarToast(`Evaluación de '${doc.docenteNombre}' en '${mat.materiaNombre}' guardada con éxito (${guardado.puntajeTotal}/${guardado.puntajeMaximo} Pts).`);
        this.recargarPlan();
      },
      error: err => {
        this.guardandoEvaluacion.set(false);
        this.mostrarToast('Error al guardar la evaluación.');
        console.error(err);
      }
    });
  }

  public confirmarRestablecer(doc: DocenteEvaluacionRow, mat: MateriaDocenteItem): void {
    this.materiaParaRestablecer.set({ doc, mat });
  }

  public ejecutarRestablecer(): void {
    const item = this.materiaParaRestablecer();
    if (!item || !item.mat.registroEvaluacion) return;

    const regId = item.mat.registroEvaluacion.id;
    this.guardandoEvaluacion.set(true);
    this.evaluacionService.restablecerEvaluacion(regId).subscribe({
      next: () => {
        this.guardandoEvaluacion.set(false);
        this.materiaParaRestablecer.set(null);
        this.mostrarToast(`Evaluación de '${item.doc.docenteNombre}' en '${item.mat.materiaNombre}' restablecida correctamente.`);
        this.recargarPlan();
      },
      error: err => {
        this.guardandoEvaluacion.set(false);
        this.mostrarToast('Error al restablecer la evaluación.');
        console.error(err);
      }
    });
  }

  public verCriteriosInstrumento(inst: EvaluacionInstrumento): void {
    if (inst.secciones && inst.secciones.length > 0) {
      this.instrumentoParaVer.set(inst);
    } else {
      this.evaluacionService.obtenerInstrumentoPorId(inst.id).subscribe({
        next: full => this.instrumentoParaVer.set(full),
        error: () => this.mostrarToast('No fue posible cargar el detalle del instrumento.')
      });
    }
  }

  public descargarReporteCarreraPdf(): void {
    const docentes = this.docentesTotales();
    if (docentes.length === 0) {
      this.mostrarToast('No hay datos de docentes para generar el reporte.');
      return;
    }

    const carreraNombre = this.filtroCarreraNombre();
    const sedeNombre = this.sedes().find(s => s.code === this.filtroSedeCodigo)?.name || this.filtroSedeCodigo;
    const gestion = this.storage.gestionActiva();
    const instVigente = this.instrumentoVigente();
    const instNom = instVigente?.titulo || 'Evaluación de la Competencia Docente';

    // Cálculo del promedio general de la carrera
    const conPuntaje = docentes.filter(d => d.promedioPuntaje !== null);
    const promedioGeneral = conPuntaje.length > 0
      ? (conPuntaje.reduce((acc, d) => acc + (d.promedioPuntaje || 0), 0) / conPuntaje.length).toFixed(1)
      : '—';

    // Generador jsPDF tamaño Carta
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter', compress: true });
    const pageWidth = 215.9;
    const pageHeight = 279.4;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 187.9 mm

    const purple = { r: 49, g: 39, b: 130 };
    const dark = { r: 24, g: 30, b: 42 };
    const muted = { r: 100, g: 110, b: 125 };
    const lightBg = { r: 247, g: 249, b: 252 };
    const border = { r: 215, g: 222, b: 232 };
    const green = { r: 16, g: 130, b: 80 };
    const blue = { r: 25, g: 90, b: 180 };
    const amber = { r: 185, g: 100, b: 15 };

    const fechaStr = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const dibujarCabecera = (pagActual: number) => {
      // Logo institucional UNITEPC estratégico en esquina superior izquierda
      try {
        pdf.addImage(UNITEPC_LOGO_PNG, 'PNG', margin, 8.5, 36, 8.1);
      } catch (e) {
        console.warn('No se pudo incrustar el logo en el PDF', e);
      }

      const textStartX = margin + 40;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(purple.r, purple.g, purple.b);
      pdf.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC', textStartX, 11);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text('SISTEMA DE EVALUACIÓN ACADÉMICA (SEA)', textStartX, 14.5);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(dark.r, dark.g, dark.b);
      pdf.text('REPORTE OFICIAL DE EVALUACIÓN DOCENTE POR CARRERA', textStartX, 19);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(purple.r, purple.g, purple.b);
      const titPrincipal = pdf.splitTextToSize(`INSTRUMENTO APLICADO: ${instNom.toUpperCase()}`, 110)[0];
      pdf.text(titPrincipal, textStartX, 23);

      // Metadatos derecha
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text(`Emisión: ${fechaStr}`, pageWidth - margin, 11, { align: 'right' });
      pdf.text(`Gestión: ${gestion}`, pageWidth - margin, 15, { align: 'right' });
      pdf.text(`Página ${pagActual}`, pageWidth - margin, 19, { align: 'right' });

      pdf.setDrawColor(purple.r, purple.g, purple.b);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 25.5, pageWidth - margin, 25.5);
    };

    const dibujarCabeceraTabla = (currY: number): number => {
      pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
      pdf.setDrawColor(border.r, border.g, border.b);
      pdf.setLineWidth(0.2);
      pdf.rect(margin, currY, contentWidth, 7, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(purple.r, purple.g, purple.b);

      pdf.text('#', margin + 3, currY + 4.5);
      pdf.text('DOCENTE EVALUADO / C.I.', margin + 12, currY + 4.5);
      pdf.text('MATERIAS ASIGNADAS', margin + 84, currY + 4.5);
      pdf.text('% AVANCE', margin + 126, currY + 4.5, { align: 'center' });
      pdf.text('CALIFICACIÓN', margin + 152, currY + 4.5, { align: 'center' });
      pdf.text('ESTADO / CONCEPTO', margin + 174, currY + 4.5, { align: 'center' });

      return currY + 7;
    };

    let paginaActual = 1;
    dibujarCabecera(paginaActual);

    // Metadata Box (Página 1)
    const metaY = 30;
    const metaH = 14;
    pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
    pdf.setDrawColor(border.r, border.g, border.b);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(margin, metaY, contentWidth, metaH, 1.5, 1.5, 'FD');

    const colW = contentWidth / 3;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text('SEDE ACADÉMICA:', margin + 3, metaY + 4.5);
    pdf.setFontSize(8);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text(sedeNombre, margin + 3, metaY + 9.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text('CARRERA:', margin + colW + 3, metaY + 4.5);
    pdf.setFontSize(8);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    const carreraTruncada = pdf.splitTextToSize(`${carreraNombre} (${this.filtroCarreraCodigo})`, colW - 6)[0];
    pdf.text(carreraTruncada, margin + colW + 3, metaY + 9.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text('INSTRUMENTO OFICIAL:', margin + colW * 2 + 3, metaY + 4.5);
    pdf.setFontSize(7.5);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text(pdf.splitTextToSize(instNom, colW - 6)[0], margin + colW * 2 + 3, metaY + 9.5);

    // KPI Summary Strip (Página 1)
    const kpiY = metaY + metaH + 3;
    const kpiH = 11;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, kpiY, contentWidth, kpiH, 1.5, 1.5, 'FD');

    const kpiColW = contentWidth / 5;
    const kpis = [
      { label: 'TOTAL DOCENTES', val: `${docentes.length}`, color: dark },
      { label: 'COMPLETOS (100%)', val: `${this.totalCompletados()}`, color: green },
      { label: 'EN PROGRESO', val: `${this.totalEnProgreso()}`, color: blue },
      { label: 'PENDIENTES', val: `${this.totalSinEvaluar()}`, color: amber },
      { label: 'PROMEDIO CARRERA', val: `${promedioGeneral} Pts`, color: purple }
    ];

    kpis.forEach((kpi, idx) => {
      const x = margin + idx * kpiColW;
      if (idx > 0) {
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.line(x, kpiY + 1.5, x, kpiY + kpiH - 1.5);
      }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text(kpi.label, x + kpiColW / 2, kpiY + 4, { align: 'center' });

      pdf.setFontSize(8.5);
      pdf.setTextColor(kpi.color.r, kpi.color.g, kpi.color.b);
      pdf.text(kpi.val, x + kpiColW / 2, kpiY + 8.5, { align: 'center' });
    });

    let currentY = kpiY + kpiH + 5;
    currentY = dibujarCabeceraTabla(currentY);

    // Filas de Docentes
    docentes.forEach((d, idx) => {
      const rowH = 8.5;
      if (currentY + rowH > pageHeight - 45) {
        pdf.addPage();
        paginaActual++;
        dibujarCabecera(paginaActual);
        currentY = 30;
        currentY = dibujarCabeceraTabla(currentY);
      }

      if (idx % 2 === 1) {
        pdf.setFillColor(252, 253, 254);
        pdf.rect(margin, currentY, contentWidth, rowH, 'F');
      }

      pdf.setDrawColor(border.r, border.g, border.b);
      pdf.setLineWidth(0.15);
      pdf.line(margin, currentY + rowH, margin + contentWidth, currentY + rowH);

      // #
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text(`${idx + 1}`, margin + 3, currentY + 5);

      // Docente + CI
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(dark.r, dark.g, dark.b);
      const nombreCorto = pdf.splitTextToSize(d.docenteNombre, 68)[0];
      pdf.text(nombreCorto, margin + 12, currentY + 4.2);
      if (d.docenteCi) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.5);
        pdf.setTextColor(muted.r, muted.g, muted.b);
        pdf.text(`C.I. ${d.docenteCi}`, margin + 12, currentY + 7.2);
      }

      // Materias
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(dark.r, dark.g, dark.b);
      pdf.text(`${d.evaluadasCount} de ${d.totalMaterias} evaluadas`, margin + 84, currentY + 5);

      // % Avance
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      const colAvance = d.porcentajeEvaluacion === 100 ? green : d.porcentajeEvaluacion > 0 ? blue : amber;
      pdf.setTextColor(colAvance.r, colAvance.g, colAvance.b);
      pdf.text(`${d.porcentajeEvaluacion}%`, margin + 126, currentY + 5, { align: 'center' });

      // Calificación
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      if (d.promedioPuntaje !== null) {
        pdf.setTextColor(dark.r, dark.g, dark.b);
        pdf.text(`${d.promedioPuntaje} Pts`, margin + 152, currentY + 5, { align: 'center' });
      } else {
        pdf.setTextColor(muted.r, muted.g, muted.b);
        pdf.text('—', margin + 152, currentY + 5, { align: 'center' });
      }

      // Estado / Concepto
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      let concepto = 'Pendiente';
      let colConc = amber;
      if (d.promedioPuntaje !== null) {
        if (d.promedioPuntaje >= 80) {
          concepto = 'Sobresaliente';
          colConc = green;
        } else if (d.promedioPuntaje >= 51) {
          concepto = 'Aprobado';
          colConc = blue;
        } else {
          concepto = 'Insuficiente';
          colConc = { r: 180, g: 30, b: 30 };
        }
      }
      pdf.setTextColor(colConc.r, colConc.g, colConc.b);
      pdf.text(concepto, margin + 174, currentY + 5, { align: 'center' });

      currentY += rowH;
    });

    // =========================================================================
    // BLOQUE DE FIRMA DEL DIRECTOR DE CARRERA AL FINAL DEL REPORTE
    // =========================================================================
    if (currentY + 45 > pageHeight - 16) {
      pdf.addPage();
      paginaActual++;
      dibujarCabecera(paginaActual);
      currentY = 40;
    } else {
      currentY += 15;
    }

    const sigW = 75;
    const sig1X = margin + 12;
    const sig2X = pageWidth - margin - sigW - 12;

    // Línea de firma 1: Director de Carrera
    pdf.setDrawColor(dark.r, dark.g, dark.b);
    pdf.setLineWidth(0.4);
    pdf.line(sig1X, currentY + 18, sig1X + sigW, currentY + 18);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text('FIRMA DEL DIRECTOR DE CARRERA', sig1X + sigW / 2, currentY + 22, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    const usuarioActivo = this.auth.usuario();
    const esDirector = usuarioActivo?.rol === 'DIRECTOR_CARRERA';
    const nombreDirector = esDirector && usuarioActivo?.nombreCompleto ? usuarioActivo.nombreCompleto : 'DIRECCIÓN DE CARRERA';
    pdf.text(nombreDirector, sig1X + sigW / 2, currentY + 26, { align: 'center' });
    pdf.text(`CARRERA: ${carreraNombre}`, sig1X + sigW / 2, currentY + 30, { align: 'center' });

    // Línea de firma 2: Sello Oficial Dirección / Vicerrectorado
    pdf.line(sig2X, currentY + 18, sig2X + sigW, currentY + 18);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text('SELLO OFICIAL DE LA DIRECCIÓN', sig2X + sigW / 2, currentY + 22, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS', sig2X + sigW / 2, currentY + 26, { align: 'center' });
    pdf.text(`SEDE ACADÉMICA ${sedeNombre}`, sig2X + sigW / 2, currentY + 30, { align: 'center' });

    // Pie de página institucional
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(6);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text(
      'Este documento constituye el reporte oficial consolidado de evaluación docente emitido por el Sistema de Evaluación Académica (SEA).',
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );

    const safeName = carreraNombre.replace(/\s+/g, '_').substring(0, 30);
    pdf.save(`Reporte_Evaluacion_Docente_${safeName}_${gestion}.pdf`);
    this.mostrarToast('Reporte oficial en PDF generado y descargado exitosamente.');
  }

  public descargarFichaPdf(reg: EvaluacionDocenteRegistro): void {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter', compress: true });
    const pageWidth = 215.9;
    const pageHeight = 279.4;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const purple = { r: 49, g: 39, b: 130 };
    const dark = { r: 24, g: 30, b: 42 };
    const muted = { r: 100, g: 110, b: 125 };
    const lightBg = { r: 247, g: 249, b: 252 };
    const border = { r: 215, g: 222, b: 232 };

    // Logo institucional UNITEPC estratégico en esquina superior izquierda
    try {
      pdf.addImage(UNITEPC_LOGO_PNG, 'PNG', margin, 8.5, 36, 8.1);
    } catch (e) {
      console.warn('No se pudo incrustar el logo en el PDF', e);
    }

    const textStartX = margin + 40;

    // Cabecera Oficial
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(purple.r, purple.g, purple.b);
    pdf.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC', textStartX, 11);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text('SISTEMA DE EVALUACIÓN ACADÉMICA (SEA)', textStartX, 14.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text('FICHA OFICIAL DE EVALUACIÓN INDIVIDUAL', textStartX, 19);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(purple.r, purple.g, purple.b);
    const instTxt = reg.instrumentoTitulo ? reg.instrumentoTitulo.toUpperCase() : 'EVALUACIÓN DE LA COMPETENCIA DOCENTE';
    const titFichaCorto = pdf.splitTextToSize(`INSTRUMENTO APLICADO: ${instTxt}`, 110)[0];
    pdf.text(titFichaCorto, textStartX, 23);

    pdf.setDrawColor(purple.r, purple.g, purple.b);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 25.5, pageWidth - margin, 25.5);

    // Cuadro de Datos Generales
    const metaY = 30;
    const metaH = 34;
    pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
    pdf.setDrawColor(border.r, border.g, border.b);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(margin, metaY, contentWidth, metaH, 1.5, 1.5, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(purple.r, purple.g, purple.b);
    pdf.text('DATOS GENERALES DE LA EVALUACIÓN', margin + 3, metaY + 5);

    pdf.setFontSize(7);
    pdf.setTextColor(dark.r, dark.g, dark.b);

    const col1X = margin + 3;
    const col2X = margin + contentWidth / 2 + 3;

    pdf.text(`DOCENTE EVALUADO: ${reg.docenteNombre}`, col1X, metaY + 11);
    pdf.text(`C.I.: ${reg.docenteIdentificacion || '—'}`, col2X, metaY + 11);

    pdf.text(`ASIGNATURA: ${reg.materiaNombre} (${reg.materiaCodigo})`, col1X, metaY + 16);
    pdf.text(`GRUPO / GESTIÓN: ${reg.grupoCodigo} · ${reg.gestion}`, col2X, metaY + 16);

    pdf.text(`CARRERA: ${reg.carreraNombre}`, col1X, metaY + 21);
    pdf.text(`SEDE ACADÉMICA: ${reg.sedeNombre}`, col2X, metaY + 21);

    pdf.text(`EVALUADOR / DIRECTOR: ${reg.evaluadorNombre} (${reg.evaluadorRol})`, col1X, metaY + 26);
    pdf.text(`FECHA / HORA: ${reg.fechaEvaluacion} ${reg.horaEvaluacion || ''}`, col2X, metaY + 26);

    pdf.text(`INSTRUMENTO OFICIAL: ${reg.instrumentoTitulo}`, col1X, metaY + 31);

    // Resumen de Puntajes por Dimensión
    const scoreY = metaY + metaH + 4;
    const scoreH = 14;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, scoreY, contentWidth, scoreH, 1.5, 1.5, 'FD');

    const scoreColW = contentWidth / 4;
    const scores = [
      { label: 'COMPETENCIA ACTITUDINAL', val: `${reg.puntajeActitudinal} Pts` },
      { label: 'COMPETENCIA PROCEDIMENTAL', val: `${reg.puntajeProcedimental} Pts` },
      { label: 'COMPETENCIA COGNITIVA', val: `${reg.puntajeCognitivo} Pts` },
      { label: 'PUNTAJE FINAL CONSOLIDADO', val: `${reg.puntajeTotal} / ${reg.puntajeMaximo} Pts (${reg.porcentaje}%)` }
    ];

    scores.forEach((sc, idx) => {
      const x = margin + idx * scoreColW;
      if (idx > 0) {
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.line(x, scoreY + 2, x, scoreY + scoreH - 2);
      }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(5.5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text(sc.label, x + scoreColW / 2, scoreY + 4.5, { align: 'center' });

      pdf.setFontSize(8.5);
      pdf.setTextColor(idx === 3 ? purple.r : dark.r, idx === 3 ? purple.g : dark.g, idx === 3 ? purple.b : dark.b);
      pdf.text(sc.val, x + scoreColW / 2, scoreY + 10, { align: 'center' });
    });

    let currY = scoreY + scoreH + 5;

    // Tabla de Respuestas por Criterio
    if (reg.respuestas && reg.respuestas.length > 0) {
      pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
      pdf.setDrawColor(border.r, border.g, border.b);
      pdf.rect(margin, currY, contentWidth, 6, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(purple.r, purple.g, purple.b);
      pdf.text('#', margin + 3, currY + 4);
      pdf.text('CRITERIO / INDICADOR DE DESEMPEÑO DOCENTE', margin + 12, currY + 4);
      pdf.text('DIMENSIÓN', margin + 140, currY + 4);
      pdf.text('CALIFICACIÓN (1-5)', margin + 172, currY + 4, { align: 'center' });

      currY += 6;

      reg.respuestas.forEach((r, idx) => {
        const rowH = 6.5;
        if (currY + rowH > pageHeight - 55) {
          pdf.addPage();
          currY = 20;
        }

        if (idx % 2 === 1) {
          pdf.setFillColor(252, 253, 254);
          pdf.rect(margin, currY, contentWidth, rowH, 'F');
        }

        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.line(margin, currY + rowH, margin + contentWidth, currY + rowH);

        // Buscar enunciado oficial en el instrumento vigente
        let critEnunciado = `Indicador #${r.numero || idx + 1}`;
        let secNombre = r.seccionCodigo || 'General';
        if (this.instrumentoVigente()?.secciones) {
          for (const s of this.instrumentoVigente()!.secciones!) {
            const foundCrit = s.criterios?.find(cr => cr.id === r.criterioId);
            if (foundCrit) {
              critEnunciado = foundCrit.enunciado;
              secNombre = s.nombre;
              break;
            }
          }
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(muted.r, muted.g, muted.b);
        pdf.text(r.numero || `${idx + 1}`, margin + 3, currY + 4.2);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(dark.r, dark.g, dark.b);
        const enun = pdf.splitTextToSize(critEnunciado, 124)[0];
        pdf.text(enun, margin + 12, currY + 4.2);

        pdf.setFontSize(5.5);
        pdf.setTextColor(muted.r, muted.g, muted.b);
        pdf.text(pdf.splitTextToSize(secNombre, 28)[0], margin + 140, currY + 4.2);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(purple.r, purple.g, purple.b);
        pdf.text(`${r.puntuacion} / 5`, margin + 172, currY + 4.2, { align: 'center' });

        currY += rowH;
      });
    }

    // Observaciones si existen
    if (reg.observaciones) {
      currY += 3;
      pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
      pdf.setDrawColor(border.r, border.g, border.b);
      pdf.roundedRect(margin, currY, contentWidth, 12, 1, 1, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(dark.r, dark.g, dark.b);
      pdf.text('OBSERVACIONES / RECOMENDACIONES:', margin + 3, currY + 4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text(pdf.splitTextToSize(reg.observaciones, contentWidth - 6)[0], margin + 3, currY + 8.5);

      currY += 14;
    } else {
      currY += 4;
    }

    // Firmas al pie de la Ficha
    if (currY + 35 > pageHeight - 12) {
      pdf.addPage();
      currY = 30;
    } else {
      currY += 10;
    }

    const sigW = 75;
    const sig1X = margin + 12;
    const sig2X = pageWidth - margin - sigW - 12;

    // Firma Docente
    pdf.setDrawColor(dark.r, dark.g, dark.b);
    pdf.setLineWidth(0.4);
    pdf.line(sig1X, currY + 16, sig1X + sigW, currY + 16);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text('FIRMA DEL DOCENTE EVALUADO', sig1X + sigW / 2, currY + 20, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text(reg.docenteNombre, sig1X + sigW / 2, currY + 24, { align: 'center' });

    // Firma Director de Carrera / Evaluador
    pdf.line(sig2X, currY + 16, sig2X + sigW, currY + 16);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text('DIRECTOR DE CARRERA / RESPONSABLE', sig2X + sigW / 2, currY + 20, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text(reg.evaluadorNombre, sig2X + sigW / 2, currY + 24, { align: 'center' });
    pdf.text(`CARRERA: ${reg.carreraNombre}`, sig2X + sigW / 2, currY + 28, { align: 'center' });

    pdf.save(`Ficha_Evaluacion_${reg.docenteNombre.replace(/\s+/g, '_')}_${reg.materiaCodigo}.pdf`);
    this.mostrarToast(`Ficha de evaluación de ${reg.docenteNombre} descargada en PDF.`);
  }


  public descargarReporteDocentePdf(doc: DocenteEvaluacionRow): void {
    if (doc.evaluadasCount === 0) {
      this.mostrarToast(`El docente ${doc.docenteNombre} aún no tiene materias evaluadas.`);
      return;
    }

    const carreraNombre = this.filtroCarreraNombre();
    const sedeNombre = this.sedes().find(s => s.code === this.filtroSedeCodigo)?.name || this.filtroSedeCodigo;
    const gestion = this.storage.gestionActiva();
    const instVigente = this.instrumentoVigente();
    const instNom = instVigente?.titulo || 'Evaluación de la Competencia Docente';

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter', compress: true });
    const pageWidth = 215.9;
    const pageHeight = 279.4;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const purple = { r: 49, g: 39, b: 130 };
    const dark = { r: 24, g: 30, b: 42 };
    const muted = { r: 100, g: 110, b: 125 };
    const lightBg = { r: 247, g: 249, b: 252 };
    const border = { r: 215, g: 222, b: 232 };
    const green = { r: 16, g: 130, b: 80 };
    const blue = { r: 25, g: 90, b: 180 };
    const amber = { r: 185, g: 100, b: 15 };

    const fechaStr = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let concepto = '—';
    let colConc = muted;
    if (doc.promedioPuntaje !== null) {
      if (doc.promedioPuntaje >= 85) {
        concepto = 'Sobresaliente';
        colConc = green;
      } else if (doc.promedioPuntaje >= 70) {
        concepto = 'Bueno';
        colConc = green;
      } else if (doc.promedioPuntaje >= 51) {
        concepto = 'Aprobado';
        colConc = blue;
      } else {
        concepto = 'Insuficiente';
        colConc = { r: 180, g: 30, b: 30 };
      }
    }

    const dibujarCabecera = (pagActual: number) => {
      // Logo institucional UNITEPC estratégico en esquina superior izquierda
      try {
        pdf.addImage(UNITEPC_LOGO_PNG, 'PNG', margin, 8.5, 36, 8.1);
      } catch (e) {
        console.warn('No se pudo incrustar el logo en el PDF', e);
      }

      const textStartX = margin + 40;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(purple.r, purple.g, purple.b);
      pdf.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC', textStartX, 11);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text('SISTEMA DE EVALUACIÓN ACADÉMICA (SEA)', textStartX, 14.5);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(dark.r, dark.g, dark.b);
      pdf.text('INFORME DETALLADO DE DESEMPEÑO DOCENTE', textStartX, 19);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(purple.r, purple.g, purple.b);
      const tituloInstCorto = pdf.splitTextToSize(`INSTRUMENTO APLICADO: ${instNom.toUpperCase()}`, 110)[0];
      pdf.text(tituloInstCorto, textStartX, 23);

      // Metadatos derecha
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text(`Emisión: ${fechaStr}`, pageWidth - margin, 11, { align: 'right' });
      pdf.text(`Gestión: ${gestion}`, pageWidth - margin, 15, { align: 'right' });
      pdf.text(`Página ${pagActual}`, pageWidth - margin, 19, { align: 'right' });

      pdf.setDrawColor(purple.r, purple.g, purple.b);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 25.5, pageWidth - margin, 25.5);
    };

    let paginaActual = 1;
    dibujarCabecera(paginaActual);

    // Cuadro de Datos Generales del Docente (Página 1)
    const metaY = 30;
    const metaH = 22;
    pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
    pdf.setDrawColor(border.r, border.g, border.b);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(margin, metaY, contentWidth, metaH, 1.5, 1.5, 'FD');

    const col1X = margin + 3;
    const col2X = margin + contentWidth / 2 + 3;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text('DOCENTE EVALUADO:', col1X, metaY + 4.5);
    pdf.setFontSize(8.5);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text(doc.docenteNombre, col1X, metaY + 9);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text('CÉDULA DE IDENTIDAD:', col2X, metaY + 4.5);
    pdf.setFontSize(8);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text(doc.docenteCi || 'No registrada', col2X, metaY + 9);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text('CARRERA:', col1X, metaY + 14);
    pdf.setFontSize(7.5);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text(`${carreraNombre} (${this.filtroCarreraCodigo})`, col1X, metaY + 18.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text('SEDE / GESTIÓN:', col2X, metaY + 14);
    pdf.setFontSize(7.5);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text(`${sedeNombre} · Gestión ${gestion}`, col2X, metaY + 18.5);

    // KPI Strip de Desempeño
    const kpiY = metaY + metaH + 3;
    const kpiH = 12;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, kpiY, contentWidth, kpiH, 1.5, 1.5, 'FD');

    const kpiColW = contentWidth / 4;
    const kpis = [
      { label: 'MATERIAS ASIGNADAS', val: `${doc.totalMaterias}`, color: dark },
      { label: 'MATERIAS EVALUADAS', val: `${doc.evaluadasCount} (${doc.porcentajeEvaluacion}%)`, color: doc.porcentajeEvaluacion === 100 ? green : blue },
      { label: 'PROMEDIO FINAL', val: `${doc.promedioPuntaje ?? '—'} / 100 Pts`, color: purple },
      { label: 'CONCEPTO CUALITATIVO', val: concepto, color: colConc }
    ];

    kpis.forEach((kpi, idx) => {
      const x = margin + idx * kpiColW;
      if (idx > 0) {
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.line(x, kpiY + 1.5, x, kpiY + kpiH - 1.5);
      }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text(kpi.label, x + kpiColW / 2, kpiY + 4, { align: 'center' });

      pdf.setFontSize(8.5);
      pdf.setTextColor(kpi.color.r, kpi.color.g, kpi.color.b);
      pdf.text(kpi.val, x + kpiColW / 2, kpiY + 9, { align: 'center' });
    });

    // Tabla Detallada de Asignaturas
    let currY = kpiY + kpiH + 5;

    const dibujarCabeceraTablaMaterias = (y: number): number => {
      pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
      pdf.setDrawColor(border.r, border.g, border.b);
      pdf.setLineWidth(0.2);
      pdf.rect(margin, y, contentWidth, 7, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(purple.r, purple.g, purple.b);

      pdf.text('#', margin + 3, y + 4.5);
      pdf.text('CÓDIGO / ASIGNATURA', margin + 10, y + 4.5);
      pdf.text('GRUPO', margin + 78, y + 4.5);
      pdf.text('FECHA EVAL.', margin + 98, y + 4.5);
      pdf.text('COMP. ACT / PROC / COG', margin + 122, y + 4.5);
      pdf.text('PUNTAJE TOTAL', margin + 162, y + 4.5, { align: 'center' });
      pdf.text('ESTADO', margin + 180, y + 4.5, { align: 'center' });

      return y + 7;
    };

    currY = dibujarCabeceraTablaMaterias(currY);

    doc.materias.forEach((mat, idx) => {
      const rowH = 9.5;
      if (currY + rowH > pageHeight - 50) {
        pdf.addPage();
        paginaActual++;
        dibujarCabecera(paginaActual);
        currY = 32;
        currY = dibujarCabeceraTablaMaterias(currY);
      }

      if (idx % 2 === 1) {
        pdf.setFillColor(252, 253, 254);
        pdf.rect(margin, currY, contentWidth, rowH, 'F');
      }

      pdf.setDrawColor(border.r, border.g, border.b);
      pdf.setLineWidth(0.15);
      pdf.line(margin, currY + rowH, margin + contentWidth, currY + rowH);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text(String(idx + 1).padStart(2, '0'), margin + 3, currY + 4.5);

      pdf.setTextColor(dark.r, dark.g, dark.b);
      pdf.setFontSize(7);
      const matNom = pdf.splitTextToSize(`${mat.materiaCodigo} - ${mat.materiaNombre}`, 66)[0];
      pdf.text(matNom, margin + 10, currY + 4.5);

      const reg = mat.registroEvaluacion;
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      const txtInstMat = reg ? `Test: ${reg.instrumentoTitulo || 'Oficial UNITEPC'}` : `Test: ${instNom} (Pendiente)`;
      pdf.text(pdf.splitTextToSize(txtInstMat, 66)[0], margin + 10, currY + 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.text(mat.grupoCodigo, margin + 78, currY + 5.5);

      if (reg) {
        pdf.text(reg.fechaEvaluacion, margin + 98, currY + 5.5);
        pdf.text(`${reg.puntajeActitudinal} / ${reg.puntajeProcedimental} / ${reg.puntajeCognitivo}`, margin + 122, currY + 5.5);

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(purple.r, purple.g, purple.b);
        pdf.text(`${reg.puntajeTotal} / ${reg.puntajeMaximo} (${reg.porcentaje}%)`, margin + 162, currY + 5.5, { align: 'center' });

        pdf.setTextColor(green.r, green.g, green.b);
        pdf.text('EVALUADO', margin + 180, currY + 5.5, { align: 'center' });
      } else {
        pdf.setTextColor(muted.r, muted.g, muted.b);
        pdf.text('—', margin + 98, currY + 5.5);
        pdf.text('—', margin + 122, currY + 5.5);
        pdf.text('—', margin + 162, currY + 5.5, { align: 'center' });

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(amber.r, amber.g, amber.b);
        pdf.text('PENDIENTE', margin + 180, currY + 5.5, { align: 'center' });
      }

      currY += rowH;
    });

    // Sección: Patrón de Respuestas / Matriz Horizontal del Director por Asignatura
    const matsEvaluadas = doc.materias.filter(m => !!m.registroEvaluacion);
    if (matsEvaluadas.length > 0) {
      currY += 5;
      if (currY + 28 > pageHeight - 45) {
        pdf.addPage();
        paginaActual++;
        dibujarCabecera(paginaActual);
        currY = 32;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(purple.r, purple.g, purple.b);
      pdf.text('PATRÓN DE RESPUESTAS REGISTRADAS POR LA DIRECCIÓN (MATRIZ DE CALIFICACIÓN 1 A 5)', margin, currY);
      currY += 3.5;

      matsEvaluadas.forEach(m => {
        const reg = m.registroEvaluacion!;
        const rawRespuestas = reg.respuestas || [];
        const respuestasOrdenadas = [...rawRespuestas].sort((a, b) => {
          const numA = parseFloat((a.numero || '').replace(/[^0-9.]/g, '')) || 0;
          const numB = parseFloat((b.numero || '').replace(/[^0-9.]/g, '')) || 0;
          if (numA && numB) return numA - numB;
          return (a.numero || '').localeCompare(b.numero || '');
        });

        const matrixH = 22;
        if (currY + matrixH > pageHeight - 45) {
          pdf.addPage();
          paginaActual++;
          dibujarCabecera(paginaActual);
          currY = 32;
        }

        // Subcabecera de la Materia
        const subHeadH = 7.5;
        pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.setLineWidth(0.2);
        pdf.rect(margin, currY, contentWidth, subHeadH, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(dark.r, dark.g, dark.b);
        const matTit = pdf.splitTextToSize(`ASIGNATURA: ${m.materiaCodigo} - ${m.materiaNombre} (Grupo ${m.grupoCodigo})`, 110)[0];
        pdf.text(matTit, margin + 3, currY + 3.2);

        pdf.setTextColor(purple.r, purple.g, purple.b);
        pdf.text(`PUNTAJE: ${reg.puntajeTotal} / ${reg.puntajeMaximo} Pts (${reg.porcentaje}%)`, margin + 115, currY + 3.2);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(5.5);
        pdf.setTextColor(purple.r, purple.g, purple.b);
        const txtInstSub = pdf.splitTextToSize(`INSTRUMENTO EVALUADO: ${reg.instrumentoTitulo || instNom}`, 130)[0];
        pdf.text(txtInstSub, margin + 3, currY + 6.3);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.5);
        pdf.setTextColor(muted.r, muted.g, muted.b);
        pdf.text(`Fecha de Aplicación: ${reg.fechaEvaluacion}`, pageWidth - margin - 3, currY + 6.3, { align: 'right' });

        currY += subHeadH;

        // Construcción de la matriz horizontal
        const totalCols = Math.max(respuestasOrdenadas.length, 20);
        const colLabelW = 27.9;
        const cellW = (contentWidth - colLabelW) / totalCols;

        // Fila 1: Encabezados de Dimensión / Competencia
        const row1H = 4.2;
        pdf.setFillColor(243, 245, 249);
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.rect(margin, currY, colLabelW, row1H, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(5);
        pdf.setTextColor(muted.r, muted.g, muted.b);
        pdf.text('DIMENSIÓN', margin + 2, currY + 2.9);

        if (totalCols === 20) {
          const actW = cellW * 7;
          const procW = cellW * 7;
          const cogW = cellW * 6;

          pdf.setFillColor(238, 242, 250);
          pdf.rect(margin + colLabelW, currY, actW, row1H, 'FD');
          pdf.setTextColor(purple.r, purple.g, purple.b);
          pdf.text('ACTITUDINAL (1.1 - 1.7)', margin + colLabelW + actW / 2, currY + 2.9, { align: 'center' });

          pdf.setFillColor(243, 247, 243);
          pdf.rect(margin + colLabelW + actW, currY, procW, row1H, 'FD');
          pdf.setTextColor(16, 120, 70);
          pdf.text('PROCEDIMENTAL (2.1 - 2.7)', margin + colLabelW + actW + procW / 2, currY + 2.9, { align: 'center' });

          pdf.setFillColor(253, 247, 240);
          pdf.rect(margin + colLabelW + actW + procW, currY, cogW, row1H, 'FD');
          pdf.setTextColor(170, 90, 15);
          pdf.text('COGNITIVA (3.1 - 3.6)', margin + colLabelW + actW + procW + cogW / 2, currY + 2.9, { align: 'center' });
        } else {
          pdf.setFillColor(238, 242, 250);
          pdf.rect(margin + colLabelW, currY, contentWidth - colLabelW, row1H, 'FD');
          pdf.setTextColor(purple.r, purple.g, purple.b);
          pdf.text('ITEMS EVALUADOS DEL INSTRUMENTO', margin + colLabelW + (contentWidth - colLabelW) / 2, currY + 2.9, { align: 'center' });
        }

        currY += row1H;

        // Fila 2: Número de Ítem / Pregunta
        const row2H = 4.2;
        pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
        pdf.rect(margin, currY, colLabelW, row2H, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(5);
        pdf.setTextColor(dark.r, dark.g, dark.b);
        pdf.text('ÍTEM / PREGUNTA', margin + 2, currY + 2.9);

        for (let i = 0; i < totalCols; i++) {
          const x = margin + colLabelW + i * cellW;
          pdf.setFillColor(255, 255, 255);
          pdf.rect(x, currY, cellW, row2H, 'FD');

          const r = respuestasOrdenadas[i];
          const numTxt = r ? (r.numero || `${i + 1}`) : `${i + 1}`;
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(5);
          pdf.setTextColor(dark.r, dark.g, dark.b);
          pdf.text(numTxt, x + cellW / 2, currY + 2.9, { align: 'center' });
        }

        currY += row2H;

        // Fila 3: Valor Marcado (Puntaje 1 a 5)
        const row3H = 5.2;
        pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
        pdf.rect(margin, currY, colLabelW, row3H, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(5);
        pdf.setTextColor(purple.r, purple.g, purple.b);
        pdf.text('VALOR ASIGNADO (1-5)', margin + 2, currY + 3.6);

        for (let i = 0; i < totalCols; i++) {
          const x = margin + colLabelW + i * cellW;
          const r = respuestasOrdenadas[i];
          const score = r ? r.puntuacion : null;

          if (score === 5) {
            pdf.setFillColor(220, 252, 231);
            pdf.setTextColor(16, 130, 80);
          } else if (score === 4) {
            pdf.setFillColor(209, 250, 229);
            pdf.setTextColor(5, 120, 80);
          } else if (score === 3) {
            pdf.setFillColor(239, 246, 255);
            pdf.setTextColor(25, 90, 180);
          } else if (score !== null && score > 0) {
            pdf.setFillColor(254, 226, 226);
            pdf.setTextColor(180, 30, 30);
          } else {
            pdf.setFillColor(250, 250, 250);
            pdf.setTextColor(muted.r, muted.g, muted.b);
          }

          pdf.rect(x, currY, cellW, row3H, 'FD');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7.5);
          pdf.text(score !== null ? `${score}` : '—', x + cellW / 2, currY + 3.8, { align: 'center' });
        }

        currY += row3H + 3.5;
      });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5.5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text('Escala de Calificación del Director: 1 = Muy Deficiente  |  2 = Regular  |  3 = Aceptable  |  4 = Bueno  |  5 = Excelente', margin, currY);
      currY += 2;
    }

    // Sección de Observaciones y Retroalimentaciones por Asignatura (si existen)
    const materiasConObs = doc.materias.filter(m => m.registroEvaluacion?.observaciones?.trim());
    if (materiasConObs.length > 0) {
      currY += 4;
      if (currY + 25 > pageHeight - 45) {
        pdf.addPage();
        paginaActual++;
        dibujarCabecera(paginaActual);
        currY = 32;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(purple.r, purple.g, purple.b);
      pdf.text('OBSERVACIONES Y RETROALIMENTACIÓN DE LA DIRECCIÓN DE CARRERA', margin, currY);
      currY += 3;

      materiasConObs.forEach(m => {
        const obs = m.registroEvaluacion!.observaciones!.trim();
        const obsLines = pdf.splitTextToSize(`• [${m.materiaCodigo} - ${m.materiaNombre} · Gr. ${m.grupoCodigo}]: ${obs}`, contentWidth - 4);
        const boxH = Math.max(7, obsLines.length * 3.5 + 4);

        if (currY + boxH > pageHeight - 45) {
          pdf.addPage();
          paginaActual++;
          dibujarCabecera(paginaActual);
          currY = 32;
        }

        pdf.setFillColor(lightBg.r, lightBg.g, lightBg.b);
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.rect(margin, currY, contentWidth, boxH, 'FD');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(dark.r, dark.g, dark.b);
        pdf.text(obsLines, margin + 2, currY + 4);

        currY += boxH + 2;
      });
    }

    // Firmas Oficiales al pie del documento
    if (currY + 40 > pageHeight - 16) {
      pdf.addPage();
      paginaActual++;
      dibujarCabecera(paginaActual);
      currY = 38;
    } else {
      currY += 12;
    }

    const sigW = 75;
    const sig1X = margin + 12;
    const sig2X = pageWidth - margin - sigW - 12;

    // Firma 1: Director(a) de Carrera / Evaluador
    pdf.setDrawColor(dark.r, dark.g, dark.b);
    pdf.setLineWidth(0.4);
    pdf.line(sig1X, currY + 18, sig1X + sigW, currY + 18);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text('DIRECCIÓN DE CARRERA / EVALUADOR', sig1X + sigW / 2, currY + 22, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    const usuarioActivo = this.auth.usuario();
    const esDirector = usuarioActivo?.rol === 'DIRECTOR_CARRERA';
    const nombreDirector = esDirector && usuarioActivo?.nombreCompleto ? usuarioActivo.nombreCompleto : 'DIRECCIÓN ACADÉMICA';
    pdf.text(nombreDirector, sig1X + sigW / 2, currY + 26, { align: 'center' });
    pdf.text(`Carrera: ${carreraNombre}`, sig1X + sigW / 2, currY + 30, { align: 'center' });

    // Firma 2: Docente Evaluado
    pdf.line(sig2X, currY + 18, sig2X + sigW, currY + 18);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(dark.r, dark.g, dark.b);
    pdf.text('DOCENTE EVALUADO', sig2X + sigW / 2, currY + 22, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text(doc.docenteNombre, sig2X + sigW / 2, currY + 26, { align: 'center' });
    pdf.text(`C.I.: ${doc.docenteCi || '—'} (Firma y Conformidad)`, sig2X + sigW / 2, currY + 30, { align: 'center' });

    // Pie de página
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(6);
    pdf.setTextColor(muted.r, muted.g, muted.b);
    pdf.text(
      'Este documento constituye el informe individual de evaluación de la competencia docente emitido por el Sistema de Evaluación Académica (SEA) de UNITEPC.',
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );

    const safeDoc = doc.docenteNombre.replace(/\s+/g, '_').substring(0, 30);
    pdf.save(`Reporte_Docente_${safeDoc}_${gestion}.pdf`);
    this.mostrarToast(`Reporte detallado en PDF del docente ${doc.docenteNombre} generado y descargado.`);
  }

  public abrirFichaEvaluacion(reg: EvaluacionDocenteRegistro): void {
    this.fichaVisualizada.set(reg);
  }

  public imprimirFicha(): void {
    window.print();
  }

  public crearNuevoInstrumento(): void {
    this.limpiarFormularioInstrumento();
    this.modalCrearInstrumento.set(true);
  }

  public cerrarModalCrearInstrumento(): void {
    this.modalCrearInstrumento.set(false);
    this.mostrarPanelImportar.set(false);
  }

  public limpiarFormularioInstrumento(): void {
    const anio = new Date().getFullYear();
    const versionSiguiente = (this.instrumentos().length || 1) + 1;
    this.formInstId = null;
    this.modoEdicionInstrumento.set(false);
    this.formInstCodigo = `EVAL-DIR-${anio}-V${versionSiguiente}`;
    this.formInstTitulo = '';
    this.formInstDescripcion = 'Instrumento institucional de evaluación docente aplicado por Directores de Carrera y Administradores.';
    this.formInstEscalaMin = 1;
    this.formInstEscalaMax = 5;
    this.formInstPonerEnVigencia = false;
    this.formInstSecciones = [
      {
        codigo: 'SEC-1',
        nombre: 'Competencia Actitudinal',
        criterios: [
          { numero: '1', enunciado: '' }
        ]
      }
    ];
    this.textoImportarPreguntas = '';
    this.mostrarPanelImportar.set(false);
  }

  public clonarDesdeVigente(): void {
    const vigente = this.instrumentoVigente();
    if (!vigente) {
      this.mostrarToast('No hay un instrumento vigente disponible para clonar.');
      return;
    }

    this.evaluacionService.obtenerInstrumentoPorId(vigente.id).subscribe({
      next: full => {
        this.formInstId = null;
        this.modoEdicionInstrumento.set(false);
        this.formInstTitulo = `${full.titulo} (Nueva Versión)`;
        this.formInstCodigo = `${full.codigo}-V${(this.instrumentos().length || 1) + 1}`;
        this.formInstDescripcion = full.descripcion || '';
        this.formInstEscalaMin = full.escalaMin || 1;
        this.formInstEscalaMax = full.escalaMax || 5;
        this.formInstPonerEnVigencia = false;

        if (full.secciones && full.secciones.length > 0) {
          this.formInstSecciones = full.secciones.map((sec, sIdx) => ({
            codigo: sec.codigo || `SEC-${sIdx + 1}`,
            nombre: sec.nombre,
            descripcion: sec.descripcion,
            criterios: (sec.criterios || []).map((c, cIdx) => ({
              numero: c.numero || `${cIdx + 1}`,
              enunciado: c.enunciado
            }))
          }));
        }
        const total = this.totalCriteriosFormulario();
        this.mostrarToast(`Clonado desde ${full.codigo}: ${this.formInstSecciones.length} dimensiones y ${total} criterios precargados.`);
      },
      error: () => this.mostrarToast('Error al cargar criterios del test vigente.')
    });
  }

  public duplicarInstrumento(inst: EvaluacionInstrumento): void {
    this.evaluacionService.obtenerInstrumentoPorId(inst.id).subscribe({
      next: full => {
        this.formInstId = null;
        this.modoEdicionInstrumento.set(false);
        this.formInstTitulo = `${full.titulo} (Copia)`;
        this.formInstCodigo = `${full.codigo}-V${(this.instrumentos().length || 1) + 1}`;
        this.formInstDescripcion = full.descripcion || '';
        this.formInstEscalaMin = full.escalaMin || 1;
        this.formInstEscalaMax = full.escalaMax || 5;
        this.formInstPonerEnVigencia = false;

        if (full.secciones && full.secciones.length > 0) {
          this.formInstSecciones = full.secciones.map((sec, sIdx) => ({
            codigo: sec.codigo || `SEC-${sIdx + 1}`,
            nombre: sec.nombre,
            descripcion: sec.descripcion,
            criterios: (sec.criterios || []).map((c, cIdx) => ({
              numero: c.numero || `${cIdx + 1}`,
              enunciado: c.enunciado
            }))
          }));
        }
        this.modalCrearInstrumento.set(true);
        this.mostrarToast(`Instrumento duplicado en el formulario. Modifícalo y guárdalo.`);
      },
      error: () => this.mostrarToast('Error al obtener datos del instrumento para duplicar.')
    });
  }

  public agregarSeccion(): void {
    const secNum = this.formInstSecciones.length + 1;
    const nuevoCriterioNum = (this.totalCriteriosFormulario() + 1).toString();
    this.formInstSecciones.push({
      codigo: `SEC-${secNum}`,
      nombre: `Nueva Dimensión ${secNum}`,
      criterios: [
        { numero: nuevoCriterioNum, enunciado: '' }
      ]
    });
  }

  public eliminarSeccion(index: number): void {
    if (this.formInstSecciones.length <= 1) {
      this.mostrarToast('Debe existir al menos una dimensión o sección.');
      return;
    }
    this.formInstSecciones.splice(index, 1);
    this.renumerarCriterios();
  }

  public agregarCriterio(secIndex: number): void {
    const sec = this.formInstSecciones[secIndex];
    if (!sec) return;
    const nuevoNum = (this.totalCriteriosFormulario() + 1).toString();
    sec.criterios.push({
      numero: nuevoNum,
      enunciado: ''
    });
  }

  public eliminarCriterio(secIndex: number, critIndex: number): void {
    const sec = this.formInstSecciones[secIndex];
    if (!sec) return;
    if (sec.criterios.length <= 1 && this.formInstSecciones.length <= 1) {
      this.mostrarToast('Debe existir al menos un criterio o pregunta en el test.');
      return;
    }
    sec.criterios.splice(critIndex, 1);
    this.renumerarCriterios();
  }

  public renumerarCriterios(): void {
    let globalOrden = 1;
    for (const sec of this.formInstSecciones) {
      for (const crit of sec.criterios) {
        crit.numero = (globalOrden++).toString();
      }
    }
  }

  public parsearTextoImportado(): void {
    const texto = this.textoImportarPreguntas.trim();
    if (!texto) {
      this.mostrarToast('Por favor escribe o pega el texto con las preguntas antes de procesar.');
      return;
    }

    const lineas = texto.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const secciones: FormSeccionItem[] = [];
    let seccionActual: FormSeccionItem | null = null;
    let contadorCriterios = 0;

    for (const linea of lineas) {
      const matchCorchetes = linea.match(/^\[(.*?)\]$/);
      const matchDimension = linea.match(/^(?:DIMENSI[OÓ]N|COMPETENCIA|SECCI[OÓ]N|ÁREA|DIMENSION)\s*(?:\d+)?\s*[:\-–—]?\s*(.*)$/i);

      if (matchCorchetes || matchDimension) {
        const nombreSec = matchCorchetes ? matchCorchetes[1].trim() : (matchDimension![1].trim() || linea);
        seccionActual = {
          codigo: `SEC-${secciones.length + 1}`,
          nombre: nombreSec,
          criterios: []
        };
        secciones.push(seccionActual);
        continue;
      }

      const matchNumero = linea.match(/^(\d+)[\.\)\-\s]\s*(.*)$/);
      const matchVineta = linea.match(/^[\*\-•]\s*(.*)$/);

      let numero = '';
      let enunciado = '';

      if (matchNumero) {
        numero = matchNumero[1];
        enunciado = matchNumero[2].trim();
      } else if (matchVineta) {
        contadorCriterios++;
        numero = contadorCriterios.toString();
        enunciado = matchVineta[1].trim();
      } else {
        if (seccionActual && linea.length > 5) {
          contadorCriterios++;
          numero = contadorCriterios.toString();
          enunciado = linea;
        } else {
          seccionActual = {
            codigo: `SEC-${secciones.length + 1}`,
            nombre: linea,
            criterios: []
          };
          secciones.push(seccionActual);
          continue;
        }
      }

      if (enunciado) {
        if (!seccionActual) {
          seccionActual = {
            codigo: 'SEC-1',
            nombre: 'Competencia General',
            criterios: []
          };
          secciones.push(seccionActual);
        }
        contadorCriterios++;
        if (!numero) numero = contadorCriterios.toString();
        seccionActual.criterios.push({ numero, enunciado });
      }
    }

    if (secciones.length === 0 || secciones.every(s => s.criterios.length === 0)) {
      this.mostrarToast('No se pudieron extraer criterios válidos. Revisa el formato del texto.');
      return;
    }

    this.formInstSecciones = secciones;
    this.renumerarCriterios();
    this.mostrarPanelImportar.set(false);
    const totalCrit = this.totalCriteriosFormulario();
    this.mostrarToast(`Se procesaron exitosamente ${secciones.length} dimensiones y ${totalCrit} criterios.`);
  }

  public onArchivoImportarSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        this.textoImportarPreguntas = content;
        this.parsearTextoImportado();
      }
    };
    reader.readAsText(file);
  }

  public guardarNuevoInstrumento(): void {
    if (!this.formInstTitulo.trim()) {
      this.mostrarToast('El título del instrumento es obligatorio.');
      return;
    }
    if (!this.formInstCodigo.trim()) {
      this.mostrarToast('El código identificador es obligatorio.');
      return;
    }
    if (this.formInstSecciones.length === 0) {
      this.mostrarToast('Debes incluir al menos una dimensión o sección.');
      return;
    }

    for (const sec of this.formInstSecciones) {
      if (!sec.nombre.trim()) {
        this.mostrarToast('Todas las dimensiones deben tener un nombre.');
        return;
      }
      if (!sec.criterios || sec.criterios.length === 0) {
        this.mostrarToast(`La dimensión '${sec.nombre}' no tiene ningún criterio.`);
        return;
      }
      for (const crit of sec.criterios) {
        if (!crit.enunciado.trim()) {
          this.mostrarToast(`Existe un criterio sin enunciado en '${sec.nombre}'.`);
          return;
        }
      }
    }

    const payload: any = {
      id: this.formInstId,
      codigo: this.formInstCodigo.trim().toUpperCase(),
      titulo: this.formInstTitulo.trim(),
      descripcion: this.formInstDescripcion.trim(),
      estado: this.formInstPonerEnVigencia ? 'VIGENTE' : 'BORRADOR',
      escalaMin: Number(this.formInstEscalaMin) || 1,
      escalaMax: Number(this.formInstEscalaMax) || 5,
      secciones: this.formInstSecciones.map((sec, sIdx) => ({
        id: sec.id,
        codigo: (sec.codigo || `SEC-${sIdx + 1}`).trim().toUpperCase(),
        nombre: sec.nombre.trim(),
        descripcion: sec.descripcion,
        orden: sIdx + 1,
        criterios: sec.criterios.map((c, cIdx) => ({
          id: c.id,
          numero: c.numero || `${cIdx + 1}`,
          enunciado: c.enunciado.trim(),
          orden: cIdx + 1
        }))
      }))
    };

    this.guardandoInstrumento.set(true);
    this.evaluacionService.guardarInstrumento(payload).subscribe({
      next: guardado => {
        this.guardandoInstrumento.set(false);
        this.cerrarModalCrearInstrumento();
        this.mostrarToast(`Instrumento '${guardado.titulo}' (${guardado.codigo}) guardado con éxito con ${guardado.totalCriterios} indicadores.`);
        this.cargarTodosInstrumentos();
        if (this.formInstPonerEnVigencia) {
          this.cargarInstrumentoVigente();
        }
      },
      error: err => {
        this.guardandoInstrumento.set(false);
        const msg = err.error?.message || err.message || 'Error al guardar el instrumento';
        this.mostrarToast(msg);
        console.error(err);
      }
    });
  }

  public obtenerIniciales(nombre: string): string {
    if (!nombre) return 'D';
    return nombre.split(' ')
      .filter(p => p.length > 0)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  }

  private mostrarToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  /** Convierte el formato visual II-2026 al formato de gestión que usa SEA: 2-2026. */
  private gestionParaSea(): string {
    const gestion = this.storage.gestionActiva();
    const coincidencia = gestion.match(/^(I|II)-(\d{4})$/);
    if (!coincidencia) return gestion;
    return `${coincidencia[1] === 'II' ? '2' : '1'}-${coincidencia[2]}`;
  }
}
