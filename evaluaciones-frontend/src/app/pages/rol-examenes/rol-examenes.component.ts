import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { EvaluacionesDbService, RolExamenPersistedItem } from '../../core/services/evaluaciones-db.service';
import { BranchOffice, Career, Course, GroupItem } from '../../core/models/unitepc-gateway.models';

export type RolExamenItem = RolExamenPersistedItem;

/**
 * Componente: Rol de Exámenes (Persistente en Base de Datos de Evaluaciones)
 * @author Ariel Camara / XpertiFlow
 */
@Component({
  selector: 'sea-rol-examenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

        <div class="flex items-center gap-2.5">
          <!-- Botón Subir Excel -->
          <button 
            (click)="abrirModalSubirExcel()"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer">
            <i class="pi pi-file-excel"></i>
            <span>Subir Excel</span>
          </button>

          <!-- Botón Añadir Manual -->
          <button 
            (click)="abrirModalAnadirManual()"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer">
            <i class="pi pi-plus"></i>
            <span>Añadir Examen al Rol</span>
          </button>
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
              <option value="PRESENCIAL_CARTILLA">Con Cartilla OMR</option>
              <option value="PRESENCIAL_SIN_CARTILLA">Sin Cartilla (Físico)</option>
              <option value="VIRTUAL">Virtual Online</option>
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
        @if (cargando()) {
          <div class="p-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
            <span class="text-xs font-bold">Consultando materias de SEA...</span>
          </div>
        } @else if (examenesFiltrados().length === 0) {
          
          <!-- Estado Vacío Limpio -->
          <div class="p-16 text-center space-y-4">
            <div class="h-16 w-16 rounded-2xl bg-muted text-muted-foreground/60 flex items-center justify-center mx-auto text-2xl border border-border">
              <i class="pi pi-calendar"></i>
            </div>
            
            <div class="max-w-md mx-auto space-y-1">
              <h3 class="text-sm font-black text-foreground">No hay exámenes programados en el rol</h3>
              <p class="text-xs text-muted-foreground">
                El rol está limpio (0 exámenes). Puedes programar exámenes seleccionando materias de SEA o importar la planilla oficial en formato Excel.
              </p>
            </div>

            <div class="flex items-center justify-center gap-3 pt-2">
              <button 
                (click)="abrirModalAnadirManual()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
                <i class="pi pi-plus"></i>
                <span>Añadir Examen al Rol</span>
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
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-muted/40 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th class="p-3.5">Código</th>
                  <th class="p-3.5 min-w-[200px]">Materia Oficial</th>
                  <th class="p-3.5 text-center">Sem.</th>
                  <th class="p-3.5 text-center">Grupo</th>
                  <th class="p-3.5">Docente Titular</th>
                  <th class="p-3.5 text-center">Tipo</th>
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

                    <!-- Modalidad (Cartilla OMR, Físico o Virtual) -->
                    <td class="p-3.5 text-center">
                      @if (row.modalidad === 'VIRTUAL') {
                        <span class="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-desktop text-[9px]"></i> Virtual Online
                        </span>
                      } @else if (row.modalidad === 'PRESENCIAL_SIN_CARTILLA' || !row.conCartilla) {
                        <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-file-edit text-[9px]"></i> Físico / Sin Cartilla
                        </span>
                      } @else {
                        <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-check-circle text-[9px]"></i> Con Cartilla OMR
                        </span>
                      }
                    </td>

                    <!-- Estado -->
                    <td class="p-3.5 text-center">
                      <span [class]="getEstadoBadgeClass(row.estado)" class="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-2xs">
                        {{ row.estado }}
                      </span>
                    </td>

                    <!-- Fecha de Examen -->
                    <td class="p-3.5">
                      @if (row.fechaDisplay && row.fechaDisplay !== 'Por Programar') {
                        <div class="flex items-center gap-1.5 font-mono font-bold text-foreground">
                          <i class="pi pi-calendar text-[11px] text-primary"></i>
                          <span>{{ row.fechaDisplay }}</span>
                        </div>
                        <span class="text-[10px] text-muted-foreground font-medium">{{ row.dia }} (Sem {{ row.semana }})</span>
                      } @else {
                        <button 
                          (click)="abrirModalEditar(row)"
                          class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md hover:bg-amber-100 transition-colors cursor-pointer">
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
                          title="Editar parámetros del examen"
                          class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer">
                          <i class="pi pi-pencil text-xs"></i>
                        </button>
                        
                        <button 
                          (click)="eliminarExamen(row)"
                          title="Eliminar del Rol"
                          class="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer">
                          <i class="pi pi-trash text-xs"></i>
                        </button>
                      </div>
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Barra inferior de Conteo -->
          <div class="p-3.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span>Total exámenes programados: {{ examenesFiltrados().length }}</span>
            <div class="flex items-center gap-3">
              <button 
                (click)="vaciarRol()" 
                class="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer">
                <i class="pi pi-trash text-xs"></i>
                <span>Vaciar Rol</span>
              </button>
              <span class="font-mono text-primary">Guardado en BD · Sincronizado con SEA</span>
            </div>
          </div>
        }
      </div>

      <!-- MODAL 1: SUBIR EXCEL DE ROL DE EXÁMENES (REAL CON XLSX) -->
      @if (dialogSubirExcel()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            
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
                <p class="text-[10px] text-muted-foreground mt-1">Columnas: Código, Materia, Semestre, Grupo, Docente, Fecha, Horario, Aula</p>
              </div>

              @if (excelCargadoNombre()) {
                <span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold mt-2">
                  <i class="pi pi-check text-xs"></i> {{ excelItemsImportados().length }} registros leídos correctamente
                </span>
              }
            </label>

            <div class="flex justify-end gap-2 pt-2 border-t border-border">
              <button (click)="cerrarModalSubirExcel()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cancelar</button>
              <button 
                [disabled]="excelItemsImportados().length === 0"
                (click)="procesarImportacionExcel()"
                class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Importar al Rol
              </button>
            </div>

          </div>
        </div>
      }

      <!-- MODAL 2: AÑADIR / EDITAR EXAMEN -->
      @if (dialogFormulario()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            
            <!-- Cabecera del Modal -->
            <div class="flex items-start justify-between border-b border-border pb-3">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <i class="pi pi-calendar-plus text-base"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">{{ itemEditando() ? 'Editar Programación de Examen' : 'Programar Examen en el Rol' }}</h3>
                  <p class="text-xs text-muted-foreground">Vinculación con SEA y guardado permanente en Base de Datos</p>
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
                  <i class="pi pi-book text-primary text-[10px]"></i> 1. Asignatura Oficial (SEA)
                </label>
                <select 
                  [ngModel]="formMateriaObj()?.syllabusCourseId"
                  (ngModelChange)="onMateriaFormChange($event)"
                  class="w-full bg-muted/80 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer">
                  @for (m of materias(); track m.syllabusCourseId) {
                    <option [value]="m.syllabusCourseId">{{ m.courseCode }} - {{ m.courseName }} (Sem {{ m.semester }}°)</option>
                  }
                </select>
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
                    <i class="pi pi-verified"></i> Datos Sincronizados de SEA
                  </span>
                  <span class="font-mono text-muted-foreground">Grupo: {{ formGrupoObj()?.code || 'TA-01' }}</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-[10px] text-muted-foreground block font-semibold">Docente Titular:</span>
                    <span class="font-bold text-foreground">{{ formGrupoObj()?.teacherName || 'Por Designar en SEA' }}</span>
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

                <!-- Modalidad de Evaluación (3 Opciones) -->
                <div class="col-span-2">
                  <label class="block font-bold text-muted-foreground mb-1">Modalidad de Examen</label>
                  <select [(ngModel)]="formModalidad" class="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer">
                    <option value="PRESENCIAL_CARTILLA">🟦 Presencial con Cartilla (Digital Typst + OMR Óptico)</option>
                    <option value="PRESENCIAL_SIN_CARTILLA">🟩 Presencial sin Cartilla (Físico / Cuadernillo de Desarrollo)</option>
                    <option value="VIRTUAL">🟪 Virtual Online (Resolución Web Sincrónica)</option>
                  </select>
                </div>

              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex justify-end gap-2 pt-2 border-t border-border">
              <button (click)="cerrarModalFormulario()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cancelar</button>
              <button (click)="guardarExamenModal()" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer shadow-xs">
                Guardar Examen en BD
              </button>
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
export class RolExamenesComponent implements OnInit {
  private readonly _gateway = inject(UnitepcGatewayService);
  private readonly _db = inject(EvaluacionesDbService);

  // Estados de Datos Reales de SEA
  public sedes = signal<BranchOffice[]>([]);
  public sedeSeleccionada = signal<BranchOffice | null>(null);

  public carreras = signal<Career[]>([]);
  public carreraSeleccionada = signal<Career | null>(null);

  public materias = signal<Course[]>([]);
  public grupos = signal<GroupItem[]>([]);

  // Estados de Carga
  public cargando = signal<boolean>(false);
  public cargandoCarreras = signal<boolean>(false);

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

    return list;
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

  public vaciarRol(): void {
    const sede = this.sedeSeleccionada();
    const carrera = this.carreraSeleccionada();
    this._db.clearRolesExamenes(sede?.code, carrera?.careerCode);
    this.examenes.set([]);
    this._mostrarToast('El rol de exámenes ha sido vaciado de la BD.');
  }

  private _cargarSedes(): void {
    this.cargando.set(true);
    this._gateway.getBranchOffices().subscribe({
      next: sedes => {
        this.sedes.set(sedes);
        if (sedes.length > 0) {
          const cba = sedes.find(s => s.code === 'CBA') || sedes[0];
          this.sedeSeleccionada.set(cba);
          this._cargarCarreras(cba.code);
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

    // Cargar exámenes previamente persistidos en BD para esta sede y carrera
    const persistidos = this._db.getRolesExamenes(sede.code, carrera.careerCode);
    this.examenes.set(persistidos);

    this._gateway.getCourses(sede.code, carrera.careerCode).subscribe({
      next: materias => {
        this.materias.set(materias);

        this._gateway.getGroups('2-2026', sede.branchOfficeId, carrera.careerId).subscribe({
          next: grupos => {
            this.grupos.set(grupos);
            this.cargando.set(false);
          },
          error: () => {
            this._gateway.getGroups('2-2026').subscribe({
              next: allGroups => {
                this.grupos.set(allGroups);
                this.cargando.set(false);
              },
              error: () => {
                this.cargando.set(false);
              }
            });
          }
        });
      },
      error: () => this.cargando.set(false)
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
      case 'REVISADO': return 'bg-emerald-600 text-white';
      case 'SUBIDO': return 'bg-teal-600 text-white';
      case 'SUSPENDIDO': return 'bg-rose-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  }

  // Modales
  public abrirModalSubirExcel(): void {
    this.excelCargadoNombre.set(null);
    this.excelItemsImportados.set([]);
    this.dialogSubirExcel.set(true);
  }

  public cerrarModalSubirExcel(): void {
    this.dialogSubirExcel.set(false);
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
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const items: RolExamenItem[] = jsonData.map((row, idx) => {
          const rawFecha = row['Fecha'] || row['FECHA'] || row['fecha'] || '';
          let fechaIso = '';
          let fechaDisp = 'Por Programar';
          if (rawFecha) {
            if (rawFecha.includes('/')) {
              const parts = rawFecha.split('/');
              if (parts.length === 3) {
                fechaIso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                fechaDisp = rawFecha;
              }
            } else if (rawFecha.includes('-')) {
              fechaIso = rawFecha;
              const p = rawFecha.split('-');
              fechaDisp = `${p[2]}/${p[1]}/${p[0]}`;
            }
          }

          return {
            id: `EXCEL-${Date.now()}-${idx}`,
            seaGroupId: `EXCEL-${idx}`,
            seaSyllabusCourseId: `EXCEL-${idx}`,
            sedeCode: sede?.code || 'CBA',
            careerCode: carrera?.careerCode || 'CARSIS',
            codigo: row['Codigo'] || row['CÓDIGO'] || row['codigo'] || `MAT-${idx + 1}`,
            materia: row['Materia'] || row['MATERIA'] || row['materia'] || row['Nombre'] || 'Asignatura Importada',
            semestre: Number(row['Semestre'] || row['SEMESTRE'] || 1),
            grupo: row['Grupo'] || row['GRUPO'] || 'TA-01',
            tipoClase: 'TA',
            docenteNombre: row['Docente'] || row['DOCENTE'] || 'Docente Titular',
            docenteCI: row['CI'] || '',
            tipo: row['Tipo'] || row['TIPO'] || '1er Parcial',
            estado: fechaIso ? 'PROGRAMADO' : 'PENDIENTE_FECHA',
            conCartilla: true,
            semana: Number(row['Semana'] || 8),
            dia: row['Dia'] || 'Lunes',
            fecha: fechaIso,
            fechaDisplay: fechaDisp,
            horario: row['Horario'] || '08:15 - 09:45',
            aula: row['Aula'] || 'Aula 101',
            campus: 'Campus Central'
          };
        });

        this.excelItemsImportados.set(items);
        this._mostrarToast(`Archivo '${file.name}' leído: ${items.length} exámenes listos.`);
      } catch (err) {
        console.error('Error al procesar archivo Excel:', err);
        this._mostrarToast('Error al leer el archivo Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  public procesarImportacionExcel(): void {
    const importados = this.excelItemsImportados();
    if (importados.length > 0) {
      for (const item of importados) {
        this._db.upsertRolExamen(item);
      }
      this.examenes.update(current => [...importados, ...current]);
      this._mostrarToast(`${importados.length} exámenes guardados en BD exitosamente.`);
    }
    this.cerrarModalSubirExcel();
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
    this.itemEditando.set(item);
    const mat = this.materias().find(m => m.courseCode === item.codigo) || null;
    this.formMateriaObj.set(mat);
    const grp = this.grupos().find(g => g.groupId === item.seaGroupId || g.code === item.grupo) || null;
    this.formGrupoObj.set(grp);
    this.formTipo = item.tipo;
    this.formFecha = item.fecha;
    this.formModalidad = item.modalidad || (item.conCartilla ? 'PRESENCIAL_CARTILLA' : 'PRESENCIAL_SIN_CARTILLA');
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
    if (edit) {
      edit.codigo = mat.courseCode;
      edit.materia = mat.courseName;
      edit.semestre = mat.semester;
      edit.seaSyllabusCourseId = mat.syllabusCourseId;
      edit.sedeCode = sede?.code || edit.sedeCode;
      edit.careerCode = carrera?.careerCode || edit.careerCode;
      edit.grupo = grp?.code || edit.grupo || 'TA-01';
      edit.docenteNombre = grp?.teacherName || edit.docenteNombre;
      edit.docenteCI = grp?.teacherIdentityNumber || edit.docenteCI;
      edit.tipo = this.formTipo;
      edit.fecha = this.formFecha;
      edit.fechaDisplay = fechaDisp;
      if (sch) {
        edit.horario = `${sch.startTime} - ${sch.endTime}`;
        edit.aula = sch.classroom || edit.aula;
        edit.campus = sch.campus || edit.campus;
        edit.dia = this._obtenerNombreDia(sch.day);
      }
      edit.modalidad = this.formModalidad;
      edit.conCartilla = conCartilla;
      edit.estado = this.formFecha ? 'PROGRAMADO' : 'PENDIENTE_FECHA';
      
      this._db.upsertRolExamen(edit);
      this.examenes.update(items => [...items]);
      this._mostrarToast(`Examen '${edit.codigo}' actualizado y guardado en BD.`);
    } else {
      const nuevo: RolExamenItem = {
        id: `ROL-${grp?.groupId || Date.now()}`,
        seaGroupId: grp?.groupId || `SEA-G-${Date.now()}`,
        seaSyllabusCourseId: mat.syllabusCourseId,
        sedeCode: sede?.code || 'CBA',
        careerCode: carrera?.careerCode || 'CARSIS',
        codigo: mat.courseCode,
        materia: mat.courseName,
        semestre: mat.semester || 1,
        grupo: grp?.code || 'TA-01',
        tipoClase: grp?.classType || 'TA',
        docenteNombre: grp?.teacherName || 'Por Designar',
        docenteCI: grp?.teacherIdentityNumber || '',
        tipo: this.formTipo,
        estado: this.formFecha ? 'PROGRAMADO' : 'PENDIENTE_FECHA',
        modalidad: this.formModalidad,
        conCartilla: conCartilla,
        semana: 8,
        dia: sch ? this._obtenerNombreDia(sch.day) : 'Lunes',
        fecha: this.formFecha,
        fechaDisplay: fechaDisp,
        horario: sch ? `${sch.startTime} - ${sch.endTime}` : '08:15 - 09:45',
        aula: sch ? sch.classroom : 'Aula Central',
        campus: sch ? sch.campus : 'Campus Central'
      };

      this._db.upsertRolExamen(nuevo);
      this.examenes.update(items => [nuevo, ...items]);
      this._mostrarToast(`Examen '${nuevo.codigo} - ${nuevo.materia}' registrado y persistido en BD.`);
    }
    this.cerrarModalFormulario();
  }

  public eliminarExamen(item: RolExamenItem): void {
    this._db.deleteRolExamen(item.id);
    this.examenes.update(items => items.filter(e => e.id !== item.id));
    this._mostrarToast(`Examen '${item.codigo}' eliminado de la BD.`);
  }

  private _mostrarToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
