import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { SincronizacionSeaService } from '../../core/services/sincronizacion-sea.service';
import {
  GrupoSincronizacionResumen,
  SincronizacionMasivaReporte,
  SincronizacionNotasSeaReporte
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div class="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl text-center text-xs">
                  <div>
                    <span class="text-muted-foreground block text-[10px] uppercase font-bold">Total Nómina</span>
                    <span class="font-black text-foreground text-sm">{{ reportePrevia()?.totalEstudiantes }}</span>
                  </div>
                  <div>
                    <span class="text-emerald-600 block text-[10px] uppercase font-bold">Con Calificación</span>
                    <span class="font-black text-emerald-600 text-sm">{{ contarEstudiantesConNota(reportePrevia()) }}</span>
                  </div>
                  <div>
                    <span class="text-amber-600 block text-[10px] uppercase font-bold">Sin Nota / Ausentes</span>
                    <span class="font-black text-amber-600 text-sm">{{ contarEstudiantesSinNota(reportePrevia()) }}</span>
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
    this.syncService.obtenerGrupos(sede, carrera, this.filtroTipoClase(), this.filtroEstadoSync()).subscribe({
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
      case 'EXAMEN_FINAL': return 'Examen Final';
      case 'SEGUNDA_INSTANCIA': return '2da Instancia';
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
}
