import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { RolExamenPersistedItem } from '../../core/services/evaluaciones-db.service';
import { EvaluacionesStorageService } from '../../core/services/evaluaciones-storage.service';
import { BranchOffice, Career, Course, GroupItem } from '../../core/models/unitepc-gateway.models';
import {
  RolExamenCreateRequest,
  RolExamenResponse,
  RolExamenService
} from '../../core/services/rol-examen.service';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

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
            <span>Añadir Examen al Rol de Examen</span>
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
                El rol de examen está vacío (0 exámenes). Puedes programar exámenes seleccionando materias oficiales o importar la planilla oficial en formato Excel.
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

          <!-- Barra inferior de Conteo -->
          <div class="p-3.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span>Total exámenes programados: {{ examenesFiltrados().length }}</span>
            <div class="flex items-center gap-3">
              <button 
                (click)="vaciarRol()" 
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
                    <p class="text-[10px] text-muted-foreground mt-1">Hoja “Rol de Examenes”, desde la fila 12: exámenes teóricos y segunda instancia. Modalidad predeterminada: Con Cartilla.</p>
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

            <div class="flex justify-end gap-2 pt-2 border-t border-border">
              <button (click)="cerrarModalSubirExcel()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cancelar</button>
              <button 
                [disabled]="excelItemsImportados().length === 0 || cargando()"
                (click)="procesarImportacionExcel()"
                class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Importar al Rol de Examen
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
  public readonly storage = inject(EvaluacionesStorageService);

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
  public reemplazarRolesPermitidos = signal<boolean>(false);

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

  public vaciarRol(): void {
    const programados = this.examenes().filter(item => item.estado === 'PROGRAMADO');
    const protegidos = this.examenes().length - programados.length;
    if (programados.length === 0) {
      this._mostrarToast('No existen exámenes PROGRAMADOS que puedan eliminarse.');
      return;
    }
    if (!window.confirm(`Se eliminarán ${programados.length} exámenes PROGRAMADOS del servidor. ¿Deseas continuar?`)) {
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
        this.materias.set(materias);

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

  // Modales
  public abrirModalSubirExcel(): void {
    this.excelCargadoNombre.set(null);
    this.excelItemsImportados.set([]);
    this.excelErroresImportacion.set([]);
    this.reemplazarRolesPermitidos.set(false);
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
        const sheetName = workbook.SheetNames.find(name => this._normalizar(name) === this._normalizar('Rol de Examenes'));
        if (!sheetName) {
          this.excelItemsImportados.set([]);
          this.excelErroresImportacion.set(['No se encontró la hoja “Rol de Examenes”. Verifica que estés usando el archivo oficial de roles de examen.']);
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
        const clavesExactasDelArchivo = new Set<string>();
        const siguienteVersionPorClave = new Map<string, number>();
        for (const existente of this.examenes()) {
          const clave = this._claveVersion(existente.seaGroupId, existente.tipo);
          siguienteVersionPorClave.set(clave, Math.max(siguienteVersionPorClave.get(clave) || 0, existente.version || 1));
        }

        // La plantilla oficial tiene cinco hojas y la hoja de roles empieza en la fila 12.
        // Como la hoja inicia en B, sheet_to_json devuelve B como índice 0.
        // Índices relativos: B materia, C código, D semestre, E grupo, F docente,
        // G:L teóricos y AN:AO segunda instancia.
        const examenesDeFila = (fila: any[]) => [
          { tipo: '1er Parcial' as RolExamenItem['tipo'], columnaFecha: 5, columnaHora: 6 },
          { tipo: '2do Parcial' as RolExamenItem['tipo'], columnaFecha: 7, columnaHora: 8 },
          { tipo: 'Final' as RolExamenItem['tipo'], columnaFecha: 9, columnaHora: 10 },
          { tipo: '2da Instancia' as RolExamenItem['tipo'], columnaFecha: 38, columnaHora: 39 }
        ].map(examen => ({
          ...examen,
          fecha: this._leerFechaExcel(fila[examen.columnaFecha]),
          hora: this._leerHoraExcel(fila[examen.columnaHora])
        }));

        filas.slice(11).forEach((row, idx) => {
          const filaExcel = idx + 12;
          const materiaNombreArchivo = this._textoCelda(row[0]);
          const codigo = this._textoCelda(row[1]);
          const grupoCodigo = this._textoCelda(row[3]);

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
          for (const examen of examenesDeFila(row)) {
            if (!examen.fecha.iso) {
              errores.push(`Fila ${filaExcel}: no se registró fecha para ${examen.tipo} de ${materia.courseCode}.`);
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

          if (rolesGeneradosEnFila === 0) {
            errores.push(`Fila ${filaExcel}: no se pudo generar ningún examen porque faltan fechas o ya existen registros.`);
          }
        });

        this.excelItemsImportados.set(items);
        this.excelErroresImportacion.set(errores);
        this._mostrarToast(`Archivo '${file.name}' leído: ${items.length} registros oficiales listos y ${errores.length} observaciones.`);
      } catch (err) {
        console.error('Error al procesar archivo Excel:', err);
        this._mostrarToast('Error al leer el archivo Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  public procesarImportacionExcel(): void {
    const importados = this.excelItemsImportados();
    if (importados.length === 0) return;

    const reemplazables = this.rolesImportacionReemplazables();
    const protegidos = this.rolesImportacionProtegidos();
    if (this.reemplazarRolesPermitidos() && reemplazables.length > 0) {
      const confirmado = window.confirm(
        `Se eliminarán ${reemplazables.length} roles de examen coincidentes en estado PROGRAMADO o VALIDADO y luego se subirá el Excel. ` +
        `${protegidos.length} roles de examen en GENERADO o posterior se conservarán. ¿Deseas continuar?`
      );
      if (!confirmado) return;
    }

    this.cargando.set(true);
    const eliminar$ = this.reemplazarRolesPermitidos() && reemplazables.length > 0
      ? forkJoin(reemplazables.map(item => this._rolService.eliminar(item.id)))
      : of([]);

    eliminar$.pipe(
      switchMap(() => forkJoin(importados.map(item => this._rolService.crear(this._toRequest(item)).pipe(
        map(rol => ({ rol, error: null as unknown })),
        catchError(error => of({ rol: null as RolExamenResponse | null, error }))
      ))))
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

  public eliminarExamen(item: RolExamenItem): void {
    if (!this.puedeEditarEliminar(item)) {
      this._mostrarToast('Solo se pueden eliminar roles de examen en estado PROGRAMADO o VALIDADO.');
      return;
    }
    if (!window.confirm(`¿Deseas eliminar el examen ${item.codigo} del rol de examen oficial?`)) return;

    this._rolService.eliminar(item.id).subscribe({
      next: () => {
        this.examenes.update(items => items.filter(e => e.id !== item.id));
        this._mostrarToast(`Examen '${item.codigo}' eliminado de PostgreSQL.`);
      },
      error: err => this._mostrarToast(this._mensajeError(err, 'No se pudo eliminar el examen.'))
    });
  }

  public puedeEditarEliminar(item: RolExamenItem): boolean {
    return item.estado === 'PROGRAMADO' || item.estado === 'VALIDADO';
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
