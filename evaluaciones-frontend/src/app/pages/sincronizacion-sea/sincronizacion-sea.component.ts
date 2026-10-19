import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { SincronizacionSeaService } from '../../core/services/sincronizacion-sea.service';
import {
  GrupoSincronizacionResumen,
  SincronizacionMasivaReporte,
  SincronizacionNotasSeaReporte,
  DiscrepanciaGrupoItem,
  DiscrepanciaGrupoReporte,
  TrasladoCalificacionesResultado
} from '../../core/models/sincronizacion-sea.models';
import { BranchOffice, Career } from '../../core/models/unitepc-gateway.models';

@Component({
  selector: 'sea-sincronizacion-sea',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- CABECERA PRINCIPAL -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <i class="pi pi-cloud-upload text-lg"></i>
            </div>
            <div>
              <h1 class="text-xl font-black text-foreground tracking-tight">Sincronización de Calificaciones al SEA</h1>
              <p class="text-xs text-muted-foreground">
                Consola institucional para la transmisión oficial de notas teóricas y prácticas hacia el Gateway SEA sobre 100 puntos.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="recargarGrupos()"
            [disabled]="cargandoGrupos() || !filtroSedeCodigo() || !filtroCarreraCodigo()"
            class="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors">
            <i class="pi pi-refresh text-xs" [class.pi-spin]="cargandoGrupos()"></i>
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            (click)="abrirModalDeteccionDiscrepancias()"
            [disabled]="cargandoGrupos() || detectandoDiscrepancias() || gruposFiltrados().length === 0"
            class="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            title="Identificar estudiantes con notas en grupos distintos a su nómina oficial en SEA">
            @if (detectandoDiscrepancias()) {
              <i class="pi pi-spin pi-spinner text-xs"></i>
              <span>Auditando SEA...</span>
            } @else {
              <i class="pi pi-search-plus text-xs"></i>
              @if (seleccionadosCount() > 0) {
                <span>Auditar seleccionados ({{ seleccionadosCount() }})</span>
              } @else {
                <span>Auditar Cambios SEA</span>
              }
            }
          </button>

          <button
            type="button"
            (click)="abrirModalConfirmacionMasiva()"
            [disabled]="seleccionadosCount() === 0 || procesandoMasivo()"
            class="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            @if (procesandoMasivo()) {
              <i class="pi pi-spin pi-spinner text-xs"></i>
              <span>Transmitiendo al SEA...</span>
            } @else {
              <i class="pi pi-send text-xs"></i>
              <span>Sincronizar seleccionados ({{ seleccionadosCount() }})</span>
            }
          </button>
        </div>
      </div>

      <!-- FILTROS Y CONTROLES SUPERIORES -->
      <div class="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- SELECTOR DE SEDE -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <i class="pi pi-building text-xs text-primary"></i> Sede Institucional
            </label>
            <div class="relative">
              <select
                [ngModel]="filtroSedeCodigo()"
                (ngModelChange)="alCambiarSede($event)"
                [disabled]="cargandoSedes()"
                class="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                @for (sede of sedes(); track sede.code) {
                  <option [value]="sede.code">{{ sede.name }} ({{ sede.code }})</option>
                }
              </select>
              <i class="pi pi-chevron-down absolute right-3 top-3.5 text-xs text-muted-foreground pointer-events-none"></i>
            </div>
          </div>

          <!-- SELECTOR DE CARRERA -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <i class="pi pi-book text-xs text-primary"></i> Carrera
            </label>
            <div class="relative">
              <select
                [ngModel]="filtroCarreraCodigo()"
                (ngModelChange)="alCambiarCarrera($event)"
                [disabled]="cargandoCarreras() || carreras().length === 0"
                class="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                @for (carrera of carreras(); track carrera.careerCode) {
                  <option [value]="carrera.careerCode">{{ carrera.careerName }}</option>
                }
              </select>
              <i class="pi pi-chevron-down absolute right-3 top-3.5 text-xs text-muted-foreground pointer-events-none"></i>
            </div>
          </div>

          <!-- SELECTOR DE EXAMEN / PARCIAL -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <i class="pi pi-calendar text-xs text-primary"></i> Examen / Parcial
            </label>
            <div class="relative">
              <select
                [ngModel]="filtroTipoParcial()"
                (ngModelChange)="alCambiarTipoParcial($event)"
                class="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                <option value="PRIMER_PARCIAL">1er Parcial</option>
                <option value="SEGUNDO_PARCIAL">2do Parcial</option>
                <option value="FINAL">Examen Final</option>
                <option value="SEGUNDA_INSTANCIA">2da Instancia</option>
                <option value="TODOS">Todos los exámenes</option>
              </select>
              <i class="pi pi-chevron-down absolute right-3 top-3.5 text-xs text-muted-foreground pointer-events-none"></i>
            </div>
          </div>

          <!-- FILTRO TIPO DE GRUPO: TEÓRICOS / PRÁCTICOS / TODOS -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <i class="pi pi-filter text-xs text-primary"></i> Tipo de Grupo
            </label>
            <div class="grid grid-cols-3 p-1 bg-muted/60 rounded-xl border border-border text-center text-xs font-bold">
              <button
                type="button"
                (click)="cambiarTipoClase('TEORICO')"
                [class.bg-card]="filtroTipoClase() === 'TEORICO'"
                [class.text-primary]="filtroTipoClase() === 'TEORICO'"
                [class.shadow-2xs]="filtroTipoClase() === 'TEORICO'"
                class="py-1.5 rounded-lg transition-all text-muted-foreground hover:text-foreground cursor-pointer">
                Teóricos
              </button>
              <button
                type="button"
                (click)="cambiarTipoClase('PRACTICO')"
                [class.bg-card]="filtroTipoClase() === 'PRACTICO'"
                [class.text-primary]="filtroTipoClase() === 'PRACTICO'"
                [class.shadow-2xs]="filtroTipoClase() === 'PRACTICO'"
                class="py-1.5 rounded-lg transition-all text-muted-foreground hover:text-foreground cursor-pointer">
                Prácticos
              </button>
              <button
                type="button"
                (click)="cambiarTipoClase('TODOS')"
                [class.bg-card]="filtroTipoClase() === 'TODOS'"
                [class.text-primary]="filtroTipoClase() === 'TODOS'"
                [class.shadow-2xs]="filtroTipoClase() === 'TODOS'"
                class="py-1.5 rounded-lg transition-all text-muted-foreground hover:text-foreground cursor-pointer">
                Todos
              </button>
            </div>
          </div>

          <!-- FILTRO ESTADO DE SINCRONIZACIÓN -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <i class="pi pi-check-circle text-xs text-primary"></i> Estado SEA
            </label>
            <div class="relative">
              <select
                [ngModel]="filtroEstadoSync()"
                (ngModelChange)="alCambiarEstadoSync($event)"
                class="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendientes de sincronización</option>
                <option value="SINCRONIZADO">Ya sincronizados</option>
                <option value="NO_CALIFICADO">No calificados / En curso</option>
              </select>
              <i class="pi pi-chevron-down absolute right-3 top-3.5 text-xs text-muted-foreground pointer-events-none"></i>
            </div>
          </div>
        </div>

        <!-- BUSCADOR INTERNO -->
        <div class="pt-2 border-t border-border flex items-center gap-3">
          <div class="relative flex-1">
            <i class="pi pi-search absolute left-3 top-3 text-xs text-muted-foreground"></i>
            <input
              type="text"
              [ngModel]="filtroBusqueda()"
              (ngModelChange)="filtroBusqueda.set($event)"
              placeholder="Buscar por asignatura, docente, grupo o semestre..."
              class="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20" />
          </div>
          @if (filtroBusqueda()) {
            <button
              type="button"
              (click)="filtroBusqueda.set('')"
              class="h-9 px-3 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer">
              Limpiar
            </button>
          }
        </div>
      </div>

      <!-- TARJETAS DE MÉTRICAS / KPIS -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <!-- TOTAL GRUPOS -->
        <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Grupos</span>
          <div class="text-2xl font-black text-foreground mt-1">{{ metricas().total }}</div>
          <p class="text-[11px] text-muted-foreground mt-0.5">En el alcance actual</p>
        </div>

        <!-- LISTOS / PENDIENTES -->
        <div class="bg-card border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-4 shadow-2xs bg-amber-500/5">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">Listos p/ Sincronizar</span>
          <div class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{{ metricas().pendientes }}</div>
          <p class="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">Calificados sin enviar</p>
        </div>

        <!-- YA SINCRONIZADOS -->
        <div class="bg-card border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl p-4 shadow-2xs bg-emerald-500/5">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Sincronizados</span>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{{ metricas().sincronizados }}</div>
          <p class="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">Transmitidos al SEA</p>
        </div>

        <!-- NO CALIFICADOS / EN CURSO -->
        <div class="bg-card border border-border rounded-2xl p-4 shadow-2xs">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">En Curso / Sin Calificar</span>
          <div class="text-2xl font-black text-muted-foreground mt-1">{{ metricas().noCalificados }}</div>
          <p class="text-[11px] text-muted-foreground mt-0.5">No elegibles para envío</p>
        </div>
      </div>

      <!-- TABLA PRINCIPAL DE GRUPOS -->
      <div class="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
        @if (cargandoGrupos()) {
          <div class="p-12 text-center space-y-3">
            <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
            <p class="text-xs font-bold text-muted-foreground">Consultando evaluaciones de la carrera en el sistema...</p>
          </div>
        } @else if (gruposFiltrados().length === 0) {
          <div class="p-12 text-center space-y-3">
            <div class="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <i class="pi pi-inbox text-xl"></i>
            </div>
            <p class="text-sm font-bold text-foreground">No se encontraron grupos para este filtro</p>
            <p class="text-xs text-muted-foreground max-w-sm mx-auto">
              Asegúrate de que existan exámenes programados o calificados para la sede y carrera seleccionadas.
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  <!-- CHECKBOX MAESTRO -->
                  <th class="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      [checked]="todosSeleccionados()"
                      [indeterminate]="algunosSeleccionados()"
                      (change)="toggleSeleccionarTodos()"
                      [disabled]="elegiblesVisibles().length === 0"
                      class="h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer disabled:opacity-40" />
                  </th>
                  <th class="py-3 px-4">Asignatura / Semestre</th>
                  <th class="py-3 px-3">Grupo & Tipo</th>
                  <th class="py-3 px-3">Modalidad / Parcial</th>
                  <th class="py-3 px-4">Docente</th>
                  <th class="py-3 px-3 text-center">Estudiantes</th>
                  <th class="py-3 px-3">Estado Evaluación</th>
                  <th class="py-3 px-3">Estado Sincronización SEA</th>
                  <th class="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (item of gruposFiltrados(); track item.rolExamenId) {
                  <tr
                    class="hover:bg-muted/30 transition-colors"
                    [ngClass]="{ 'bg-primary/5': estaSeleccionado(item.rolExamenId) }">
                    <!-- CHECKBOX INDIVIDUAL -->
                    <td class="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        [checked]="estaSeleccionado(item.rolExamenId)"
                        (change)="toggleSeleccion(item.rolExamenId)"
                        [disabled]="!item.esSincronizable"
                        [title]="item.esSincronizable ? 'Seleccionar grupo para sincronización masiva' : (item.motivoNoSincronizable || 'No elegible')"
                        class="h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" />
                    </td>

                    <!-- ASIGNATURA -->
                    <td class="py-3 px-4">
                      <div class="font-bold text-foreground">{{ item.materiaNombre }}</div>
                      <div class="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span class="font-mono">{{ item.materiaCodigo }}</span>
                        @if (item.semestre) {
                          <span>· Semestre {{ item.semestre }}</span>
                        }
                      </div>
                    </td>

                    <!-- GRUPO Y TIPO -->
                    <td class="py-3 px-3">
                      <div class="flex items-center gap-1.5">
                        <span class="font-black text-foreground">{{ item.grupo }}</span>
                        @if (item.esTeorico) {
                          <span class="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">
                            TEÓRICO ({{ item.tipoClase }})
                          </span>
                        } @else {
                          <span class="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]">
                            PRÁCTICO ({{ item.tipoClase }})
                          </span>
                        }
                      </div>
                    </td>

                    <!-- MODALIDAD Y PARCIAL -->
                    <td class="py-3 px-3">
                      <div class="font-semibold text-foreground">
                        {{ formatearParcial(item.tipoParcial) }}
                      </div>
                      <div class="text-[10px] text-muted-foreground">
                        {{ formatearModalidad(item.modalidad) }}
                      </div>
                    </td>

                    <!-- DOCENTE -->
                    <td class="py-3 px-4">
                      <div class="font-medium text-foreground truncate max-w-[180px]" [title]="item.docenteNombre || 'Sin docente asignado'">
                        {{ item.docenteNombre || 'Docente no asignado' }}
                      </div>
                      @if (item.aula) {
                        <div class="text-[10px] text-muted-foreground">Aula: {{ item.aula }}</div>
                      }
                    </td>

                    <!-- ESTUDIANTES / CALIFICADOS -->
                    <td class="py-3 px-3 text-center">
                      <div class="inline-flex flex-col items-center">
                        <span class="font-bold text-foreground">
                          {{ item.totalCalificados }} / {{ item.totalEstudiantes }}
                        </span>
                        <div class="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            class="h-full rounded-full transition-all"
                            [ngClass]="obtenerColorBarra(item.totalCalificados, item.totalEstudiantes)"
                            [style.width.%]="calcularPorcentaje(item.totalCalificados, item.totalEstudiantes)">
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- ESTADO EVALUACIÓN -->
                    <td class="py-3 px-3">
                      <span
                        class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1"
                        [class.bg-emerald-100]="item.estadoFlujo === 'CALIFICADO' || item.estadoFlujo === 'CONFIRMADO'"
                        [class.text-emerald-800]="item.estadoFlujo === 'CALIFICADO' || item.estadoFlujo === 'CONFIRMADO'"
                        [class.bg-amber-100]="item.estadoFlujo === 'PENDIENTE_NOTAS'"
                        [class.text-amber-800]="item.estadoFlujo === 'PENDIENTE_NOTAS'"
                        [class.bg-slate-100]="item.estadoFlujo !== 'CALIFICADO' && item.estadoFlujo !== 'CONFIRMADO' && item.estadoFlujo !== 'PENDIENTE_NOTAS'"
                        [class.text-slate-600]="item.estadoFlujo !== 'CALIFICADO' && item.estadoFlujo !== 'CONFIRMADO' && item.estadoFlujo !== 'PENDIENTE_NOTAS'">
                        <i class="pi pi-circle-fill text-[6px]"></i>
                        {{ item.estadoFlujo }}
                      </span>
                    </td>

                    <!-- ESTADO SINCRONIZACIÓN SEA -->
                    <td class="py-3 px-3">
                      @if (item.sincronizadoSea) {
                        <div class="space-y-0.5">
                          <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-[10px] inline-flex items-center gap-1">
                            <i class="pi pi-check text-[9px]"></i> Sincronizado
                          </span>
                          @if (item.fechaSincronizacionSea) {
                            <div class="text-[10px] text-muted-foreground leading-tight">
                              {{ formatearFechaHora(item.fechaSincronizacionSea) }}
                            </div>
                          }
                          @if (item.sincronizadoPor) {
                            <div class="text-[9px] text-muted-foreground/80 leading-tight">
                              Por: {{ item.sincronizadoPor }}
                            </div>
                          }
                        </div>
                      } @else if (item.esSincronizable) {
                        <span class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black text-[10px] inline-flex items-center gap-1">
                          <i class="pi pi-clock text-[9px]"></i> Pendiente de sincronizar
                        </span>
                      } @else {
                        <span
                          class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-[10px] inline-flex items-center gap-1"
                          [title]="item.motivoNoSincronizable || 'No calificado'">
                          <i class="pi pi-minus-circle text-[9px]"></i> No calificado
                        </span>
                      }
                    </td>

                    <!-- ACCIONES -->
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="auditarDiscrepanciasGrupo(item)"
                          [disabled]="detectandoDiscrepancias()"
                          class="h-7 w-7 rounded-lg border border-border text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                          title="Auditar si algún estudiante rindió en este grupo pero pertenece a otro en SEA">
                          <i class="pi pi-user-edit text-[11px]"></i>
                        </button>

                        <button
                          type="button"
                          (click)="abrirModalPrevia(item)"
                          class="h-7 px-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ver nómina de calificaciones sobre 100 puntos consolidadas">
                          <i class="pi pi-eye text-[10px]"></i>
                          <span>Ver notas</span>
                        </button>

                        <button
                          type="button"
                          (click)="sincronizarGrupoIndividual(item)"
                          [disabled]="!item.esSincronizable || sincronizandoId() === item.rolExamenId"
                          class="h-7 px-2.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          title="Sincronizar inmediatamente este grupo con el SEA">
                          @if (sincronizandoId() === item.rolExamenId) {
                            <i class="pi pi-spin pi-spinner text-[10px]"></i>
                          } @else {
                            <i class="pi pi-send text-[10px]"></i>
                          }
                          <span>Sincronizar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- MODAL 1: PREVISUALIZACIÓN DE NOTAS DEL GRUPO -->
      @if (dialogPrevia()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-scale-in">
            <!-- CABECERA MODAL -->
            <div class="p-5 border-b border-border flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold">
                    {{ grupoEnPrevia()?.materiaCodigo }}
                  </span>
                  <span class="text-xs font-bold text-muted-foreground">Grupo {{ grupoEnPrevia()?.grupo }}</span>
                </div>
                <h3 class="text-base font-black text-foreground mt-1">{{ grupoEnPrevia()?.materiaNombre }}</h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Previsualización de calificaciones sobre 100 puntos listas para sincronizar con el SEA.
                </p>
              </div>

              <button
                type="button"
                (click)="cerrarModalPrevia()"
                class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-muted flex items-center justify-center cursor-pointer">
                <i class="pi pi-times text-xs"></i>
              </button>
            </div>

            <!-- CUERPO MODAL -->
            <div class="p-5 overflow-y-auto flex-1 space-y-4">
              @if (cargandoPrevia()) {
                <div class="p-10 text-center space-y-3">
                  <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
                  <p class="text-xs font-bold text-muted-foreground">Consolidando calificaciones de la nómina...</p>
                </div>
              } @else if (reportePrevia()) {
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-muted/40 rounded-xl text-center text-xs">
                  <div>
                    <span class="text-muted-foreground block text-[10px] uppercase font-bold">Total Nómina</span>
                    <span class="font-black text-foreground text-sm">{{ reportePrevia()?.totalEstudiantes }}</span>
                  </div>
                  <div>
                    <span class="text-emerald-600 block text-[10px] uppercase font-bold">Ya en SEA</span>
                    <span class="font-black text-emerald-600 text-sm">{{ contarEstudiantesYaEnSea(reportePrevia()) }}</span>
                  </div>
                  <div>
                    <span class="text-sky-600 block text-[10px] uppercase font-bold">Nuevos p/ Enviar</span>
                    <span class="font-black text-sky-600 text-sm">{{ contarEstudiantesNuevosAEnviar(reportePrevia()) }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[10px] uppercase font-bold">Sin Nota / Omitidos</span>
                    <span class="font-black text-slate-500 text-sm">{{ contarEstudiantesSinNota(reportePrevia()) }}</span>
                  </div>
                </div>

                <div class="border border-border rounded-xl overflow-hidden">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-muted/60 text-[10px] font-extrabold text-muted-foreground uppercase border-b border-border">
                        <th class="py-2.5 px-3">#</th>
                        <th class="py-2.5 px-3">Código SEA</th>
                        <th class="py-2.5 px-3">Estudiante</th>
                        <th class="py-2.5 px-3 text-center">Nota /100</th>
                        <th class="py-2.5 px-3 text-center">Estado SEA</th>
                        <th class="py-2.5 px-3">Observación</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      @for (est of reportePrevia()?.estudiantes; track est.codigoEstudiante; let idx = $index) {
                        <tr class="hover:bg-muted/20">
                          <td class="py-2 px-3 text-muted-foreground font-mono text-[10px]">{{ idx + 1 }}</td>
                          <td class="py-2 px-3 font-mono font-bold text-foreground">{{ est.codigoEstudiante }}</td>
                          <td class="py-2 px-3 font-semibold text-foreground">{{ est.nombreCompleto }}</td>
                          <td class="py-2 px-3 text-center">
                            @if (est.score !== null && est.score !== undefined) {
                              <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                                {{ est.score }} pts
                              </span>
                            } @else {
                              <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-[10px]">
                                Sin nota
                              </span>
                            }
                          </td>
                          <td class="py-2 px-3 text-center">
                            @if (est.sincronizadoSea) {
                              <span class="inline-flex flex-col items-center">
                                <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-[10px] inline-flex items-center gap-1">
                                  <i class="pi pi-check text-[9px]"></i> Ya en SEA
                                </span>
                                @if (est.fechaSincronizacionSea) {
                                  <span class="text-[9px] text-muted-foreground mt-0.5">{{ formatearFechaHora(est.fechaSincronizacionSea) }}</span>
                                }
                              </span>
                            } @else if (est.score !== null && est.score !== undefined) {
                              <span class="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold text-[10px] inline-flex items-center gap-1">
                                <i class="pi pi-arrow-up-right text-[9px]"></i> Nuevo p/ enviar
                              </span>
                            } @else {
                              <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium text-[10px] inline-flex items-center gap-1">
                                <i class="pi pi-minus-circle text-[9px]"></i> Omitido
                              </span>
                            }
                          </td>
                          <td class="py-2 px-3 text-[11px] text-muted-foreground">
                            @if (est.esReprogramado) {
                              <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[9px] mr-1">Oral Reprogramado</span>
                            }
                            <span>{{ est.observacion }}</span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- PIE MODAL -->
            <div class="p-4 border-t border-border flex items-center justify-between bg-muted/10">
              <span class="text-[11px] text-muted-foreground">
                <i class="pi pi-info-circle mr-1"></i>Los estudiantes ausentes o sin nota no son enviados al SEA para no alterar su situación.
              </span>
              <button
                type="button"
                (click)="cerrarModalPrevia()"
                class="px-4 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 2: CONFIRMACIÓN DE TRANSMISIÓN MASIVA -->
      @if (dialogConfirmacionMasiva()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div class="flex items-start gap-3">
              <div class="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <i class="pi pi-send text-lg"></i>
              </div>
              <div>
                <h3 class="text-base font-black text-foreground">Confirmar Sincronización Masiva al SEA</h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Estás a punto de transmitir las calificaciones consolidadas de los grupos seleccionados hacia el sistema SEA.
                </p>
              </div>
            </div>

            <!-- RESUMEN DE LA TRANSMISIÓN -->
            <div class="p-4 rounded-xl border border-border bg-muted/30 space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Grupos seleccionados:</span>
                <span class="font-black text-foreground">{{ seleccionadosCount() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Sede:</span>
                <span class="font-bold text-foreground">{{ nombreSedeActual() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Carrera:</span>
                <span class="font-bold text-foreground">{{ nombreCarreraActual() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Examen / Parcial:</span>
                <span class="font-bold text-foreground">{{ formatearParcial(filtroTipoParcial()) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Filtro de grupos:</span>
                <span class="font-bold text-foreground">{{ filtroTipoClase() }}</span>
              </div>
            </div>

            <!-- ADVERTENCIA SI HAY GRUPOS YA SINCRONIZADOS -->
            @if (hayGruposYaSincronizadosEnSeleccion()) {
              <div class="p-3.5 rounded-xl border border-amber-300/80 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <i class="pi pi-exclamation-triangle text-base shrink-0 mt-0.5"></i>
                <div class="leading-relaxed">
                  <strong>Atención:</strong> Uno o más grupos seleccionados ya fueron sincronizados previamente. La operación actualizará las calificaciones en el SEA con los datos actuales.
                </div>
              </div>
            }

            @if (procesandoMasivo()) {
              <div class="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center space-y-2">
                <i class="pi pi-spin pi-spinner text-xl text-primary"></i>
                <p class="text-xs font-bold text-primary">Transmitiendo calificaciones en lote... No cierres esta ventana.</p>
              </div>
            }

            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                (click)="cerrarModalConfirmacionMasiva()"
                [disabled]="procesandoMasivo()"
                class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer disabled:opacity-50">
                Cancelar
              </button>

              <button
                type="button"
                (click)="ejecutarSincronizacionMasiva()"
                [disabled]="procesandoMasivo()"
                class="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all">
                @if (procesandoMasivo()) {
                  <i class="pi pi-spin pi-spinner text-xs"></i>
                  <span>Transmitiendo...</span>
                } @else {
                  <i class="pi pi-check text-xs"></i>
                  <span>Confirmar e Iniciar Sincronización</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 3: REPORTE FINAL DE RESULTADOS -->
      @if (dialogReporteMasivo()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <i class="pi pi-check-circle text-lg"></i>
              </div>
              <div>
                <h3 class="text-base font-black text-foreground">Sincronización Masiva Concluida</h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Resultados del procesamiento de calificaciones hacia el Gateway SEA.
                </p>
              </div>
            </div>

            <!-- KPIS REPORTE -->
            <div class="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 text-center text-xs">
              <div>
                <span class="text-muted-foreground block text-[10px] uppercase font-bold">Grupos Procesados</span>
                <span class="font-black text-foreground text-sm">{{ reporteMasivo()?.totalGruposSolicitados }}</span>
              </div>
              <div>
                <span class="text-emerald-600 block text-[10px] uppercase font-bold">Grupos Exitosos</span>
                <span class="font-black text-emerald-600 text-sm">{{ reporteMasivo()?.totalGruposExitosos }}</span>
              </div>
              <div>
                <span class="text-rose-600 block text-[10px] uppercase font-bold">Grupos con Fallo</span>
                <span class="font-black text-rose-600 text-sm">{{ reporteMasivo()?.totalGruposFallidos }}</span>
              </div>
            </div>

            <!-- DETALLE POR GRUPO -->
            <div class="border border-border rounded-xl max-h-60 overflow-y-auto divide-y divide-border text-xs">
              @for (grp of reporteMasivo()?.resultadosPorGrupo; track grp.rolExamenId) {
                <div class="p-3 flex items-center justify-between">
                  <div>
                    <div class="font-bold text-foreground">{{ grp.materiaNombre }} ({{ grp.grupo }})</div>
                    <div class="text-[11px] text-muted-foreground">
                      {{ grp.totalExitosos }} estudiantes registrados exitosamente
                    </div>
                  </div>
                  @if (grp.totalFallidos === 0) {
                    <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                      <i class="pi pi-check text-[8px]"></i> Éxito
                    </span>
                  } @else {
                    <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1">
                      <i class="pi pi-times text-[8px]"></i> {{ grp.totalFallidos }} rechazados
                    </span>
                  }
                </div>
              }
            </div>

            <div class="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                (click)="cerrarModalReporteMasivo()"
                class="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 cursor-pointer">
                Entendido y Cerrar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 4: AUDITORÍA Y CORRECCIÓN DE DISCREPANCIAS DE GRUPOS SEA -->
      @if (dialogDiscrepancias()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
            <!-- CABECERA MODAL -->
            <div class="p-5 border-b border-border flex items-start justify-between">
              <div class="flex items-start gap-3">
                <div class="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <i class="pi pi-user-edit text-lg"></i>
                </div>
                <div>
                  <h3 class="text-base font-black text-foreground">Discrepancias de Grupos SEA</h3>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Estudiantes con calificaciones en un grupo pero inscritos oficialmente en otro en el Gateway SEA.
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="cerrarModalDiscrepancias()"
                class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-muted flex items-center justify-center cursor-pointer">
                <i class="pi pi-times text-xs"></i>
              </button>
            </div>

            <!-- CUERPO MODAL -->
            <div class="p-5 overflow-y-auto flex-1 space-y-4">
              <!-- KPIS DISCREPANCIAS -->
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3.5 bg-muted/40 rounded-xl text-center text-xs">
                <div>
                  <span class="text-muted-foreground block text-[10px] uppercase font-bold">Grupos Auditados</span>
                  <span class="font-black text-foreground text-sm">{{ reporteDiscrepancias()?.totalGruposAnalizados }}</span>
                </div>
                <div>
                  <span class="text-foreground block text-[10px] uppercase font-bold">Total Discrepancias</span>
                  <span class="font-black text-amber-600 dark:text-amber-400 text-sm">{{ reporteDiscrepancias()?.totalConDiscrepancia }}</span>
                </div>
                <div>
                  <span class="text-emerald-600 block text-[10px] uppercase font-bold">Listos p/ Trasladar</span>
                  <span class="font-black text-emerald-600 text-sm">{{ reporteDiscrepancias()?.totalListosParaTrasladar }}</span>
                </div>
                <div>
                  <span class="text-orange-600 block text-[10px] uppercase font-bold">Conflictos Nota</span>
                  <span class="font-black text-orange-600 text-sm">{{ reporteDiscrepancias()?.totalConflictos }}</span>
                </div>
                <div>
                  <span class="text-rose-600 block text-[10px] uppercase font-bold">No Hallados SEA</span>
                  <span class="font-black text-rose-600 text-sm">{{ reporteDiscrepancias()?.totalNoEncontradosEnSea }}</span>
                </div>
              </div>

              @if ((reporteDiscrepancias()?.discrepancias?.length ?? 0) === 0) {
                <div class="p-10 text-center space-y-3">
                  <div class="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <i class="pi pi-check text-xl"></i>
                  </div>
                  <h4 class="text-sm font-bold text-foreground">¡Todo en Orden!</h4>
                  <p class="text-xs text-muted-foreground max-w-md mx-auto">
                    No se detectaron discrepancias entre las notas registradas y las nóminas vigentes del Gateway SEA en los grupos analizados.
                  </p>
                </div>
              } @else {
                <!-- FILTROS Y CONTROLES TABLA -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs pt-1">
                  <!-- Píldoras de filtro -->
                  <div class="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl">
                    <button
                      type="button"
                      (click)="alCambiarFiltroDiscrepancia('TODOS')"
                      [class.bg-card]="filtroEstadoDiscrepancia() === 'TODOS'"
                      [class.text-primary]="filtroEstadoDiscrepancia() === 'TODOS'"
                      [class.shadow-2xs]="filtroEstadoDiscrepancia() === 'TODOS'"
                      class="px-2.5 py-1 rounded-lg font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all">
                      Todos ({{ reporteDiscrepancias()?.totalConDiscrepancia }})
                    </button>
                    <button
                      type="button"
                      (click)="alCambiarFiltroDiscrepancia('LISTO')"
                      [class.bg-card]="filtroEstadoDiscrepancia() === 'LISTO'"
                      [class.text-emerald-600]="filtroEstadoDiscrepancia() === 'LISTO'"
                      [class.shadow-2xs]="filtroEstadoDiscrepancia() === 'LISTO'"
                      class="px-2.5 py-1 rounded-lg font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all">
                      Listos ({{ reporteDiscrepancias()?.totalListosParaTrasladar }})
                    </button>
                    <button
                      type="button"
                      (click)="alCambiarFiltroDiscrepancia('CONFLICTO')"
                      [class.bg-card]="filtroEstadoDiscrepancia() === 'CONFLICTO'"
                      [class.text-orange-600]="filtroEstadoDiscrepancia() === 'CONFLICTO'"
                      [class.shadow-2xs]="filtroEstadoDiscrepancia() === 'CONFLICTO'"
                      class="px-2.5 py-1 rounded-lg font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all">
                      Conflictos ({{ reporteDiscrepancias()?.totalConflictos }})
                    </button>
                    <button
                      type="button"
                      (click)="alCambiarFiltroDiscrepancia('NO_ENCONTRADO')"
                      [class.bg-card]="filtroEstadoDiscrepancia() === 'NO_ENCONTRADO'"
                      [class.text-rose-600]="filtroEstadoDiscrepancia() === 'NO_ENCONTRADO'"
                      [class.shadow-2xs]="filtroEstadoDiscrepancia() === 'NO_ENCONTRADO'"
                      class="px-2.5 py-1 rounded-lg font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all">
                      No en SEA ({{ reporteDiscrepancias()?.totalNoEncontradosEnSea }})
                    </button>
                  </div>

                  <!-- Botones de selección rápida -->
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="seleccionarTodasDiscrepanciasListas()"
                      class="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-bold text-foreground cursor-pointer">
                      Seleccionar listos
                    </button>
                    <button
                      type="button"
                      (click)="deseleccionarTodasDiscrepancias()"
                      class="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-bold text-muted-foreground cursor-pointer">
                      Limpiar selección
                    </button>
                  </div>
                </div>

                <!-- TABLA DE DISCREPANCIAS -->
                <div class="border border-border rounded-xl overflow-hidden">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-muted/60 text-[10px] font-extrabold text-muted-foreground uppercase border-b border-border">
                        <th class="py-2.5 px-3 text-center w-10">
                          <input
                            type="checkbox"
                            [checked]="todasDiscrepanciasSeleccionadas()"
                            (change)="toggleSeleccionarTodasDiscrepancias()"
                            class="rounded border-border text-primary focus:ring-primary cursor-pointer" />
                        </th>
                        <th class="py-2.5 px-3">Estudiante</th>
                        <th class="py-2.5 px-3">Materia</th>
                        <th class="py-2.5 px-3 text-center">Rindió en</th>
                        <th class="py-2.5 px-3 text-center">Pertenece en SEA</th>
                        <th class="py-2.5 px-3 text-center">Nota</th>
                        <th class="py-2.5 px-3 text-center">Diagnóstico</th>
                        <th class="py-2.5 px-3">Detalle</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      @for (item of discrepanciasFiltradas(); track claveDiscrepancia(item)) {
                        <tr class="hover:bg-muted/20">
                          <td class="py-2.5 px-3 text-center">
                            @if (item.rolExamenDestinoId) {
                              <input
                                type="checkbox"
                                [checked]="estaDiscrepanciaSeleccionada(item)"
                                (change)="toggleSeleccionDiscrepancia(item)"
                                class="rounded border-border text-primary focus:ring-primary cursor-pointer" />
                            } @else {
                              <span class="text-muted-foreground text-[10px]">-</span>
                            }
                          </td>
                          <td class="py-2.5 px-3">
                            <div class="font-bold text-foreground">{{ item.nombreEstudiante }}</div>
                            <div class="text-[10px] font-mono text-muted-foreground">Cód: {{ item.codigoEstudiante }}</div>
                          </td>
                          <td class="py-2.5 px-3">
                            <span class="font-mono font-bold text-primary">{{ item.materiaCodigo }}</span>
                            <div class="text-[10px] text-muted-foreground line-clamp-1">{{ item.materiaNombre }}</div>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono text-[11px]">
                              {{ item.grupoOrigen }}
                            </span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            @if (item.grupoDestino) {
                              <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black font-mono text-[11px] inline-flex items-center gap-1">
                                <i class="pi pi-arrow-right text-[9px]"></i> {{ item.grupoDestino }}
                              </span>
                            } @else {
                              <span class="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-[10px]">
                                No asignado
                              </span>
                            }
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            <span class="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-black text-xs">
                              {{ item.notaSobre100 ?? 0 }} pts
                            </span>
                            @if (item.esReprogramado) {
                              <div class="text-[9px] text-blue-600 font-bold mt-0.5">Oral Reprog.</div>
                            }
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            @if (item.estadoDiscrepancia === 'LISTO_PARA_TRASLADAR') {
                              <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                                <i class="pi pi-check text-[8px]"></i> Listo
                              </span>
                            } @else if (item.estadoDiscrepancia === 'CONFLICTO_TIENE_NOTA_EN_DESTINO') {
                              <span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px] inline-flex items-center gap-1">
                                <i class="pi pi-exclamation-triangle text-[8px]"></i> Ya tiene nota
                              </span>
                            } @else {
                              <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] inline-flex items-center gap-1">
                                <i class="pi pi-times text-[8px]"></i> No en SEA
                              </span>
                            }
                          </td>
                          <td class="py-2.5 px-3 text-[11px] text-muted-foreground">
                            {{ item.detalle }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- OPCIÓN SOBREESCRIBIR CONFLICTOS -->
                @if ((reporteDiscrepancias()?.totalConflictos ?? 0) > 0) {
                  <div class="p-3 rounded-xl border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 text-xs flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-orange-900 dark:text-orange-200">
                      <input
                        type="checkbox"
                        [ngModel]="sobrescribirConflictos()"
                        (ngModelChange)="sobrescribirConflictos.set($event)"
                        class="rounded border-border text-orange-600 focus:ring-orange-500 cursor-pointer" />
                      <span>Permitir sobrescribir la calificación si el estudiante ya cuenta con nota en el grupo destino</span>
                    </label>
                  </div>
                }
              }
            </div>

            <!-- PIE MODAL DISCREPANCIAS -->
            <div class="p-4 border-t border-border flex items-center justify-between bg-muted/10">
              <span class="text-xs font-semibold text-muted-foreground">
                @if (discrepanciasSeleccionadasCount() > 0) {
                  <strong class="text-foreground">{{ discrepanciasSeleccionadasCount() }}</strong> estudiante(s) seleccionado(s) para traslado
                } @else {
                  Selecciona los estudiantes que deseas transferir al grupo correcto
                }
              </span>

              <div class="flex items-center gap-2.5">
                <button
                  type="button"
                  (click)="cerrarModalDiscrepancias()"
                  [disabled]="trasladandoCalificaciones()"
                  class="px-4 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer disabled:opacity-50">
                  Cerrar
                </button>

                <button
                  type="button"
                  (click)="ejecutarTrasladoCalificaciones()"
                  [disabled]="discrepanciasSeleccionadasCount() === 0 || trasladandoCalificaciones()"
                  class="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  @if (trasladandoCalificaciones()) {
                    <i class="pi pi-spin pi-spinner text-xs"></i>
                    <span>Trasladando...</span>
                  } @else {
                    <i class="pi pi-arrow-right-arrow-left text-xs"></i>
                    <span>Trasladar seleccionados ({{ discrepanciasSeleccionadasCount() }})</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 5: RESULTADOS DEL TRASLADO -->
      @if (dialogResultadoTraslado()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <i class="pi pi-check-circle text-lg"></i>
              </div>
              <div>
                <h3 class="text-base font-black text-foreground">Traslado de Calificaciones Concluido</h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Las notas fueron reasignadas y dejadas listas para sincronización al SEA.
                </p>
              </div>
            </div>

            <!-- KPIS TRASLADO -->
            <div class="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 text-center text-xs">
              <div>
                <span class="text-muted-foreground block text-[10px] uppercase font-bold">Solicitados</span>
                <span class="font-black text-foreground text-sm">{{ resultadoTraslado()?.totalSolicitados }}</span>
              </div>
              <div>
                <span class="text-emerald-600 block text-[10px] uppercase font-bold">Trasladados con Éxito</span>
                <span class="font-black text-emerald-600 text-sm">{{ resultadoTraslado()?.totalExitosos }}</span>
              </div>
              <div>
                <span class="text-rose-600 block text-[10px] uppercase font-bold">Fallidos</span>
                <span class="font-black text-rose-600 text-sm">{{ resultadoTraslado()?.totalFallidos }}</span>
              </div>
            </div>

            <!-- DETALLE POR ESTUDIANTE -->
            <div class="border border-border rounded-xl max-h-60 overflow-y-auto divide-y divide-border text-xs">
              @for (res of resultadoTraslado()?.resultados; track res.codigoEstudiante) {
                <div class="p-3 flex items-center justify-between">
                  <div>
                    <div class="font-bold text-foreground">{{ res.nombreEstudiante }} ({{ res.codigoEstudiante }})</div>
                    <div class="text-[11px] text-muted-foreground">
                      {{ res.grupoOrigen }} → {{ res.grupoDestino }}
                    </div>
                  </div>
                  @if (res.exitoso) {
                    <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                      <i class="pi pi-check text-[8px]"></i> Éxito
                    </span>
                  } @else {
                    <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1" [title]="res.mensaje">
                      <i class="pi pi-times text-[8px]"></i> Fallido
                    </span>
                  }
                </div>
              }
            </div>

            <div class="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                (click)="cerrarModalResultadoTraslado()"
                class="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 cursor-pointer">
                Aceptar y Actualizar Nóminas
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SincronizacionSeaComponent implements OnInit {
  private readonly gateway = inject(UnitepcGatewayService);
  private readonly syncService = inject(SincronizacionSeaService);

  // Estados de catálogo y filtros
  public readonly sedes = signal<BranchOffice[]>([]);
  public readonly carreras = signal<Career[]>([]);
  public readonly cargandoSedes = signal(false);
  public readonly cargandoCarreras = signal(false);
  public readonly cargandoGrupos = signal(false);

  public readonly filtroSedeCodigo = signal<string>('');
  public readonly filtroCarreraCodigo = signal<string>('');
  public readonly filtroTipoParcial = signal<'PRIMER_PARCIAL' | 'SEGUNDO_PARCIAL' | 'FINAL' | 'SEGUNDA_INSTANCIA' | 'TODOS'>('PRIMER_PARCIAL');
  public readonly filtroTipoClase = signal<'TEORICO' | 'PRACTICO' | 'TODOS'>('TEORICO');
  public readonly filtroEstadoSync = signal<'TODOS' | 'PENDIENTE' | 'SINCRONIZADO' | 'NO_CALIFICADO'>('TODOS');
  public readonly filtroBusqueda = signal<string>('');

  // Datos de grupos
  public readonly grupos = signal<GrupoSincronizacionResumen[]>([]);
  public readonly seleccionados = signal<Set<string>>(new Set());

  // Estados de procesamiento
  public readonly sincronizandoId = signal<string | null>(null);
  public readonly procesandoMasivo = signal(false);

  // Modales
  public readonly dialogPrevia = signal(false);
  public readonly cargandoPrevia = signal(false);
  public readonly grupoEnPrevia = signal<GrupoSincronizacionResumen | null>(null);
  public readonly reportePrevia = signal<SincronizacionNotasSeaReporte | null>(null);

  public readonly dialogConfirmacionMasiva = signal(false);
  public readonly dialogReporteMasivo = signal(false);
  public readonly reporteMasivo = signal<SincronizacionMasivaReporte | null>(null);

  // Modales de Discrepancias y Traslado
  public readonly dialogDiscrepancias = signal(false);
  public readonly detectandoDiscrepancias = signal(false);
  public readonly reporteDiscrepancias = signal<DiscrepanciaGrupoReporte | null>(null);
  public readonly filtroEstadoDiscrepancia = signal<'TODOS' | 'LISTO' | 'CONFLICTO' | 'NO_ENCONTRADO'>('TODOS');
  public readonly discrepanciasSeleccionadas = signal<Set<string>>(new Set());
  public readonly sobrescribirConflictos = signal(false);
  public readonly trasladandoCalificaciones = signal(false);
  public readonly dialogResultadoTraslado = signal(false);
  public readonly resultadoTraslado = signal<TrasladoCalificacionesResultado | null>(null);

  // Computed: Grupos filtrados por búsqueda de texto
  public readonly gruposFiltrados = computed(() => {
    const list = this.grupos();
    const query = this.filtroBusqueda().trim().toLowerCase();
    if (!query) return list;

    return list.filter(g =>
      (g.materiaNombre && g.materiaNombre.toLowerCase().includes(query)) ||
      (g.materiaCodigo && g.materiaCodigo.toLowerCase().includes(query)) ||
      (g.docenteNombre && g.docenteNombre.toLowerCase().includes(query)) ||
      (g.grupo && g.grupo.toLowerCase().includes(query))
    );
  });

  // Computed: Elegibles visibles
  public readonly elegiblesVisibles = computed(() => {
    return this.gruposFiltrados().filter(g => g.esSincronizable);
  });

  // Computed: Métricas para las tarjetas
  public readonly metricas = computed(() => {
    const list = this.grupos();
    const total = list.length;
    const sincronizados = list.filter(g => g.sincronizadoSea).length;
    const pendientes = list.filter(g => !g.sincronizadoSea && g.esSincronizable).length;
    const noCalificados = list.filter(g => !g.esSincronizable && !g.sincronizadoSea).length;

    return { total, sincronizados, pendientes, noCalificados };
  });

  public readonly seleccionadosCount = computed(() => this.seleccionados().size);

  public readonly todosSeleccionados = computed(() => {
    const elegibles = this.elegiblesVisibles();
    if (elegibles.length === 0) return false;
    return elegibles.every(g => this.seleccionados().has(g.rolExamenId));
  });

  public readonly algunosSeleccionados = computed(() => {
    const elegibles = this.elegiblesVisibles();
    if (elegibles.length === 0) return false;
    const count = elegibles.filter(g => this.seleccionados().has(g.rolExamenId)).length;
    return count > 0 && count < elegibles.length;
  });

  // Computed: Discrepancias filtradas por estado
  public readonly discrepanciasFiltradas = computed(() => {
    const r = this.reporteDiscrepancias();
    if (!r || !r.discrepancias) return [];
    const filtro = this.filtroEstadoDiscrepancia();
    if (filtro === 'TODOS') return r.discrepancias;
    if (filtro === 'LISTO') return r.discrepancias.filter(d => d.estadoDiscrepancia === 'LISTO_PARA_TRASLADAR');
    if (filtro === 'CONFLICTO') return r.discrepancias.filter(d => d.estadoDiscrepancia === 'CONFLICTO_TIENE_NOTA_EN_DESTINO');
    if (filtro === 'NO_ENCONTRADO') return r.discrepancias.filter(d => d.estadoDiscrepancia === 'NO_ENCONTRADO_EN_SEA');
    return r.discrepancias;
  });

  public readonly discrepanciasSeleccionadasCount = computed(() => this.discrepanciasSeleccionadas().size);

  public readonly todasDiscrepanciasSeleccionadas = computed(() => {
    const lista = this.discrepanciasFiltradas().filter(d => !!d.rolExamenDestinoId);
    if (lista.length === 0) return false;
    return lista.every(d => this.discrepanciasSeleccionadas().has(this.claveDiscrepancia(d)));
  });

  public readonly nombreSedeActual = computed(() => {
    const code = this.filtroSedeCodigo();
    const s = this.sedes().find(item => item.code === code);
    return s ? `${s.name} (${s.code})` : code;
  });

  public readonly nombreCarreraActual = computed(() => {
    const code = this.filtroCarreraCodigo();
    const c = this.carreras().find(item => item.careerCode === code);
    return c ? `${c.careerName}` : code;
  });

  public ngOnInit(): void {
    this.cargarSedes();
  }

  // Carga inicial de sedes
  private cargarSedes(): void {
    this.cargandoSedes.set(true);
    this.gateway.getBranchOffices().subscribe({
      next: sedes => {
        this.sedes.set(sedes || []);
        this.cargandoSedes.set(false);
        const inicial = this.gateway.resolverSedeInicial(sedes);
        if (inicial) {
          this.filtroSedeCodigo.set(inicial.code);
          this.cargarCarreras(inicial.code);
        }
      },
      error: err => {
        console.error('Error al cargar sedes:', err);
        this.cargandoSedes.set(false);
      }
    });
  }

  // Carga de carreras dependiente de sede
  private cargarCarreras(sedeCodigo: string): void {
    this.cargandoCarreras.set(true);
    this.gateway.getCareers(sedeCodigo).subscribe({
      next: carreras => {
        this.carreras.set(carreras || []);
        this.cargandoCarreras.set(false);
        if (carreras && carreras.length > 0) {
          this.filtroCarreraCodigo.set(carreras[0].careerCode);
          this.cargarGrupos();
        } else {
          this.grupos.set([]);
        }
      },
      error: err => {
        console.error('Error al cargar carreras:', err);
        this.cargandoCarreras.set(false);
        this.grupos.set([]);
      }
    });
  }

  // Carga principal de grupos
  public cargarGrupos(): void {
    const sede = this.filtroSedeCodigo();
    const carrera = this.filtroCarreraCodigo();
    if (!sede || !carrera) return;

    this.cargandoGrupos.set(true);
    this.syncService.obtenerGrupos(
      sede,
      carrera,
      this.filtroTipoClase(),
      this.filtroTipoParcial(),
      this.filtroEstadoSync()
    ).subscribe({
      next: res => {
        this.grupos.set(res || []);
        this.cargandoGrupos.set(false);
        // Limpiar selecciones no vigentes
        const idsVigentes = new Set((res || []).filter(g => g.esSincronizable).map(g => g.rolExamenId));
        this.seleccionados.update(prev => {
          const nuevo = new Set<string>();
          prev.forEach(id => {
            if (idsVigentes.has(id)) nuevo.add(id);
          });
          return nuevo;
        });
      },
      error: err => {
        console.error('Error al cargar grupos:', err);
        this.cargandoGrupos.set(false);
        this.grupos.set([]);
      }
    });
  }

  public recargarGrupos(): void {
    this.cargarGrupos();
  }

  public alCambiarSede(codigo: string): void {
    this.filtroSedeCodigo.set(codigo);
    this.seleccionados.set(new Set());
    this.cargarCarreras(codigo);
  }

  public alCambiarCarrera(codigo: string): void {
    this.filtroCarreraCodigo.set(codigo);
    this.seleccionados.set(new Set());
    this.cargarGrupos();
  }

  public alCambiarTipoParcial(tipo: 'PRIMER_PARCIAL' | 'SEGUNDO_PARCIAL' | 'FINAL' | 'SEGUNDA_INSTANCIA' | 'TODOS'): void {
    this.filtroTipoParcial.set(tipo);
    this.seleccionados.set(new Set());
    this.cargarGrupos();
  }

  public cambiarTipoClase(tipo: 'TEORICO' | 'PRACTICO' | 'TODOS'): void {
    this.filtroTipoClase.set(tipo);
    this.seleccionados.set(new Set());
    this.cargarGrupos();
  }

  public alCambiarEstadoSync(estado: 'TODOS' | 'PENDIENTE' | 'SINCRONIZADO' | 'NO_CALIFICADO'): void {
    this.filtroEstadoSync.set(estado);
    this.cargarGrupos();
  }

  // Manejo de selecciones
  public estaSeleccionado(id: string): boolean {
    return this.seleccionados().has(id);
  }

  public toggleSeleccion(id: string): void {
    this.seleccionados.update(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) {
        nuevo.delete(id);
      } else {
        nuevo.add(id);
      }
      return nuevo;
    });
  }

  public toggleSeleccionarTodos(): void {
    const elegibles = this.elegiblesVisibles();
    if (this.todosSeleccionados()) {
      // Deseleccionar todos los elegibles visibles
      this.seleccionados.update(prev => {
        const nuevo = new Set(prev);
        elegibles.forEach(g => nuevo.delete(g.rolExamenId));
        return nuevo;
      });
    } else {
      // Seleccionar todos los elegibles visibles
      this.seleccionados.update(prev => {
        const nuevo = new Set(prev);
        elegibles.forEach(g => nuevo.add(g.rolExamenId));
        return nuevo;
      });
    }
  }

  public hayGruposYaSincronizadosEnSeleccion(): boolean {
    const sel = this.seleccionados();
    return this.grupos().some(g => sel.has(g.rolExamenId) && g.sincronizadoSea);
  }

  // Previsualización individual
  public abrirModalPrevia(item: GrupoSincronizacionResumen): void {
    this.grupoEnPrevia.set(item);
    this.cargandoPrevia.set(true);
    this.dialogPrevia.set(true);

    this.syncService.obtenerVistaPrevia(item.rolExamenId).subscribe({
      next: reporte => {
        this.reportePrevia.set(reporte);
        this.cargandoPrevia.set(false);
      },
      error: err => {
        console.error('Error al obtener previsualización:', err);
        this.cargandoPrevia.set(false);
      }
    });
  }

  public cerrarModalPrevia(): void {
    this.dialogPrevia.set(false);
    this.grupoEnPrevia.set(null);
    this.reportePrevia.set(null);
  }

  public contarEstudiantesConNota(reporte: SincronizacionNotasSeaReporte | null): number {
    if (!reporte || !reporte.estudiantes) return 0;
    return reporte.estudiantes.filter(e => e.score !== null && e.score !== undefined).length;
  }

  public contarEstudiantesSinNota(reporte: SincronizacionNotasSeaReporte | null): number {
    if (!reporte || !reporte.estudiantes) return 0;
    return reporte.estudiantes.filter(e => e.score === null || e.score === undefined).length;
  }

  public contarEstudiantesYaEnSea(reporte: SincronizacionNotasSeaReporte | null): number {
    if (!reporte || !reporte.estudiantes) return 0;
    return reporte.estudiantes.filter(e => e.sincronizadoSea === true).length;
  }

  public contarEstudiantesNuevosAEnviar(reporte: SincronizacionNotasSeaReporte | null): number {
    if (!reporte || !reporte.estudiantes) return 0;
    return reporte.estudiantes.filter(e => (e.score !== null && e.score !== undefined) && !e.sincronizadoSea).length;
  }

  // Sincronización individual directa
  public sincronizarGrupoIndividual(item: GrupoSincronizacionResumen): void {
    this.sincronizandoId.set(item.rolExamenId);
    this.syncService.sincronizarIndividual(item.rolExamenId).subscribe({
      next: () => {
        this.sincronizandoId.set(null);
        this.cargarGrupos();
      },
      error: err => {
        console.error('Error al sincronizar grupo individual:', err);
        this.sincronizandoId.set(null);
        alert('Error al sincronizar con el SEA: ' + (err?.error?.message || err?.message || 'Error desconocido'));
      }
    });
  }

  // Modales masivos
  public abrirModalConfirmacionMasiva(): void {
    this.dialogConfirmacionMasiva.set(true);
  }

  public cerrarModalConfirmacionMasiva(): void {
    this.dialogConfirmacionMasiva.set(false);
  }

  public ejecutarSincronizacionMasiva(): void {
    const ids = Array.from(this.seleccionados());
    if (ids.length === 0) return;

    this.procesandoMasivo.set(true);
    this.syncService.sincronizarMasivo({ rolExamenIds: ids }).subscribe({
      next: reporte => {
        this.procesandoMasivo.set(false);
        this.dialogConfirmacionMasiva.set(false);
        this.reporteMasivo.set(reporte);
        this.dialogReporteMasivo.set(true);
        this.seleccionados.set(new Set());
        this.cargarGrupos();
      },
      error: err => {
        this.procesandoMasivo.set(false);
        console.error('Error al ejecutar sincronización masiva:', err);
        alert('Error durante la transmisión masiva: ' + (err?.error?.message || err?.message || 'Error desconocido'));
      }
    });
  }

  public cerrarModalReporteMasivo(): void {
    this.dialogReporteMasivo.set(false);
    this.reporteMasivo.set(null);
  }

  // Formatters y utilitarios
  public formatearParcial(tipo: string): string {
    switch (tipo) {
      case 'PRIMER_PARCIAL': return '1er Parcial';
      case 'SEGUNDO_PARCIAL': return '2do Parcial';
      case 'FINAL':
      case 'EXAMEN_FINAL': return 'Examen Final';
      case 'SEGUNDA_INSTANCIA': return '2da Instancia';
      case 'TODOS': return 'Todos los exámenes';
      default: return tipo || 'Parcial';
    }
  }

  public formatearModalidad(modalidad: string): string {
    switch (modalidad) {
      case 'PRESENCIAL_CARTILLA': return 'Presencial OMR';
      case 'PRESENCIAL_SIN_CARTILLA': return 'Planilla Sin Cartilla';
      case 'VIRTUAL': return 'Examen Virtual';
      default: return modalidad;
    }
  }

  public formatearFechaHora(fechaIso?: string): string {
    if (!fechaIso) return '';
    try {
      const d = new Date(fechaIso);
      return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return fechaIso;
    }
  }

  public calcularPorcentaje(calificados: number, total: number): number {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((calificados / total) * 100));
  }

  public obtenerColorBarra(calificados: number, total: number): string {
    if (total > 0 && calificados >= total) return 'bg-emerald-500';
    if (calificados > 0) return 'bg-amber-500';
    return 'bg-rose-400';
  }

  // =========================================================================
  // Métodos de Auditoría y Traslado de Calificaciones por Discrepancias SEA
  // =========================================================================

  public claveDiscrepancia(item: DiscrepanciaGrupoItem): string {
    return `${item.codigoEstudiante}_${item.rolExamenOrigenId}`;
  }

  public abrirModalDeteccionDiscrepancias(): void {
    const seleccionados = Array.from(this.seleccionados());
    let idsParaAuditar: string[] = [];

    if (seleccionados.length > 0) {
      idsParaAuditar = seleccionados;
    } else {
      idsParaAuditar = this.gruposFiltrados().map(g => g.rolExamenId);
    }

    if (idsParaAuditar.length === 0) return;

    this.detectandoDiscrepancias.set(true);
    this.syncService.detectarDiscrepancias({
      rolExamenIds: idsParaAuditar,
      sedeCodigo: this.filtroSedeCodigo(),
      carreraCodigo: this.filtroCarreraCodigo()
    }).subscribe({
      next: reporte => {
        this.detectandoDiscrepancias.set(false);
        this.reporteDiscrepancias.set(reporte);
        this.filtroEstadoDiscrepancia.set('TODOS');
        this.sobrescribirConflictos.set(false);

        // Pre-seleccionar automáticamente todos los que están listos para trasladar
        const listos = new Set<string>();
        if (reporte && reporte.discrepancias) {
          reporte.discrepancias.forEach(d => {
            if (d.estadoDiscrepancia === 'LISTO_PARA_TRASLADAR' && d.rolExamenDestinoId) {
              listos.add(this.claveDiscrepancia(d));
            }
          });
        }
        this.discrepanciasSeleccionadas.set(listos);
        this.dialogDiscrepancias.set(true);
      },
      error: err => {
        this.detectandoDiscrepancias.set(false);
        console.error('Error al auditar discrepancias:', err);
        alert('Error al auditar discrepancias con el Gateway SEA: ' + (err?.error?.message || err?.message || 'Error desconocido'));
      }
    });
  }

  public auditarDiscrepanciasGrupo(item: GrupoSincronizacionResumen): void {
    this.detectandoDiscrepancias.set(true);
    this.syncService.detectarDiscrepanciasIndividual(item.rolExamenId).subscribe({
      next: reporte => {
        this.detectandoDiscrepancias.set(false);
        this.reporteDiscrepancias.set(reporte);
        this.filtroEstadoDiscrepancia.set('TODOS');
        this.sobrescribirConflictos.set(false);

        // Pre-seleccionar los que están listos
        const listos = new Set<string>();
        if (reporte && reporte.discrepancias) {
          reporte.discrepancias.forEach(d => {
            if (d.estadoDiscrepancia === 'LISTO_PARA_TRASLADAR' && d.rolExamenDestinoId) {
              listos.add(this.claveDiscrepancia(d));
            }
          });
        }
        this.discrepanciasSeleccionadas.set(listos);
        this.dialogDiscrepancias.set(true);
      },
      error: err => {
        this.detectandoDiscrepancias.set(false);
        console.error('Error al auditar grupo individual:', err);
        alert('Error al auditar discrepancias para este grupo: ' + (err?.error?.message || err?.message || 'Error desconocido'));
      }
    });
  }

  public cerrarModalDiscrepancias(): void {
    this.dialogDiscrepancias.set(false);
    this.reporteDiscrepancias.set(null);
    this.discrepanciasSeleccionadas.set(new Set());
    this.sobrescribirConflictos.set(false);
  }

  public alCambiarFiltroDiscrepancia(estado: 'TODOS' | 'LISTO' | 'CONFLICTO' | 'NO_ENCONTRADO'): void {
    this.filtroEstadoDiscrepancia.set(estado);
  }

  public estaDiscrepanciaSeleccionada(item: DiscrepanciaGrupoItem): boolean {
    return this.discrepanciasSeleccionadas().has(this.claveDiscrepancia(item));
  }

  public toggleSeleccionDiscrepancia(item: DiscrepanciaGrupoItem): void {
    if (!item.rolExamenDestinoId) return;
    const clave = this.claveDiscrepancia(item);
    this.discrepanciasSeleccionadas.update(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(clave)) {
        nuevo.delete(clave);
      } else {
        nuevo.add(clave);
      }
      return nuevo;
    });
  }

  public toggleSeleccionarTodasDiscrepancias(): void {
    const lista = this.discrepanciasFiltradas().filter(d => !!d.rolExamenDestinoId);
    if (this.todasDiscrepanciasSeleccionadas()) {
      this.discrepanciasSeleccionadas.update(prev => {
        const nuevo = new Set(prev);
        lista.forEach(d => nuevo.delete(this.claveDiscrepancia(d)));
        return nuevo;
      });
    } else {
      this.discrepanciasSeleccionadas.update(prev => {
        const nuevo = new Set(prev);
        lista.forEach(d => nuevo.add(this.claveDiscrepancia(d)));
        return nuevo;
      });
    }
  }

  public seleccionarTodasDiscrepanciasListas(): void {
    const r = this.reporteDiscrepancias();
    if (!r || !r.discrepancias) return;

    this.discrepanciasSeleccionadas.update(prev => {
      const nuevo = new Set(prev);
      r.discrepancias.forEach(d => {
        if (d.estadoDiscrepancia === 'LISTO_PARA_TRASLADAR' && d.rolExamenDestinoId) {
          nuevo.add(this.claveDiscrepancia(d));
        }
      });
      return nuevo;
    });
  }

  public deseleccionarTodasDiscrepancias(): void {
    this.discrepanciasSeleccionadas.set(new Set());
  }

  public ejecutarTrasladoCalificaciones(): void {
    const sel = this.discrepanciasSeleccionadas();
    if (sel.size === 0) return;

    const reporte = this.reporteDiscrepancias();
    if (!reporte || !reporte.discrepancias) return;

    const seleccionados = reporte.discrepancias.filter(d =>
      sel.has(this.claveDiscrepancia(d)) && !!d.rolExamenDestinoId
    );

    if (seleccionados.length === 0) return;

    this.trasladandoCalificaciones.set(true);

    const request = {
      traslados: seleccionados.map(d => ({
        codigoEstudiante: d.codigoEstudiante,
        rolExamenOrigenId: d.rolExamenOrigenId,
        rolExamenDestinoId: d.rolExamenDestinoId!,
        sobrescribirSiExiste: this.sobrescribirConflictos()
      }))
    };

    this.syncService.trasladarCalificaciones(request).subscribe({
      next: res => {
        this.trasladandoCalificaciones.set(false);
        this.dialogDiscrepancias.set(false);
        this.resultadoTraslado.set(res);
        this.dialogResultadoTraslado.set(true);
        this.discrepanciasSeleccionadas.set(new Set());
        this.cargarGrupos();
      },
      error: err => {
        this.trasladandoCalificaciones.set(false);
        console.error('Error al trasladar calificaciones:', err);
        alert('Error durante el traslado de calificaciones: ' + (err?.error?.message || err?.message || 'Error desconocido'));
      }
    });
  }

  public cerrarModalResultadoTraslado(): void {
    this.dialogResultadoTraslado.set(false);
    this.resultadoTraslado.set(null);
    this.cargarGrupos();
  }
}
