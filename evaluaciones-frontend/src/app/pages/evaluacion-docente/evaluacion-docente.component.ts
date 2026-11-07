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
  EvaluacionDocenteRegistro,
  EvaluacionDocenteAplicarRequest,
  EvaluacionDocenteRespuesta
} from '../../core/models/evaluacion-docente.models';
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

        <!-- Selector de Pestañas (Admin / Director) -->
        <div class="flex items-center gap-2">
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
                        <button 
                          type="button" 
                          (click)="alternarExpansionDocente(doc.docenteNombre)"
                          class="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer">
                          <span>{{ docenteExpandido(doc.docenteNombre) ? 'Ocultar Materias' : 'Gestionar / Evaluar' }}</span>
                          <i [class]="docenteExpandido(doc.docenteNombre) ? 'pi pi-chevron-up text-[10px]' : 'pi pi-chevron-down text-[10px]'"></i>
                        </button>
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
                                        <div class="text-[10px] text-muted-foreground">
                                          Evaluado el {{ reg.fechaEvaluacion }}
                                        </div>
                                      </div>
                                      <button 
                                        type="button" 
                                        (click)="abrirFichaEvaluacion(reg)"
                                        class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold inline-flex items-center gap-1 shadow-2xs">
                                        <i class="pi pi-file text-primary"></i>
                                        <span>Ver Ficha</span>
                                      </button>
                                      <button 
                                        type="button" 
                                        (click)="iniciarEvaluacionMateria(doc, mat)"
                                        title="Re-evaluar"
                                        class="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs">
                                        <i class="pi pi-refresh"></i>
                                      </button>
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
                  (click)="imprimirFicha()" 
                  class="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-primary/90">
                  <i class="pi pi-print"></i> Imprimir Ficha
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
                <h2 class="text-lg font-black tracking-wide uppercase">EVALUACIÓN DE LA COMPETENCIA DOCENTE</h2>
                <p class="text-xs text-gray-600 font-bold mt-1">UNIVERSIDAD TÉCNICA PRIVADA COSMOPOLITA - UNITEPC</p>
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

  public abrirFichaEvaluacion(reg: EvaluacionDocenteRegistro): void {
    this.fichaVisualizada.set(reg);
  }

  public imprimirFicha(): void {
    window.print();
  }

  public crearNuevoInstrumento(): void {
    this.mostrarToast('Función disponible en la siguiente versión de plantillas dinámicas.');
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
