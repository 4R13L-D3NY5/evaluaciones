import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { SearchableSelectComponent, SearchableSelectOption } from '../../shared/components/searchable-select/searchable-select.component';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { AuthService } from '../../core/services/auth.service';
import { RolExamenPersistedItem } from '../../core/services/evaluaciones-db.service';
import { EvaluacionesStorageService } from '../../core/services/evaluaciones-storage.service';
import { BranchOffice, Career, Course, GroupItem } from '../../core/models/unitepc-gateway.models';
import {
  RolExamenCreateRequest,
  RolExamenResponse,
  RolExamenService
} from '../../core/services/rol-examen.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { catchError, forkJoin, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';

export type RolExamenItem = RolExamenPersistedItem;

type SeveridadAdvertenciaHorario = 'AMARILLA' | 'ROJA';

interface AdvertenciaHorarioImportacion {
  severidad: SeveridadAdvertenciaHorario;
  fila: number;
  materia: string;
  grupo: string;
  tipo: string;
  mensaje: string;
}

interface InstanciaImportacionItem {
  fila: number;
  item: RolExamenItem;
}

/**
 * Componente: Rol de Exámenes (Persistente en Base de Datos de Evaluaciones)
 * @author Ariel Camara / XpertiFlow
 */
@Component({
  selector: 'sea-rol-examenes',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableSelectComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Cabecera Oficial de Rol de Exámenes -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-2xs">
              <i class="pi pi-calendar-plus text-xl"></i>
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tight text-foreground">Rol de Exámenes</h2>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Programación y calendarización de exámenes por carrera y gestión académica (Persistente en Base de Datos).
          </p>
        </div>

        <div class="flex items-center justify-end gap-2.5 flex-wrap">
          @if (esVicerrector()) {
            <span class="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-indigo-800">
              <i class="pi pi-eye"></i> Consulta por sede
            </span>
          } @else {
            <!-- Acciones de gestión reservadas al director y al personal autorizado -->
            <button
              (click)="abrirModalSubirExcel()"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer">
              <i class="pi pi-file-excel"></i>
              <span>Subir Excel</span>
            </button>

            <button
              (click)="abrirModalSubirInstancias()"
              class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer">
              <i class="pi pi-calendar-plus"></i>
              <span>Subir 2da Instancia</span>
            </button>

            <button
              (click)="abrirModalAnadirManual()"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer">
              <i class="pi pi-plus"></i>
              <span>Añadir Examen al Rol de Examen</span>
            </button>
          }
        </div>
      </div>

      <!-- Barra de Filtros Reactiva con Signals -->
      <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        
        <!-- Fila 1 de Filtros Principales (5 Filtros) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <!-- Sede (Desde SEA Gateway) -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-building text-primary text-[10px]"></i> Sede
            </label>
            <select 
              [ngModel]="sedeSeleccionada()?.code"
              (ngModelChange)="onSedeChange($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              @for (sede of sedes(); track sede.branchOfficeId) {
                <option [value]="sede.code">{{ sede.name }} ({{ sede.code }})</option>
              }
            </select>
          </div>

          <!-- Carrera (Desde SEA Gateway) -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-graduation-cap text-primary text-[10px]"></i> Carrera
            </label>
            <select 
              [ngModel]="carreraSeleccionada()?.careerCode"
              (ngModelChange)="onCarreraChange($event)"
              [disabled]="cargandoCarreras()"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary disabled:opacity-50">
              @for (carrera of carreras(); track carrera.careerId) {
                <option [value]="carrera.careerCode">{{ carrera.careerName }} ({{ carrera.careerCode }})</option>
              }
            </select>
          </div>

          <!-- Semestre -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-sort-numeric-up text-primary text-[10px]"></i> Semestre
            </label>
            <select 
              [ngModel]="filtroSemestre()"
              (ngModelChange)="filtroSemestre.set($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              <option value="Todos">Todos los Semestres</option>
              @for (sem of semestresDisponibles(); track sem) {
                <option [value]="sem">Semestre {{ sem }}°</option>
              }
            </select>
          </div>

          <!-- Tipo de Evaluación -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-bookmark text-primary text-[10px]"></i> Tipo de Evaluación
            </label>
            <select 
              [ngModel]="filtroTipo()"
              (ngModelChange)="filtroTipo.set($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              <option value="Todos">Todos los Tipos</option>
              <option value="1er Parcial">1er Parcial</option>
              <option value="2do Parcial">2do Parcial</option>
              <option value="Final">Examen Final</option>
              <option value="2da Instancia">2da Instancia</option>
            </select>
          </div>

          <!-- Modalidad de Examen -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-desktop text-primary text-[10px]"></i> Modalidad
            </label>
            <select 
              [ngModel]="filtroModalidad()"
              (ngModelChange)="filtroModalidad.set($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              <option value="Todos">Todas las Modalidades</option>
              <option value="PRESENCIAL_CARTILLA">Con Cartilla</option>
              <option value="PRESENCIAL_SIN_CARTILLA">Sin Cartilla</option>
              <option value="VIRTUAL">Virtual</option>
            </select>
          </div>

        </div>

        <!-- Fila 2: Gestor de Rango de Fechas (Default Vacío) & Buscador Instantáneo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border">
          
          <!-- Fecha Desde -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-calendar text-primary text-[10px]"></i> Fecha Desde (Opcional)
            </label>
            <input 
              type="date" 
              [ngModel]="filtroFechaDesde()"
              (ngModelChange)="filtroFechaDesde.set($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
          </div>

          <!-- Fecha Hasta -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-calendar text-primary text-[10px]"></i> Fecha Hasta (Opcional)
            </label>
            <div class="flex items-center gap-1.5">
              <input 
                type="date" 
                [ngModel]="filtroFechaHasta()"
                (ngModelChange)="filtroFechaHasta.set($event)"
                class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
              @if (filtroFechaDesde() || filtroFechaHasta()) {
                <button 
                  (click)="limpiarRangoFechas()"
                  title="Limpiar rango de fechas"
                  class="bg-muted hover:bg-rose-50 text-rose-600 border border-border p-2 rounded-xl text-xs transition-colors shrink-0 cursor-pointer">
                  <i class="pi pi-filter-slash"></i>
                </button>
              }
            </div>
          </div>

          <!-- Buscador Reactivo Instantáneo -->
          <div class="lg:col-span-2">
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-search text-primary text-[10px]"></i> Búsqueda en Vivo
            </label>
            <div class="relative w-full">
              <input 
                type="text" 
                [ngModel]="busquedaMateria()" 
                (ngModelChange)="busquedaMateria.set($event)"
                placeholder="Buscar por materia, código oficial, docente o aula..."
                class="w-full bg-muted/70 border border-border rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-foreground outline-none focus:border-primary shadow-2xs">
              <i class="pi pi-search absolute left-3 top-2.5 text-muted-foreground text-xs"></i>
              @if (busquedaMateria()) {
                <button (click)="busquedaMateria.set('')" class="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-xs cursor-pointer">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>
          </div>

        </div>

      </div>

      <!-- Tabla Oficial de Rol de Exámenes -->
      <div class="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        
        <!-- Indicador de Carga -->
        @if (cargando() || cargandoRoles()) {
          <div class="p-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
            <span class="text-xs font-bold">Cargando información académica...</span>
          </div>
        } @else if (examenesFiltrados().length === 0) {
          
          <!-- Estado Vacío Limpio -->
          <div class="p-16 text-center space-y-4">
            <div class="h-16 w-16 rounded-2xl bg-muted text-muted-foreground/60 flex items-center justify-center mx-auto text-2xl border border-border">
              <i class="pi pi-calendar"></i>
            </div>
            
            <div class="max-w-md mx-auto space-y-1">
              <h3 class="text-sm font-black text-foreground">No hay exámenes programados en el rol de examen</h3>
              <p class="text-xs text-muted-foreground">
                El rol de examen está vacío (0 exámenes). Si tampoco aparecen carreras, verifica que el administrador haya asignado el alcance académico del director.
              </p>
            </div>

            <div class="flex items-center justify-center gap-3 pt-2">
              <button 
                (click)="abrirModalAnadirManual()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
                <i class="pi pi-plus"></i>
                <span>Añadir Examen al Rol de Examen</span>
              </button>

              <button 
                (click)="abrirModalSubirExcel()"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
                <i class="pi pi-file-excel"></i>
                <span>Importar Excel</span>
              </button>
            </div>
          </div>

        } @else {
          <!-- Barra horizontal fija junto a la cabecera; se mantiene sincronizada con la tabla. -->
          <div #rolesTablaViewport class="roles-tabla-viewport max-h-[calc(100vh-19rem)] overflow-auto"
            (scroll)="rolesTablaScrollSuperior.scrollLeft = $any($event.target).scrollLeft">
            <div #rolesTablaScrollSuperior class="roles-tabla-scroll-superior sticky top-0 z-20 overflow-x-auto rounded-t-xl border border-border/60 bg-muted/20"
              (scroll)="rolesTablaViewport.scrollLeft = $any($event.target).scrollLeft">
              <div class="h-3 min-w-[1450px]"></div>
            </div>
            <table class="roles-tabla w-full min-w-[1450px] text-left border-collapse text-xs">
              <thead>
                <tr class="bg-muted/40 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th class="p-3.5">Código</th>
                  <th class="p-3.5 min-w-[200px]">Materia Oficial</th>
                  <th class="p-3.5 text-center">Sem.</th>
                  <th class="p-3.5 text-center">Grupo</th>
                  <th class="p-3.5">Docente Titular</th>
                  <th class="p-3.5 text-center">Tipo</th>
                  <th class="p-3.5 text-center">Versión</th>
                  <th class="p-3.5 text-center">Modalidad</th>
                  <th class="p-3.5 text-center">Estado</th>
                  <th class="p-3.5">Fecha Examen</th>
                  <th class="p-3.5">Horario & Aula</th>
                  <th class="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (row of examenesFiltrados(); track row.id) {
                  <tr class="hover:bg-muted/20 transition-colors">
                    
                    <!-- Código -->
                    <td class="p-3.5 font-mono font-black text-primary">
                      {{ row.codigo }}
                    </td>

                    <!-- Materia -->
                    <td class="p-3.5 font-black text-foreground uppercase tracking-tight">
                      {{ row.materia }}
                    </td>

                    <!-- Semestre Badge Cuadrado Teal -->
                    <td class="p-3.5 text-center">
                      <span class="bg-teal-600 text-white font-black font-mono text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                        {{ row.semestre }}°
                      </span>
                    </td>

                    <!-- Grupo -->
                    <td class="p-3.5 text-center font-mono font-bold text-foreground">
                      {{ row.grupo }}
                    </td>

                    <!-- Docente Titular -->
                    <td class="p-3.5">
                      <div class="font-bold text-foreground truncate max-w-[170px]">{{ row.docenteNombre }}</div>
                      @if (row.docenteCI) {
                        <div class="text-[10px] font-mono text-muted-foreground">CI: {{ row.docenteCI }}</div>
                      }
                    </td>

                    <!-- Tipo (Píldora Azul) -->
                    <td class="p-3.5 text-center">
                      <span class="bg-blue-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase shadow-2xs">
                        {{ row.tipo }}
                      </span>
                    </td>

                    <!-- Versión del examen -->
                    <td class="p-3.5 text-center">
                      <span class="bg-slate-100 text-slate-700 border border-slate-200 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                        V{{ row.version || 1 }}
                      </span>
                    </td>

                    <!-- Modalidad -->
                    <td class="p-3.5 text-center">
                      @if (row.modalidad === 'VIRTUAL') {
                        <span class="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-desktop text-[9px]"></i> Virtual
                        </span>
                      } @else if (row.modalidad === 'PRESENCIAL_SIN_CARTILLA' || !row.conCartilla) {
                        <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-file text-[9px]"></i> Sin Cartilla
                        </span>
                      } @else {
                        <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-file-check text-[9px]"></i> Con Cartilla
                        </span>
                      }
                    </td>

                    <!-- Estado -->
                    <td class="p-3.5 text-center">
                      <span [class]="getEstadoBadgeClass(row.estado)" class="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-2xs">
                        {{ getEstadoLabel(row) }}
                      </span>
                    </td>

                    <!-- Fecha de Examen -->
                    <td class="p-3.5" [title]="getDetalleHorarioFila(row)">
                      @if (row.fechaDisplay && row.fechaDisplay !== 'Por Programar') {
                        <div class="flex items-center gap-1.5 font-mono font-bold text-foreground">
                          <i class="pi pi-calendar text-[11px] text-primary"></i>
                          <span>{{ row.fechaDisplay }}</span>
                          <i class="pi pi-info-circle text-[10px]"
                            [class.text-rose-600]="getAdvertenciaHorarioFila(row) === 'ROJA'"
                            [class.text-amber-500]="getAdvertenciaHorarioFila(row) === 'AMARILLA'"
                            [class.text-emerald-600]="!getAdvertenciaHorarioFila(row)"
                            [attr.aria-label]="getDetalleHorarioFila(row)"></i>
                        </div>
                        <span class="text-[10px] text-muted-foreground font-medium">{{ row.dia }} (Sem {{ row.semana }})</span>
                      } @else {
                        <button 
                          (click)="abrirModalEditar(row)"
                          [disabled]="!puedeEditarEliminar(row)"
                          class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                          <i class="pi pi-calendar-plus text-[9px]"></i>
                          <span>Por Programar</span>
                        </button>
                      }
                    </td>

                    <!-- Horario & Aula -->
                    <td class="p-3.5">
                      <div class="flex items-center gap-1.5 font-mono font-bold text-foreground">
                        <i class="pi pi-clock text-[10px] text-muted-foreground"></i>
                        <span>{{ row.horario }}</span>
                      </div>
                      <div class="text-[10px] text-primary font-bold truncate max-w-[150px]">
                        {{ row.aula }} · {{ row.campus }}
                      </div>
                    </td>

                    <!-- Acciones -->
                    <td class="p-3.5 text-right">
                      <div class="inline-flex items-center gap-1.5">
                        <button 
                          (click)="abrirModalEditar(row)"
                          [disabled]="!puedeEditarEliminar(row)"
                          title="Editar parámetros del examen"
                          class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                          <i class="pi pi-pencil text-xs"></i>
                        </button>
                        
                        <button 
                          (click)="eliminarExamen(row)"
                          [disabled]="!puedeEditarEliminar(row)"
                          title="Eliminar del rol de examen"
                          class="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                          <i class="pi pi-trash text-xs"></i>
                        </button>
                      </div>
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-2 text-[10px] text-muted-foreground">
            <span class="inline-flex items-center gap-1.5"><i class="pi pi-circle-fill text-[7px] text-amber-500"></i> Amarillo: grupo que no corresponde a una clase teórica TA.</span>
            <span class="inline-flex items-center gap-1.5"><i class="pi pi-circle-fill text-[7px] text-rose-500"></i> Rojo: fecha u hora fuera del horario oficial.</span>
          </div>

          <!-- Barra inferior de Conteo -->
          <div class="p-3.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span>Total exámenes programados: {{ examenesFiltrados().length }}</span>
            <div class="flex items-center gap-3">
              <button 
                (click)="vaciarRol()" 
                [disabled]="esVicerrector()"
                class="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer">
                <i class="pi pi-trash text-xs"></i>
                <span>Vaciar Rol de Examen</span>
              </button>
              <span class="font-mono text-primary">Guardado en BD · Sincronizado con el servicio institucional</span>
            </div>
          </div>
        }
      </div>

      <!-- MODAL 1: SUBIR EXCEL DE ROL DE EXÁMENES (REAL CON XLSX) -->
      @if (dialogSubirExcel()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center overflow-y-auto p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            
            <div class="flex items-start justify-between border-b border-border pb-3">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <i class="pi pi-file-excel text-base"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">Importar Rol de Exámenes desde Excel</h3>
                  <p class="text-xs text-muted-foreground">Formato oficial institucional de programación (.xlsx, .xls)</p>
                </div>
              </div>

              <button (click)="cerrarModalSubirExcel()" class="text-muted-foreground hover:text-foreground text-sm cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Zona de Carga Real con Input File -->
            <label class="border-2 border-dashed border-border hover:border-emerald-600 rounded-xl p-6 text-center space-y-2 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer block">
              <input type="file" (change)="onArchivoExcelSeleccionado($event)" accept=".xlsx, .xls" class="hidden">
              <i class="pi pi-cloud-upload text-3xl text-emerald-600"></i>
              <div>
                <div class="text-xs font-bold text-foreground">
                  {{ excelCargadoNombre() || 'Haz clic aquí para seleccionar el archivo Excel (.xlsx)' }}
                </div>
                    <p class="text-[10px] text-muted-foreground mt-1">Hoja “Rol de Examenes”, desde la fila 12: exámenes de 1er Parcial, 2do Parcial y Final. Las instancias se cargan desde su botón exclusivo.</p>
              </div>

              @if (excelCargadoNombre()) {
                <span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold mt-2">
                  <i class="pi pi-check text-xs"></i> {{ excelItemsImportados().length }} registros leídos correctamente
                </span>
              }
            </label>

            @if (excelErroresImportacion().length > 0) {
              <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-800">
                <div class="font-black mb-1">Registros rechazados por no coincidir con datos oficiales:</div>
                <ul class="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
                  @for (error of excelErroresImportacion(); track error) {
                    <li>{{ error }}</li>
                  }
                </ul>
              </div>
            }

            @if (excelAdvertenciasHorario().length > 0) {
              <div class="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] text-amber-950 space-y-2">
                <div class="flex items-center gap-2 font-black text-amber-900">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>Advertencias de fecha, hora y tipo de clase</span>
                  <span class="ml-auto rounded-full bg-white/70 px-2 py-0.5 font-mono text-[10px]">
                    {{ excelAdvertenciasHorario().length }}
                  </span>
                </div>
                <p class="text-[10px] leading-relaxed text-amber-900/80">
                  Estas observaciones no impiden cargar el rol. Verifica especialmente las advertencias rojas antes de confirmar la programación.
                </p>
                <div class="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                  @for (advertencia of excelAdvertenciasHorario(); track advertencia.fila + '-' + advertencia.tipo + '-' + advertencia.mensaje) {
                    <div class="flex items-start gap-2 rounded-lg border bg-white/70 px-2.5 py-2"
                      [class.border-amber-300]="advertencia.severidad === 'AMARILLA'"
                      [class.border-rose-300]="advertencia.severidad === 'ROJA'">
                      <span class="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black"
                        [class.bg-amber-100]="advertencia.severidad === 'AMARILLA'"
                        [class.text-amber-800]="advertencia.severidad === 'AMARILLA'"
                        [class.bg-rose-100]="advertencia.severidad === 'ROJA'"
                        [class.text-rose-800]="advertencia.severidad === 'ROJA'">
                        {{ advertencia.severidad === 'AMARILLA' ? 'AMARILLA' : 'ROJA' }}
                      </span>
                      <span class="min-w-0 leading-relaxed">
                        <strong>Fila {{ advertencia.fila }} · {{ advertencia.materia }} · {{ advertencia.grupo }} · {{ advertencia.tipo }}:</strong>
                        {{ advertencia.mensaje }}
                      </span>
                    </div>
                  }
                </div>
                <div class="flex flex-wrap gap-x-4 gap-y-1 border-t border-amber-200 pt-2 text-[10px] text-amber-900/80">
                  <span><i class="pi pi-circle-fill mr-1 text-[7px] text-amber-500"></i>Amarillo: grupo que no es clase teórica TA.</span>
                  <span><i class="pi pi-circle-fill mr-1 text-[7px] text-rose-500"></i>Rojo: fecha o hora fuera del horario oficial.</span>
                </div>
              </div>
            }

            @if (excelCargadoNombre()) {
              <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900 space-y-2">
                <label class="flex items-start gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    [disabled]="excelItemsImportados().length === 0 || cargando()"
                    [ngModel]="reemplazarRolesPermitidos()"
                    (ngModelChange)="reemplazarRolesPermitidos.set($event)"
                    class="mt-0.5 accent-amber-600 disabled:cursor-not-allowed">
                  <span [class.opacity-60]="excelItemsImportados().length === 0">
                    Eliminar y subir nuevamente los roles de examen coincidentes
                  </span>
                </label>
                <p class="pl-5 text-[10px] leading-relaxed">
                  @if (excelItemsImportados().length > 0) {
                    Solo se eliminarán roles de examen en <strong>PROGRAMADO</strong> o <strong>VALIDADO</strong>.
                    Los que estén en <strong>GENERADO</strong> o en una etapa posterior no se tocarán.
                  } @else {
                    No está disponible porque el archivo no tiene registros válidos para importar.
                    Verifica que la sede, carrera y grupos seleccionados correspondan al Excel.
                  }
                </p>
                @if (rolesImportacionReemplazables().length > 0 || rolesImportacionProtegidos().length > 0) {
                  <p class="pl-5 text-[10px] font-mono">
                    Reemplazables: {{ rolesImportacionReemplazables().length }} · Protegidos: {{ rolesImportacionProtegidos().length }}
                  </p>
                }
              </div>
            }

            @if (confirmarReemplazoImportacion()) {
              <div class="rounded-xl border border-rose-300 bg-rose-50 p-3 text-[11px] text-rose-900 space-y-2">
                <div class="flex items-start gap-2 font-black">
                  <i class="pi pi-exclamation-triangle mt-0.5 text-rose-600"></i>
                  <span>Confirma el reemplazo de los roles coincidentes</span>
                </div>
                <p>
                  Se eliminarán {{ rolesImportacionReemplazables().length }} roles en estado PROGRAMADO o VALIDADO y luego se cargarán los registros del Excel.
                  Los {{ rolesImportacionProtegidos().length }} roles avanzados permanecerán sin cambios.
                </p>
                <div class="flex justify-end gap-2 pt-1">
                  <button (click)="confirmarReemplazoImportacion.set(false)" class="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-bold cursor-pointer">Cancelar</button>
                  <button (click)="procesarImportacionExcel(true)" [disabled]="cargando()" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black disabled:opacity-50 cursor-pointer">Confirmar y subir</button>
                </div>
              </div>
            }

            @if (cargando()) {
              <div class="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs font-bold text-primary flex items-center gap-2">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Procesando la carga de roles. No cierres esta ventana…</span>
              </div>
            }

            <div class="sticky bottom-0 flex justify-end gap-2 bg-card pt-3 border-t border-border">
              <button (click)="cerrarModalSubirExcel()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cancelar</button>
              <button 
                [disabled]="excelItemsImportados().length === 0 || cargando() || confirmarReemplazoImportacion()"
                (click)="procesarImportacionExcel()"
                class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                @if (cargando()) { <i class="pi pi-spin pi-spinner mr-1"></i> Procesando... } @else { Importar al Rol de Examen }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- MODAL 2: SUBIR ÚNICAMENTE 2DA INSTANCIA -->
      @if (dialogSubirInstancias()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center overflow-y-auto p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div class="flex items-start justify-between border-b border-border pb-3">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <i class="pi pi-calendar-plus text-base"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">Subir Rol 2da Instancia</h3>
                  <p class="text-xs text-muted-foreground">Importación exclusiva de fechas y horarios de segunda instancia</p>
                </div>
              </div>
              <button (click)="cerrarModalSubirInstancias()" class="text-muted-foreground hover:text-foreground text-sm cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-900">
              <div class="flex items-start gap-2">
                <i class="pi pi-info-circle mt-0.5"></i>
                <p>Descarga la plantilla base, completa los campos obligatorios y vuelve a subirla desde este modal. El archivo registrará solamente roles de <strong>2da Instancia</strong>.</p>
              </div>
            </div>

            <button
              (click)="descargarPlantillaInstancias()"
              class="border border-rose-500 text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg text-xs font-black flex items-center gap-2 cursor-pointer">
              <i class="pi pi-download"></i>
              Descargar Excel Base
            </button>

            <div class="rounded-xl border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground">
              <div class="flex items-center gap-2 font-black text-foreground mb-1">
                <i class="pi pi-list text-rose-600"></i>
                Columnas requeridas
              </div>
              <p><strong>Código Materia, Grupo, Semana, Fecha, Hora Inicio, Hora Fin</strong></p>
              <p class="mt-1 text-[10px]">La sede y carrera se toman de los filtros seleccionados en esta pantalla.</p>
            </div>

            <label class="border-2 border-dashed border-border hover:border-rose-500 rounded-xl p-6 text-center space-y-2 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer block">
              <input type="file" (change)="onArchivoInstanciasSeleccionado($event)" accept=".xlsx, .xls" class="hidden">
              <i class="pi pi-cloud-upload text-3xl text-rose-600"></i>
              <div class="text-xs font-bold text-foreground">
                {{ instanciasCargadasNombre() || 'Arrastra el Excel completado aquí o selecciónalo' }}
              </div>
              <p class="text-[10px] text-muted-foreground">Formato .xlsx o .xls</p>
              @if (instanciasCargadasNombre()) {
                <span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold mt-2">
                  <i class="pi pi-check text-xs"></i> {{ instanciasItemsImportados().length }} registros listos para subir
                </span>
              }
            </label>

            @if (instanciasErroresImportacion().length > 0) {
              <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-800">
                <div class="font-black mb-1">Registros rechazados:</div>
                <ul class="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
                  @for (error of instanciasErroresImportacion(); track error) {
                    <li>{{ error }}</li>
                  }
                </ul>
              </div>
            }

            @if (instanciasAdvertenciasHorario().length > 0) {
              <div class="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] text-amber-950 space-y-2">
                <div class="flex items-center gap-2 font-black text-amber-900">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>Advertencias de fecha, hora y tipo de clase</span>
                  <span class="ml-auto rounded-full bg-white/70 px-2 py-0.5 font-mono text-[10px]">{{ instanciasAdvertenciasHorario().length }}</span>
                </div>
                <p class="text-[10px] leading-relaxed text-amber-900/80">Estas observaciones no impiden cargar las instancias. Verifica especialmente las advertencias rojas.</p>
                <div class="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                  @for (advertencia of instanciasAdvertenciasHorario(); track advertencia.fila + '-' + advertencia.tipo + '-' + advertencia.mensaje) {
                    <div class="flex items-start gap-2 rounded-lg border bg-white/70 px-2.5 py-2"
                      [class.border-amber-300]="advertencia.severidad === 'AMARILLA'"
                      [class.border-rose-300]="advertencia.severidad === 'ROJA'">
                      <span class="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black"
                        [class.bg-amber-100]="advertencia.severidad === 'AMARILLA'"
                        [class.text-amber-800]="advertencia.severidad === 'AMARILLA'"
                        [class.bg-rose-100]="advertencia.severidad === 'ROJA'"
                        [class.text-rose-800]="advertencia.severidad === 'ROJA'">
                        {{ advertencia.severidad === 'AMARILLA' ? 'AMARILLA' : 'ROJA' }}
                      </span>
                      <span class="min-w-0 leading-relaxed"><strong>Fila {{ advertencia.fila }} · {{ advertencia.materia }} · {{ advertencia.grupo }}:</strong> {{ advertencia.mensaje }}</span>
                    </div>
                  }
                </div>
                <div class="flex flex-wrap gap-x-4 gap-y-1 border-t border-amber-200 pt-2 text-[10px] text-amber-900/80">
                  <span><i class="pi pi-circle-fill mr-1 text-[7px] text-amber-500"></i>Amarillo: grupo que no es clase teórica TA.</span>
                  <span><i class="pi pi-circle-fill mr-1 text-[7px] text-rose-500"></i>Rojo: fecha u hora fuera del horario oficial.</span>
                </div>
              </div>
            }

            <div class="sticky bottom-0 flex justify-end gap-2 bg-card pt-3 border-t border-border">
              <button (click)="cerrarModalSubirInstancias()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cancelar</button>
              <button
                [disabled]="instanciasItemsImportados().length === 0 || cargando()"
                (click)="procesarImportacionInstancias()"
                class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Subir 2da Instancia
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 3: AÑADIR / EDITAR EXAMEN -->
      @if (dialogFormulario()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            
            <!-- Cabecera del Modal -->
            <div class="flex items-start justify-between border-b border-border pb-3">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <i class="pi pi-calendar-plus text-base"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">{{ itemEditando() ? 'Editar Programación de Examen' : 'Programar Examen en el Rol de Examen' }}</h3>
                  <p class="text-xs text-muted-foreground">Vinculación institucional y guardado permanente en Base de Datos</p>
                </div>
              </div>

              <button (click)="cerrarModalFormulario()" class="text-muted-foreground hover:text-foreground text-sm cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- SECCIÓN 1: Selección de Materia y Grupo de SEA -->
            <div class="space-y-3">
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <i class="pi pi-book text-primary text-[10px]"></i> 1. Asignatura oficial
                </label>
                <sea-searchable-select
                  [options]="materiaOpciones()"
                  [value]="formMateriaObj()?.syllabusCourseId || ''"
                  placeholder="Seleccione una asignatura"
                  searchPlaceholder="Buscar por código o nombre de asignatura..."
                  noResultsText="No se encontraron asignaturas."
                  (valueChange)="onMateriaFormChange($event)">
                </sea-searchable-select>
              </div>

              <!-- Selector de Grupos disponibles de la materia en SEA -->
              @if (gruposDeMateria().length > 1) {
                <div>
                  <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <i class="pi pi-users text-primary text-[10px]"></i> Grupo / Paralelo Oficial
                  </label>
                  <div class="flex flex-wrap gap-2">
                    @for (grp of gruposDeMateria(); track grp.groupId) {
                      <button 
                        type="button"
                        (click)="seleccionarGrupoSEA(grp)"
                        [class]="formGrupoObj()?.groupId === grp.groupId ? 'bg-primary text-white font-black' : 'bg-muted text-foreground border border-border font-bold'"
                        class="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5">
                        <i class="pi pi-check-circle text-[10px]" *ngIf="formGrupoObj()?.groupId === grp.groupId"></i>
                        <span>{{ grp.code || 'Grupo' }} ({{ grp.classType || 'TA' }})</span>
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Tarjeta Resumen de Datos Oficiales de SEA (Solo Lectura) -->
              <div class="bg-muted/40 border border-border/80 rounded-xl p-3 text-xs space-y-2">
                <div class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span class="flex items-center gap-1 text-primary">
                    <i class="pi pi-verified"></i> Datos sincronizados
                  </span>
                  <span class="font-mono text-muted-foreground">Grupo: {{ formGrupoObj()?.code || 'TA-01' }}</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-[10px] text-muted-foreground block font-semibold">Docente Titular:</span>
                    <span class="font-bold text-foreground">{{ formGrupoObj()?.teacherName || 'Por designar' }}</span>
                    @if (formGrupoObj()?.teacherIdentityNumber) {
                      <span class="text-[10px] font-mono text-muted-foreground block">CI: {{ formGrupoObj()?.teacherIdentityNumber }}</span>
                    }
                  </div>

                  <div>
                    <span class="text-[10px] text-muted-foreground block font-semibold">Horario & Aula Habitual:</span>
                    <span class="font-mono font-bold text-foreground">{{ getHorarioSEAString() }}</span>
                    <span class="text-[10px] text-primary block font-bold truncate">{{ getAulaSEAString() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECCIÓN 2: DATOS FALTANTES QUE SÍ DEBE LLENAR EL USUARIO PARA EL EXAMEN -->
            <div class="border-t border-border pt-3 space-y-3">
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1">
                <i class="pi pi-pencil text-[10px]"></i> 2. Parámetros de la Evaluación a Registrar
              </div>

              <div class="grid grid-cols-2 gap-3 text-xs">
                
                <!-- Tipo de Examen -->
                <div>
                  <label class="block font-bold text-muted-foreground mb-1">Tipo de Evaluación</label>
                  <select [(ngModel)]="formTipo" class="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer">
                    <option value="1er Parcial">1er Parcial</option>
                    <option value="2do Parcial">2do Parcial</option>
                    <option value="Final">Examen Final</option>
                    <option value="2da Instancia">2da Instancia</option>
                  </select>
                </div>

                <!-- Fecha del Examen (Dato Clave Requerido) -->
                <div>
                  <label class="block font-bold text-muted-foreground mb-1">Fecha del Examen *</label>
                  <input 
                    type="date" 
                    [(ngModel)]="formFecha" 
                    class="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none focus:border-primary">
                </div>

                <!-- Modalidad de Evaluación -->
                <div class="col-span-2">
                  <label class="block font-bold text-muted-foreground mb-1">Modalidad de Examen</label>
                  <select [(ngModel)]="formModalidad" class="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer">
                    <option value="PRESENCIAL_CARTILLA">🟦 Con Cartilla</option>
                    <option value="PRESENCIAL_SIN_CARTILLA">🟩 Sin Cartilla</option>
                    <option value="VIRTUAL">🟪 Virtual</option>
                  </select>
                </div>

              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex justify-end gap-2 pt-2 border-t border-border">
              <button (click)="cerrarModalFormulario()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cancelar</button>
              <button (click)="guardarExamenModal()" [disabled]="cargando()" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed">
                {{ cargando() ? 'Guardando...' : 'Guardar Examen en BD' }}
              </button>
            </div>

          </div>
        </div>
      }

      <!-- Toast Notificación -->
      @if (toastMessage()) {
        <div class="app-toast fixed bottom-6 right-6 bg-foreground text-background px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-[20000] animate-bounce" role="status" aria-live="polite">
          <i class="pi pi-check-circle text-emerald-400 text-lg"></i>
          <span class="text-xs font-bold">{{ toastMessage() }}</span>
        </div>
      }

    </div>
  `
})
export class RolExamenesComponent implements OnInit {
  private readonly _gateway = inject(UnitepcGatewayService);
  private readonly _rolService = inject(RolExamenService);
  private readonly _feedback = inject(UiFeedbackService);
  private readonly _auth = inject(AuthService);
  public readonly storage = inject(EvaluacionesStorageService);
  public readonly esVicerrector = computed(() => this._auth.usuario()?.rol === 'VICERRECTOR');

  // Estados de Datos Reales de SEA
  public sedes = signal<BranchOffice[]>([]);
  public sedeSeleccionada = signal<BranchOffice | null>(null);

  public carreras = signal<Career[]>([]);
  public carreraSeleccionada = signal<Career | null>(null);

  public materias = signal<Course[]>([]);
  public grupos = signal<GroupItem[]>([]);

  public materiaOpciones = computed<SearchableSelectOption[]>(() =>
    [...this.materias()]
      .sort((a, b) => a.courseCode.localeCompare(b.courseCode, 'es', { numeric: true, sensitivity: 'base' }))
      .map(materia => ({
        value: materia.syllabusCourseId,
        label: `${materia.courseCode} - ${materia.courseName} (Sem ${materia.semester}°)`,
        searchText: `${materia.courseCode} ${materia.courseName}`
      }))
  );

  // Estados de Carga
  public cargando = signal<boolean>(false);
  public cargandoCarreras = signal<boolean>(false);
  public cargandoRoles = signal<boolean>(false);

  // Filtros Reactivos con Signals
  public filtroSemestre = signal<string | number>('Todos');
  public filtroTipo = signal<string>('Todos');
  public filtroModalidad = signal<string>('Todos');
  public busquedaMateria = signal<string>('');
  public filtroFechaDesde = signal<string>('');
  public filtroFechaHasta = signal<string>('');

  public toastMessage = signal<string | null>(null);

  // Modales
  public dialogSubirExcel = signal<boolean>(false);
  public excelCargadoNombre = signal<string | null>(null);
  public excelItemsImportados = signal<RolExamenItem[]>([]);
  public excelErroresImportacion = signal<string[]>([]);
  public excelAdvertenciasHorario = signal<AdvertenciaHorarioImportacion[]>([]);
  public reemplazarRolesPermitidos = signal<boolean>(false);
  public confirmarReemplazoImportacion = signal<boolean>(false);

  public dialogSubirInstancias = signal<boolean>(false);
  public instanciasCargadasNombre = signal<string | null>(null);
  public instanciasItemsImportados = signal<InstanciaImportacionItem[]>([]);
  public instanciasErroresImportacion = signal<string[]>([]);
  public instanciasAdvertenciasHorario = signal<AdvertenciaHorarioImportacion[]>([]);

  public dialogFormulario = signal<boolean>(false);
  public itemEditando = signal<RolExamenItem | null>(null);

  // Formulario
  public formMateriaObj = signal<Course | null>(null);
  public formGrupoObj = signal<GroupItem | null>(null);

  public formTipo: '1er Parcial' | '2do Parcial' | 'Final' | '2da Instancia' = '1er Parcial';
  public formFecha = '';
  public formModalidad: 'PRESENCIAL_CARTILLA' | 'PRESENCIAL_SIN_CARTILLA' | 'VIRTUAL' = 'PRESENCIAL_CARTILLA';

  // Lista de Exámenes del Rol (Cargada desde la BD persistente)
  public examenes = signal<RolExamenItem[]>([]);

  // Grupos disponibles de la materia actualmente seleccionada en el formulario
  public gruposDeMateria = computed(() => {
    const mat = this.formMateriaObj();
    if (!mat) return [];
    return this.grupos().filter(g => g.syllabusCourseId === mat.syllabusCourseId);
  });

  // Semestres únicos disponibles de las materias de la carrera seleccionada
  public semestresDisponibles = computed(() => {
    const sems = new Set<number>();
    for (const m of this.materias()) {
      if (m.semester) sems.add(m.semester);
    }
    return Array.from(sems).sort((a, b) => a - b);
  });

  private _normalizar(texto: string): string {
    if (!texto) return '';
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // Computed: Filtro Reactivo Instantáneo con Signals
  public examenesFiltrados = computed(() => {
    let list = this.examenes();
    const query = this._normalizar(this.busquedaMateria());
    const sem = this.filtroSemestre();
    const tipo = this.filtroTipo();
    const modalidad = this.filtroModalidad();
    const desde = this.filtroFechaDesde();
    const hasta = this.filtroFechaHasta();

    if (sem !== 'Todos') {
      list = list.filter(e => e.semestre === Number(sem));
    }

    if (tipo !== 'Todos') {
      list = list.filter(e => e.tipo === tipo);
    }

    if (modalidad !== 'Todos') {
      list = list.filter(e => {
        const modItem = e.modalidad || (e.conCartilla ? 'PRESENCIAL_CARTILLA' : 'PRESENCIAL_SIN_CARTILLA');
        return modItem === modalidad;
      });
    }

    if (desde) {
      list = list.filter(e => e.fecha && e.fecha >= desde);
    }
    if (hasta) {
      list = list.filter(e => e.fecha && e.fecha <= hasta);
    }

    if (query) {
      list = list.filter(e => 
        this._normalizar(e.materia).includes(query) ||
        this._normalizar(e.codigo).includes(query) ||
        this._normalizar(e.docenteNombre).includes(query) ||
        this._normalizar(e.docenteCI).includes(query) ||
        this._normalizar(e.aula).includes(query) ||
        this._normalizar(e.grupo).includes(query)
      );
    }

    return [...list].sort((a, b) => {
      const codigo = a.codigo.localeCompare(b.codigo, 'es', { numeric: true, sensitivity: 'base' });
      if (codigo !== 0) return codigo;
      const grupo = a.grupo.localeCompare(b.grupo, 'es', { numeric: true, sensitivity: 'base' });
      if (grupo !== 0) return grupo;
      const tipoOrden: Record<string, number> = { '1er Parcial': 1, '2do Parcial': 2, 'Final': 3, '2da Instancia': 4 };
      const tipo = (tipoOrden[a.tipo] || 99) - (tipoOrden[b.tipo] || 99);
      if (tipo !== 0) return tipo;
      return (a.version || 1) - (b.version || 1);
    });
  });

  public ngOnInit(): void {
    this._cargarSedes();
  }

  public onSedeChange(sedeCode: string): void {
    const sede = this.sedes().find(s => s.code === sedeCode);
    if (sede) {
      this.sedeSeleccionada.set(sede);
      this._cargarCarreras(sede.code);
    }
  }

  public onCarreraChange(careerCode: string): void {
    const carrera = this.carreras().find(c => c.careerCode === careerCode);
    if (carrera) {
      this.carreraSeleccionada.set(carrera);
      this._cargarMateriasYGrupos();
    }
  }

  public onMateriaFormChange(syllabusCourseId: string): void {
    const mat = this.materias().find(m => m.syllabusCourseId === syllabusCourseId);
    if (mat) {
      this.formMateriaObj.set(mat);
      const grps = this.grupos().filter(g => g.syllabusCourseId === mat.syllabusCourseId);
      if (grps.length > 0) {
        this.formGrupoObj.set(grps[0]);
      } else {
        this.formGrupoObj.set(null);
      }
    }
  }

  public seleccionarGrupoSEA(grp: GroupItem): void {
    this.formGrupoObj.set(grp);
  }

  public getHorarioSEAString(): string {
    const grp = this.formGrupoObj();
    if (grp && grp.schedules && grp.schedules.length > 0) {
      const sch = grp.schedules[0];
      return `${sch.startTime} - ${sch.endTime} (${this._obtenerNombreDia(sch.day)})`;
    }
    return '08:15 - 09:45';
  }

  public getAulaSEAString(): string {
    const grp = this.formGrupoObj();
    if (grp && grp.schedules && grp.schedules.length > 0) {
      const sch = grp.schedules[0];
      return `${sch.classroom || 'Aula'} · ${sch.campus || 'Campus'}`;
    }
    return 'Aula Central';
  }

  public limpiarRangoFechas(): void {
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
  }

  public limpiarTodosFiltros(): void {
    this.busquedaMateria.set('');
    this.filtroSemestre.set('Todos');
    this.filtroTipo.set('Todos');
    this.filtroModalidad.set('Todos');
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
  }

  public async vaciarRol(): Promise<void> {
    if (this.esVicerrector()) {
      this._mostrarToast('El vicerrector cuenta con acceso de consulta por sede.');
      return;
    }
    const programados = this.examenes().filter(item => item.estado === 'PROGRAMADO');
    const protegidos = this.examenes().length - programados.length;
    if (programados.length === 0) {
      this._mostrarToast('No existen exámenes PROGRAMADOS que puedan eliminarse.');
      return;
    }
    if (!await this._feedback.confirmar(
      `Se eliminarán ${programados.length} exámenes PROGRAMADOS del servidor. ¿Deseas continuar?`,
      'Vaciar rol de examen',
      'warning',
      'Eliminar'
    )) {
      return;
    }

    this.cargando.set(true);
    forkJoin(programados.map(item => this._rolService.eliminar(item.id))).subscribe({
      next: () => {
        this.cargando.set(false);
        this._cargarRolesOficiales();
        const detalle = protegidos > 0 ? ` ${protegidos} exámenes avanzados se conservaron.` : '';
        this._mostrarToast(`Se eliminaron ${programados.length} exámenes del servidor.${detalle}`);
      },
      error: err => {
        this.cargando.set(false);
        this._mostrarToast(this._mensajeError(err, 'No se pudo vaciar el rol de examen oficial.'));
        this._cargarRolesOficiales();
      }
    });
  }

  private _cargarSedes(): void {
    this.cargando.set(true);
    this._gateway.getBranchOffices().subscribe({
      next: sedes => {
        this.sedes.set(sedes);
        const sedeInicial = this._gateway.resolverSedeInicial(sedes);
        if (sedeInicial) {
          this.sedeSeleccionada.set(sedeInicial);
          this._cargarCarreras(sedeInicial.code);
        }
      },
      error: () => this.cargando.set(false)
    });
  }

  private _cargarCarreras(branchCode: string): void {
    this.cargandoCarreras.set(true);
    this._gateway.getCareers(branchCode).subscribe({
      next: carreras => {
        this.carreras.set(carreras);
        this.cargandoCarreras.set(false);
        if (carreras.length > 0) {
          this.carreraSeleccionada.set(carreras[0]);
          this._cargarMateriasYGrupos();
        } else {
          this.carreraSeleccionada.set(null);
          this.examenes.set([]);
          this.cargando.set(false);
        }
      },
      error: () => {
        this.cargandoCarreras.set(false);
        this.cargando.set(false);
      }
    });
  }

  private _cargarMateriasYGrupos(): void {
    const sede = this.sedeSeleccionada();
    const carrera = this.carreraSeleccionada();
    if (!sede || !carrera) return;

    this.cargando.set(true);

    this._cargarRolesOficiales();

    this._gateway.getCourses(sede.code, carrera.careerCode).subscribe({
      next: materias => {
        this.materias.set([...materias].sort((a, b) =>
          a.courseCode.localeCompare(b.courseCode, 'es', { numeric: true, sensitivity: 'base' })
        ));

        this._gateway.getGroups('2-2026', sede.branchOfficeId, carrera.careerId, undefined, sede.code, carrera.careerCode).subscribe({
          next: grupos => {
            this.grupos.set(grupos);
            this.cargando.set(false);
          },
          error: () => {
            // No se usa un listado global de respaldo: podría mostrar grupos
            // fuera del alcance del director autenticado.
            this.grupos.set([]);
            this.cargando.set(false);
          }
        });
      },
      error: () => this.cargando.set(false)
    });
  }

  private _cargarRolesOficiales(): void {
    const sede = this.sedeSeleccionada();
    const carrera = this.carreraSeleccionada();
    if (!sede || !carrera) return;

    this.cargandoRoles.set(true);
    this._rolService.listar(sede.code, carrera.careerCode).subscribe({
      next: roles => {
        this.examenes.set(roles.map(rol => this._mapearRolResponse(rol)));
        this.cargandoRoles.set(false);
      },
      error: err => {
        this.examenes.set([]);
        this.cargandoRoles.set(false);
        this._mostrarToast(this._mensajeError(err, 'No se pudo cargar el rol de exámenes desde el servidor.'));
      }
    });
  }

  private _obtenerNombreDia(codigoDia: string): string {
    switch (codigoDia?.toUpperCase()) {
      case 'LU': return 'Lunes';
      case 'MA': return 'Martes';
      case 'MI': return 'Miércoles';
      case 'JU': return 'Jueves';
      case 'VI': return 'Viernes';
      case 'SA': return 'Sábado';
      default: return 'Lunes';
    }
  }

  public getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PROGRAMADO': return 'bg-blue-600 text-white';
      case 'PENDIENTE_FECHA': return 'bg-amber-600 text-white';
      case 'GENERADO': return 'bg-purple-700 text-white';
      case 'IMPRESO': return 'bg-indigo-600 text-white';
      case 'ENTREGADO': return 'bg-cyan-700 text-white';
      case 'DEVUELTO': return 'bg-amber-600 text-white';
      case 'PENDIENTE_NOTAS': return 'bg-amber-600 text-white';
      case 'CALIFICADO': return 'bg-emerald-600 text-white';
      case 'SUSPENDIDO': return 'bg-rose-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  }

  public getEstadoLabel(row: RolExamenItem): string {
    if (row.estado === 'PENDIENTE_NOTAS' && row.modalidad === 'PRESENCIAL_CARTILLA') {
      return 'PENDIENTE DE CALIFICACIÓN';
    }
    return row.estado;
  }

  public getAdvertenciaHorarioFila(item: RolExamenItem): SeveridadAdvertenciaHorario | null {
    const grupo = this.grupos().find(actual => actual.groupId === item.seaGroupId)
      || this.grupos().find(actual => actual.code === item.grupo && actual.syllabusCourseId === item.seaSyllabusCourseId);
    if (!grupo) return 'ROJA';

    const horarios = (grupo.schedules || []).filter(Boolean);
    if (horarios.length === 0) return 'ROJA';

    const diaExamen = this._diaSemanaDeFecha(item.fecha);
    const horariosDelDia = horarios.filter(horario => this._diaSemanaCodigo(horario.day) === diaExamen);
    const horaExamen = this._horaAMinutos(item.horario);
    const coincideHorario = horaExamen !== null && horariosDelDia.some(horario => {
      const inicio = this._horaAMinutos(horario.startTime);
      const fin = this._horaAMinutos(horario.endTime);
      return inicio !== null && fin !== null && horaExamen >= inicio && horaExamen < fin;
    });
    if (horariosDelDia.length === 0 || !coincideHorario) return 'ROJA';

    const clase = this._normalizar(grupo.classType || '');
    const codigoGrupo = this._normalizar(grupo.code || '');
    const esClaseTeoricaTa = clase === 'ta' || codigoGrupo === 'ta' || codigoGrupo.startsWith('ta-');
    return esClaseTeoricaTa ? null : 'AMARILLA';
  }

  public getDetalleHorarioFila(item: RolExamenItem): string {
    const advertencia = this.getAdvertenciaHorarioFila(item);
    if (advertencia === 'AMARILLA') return 'Advertencia amarilla: el grupo no corresponde a una clase teórica TA.';
    if (advertencia === 'ROJA') return 'Advertencia roja: la fecha u hora no coincide con el horario oficial del grupo.';
    return 'Fecha y hora coinciden con el horario oficial del grupo TA.';
  }

  // Modales
  public abrirModalSubirExcel(): void {
    this.excelCargadoNombre.set(null);
    this.excelItemsImportados.set([]);
    this.excelErroresImportacion.set([]);
    this.excelAdvertenciasHorario.set([]);
    this.reemplazarRolesPermitidos.set(false);
    this.confirmarReemplazoImportacion.set(false);
    this.dialogSubirExcel.set(true);
  }

  public cerrarModalSubirExcel(): void {
    this.dialogSubirExcel.set(false);
    this.confirmarReemplazoImportacion.set(false);
  }

  public abrirModalSubirInstancias(): void {
    this.instanciasCargadasNombre.set(null);
    this.instanciasItemsImportados.set([]);
    this.instanciasErroresImportacion.set([]);
    this.instanciasAdvertenciasHorario.set([]);
    this.dialogSubirInstancias.set(true);
  }

  public cerrarModalSubirInstancias(): void {
    this.dialogSubirInstancias.set(false);
  }

  public descargarPlantillaInstancias(): void {
    const hojaInstancias = XLSX.utils.aoa_to_sheet([
      ['CÓDIGO MATERIA', 'GRUPO', 'SEMANA', 'FECHA', 'HORA INICIO', 'HORA FIN'],
      ['SIS-111', 'TA-01', 1, '17/12/2026', '08:15', '09:45']
    ]);
    hojaInstancias['!cols'] = [
      { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 }
    ];

    const hojaInstrucciones = XLSX.utils.aoa_to_sheet([
      ['PLANTILLA PARA REGISTRAR 2DA INSTANCIA'],
      ['CÓDIGO MATERIA', 'Código oficial de la asignatura en la carrera seleccionada.'],
      ['GRUPO', 'Código oficial del grupo, por ejemplo TA-01.'],
      ['SEMANA', 'Número de semana académica; si no aplica, colocar 1.'],
      ['FECHA', 'Fecha de la segunda instancia en formato dd/mm/aaaa.'],
      ['HORA INICIO', 'Hora de inicio en formato HH:MM.'],
      ['HORA FIN', 'Hora de finalización en formato HH:MM.'],
      ['NOTA', 'La sede y la carrera se toman de la selección actual del módulo.'],
      ['NOTA', 'Las advertencias amarillas y rojas no impiden la carga, pero deben revisarse.']
    ]);
    hojaInstrucciones['!cols'] = [{ wch: 24 }, { wch: 95 }];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hojaInstancias, '2DA_INSTANCIA');
    XLSX.utils.book_append_sheet(libro, hojaInstrucciones, 'INSTRUCCIONES');
    XLSX.writeFile(libro, 'PLANTILLA_2DA_INSTANCIA.xlsx');
    this._mostrarToast('Se descargó la plantilla de 2da Instancia.');
  }

  public onArchivoInstanciasSeleccionado(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.instanciasCargadasNombre.set(file.name);
    this.instanciasItemsImportados.set([]);
    this.instanciasErroresImportacion.set([]);
    this.instanciasAdvertenciasHorario.set([]);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const normalizarEncabezado = (valor: unknown): string => this._normalizar(this._textoCelda(valor)).replace(/[^a-z0-9]/g, '');
        const sheetName = workbook.SheetNames.find(name => {
          const normalizado = normalizarEncabezado(name);
          return normalizado === '2dainstancia' || normalizado === 'segundainstancia';
        }) || workbook.SheetNames[0];

        if (!sheetName) {
          this.instanciasErroresImportacion.set(['El archivo no contiene hojas para importar.']);
          return;
        }

        const filas = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
          raw: true,
          defval: ''
        }) as any[][];
        const indiceEncabezado = filas.slice(0, 15).findIndex(row => {
          const encabezados = row.map(normalizarEncabezado);
          return encabezados.some(valor => valor.includes('codigomateria') || valor === 'codigo')
            && encabezados.some(valor => valor.includes('grupo'))
            && encabezados.some(valor => valor.includes('fecha'));
        });

        if (indiceEncabezado < 0) {
          this.instanciasErroresImportacion.set(['No se encontró la fila de encabezados. Descarga y completa la plantilla oficial de 2da Instancia.']);
          this._mostrarToast('El archivo no tiene el formato de 2da Instancia.');
          return;
        }

        const encabezados = filas[indiceEncabezado].map(normalizarEncabezado);
        const buscarColumna = (alias: string[]): number => encabezados.findIndex(encabezado => alias.some(valor => encabezado === valor || encabezado.includes(valor)));
        const columnas = {
          codigo: buscarColumna(['codigomateria', 'codigo']),
          grupo: buscarColumna(['grupo']),
          semana: buscarColumna(['semana']),
          fecha: buscarColumna(['fecha']),
          horaInicio: buscarColumna(['horainicio', 'inicio']),
          horaFin: buscarColumna(['horafin', 'fin'])
        };
        const columnasObligatorias: Array<[string, number]> = [
          ['Código Materia', columnas.codigo],
          ['Grupo', columnas.grupo],
          ['Fecha', columnas.fecha],
          ['Hora Inicio', columnas.horaInicio],
          ['Hora Fin', columnas.horaFin]
        ];
        const columnaFaltante = columnasObligatorias.find(([, indice]) => indice < 0);
        if (columnaFaltante) {
          this.instanciasErroresImportacion.set([`Falta la columna obligatoria '${columnaFaltante[0]}'. Descarga la plantilla oficial para corregir el archivo.`]);
          this._mostrarToast('Faltan columnas obligatorias en el Excel.');
          return;
        }

        const sede = this.sedeSeleccionada();
        const carrera = this.carreraSeleccionada();
        const items: InstanciaImportacionItem[] = [];
        const errores: string[] = [];
        const advertencias: AdvertenciaHorarioImportacion[] = [];
        const clavesExactas = new Set<string>();
        const siguienteVersion = new Map<string, number>();
        for (const existente of this.examenes()) {
          const clave = this._claveVersion(existente.seaGroupId, '2da Instancia');
          siguienteVersion.set(clave, Math.max(siguienteVersion.get(clave) || 0, existente.version || 1));
        }

        filas.slice(indiceEncabezado + 1).forEach((row, indiceFila) => {
          const filaExcel = indiceEncabezado + indiceFila + 2;
          const filaVacia = row.every(valor => this._textoCelda(valor) === '');
          if (filaVacia) return;

          const codigo = this._textoCelda(row[columnas.codigo]);
          const grupoCodigo = this._textoCelda(row[columnas.grupo]);
          const fecha = this._leerFechaExcel(row[columnas.fecha]);
          const horaInicio = this._leerHoraExcel(row[columnas.horaInicio]);
          const horaFin = this._leerHoraExcel(row[columnas.horaFin]);
          const semanaTexto = columnas.semana >= 0 ? this._textoCelda(row[columnas.semana]) : '1';
          const semana = Number(semanaTexto) || 1;

          if (!codigo || !grupoCodigo || !fecha.iso || !horaInicio || !horaFin) {
            errores.push(`Fila ${filaExcel}: completa código, grupo, fecha, hora inicio y hora fin con formatos válidos.`);
            return;
          }

          const inicioMinutos = this._horaAMinutos(horaInicio);
          const finMinutos = this._horaAMinutos(horaFin);
          if (inicioMinutos === null || finMinutos === null || finMinutos <= inicioMinutos) {
            errores.push(`Fila ${filaExcel}: la hora fin debe ser posterior a la hora inicio y usar el formato HH:MM.`);
            return;
          }

          const materia = this.materias().find(item => this._normalizar(item.courseCode) === this._normalizar(codigo));
          const grupo = materia
            ? this.grupos().find(item => item.syllabusCourseId === materia.syllabusCourseId && this._normalizar(item.code) === this._normalizar(grupoCodigo))
            : undefined;
          if (!materia) {
            errores.push(`Fila ${filaExcel}: el código de asignatura '${codigo}' no existe en la carrera seleccionada.`);
            return;
          }
          if (!grupo) {
            errores.push(`Fila ${filaExcel}: el grupo '${grupoCodigo}' no existe para ${materia.courseCode}.`);
            return;
          }

          const claveVersion = this._claveVersion(grupo.groupId, '2da Instancia');
          const claveExacta = `${claveVersion}|${fecha.iso}`;
          if (clavesExactas.has(claveExacta)) {
            errores.push(`Fila ${filaExcel}: la 2da Instancia de ${materia.courseCode} y grupo ${grupo.code} está repetida en el archivo.`);
            return;
          }

          const version = (siguienteVersion.get(claveVersion) || 0) + 1;
          const horarioImportado = `${horaInicio} - ${horaFin}`;
          const horarios = grupo.schedules || [];
          const diaFecha = this._diaSemanaDeFecha(fecha.iso);
          const horarioOficial = horarios.find(horario => this._diaSemanaCodigo(horario.day) === diaFecha) || horarios[0];
          advertencias.push(...this._evaluarHorarioImportacion(
            filaExcel,
            materia.courseName || materia.courseCode,
            grupo,
            '2da Instancia',
            fecha.iso,
            horaInicio,
            horarioImportado,
            true
          ));

          const item: RolExamenItem = {
            id: this._crearRolId(grupo.groupId, '2da Instancia', fecha.iso, version),
            seaGroupId: grupo.groupId,
            seaSyllabusCourseId: materia.syllabusCourseId,
            sedeCode: sede?.code,
            careerCode: carrera?.careerCode,
            codigo: materia.courseCode,
            materia: materia.courseName,
            semestre: materia.semester || 1,
            grupo: grupo.code,
            tipoClase: grupo.classType || 'TA',
            docenteNombre: this._nombreDocenteOficial(grupo),
            docenteCI: grupo.teacherIdentityNumber || '',
            tipo: '2da Instancia',
            version,
            estado: 'PROGRAMADO',
            modalidad: 'PRESENCIAL_CARTILLA',
            conCartilla: true,
            semana,
            dia: this._nombreDiaSemana(diaFecha),
            fecha: fecha.iso,
            fechaDisplay: fecha.display,
            horario: horarioImportado,
            aula: horarioOficial?.classroom || 'Por definir',
            campus: horarioOficial?.campus || 'Por definir'
          };
          items.push({ fila: filaExcel, item });
          clavesExactas.add(claveExacta);
          siguienteVersion.set(claveVersion, version);
        });

        this.instanciasItemsImportados.set(items);
        this.instanciasErroresImportacion.set(errores);
        this.instanciasAdvertenciasHorario.set(advertencias);
        this._mostrarToast(`Archivo '${file.name}' leído: ${items.length} instancias listas, ${errores.length} observaciones y ${advertencias.length} advertencias.`);
      } catch (err) {
        console.error('Error al procesar archivo de 2da Instancia:', err);
        this.instanciasItemsImportados.set([]);
        this.instanciasAdvertenciasHorario.set([]);
        this.instanciasErroresImportacion.set(['No se pudo leer el archivo. Descarga y completa la plantilla oficial de 2da Instancia.']);
        this._mostrarToast('Error al leer el archivo de 2da Instancia.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  public procesarImportacionInstancias(): void {
    const importados = this.instanciasItemsImportados().map(registro => registro.item);
    if (importados.length === 0) return;

    this.cargando.set(true);
    forkJoin(importados.map(item => this._rolService.crear(this._toRequest(item)).pipe(
      map(rol => ({ rol, error: null as unknown })),
      catchError(error => of({ rol: null as RolExamenResponse | null, error }))
    ))).subscribe({
      next: resultados => {
        const creados = resultados.filter(resultado => resultado.rol).length;
        const fallidos = resultados.filter(resultado => resultado.error).length;
        this.cargando.set(false);
        this.cerrarModalSubirInstancias();
        this._cargarRolesOficiales();
        this._mostrarToast(fallidos > 0
          ? `${creados} instancias registradas y ${fallidos} rechazadas por el servidor.`
          : `${creados} roles de 2da Instancia registrados correctamente en PostgreSQL.`);
      },
      error: err => {
        this.cargando.set(false);
        this._mostrarToast(this._mensajeError(err, 'No se pudieron registrar las instancias.'));
      }
    });
  }

  public onArchivoExcelSeleccionado(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const sede = this.sedeSeleccionada();
    const carrera = this.carreraSeleccionada();

    this.excelCargadoNombre.set(file.name);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames.find(name => this._normalizar(name) === this._normalizar('Rol de Examenes'));
        if (!sheetName) {
          this.excelItemsImportados.set([]);
          this.excelErroresImportacion.set(['No se encontró la hoja “Rol de Examenes”. Verifica que estés usando el archivo oficial de roles de examen.']);
          this.excelAdvertenciasHorario.set([]);
          this._mostrarToast('El archivo no contiene la hoja oficial “Rol de Examenes”.');
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const filas: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: true,
          defval: ''
        }) as any[][];

        const items: RolExamenItem[] = [];
        const errores: string[] = [];
        const advertenciasHorario: AdvertenciaHorarioImportacion[] = [];
        const clavesExactasDelArchivo = new Set<string>();
        const siguienteVersionPorClave = new Map<string, number>();
        for (const existente of this.examenes()) {
          const clave = this._claveVersion(existente.seaGroupId, existente.tipo);
          siguienteVersionPorClave.set(clave, Math.max(siguienteVersionPorClave.get(clave) || 0, existente.version || 1));
        }

        // La plantilla oficial tiene cinco hojas y la hoja de roles empieza en la fila 12.
        // La hoja conserva una columna A vacía; por ello sheet_to_json mantiene
        // esa posición y los datos comienzan en el índice 1 (columna B).
        // Índices reales: B materia, C código, D semestre, E grupo, F docente,
        // G:L contienen los exámenes que se importan desde este modal.
        // La 2da Instancia se carga exclusivamente mediante su plantilla.
        const examenesDeFila = (fila: any[]) => [
          { tipo: '1er Parcial' as RolExamenItem['tipo'], columnaFecha: 6, columnaHora: 7 },
          { tipo: '2do Parcial' as RolExamenItem['tipo'], columnaFecha: 8, columnaHora: 9 },
          { tipo: 'Final' as RolExamenItem['tipo'], columnaFecha: 10, columnaHora: 11 }
        ].map(examen => ({
          ...examen,
          fecha: this._leerFechaExcel(fila[examen.columnaFecha]),
          hora: this._leerHoraExcel(fila[examen.columnaHora]),
          valorHora: fila[examen.columnaHora]
        }));

        filas.slice(11).forEach((row, idx) => {
          const filaExcel = idx + 12;
          const materiaNombreArchivo = this._textoCelda(row[1]);
          const codigo = this._textoCelda(row[2]);
          const grupoCodigo = this._textoCelda(row[4]);

          // Las filas completamente vacías al final de la plantilla no son errores.
          if (!materiaNombreArchivo && !codigo && !grupoCodigo) return;
          if (!codigo) {
            errores.push(`Fila ${filaExcel}: falta el código de la asignatura.`);
            return;
          }

          const materia = this.materias().find(item => this._normalizar(item.courseCode) === this._normalizar(codigo));
          const grupo = materia
            ? this.grupos().find(item => item.syllabusCourseId === materia.syllabusCourseId && this._normalizar(item.code) === this._normalizar(grupoCodigo))
            : undefined;

          if (!materia) {
            errores.push(`Fila ${filaExcel}: el código de asignatura '${codigo}' no existe en la carrera seleccionada.`);
            return;
          }
          if (!grupo) {
            errores.push(`Fila ${filaExcel}: el grupo '${grupoCodigo || '(vacío)'}' no existe para ${materia.courseCode}.`);
            return;
          }

          const schedule = grupo.schedules?.[0];
          let rolesGeneradosEnFila = 0;
          const tieneDatosDeExamenGeneral = [6, 8, 10].some(columna => {
            const valor = row[columna];
            return valor !== null && valor !== undefined && this._textoCelda(valor) !== '';
          });
          for (const examen of examenesDeFila(row)) {
            if (!examen.fecha.iso) {
              const fechaInformada = row[examen.columnaFecha] !== null
                && row[examen.columnaFecha] !== undefined
                && this._textoCelda(row[examen.columnaFecha]) !== '';
              const horaInformada = row[examen.columnaHora] !== null
                && row[examen.columnaHora] !== undefined
                && this._textoCelda(row[examen.columnaHora]) !== '';
              if (fechaInformada || horaInformada) {
                errores.push(`Fila ${filaExcel}: no se registró una fecha válida para ${examen.tipo} de ${materia.courseCode}.`);
              }
              continue;
            }

            const claveVersion = this._claveVersion(grupo.groupId, examen.tipo);
            const claveExacta = `${claveVersion}|${examen.fecha.iso}`;
            if (clavesExactasDelArchivo.has(claveExacta)) {
              errores.push(`Fila ${filaExcel}: ${examen.tipo} de ${materia.courseCode} y grupo ${grupo.code} está repetido en el archivo.`);
              continue;
            }
            const version = (siguienteVersionPorClave.get(claveVersion) || 0) + 1;
            const id = this._crearRolId(grupo.groupId, examen.tipo, examen.fecha.iso, version);

          const horario = examen.hora || (schedule ? `${schedule.startTime} - ${schedule.endTime}` : 'Por definir');
            const celdaHoraTieneContenido = examen.valorHora !== null
              && examen.valorHora !== undefined
              && this._textoCelda(examen.valorHora) !== '';
            advertenciasHorario.push(...this._evaluarHorarioImportacion(
              filaExcel,
              materia.courseName || materia.courseCode,
              grupo,
              examen.tipo,
              examen.fecha.iso,
              examen.hora,
              horario,
              celdaHoraTieneContenido
            ));
            items.push({
              id,
              seaGroupId: grupo.groupId,
              seaSyllabusCourseId: materia.syllabusCourseId,
              sedeCode: sede?.code,
              careerCode: carrera?.careerCode,
              codigo: materia.courseCode,
              materia: materia.courseName,
              semestre: materia.semester || 1,
              grupo: grupo.code,
              tipoClase: grupo.classType || 'TA',
              docenteNombre: this._nombreDocenteOficial(grupo),
              docenteCI: grupo.teacherIdentityNumber || '',
              tipo: examen.tipo,
              version,
              estado: 'PROGRAMADO',
              modalidad: 'PRESENCIAL_CARTILLA',
              conCartilla: true,
              semana: 1,
              dia: schedule ? this._obtenerNombreDia(schedule.day) : 'Por definir',
              fecha: examen.fecha.iso,
              fechaDisplay: examen.fecha.display,
              horario,
              aula: schedule?.classroom || 'Por definir',
              campus: schedule?.campus || 'Por definir'
            });
            clavesExactasDelArchivo.add(claveExacta);
            siguienteVersionPorClave.set(claveVersion, version);
            rolesGeneradosEnFila++;
          }

          if (rolesGeneradosEnFila === 0 && tieneDatosDeExamenGeneral) {
            errores.push(`Fila ${filaExcel}: no se pudo generar ningún examen porque faltan fechas o ya existen registros.`);
          }
        });

        this.excelItemsImportados.set(items);
        this.excelErroresImportacion.set(errores);
        this.excelAdvertenciasHorario.set(advertenciasHorario);
        this._mostrarToast(`Archivo '${file.name}' leído: ${items.length} registros oficiales listos, ${errores.length} observaciones y ${advertenciasHorario.length} advertencias de horario.`);
      } catch (err) {
        console.error('Error al procesar archivo Excel:', err);
        this.excelAdvertenciasHorario.set([]);
        this._mostrarToast('Error al leer el archivo Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  public procesarImportacionExcel(confirmado = false): void {
    const importados = this.excelItemsImportados();
    if (importados.length === 0) return;

    const reemplazables = this.rolesImportacionReemplazables();
    if (this.reemplazarRolesPermitidos() && reemplazables.length > 0 && !confirmado) {
      this.confirmarReemplazoImportacion.set(true);
      return;
    }
    this.confirmarReemplazoImportacion.set(false);

    this.cargando.set(true);
    const eliminar$ = this.reemplazarRolesPermitidos() && reemplazables.length > 0
      ? from(reemplazables).pipe(
        mergeMap(item => this._rolService.eliminar(item.id), 6),
        toArray()
      )
      : of([]);
    const crear$ = from(importados).pipe(
      mergeMap(item => this._rolService.crear(this._toRequest(item)).pipe(
        map(rol => ({ rol, error: null as unknown })),
        catchError(error => of({ rol: null as RolExamenResponse | null, error }))
      ), 6),
      toArray()
    );

    eliminar$.pipe(
      switchMap(() => crear$)
    ).subscribe({
      next: resultados => {
        const creados = resultados.filter(resultado => resultado.rol).map(resultado => resultado.rol!);
        const fallidos = resultados.filter(resultado => resultado.error);
        this.cargando.set(false);
        this.cerrarModalSubirExcel();
        this._cargarRolesOficiales();
        if (fallidos.length > 0) {
          this._mostrarToast(`${creados.length} exámenes registrados y ${fallidos.length} rechazados por el servidor.`);
        } else {
          const eliminados = this.reemplazarRolesPermitidos() ? ` Se reemplazaron ${reemplazables.length} roles de examen permitidos.` : '';
          this._mostrarToast(`${creados.length} exámenes registrados correctamente en PostgreSQL.${eliminados}`);
        }
      },
      error: err => {
        this.cargando.set(false);
        this._mostrarToast(this._mensajeError(err, 'No se pudieron eliminar los roles de examen permitidos; no se realizó la nueva carga.'));
        this._cargarRolesOficiales();
      }
    });
  }

  public abrirModalAnadirManual(): void {
    this.itemEditando.set(null);
    const mats = this.materias();
    if (mats.length > 0) {
      this.onMateriaFormChange(mats[0].syllabusCourseId);
    } else {
      this.formMateriaObj.set(null);
      this.formGrupoObj.set(null);
    }
    this.formTipo = '1er Parcial';
    this.formFecha = '';
    this.formModalidad = 'PRESENCIAL_CARTILLA';
    this.dialogFormulario.set(true);
  }

  public abrirModalEditar(item: RolExamenItem): void {
    if (!this.puedeEditarEliminar(item)) {
      this._mostrarToast('Solo se pueden editar roles de examen en estado PROGRAMADO o VALIDADO.');
      return;
    }
    this.itemEditando.set(item);
    const mat = this.materias().find(m => m.courseCode === item.codigo) || null;
    this.formMateriaObj.set(mat);
    const grp = this.grupos().find(g => g.groupId === item.seaGroupId || g.code === item.grupo) || null;
    this.formGrupoObj.set(grp);
    this.formTipo = item.tipo;
    this.formFecha = item.fecha;
    this.formModalidad = item.modalidad === 'VIRTUAL'
      ? 'VIRTUAL'
      : item.modalidad === 'PRESENCIAL_CARTILLA'
        ? 'PRESENCIAL_CARTILLA'
        : 'PRESENCIAL_SIN_CARTILLA';
    this.dialogFormulario.set(true);
  }

  public cerrarModalFormulario(): void {
    this.dialogFormulario.set(false);
  }

  public guardarExamenModal(): void {
    const mat = this.formMateriaObj();
    if (!mat) {
      this._mostrarToast('Por favor selecciona una materia.');
      return;
    }

    const sede = this.sedeSeleccionada();
    const carrera = this.carreraSeleccionada();
    const grp = this.formGrupoObj();
    if (!sede || !carrera) {
      this._mostrarToast('Selecciona una sede y una carrera oficiales.');
      return;
    }
    if (!grp) {
      this._mostrarToast('Selecciona un grupo oficial para la materia.');
      return;
    }
    if (!this.formFecha) {
      this._mostrarToast('La fecha del examen es obligatoria.');
      return;
    }
    const sch = grp && grp.schedules && grp.schedules.length > 0 ? grp.schedules[0] : null;

    let fechaDisp = 'Por Programar';
    if (this.formFecha) {
      const p = this.formFecha.split('-');
      if (p.length === 3) {
        fechaDisp = `${p[2]}/${p[1]}/${p[0]}`;
      }
    }

    const conCartilla = this.formModalidad === 'PRESENCIAL_CARTILLA';
    const edit = this.itemEditando();
    const item: RolExamenItem = {
      id: edit?.id || this._crearRolId(grp.groupId, this.formTipo, this.formFecha),
      seaGroupId: grp.groupId,
      seaSyllabusCourseId: mat.syllabusCourseId,
      sedeCode: sede.code,
      careerCode: carrera.careerCode,
      codigo: mat.courseCode,
      materia: mat.courseName,
      semestre: mat.semester || 1,
      grupo: grp.code,
      tipoClase: grp.classType || 'TA',
      docenteNombre: grp.teacherName || this._nombreDocenteOficial(grp),
      docenteCI: grp.teacherIdentityNumber || '',
      tipo: this.formTipo,
      version: edit?.version || this._siguienteVersionLocal(grp.groupId, this.formTipo),
      estado: 'PROGRAMADO',
      modalidad: this.formModalidad,
      conCartilla,
      semana: edit?.semana || 1,
      dia: sch ? this._obtenerNombreDia(sch.day) : edit?.dia || 'Lunes',
      fecha: this.formFecha,
      fechaDisplay: fechaDisp,
      horario: sch ? `${sch.startTime} - ${sch.endTime}` : edit?.horario || '08:15 - 09:45',
      aula: sch?.classroom || edit?.aula || 'Por definir',
      campus: sch?.campus || edit?.campus || 'Por definir'
    };

    const request = this._toRequest(item);
    const operacion = edit
      ? this._rolService.actualizar(edit.id, request)
      : this._rolService.crear(request);

    this.cargando.set(true);
    operacion.subscribe({
      next: rol => {
        const persistido = this._mapearRolResponse(rol);
        this.examenes.update(items => edit
          ? items.map(actual => actual.id === persistido.id ? persistido : actual)
          : [persistido, ...items]);
        this.cargando.set(false);
        this.cerrarModalFormulario();
        this._mostrarToast(edit
          ? `Examen '${persistido.codigo}' actualizado en PostgreSQL.`
          : `Examen '${persistido.codigo} - ${persistido.materia}' registrado en PostgreSQL.`);
      },
      error: err => {
        this.cargando.set(false);
        this._mostrarToast(this._mensajeError(err, 'No se pudo guardar el examen en el servidor.'));
      }
    });
  }

  public async eliminarExamen(item: RolExamenItem): Promise<void> {
    if (!this.puedeEditarEliminar(item)) {
      this._mostrarToast('Solo se pueden eliminar roles de examen en estado PROGRAMADO o VALIDADO.');
      return;
    }
    if (!await this._feedback.confirmar(
      `¿Deseas eliminar el examen ${item.codigo} del rol de examen oficial?`,
      'Eliminar examen',
      'warning',
      'Eliminar'
    )) return;

    this._rolService.eliminar(item.id).subscribe({
      next: () => {
        this.examenes.update(items => items.filter(e => e.id !== item.id));
        this._mostrarToast(`Examen '${item.codigo}' eliminado de PostgreSQL.`);
      },
      error: err => this._mostrarToast(this._mensajeError(err, 'No se pudo eliminar el examen.'))
    });
  }

  public puedeEditarEliminar(item: RolExamenItem): boolean {
    return !this.esVicerrector()
      && (item.estado === 'PROGRAMADO' || item.estado === 'VALIDADO');
  }

  public rolesImportacionReemplazables(): RolExamenItem[] {
    return this.rolesCoincidentesConImportacion()
      .filter(item => item.estado === 'PROGRAMADO' || item.estado === 'VALIDADO');
  }

  public rolesImportacionProtegidos(): RolExamenItem[] {
    return this.rolesCoincidentesConImportacion()
      .filter(item => item.estado !== 'PROGRAMADO' && item.estado !== 'VALIDADO');
  }

  private rolesCoincidentesConImportacion(): RolExamenItem[] {
    const claves = new Set(this.excelItemsImportados().map(item => this._claveVersion(item.seaGroupId, item.tipo)));
    return this.examenes().filter(item => claves.has(this._claveVersion(item.seaGroupId, item.tipo)));
  }

  private _toRequest(item: RolExamenItem): RolExamenCreateRequest {
    const sede = this.sedeSeleccionada();
    const carrera = this.carreraSeleccionada();
    if (!sede || !carrera) {
      throw new Error('No existe contexto académico seleccionado.');
    }

    return {
      id: item.id,
      seaGroupId: item.seaGroupId,
      seaSyllabusCourseId: item.seaSyllabusCourseId,
      sedeCodigo: sede.code,
      sedeNombre: sede.name,
      carreraCodigo: carrera.careerCode,
      carreraNombre: carrera.careerName,
      materiaCodigo: item.codigo,
      materiaNombre: item.materia,
      semestre: item.semestre,
      grupo: item.grupo,
      tipoClase: item.tipoClase,
      tipoParcial: item.tipo,
      version: item.version,
      modalidad: item.modalidad || (item.conCartilla ? 'PRESENCIAL_CARTILLA' : 'PRESENCIAL_SIN_CARTILLA'),
      semana: item.semana,
      dia: item.dia,
      fecha: item.fecha,
      fechaDisplay: item.fechaDisplay,
      horario: item.horario,
      aula: item.aula,
      campus: item.campus
    };
  }

  private _mapearRolResponse(rol: RolExamenResponse): RolExamenItem {
    return {
      id: rol.id,
      seaGroupId: rol.seaGroupId,
      seaSyllabusCourseId: rol.seaSyllabusCourseId,
      sedeCode: rol.sedeCodigo,
      careerCode: rol.carreraCodigo,
      codigo: rol.materiaCodigo,
      materia: rol.materiaNombre,
      semestre: rol.semestre,
      grupo: rol.grupo,
      tipoClase: rol.tipoClase,
      docenteNombre: rol.docenteNombre,
      docenteCI: rol.docenteCi,
      tipo: rol.tipoParcial as RolExamenItem['tipo'],
      version: rol.version || 1,
      estado: rol.estadoFlujo as RolExamenItem['estado'],
      modalidad: rol.modalidad,
      conCartilla: rol.modalidad === 'PRESENCIAL_CARTILLA',
      semana: rol.semana,
      dia: rol.dia,
      fecha: rol.fecha,
      fechaDisplay: rol.fechaDisplay,
      horario: rol.horario,
      aula: rol.aula,
      campus: rol.campus,
      hashEncriptacion: rol.hashEncriptacion,
      fechaValidacion: rol.fechaValidacion,
      estudiantesInscritosCount: rol.estudiantesInscritosCount
    };
  }

  private _textoCelda(valor: unknown): string {
    return valor === null || valor === undefined ? '' : String(valor).trim();
  }

  private _leerFechaExcel(valor: unknown): { iso: string; display: string } {
    if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
      const iso = `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}-${String(valor.getDate()).padStart(2, '0')}`;
      return { iso, display: `${String(valor.getDate()).padStart(2, '0')}/${String(valor.getMonth() + 1).padStart(2, '0')}/${valor.getFullYear()}` };
    }

    if (typeof valor === 'number' && Number.isFinite(valor)) {
      const partes = XLSX.SSF.parse_date_code(valor);
      if (partes?.y && partes?.m && partes?.d) {
        const iso = `${partes.y}-${String(partes.m).padStart(2, '0')}-${String(partes.d).padStart(2, '0')}`;
        return { iso, display: `${String(partes.d).padStart(2, '0')}/${String(partes.m).padStart(2, '0')}/${partes.y}` };
      }
    }

    const texto = this._textoCelda(valor);
    const fechaLatam = texto.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (fechaLatam) {
      const [, dia, mes, anio] = fechaLatam;
      return {
        iso: `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`,
        display: `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`
      };
    }

    const fechaIso = texto.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
    if (fechaIso) {
      const [, anio, mes, dia] = fechaIso;
      return {
        iso: `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`,
        display: `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`
      };
    }

    const fechaTexto = texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const fechaConMes = fechaTexto.match(/^(\d{1,2})\s+(?:de\s+|del\s+)?([a-z]+)(?:\s+(?:de\s+|del\s+)?(\d{4}))?$/);
    if (fechaConMes) {
      const [, diaTexto, mesTexto, anioTexto] = fechaConMes;
      const meses: Record<string, number> = {
        ene: 1, enero: 1,
        feb: 2, febrero: 2,
        mar: 3, marzo: 3,
        abr: 4, abril: 4,
        may: 5, mayo: 5,
        jun: 6, junio: 6,
        jul: 7, julio: 7,
        ago: 8, agosto: 8,
        sep: 9, sept: 9, set: 9, septiembre: 9, setiembre: 9,
        oct: 10, octubre: 10,
        nov: 11, noviembre: 11,
        dic: 12, diciembre: 12
      };
      const mes = meses[mesTexto] ?? 0;
      const dia = Number(diaTexto);
      const anio = Number(anioTexto || this._anioGestionActiva());
      const fecha = new Date(Date.UTC(anio, mes - 1, dia));
      const fechaValida = mes && dia >= 1 && dia <= 31
        && fecha.getUTCFullYear() === anio
        && fecha.getUTCMonth() === mes - 1
        && fecha.getUTCDate() === dia;
      if (fechaValida) {
        const iso = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        return { iso, display: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}` };
      }
    }

    return { iso: '', display: 'Por programar' };
  }

  private _anioGestionActiva(): number {
    const gestion = this.storage.gestionActiva();
    const anio = gestion.match(/(?:19|20)\d{2}/)?.[0];
    return Number(anio || new Date().getFullYear());
  }

  private _leerHoraExcel(valor: unknown): string {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      const partes = XLSX.SSF.parse_date_code(valor % 1);
      if (partes) return `${String(partes.H ?? partes.h ?? 0).padStart(2, '0')}:${String(partes.M ?? partes.m ?? 0).padStart(2, '0')}`;
    }

    const texto = this._textoCelda(valor);
    const hora = texto.match(/(\d{1,2}):(\d{2})/);
    return hora ? `${hora[1].padStart(2, '0')}:${hora[2]}` : '';
  }

  private _evaluarHorarioImportacion(
    fila: number,
    materia: string,
    grupo: GroupItem,
    tipo: string,
    fechaIso: string,
    horaImportada: string,
    horarioImportado: string,
    horaInformada: boolean
  ): AdvertenciaHorarioImportacion[] {
    const advertencias: AdvertenciaHorarioImportacion[] = [];
    const horarios = (grupo.schedules || []).filter(Boolean);
    const codigoClase = this._normalizar(grupo.classType || '');
    const codigoGrupo = this._normalizar(grupo.code || '');
    const esClaseTeoricaTa = codigoClase === 'ta' || codigoGrupo === 'ta' || codigoGrupo.startsWith('ta-');

    if (!esClaseTeoricaTa) {
      advertencias.push({
        severidad: 'AMARILLA',
        fila,
        materia,
        grupo: grupo.code || 'Sin grupo',
        tipo,
        mensaje: `el grupo está clasificado como ${grupo.classType || 'no TA'}, no como clase teórica TA.`
      });
    }

    if (horarios.length === 0) {
      advertencias.push({
        severidad: 'ROJA',
        fila,
        materia,
        grupo: grupo.code || 'Sin grupo',
        tipo,
        mensaje: 'no existe un horario oficial disponible en SEA para validar la fecha y la hora.'
      });
      return advertencias;
    }

    if (horaInformada && !horaImportada) {
      advertencias.push({
        severidad: 'ROJA',
        fila,
        materia,
        grupo: grupo.code || 'Sin grupo',
        tipo,
        mensaje: 'la hora informada en el Excel no pudo interpretarse; revisa el formato HH:MM.'
      });
    }

    const diaExamen = this._diaSemanaDeFecha(fechaIso);
    const horariosDelDia = horarios.filter(horario => this._diaSemanaCodigo(horario.day) === diaExamen);
    const horaExamen = this._horaAMinutos(horaImportada || horarioImportado);
    const horaValida = horaExamen !== null && horariosDelDia.some(horario => {
      const inicio = this._horaAMinutos(horario.startTime);
      const fin = this._horaAMinutos(horario.endTime);
      return inicio !== null && fin !== null && horaExamen >= inicio && horaExamen < fin;
    });

    if (horariosDelDia.length === 0) {
      advertencias.push({
        severidad: 'ROJA',
        fila,
        materia,
        grupo: grupo.code || 'Sin grupo',
        tipo,
        mensaje: `la fecha ${this._formatearFechaCorta(fechaIso)} cae en ${this._nombreDiaSemana(diaExamen)}, día que no coincide con el horario oficial del grupo.`
      });
    } else if (horaImportada && !horaValida) {
      const horariosEsperados = horariosDelDia
        .map(horario => `${horario.startTime}–${horario.endTime}`)
        .join(', ');
      advertencias.push({
        severidad: 'ROJA',
        fila,
        materia,
        grupo: grupo.code || 'Sin grupo',
        tipo,
        mensaje: `la hora ${horaImportada} está fuera del horario oficial (${horariosEsperados}).`
      });
    }

    return advertencias;
  }

  private _diaSemanaDeFecha(fechaIso: string): number {
    if (!fechaIso) return -1;
    const [anio, mes, dia] = fechaIso.split('-').map(Number);
    if (!anio || !mes || !dia) return -1;
    return new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  }

  private _diaSemanaCodigo(valor: string): number {
    const dia = this._normalizar(valor).replace(/[^a-z0-9]/g, '');
    const dias: Record<string, number> = {
      domingo: 0, dom: 0, su: 0, sun: 0,
      lunes: 1, lun: 1, lu: 1, monday: 1, mo: 1,
      martes: 2, mar: 2, ma: 2, tuesday: 2, tu: 2,
      miercoles: 3, mie: 3, mi: 3, wednesday: 3, we: 3,
      jueves: 4, jue: 4, ju: 4, thursday: 4, th: 4,
      viernes: 5, vie: 5, vi: 5, friday: 5, fr: 5,
      sabado: 6, sab: 6, sa: 6, saturday: 6
    };
    return dias[dia] ?? -1;
  }

  private _horaAMinutos(valor: string): number | null {
    const coincidencia = String(valor || '').match(/(\d{1,2}):(\d{2})/);
    if (!coincidencia) return null;
    const horas = Number(coincidencia[1]);
    const minutos = Number(coincidencia[2]);
    return horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59 ? horas * 60 + minutos : null;
  }

  private _nombreDiaSemana(dia: number): string {
    return ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][dia] || 'día no identificado';
  }

  private _formatearFechaCorta(fechaIso: string): string {
    const partes = fechaIso.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaIso;
  }

  private _normalizarTipoParcial(valor: string): RolExamenItem['tipo'] | null {
    const normalizado = this._normalizar(valor);
    if (normalizado === '1er parcial' || normalizado === 'primer parcial') return '1er Parcial';
    if (normalizado === '2do parcial' || normalizado === 'segundo parcial') return '2do Parcial';
    if (normalizado === 'final' || normalizado === 'examen final') return 'Final';
    if (normalizado === '2da instancia' || normalizado === 'segunda instancia') return '2da Instancia';
    return null;
  }

  private _normalizarModalidad(valor: string): RolExamenCreateRequest['modalidad'] {
    const normalizado = this._normalizar(valor).replace(/\s+/g, '_');
    if (normalizado === 'virtual') return 'VIRTUAL';
    if (normalizado === 'presencial_cartilla' || normalizado === 'con_cartilla') return 'PRESENCIAL_CARTILLA';
    if (normalizado === 'presencial_sin_cartilla' || normalizado === 'sin_cartilla' || normalizado === 'presencial') return 'PRESENCIAL_SIN_CARTILLA';
    return 'PRESENCIAL_CARTILLA';
  }

  private _claveVersion(groupId: string, tipo: RolExamenItem['tipo']): string {
    return `${groupId}|${tipo}`;
  }

  private _siguienteVersionLocal(groupId: string, tipo: RolExamenItem['tipo']): number {
    return this.examenes()
      .filter(item => this._claveVersion(item.seaGroupId, item.tipo) === this._claveVersion(groupId, tipo))
      .reduce((max, item) => Math.max(max, item.version || 1), 0) + 1;
  }

  private _crearRolId(groupId: string, tipo: RolExamenItem['tipo'], fecha: string, version = 1): string {
    const tipoCodigo = tipo === '1er Parcial' ? '1P'
      : tipo === '2do Parcial' ? '2P'
      : tipo === 'Final' ? 'FIN'
      : '2I';
    const base = `ROL-${groupId}-${tipoCodigo}-${fecha}`;
    return version <= 1 ? base : `${base}-V${version}`;
  }

  private _nombreDocenteOficial(grupo: GroupItem): string {
    return grupo.teacherName?.trim() || '';
  }

  private _mensajeError(error: any, fallback: string): string {
    return error?.error?.error || error?.error?.message || error?.message || fallback;
  }

  private _mostrarToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
