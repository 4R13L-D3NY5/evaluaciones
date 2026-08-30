import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { 
  EvaluacionesDbService, 
  RolExamenPersistedItem, 
  MapeoEstudianteExamen 
} from '../../core/services/evaluaciones-db.service';
import { 
  EstudiantesGatewayService, 
  EstudianteInscrito 
} from '../../core/services/estudiantes-gateway.service';
import { BranchOffice, Career } from '../../core/models/unitepc-gateway.models';
import { 
  ExamenMacroGeneratorService, 
  VarianteCompilada,
  ReactivoExamen 
} from '../../core/services/examen-macro-generator.service';
import { GeneracionTypstService } from '../../core/services/generacion-typst.service';
import { BancoPreguntasService, BancoPreguntasResponse } from '../../core/services/banco-preguntas.service';
import {
  RolExamenService,
  RolExamenResponse
} from '../../core/services/rol-examen.service';
import { CartillasOmrService, LoteCartillasOmr } from '../../core/services/cartillas-omr.service';
import {
  GeneracionTypstRequest,
  GeneracionTypstResultado,
  GeneracionColaResponse
} from '../../core/models/generacion-typst.model';

function fechaIsoLocal(fecha: Date = new Date()): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export type EtapaEvaluacion = 'Programado' | 'Validado' | 'Generado' | 'Impreso' | 'Entregado' | 'Devuelto' | 'Revisado' | 'Subido' | 'Recibido';

export interface StepDef {
  key: EtapaEvaluacion;
  label: string;
  icon: string;
}

export interface EvaluacionItemUI extends RolExamenPersistedItem {
  etapa: EtapaEvaluacion;
  hora: string;
  duracionMinutos?: number;
  nombreArchivoExcel?: string;
  hashEncriptacion?: string;
  variantesGeneradas?: number;
  fueRestablecido?: boolean;
  estadoPrevioRestablecimiento?: EtapaEvaluacion;
  motivoRestablecimiento?: string;
  fechaRestablecimiento?: string;
  usuarioRestablecimiento?: string;
  bitacora?: {
    estado: string;
    fechaHora: string;
    usuario: string;
    detalle: string;
  }[];
}

/**
 * Componente: Lista de Evaluaciones con generación y archivos oficiales.
 * @author Ariel Camara / XpertiFlow
 */
@Component({
  selector: 'sea-evaluaciones-dia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Cabecera de Página -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 shadow-2xs">
              <i class="pi pi-clipboard text-xl"></i>
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tight text-foreground">Lista de Evaluaciones</h2>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Gestión y seguimiento de exámenes: 30 preguntas (7 fáciles, 16 medias y 7 difíciles) y exportación oficial.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="abrirSupervisionCola()"
            title="Supervisar cola de generación"
            aria-label="Supervisar cola de generación"
            class="h-10 w-10 rounded-xl bg-card border border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center justify-center shadow-xs transition-colors cursor-pointer">
            <i class="pi pi-list-check text-base"></i>
          </button>
          <button 
            (click)="abrirModalReporteDiario()"
            class="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer">
            <i class="pi pi-print"></i>
            <span>Imprimir Lista de Seguimiento (Diario)</span>
          </button>
        </div>
      </div>

      <!-- Barra de Filtros Superiores -->
      <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          
          <!-- Sede (SEA Gateway) -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-building text-primary text-[10px]"></i> Sede
            </label>
            <select 
              [ngModel]="sedeSeleccionada()?.code"
              (ngModelChange)="onSedeChange($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-2.5 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              @for (sede of sedes(); track sede.branchOfficeId) {
                <option [value]="sede.code">{{ sede.name }} ({{ sede.code }})</option>
              }
            </select>
          </div>

          <!-- Carrera (SEA Gateway) -->
          <div class="lg:col-span-2">
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-graduation-cap text-primary text-[10px]"></i> Carrera
            </label>
            <select 
              [ngModel]="carreraSeleccionada()?.careerCode"
              (ngModelChange)="onCarreraChange($event)"
              [disabled]="cargandoCarreras()"
              class="w-full bg-muted/70 border border-border rounded-xl px-2.5 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary disabled:opacity-50">
              @for (carrera of carreras(); track carrera.careerId) {
                <option [value]="carrera.careerCode">{{ carrera.careerName }} ({{ carrera.careerCode }})</option>
              }
            </select>
          </div>

          <!-- Parcial (Default: 1er Parcial) -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-bookmark text-primary text-[10px]"></i> Parcial
            </label>
            <select 
              [(ngModel)]="filtroParcial"
              class="w-full bg-muted/70 border border-border rounded-xl px-2.5 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              <option value="Todos">Todos los Parciales</option>
              <option value="1er Parcial">1er Parcial</option>
              <option value="2do Parcial">2do Parcial</option>
              <option value="Final">Examen Final</option>
              <option value="2da Instancia">2da Instancia</option>
            </select>
          </div>

          <!-- Modalidad (Presencial o Virtual) -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-desktop text-primary text-[10px]"></i> Modalidad
            </label>
            <select 
              [(ngModel)]="filtroModalidad"
              class="w-full bg-muted/70 border border-border rounded-xl px-2.5 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              <option value="Todos">Todas</option>
              <option value="Presencial">Presencial · Hoja externa</option>
              <option value="Virtual">Virtual Online</option>
            </select>
          </div>

          <!-- Fecha Inicio (Default: Hoy) -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-calendar text-primary text-[10px]"></i> Fecha Inicio
            </label>
            <input 
              type="date" 
              [(ngModel)]="filtroFechaInicio" 
              class="w-full bg-muted/70 border border-border rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-foreground outline-none focus:border-primary">
          </div>

          <!-- Fecha Fin (Default: Hoy) -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-calendar-plus text-primary text-[10px]"></i> Fecha Fin
            </label>
            <div class="flex items-center gap-1">
              <input 
                type="date" 
                [(ngModel)]="filtroFechaFin" 
                class="w-full bg-muted/70 border border-border rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-foreground outline-none focus:border-primary">
              <button 
                (click)="limpiarFiltros()" 
                title="Restablecer Filtros a Hoy"
                class="bg-muted hover:bg-border text-muted-foreground p-2 rounded-xl text-xs transition-colors shrink-0 cursor-pointer">
                <i class="pi pi-filter-slash"></i>
              </button>
            </div>
          </div>

        </div>

        <!-- Búsqueda General -->
        <div>
          <div class="relative">
            <input 
              type="text" 
              [(ngModel)]="busquedaTexto" 
              placeholder="Buscar evaluación por código, materia, docente o aula..."
              class="w-full bg-muted/70 border border-border rounded-xl pl-9 pr-8 py-2.5 text-xs font-medium text-foreground outline-none focus:border-primary shadow-2xs">
            <i class="pi pi-search absolute left-3 top-3 text-muted-foreground text-xs"></i>
            @if (busquedaTexto) {
              <button (click)="busquedaTexto = ''" class="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-xs cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            }
          </div>
        </div>

        <!-- Filtro de Etapa Actual -->
        <div class="pt-3 border-t border-border flex flex-wrap items-center gap-1.5">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mr-2">ETAPA ACTUAL:</span>
          
          <button 
            [class]="estadosSeleccionados().length === 0 ? 'bg-purple-700 text-white font-black shadow-2xs' : 'bg-muted text-foreground hover:bg-muted/80 font-bold'"
            (click)="seleccionarTodosLosEstados()"
            class="px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer">
            Todos
          </button>

          @for (etapa of listaEtapas; track etapa) {
            <button 
              [class]="isEstadoSeleccionado(etapa) ? 'bg-purple-700 text-white font-black shadow-2xs ring-2 ring-purple-300' : 'bg-muted text-foreground hover:bg-muted/80 font-bold'"
              (click)="toggleEstadoFiltro(etapa)"
              class="px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer">
              {{ etapa }}
            </button>
          }
        </div>

      </div>

      <!-- Tabla Principal de Evaluaciones -->
      <div class="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        
        @if (cargando()) {
          <div class="p-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
            <span class="text-xs font-bold">Consultando evaluaciones en la Base de Datos...</span>
          </div>
        } @else if (evaluacionesFiltradas().length === 0) {
          <div class="p-16 text-center space-y-3">
            <div class="h-16 w-16 rounded-2xl bg-muted text-muted-foreground/60 flex items-center justify-center mx-auto text-2xl border border-border">
              <i class="pi pi-inbox"></i>
            </div>
            <div class="max-w-md mx-auto space-y-1">
              <h3 class="text-sm font-black text-foreground">No hay evaluaciones para los filtros seleccionados</h3>
              <p class="text-xs text-muted-foreground">
                No se encontraron exámenes para el rango {{ filtroFechaInicio }} al {{ filtroFechaFin }} ({{ filtroParcial }}).
              </p>
            </div>
            <div class="pt-2">
              <button 
                (click)="mostrarTodasLasFechas()" 
                class="px-4 py-2 bg-muted hover:bg-border text-xs font-bold rounded-xl text-foreground inline-flex items-center gap-1.5 cursor-pointer">
                <i class="pi pi-calendar"></i>
                <span>Ver todas las fechas programadas</span>
              </button>
            </div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th class="p-3.5 min-w-[200px]">Materia / Grupo</th>
                  <th class="p-3.5">Docente Titular</th>
                  <th class="p-3.5 text-center">Parcial</th>
                  <th class="p-3.5">Fecha / Hora</th>
                  <th class="p-3.5 text-center">Modalidad</th>
                  <th class="p-3.5 text-center min-w-[310px]">Flujo de Estados</th>
                  <th class="p-3.5 text-center">Cartillas</th>
                  <th class="p-3.5 text-center">Documentos</th>
                  <th class="p-3.5 text-center min-w-[110px]">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (item of evaluacionesFiltradas(); track item.id) {
                  <tr class="hover:bg-muted/20 transition-colors">
                    
                    <!-- Materia / Grupo -->
                    <td class="p-3.5">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="bg-blue-100 text-blue-700 font-mono font-black text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                          {{ item.codigo }}
                        </span>
                        <span class="font-black text-foreground text-xs">{{ item.materia }}</span>
                      </div>
                      <div class="text-[10px] text-muted-foreground font-medium">
                        {{ carreraSeleccionada()?.careerName }} · Sem. {{ item.semestre }}° · <strong>{{ item.grupo }}</strong>
                      </div>
                    </td>

                    <!-- Docente -->
                    <td class="p-3.5">
                      <div class="font-bold text-foreground text-[11px]">{{ item.docenteNombre }}</div>
                      @if (item.docenteCI) {
                        <div class="text-[10px] font-mono text-muted-foreground">CI: {{ item.docenteCI }}</div>
                      }
                    </td>

                    <!-- Parcial -->
                    <td class="p-3.5 text-center">
                      <span class="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-2xs">
                        {{ item.tipo }}
                      </span>
                    </td>

                    <!-- Fecha / Hora -->
                    <td class="p-3.5">
                      <div class="flex items-center gap-1 font-bold text-foreground">
                        <i class="pi pi-calendar text-primary text-[10px]"></i>
                        <span>{{ item.fechaDisplay || item.fecha }}</span>
                      </div>
                      <div class="text-[10px] text-muted-foreground font-mono">
                        {{ item.horario }} · {{ item.aula }}
                      </div>
                    </td>

                    <!-- Modalidad -->
                    <td class="p-3.5 text-center">
                      @if (item.modalidad === 'VIRTUAL') {
                        <span class="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-desktop text-[9px]"></i> Virtual Online
                        </span>
                      } @else if (item.modalidad === 'PRESENCIAL_SIN_CARTILLA' || !item.modalidad) {
                        <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-file-edit text-[9px]"></i> Presencial · Hoja externa
                        </span>
                      } @else if (item.conCartilla) {
                        <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-file-edit text-[9px]"></i> Presencial · Hoja externa
                        </span>
                      }
                    </td>

                    <!-- Flujo de Estados -->
                    <td class="p-3.5 text-center">
                      <div class="inline-flex items-center gap-1 bg-muted/50 p-1.5 rounded-xl border border-border shadow-2xs">
                        @for (st of getPasosFlujo(item); track st.key) {
                          <div class="relative group/tooltip">
                            <button 
                              [class]="getPasoBotonClass(item, st.key)"
                              (click)="clickPasoEstado(item, st.key)"
                              class="h-7 w-7 rounded-lg transition-all flex items-center justify-center cursor-pointer">
                              <i [class]="getPasoIcon(item, st)" class="text-xs"></i>
                            </button>

                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none animate-fade-in">
                              <div class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap text-center">
                                <div class="font-extrabold text-amber-300">{{ st.label }}</div>
                                <div class="text-[9px] text-slate-300">{{ getPasoTooltip(item, st) }}</div>
                              </div>
                              <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                            </div>
                          </div>
                        }
                      </div>
                    </td>

                    <td class="p-3.5 text-center">
                      <div class="relative inline-flex group/cartillas">
                        <button
                          (click)="abrirGestionCartillas(item)"
                          [disabled]="!puedeGestionarCartillas(item)"
                          title="Gestionar cartillas OMR"
                          aria-label="Gestionar cartillas OMR"
                          class="h-7 w-7 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35">
                          <i class="pi pi-id-card text-xs"></i>
                        </button>
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cartillas:flex flex-col items-center z-50 pointer-events-none">
                          <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">Sobreimpresión de datos OMR</span>
                          <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                        </div>
                      </div>
                    </td>

                    <!-- Documento oficial -->
                    <td class="p-3.5 text-center">
                      @if (puedeMostrarDocumento(item)) {
                        <div class="relative inline-flex group/documento">
                          <button
                            (click)="abrirPdfExamen(item)"
                            title="Abrir examen PDF"
                            aria-label="Abrir examen PDF"
                            class="h-7 w-7 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center justify-center transition-colors cursor-pointer">
                            <i class="pi pi-file-pdf text-xs"></i>
                          </button>
                          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/documento:flex flex-col items-center z-50 pointer-events-none">
                            <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                              Examen PDF oficial
                            </span>
                            <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                          </div>
                        </div>
                      } @else {
                        <span class="text-muted-foreground/50">—</span>
                      }
                    </td>

                    <!-- Acciones -->
                    <td class="p-3.5 text-center">
                      <div class="inline-flex items-center gap-1.5">
                        
                        <!-- 1. Bitácora -->
                        <div class="relative group/bitacora">
                          <button 
                            (click)="abrirBitacora(item)"
                            class="h-7 w-7 rounded-lg bg-muted hover:bg-border text-foreground border border-border flex items-center justify-center cursor-pointer transition-colors">
                            <i class="pi pi-history text-xs"></i>
                          </button>
                          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bitacora:flex flex-col items-center z-50 pointer-events-none">
                            <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                              Bitácora de Trazabilidad
                            </span>
                            <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                          </div>
                        </div>

                        <!-- 2. Botón Restablecer a Validado -->
                        @if (puedeRestablecer(item)) {
                          <div class="relative group/reestablecer">
                            <button 
                              (click)="solicitarReestablecimiento(item)"
                              class="h-7 w-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center cursor-pointer transition-colors shadow-2xs">
                              <i class="pi pi-refresh text-xs"></i>
                            </button>
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/reestablecer:flex flex-col items-center z-50 pointer-events-none">
                              <span class="bg-rose-950 text-rose-100 text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                                Restablecer a Validado (Obliga Motivo)
                              </span>
                              <div class="w-2 h-2 bg-rose-950 rotate-45 -mt-1"></div>
                            </div>
                          </div>
                        }

                      </div>
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Barra Inferior de Resumen -->
          <div class="p-3.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span>Total evaluaciones filtradas: {{ evaluacionesFiltradas().length }}</span>
            <span class="font-mono text-primary">Sincronizado con SEA · Gestión 2-2026</span>
          </div>
        }
      </div>

      <!-- MODAL 1: MODAL DE VALIDACIÓN Y ENCRIPTACIÓN DOCENTE -->
      @if (evaluacionSeleccionadaParaValidar()) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            
            <div class="flex items-start justify-between border-b border-border pb-3">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                  <i class="pi pi-shield text-base"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">Validación de Banco por Docente</h3>
                  <p class="text-xs text-muted-foreground">
                    [{{ evaluacionSeleccionadaParaValidar()?.codigo }}] {{ evaluacionSeleccionadaParaValidar()?.materia }}
                  </p>
                </div>
              </div>

              <button (click)="cerrarModalValidar()" class="text-muted-foreground hover:text-foreground text-sm cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div class="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1.5 text-purple-950 dark:text-purple-200">
                <div class="font-bold flex items-center gap-1.5">
                  <i class="pi pi-info-circle text-purple-600"></i>
                  <span>Aprobación y Cifrado de Banco</span>
                </div>
                <p class="text-[11px] leading-relaxed">
                  El estado <strong>Validado</strong> se activa oficialmente cuando el docente aprueba y encripta el banco desde el menú <strong>Banco de Preguntas</strong>. También puedes confirmar la validación del banco Excel oficial directamente:
                </p>
              </div>

              <div class="p-3 bg-muted/40 border border-border rounded-xl space-y-1.5 font-mono text-[10px]">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Archivo Banco:</span>
                  <span class="font-bold text-foreground">BANCO_{{ evaluacionSeleccionadaParaValidar()?.codigo }}_FINAL.xlsx</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Total Reactivos:</span>
                  <span class="font-bold text-emerald-600">30 Preguntas Verificadas con 5 Opciones (OK)</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Cifrado de Seguridad:</span>
                  <span class="font-bold text-purple-700">AES-256 / SHA-256</span>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-border">
              <button (click)="cerrarModalValidar()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">
                Cancelar
              </button>

              <button 
                (click)="confirmarValidacionDocente()" 
                class="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5">
                <i class="pi pi-shield"></i>
                <span>Confirmar y Pasar a 'Validado'</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- MODAL 2: PARAMETRIZACIÓN CON ESTUDIANTES Y GENERACIÓN PDF -->
      @if (evaluacionSeleccionadaParaParametrizar()) {
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-scale-in my-4 space-y-4 p-6">
            
            <!-- Cabecera -->
            <div class="flex items-start justify-between border-b border-border pb-3">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg border border-purple-200">
                  <i class="pi pi-sliders-h"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">Parámetros y generación del examen PDF</h3>
                  <p class="text-xs text-muted-foreground">
                    [{{ evaluacionSeleccionadaParaParametrizar()?.codigo }}] {{ evaluacionSeleccionadaParaParametrizar()?.materia }} · Grupo {{ evaluacionSeleccionadaParaParametrizar()?.grupo }}
                  </p>
                </div>
              </div>

              <button (click)="cerrarModalParametrizacion()" class="text-muted-foreground hover:text-foreground text-sm cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="space-y-4 text-xs">
              
              <!-- 1. PARÁMETROS OFICIALES DE DIAGRAMACIÓN -->
              <div class="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                <div class="flex items-center justify-between text-foreground font-black text-xs border-b border-border pb-2">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-palette text-primary"></i>
                    <span>Parámetros de Diagramación</span>
                  </div>
                  <span class="text-[10px] font-mono text-purple-700 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200">
                    30 Preguntas (7 Fáciles, 16 Medias, 7 Difíciles)
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  
                  <!-- Formato de Hoja -->
                  <div>
                    <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                      Formato Hoja
                    </label>
                    <div class="w-full bg-card border border-border rounded-lg p-2 font-bold text-xs">Oficio (Folio UNITEPC)</div>
                  </div>

                  <!-- Tipo de Letra (Font Family) -->
                  <div>
                    <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                      Tipo de Letra (Fuente)
                    </label>
                    <div class="w-full bg-card border border-border rounded-lg p-2 font-bold text-xs">Times New Roman</div>
                  </div>

                  <!-- Tamaño de Fuente -->
                  <div>
                    <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                      Tamaño de Letra
                    </label>
                    <div class="w-full bg-card border border-border rounded-lg p-2 font-bold text-xs">11.0 pt (Grande)</div>
                  </div>

                  <!-- Espaciado / Interlineado -->
                  <div>
                    <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                      Espaciado (Leading)
                    </label>
                    <div class="w-full bg-card border border-border rounded-lg p-2 font-bold text-xs">1.0em (línea) · 1.5em (pregunta)</div>
                  </div>

                </div>
              </div>

              <!-- 2. NÓMINA DE ESTUDIANTES INSCRITOS -->
              <div class="p-4 bg-card border border-border rounded-xl space-y-3 shadow-2xs">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                  <div class="flex items-center gap-2 text-foreground font-black text-xs">
                    <i class="pi pi-users text-primary"></i>
                    <span>Nómina de Estudiantes Inscritos ({{ estudiantesInscritos().length }} Alumnos)</span>
                  </div>
                  <span class="text-[10px] font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
                    Ratio: {{ ratioEstudiantesPorVariante() }} alumnos / variante
                  </span>
                </div>

                <!-- Lista de Estudiantes (Solo Código + Nombres + Apellidos) -->
                <div class="bg-muted/30 border border-border rounded-xl p-3 max-h-40 overflow-y-auto space-y-1 text-[11px]">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    @for (est of estudiantesInscritos(); track est.codigo; let idx = $index) {
                      <div class="flex items-center gap-2 p-1.5 bg-card rounded-lg border border-border/80 truncate">
                        <span class="font-mono font-bold text-primary text-[10px] shrink-0">[{{ est.codigo }}]</span>
                        <span class="font-bold text-foreground truncate uppercase">
                          {{ est.nombres }} {{ est.apellido1 }} {{ est.apellido2 }}
                        </span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Banner informativo: configuración vigente -->
                <div class="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-[11px] text-indigo-950">
                  <div class="flex items-center gap-2 font-bold">
                    <i class="pi pi-file-edit text-indigo-700"></i>
                    <span>30 preguntas · 7 fáciles, 16 medias y 7 difíciles · hoja de respuestas externa</span>
                  </div>
                  <span class="text-[10px] font-mono text-indigo-800 font-black">Oficio · Times New Roman 11 pt</span>
                </div>
              </div>

            </div>

            <!-- Botones -->
            <div class="flex justify-end gap-2 pt-3 border-t border-border">
              <button 
                (click)="cerrarModalParametrizacion()" 
                class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">
                Cancelar
              </button>

              <button 
                (click)="ejecutarGeneracionVariantes()" 
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-102">
                <i class="pi pi-bolt"></i>
                <span>Generar examen PDF (30 preguntas A-E)</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- MODAL 3: GENERACIÓN ASÍNCRONA -->
      @if (dialogQueueWorker()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-scale-in space-y-4">
            
            <div class="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-4 flex items-center justify-between border-b border-purple-900">
              <div class="flex items-center gap-2.5">
                <i class="pi pi-spin pi-cog text-purple-400 text-lg"></i>
                <h3 class="text-sm font-black">Generación de examen #{{ queueJobId }}</h3>
              </div>
              <span class="text-[10px] font-mono bg-purple-900/60 px-2 py-0.5 rounded text-purple-300 border border-purple-500/30">
                COLA DE GENERACIÓN · ALTA PRIORIDAD
              </span>
            </div>

            <div class="p-5 space-y-4 text-xs">
              <div class="space-y-1.5">
                <div class="flex justify-between font-bold text-[11px] text-foreground">
                  <span>{{ queuePasoActual() }}</span>
                  <span class="font-mono text-purple-700 dark:text-purple-400 font-black">{{ queueProgress() }}%</span>
                </div>
                <div class="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full" [style.width.%]="queueProgress()"></div>
                </div>
              </div>

              <div class="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-[10px] h-40 overflow-y-auto space-y-1 border border-slate-800 shadow-inner">
                @for (log of queueLogs(); track log) {
                  <div>{{ log }}</div>
                }
              </div>
            </div>

            <div class="bg-muted/40 border-t border-border p-4 flex justify-end gap-2">
              <span class="text-[11px] font-bold text-muted-foreground">El PDF estará disponible en Documentos al completar la generación.</span>
            </div>

          </div>
        </div>
      }

      <!-- MODAL: SUPERVISIÓN DE COLA DE GENERACIÓN -->
      @if (dialogSupervisionCola()) {
        <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-scale-in">
            <div class="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-4 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <i class="pi pi-list-check text-purple-300"></i>
                </div>
                <div>
                <h3 class="text-sm font-black">Supervisión de cola de generación</h3>
                  <p class="text-[10px] text-white/70">Tareas conocidas por el backend y mensajes pendientes en RabbitMQ</p>
                </div>
              </div>
              <button (click)="cerrarSupervisionCola()" aria-label="Cerrar supervisión de cola" title="Cerrar" class="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-xs font-bold text-foreground">
                  <i class="pi pi-inbox text-purple-700"></i>
                  <span>Mensajes pendientes en broker:</span>
                  @if (colaGeneracion()?.mensajesPendientes === -1) {
                    <span class="text-amber-600">No disponible</span>
                  } @else {
                    <span class="text-purple-700 font-black">{{ colaGeneracion()?.mensajesPendientes ?? 0 }}</span>
                  }
                </div>
                <button (click)="refrescarCola()" [disabled]="cargandoCola()" title="Actualizar cola" aria-label="Actualizar cola" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-purple-700 hover:bg-purple-50 flex items-center justify-center cursor-pointer disabled:opacity-50">
                  <i class="pi pi-refresh" [class.pi-spin]="cargandoCola()"></i>
                </button>
              </div>

              @if (errorCola()) {
                <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>{{ errorCola() }}</span>
                </div>
              } @else if (cargandoCola() && !colaGeneracion()) {
                <div class="py-10 text-center text-xs text-muted-foreground">
                  <i class="pi pi-spin pi-spinner text-purple-700 text-xl"></i>
                  <p class="mt-2 font-bold">Consultando tareas...</p>
                </div>
              } @else if ((colaGeneracion()?.tareas?.length ?? 0) === 0) {
                <div class="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  <i class="pi pi-check-circle text-emerald-600 text-xl"></i>
                  <p class="mt-2 font-bold">No hay tareas registradas en la cola del backend.</p>
                </div>
              } @else {
                <div class="border border-border rounded-xl overflow-hidden">
                  <div class="grid grid-cols-[1.5fr_1fr_0.8fr_2fr] gap-3 bg-muted/60 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <span>Job</span><span>Rol</span><span>Estado</span><span>Detalle</span>
                  </div>
                  <div class="max-h-72 overflow-y-auto divide-y divide-border">
                    @for (tarea of colaGeneracion()?.tareas ?? []; track tarea.jobId) {
                      <div class="grid grid-cols-[1.5fr_1fr_0.8fr_2fr] gap-3 px-3 py-2.5 items-center text-[11px]">
                        <span class="font-mono text-purple-700 truncate" [title]="tarea.jobId">{{ tarea.jobId }}</span>
                        <span class="font-mono text-foreground truncate" [title]="tarea.rolExamenId">{{ tarea.rolExamenId }}</span>
                        <span [class]="tarea.estado === 'ERROR' || tarea.estado === 'ERROR_PERSISTENCIA' ? 'bg-rose-50 text-rose-700 border-rose-200' : tarea.estado === 'COMPLETADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'" class="border rounded-full px-2 py-0.5 text-[9px] font-black uppercase text-center">
                          {{ tarea.estado }}
                        </span>
                        <span class="text-muted-foreground truncate" [title]="tarea.mensaje">{{ tarea.mensaje }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="bg-muted/40 border-t border-border p-4 flex justify-end">
              <button (click)="cerrarSupervisionCola()" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black cursor-pointer">Cerrar</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 4: VISOR OFICIAL DE EXAMEN PERSONALIZADO -->
      @if (dialogVisorExamen()) {
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden animate-scale-in my-4 max-h-[96vh] flex flex-col">
            
            <!-- Cabecera Visor -->
            <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 text-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0 print:hidden">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center font-black text-white text-sm">
                  <i class="pi pi-file-pdf"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black tracking-tight leading-tight">
                    [{{ evaluacionActivaVisor()?.codigo }}] {{ evaluacionActivaVisor()?.materia }}
                  </h3>
                  <div class="flex items-center gap-2 text-[11px] text-white/80 font-medium mt-0.5">
                    <span>Grupo: {{ evaluacionActivaVisor()?.grupo }}</span>
                    <span>·</span>
                    <span class="font-bold text-amber-300">{{ evaluacionActivaVisor()?.tipo }}</span>
                    <span>·</span>
                <span>30 Preguntas (5 Opciones A-E)</span>
                    <span>·</span>
                    <span class="font-mono text-purple-200">PDF oficial</span>
                  </div>
                </div>
              </div>

              <!-- Pestañas del Visor -->
              <div class="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                <button 
                  (click)="tabVisorActiva.set('examen')"
                  [class]="tabVisorActiva() === 'examen' ? 'bg-purple-700 text-white font-black shadow-xs' : 'text-white/70 hover:text-white'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <i class="pi pi-book"></i>
                    <span>Cuadernillo de examen</span>
                </button>

                <button 
                  (click)="tabVisorActiva.set('patron')"
                  [class]="tabVisorActiva() === 'patron' ? 'bg-purple-700 text-white font-black shadow-xs' : 'text-white/70 hover:text-white'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <i class="pi pi-check-square"></i>
                  <span>Patrón oficial</span>
                </button>
              </div>

              <!-- Acciones heredadas del visor; el flujo actual abre únicamente el PDF generado. -->
              <div class="flex items-center gap-2">
                <!-- Botón 1: Abrir PDF oficial -->
                <button 
                  (click)="abrirPdfTypstOficial()"
                  class="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-transform hover:scale-102 cursor-pointer">
                  <i class="pi pi-file-pdf"></i>
                  <span>Abrir PDF oficial</span>
                </button>

                <!-- Botón 2: Imprimir Ventana Limpia -->
                <button 
                  (click)="imprimirVentanaLimpia()"
                  class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-transform hover:scale-102 cursor-pointer">
                  <i class="pi pi-print"></i>
                  <span>Imprimir Cuadernillo</span>
                </button>

                <button 
                  (click)="cerrarVisorExamen()" 
                  class="text-white/80 hover:text-white p-2 text-base cursor-pointer">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>

            <!-- Selector de Estudiante & Controles Tipográficos en Vivo -->
            <div class="bg-muted/60 border-b border-border px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-foreground uppercase tracking-wider">
                  Estudiante:
                </span>
                <select 
                  [ngModel]="estudianteSeleccionadoIdx()"
                  (ngModelChange)="estudianteSeleccionadoIdx.set($event); modoUnificado.set(false)"
                  class="bg-card border border-border text-foreground font-bold text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-primary">
                  @for (est of estudiantesInscritos(); track est.codigo; let idx = $index) {
                    <option [value]="idx">
                      [{{ est.codigo }}] {{ est.nombres }} {{ est.apellido1 }} {{ est.apellido2 }}
                    </option>
                  }
                </select>

                <button 
                  (click)="abrirCuadernilloMasterTypst()"
                  class="bg-indigo-700 hover:bg-indigo-800 text-white font-black px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ml-2 shadow-xs">
                  <i class="pi pi-print"></i>
                  <span>Cuadernillo Master de Impresión (Todos los Estudiantes)</span>
                </button>
              </div>

              <!-- Archivos Oficiales en Carpeta Bases -->
              <div class="flex items-center gap-2 text-xs font-bold">
                <button 
                  (click)="abrirPatronPdfTypst()"
                  class="bg-card border border-border hover:bg-muted px-2.5 py-1 rounded-lg text-foreground flex items-center gap-1 text-[11px]">
                  <i class="pi pi-check text-emerald-600"></i>
                  <span>Patrón PDF</span>
                </button>

                <button 
                  (click)="descargarRemarkExcelOficial()"
                  class="bg-card border border-border hover:bg-muted px-2.5 py-1 rounded-lg text-foreground flex items-center gap-1 text-[11px]">
                  <i class="pi pi-file-excel text-emerald-600"></i>
                  <span>Remark Excel</span>
                </button>
              </div>
            </div>

            <!-- Contenido del Visor de Examen -->
            <div id="area-impresion-examen" class="p-6 overflow-y-auto max-h-[72vh] space-y-6 bg-muted/20 print:p-0 print:bg-white print:overflow-visible print:max-h-none">
              
              <!-- 1. VISTA DEL CUADERNILLO PERSONALIZADO -->
              @if (tabVisorActiva() === 'examen') {
                @for (estudianteItem of (modoUnificado() ? estudiantesInscritos() : [getEstudianteActivo()]); track estudianteItem?.codigo; let i = $index) {
                  @if (estudianteItem) {
                    @let varComp = getVarianteParaEstudiante(estudianteItem);
                    
                    <div 
                      [style.font-family]="paramTipoFuente"
                      [style.font-size.pt]="paramTamanoFuente"
                      [style.line-height]="paramEspaciado"
                      class="max-w-4xl mx-auto bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-300 mb-8 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
                      
                      <!-- ========================================== -->
                      <!-- PÁGINA 1: CABECERA + DATOS + CUESTIONARIO -->
                      <!-- ========================================== -->
                      <div class="space-y-3 min-h-[920px] print:min-h-[1020px] print:break-after-page mb-8 pb-4 border-b-2 border-slate-300 print:border-none">
                        
                        <!-- 1. Cabecera Oficial UNITEPC -->
                        <div class="border-2 border-slate-900 text-xs">
                          <div class="grid grid-cols-12">
                            <div class="col-span-3 border-r-2 border-slate-900 p-2 flex flex-col items-center justify-center bg-slate-50">
                              <div class="flex items-center gap-1.5 font-black text-purple-950 text-sm">
                                <span class="text-amber-500 text-lg">▲</span>
                                <span>UNITEPC</span>
                              </div>
                              <span class="text-[7.5px] font-bold text-slate-500 uppercase tracking-tighter">Universidad Privada</span>
                            </div>
                            <div class="col-span-9 p-2 text-center flex flex-col justify-center">
                              <h1 class="font-black uppercase text-slate-950 tracking-wide text-xs">
                                UNIVERSIDAD TÉCNICA PRIVADA COSMOS
                              </h1>
                              <p class="font-bold text-slate-700 uppercase text-[10px] mt-0.5">
                                GESTIÓN 2-2026
                              </p>
                              <div class="w-full border-t border-slate-900 my-1"></div>
                              <h2 class="font-black uppercase text-purple-950 text-[11px]">
                                EVALUACIÓN TEÓRICA {{ evaluacionActivaVisor()?.tipo | uppercase }}
                              </h2>
                            </div>
                          </div>
                        </div>

                        <!-- 2. Ficha de Datos del Estudiante -->
                        <div class="border border-slate-900 text-[10px] font-sans">
                          <div class="grid grid-cols-12 border-b border-slate-900 p-1.5 font-bold">
                            <div class="col-span-7 border-r border-slate-900">
                              <span class="text-slate-600 font-normal">NOMBRE:</span> 
                              <span class="text-slate-950 font-black ml-1 uppercase">
                                {{ estudianteItem.nombres }} {{ estudianteItem.apellido1 }} {{ estudianteItem.apellido2 }}
                              </span>
                            </div>
                            <div class="col-span-5 pl-2">
                              <span class="text-slate-600 font-normal">CARRERA:</span> 
                              <span class="text-slate-950 font-black ml-1 uppercase">AUDITORÍA / CONTADURÍA</span>
                            </div>
                          </div>

                          <div class="grid grid-cols-12 border-b border-slate-900 p-1.5 font-bold">
                            <div class="col-span-7 border-r border-slate-900">
                              <span class="text-slate-600 font-normal">MATERIA:</span> 
                              <span class="text-slate-950 ml-1">[{{ evaluacionActivaVisor()?.codigo }}] {{ evaluacionActivaVisor()?.materia }}</span>
                            </div>
                            <div class="col-span-5 pl-2 flex justify-between">
                              <div><span class="text-slate-600 font-normal">GRUPO:</span> <span class="text-slate-950 ml-1 font-mono">{{ evaluacionActivaVisor()?.grupo }}</span></div>
                              <div><span class="text-slate-600 font-normal">SEMESTRE:</span> <span class="text-slate-950 ml-1">3</span></div>
                            </div>
                          </div>

                          <div class="grid grid-cols-12 border-b border-slate-900 p-1.5 font-bold">
                            <div class="col-span-7 border-r border-slate-900">
                              <span class="text-slate-600 font-normal">DOCENTE:</span> 
                              <span class="text-slate-950 ml-1">{{ evaluacionActivaVisor()?.docenteNombre }}</span>
                            </div>
                            <div class="col-span-5 pl-2">
                              <span class="text-slate-600 font-normal">EXAMEN:</span> 
                              <span class="text-purple-900 font-black ml-1 uppercase">{{ evaluacionActivaVisor()?.tipo }}</span>
                            </div>
                          </div>

                          <div class="grid grid-cols-12 border-b border-slate-900 p-1.5 font-bold">
                            <div class="col-span-7 border-r border-slate-900">
                              <span class="text-slate-600 font-normal">FECHA:</span> 
                              <span class="text-slate-950 ml-1">{{ evaluacionActivaVisor()?.fechaDisplay || evaluacionActivaVisor()?.fecha }}</span>
                            </div>
                            <div class="col-span-5 pl-2">
                              <span class="text-slate-600 font-normal">HORA:</span> 
                              <span class="text-slate-950 ml-1 font-mono">08:15:00 - 09:45:00</span>
                            </div>
                          </div>

                          <div class="grid grid-cols-12 p-1.5 font-bold">
                            <div class="col-span-7 border-r border-slate-900 flex items-end">
                              <span class="text-slate-600 font-normal">FIRMA DEL ESTUDIANTE:</span>
                              <div class="flex-1 border-b border-dotted border-slate-500 ml-2 mb-1"></div>
                            </div>
                            <div class="col-span-5 pl-2 text-center">
                              <div class="text-[8px] text-slate-500 font-bold uppercase">CÓDIGO:</div>
                              <div class="text-sm font-black font-mono text-slate-950">{{ estudianteItem.codigo }}</div>
                            </div>
                          </div>
                        </div>

                        <!-- La hoja de respuestas se entrega por separado en el formato institucional preimpreso. -->
                        <div class="p-3 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-950 leading-tight font-sans">
                          <strong>HOJA DE RESPUESTAS:</strong> Este cuadernillo no incluye una hoja de respuestas. Las respuestas se registran en la hoja individual institucional entregada por separado.
                        </div>

                      </div>

                      <!-- ========================================== -->
                      <!-- PÁGINA 2 EN ADELANTE: CUESTIONARIO OFICIAL (30 REACTIVOS: 7F + 16M + 7D) -->
                      <!-- ========================================== -->
                      <div class="space-y-5 pt-2">
                        
                        <!-- Encabezado de Página 2 -->
                        <div class="flex items-center justify-between text-xs text-slate-500 border-b border-slate-300 pb-1">
                          <span class="font-black uppercase text-slate-700">
                            {{ estudianteItem.nombres }} {{ estudianteItem.apellido1 }} {{ estudianteItem.apellido2 }} · {{ estudianteItem.codigo }}
                          </span>
                          <span class="font-mono">Pág. 1</span>
                        </div>

                        <div class="text-center space-y-1 pt-2">
                          <h2 class="text-sm font-black uppercase text-slate-950 tracking-wide">
                            CUESTIONARIO DE PREGUNTAS (30 REACTIVOS)
                          </h2>
                          <hr class="border-t-2 border-slate-900 mt-2" />
                        </div>

                        <!-- Cuestionario de 30 Reactivos -->
                        <div class="space-y-4">
                          <div>
                            <h3 class="font-black text-xs uppercase text-slate-950">SELECCIÓN DE LA MEJOR RESPUESTA (Preguntas 1 a 30)</h3>
                            <p class="text-[11px] italic text-slate-600">Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.</p>
                          </div>

                          <div class="space-y-3">
                            @for (preg of varComp.todasLasPreguntas.slice(0, 30); track preg.numero) {
                              <div class="space-y-1 p-2 bg-slate-50/50 rounded border border-slate-100">
                                <div class="font-bold text-slate-950 text-xs leading-snug">
                                  {{ preg.numero }}. {{ preg.enunciado }}
                                </div>
                                <div class="space-y-0.5 text-slate-800 text-[11px] pl-4">
                                  @for (op of preg.opciones; track op.letra) {
                                    <div class="leading-tight">
                                      <strong>{{ op.letra }})</strong> {{ op.texto }}
                                    </div>
                                  }
                                </div>
                              </div>
                            }
                          </div>
                        </div>

                        <div class="mt-8 p-3 border-2 border-dashed border-slate-400 rounded-lg text-center bg-slate-50 space-y-1">
                          <div class="font-black text-xs uppercase text-slate-900">
                            *** FIN DE LA EVALUACIÓN OFICIAL (30 PREGUNTAS) ***
                          </div>
                          <p class="text-[10px] text-slate-600">
                            Verifique que todas sus 30 respuestas se encuentren registradas en la <strong>hoja individual de respuestas</strong> entregada por separado.
                          </p>
                        </div>
                      </div>

                    </div>
                  }
                }
              }

              <!-- 2. VISTA PATRÓN OFICIAL DE CLAVES -->
              @if (tabVisorActiva() === 'patron') {
                @for (patronItem of variantesCompiladas(); track patronItem?.tipo) {
                  <div class="max-w-4xl mx-auto bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-300 font-sans mb-8">
                    <div class="flex items-center justify-between border-b-4 border-purple-900 pb-2 mb-3">
                      <div>
                        <h1 class="text-sm font-black uppercase text-purple-950">UNIVERSIDAD TÉCNICA PRIVADA COSMOS</h1>
                        <h2 class="text-xs font-bold text-slate-800">PATRÓN OFICIAL DE RESPUESTAS (30 PREGUNTAS) · {{ evaluacionActivaVisor()?.tipo }}</h2>
                      </div>
                    </div>

                    <div class="grid grid-cols-12 gap-3 border-b-2 border-slate-800 pb-3 mb-4 text-xs font-bold">
                      <div class="col-span-6 space-y-0.5">
                        <div>Materia: {{ evaluacionActivaVisor()?.materia }}</div>
                        <div>Docente: {{ evaluacionActivaVisor()?.docenteNombre }}</div>
                        <div>Grupo: {{ evaluacionActivaVisor()?.grupo }} · Fecha: {{ evaluacionActivaVisor()?.fechaDisplay || evaluacionActivaVisor()?.fecha }}</div>
                      </div>
                      <div class="col-span-3 border-2 border-slate-800 rounded-lg p-2 text-center h-20 flex flex-col justify-between">
                        <span class="text-[8px] uppercase font-bold text-slate-600">FIRMA DOCENTE</span>
                        <span class="text-[8px] border-t border-dashed border-slate-400">Firma Titular</span>
                      </div>
                      <div class="col-span-3 border-2 border-slate-800 rounded-lg p-2 text-center h-20 flex flex-col justify-between">
                        <span class="text-[8px] uppercase font-bold text-slate-600">SELLO DE CARRERA</span>
                        <span class="text-[8px] border-t border-dashed border-slate-400">Sello Jefatura</span>
                      </div>
                    </div>

                    <!-- 60 Claves Oficiales -->
                    <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono">
                      @for (n of getNumerosRango(1, 60); track n) {
                        <div class="flex items-center justify-between border-b border-slate-200 py-1 px-2 bg-white rounded">
                          <span class="font-bold text-slate-700">{{ n }}.</span>
                          <span class="font-black text-purple-900 bg-purple-100 px-1.5 py-0.2 rounded">
                            {{ patronItem.patronClaves[n] || 'A' }}
                          </span>
                        </div>
                      }
                    </div>

                    <div class="mt-4 flex justify-end gap-2">
                      <button 
                        (click)="abrirPatronPdfTypst()"
                        class="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs">
                        <i class="pi pi-file-pdf"></i>
                        <span>Abrir patrón PDF oficial</span>
                      </button>
                      
                      <button 
                        (click)="descargarRemarkExcelOficial()"
                        class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs">
                        <i class="pi pi-file-excel"></i>
                        <span>Exportar Remark Excel (.xlsx)</span>
                      </button>
                    </div>
                  </div>
                }
              }

            </div>

            <!-- Footer Visor -->
            <div class="bg-muted/60 border-t border-border p-3 flex items-center justify-between shrink-0 print:hidden">
              <span class="text-xs font-mono text-muted-foreground">
                Documentos Oficiales alojados en bases/ · CPEC18_Cochabamba_TA-01_1erParcial
              </span>
              <div class="flex items-center gap-2">
                <button 
                  (click)="abrirPdfTypstOficial()"
                  class="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <i class="pi pi-file-pdf"></i>
                  <span>Abrir PDF oficial</span>
                </button>
                <button 
                  (click)="imprimirVentanaLimpia()"
                  class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <i class="pi pi-print"></i>
                  <span>Imprimir</span>
                </button>
                <button 
                  (click)="cerrarVisorExamen()"
                  class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer">
                  Cerrar Visor
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- MODAL 5: REESTABLECIMIENTO -->
      @if (evaluacionSeleccionadaParaReestablecer()) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div class="flex items-start justify-between border-b border-border pb-3">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                  <i class="pi pi-refresh text-base"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">Restablecer Evaluación a 'Validado'</h3>
                  <p class="text-xs text-muted-foreground">[{{ evaluacionSeleccionadaParaReestablecer()?.codigo }}] {{ evaluacionSeleccionadaParaReestablecer()?.materia }}</p>
                </div>
              </div>
              <button (click)="cancelarReestablecimiento()" class="text-muted-foreground hover:text-foreground text-sm cursor-pointer"><i class="pi pi-times"></i></button>
            </div>

            <div class="space-y-3 text-xs">
              <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Motivo del Reestablecimiento *</label>
              <textarea [(ngModel)]="motivoReestablecimiento" rows="3" placeholder="Especifique el motivo..." class="w-full bg-muted border border-border rounded-xl p-3 text-xs font-medium text-foreground outline-none"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-border">
              <button (click)="cancelarReestablecimiento()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cancelar</button>
              <button [disabled]="!motivoReestablecimiento.trim() || restableciendo()" (click)="confirmarReestablecimiento()" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs disabled:opacity-50 cursor-pointer">{{ restableciendo() ? 'Restableciendo...' : 'Confirmar Restablecimiento a Validado' }}</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 6: BITÁCORA -->
      @if (evaluacionSeleccionadaParaBitacora()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div class="flex items-start justify-between border-b border-border pb-3">
              <h3 class="text-sm font-black text-foreground">Bitácora de Trazabilidad</h3>
              <button (click)="cerrarBitacora()" class="text-muted-foreground hover:text-foreground text-sm cursor-pointer"><i class="pi pi-times"></i></button>
            </div>
            <div class="p-3 bg-muted/40 rounded-xl text-xs">
              <div class="font-bold text-foreground">{{ evaluacionSeleccionadaParaBitacora()?.estado }}</div>
              <div class="text-[10px] text-muted-foreground font-mono">{{ evaluacionSeleccionadaParaBitacora()?.fechaDisplay || evaluacionSeleccionadaParaBitacora()?.fecha }}</div>
            </div>
            <div class="flex justify-end pt-2 border-t border-border">
              <button (click)="cerrarBitacora()" class="px-4 py-2 rounded-xl bg-muted hover:bg-border text-xs font-bold text-foreground cursor-pointer">Cerrar</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 8: REPORTE DIARIO DE SEGUIMIENTO (SEA-DOC-04) -->
      @if (dialogReporteDiario()) {
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden animate-scale-in my-4 max-h-[96vh] flex flex-col">
            <div class="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0">
              <h3 class="text-sm font-black">Planilla Oficial de Control de Entrega y Recepción (Diario)</h3>
              <div class="flex items-center gap-2">
                <button (click)="imprimirVentanaLimpia()" class="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer">
                  <i class="pi pi-print"></i>
                  <span>Imprimir Planilla</span>
                </button>
                <button (click)="cerrarModalReporteDiario()" class="text-white/80 hover:text-white p-2 text-base cursor-pointer"><i class="pi pi-times"></i></button>
              </div>
            </div>
            <div class="p-6 overflow-y-auto max-h-[80vh] space-y-4 bg-muted/20">
              <div class="bg-white text-slate-950 p-6 rounded-xl shadow-lg border border-slate-300 font-sans">
                <h2 class="text-sm font-black uppercase text-center mb-4">PLANILLA OFICIAL DE CONTROL DE ENTREGA Y RECEPCIÓN DE EVALUACIONES</h2>
                <div class="text-xs">Sede: {{ sedeSeleccionada()?.name }} · Carrera: {{ carreraSeleccionada()?.careerName }}</div>
              </div>
            </div>
            <div class="bg-muted/60 border-t border-border p-3 flex items-center justify-end shrink-0">
              <button (click)="cerrarModalReporteDiario()" class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer">Cerrar</button>
            </div>
          </div>
        </div>
      }

      @if (evaluacionSeleccionadaCartillas(); as evaluacionCartillas) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div class="p-5 border-b border-border flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center"><i class="pi pi-id-card text-lg"></i></div>
                <div>
                  <h3 class="text-sm font-black text-foreground">Sobreimpresión de datos OMR</h3>
                  <p class="text-xs text-muted-foreground">{{ evaluacionCartillas.codigo }} · {{ evaluacionCartillas.grupo }} · solo datos para imprimir sobre cartillas preimpresas.</p>
                </div>
              </div>
              <button (click)="cerrarGestionCartillas()" class="text-muted-foreground hover:text-foreground cursor-pointer"><i class="pi pi-times"></i></button>
            </div>
            <div class="p-5 space-y-4">
              @if (cargandoCartillas()) {
                <div class="py-10 text-center text-xs font-bold text-muted-foreground"><i class="pi pi-spinner pi-spin text-primary mr-2"></i>Cargando lote de sobreimpresión...</div>
              } @else {
                @if (loteCartillasActual(); as lote) {
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="rounded-xl border border-border bg-muted/40 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Cartillas</span><strong class="text-lg text-foreground">{{ lote.totalCartillas }}</strong></div>
                    <div class="rounded-xl border border-border bg-muted/40 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Estado</span><strong class="text-sm" [class.text-emerald-700]="lote.estado === 'IMPRESO'" [class.text-teal-700]="lote.estado === 'GENERADO'">{{ lote.estado }}</strong></div>
                    <div class="rounded-xl border border-border bg-muted/40 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Formato</span><strong class="text-sm text-foreground">1 por página A4</strong></div>
                  </div>
                  <div class="max-h-40 overflow-y-auto rounded-xl border border-border divide-y divide-border text-xs">
                    @for (cartilla of lote.cartillas; track cartilla.id) {
                      <div class="grid grid-cols-[36px_90px_1fr_auto] gap-2 p-2.5 items-center">
                        <span class="font-mono text-muted-foreground">{{ cartilla.numeroOrden }}</span>
                        <span class="font-mono font-bold">{{ cartilla.codigoEstudiante }}</span>
                        <span class="truncate font-medium">{{ cartilla.nombreCompleto }}</span>
                        <span class="text-[10px] font-bold" [class.text-emerald-700]="cartilla.estado === 'IMPRESA'" [class.text-teal-700]="cartilla.estado === 'GENERADA'">{{ cartilla.estado }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="rounded-xl border border-dashed border-teal-200 bg-teal-50/40 p-5 text-xs text-teal-900 leading-relaxed">
                    No hay un lote generado. Se generará únicamente la capa de datos: N°, código de materia, grupo, código y nombre completo. No se dibuja la cartilla, la cabecera ni las respuestas.
                  </div>
                }
              }
            </div>
            <div class="p-4 border-t border-border flex flex-wrap justify-end gap-2">
              <button (click)="cerrarGestionCartillas()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cerrar</button>
              @if (loteCartillasActual(); as lote) {
                <button (click)="abrirPdfCartillas(lote)" class="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer"><i class="pi pi-file-pdf mr-1.5"></i>Abrir PDF de datos</button>
                @if (lote.estado !== 'IMPRESO') {
                  <button (click)="confirmarImpresionCartillas(lote)" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"><i class="pi pi-print mr-1.5"></i>Marcar como impreso</button>
                }
              }
              <button (click)="generarCartillas()" [disabled]="generandoCartillas()" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"><i class="pi" [class.pi-spinner]="generandoCartillas()" [class.pi-spin]="generandoCartillas()" [class.pi-plus]="!generandoCartillas()"></i> {{ loteCartillasActual() ? 'Generar nuevo lote' : 'Generar lote' }}</button>
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
export class EvaluacionesDiaComponent implements OnInit {
  private readonly _gateway = inject(UnitepcGatewayService);
  private readonly _db = inject(EvaluacionesDbService);
  private readonly _rolService = inject(RolExamenService);
  private readonly _studentService = inject(EstudiantesGatewayService);
  private readonly _generacionTypst = inject(GeneracionTypstService);
  private readonly _bancoService = inject(BancoPreguntasService);
  private readonly _cartillasOmr = inject(CartillasOmrService);
  public readonly macroGenerator = inject(ExamenMacroGeneratorService);

  // Sedes y Carreras desde SEA Gateway
  public sedes = signal<BranchOffice[]>([]);
  public sedeSeleccionada = signal<BranchOffice | null>(null);

  public carreras = signal<Career[]>([]);
  public carreraSeleccionada = signal<Career | null>(null);

  public cargando = signal<boolean>(false);
  public cargandoCarreras = signal<boolean>(false);

  // Filtros Parametrizados
  public filtroParcial: string = '1er Parcial';
  public filtroModalidad: 'Todos' | 'Presencial' | 'Virtual' = 'Todos';
  
  // No usar toISOString(): convierte la hora local a UTC y en Bolivia puede
  // mover la fecha al día siguiente durante la noche.
  public readonly hoyIso = fechaIsoLocal();
  public filtroFechaInicio: string = this.hoyIso;
  public filtroFechaFin: string = this.hoyIso;

  public busquedaTexto = '';
  
  // Multi-Selección de Estados
  public estadosSeleccionados = signal<string[]>([]);

  public readonly listaEtapas: string[] = [
    'Programado', 'Validado', 'Generado', 'Impreso', 'Entregado', 'Devuelto', 'Revisado', 'Subido', 'Recibido'
  ];

  // Flujo oficial único (9 pasos), independiente de la hoja de respuestas externa.
  public readonly flujoOficial: StepDef[] = [
    { key: 'Programado', label: 'Programado', icon: 'pi pi-calendar' },
    { key: 'Validado', label: 'Validado', icon: 'pi pi-shield' },
    { key: 'Generado', label: 'Generado', icon: 'pi pi-bolt' },
    { key: 'Impreso', label: 'Impreso', icon: 'pi pi-print' },
    { key: 'Entregado', label: 'Entregado', icon: 'pi pi-send' },
    { key: 'Devuelto', label: 'Devuelto', icon: 'pi pi-replay' },
    { key: 'Revisado', label: 'Revisado', icon: 'pi pi-check' },
    { key: 'Subido', label: 'Subido', icon: 'pi pi-upload' },
    { key: 'Recibido', label: 'Recibido', icon: 'pi pi-inbox' }
  ];

  // Modales
  public dialogReporteDiario = signal<boolean>(false);
  public evaluacionSeleccionadaParaValidar = signal<EvaluacionItemUI | null>(null);
  public evaluacionSeleccionadaParaParametrizar = signal<EvaluacionItemUI | null>(null);
  public evaluacionSeleccionadaParaBitacora = signal<EvaluacionItemUI | null>(null);
  public evaluacionSeleccionadaParaReestablecer = signal<EvaluacionItemUI | null>(null);
  public motivoReestablecimiento = '';
  public restableciendo = signal<boolean>(false);

  public dialogVisorExamen = signal<boolean>(false);
  public tabVisorActiva = signal<'examen' | 'patron'>('examen');
  public evaluacionActivaVisor = signal<EvaluacionItemUI | null>(null);

  // Generación real vía backend
  public bancoSeleccionado = signal<BancoPreguntasResponse | null>(null);
  public generandoTypst = signal<boolean>(false);
  public errorGeneracionTypst = signal<string | null>(null);
  public resultadoGeneracionTypst = signal<GeneracionTypstResultado | null>(null);
  public jobIdGeneracionTypst = signal<string | null>(null);

  // Estados para cola + worker de generación
  public dialogQueueWorker = signal<boolean>(false);
  public queueProgress = signal<number>(0);
  public queuePasoActual = signal<string>('Iniciando encolado...');
  public queueLogs = signal<string[]>([]);
  public queueJobCompleted = signal<boolean>(false);
  public queueJobId = 84920;

  // Supervisión administrativa de la cola RabbitMQ.
  public dialogSupervisionCola = signal<boolean>(false);
  public colaGeneracion = signal<GeneracionColaResponse | null>(null);
  public cargandoCola = signal<boolean>(false);
  public errorCola = signal<string | null>(null);

  // Estudiantes
  public estudiantesInscritos = signal<EstudianteInscrito[]>([]);
  public ratioEstudiantesPorVariante = signal<number>(5);
  public estudianteSeleccionadoIdx = signal<number>(0);
  public variantesCompiladas = signal<VarianteCompilada[]>([]);
  public modoUnificado = signal<boolean>(false);

  // Parámetros oficiales de hoja y tipografía
  public paramTamanoHoja = 'Oficio (Folio UNITEPC)';
  public paramTipoFuente: string = 'Times New Roman';
  public paramTamanoFuente: number = 11;
  public paramEspaciado: string = '1em';

  public archivoExcelNombre = signal<string | null>(null);
  public toastMessage = signal<string | null>(null);
  public evaluacionSeleccionadaCartillas = signal<EvaluacionItemUI | null>(null);
  public loteCartillasActual = signal<LoteCartillasOmr | null>(null);
  public cargandoCartillas = signal<boolean>(false);
  public generandoCartillas = signal<boolean>(false);

  // Lista viva de evaluaciones
  public evaluaciones = signal<EvaluacionItemUI[]>([]);

  // La regla institucional vigente es una variante por cada cinco estudiantes.
  public variantesCalculadas = computed(() => {
    const totalEst = this.estudiantesInscritos().length;
    const ratio = this.ratioEstudiantesPorVariante() || 5;
    if (totalEst <= 0) return 1;
    const num = Math.ceil(totalEst / ratio);
    return Math.min(Math.max(num, 1), 5);
  });

  private _normalizar(texto: string): string {
    if (!texto) return '';
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  public evaluacionesFiltradas = computed(() => {
    let list = this.evaluaciones();
    const query = this._normalizar(this.busquedaTexto);
    const estados = this.estadosSeleccionados();

    if (this.filtroParcial !== 'Todos') {
      list = list.filter(e => e.tipo === this.filtroParcial);
    }

    if (this.filtroModalidad === 'Presencial') {
      list = list.filter(e => e.modalidad !== 'VIRTUAL');
    } else if (this.filtroModalidad === 'Virtual') {
      list = list.filter(e => e.modalidad === 'VIRTUAL');
    }

    if (estados.length > 0) {
      list = list.filter(e => estados.includes(e.estado));
    }

    if (this.filtroFechaInicio && this.filtroFechaFin) {
      list = list.filter(e => {
        if (!e.fecha) return true;
        return e.fecha >= this.filtroFechaInicio && e.fecha <= this.filtroFechaFin;
      });
    }

    if (query) {
      list = list.filter(e => 
        this._normalizar(e.materia).includes(query) ||
        this._normalizar(e.codigo).includes(query) ||
        this._normalizar(e.docenteNombre).includes(query) ||
        this._normalizar(e.aula).includes(query) ||
        this._normalizar(e.grupo).includes(query)
      );
    }

    return list;
  });

  public ngOnInit(): void {
    this.ratioEstudiantesPorVariante.set(this._db.getEstudiantesPorVarianteParam());
    this._cargarSedes();
  }

  public abrirSupervisionCola(): void {
    this.dialogSupervisionCola.set(true);
    this.refrescarCola();
  }

  public cerrarSupervisionCola(): void {
    this.dialogSupervisionCola.set(false);
  }

  public refrescarCola(): void {
    this.cargandoCola.set(true);
    this.errorCola.set(null);
    this._generacionTypst.consultarCola().subscribe({
      next: cola => {
        this.colaGeneracion.set(cola);
        this.cargandoCola.set(false);
      },
      error: err => {
        this.cargandoCola.set(false);
        this.errorCola.set(err?.error?.message || 'No se pudo consultar la cola de generación.');
      }
    });
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
      this._cargarEvaluaciones();
    }
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
          this._cargarEvaluaciones();
        } else {
          this.carreraSeleccionada.set(null);
          this.evaluaciones.set([]);
          this.cargando.set(false);
        }
      },
      error: () => {
        this.cargandoCarreras.set(false);
        this.cargando.set(false);
      }
    });
  }

  private _cargarEvaluaciones(): void {
    const sede = this.sedeSeleccionada();
    const carrera = this.carreraSeleccionada();
    if (!sede || !carrera) return;

    this.cargando.set(true);

    this._rolService.listar(sede.code, carrera.careerCode).subscribe({
      next: roles => {
        const uiList: EvaluacionItemUI[] = roles.map(rol => this._mapearRolResponseA_UI(rol));
        this.evaluaciones.set(uiList);
        this.cargando.set(false);
      },
      error: err => {
        console.error('Error cargando evaluaciones desde backend:', err);
        this._mostrarToast('Error al cargar evaluaciones desde el servidor.', 'error');
        this.evaluaciones.set([]);
        this.cargando.set(false);
      }
    });
  }

  private _mapearRolResponseA_UI(rol: RolExamenResponse): EvaluacionItemUI {
    const conCartilla = false;

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
      tipo: rol.tipoParcial as RolExamenPersistedItem['tipo'],
      estado: rol.estadoFlujo as RolExamenPersistedItem['estado'],
      conCartilla,
      modalidad: rol.modalidad,
      semana: rol.semana,
      dia: rol.dia,
      fecha: rol.fecha,
      fechaDisplay: rol.fechaDisplay,
      horario: rol.horario,
      aula: rol.aula,
      campus: rol.campus,
      estudiantesInscritosCount: rol.estudiantesInscritosCount,
      hashEncriptacion: rol.hashEncriptacion,
      fechaValidacion: rol.fechaValidacion,
      etapa: this._mapearEtapa(rol.estadoFlujo),
      hora: rol.horario.split('-')[0]?.trim() || '08:15',
      variantesGeneradas: rol.variantesGeneradasCount
    };
  }

  private _mapearEtapa(estado: string): EtapaEvaluacion {
    switch (estado?.toUpperCase()) {
      case 'VALIDADO': return 'Validado';
      case 'GENERADO': return 'Generado';
      case 'IMPRESO': return 'Impreso';
      case 'ENTREGADO': return 'Entregado';
      case 'DEVUELTO': return 'Devuelto';
      case 'REVISADO': return 'Revisado';
      case 'SUBIDO': return 'Subido';
      case 'RECIBIDO': return 'Recibido';
      default: return 'Programado';
    }
  }

  public puedeRestablecer(item: EvaluacionItemUI): boolean {
    return ['Generado', 'Impreso', 'Entregado', 'Devuelto', 'Revisado', 'Subido', 'Recibido']
      .includes(item.etapa);
  }

  public puedeMostrarDocumento(item: EvaluacionItemUI): boolean {
    return ['Generado', 'Impreso', 'Entregado', 'Devuelto', 'Revisado', 'Subido', 'Recibido']
      .includes(item.etapa);
  }

  public puedeGestionarCartillas(item: EvaluacionItemUI): boolean {
    return ['Generado', 'Impreso', 'Entregado', 'Devuelto', 'Revisado', 'Subido', 'Recibido'].includes(item.etapa);
  }

  public abrirGestionCartillas(item: EvaluacionItemUI): void {
    if (!this.puedeGestionarCartillas(item)) return;
    this.evaluacionSeleccionadaCartillas.set(item);
    this.loteCartillasActual.set(null);
    this.cargandoCartillas.set(true);
    this._cartillasOmr.obtenerUltimo(item.id).subscribe({
      next: lote => {
        this.loteCartillasActual.set(lote);
        this.cargandoCartillas.set(false);
      },
      error: () => {
        this.cargandoCartillas.set(false);
        this._mostrarToast('No se pudo consultar el lote de cartillas.', 'error');
      }
    });
  }

  public cerrarGestionCartillas(): void {
    this.evaluacionSeleccionadaCartillas.set(null);
    this.loteCartillasActual.set(null);
  }

  public generarCartillas(): void {
    const item = this.evaluacionSeleccionadaCartillas();
    if (!item || this.generandoCartillas()) return;
    this.generandoCartillas.set(true);
    this._cartillasOmr.generar(item.id).subscribe({
      next: lote => {
        this.loteCartillasActual.set(lote);
        this.generandoCartillas.set(false);
        this._mostrarToast(`${lote.totalCartillas} sobreimpresiones de datos generadas.`);
      },
        error: err => {
          this.generandoCartillas.set(false);
          this._mostrarToast(err?.error?.message || 'No se pudo generar la sobreimpresión de datos.', 'error');
      }
    });
  }

  public confirmarImpresionCartillas(lote: LoteCartillasOmr): void {
    const item = this.evaluacionSeleccionadaCartillas();
    if (!item) return;
    this._cartillasOmr.marcarImpreso(item.id, lote.id).subscribe({
      next: actualizado => {
        this.loteCartillasActual.set(actualizado);
        this._mostrarToast('Lote de cartillas marcado como impreso.');
      },
      error: () => this._mostrarToast('No se pudo confirmar la impresión del lote.', 'error')
    });
  }

  public abrirPdfCartillas(lote: LoteCartillasOmr): void {
    if (!lote.archivoPdfPath) return;
    window.open(`/api/archivos?path=${encodeURIComponent(lote.archivoPdfPath)}`, '_blank', 'noopener');
  }

  public isEstadoSeleccionado(etapa: string): boolean {
    return this.estadosSeleccionados().includes(etapa);
  }

  public seleccionarTodosLosEstados(): void {
    this.estadosSeleccionados.set([]);
  }

  public toggleEstadoFiltro(etapa: string): void {
    const actual = this.estadosSeleccionados();
    if (actual.includes(etapa)) {
      this.estadosSeleccionados.set(actual.filter(e => e !== etapa));
    } else {
      this.estadosSeleccionados.set([...actual, etapa]);
    }
  }

  public getPasosFlujo(item: EvaluacionItemUI): StepDef[] {
    return this.flujoOficial;
  }

  public getPasoBotonClass(item: EvaluacionItemUI, pasoKey: EtapaEvaluacion): string {
    const pasos = this.getPasosFlujo(item).map(p => p.key);
    const currentIdx = pasos.indexOf(item.etapa);
    const pasoIdx = pasos.indexOf(pasoKey);

    if (pasoIdx < currentIdx) {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold hover:bg-emerald-100';
    } else if (pasoIdx === currentIdx) {
      return 'bg-purple-700 text-white font-black shadow-xs ring-2 ring-purple-300 scale-105';
    } else if (pasoIdx === currentIdx + 1) {
      return 'bg-card text-purple-700 border border-purple-300 hover:bg-purple-100 font-bold animate-pulse hover:animate-none';
    } else {
      return 'bg-muted/40 text-muted-foreground/40 border border-transparent cursor-not-allowed';
    }
  }

  public getPasoIcon(item: EvaluacionItemUI, st: StepDef): string {
    const pasos = this.getPasosFlujo(item).map(p => p.key);
    const currentIdx = pasos.indexOf(item.etapa);
    const pasoIdx = pasos.indexOf(st.key);

    if (pasoIdx < currentIdx) {
      return 'pi pi-check';
    }
    return st.icon;
  }

  public getPasoTooltip(item: EvaluacionItemUI, st: StepDef): string {
    const pasos = this.getPasosFlujo(item).map(p => p.key);
    const currentIdx = pasos.indexOf(item.etapa);
    const pasoIdx = pasos.indexOf(st.key);

    if (pasoIdx < currentIdx) return `Completado: ${st.label}`;
    if (pasoIdx === currentIdx) return `Estado actual: ${st.label}`;
    if (pasoIdx === currentIdx + 1) {
      if (st.key === 'Validado') return 'Clic para Validar y Encriptar Examen de Docente';
      if (st.key === 'Generado') return 'Clic para generar el examen PDF (30 preguntas A-E)';
      return `Clic para avanzar a: ${st.label}`;
    }
    return `Pendiente: ${st.label}`;
  }

  public clickPasoEstado(item: EvaluacionItemUI, pasoKey: EtapaEvaluacion): void {
    const pasos = this.getPasosFlujo(item).map(p => p.key);
    const currentIdx = pasos.indexOf(item.etapa);
    const pasoIdx = pasos.indexOf(pasoKey);

    if (pasoKey === 'Validado' && item.etapa === 'Programado') {
      this.evaluacionSeleccionadaParaValidar.set(item);
      return;
    }

    if (pasoKey === 'Generado' && (item.etapa === 'Validado' || item.etapa === 'Programado')) {
      this.abrirModalParametrizacion(item);
      return;
    }

    if (pasoIdx === currentIdx + 1) {
      item.etapa = pasoKey;
      item.estado = pasoKey.toUpperCase() as any;
      this._db.upsertRolExamen(item);
      this.evaluaciones.update(items => [...items]);
      this._mostrarToast(`${item.codigo}: Estado avanzado a '${pasoKey}'.`);
    }
  }

  public cerrarModalValidar(): void {
    this.evaluacionSeleccionadaParaValidar.set(null);
  }

  public confirmarValidacionDocente(): void {
    const item = this.evaluacionSeleccionadaParaValidar();
    if (!item) return;

    item.etapa = 'Validado';
    item.estado = 'VALIDADO' as any;
    item.hashEncriptacion = `SHA256-${item.codigo}-ENC-${Date.now()}`;

    this._db.upsertRolExamen(item);
    this.evaluaciones.update(items => [...items]);
    this.evaluacionSeleccionadaParaValidar.set(null);
    this._mostrarToast(`${item.codigo}: Examen validado, encriptado en servidor y listo para generación.`);
  }

  public abrirModalParametrizacion(item: EvaluacionItemUI): void {
    this.evaluacionSeleccionadaParaParametrizar.set(item);
    this.bancoSeleccionado.set(null);
    this.errorGeneracionTypst.set(null);
    this.resultadoGeneracionTypst.set(null);
    this.jobIdGeneracionTypst.set(null);
    this.ratioEstudiantesPorVariante.set(this._db.getEstudiantesPorVarianteParam());

    // Cargar la nómina de estudiantes en vivo desde el Gateway por groupId
    this._studentService.getEstudiantesPorMateriaYGrupo(item.codigo, item.grupo, item.seaGroupId).subscribe({
      next: estudiantes => {
        this.estudiantesInscritos.set(estudiantes);
      }
    });

    // Cargar el banco de preguntas desde el backend
    this._bancoService.obtenerPorRol(item.id).subscribe({
      next: banco => {
        this.bancoSeleccionado.set(banco);
      },
      error: () => {
        this.bancoSeleccionado.set(null);
        this._mostrarToast('No se encontró un banco de preguntas validado para este rol en el servidor.', 'error');
      }
    });

    this.archivoExcelNombre.set(`BANCO_${item.codigo.replace('-', '')}_FINAL_2026.xlsx`);
  }

  public cerrarModalParametrizacion(): void {
    this.evaluacionSeleccionadaParaParametrizar.set(null);
  }

  public getLetraVarianteParaIndice(idx: number): 'A' | 'B' | 'C' | 'D' | 'E' {
    const numVariantes = this.variantesCalculadas();
    const letras: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
    return letras[idx % numVariantes];
  }

  public ejecutarGeneracionVariantes(): void {
    const item = this.evaluacionSeleccionadaParaParametrizar();
    if (!item) return;

    const banco = this.bancoSeleccionado();
    if (!banco) {
      this._mostrarToast('No hay un banco de preguntas validado cargado en el servidor para generar.', 'error');
      return;
    }

    const cantVariantes = this.variantesCalculadas();
    const estudiantes = this.estudiantesInscritos();
    const letras: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
    const variantes = letras.slice(0, cantVariantes);

    const jobId = crypto.randomUUID();
    const request: GeneracionTypstRequest = {
      jobId,
      rolExamenId: item.id,
      bancoPreguntasId: banco.id,
      variantes,
      ratioEstudiantesPorVariante: this.ratioEstudiantesPorVariante() || 5
    };

    this.generandoTypst.set(true);
    this.errorGeneracionTypst.set(null);
    this.resultadoGeneracionTypst.set(null);
    this.jobIdGeneracionTypst.set(jobId);

    this.cerrarModalParametrizacion();
    this.dialogQueueWorker.set(true);
    this.queueJobCompleted.set(false);
    this.queueProgress.set(15);
    this.queuePasoActual.set('Encolando tarea en RabbitMQ...');
    this.queueLogs.set([
      `[${new Date().toLocaleTimeString()}] ⏳ Solicitud #${jobId} encolada`,
      `[${new Date().toLocaleTimeString()}] 📄 Configuración oficial: 30 preguntas (7 fáciles, 16 medias, 7 difíciles), Oficio, Times New Roman 11 pt`,
      `[${new Date().toLocaleTimeString()}] 👥 Alumnos inscritos: ${estudiantes.length}, Variantes: ${variantes.join(', ')}`
    ]);

    this._generacionTypst.solicitarGeneracion(request).subscribe({
      next: accepted => {
        // El backend devuelve el identificador efectivo del job. Usarlo para
        // el polling mantiene la correlación aunque el cliente sea antiguo o
        // el backend deba generar el identificador por compatibilidad.
        const pollingJobId = accepted?.jobId || jobId;
        this.jobIdGeneracionTypst.set(pollingJobId);
        this.queueLogs.update(logs => [
          ...logs,
          `[${new Date().toLocaleTimeString()}] ✅ Solicitud aceptada por el backend. Esperando worker...`
        ]);

        this._generacionTypst.esperarResultado(pollingJobId).subscribe({
          next: resultado => {
            this.resultadoGeneracionTypst.set(resultado);

            if (resultado.estado === 'ERROR') {
              this.generandoTypst.set(false);
              this.errorGeneracionTypst.set(resultado.mensaje || 'Error desconocido en generación.');
              this.queueProgress.set(100);
              this.queuePasoActual.set('Error al generar el examen PDF');
              this.queueLogs.update(logs => [
                ...logs,
                `[${new Date().toLocaleTimeString()}] ❌ Error: ${resultado.mensaje}`
              ]);
              this._mostrarToast(resultado.mensaje || 'Error en generación.', 'error');
              return;
            }

            if (resultado.estado === 'COMPLETADO') {
              this.generandoTypst.set(false);
              this.queueProgress.set(100);
              this.queuePasoActual.set('¡Examen PDF generado exitosamente!');
              this.queueJobCompleted.set(true);
              this.queueLogs.update(logs => [
                ...logs,
                `[${new Date().toLocaleTimeString()}] ✅ ${resultado.variantes.length} variantes generadas`,
                `[${new Date().toLocaleTimeString()}] ✅ ${resultado.mapeos.length} cuadernillos listos`
              ]);

              item.etapa = 'Generado';
              item.estado = 'GENERADO';
              item.variantesGeneradas = cantVariantes;
              item.estudiantesInscritosCount = estudiantes.length;
              this._db.upsertRolExamen(item);
              this.evaluaciones.update(items => [...items]);
              this._mostrarToast(`${item.codigo}: Examen PDF generado exitosamente.`);
              this.dialogQueueWorker.set(false);
            }
          },
          error: err => {
            this.generandoTypst.set(false);
            const msg = err?.message || 'No se pudo obtener el resultado de generación.';
            this.errorGeneracionTypst.set(msg);
            this.queueProgress.set(100);
            this.queuePasoActual.set('Error consultando resultado');
            this.queueLogs.update(logs => [...logs, `[${new Date().toLocaleTimeString()}] ❌ ${msg}`]);
            this._mostrarToast(msg, 'error');
          }
        });
      },
      error: err => {
        this.generandoTypst.set(false);
        const msg = err?.message || 'No se pudo iniciar la generación del examen.';
        this.errorGeneracionTypst.set(msg);
        this.queueProgress.set(100);
        this.queuePasoActual.set('Error al encolar la tarea');
        this.queueLogs.update(logs => [...logs, `[${new Date().toLocaleTimeString()}] ❌ ${msg}`]);
        this._mostrarToast(msg, 'error');
      }
    });
  }

  public abrirVisorExamenDirecto(): void {
    this._mostrarToast('La vista previa fue retirada. Abra el PDF desde la columna Documentos.', 'info');
  }

  public abrirVisorExamen(item: EvaluacionItemUI, tab: 'examen' | 'patron' = 'examen'): void {
    this.abrirPdfExamen(item);
  }

  public cerrarVisorExamen(): void {
    this.dialogVisorExamen.set(false);
  }

  public getEstudianteActivo(): EstudianteInscrito | undefined {
    const list = this.estudiantesInscritos();
    const idx = this.estudianteSeleccionadoIdx();
    return list[idx] || list[0];
  }

  public getVarianteParaEstudiante(est: EstudianteInscrito): VarianteCompilada {
    const list = this.estudiantesInscritos();
    const idx = list.findIndex(e => e.codigo === est.codigo);
    const letra = this.getLetraVarianteParaIndice(idx >= 0 ? idx : 0);
    const tipo = `TIPO ${letra}`;

    const compiladas = this.variantesCompiladas();
    return compiladas.find(v => v.tipo === tipo) || compiladas[0] || this.macroGenerator.generarVariantesCompletas(1)[0];
  }

  public getNumerosRango(min: number, max: number): number[] {
    const arr: number[] = [];
    for (let i = min; i <= max; i++) {
      arr.push(i);
    }
    return arr;
  }

  // Apertura y descarga de archivos oficiales
  public abrirCuadernilloMasterTypst(): void {
    const resultado = this.resultadoGeneracionTypst();
    if (resultado?.estado === 'COMPLETADO' && resultado.variantes.length > 0) {
      const variante = resultado.variantes.find(v => v.letra === 'A') || resultado.variantes[0];
      window.open(this._urlArchivo(variante.archivoPdfPath), '_blank');
      return;
    }
    this._mostrarToast('No hay exámenes generados disponibles.', 'error');
  }

  private readonly _codigosPdfEstudiantes = new Set([
    '6549812', '6839201', '6928103', '7194820', '7391028', '7482910', 
    '7849102', '7928104', '8102938', '8291047', '8392104', '8401928'
  ]);

  public abrirPdfExamen(item: EvaluacionItemUI): void {
    if (!this.puedeMostrarDocumento(item)) {
      this._mostrarToast('El examen PDF estará disponible después de la generación.', 'error');
      return;
    }

    const ventana = window.open('', '_blank');
    this._generacionTypst.consultarDocumentoExamen(item.id).subscribe({
      next: documento => {
        if (ventana) {
          ventana.location.href = this._urlArchivo(documento.archivoPdfPath);
        } else {
          window.open(this._urlArchivo(documento.archivoPdfPath), '_blank');
        }
      },
      error: err => {
        ventana?.close();
        const mensaje = err?.error?.message || 'No se encontró el examen PDF generado.';
        this._mostrarToast(mensaje, 'error');
      }
    });
  }

  public abrirPdfTypstOficial(): void {
    const resultado = this.resultadoGeneracionTypst();
    if (!resultado || resultado.estado !== 'COMPLETADO' || resultado.variantes.length === 0) {
      this._mostrarToast('No hay exámenes generados disponibles. Genere los exámenes primero.', 'error');
      return;
    }

    const est = this.getEstudianteActivo();
    if (est) {
      const mapeo = resultado.mapeos.find(m => m.codigoEstudiante === est.codigo);
      if (mapeo?.cuadernilloPdfPath) {
        window.open(this._urlArchivo(mapeo.cuadernilloPdfPath), '_blank');
        return;
      }
    }

    const varianteA = resultado.variantes.find(v => v.letra === 'A') || resultado.variantes[0];
    if (varianteA?.archivoPdfPath) {
      window.open(this._urlArchivo(varianteA.archivoPdfPath), '_blank');
    }
  }

  public abrirPatronPdfTypst(): void {
    const item = this.evaluacionActivaVisor();
    const cod = item?.codigo?.replace(/[^a-zA-Z0-9]/g, '') || 'CPEC18';
    const filename = `${cod}_Cochabamba_TA-01_1erParcial_VarA_20260822_Patron.pdf`;
    window.open(`assets/examenes/${filename}`, '_blank');
  }

  public descargarRemarkExcelOficial(): void {
    const item = this.evaluacionActivaVisor();
    const cod = item?.codigo?.replace(/[^a-zA-Z0-9]/g, '') || 'CPEC18';
    const filename = `${cod}_Cochabamba_TA-01_1erParcial_VarA_20260822_Remark.xlsx`;
    const link = document.createElement('a');
    link.href = `assets/examenes/${filename}`;
    link.download = filename;
    link.click();
    this._mostrarToast(`Descargando matriz de calificación de hoja externa...`);
  }

  public abrirListaFirmasPdfTypst(item?: EvaluacionItemUI): void {
    const evalItem = item || this.evaluacionActivaVisor();
    const cod = evalItem?.codigo?.replace(/[^a-zA-Z0-9]/g, '') || 'CPEC18';
    const filename = `${cod}_Cochabamba_TA-01_1erParcial_20260822_Lista_Firmas.pdf`;
    window.open(`assets/examenes/${filename}`, '_blank');
    this._mostrarToast(`Abriendo Planilla Oficial de Asistencia y Firmas...`);
  }

  private _urlArchivo(pdfPath: string): string {
    return `/api/archivos?path=${encodeURIComponent(pdfPath)}`;
  }

  public imprimirVentanaLimpia(): void {
    window.print();
  }

  public abrirBitacora(item: EvaluacionItemUI): void {
    this.evaluacionSeleccionadaParaBitacora.set(item);
  }

  public cerrarBitacora(): void {
    this.evaluacionSeleccionadaParaBitacora.set(null);
  }

  public solicitarReestablecimiento(item: EvaluacionItemUI): void {
    if (!this.puedeRestablecer(item)) {
      this._mostrarToast('Solo se puede restablecer una evaluación posterior a Validado.', 'error');
      return;
    }
    this.evaluacionSeleccionadaParaReestablecer.set(item);
    this.motivoReestablecimiento = '';
  }

  public cancelarReestablecimiento(): void {
    this.evaluacionSeleccionadaParaReestablecer.set(null);
  }

  public confirmarReestablecimiento(): void {
    const item = this.evaluacionSeleccionadaParaReestablecer();
    const motivo = this.motivoReestablecimiento.trim();
    if (!item || !this.puedeRestablecer(item) || !motivo || this.restableciendo()) return;

    this.restableciendo.set(true);
    this._rolService.restablecerAValidado(item.id, {
      motivo,
      usuario: 'Sistema',
      ipOrigen: '127.0.0.1'
    }).subscribe({
      next: rol => {
        const actualizado = this._mapearRolResponseA_UI(rol);
        this.evaluaciones.update(items => items.map(actual =>
          actual.id === item.id ? actualizado : actual
        ));
        this.evaluacionSeleccionadaParaReestablecer.set(null);
        this.restableciendo.set(false);
        this._mostrarToast(`${item.codigo}: Restablecido a Validado y registrado en la base de datos.`);
      },
      error: err => {
        this.restableciendo.set(false);
        const detalle = err?.error?.message || err?.error?.error || 'No se pudo restablecer la evaluación.';
        this._mostrarToast(detalle, 'error');
      }
    });
  }

  public abrirModalReporteDiario(): void {
    this.dialogReporteDiario.set(true);
  }

  public cerrarModalReporteDiario(): void {
    this.dialogReporteDiario.set(false);
  }

  public mostrarTodasLasFechas(): void {
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroParcial = 'Todos';
    this._mostrarToast('Mostrando todas las evaluaciones programadas.');
  }

  public limpiarFiltros(): void {
    this.filtroFechaInicio = this.hoyIso;
    this.filtroFechaFin = this.hoyIso;
    this.filtroParcial = '1er Parcial';
    this.filtroModalidad = 'Todos';
    this.estadosSeleccionados.set([]);
    this.busquedaTexto = '';
  }

  private _mostrarToast(msg: string, _tipo?: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
