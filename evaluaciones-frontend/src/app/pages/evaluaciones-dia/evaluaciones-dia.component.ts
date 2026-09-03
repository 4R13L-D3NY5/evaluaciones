import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { RolExamenPersistedItem, MapeoEstudianteExamen } from '../../core/services/evaluaciones-db.service';
import { 
  EstudiantesGatewayService, 
  EstudianteInscrito 
} from '../../core/services/estudiantes-gateway.service';
import { BranchOffice, Career } from '../../core/models/unitepc-gateway.models';
import { VarianteCompilada } from '../../core/services/examen-macro-generator.service';
import { GeneracionTypstService } from '../../core/services/generacion-typst.service';
import { BancoPreguntasService, BancoPreguntasResponse } from '../../core/services/banco-preguntas.service';
import {
  RolExamenService,
  RolExamenResponse,
  AuditoriaRolExamen
} from '../../core/services/rol-examen.service';
import { CartillasOmrService, PreparacionCartillasOmr } from '../../core/services/cartillas-omr.service';
import { ConfiguracionEvaluacionesService } from '../../core/services/configuracion-evaluaciones.service';
import { ExamenSinCartillaService, NotaDocente as NotaDocenteSinCartilla } from '../../core/services/examen-sin-cartilla.service';
import {
  CalificacionOmrResponse,
  AjustarCalificacionOmrRequest,
  OmrJobResponse,
  OmrLecturaResponse,
  OmrProcesamientoService
} from '../../core/services/omr-procesamiento.service';
import {
  GeneracionTypstRequest,
  GeneracionTypstResultado,
  GeneracionColaResponse,
  ConfiguracionGeneracion,
  GeneracionTypstVariante
} from '../../core/models/generacion-typst.model';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker-4.10.38.min.mjs';
}

function fechaIsoLocal(fecha: Date = new Date()): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export type EtapaEvaluacion = 'Programado' | 'Validado' | 'Generado' | 'Impreso' | 'Entregado' | 'Devuelto' | 'Pendiente de notas' | 'Calificado';

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
  bancoPreguntasCargado?: boolean;
  fueRestablecido?: boolean;
  estadoPrevioRestablecimiento?: EtapaEvaluacion;
  motivoRestablecimiento?: string;
  fechaRestablecimiento?: string;
  usuarioRestablecimiento?: string;
  auditoria?: AuditoriaRolExamen[];
  bitacora?: {
    estado: string;
    fechaHora: string;
    usuario: string;
    detalle: string;
  }[];
}

interface SalaVirtualOperacion {
  id: string;
  rolExamenId: string;
  codigoSala: string;
  estado: string;
  duracionMinutos: number;
  graciaIngresoMinutos?: number;
  iniciadaEn?: string;
  terminaEn?: string;
  participantes: { codigoEstudiante: string; nombreEstudiante: string; estado: string }[];
}

interface AccesoVirtualGenerado {
  codigoEstudiante: string;
  nombreEstudiante: string;
  token: string;
}

interface SalaVirtualCreada {
  sala: SalaVirtualOperacion;
  accesos: AccesoVirtualGenerado[];
  tokenGrupo?: string;
}

interface TokenGrupoVirtual {
  codigoSala: string;
  tokenGrupo: string;
}

interface ResultadoVirtual {
  intentoId: string;
  codigoEstudiante: string;
  nombreEstudiante: string;
  letraVariante?: string;
  estado: string;
  aciertos?: number;
  notaSobre30?: string;
  notaSobre100?: string;
  enviadoEn?: string;
  respuestas: { numeroPregunta: number; reactivoId: number; respuesta: string; guardadaEn?: string }[];
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
              (ngModelChange)="cambiarFiltroParcial($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-2.5 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              <option value="Todos">Todos los Parciales</option>
              <option value="1er Parcial">1er Parcial</option>
              <option value="2do Parcial">2do Parcial</option>
              <option value="Final">Examen Final</option>
              <option value="2da Instancia">2da Instancia</option>
            </select>
          </div>

          <!-- Modalidad -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-desktop text-primary text-[10px]"></i> Modalidad
            </label>
            <select 
              [(ngModel)]="filtroModalidad"
              (ngModelChange)="cambiarFiltroModalidad($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-2.5 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              <option value="Todos">Todas</option>
              <option value="PRESENCIAL_CARTILLA">Con Cartilla</option>
              <option value="PRESENCIAL_SIN_CARTILLA">Sin Cartilla</option>
              <option value="VIRTUAL">Virtual</option>
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
              (ngModelChange)="cambiarFiltroFechaInicio($event)"
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
                (ngModelChange)="cambiarFiltroFechaFin($event)"
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
              (ngModelChange)="cambiarBusqueda($event)"
              placeholder="Buscar evaluación por código, materia, docente o aula..."
              class="w-full bg-muted/70 border border-border rounded-xl pl-9 pr-8 py-2.5 text-xs font-medium text-foreground outline-none focus:border-primary shadow-2xs">
            <i class="pi pi-search absolute left-3 top-3 text-muted-foreground text-xs"></i>
            @if (busquedaTexto) {
              <button (click)="busquedaTexto = ''; actualizarFiltros()" class="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-xs cursor-pointer">
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
                  <th class="p-3.5 text-center">Marcas</th>
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
                      @if (bancoPreguntasCargado(item)) {
                        <span class="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700" title="Este examen ya tiene un banco de preguntas cargado">
                          <i class="pi pi-check-circle text-[9px]"></i> Banco cargado
                        </span>
                      } @else {
                        <span class="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700" title="Este examen todavía no tiene un banco de preguntas cargado">
                          <i class="pi pi-exclamation-circle text-[9px]"></i> Sin banco
                        </span>
                      }
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
                          <i class="pi pi-desktop text-[9px]"></i> Virtual
                        </span>
                      } @else if (item.modalidad === 'PRESENCIAL_SIN_CARTILLA' || (!item.modalidad && !item.conCartilla)) {
                        <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-file text-[9px]"></i> Sin Cartilla
                        </span>
                      } @else {
                        <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i class="pi pi-file-check text-[9px]"></i> Con Cartilla
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
                      @if (ultimaActividad(item); as actividad) {
                        <div class="mt-1 text-[9px] text-muted-foreground whitespace-nowrap">
                          <i class="pi pi-clock mr-1"></i>{{ formatearFechaHoraAuditoria(actividad.fechaEvento) }} · {{ actividad.usuario || 'Sistema' }}
                        </div>
                      }
                    </td>

                    <td class="p-3.5 text-center">
                      <div class="relative inline-flex group/cartillas">
                        @if (item.modalidad !== 'VIRTUAL') {
                        <button
                          (click)="abrirGestionCartillas(item)"
                          [disabled]="!puedeGestionarCartillas(item)"
                          [title]="marcaImpresa(item) ? 'Marcas OMR impresas' : 'Gestionar marcas OMR'"
                          [attr.aria-label]="marcaImpresa(item) ? 'Marcas OMR impresas' : 'Gestionar marcas OMR'"
                          [class]="marcaImpresa(item) ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-teal-700 bg-teal-50 border-teal-200'"
                          class="relative h-7 w-7 rounded-lg hover:bg-teal-100 border flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35">
                          <i class="pi pi-id-card text-xs"></i>
                          @if (marcaImpresa(item)) {
                            <span class="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-emerald-600 text-white border border-white flex items-center justify-center">
                              <i class="pi pi-check text-[8px]"></i>
                            </span>
                          }
                        </button>
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cartillas:flex flex-col items-center z-50 pointer-events-none">
                          <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">{{ marcaImpresa(item) ? 'Marcas OMR impresas' : 'Sobreimpresión de datos OMR' }}</span>
                          <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                        </div>
                        } @else {
                          <span class="text-muted-foreground/50">—</span>
                        }
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

                        @if (item.modalidad === 'VIRTUAL') {
                          <div class="relative group/salaVirtual">
                            <button
                              (click)="abrirSalaVirtualDesdeLista(item)"
                              title="Restablecer examen virtual"
                              aria-label="Restablecer examen virtual"
                              class="h-7 w-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center cursor-pointer transition-colors">
                              <i class="pi pi-refresh text-xs"></i>
                            </button>
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/salaVirtual:flex flex-col items-center z-50 pointer-events-none">
                              <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">Restablecer examen virtual</span>
                              <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                            </div>
                          </div>
                        }
                        
                        <!-- 1. Bitácora -->
                        <div class="relative group/bitacora">
                          <button 
                            (click)="abrirBitacora(item)"
                            class="h-7 w-7 rounded-lg bg-muted hover:bg-border text-foreground border border-border flex items-center justify-center cursor-pointer transition-colors">
                               <i class="pi pi-clock text-xs"></i>
                          </button>
                          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bitacora:flex flex-col items-center z-50 pointer-events-none">
                            <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                              Bitácora de Trazabilidad
                            </span>
                            <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                          </div>
                        </div>

                        <!-- 2. Variantes, patrones y asignaciones persistidas -->
                        @if (puedeMostrarConfiguracion(item)) {
                          <div class="relative group/configuracion">
                            <button
                              (click)="abrirConfiguracionGeneracion(item)"
                              title="Ver variantes, patrones y asignaciones"
                              aria-label="Ver variantes, patrones y asignaciones"
                              class="h-7 w-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center cursor-pointer transition-colors">
                              <i class="pi pi-sitemap text-xs"></i>
                            </button>
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/configuracion:flex flex-col items-center z-50 pointer-events-none">
                              <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">Variantes y patrones guardados</span>
                              <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                            </div>
                          </div>
                        }

                        <!-- 3. Notas OMR persistidas -->
                        @if (puedeMostrarNotas(item)) {
                          <div class="relative group/notas">
                            <button
                              (click)="abrirNotasOmr(item)"
                              title="Ver notas OMR"
                              aria-label="Ver notas OMR"
                              class="h-7 w-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center cursor-pointer transition-colors">
                              <i class="pi pi-chart-bar text-xs"></i>
                            </button>
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/notas:flex flex-col items-center z-50 pointer-events-none">
                              <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">Notas OMR /30 y /100</span>
                              <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                            </div>
                          </div>
                        }

                        @if (puedeMostrarNotasDocente(item)) {
                          <div class="relative group/notasDocente">
                            <button
                              (click)="abrirNotasDocente(item)"
                              title="Cargar notas del docente"
                              aria-label="Cargar notas del docente"
                              class="h-7 w-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center cursor-pointer transition-colors">
                              <i class="pi pi-pencil text-xs"></i>
                            </button>
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/notasDocente:flex flex-col items-center z-50 pointer-events-none">
                              <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">{{ item.etapa === 'Pendiente de notas' ? 'Cargar notas del docente' : 'Ver notas registradas' }}</span>
                              <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                            </div>
                          </div>
                        }

                        @if (puedeMostrarResultadosVirtuales(item)) {
                          <div class="relative group/resultadosVirtuales">
                            <button
                              (click)="abrirResultadosVirtuales(item)"
                              title="Ver respuestas y resultados virtuales"
                              aria-label="Ver respuestas y resultados virtuales"
                              class="h-7 w-7 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 flex items-center justify-center cursor-pointer transition-colors">
                              <i class="pi pi-chart-bar text-xs"></i>
                            </button>
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/resultadosVirtuales:flex flex-col items-center z-50 pointer-events-none">
                              <span class="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">Resultados y respuestas virtuales</span>
                              <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                            </div>
                          </div>
                        }

                        <!-- 4. Botón Restablecer a Validado -->
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
            <span class="font-mono text-primary">Sincronizado con el servicio institucional · Gestión 2-2026</span>
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

      <!-- MODAL 2: PREPARACIÓN O GENERACIÓN -->
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
                  <h3 class="text-sm font-black text-foreground">{{ evaluacionSeleccionadaParaParametrizar()?.modalidad === 'VIRTUAL' ? 'Preparación del examen virtual' : 'Parámetros y generación del examen PDF' }}</h3>
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
              
              @if (evaluacionSeleccionadaParaParametrizar()?.modalidad !== 'VIRTUAL') {
              <!-- 1. PARÁMETROS OFICIALES DE DIAGRAMACIÓN -->
              <div class="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                <div class="flex items-center justify-between text-foreground font-black text-xs border-b border-border pb-2">
                  <div class="flex items-center gap-2">
                    <i class="pi text-primary" [class.pi-desktop]="evaluacionSeleccionadaParaParametrizar()?.modalidad === 'VIRTUAL'" [class.pi-palette]="evaluacionSeleccionadaParaParametrizar()?.modalidad !== 'VIRTUAL'"></i>
                    <span>{{ evaluacionSeleccionadaParaParametrizar()?.modalidad === 'VIRTUAL' ? 'Parámetros del examen virtual' : 'Parámetros de Diagramación' }}</span>
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
              } @else {
                <!-- Configuración exclusiva del examen virtual -->
                <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
                  <div class="flex items-center justify-between text-purple-950 font-black text-xs border-b border-purple-200 pb-2">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-desktop text-purple-700"></i>
                      <span>Configuración del examen virtual</span>
                    </div>
                    <span class="text-[10px] font-mono text-purple-800 font-bold bg-white/70 px-2 py-0.5 rounded-full border border-purple-200">
                      Sin PDF ni cartilla
                    </span>
                  </div>

                  <p class="text-[11px] text-purple-950 leading-relaxed">
                    Se conservarán la secuencia, el contenido y el ratio del examen con cartilla. Cada estudiante resolverá su variante dentro de la sala virtual y sus respuestas se guardarán automáticamente.
                  </p>

                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div class="bg-white/70 border border-purple-200 rounded-lg p-2">
                      <span class="block text-[10px] uppercase tracking-wider text-purple-700 font-extrabold">Variantes a preparar</span>
                      <strong class="text-sm text-purple-950">{{ variantesCalculadas() }}</strong>
                    </div>
                    <div class="bg-white/70 border border-purple-200 rounded-lg p-2">
                      <span class="block text-[10px] uppercase tracking-wider text-purple-700 font-extrabold">Ratio institucional</span>
                      <strong class="text-sm text-purple-950">{{ ratioEstudiantesPorVariante() }} estudiantes / variante</strong>
                    </div>
                    <div class="bg-white/70 border border-purple-200 rounded-lg p-2">
                      <span class="block text-[10px] uppercase tracking-wider text-purple-700 font-extrabold">Acceso</span>
                      <strong class="text-sm text-purple-950">Sala + token individual</strong>
                    </div>
                    <div class="bg-white/70 border border-purple-200 rounded-lg p-2">
                      <span class="block text-[10px] uppercase tracking-wider text-purple-700 font-extrabold">Duración</span>
                      <strong class="text-sm text-purple-950">{{ duracionExamenVirtualMinutos() }} minutos</strong>
                    </div>
                  </div>
                </div>
              }

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
                  @if (cargandoEstudiantesInscritos()) {
                    <div class="py-4 text-center font-bold text-muted-foreground"><i class="pi pi-spin pi-spinner mr-1"></i> Consultando la nómina oficial...</div>
                  } @else if (!estudiantesInscritos().length) {
                    <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center font-bold text-amber-900">
                      No se encontraron estudiantes inscritos para este grupo. Verifique la asignatura, el grupo y el docente antes de preparar el examen.
                    </div>
                  } @else {
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
                  }
                </div>

                @if (evaluacionSeleccionadaParaParametrizar()?.modalidad === 'VIRTUAL') {
                <div class="p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-[11px] text-purple-950">
                  <div class="flex items-center gap-2 font-bold">
                    <i class="pi pi-desktop text-purple-700"></i>
                    <span>Examen virtual · respuestas guardadas automáticamente</span>
                  </div>
                  <span class="text-[10px] font-mono text-purple-800 font-black">{{ variantesCalculadas() }} variantes · sin PDF</span>
                </div>
                } @else {
                <!-- Banner informativo: configuración vigente -->
                <div class="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-[11px] text-indigo-950">
                  <div class="flex items-center gap-2 font-bold">
                    <i class="pi pi-file-edit text-indigo-700"></i>
                    <span>30 preguntas · 7 fáciles, 16 medias y 7 difíciles · hoja de respuestas externa</span>
                  </div>
                  <span class="text-[10px] font-mono text-indigo-800 font-black">Oficio · Times New Roman 11 pt</span>
                </div>
                }
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
                [disabled]="consultandoSalaVirtual() || generandoTypst() || cargandoEstudiantesInscritos()"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-102 disabled:opacity-50 disabled:cursor-wait">
                <i class="pi" [class.pi-spin]="consultandoSalaVirtual()" [class.pi-spinner]="consultandoSalaVirtual()" [class.pi-desktop]="!consultandoSalaVirtual() && evaluacionSeleccionadaParaParametrizar()?.modalidad === 'VIRTUAL'" [class.pi-bolt]="!consultandoSalaVirtual() && evaluacionSeleccionadaParaParametrizar()?.modalidad !== 'VIRTUAL'"></i>
                <span>{{ consultandoSalaVirtual() ? 'Consultando sala existente...' : (evaluacionSeleccionadaParaParametrizar()?.modalidad === 'VIRTUAL' ? 'Preparar sala virtual y accesos' : 'Generar examen PDF (30 preguntas A-E)') }}</span>
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
                <i class="pi pi-cog text-purple-400 text-lg" [class.pi-spin]="generandoTypst()"></i>
                <h3 class="text-sm font-black">{{ esGeneracionVirtualActual() ? 'Preparación de examen virtual' : 'Generación de examen' }} #{{ queueJobId }}</h3>
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

            <div class="bg-muted/40 border-t border-border p-4 flex items-center justify-between gap-3">
              @if (errorGeneracionTypst()) {
                <span class="text-[11px] font-bold text-rose-700">{{ errorGeneracionTypst() }}</span>
                <button (click)="cerrarColaGeneracion()" class="shrink-0 px-4 py-2 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground cursor-pointer">Cerrar</button>
              } @else {
                <span class="text-[11px] font-bold text-muted-foreground">{{ esGeneracionVirtualActual() ? 'Se crearán la sala y los accesos individuales; no se generará PDF.' : 'El PDF estará disponible en Documentos al completar la generación.' }}</span>
              }
            </div>

          </div>
        </div>
      }

      <!-- MODAL: SALA VIRTUAL Y TOKENS -->
      @if (dialogSalaVirtual()) {
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-purple-200 rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div class="p-5 border-b border-border flex items-start justify-between gap-4 shrink-0">
              <div><p class="text-[10px] font-black uppercase tracking-widest text-purple-700">{{ salaVirtualExistente() ? 'Sala virtual ya generada' : 'Sala virtual preparada' }}</p><h3 class="text-lg font-black text-foreground">Ingreso organizado por estudiante</h3><p class="text-xs text-muted-foreground">{{ salaVirtualExistente() ? 'Se recuperaron los datos guardados de esta sala. Los accesos individuales solo se muestran al crearla por primera vez.' : 'Comparte a cada estudiante únicamente su token. Los tokens se muestran una sola vez.' }}</p></div>
              <button (click)="cerrarSalaVirtual()" class="text-muted-foreground hover:text-foreground cursor-pointer"><i class="pi pi-times"></i></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto">
              @if (salaVirtualCreada(); as sala) {
                <div class="grid gap-3 sm:grid-cols-3">
                  <div class="rounded-xl border border-purple-200 bg-purple-50 p-4"><span class="text-[10px] font-black uppercase text-purple-700">Código de sala</span><strong class="mt-1 block font-mono text-xl text-purple-950">{{ sala.codigoSala }}</strong></div>
                  <div class="rounded-xl border border-border bg-muted/40 p-4"><span class="text-[10px] font-black uppercase text-muted-foreground">Duración</span><strong class="mt-1 block text-xl text-foreground">{{ sala.duracionMinutos }} min</strong></div>
                  <div class="rounded-xl border border-border bg-muted/40 p-4"><span class="text-[10px] font-black uppercase text-muted-foreground">Estado</span><strong class="mt-1 block text-xl text-foreground">{{ sala.estado }}</strong></div>
                </div>
                @if (accesosVirtuales().length) {
                  <div class="rounded-xl border border-amber-200 bg-amber-50 p-4"><p class="text-xs font-black text-amber-950">Tokens individuales</p><p class="mt-1 text-[11px] text-amber-900">Guárdalos o entrégalos individualmente antes de cerrar esta ventana.</p><div class="mt-3 overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="border-b border-amber-200 text-[10px] font-black uppercase text-amber-800"><th class="p-2">Estudiante</th><th class="p-2">Token</th></tr></thead><tbody>@for (acceso of accesosVirtuales(); track acceso.codigoEstudiante) {<tr class="border-b border-amber-100"><td class="p-2 font-bold">{{ acceso.codigoEstudiante }} · {{ acceso.nombreEstudiante }}</td><td class="p-2 font-mono break-all">{{ acceso.token }}</td></tr>}</tbody></table></div></div>
                } @else {
                  <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-xs text-indigo-950">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p class="font-black">Acceso para todo el grupo</p>
                        <p class="mt-1 max-w-2xl text-[11px] text-indigo-800">Los tokens individuales solo se muestran una vez, al crear la sala. Puedes emitir un token grupal nuevo y compartirlo junto con el código de sala.</p>
                      </div>
                      @if (!tokenGrupoVirtual()) {
                        <button (click)="emitirTokenGrupoDesdeLista()" [disabled]="emitiendoTokenGrupoVirtual()" class="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-[11px] font-black text-white hover:bg-indigo-700 cursor-pointer disabled:opacity-50">
                          <i class="pi" [class.pi-spin]="emitiendoTokenGrupoVirtual()" [class.pi-spinner]="emitiendoTokenGrupoVirtual()" [class.pi-key]="!emitiendoTokenGrupoVirtual()"></i>
                          {{ emitiendoTokenGrupoVirtual() ? 'Emitiendo...' : 'Emitir token grupal' }}
                        </button>
                      }
                    </div>
                    @if (tokenGrupoVirtual(); as token) {
                      <div class="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div><span class="text-[10px] font-black uppercase tracking-wide text-indigo-700">Token grupal</span><div class="mt-1 break-all rounded-xl border border-indigo-200 bg-white px-3 py-2 font-mono text-sm font-black text-indigo-950">{{ token }}</div></div>
                        <button (click)="copiarTokenGrupoDesdeLista()" class="rounded-xl border border-indigo-300 bg-white px-3 py-2 text-[11px] font-black text-indigo-700 hover:bg-indigo-100 cursor-pointer"><i class="pi pi-copy mr-1"></i>Copiar token</button>
                      </div>
                    }
                  </div>
                }
                @if (sala.participantes.length) {
                  <div class="rounded-xl border border-border bg-muted/20 p-4"><div class="flex items-center justify-between gap-3"><p class="text-xs font-black text-foreground">Estudiantes de la sala</p><span class="text-[10px] font-black text-muted-foreground">{{ sala.participantes.length }} registrados</span></div><div class="mt-3 overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="border-b border-border text-[10px] font-black uppercase text-muted-foreground"><th class="p-2">Código</th><th class="p-2">Estudiante</th><th class="p-2">Estado</th></tr></thead><tbody>@for (participante of sala.participantes; track participante.codigoEstudiante) {<tr class="border-b border-border/70"><td class="p-2 font-mono font-bold">{{ participante.codigoEstudiante }}</td><td class="p-2 font-bold">{{ participante.nombreEstudiante }}</td><td class="p-2">{{ participante.estado }}</td></tr>}</tbody></table></div></div>
                }
              }
            </div>
            <div class="p-4 border-t border-border flex flex-wrap justify-end gap-2 shrink-0">
              @if (salaVirtualCreada()?.estado === 'PREPARADA') { <button (click)="abrirSalaVirtual()" [disabled]="creandoSalaVirtual()" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black cursor-pointer disabled:opacity-50"><i class="pi pi-door-open mr-1"></i> Abrir sala para estudiantes</button> }
              @else if (salaVirtualCreada()?.estado === 'ABIERTA') { <button (click)="iniciarSalaVirtual()" [disabled]="creandoSalaVirtual()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer disabled:opacity-50"><i class="pi pi-play mr-1"></i> Iniciar examen</button> }
              @else if (salaVirtualCreada()?.estado === 'EN_CURSO' || salaVirtualCreada()?.estado === 'PAUSADA') { <span class="self-center text-[11px] font-bold text-emerald-700">Examen en curso. El tiempo lo controla el servidor.</span><button (click)="abrirDialogoRestablecerSalaVirtual()" [disabled]="creandoSalaVirtual()" class="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-black cursor-pointer disabled:opacity-50"><i class="pi pi-refresh mr-1"></i> Restablecer examen</button> }
              @else if (salaVirtualCreada()?.estado === 'CERRADA' || salaVirtualCreada()?.estado === 'CALIFICADA') { <span class="self-center text-[11px] font-bold text-amber-700">El examen concluyó y puede restablecerse por una incidencia.</span><button (click)="abrirDialogoRestablecerSalaVirtual()" [disabled]="creandoSalaVirtual()" class="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-black cursor-pointer disabled:opacity-50"><i class="pi pi-refresh mr-1"></i> Restablecer examen</button> }
              @else { <span class="self-center text-[11px] font-bold text-muted-foreground">La sala ya concluyó.</span> }
              <button (click)="cerrarSalaVirtual()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cerrar</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL: MOTIVO DE RESTABLECIMIENTO DE SALA VIRTUAL -->
      @if (dialogRestablecerSalaVirtual()) {
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div class="bg-card border border-amber-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div class="p-5 border-b border-border flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <div class="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center"><i class="pi pi-refresh"></i></div>
                <div>
                  <h3 class="text-sm font-black text-foreground">Restablecer examen virtual</h3>
                  <p class="text-xs text-muted-foreground">{{ salaVirtualCreada()?.codigoSala }}</p>
                </div>
              </div>
              <button (click)="cerrarDialogoRestablecerSalaVirtual()" class="text-muted-foreground hover:text-foreground cursor-pointer"><i class="pi pi-times"></i></button>
            </div>
            <div class="p-5 space-y-4 text-xs">
              <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 leading-relaxed">
                La sala volverá a estar disponible para los estudiantes. Se conservarán las respuestas guardadas y el restablecimiento quedará registrado en la bitácora.
              </div>
              <label class="block space-y-1.5">
                <span class="font-black text-foreground">Motivo del restablecimiento</span>
                <textarea [(ngModel)]="motivoRestablecimientoSalaVirtual" rows="3" placeholder="Ej.: interrupción de internet durante el examen" class="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs font-medium text-foreground outline-none focus:border-amber-500"></textarea>
              </label>
            </div>
            <div class="p-4 border-t border-border flex justify-end gap-2">
              <button (click)="cerrarDialogoRestablecerSalaVirtual()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cancelar</button>
              <button (click)="restablecerSalaVirtual()" [disabled]="!motivoRestablecimientoSalaVirtual.trim() || creandoSalaVirtual()" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black cursor-pointer disabled:opacity-50">
                <i class="pi" [class.pi-spin]="creandoSalaVirtual()" [class.pi-spinner]="creandoSalaVirtual()" [class.pi-refresh]="!creandoSalaVirtual()"></i> {{ creandoSalaVirtual() ? 'Restableciendo...' : 'Confirmar restablecimiento' }}
              </button>
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
                    <span>Job</span><span>Rol de examen</span><span>Estado</span><span>Detalle</span>
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

                    @if (varComp) {
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
                    } @else {
                      <div class="max-w-4xl mx-auto p-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-amber-900 text-xs">
                        No existe una variante oficial persistida para este estudiante. Genere el examen desde el banco validado antes de visualizarlo.
                      </div>
                    }
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
                Documentos oficiales generados y persistidos para la evaluación seleccionada
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
              <div class="font-bold text-foreground">{{ evaluacionSeleccionadaParaBitacora()?.codigo }} · {{ evaluacionSeleccionadaParaBitacora()?.materia }}</div>
              <div class="text-[10px] text-muted-foreground">{{ evaluacionSeleccionadaParaBitacora()?.tipo }} · {{ evaluacionSeleccionadaParaBitacora()?.grupo }} · Estado actual: {{ evaluacionSeleccionadaParaBitacora()?.estado }}</div>
            </div>
            @if (cargandoBitacora()) {
              <div class="py-8 text-center text-xs font-bold text-muted-foreground">
                <i class="pi pi-spin pi-spinner text-xl text-purple-700"></i>
                <p class="mt-2">Cargando actividades...</p>
              </div>
            } @else if (errorBitacora()) {
              <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">{{ errorBitacora() }}</div>
            } @else if (auditoriaBitacora().length === 0) {
              <div class="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">Todavía no hay actividades registradas para este rol de examen.</div>
            } @else {
              <div class="max-h-[52vh] overflow-y-auto space-y-2 pr-1">
                @for (evento of auditoriaBitacora(); track evento.id) {
                  <div class="rounded-xl border border-border bg-card p-3 shadow-2xs">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="text-xs font-black text-foreground">{{ descripcionAuditoria(evento) }}</div>
                        <div class="mt-1 text-[10px] text-muted-foreground">
                          {{ etapaAuditoria(evento) }}
                        </div>
                      </div>
                      <i class="pi pi-clock shrink-0 text-purple-700"></i>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-muted-foreground">
                      <span><i class="pi pi-calendar mr-1"></i>{{ formatearFechaHoraAuditoria(evento.fechaEvento) }}</span>
                      <span><i class="pi pi-user mr-1"></i>{{ evento.usuario || 'Sistema' }}</span>
                    </div>
                    @if (detalleAuditoria(evento)) {
                      <div class="mt-2 rounded-lg bg-muted/50 px-2.5 py-2 text-[10px] text-muted-foreground">{{ detalleAuditoria(evento) }}</div>
                    }
                  </div>
                }
              </div>
            }
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
                <div class="py-10 text-center text-xs font-bold text-muted-foreground"><i class="pi pi-spinner pi-spin text-primary mr-2"></i>Consultando nómina oficial...</div>
              } @else {
                @if (loteCartillasActual(); as preparacion) {
                  <div class="rounded-xl border border-teal-200 bg-teal-50/40 p-4 text-xs text-teal-900 leading-relaxed">
                    La nómina se consulta directamente del SEA. Las marcas se generan en memoria únicamente al imprimir; no se guarda el PDF ni un lote de cartillas en el sistema.
                  </div>
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="rounded-xl border border-border bg-muted/40 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Estudiantes</span><strong class="text-lg text-foreground">{{ preparacion.totalCartillas }}</strong></div>
                    <div class="rounded-xl border border-border bg-muted/40 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Impresión</span><strong class="text-sm" [class.text-emerald-700]="preparacion.estadoImpresion === 'IMPRESO'" [class.text-amber-700]="preparacion.estadoImpresion === 'PENDIENTE'">{{ preparacion.estadoImpresion }}</strong></div>
                    <div class="rounded-xl border border-border bg-muted/40 p-3"><span class="block text-[10px] uppercase font-bold text-muted-foreground">Formato</span><strong class="text-sm text-foreground">1 por página A4</strong></div>
                  </div>
                  <div class="max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border text-xs">
                    @for (estudiante of preparacion.estudiantes; track estudiante.codigoEstudiante) {
                      <div class="grid grid-cols-[36px_90px_1fr] gap-2 p-2.5 items-center">
                        <span class="font-mono text-muted-foreground">{{ estudiante.numeroOrden }}</span>
                        <span class="font-mono font-bold">{{ estudiante.codigoEstudiante }}</span>
                        <span class="truncate font-medium">{{ estudiante.nombreCompleto }}</span>
                      </div>
                    }
                  </div>
                }
              }
            </div>
            <div class="p-4 border-t border-border flex flex-wrap justify-end gap-2">
              <button (click)="cerrarGestionCartillas()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cerrar</button>
              @if (loteCartillasActual(); as preparacion) {
                <button (click)="imprimirCartillas()" [disabled]="generandoCartillas()" class="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"><i class="pi" [class.pi-spinner]="generandoCartillas()" [class.pi-spin]="generandoCartillas()" [class.pi-print]="!generandoCartillas()"></i>{{ generandoCartillas() ? 'Preparando impresión...' : 'Imprimir marcas' }}</button>
                @if (preparacion.estadoImpresion !== 'IMPRESO') {
                  <button (click)="confirmarImpresionCartillas()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"><i class="pi pi-check mr-1.5"></i>Marcar como impreso</button>
                }
              }
            </div>
          </div>
        </div>
      }

      <!-- MODAL: CONFIGURACIÓN PERSISTIDA DE VARIANTES Y ASIGNACIONES -->
      @if (dialogConfiguracionGeneracion()) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-6xl w-full max-h-[92vh] shadow-2xl overflow-hidden flex flex-col">
            <div class="p-5 border-b border-border flex items-start justify-between gap-4 shrink-0">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center"><i class="pi pi-sitemap text-lg"></i></div>
                <div>
                <h3 class="text-sm font-black text-foreground">Variantes y asignaciones</h3>
                  <p class="text-xs text-muted-foreground">{{ evaluacionSeleccionadaConfiguracion()?.codigo }} · {{ evaluacionSeleccionadaConfiguracion()?.materia }} · datos persistidos de la generación</p>
                </div>
              </div>
              <button (click)="cerrarConfiguracionGeneracion()" class="text-muted-foreground hover:text-foreground cursor-pointer"><i class="pi pi-times"></i></button>
            </div>

            <div class="p-5 overflow-y-auto space-y-5">
              @if (cargandoConfiguracionGeneracion()) {
                <div class="py-14 text-center text-xs font-bold text-muted-foreground"><i class="pi pi-spinner pi-spin text-primary mr-2"></i>Cargando configuración guardada...</div>
              } @else {
                @if (configuracionGeneracion(); as configuracion) {
                  <div class="grid grid-cols-2 gap-3 max-w-md">
                    <div class="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-center"><span class="block text-[10px] uppercase font-bold text-indigo-700">Variantes</span><strong class="text-xl text-indigo-950">{{ configuracion.variantes.length }}</strong></div>
                    <div class="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-center"><span class="block text-[10px] uppercase font-bold text-emerald-700">Estudiantes asignados</span><strong class="text-xl text-emerald-950">{{ configuracion.mapeos.length }}</strong></div>
                  </div>

                  <section>
                    <h4 class="text-xs font-black uppercase tracking-wide text-foreground mb-2">Metadatos de variantes</h4>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      @for (variante of configuracion.variantes; track variante.letra) {
                        <div class="rounded-xl border border-border overflow-hidden">
                          <div class="px-3 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                            <span class="text-xs font-black text-indigo-900">VARIANTE {{ variante.letra }}</span>
                            <span class="text-[10px] font-mono text-indigo-700">Semilla: {{ variante.semilla }}</span>
                          </div>
                          <div class="p-3 text-xs text-muted-foreground">
                            {{ variante.totalPreguntas || 0 }} preguntas protegidas · patrón OMR reservado al proceso de calificación.
                          </div>
                        </div>
                      }
                    </div>
                  </section>

                  <section>
                    <h4 class="text-xs font-black uppercase tracking-wide text-foreground mb-2">Asignación confidencial estudiante–variante</h4>
                    <div class="border border-border rounded-xl overflow-hidden">
                      <div class="grid grid-cols-[55px_1fr_140px_1fr] gap-3 bg-muted/60 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground"><span>N°</span><span>Estudiante</span><span>Variante</span><span>Hash de control</span></div>
                      <div class="max-h-64 overflow-y-auto divide-y divide-border">
                        @for (mapeo of configuracion.mapeos; track mapeo.codigoEstudiante) {
                          <div class="grid grid-cols-[55px_1fr_140px_1fr] gap-3 px-3 py-2 items-center text-[11px]">
                            <span class="font-mono text-muted-foreground">{{ $index + 1 }}</span>
                            <span class="truncate"><strong>{{ mapeo.codigoEstudiante }}</strong><span class="text-muted-foreground ml-2">{{ nombreMapeo(mapeo) }}</span></span>
                            <span class="font-black text-indigo-700">TIPO {{ mapeo.letraVariante }}</span>
                            <span class="font-mono text-[10px] text-muted-foreground truncate" [title]="mapeo.hashControl">{{ mapeo.hashControl || '—' }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  </section>
                } @else {
                  <div class="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-xs text-amber-900">No existe una configuración de variantes persistida para esta evaluación.</div>
                }
              }
            </div>

            <div class="p-4 border-t border-border flex justify-end shrink-0">
              <button (click)="cerrarConfiguracionGeneracion()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer">Cerrar</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL: CALIFICACIÓN OMR PARA PASAR A CALIFICADO -->
      @if (dialogCalificacionOmr()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-5xl w-full max-h-[94vh] shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-950 text-white p-5 flex items-start justify-between gap-4 shrink-0">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center"><i class="pi pi-check-square text-lg text-purple-200"></i></div>
                <div>
                  <h3 class="text-sm font-black">Calificación OMR · pasar a Calificado</h3>
                  <p class="text-[11px] text-white/70">{{ evaluacionSeleccionadaOmr()?.codigo }} · {{ evaluacionSeleccionadaOmr()?.grupo }} · el patrón se toma de la asignación interna.</p>
                </div>
              </div>
              <button (click)="cerrarCalificacionOmr()" aria-label="Cerrar calificación OMR" title="Cerrar" class="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"><i class="pi pi-times"></i></button>
            </div>

            <div class="p-5 overflow-y-auto space-y-4">
              <input #archivoOmrInput type="file" accept=".pdf,image/png,image/jpeg" class="hidden" (change)="seleccionarArchivoOmr($event)" />
              <div class="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="text-xs text-indigo-950">
                  <div class="font-black">Escaneado de cartillas</div>
                  <div class="text-[11px] mt-1">Se revisará cada página: código del estudiante, grilla y respuestas. Los códigos se cotejan exclusivamente con la nómina y su patrón de variante.</div>
                  @if (archivoOmrSeleccionado()) {
                    <div class="font-mono font-bold text-indigo-700 mt-2"><i class="pi pi-file mr-1"></i>{{ archivoOmrSeleccionado()?.name }}</div>
                  }
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button (click)="archivoOmrInput.click()" class="px-3 py-2 rounded-xl border border-indigo-300 bg-white text-indigo-800 text-xs font-black cursor-pointer hover:bg-indigo-100"><i class="pi pi-folder-open mr-1.5"></i>{{ archivoOmrSeleccionado() ? 'Cambiar escaneado' : 'Seleccionar PDF' }}</button>
                  <button (click)="ejecutarCalificacionOmr()" [disabled]="procesandoCalificacionOmr() || !archivoOmrSeleccionado()" class="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black cursor-pointer disabled:opacity-50"><i class="pi" [class.pi-spin]="procesandoCalificacionOmr()" [class.pi-spinner]="procesandoCalificacionOmr()" [class.pi-bolt]="!procesandoCalificacionOmr()"></i> {{ procesandoCalificacionOmr() ? 'Procesando...' : 'Ejecutar OMR' }}</button>
                </div>
              </div>

              @if (mensajeCalificacionOmr()) {
                <div class="rounded-xl border px-3 py-2.5 text-xs font-bold" [class.border-amber-300]="!errorCalificacionOmr()" [class.bg-amber-50]="!errorCalificacionOmr()" [class.text-amber-900]="!errorCalificacionOmr()" [class.border-rose-300]="errorCalificacionOmr()" [class.bg-rose-50]="errorCalificacionOmr()" [class.text-rose-900]="errorCalificacionOmr()"><i class="pi mr-1.5" [class.pi-info-circle]="!errorCalificacionOmr()" [class.pi-exclamation-triangle]="errorCalificacionOmr()"></i>{{ mensajeCalificacionOmr() }}</div>
              }

              @if (procesandoCalificacionOmr()) {
                <div class="py-12 text-center text-xs font-bold text-muted-foreground"><i class="pi pi-spin pi-spinner text-2xl text-purple-700"></i><p class="mt-2">Procesando todas las páginas del PDF...</p><p class="text-[10px] font-normal mt-1">El motor OMR está leyendo código y marcajes.</p></div>
              } @else {
                @if (resultadoCalificacionOmr(); as resultado) {
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="text-xs font-black text-foreground">Inspección del lote · {{ resultado.totalPaginas || resultado.resultados?.length || 0 }} páginas</div>
                  <span class="text-[10px] font-black px-2.5 py-1 rounded-full" [class.bg-emerald-100]="todasPaginasCalificadas(resultado)" [class.text-emerald-800]="todasPaginasCalificadas(resultado)" [class.bg-amber-100]="!todasPaginasCalificadas(resultado)" [class.text-amber-900]="!todasPaginasCalificadas(resultado)">{{ todasPaginasCalificadas(resultado) ? 'LISTO PARA CALIFICAR' : 'REQUIERE REVISIÓN MANUAL' }}</span>
                </div>
                <div class="rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2.5 text-[11px] text-indigo-950">
                  <i class="pi pi-pencil mr-1.5"></i>
                  Verifique cada número de pregunta. Puede corregir el código y seleccionar la respuesta leída; al guardar se recalculan los aciertos, fallos, dobles y notas usando el patrón oficial de la variante.
                </div>
                <div class="border border-border rounded-xl overflow-hidden divide-y divide-border">
                  @for (lectura of resultado.resultados ?? []; track lectura.pagina) {
                    <div class="p-3 space-y-2">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-2 text-xs font-black"><span class="bg-muted rounded-lg px-2 py-1">Página {{ lectura.pagina }}</span><span [class.text-emerald-700]="lectura.estado === 'CALIFICADO'" [class.text-amber-700]="lectura.estado !== 'CALIFICADO'">{{ lectura.estado === 'CALIFICADO' ? 'Código y patrón validados' : 'Código no reconocido' }}</span></div>
                        <div class="flex items-center gap-2 text-[10px] font-mono text-muted-foreground"><span>Marcajes: {{ cantidadRespuestasLeidas(lectura) }}/{{ lectura.totalReactivos || 30 }}</span><span class="px-2 py-0.5 rounded border" [class.border-emerald-200]="!!lectura.grilla" [class.text-emerald-700]="!!lectura.grilla" [class.border-amber-200]="!lectura.grilla" [class.text-amber-700]="!lectura.grilla">{{ lectura.grilla ? 'Grilla detectada' : 'Grilla no detectada' }}</span></div>
                      </div>
                      <div class="grid grid-cols-1 lg:grid-cols-[minmax(250px,0.9fr)_minmax(400px,1.1fr)] gap-3 items-start">
                        <div class="rounded-xl border border-sky-200 bg-slate-950/95 p-2">
                          <div class="mb-2 flex items-center justify-between gap-2"><span class="text-[10px] font-black uppercase text-white/80"><i class="pi pi-image mr-1 text-sky-300"></i>Escaneado · página {{ lectura.pagina }}</span><button (click)="alternarPreviewPaginaOmr(lectura.pagina)" [disabled]="cargandoPreviewOmr() || !previewPaginaOmr(lectura.pagina)" class="px-2 py-1 rounded-md border border-white/20 text-white/80 text-[10px] font-black cursor-pointer hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"><i class="pi mr-1" [class.pi-eye]="paginaPreviewOmr() !== lectura.pagina" [class.pi-eye-slash]="paginaPreviewOmr() === lectura.pagina"></i>{{ paginaPreviewOmr() === lectura.pagina ? 'Ocultar' : 'Mostrar' }}</button></div>
                          @if (paginaPreviewOmr() === lectura.pagina && previewPaginaOmr(lectura.pagina)) {
                            <div class="flex justify-center overflow-auto max-h-[34rem]"><img [src]="previewPaginaOmr(lectura.pagina)" [alt]="'Página escaneada ' + lectura.pagina" class="max-w-full h-auto object-contain rounded-lg shadow-lg" /></div>
                            <div class="text-center text-[10px] text-white/70 mt-1.5">Compare aquí cada número y marcaje con la lectura.</div>
                          } @else if (cargandoPreviewOmr()) {
                            <div class="py-14 text-center text-xs text-white/80"><i class="pi pi-spin pi-spinner text-xl text-sky-300"></i><p class="mt-2">Preparando página escaneada...</p></div>
                          } @else {
                            <div class="py-14 text-center text-xs text-white/70"><i class="pi pi-eye text-xl text-sky-300"></i><p class="mt-2">Presione “Mostrar” para ver esta página.</p></div>
                          }
                        </div>

                        <div class="space-y-2 min-w-0">
                          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                            <div class="col-span-2 rounded-lg bg-muted/50 p-2"><label class="block text-muted-foreground uppercase font-bold">Código del estudiante</label><input [value]="codigoOmr(lectura)" (input)="editarCodigoOmr(lectura, $any($event.target).value)" inputmode="numeric" maxlength="30" class="mt-1 w-full rounded-md border border-indigo-200 bg-white px-2 py-1 font-mono text-xs font-black text-foreground outline-none focus:border-indigo-500" placeholder="Ingrese código manualmente" /><button (click)="recalibrarPaginaOmr(lectura)" [disabled]="!codigoOmr(lectura) || recalibrandoOmr()[lectura.pagina]" class="mt-2 w-full rounded-md bg-indigo-700 px-2 py-1.5 text-[10px] font-black text-white cursor-pointer hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"><i class="pi mr-1" [class.pi-spin]="recalibrandoOmr()[lectura.pagina]" [class.pi-spinner]="recalibrandoOmr()[lectura.pagina]" [class.pi-refresh]="!recalibrandoOmr()[lectura.pagina]"></i>{{ recalibrandoOmr()[lectura.pagina] ? 'Validando...' : 'Validar código y recalibrar' }}</button></div>
                            <div class="rounded-lg bg-muted/50 p-2"><span class="block text-muted-foreground uppercase font-bold">Estado código</span><strong [class.text-emerald-700]="lectura.codigoValidado" [class.text-amber-700]="!lectura.codigoValidado">{{ lectura.codigoValidado ? 'Detectado / validado' : 'Pendiente de validar' }}</strong></div>
                            <div class="rounded-lg bg-muted/50 p-2"><span class="block text-muted-foreground uppercase font-bold">Variante</span><strong class="text-indigo-700">{{ lectura.letraVariante ? 'TIPO ' + lectura.letraVariante : '—' }}</strong></div>
                            <div class="rounded-lg bg-muted/50 p-2"><span class="block text-muted-foreground uppercase font-bold">OCR candidato</span><strong class="font-mono text-foreground">{{ (lectura.codigoOcr || []).join(', ') || '—' }}</strong></div>
                            <div class="rounded-lg bg-muted/50 p-2"><span class="block text-muted-foreground uppercase font-bold">Aciertos / Nota</span><strong class="text-emerald-700">{{ lectura.aciertos ?? 0 }} · {{ lectura.notaSobre30 ?? 0 }}/30</strong></div>
                          </div>
                          <div class="rounded-lg border border-border bg-card p-2">
                            <div class="mb-2 flex items-center justify-between gap-2"><span class="text-[10px] font-black uppercase text-muted-foreground">Respuestas detectadas · revisión por pregunta</span><span class="text-[10px] text-muted-foreground">— blanco · AB doble</span></div>
                            <div class="grid grid-cols-2 gap-1.5">
                              @for (pregunta of preguntasOmr(lectura); track pregunta) {
                                <label class="flex items-center gap-1 rounded-md border border-border bg-muted/30 px-1.5 py-1 text-[10px]" [title]="'Leída: ' + (respuestaOmr(lectura, pregunta) || 'blanco') + (respuestaCorrectaOmr(lectura, pregunta) ? ' · Clave: ' + respuestaCorrectaOmr(lectura, pregunta) : '')"><span class="w-5 shrink-0 font-mono font-black text-muted-foreground">{{ pregunta }}</span><span class="w-5 shrink-0 rounded bg-white text-center font-mono font-black text-indigo-700">{{ respuestaOmr(lectura, pregunta) || '—' }}</span><select [value]="respuestaOmr(lectura, pregunta)" (change)="editarRespuestaOmr(lectura, pregunta, $any($event.target).value)" class="min-w-0 flex-1 rounded border-0 bg-transparent py-0 text-[10px] font-black text-foreground outline-none"><option value="">—</option>@for (opcion of opcionesRespuestaOmr; track opcion) { <option [value]="opcion">{{ opcion }}</option> }</select><span class="w-14 shrink-0 text-right text-[9px] font-black" [class.text-emerald-700]="estadoPreguntaOmr(lectura, pregunta) === 'CORRECTA'" [class.text-rose-700]="estadoPreguntaOmr(lectura, pregunta) === 'INCORRECTA'" [class.text-amber-700]="estadoPreguntaOmr(lectura, pregunta) === 'DOBLE_MARCA'" [class.text-slate-500]="estadoPreguntaOmr(lectura, pregunta) === 'EN_BLANCO'" [class.text-indigo-700]="estadoPreguntaOmr(lectura, pregunta) === 'LEIDA'">{{ etiquetaEstadoPreguntaOmr(lectura, pregunta) }}</span></label>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      @if (lectura.mensaje) { <div class="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">{{ lectura.mensaje }}</div> }
                    </div>
                  }
                </div>
                }
              }
            </div>

            <div class="p-4 border-t border-border flex flex-wrap items-center justify-end gap-2 shrink-0">
              <button (click)="cerrarCalificacionOmr()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cerrar</button>
              @if (resultadoCalificacionOmr(); as resultado) {
                <button (click)="confirmarCalificacion(resultado)" [disabled]="!todasPaginasCalificadas(resultado) || guardandoCalificacionOmr()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer disabled:opacity-50"><i class="pi" [class.pi-spin]="guardandoCalificacionOmr()" [class.pi-spinner]="guardandoCalificacionOmr()" [class.pi-check]="!guardandoCalificacionOmr()"></i> {{ guardandoCalificacionOmr() ? 'Guardando ajustes...' : 'Guardar resultados y pasar a Calificado' }}</button>
              }
            </div>
          </div>
        </div>
      }

      <!-- MODAL: NOTAS OMR -->
      @if (dialogNotasOmr()) {
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-5xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div class="p-5 border-b border-border flex items-start justify-between gap-4 shrink-0"><div><h3 class="text-sm font-black text-foreground">Notas OMR de la evaluación</h3><p class="text-xs text-muted-foreground">{{ evaluacionSeleccionadaNotas()?.codigo }} · resultados guardados en el servidor</p></div><button (click)="cerrarNotasOmr()" class="text-muted-foreground hover:text-foreground cursor-pointer"><i class="pi pi-times"></i></button></div>
            <div class="p-5 overflow-y-auto">
              @if (cargandoNotasOmr()) { <div class="py-12 text-center text-xs font-bold text-muted-foreground"><i class="pi pi-spin pi-spinner text-xl text-purple-700"></i><p class="mt-2">Cargando notas...</p></div> }
              @else if (notasOmr().length === 0) { <div class="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-xs text-amber-900">Todavía no existen calificaciones OMR guardadas para esta evaluación.</div> }
              @else { <div class="border border-border rounded-xl overflow-hidden"><div class="grid grid-cols-[50px_1fr_90px_90px_90px_100px] gap-2 bg-muted/60 px-3 py-2 text-[10px] font-black uppercase text-muted-foreground"><span>N°</span><span>Estudiante</span><span>Variante</span><span>/30</span><span>/100</span><span>Estado</span></div><div class="divide-y divide-border">@for (nota of notasOmr(); track nota.id) {<div class="grid grid-cols-[50px_1fr_90px_90px_90px_100px] gap-2 px-3 py-2.5 items-center text-xs"><span class="font-mono text-muted-foreground">{{ $index + 1 }}</span><span><strong class="block">{{ nota.codigoEstudiante }}</strong><span class="text-[10px] text-muted-foreground">{{ nota.estudianteNombreCompleto }}</span></span><span class="font-black text-indigo-700">TIPO {{ nota.letraVariante }}</span><strong>{{ nota.notaSobre30 }}</strong><strong>{{ nota.notaSobre100 }}</strong><span class="text-[10px] font-black" [class.text-emerald-700]="nota.estadoCalificacion === 'APROBADO'" [class.text-rose-700]="nota.estadoCalificacion !== 'APROBADO'">{{ nota.estadoCalificacion }}</span></div>}</div></div> }
            </div>
            <div class="p-4 border-t border-border flex justify-end shrink-0"><button (click)="cerrarNotasOmr()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black cursor-pointer">Cerrar</button></div>
          </div>
        </div>
      }

      <!-- MODAL: RESULTADOS DEL EXAMEN VIRTUAL -->
      @if (dialogResultadosVirtuales()) {
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-cyan-200 rounded-2xl max-w-6xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div class="p-5 border-b border-border flex items-start justify-between gap-4 shrink-0"><div><p class="text-[10px] font-black uppercase tracking-widest text-cyan-700">Evaluación virtual concluida</p><h3 class="text-lg font-black text-foreground">Resultados y respuestas marcadas</h3><p class="text-xs text-muted-foreground">{{ evaluacionSeleccionadaResultados()?.codigo }} · calificación automática al cierre de la sala</p></div><button (click)="cerrarResultadosVirtuales()" class="text-muted-foreground hover:text-foreground cursor-pointer"><i class="pi pi-times"></i></button></div>
            <div class="p-5 overflow-y-auto">
              @if (cargandoResultadosVirtuales()) { <div class="py-12 text-center text-xs font-bold text-muted-foreground"><i class="pi pi-spin pi-spinner text-xl text-cyan-700"></i><p class="mt-2">Cargando respuestas y calificaciones...</p></div> }
              @else if (resultadosVirtuales().length === 0) { <div class="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-xs text-amber-900">Todavía no existen resultados para esta sala.</div> }
              @else { <div class="space-y-3">@for (resultado of resultadosVirtuales(); track resultado.intentoId) {<article class="rounded-xl border border-border bg-muted/20 p-4"><div class="flex flex-wrap items-center justify-between gap-3"><div><strong class="text-sm text-foreground">{{ resultado.codigoEstudiante }} · {{ resultado.nombreEstudiante }}</strong><p class="mt-1 text-[10px] font-black uppercase text-cyan-700">Variante {{ resultado.letraVariante || '—' }} · {{ resultado.estado }}</p></div><div class="flex gap-4 text-xs"><span><small class="block text-[10px] text-muted-foreground">Aciertos</small><b>{{ resultado.aciertos ?? 0 }}/30</b></span><span><small class="block text-[10px] text-muted-foreground">Nota /30</small><b>{{ resultado.notaSobre30 || '0.00' }}</b></span><span><small class="block text-[10px] text-muted-foreground">Nota /100</small><b>{{ resultado.notaSobre100 || '0.00' }}</b></span></div></div><div class="mt-3 flex flex-wrap gap-1.5">@for (respuesta of resultado.respuestas; track respuesta.numeroPregunta) {<span class="rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-[10px] font-black text-cyan-900">{{ respuesta.numeroPregunta }}: {{ respuesta.respuesta }}</span>} @if (!resultado.respuestas.length) {<span class="text-[11px] text-muted-foreground">Sin respuestas marcadas</span>}</div></article>}</div> }
            </div>
            <div class="p-4 border-t border-border flex justify-end shrink-0"><button (click)="cerrarResultadosVirtuales()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black cursor-pointer">Cerrar</button></div>
          </div>
        </div>
      }

      <!-- MODAL: CARGA DE NOTAS DEL DOCENTE PARA SIN CARTILLA -->
      @if (dialogNotasDocente()) {
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-amber-200 rounded-2xl max-w-5xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div class="p-5 border-b border-border flex items-start justify-between gap-4 shrink-0">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-amber-700">Examen presencial sin cartilla</p>
                <h3 class="text-lg font-black text-foreground">{{ evaluacionSeleccionadaNotasDocente()?.etapa === 'Pendiente de notas' ? 'Carga de notas por estudiante' : 'Reporte de notas registradas' }}</h3>
                <p class="text-xs text-muted-foreground">{{ evaluacionSeleccionadaNotasDocente()?.codigo }} · {{ evaluacionSeleccionadaNotasDocente()?.materia }} · {{ evaluacionSeleccionadaNotasDocente()?.grupo }}</p>
              </div>
              <button (click)="cerrarNotasDocente()" class="text-muted-foreground hover:text-foreground cursor-pointer"><i class="pi pi-times"></i></button>
            </div>
            <div class="p-5 overflow-y-auto space-y-4">
              <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950">
                <i class="pi pi-info-circle mr-1.5"></i>
                {{ evaluacionSeleccionadaNotasDocente()?.etapa === 'Pendiente de notas' ? 'Registre la nota sobre 30 de cada estudiante de la nómina oficial. Al guardar todas las notas, la evaluación pasará a Calificado.' : 'Las notas se calcularon y guardaron tomando como fuente la nómina oficial de los servicios institucionales.' }}
              </div>
              @if (cargandoNotasDocente()) {
                <div class="py-12 text-center text-xs font-bold text-muted-foreground"><i class="pi pi-spin pi-spinner text-xl text-amber-700"></i><p class="mt-2">Consultando nómina oficial y notas...</p></div>
              } @else if (notasDocente().length === 0) {
                <div class="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-xs text-amber-900">No se pudo obtener la nómina oficial del grupo.</div>
              } @else {
                <div class="border border-border rounded-xl overflow-hidden">
                  <div class="grid grid-cols-[55px_1fr_150px_150px] gap-3 bg-muted/60 px-4 py-3 text-[10px] font-black uppercase text-muted-foreground"><span>N°</span><span>Estudiante</span><span>Nota /30</span><span>Nota /100</span></div>
                  <div class="divide-y divide-border">
                    @for (nota of notasDocente(); track nota.codigoEstudiante; let idx = $index) {
                      <div class="grid grid-cols-[55px_1fr_150px_150px] gap-3 px-4 py-3 items-center text-xs">
                        <span class="font-mono text-muted-foreground">{{ idx + 1 }}</span>
                        <span><strong class="block">{{ nota.codigoEstudiante }}</strong><span class="text-[10px] text-muted-foreground uppercase">{{ nota.estudianteNombreCompleto }}</span></span>
                        <input type="number" min="0" max="30" step="0.01" [value]="nota.notaSobre30 ?? ''" (input)="editarNotaDocente(nota.codigoEstudiante, $any($event.target).value)" [disabled]="evaluacionSeleccionadaNotasDocente()?.etapa !== 'Pendiente de notas' || guardandoNotasDocente()" class="rounded-lg border border-amber-200 bg-white px-3 py-2 font-mono text-xs font-black text-foreground outline-none focus:border-amber-500 disabled:bg-muted disabled:cursor-not-allowed" placeholder="0–30" />
                        <span class="rounded-lg bg-emerald-50 px-3 py-2 font-mono text-xs font-black text-emerald-800">{{ nota.notaSobre100 ?? '—' }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
            <div class="p-4 border-t border-border flex flex-wrap items-center justify-between gap-2 shrink-0">
              <span class="text-[10px] text-muted-foreground">{{ notasDocenteConCarga() }} de {{ notasDocente().length }} notas registradas</span>
              <div class="flex gap-2">
                <button (click)="imprimirReporteNotasDocente()" [disabled]="!notasDocente().length" class="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 text-xs font-black cursor-pointer disabled:opacity-40"><i class="pi pi-print mr-1"></i> Imprimir reporte</button>
                <button (click)="cerrarNotasDocente()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black cursor-pointer">Cerrar</button>
                @if (evaluacionSeleccionadaNotasDocente()?.etapa === 'Pendiente de notas') {
                  <button (click)="guardarNotasDocente()" [disabled]="!notasDocenteCompletas() || guardandoNotasDocente()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer disabled:opacity-50"><i class="pi" [class.pi-spin]="guardandoNotasDocente()" [class.pi-spinner]="guardandoNotasDocente()" [class.pi-check]="!guardandoNotasDocente()"></i> {{ guardandoNotasDocente() ? 'Guardando...' : 'Guardar y calificar' }}</button>
                }
              </div>
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
export class EvaluacionesDiaComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _gateway = inject(UnitepcGatewayService);
  private readonly _rolService = inject(RolExamenService);
  private readonly _studentService = inject(EstudiantesGatewayService);
  private readonly _generacionTypst = inject(GeneracionTypstService);
  private readonly _bancoService = inject(BancoPreguntasService);
  private readonly _cartillasOmr = inject(CartillasOmrService);
  private readonly _omrService = inject(OmrProcesamientoService);
  private readonly _configuracionEvaluaciones = inject(ConfiguracionEvaluacionesService);
  private readonly _sinCartillaService = inject(ExamenSinCartillaService);

  // Sedes y Carreras desde SEA Gateway
  public sedes = signal<BranchOffice[]>([]);
  public sedeSeleccionada = signal<BranchOffice | null>(null);

  public carreras = signal<Career[]>([]);
  public carreraSeleccionada = signal<Career | null>(null);

  public cargando = signal<boolean>(false);
  public cargandoCarreras = signal<boolean>(false);

  // Filtros Parametrizados
  public filtroParcial: string = '1er Parcial';
  public filtroModalidad: 'Todos' | 'PRESENCIAL_CARTILLA' | 'PRESENCIAL_SIN_CARTILLA' | 'VIRTUAL' = 'Todos';
  
  // No usar toISOString(): convierte la hora local a UTC y en Bolivia puede
  // mover la fecha al día siguiente durante la noche.
  public readonly hoyIso = fechaIsoLocal();
  public filtroFechaInicio: string = this.hoyIso;
  public filtroFechaFin: string = this.hoyIso;

  public busquedaTexto = '';
  public filtrosActualizados = signal(0);
  
  // Multi-Selección de Estados
  public estadosSeleccionados = signal<string[]>([]);

  public readonly listaEtapas: string[] = [
    'Programado', 'Validado', 'Generado', 'Impreso', 'Entregado', 'Devuelto', 'Pendiente de notas', 'Calificado'
  ];

  // Flujo oficial único. Pendiente de notas habilita la carga de resultados
  // del docente; Calificado es el estado final para cualquier modalidad.
  public readonly flujoOficial: StepDef[] = [
    { key: 'Programado', label: 'Programado', icon: 'pi pi-calendar' },
    { key: 'Validado', label: 'Validado', icon: 'pi pi-shield' },
    { key: 'Generado', label: 'Generado', icon: 'pi pi-bolt' },
    { key: 'Impreso', label: 'Impreso', icon: 'pi pi-print' },
    { key: 'Entregado', label: 'Entregado', icon: 'pi pi-send' },
    { key: 'Devuelto', label: 'Devuelto', icon: 'pi pi-replay' },
    { key: 'Pendiente de notas', label: 'Pendiente de notas', icon: 'pi pi-upload' },
    { key: 'Calificado', label: 'Calificado', icon: 'pi pi-check-circle' }
  ];

  // Modales
  public dialogReporteDiario = signal<boolean>(false);
  public evaluacionSeleccionadaParaValidar = signal<EvaluacionItemUI | null>(null);
  public evaluacionSeleccionadaParaParametrizar = signal<EvaluacionItemUI | null>(null);
  public evaluacionSeleccionadaParaBitacora = signal<EvaluacionItemUI | null>(null);
  public auditoriaBitacora = signal<AuditoriaRolExamen[]>([]);
  public cargandoBitacora = signal<boolean>(false);
  public errorBitacora = signal<string>('');
  public evaluacionSeleccionadaParaReestablecer = signal<EvaluacionItemUI | null>(null);
  public motivoReestablecimiento = '';
  public restableciendo = signal<boolean>(false);

  public dialogVisorExamen = signal<boolean>(false);
  public tabVisorActiva = signal<'examen' | 'patron'>('examen');
  public evaluacionActivaVisor = signal<EvaluacionItemUI | null>(null);
  public dialogConfiguracionGeneracion = signal<boolean>(false);
  public evaluacionSeleccionadaConfiguracion = signal<EvaluacionItemUI | null>(null);
  public configuracionGeneracion = signal<ConfiguracionGeneracion | null>(null);
  public cargandoConfiguracionGeneracion = signal<boolean>(false);
  public estadoMarcas = signal<Record<string, string>>({});

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
  public cargandoEstudiantesInscritos = signal<boolean>(false);
  public errorEstudiantesInscritos = signal<string | null>(null);
  // Configuración global administrable: cantidad máxima de estudiantes por variante.
  public ratioEstudiantesPorVariante = signal<number>(5);
  public duracionExamenVirtualMinutos = signal<number>(45);
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
  private toastTimer: ReturnType<typeof setTimeout> | undefined;
  public evaluacionSeleccionadaCartillas = signal<EvaluacionItemUI | null>(null);
  public loteCartillasActual = signal<PreparacionCartillasOmr | null>(null);
  public cargandoCartillas = signal<boolean>(false);
  public generandoCartillas = signal<boolean>(false);

  // Calificación OMR integrada al flujo de estados.
  public dialogCalificacionOmr = signal<boolean>(false);
  public evaluacionSeleccionadaOmr = signal<EvaluacionItemUI | null>(null);
  public archivoOmrSeleccionado = signal<File | null>(null);
  public procesandoCalificacionOmr = signal<boolean>(false);
  public guardandoCalificacionOmr = signal<boolean>(false);
  public resultadoCalificacionOmr = signal<OmrJobResponse | null>(null);
  public mensajeCalificacionOmr = signal<string | null>(null);
  public errorCalificacionOmr = signal<boolean>(false);
  public edicionesOmr = signal<Record<number, { codigo: string; respuestas: Record<string, string> }>>({});
  public previewPaginasOmr = signal<string[]>([]);
  public cargandoPreviewOmr = signal<boolean>(false);
  public paginaPreviewOmr = signal<number | null>(null);
  public recalibrandoOmr = signal<Record<number, boolean>>({});
  public readonly opcionesRespuestaOmr = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE', 'BC', 'BD', 'BE', 'CD', 'CE', 'DE'];

  // Consulta de notas ya persistidas.
  public dialogNotasOmr = signal<boolean>(false);
  public evaluacionSeleccionadaNotas = signal<EvaluacionItemUI | null>(null);
  public notasOmr = signal<CalificacionOmrResponse[]>([]);
  public cargandoNotasOmr = signal<boolean>(false);

  // Carga manual de notas para exámenes sin cartilla.
  public dialogNotasDocente = signal<boolean>(false);
  public evaluacionSeleccionadaNotasDocente = signal<EvaluacionItemUI | null>(null);
  public notasDocente = signal<NotaDocenteSinCartilla[]>([]);
  public cargandoNotasDocente = signal<boolean>(false);
  public guardandoNotasDocente = signal<boolean>(false);

  // Operación y resultados del examen virtual.
  public dialogSalaVirtual = signal<boolean>(false);
  public salaVirtualCreada = signal<SalaVirtualOperacion | null>(null);
  public salaVirtualExistente = signal<boolean>(false);
  public accesosVirtuales = signal<AccesoVirtualGenerado[]>([]);
  public tokenGrupoVirtual = signal<string | null>(null);
  public emitiendoTokenGrupoVirtual = signal<boolean>(false);
  public creandoSalaVirtual = signal<boolean>(false);
  public consultandoSalaVirtual = signal<boolean>(false);
  public generacionVirtualActual = signal<boolean>(false);
  public dialogResultadosVirtuales = signal<boolean>(false);
  public evaluacionSeleccionadaResultados = signal<EvaluacionItemUI | null>(null);
  public resultadosVirtuales = signal<ResultadoVirtual[]>([]);
  public cargandoResultadosVirtuales = signal<boolean>(false);
  public dialogRestablecerSalaVirtual = signal<boolean>(false);
  public motivoRestablecimientoSalaVirtual = '';
  private rolVirtualVerificadoParaGenerar: string | null = null;
  private grupoSEAActualParaGenerar: string | null = null;

  // Indicador del banco cargado por evaluación.
  public estadoBancos = signal<Record<string, boolean>>({});

  // Lista viva de evaluaciones
  public evaluaciones = signal<EvaluacionItemUI[]>([]);

  // Calcula las variantes a partir de la nómina y el ratio institucional.
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
    this.filtrosActualizados();
    let list = this.evaluaciones();
    const query = this._normalizar(this.busquedaTexto);
    const estados = this.estadosSeleccionados();

    if (this.filtroParcial !== 'Todos') {
      list = list.filter(e => e.tipo === this.filtroParcial);
    }

    if (this.filtroModalidad !== 'Todos') {
      list = list.filter(e => {
        const modalidad = e.modalidad || (e.conCartilla ? 'PRESENCIAL_CARTILLA' : 'PRESENCIAL_SIN_CARTILLA');
        return modalidad === this.filtroModalidad;
      });
    }

    if (estados.length > 0) {
      list = list.filter(e => estados.includes(e.estado));
    }

    if (this.filtroFechaInicio || this.filtroFechaFin) {
      list = list.filter(e => {
        if (!e.fecha) return true;
        const desdeValido = !this.filtroFechaInicio || e.fecha >= this.filtroFechaInicio;
        const hastaValido = !this.filtroFechaFin || e.fecha <= this.filtroFechaFin;
        return desdeValido && hastaValido;
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
    this.ratioEstudiantesPorVariante.set(
      this._configuracionEvaluaciones.configuracion().ratioEstudiantesPorVariante
    );
    this.duracionExamenVirtualMinutos.set(
      this._configuracionEvaluaciones.configuracion().duracionExamenVirtualMinutos || 45
    );
    this._configuracionEvaluaciones.cargar().subscribe({
      next: configuracion => {
        this.ratioEstudiantesPorVariante.set(configuracion.ratioEstudiantesPorVariante);
        this.duracionExamenVirtualMinutos.set(configuracion.duracionExamenVirtualMinutos || 45);
      },
      error: () => {
        this.ratioEstudiantesPorVariante.set(5);
        this.duracionExamenVirtualMinutos.set(45);
      }
    });
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
        this._cargarEstadoMarcas(uiList);
        this._cargarEstadoBancos(uiList);
        if (uiList.length === 0) {
          this.cargando.set(false);
          return;
        }

        forkJoin(uiList.map(item => this._rolService.listarAuditoria(item.id).pipe(
          catchError(() => of([] as AuditoriaRolExamen[]))
        ))).subscribe({
          next: auditorias => {
            this.evaluaciones.set(uiList.map((item, index) => ({
              ...item,
              auditoria: auditorias[index]
            })));
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false)
        });
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
    const conCartilla = rol.modalidad === 'PRESENCIAL_CARTILLA';
    const etapaMapeada = this._mapearEtapa(rol.estadoFlujo);
    // Compatibilidad con generaciones virtuales antiguas: aunque hayan
    // quedado como GENERADO, operativamente esperan una sala y no un PDF.
    const etapa = rol.modalidad === 'VIRTUAL' && etapaMapeada === 'Generado'
      ? 'Validado'
      : etapaMapeada;

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
      version: rol.version || 1,
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
      etapa,
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
      case 'PENDIENTE_NOTAS': return 'Pendiente de notas';
      case 'CALIFICADO': return 'Calificado';
      default: return 'Programado';
    }
  }

  public puedeRestablecer(item: EvaluacionItemUI): boolean {
    if (item.modalidad === 'VIRTUAL') return false;
    return ['Generado', 'Impreso', 'Entregado', 'Devuelto', 'Pendiente de notas', 'Calificado']
      .includes(item.etapa);
  }

  public puedeMostrarNotasDocente(item: EvaluacionItemUI): boolean {
    return item.modalidad === 'PRESENCIAL_SIN_CARTILLA'
      && ['Pendiente de notas', 'Calificado'].includes(item.etapa);
  }

  public puedeMostrarDocumento(item: EvaluacionItemUI): boolean {
    if (item.modalidad === 'VIRTUAL') return false;
    return ['Generado', 'Impreso', 'Entregado', 'Devuelto', 'Pendiente de notas', 'Calificado']
      .includes(item.etapa);
  }

  public puedeGestionarCartillas(item: EvaluacionItemUI): boolean {
    if (item.modalidad === 'VIRTUAL') return false;
    // Las marcas se pueden preparar antes de entregar el examen. Desde
    // Entregado en adelante la cartilla ya no debe modificarse.
    return ['Programado', 'Validado', 'Generado', 'Impreso'].includes(item.etapa);
  }

  public puedeMostrarConfiguracion(item: EvaluacionItemUI): boolean {
    return item.modalidad === 'VIRTUAL'
      ? ['Validado', 'Calificado'].includes(item.etapa)
      : ['Generado', 'Impreso', 'Entregado', 'Devuelto', 'Pendiente de notas', 'Calificado'].includes(item.etapa);
  }

  public puedeMostrarNotas(item: EvaluacionItemUI): boolean {
    return item.modalidad === 'PRESENCIAL_CARTILLA' && ['Pendiente de notas', 'Calificado'].includes(item.etapa);
  }

  public puedeMostrarResultadosVirtuales(item: EvaluacionItemUI): boolean {
    return item.modalidad === 'VIRTUAL' && item.etapa === 'Calificado';
  }

  public marcaImpresa(item: EvaluacionItemUI): boolean {
    return this.estadoMarcas()[item.id] === 'IMPRESO';
  }

  public bancoPreguntasCargado(item: EvaluacionItemUI): boolean {
    return item.bancoPreguntasCargado === true || this.estadoBancos()[item.id] === true;
  }

  private _cargarEstadoBancos(items: EvaluacionItemUI[]): void {
    this.estadoBancos.set({});
    if (items.length === 0) return;

    const consultas = items.map(item => this._bancoService.obtenerPorRol(item.id).pipe(
      catchError(() => of(null))
    ));
    forkJoin(consultas).subscribe(bancos => {
      const estados: Record<string, boolean> = {};
      bancos.forEach((banco, indice) => {
        estados[items[indice].id] = banco !== null;
      });
      this.estadoBancos.set(estados);
    });
  }

  private _cargarEstadoMarcas(items: EvaluacionItemUI[]): void {
    this.estadoMarcas.set({});
    items.filter(item => this.puedeGestionarCartillas(item)).forEach(item => {
      this._cartillasOmr.obtenerPreparacion(item.id).subscribe({
        next: preparacion => this.estadoMarcas.update(estados => ({
          ...estados,
          [item.id]: preparacion.estadoImpresion
        })),
        error: () => this.estadoMarcas.update(estados => ({
          ...estados,
          [item.id]: 'SIN_GENERAR'
        }))
      });
    });
  }

  public abrirGestionCartillas(item: EvaluacionItemUI): void {
    if (!this.puedeGestionarCartillas(item)) return;
    this.evaluacionSeleccionadaCartillas.set(item);
    this.loteCartillasActual.set(null);
    this.cargandoCartillas.set(true);
    this._cartillasOmr.obtenerPreparacion(item.id).subscribe({
      next: preparacion => {
        this.loteCartillasActual.set(preparacion);
        this.cargandoCartillas.set(false);
      },
      error: () => {
        this.cargandoCartillas.set(false);
        this._mostrarToast('No se pudo consultar la nómina oficial para las marcas.', 'error');
      }
    });
  }

  public cerrarGestionCartillas(): void {
    this.evaluacionSeleccionadaCartillas.set(null);
    this.loteCartillasActual.set(null);
  }

  public imprimirCartillas(): void {
    const item = this.evaluacionSeleccionadaCartillas();
    if (!item || this.generandoCartillas()) return;
    this.generandoCartillas.set(true);
    const ventana = window.open('', '_blank');
    this._cartillasOmr.imprimir(item.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        if (ventana) {
          ventana.location.href = url;
        } else {
          window.open(url, '_blank');
        }
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        this.generandoCartillas.set(false);
        this._mostrarToast('Marcas generadas temporalmente. Puedes imprimirlas desde la ventana del PDF.');
      },
        error: err => {
          ventana?.close();
          this.generandoCartillas.set(false);
          this._mostrarToast(
            err?.error?.message || err?.error?.error || err?.message ||
            'No se pudo preparar la impresión de marcas.',
            'error'
          );
      }
    });
  }

  public confirmarImpresionCartillas(): void {
    const item = this.evaluacionSeleccionadaCartillas();
    if (!item) return;
    this._cartillasOmr.marcarImpresoTemporal(item.id).subscribe({
      next: actualizado => {
        this.loteCartillasActual.set(actualizado);
        this.estadoMarcas.update(estados => ({ ...estados, [item.id]: actualizado.estadoImpresion }));
        this._mostrarToast('La impresión de marcas fue confirmada.');
      },
      error: () => this._mostrarToast('No se pudo confirmar la impresión de marcas.', 'error')
    });
  }

  public abrirConfiguracionGeneracion(item: EvaluacionItemUI): void {
    if (!this.puedeMostrarConfiguracion(item)) return;
    this.evaluacionSeleccionadaConfiguracion.set(item);
    this.configuracionGeneracion.set(null);
    this.cargandoConfiguracionGeneracion.set(true);
    this.dialogConfiguracionGeneracion.set(true);
    this._generacionTypst.consultarConfiguracion(item.id).subscribe({
      next: configuracion => {
        this.configuracionGeneracion.set(configuracion);
        this.cargandoConfiguracionGeneracion.set(false);
      },
      error: () => {
        this.cargandoConfiguracionGeneracion.set(false);
        this._mostrarToast('No se pudo consultar la configuración persistida de la generación.', 'error');
      }
    });
  }

  public cerrarConfiguracionGeneracion(): void {
    this.dialogConfiguracionGeneracion.set(false);
    this.evaluacionSeleccionadaConfiguracion.set(null);
    this.configuracionGeneracion.set(null);
  }

  public nombreMapeo(mapeo: ConfiguracionGeneracion['mapeos'][number]): string {
    return [mapeo.nombres, mapeo.apellidoPaterno, mapeo.apellidoMaterno]
      .filter(valor => valor && valor.trim())
      .join(' ');
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
    if (item.modalidad === 'VIRTUAL') {
      return [
        { key: 'Programado', label: 'Programado', icon: 'pi pi-calendar' },
        { key: 'Validado', label: 'Validado', icon: 'pi pi-shield' },
        { key: 'Calificado', label: 'Calificado', icon: 'pi pi-check-circle' }
      ];
    }
    if (item.modalidad === 'PRESENCIAL_SIN_CARTILLA') {
      return [
        { key: 'Programado', label: 'Programado', icon: 'pi pi-calendar' },
        { key: 'Validado', label: 'Validado', icon: 'pi pi-shield' },
        { key: 'Impreso', label: 'Impreso', icon: 'pi pi-print' },
        { key: 'Entregado', label: 'Entregado', icon: 'pi pi-send' },
        { key: 'Devuelto', label: 'Devuelto', icon: 'pi pi-replay' },
        { key: 'Pendiente de notas', label: 'Pendiente de notas', icon: 'pi pi-upload' },
        { key: 'Calificado', label: 'Calificado', icon: 'pi pi-check-circle' }
      ];
    }
    return this.flujoOficial;
  }

  public getPasoBotonClass(item: EvaluacionItemUI, pasoKey: EtapaEvaluacion): string {
    const pasos = this.getPasosFlujo(item).map(p => p.key);
    const currentIdx = pasos.indexOf(item.etapa);
    const pasoIdx = pasos.indexOf(pasoKey);

    if (item.modalidad === 'PRESENCIAL_SIN_CARTILLA'
        && item.etapa === 'Pendiente de notas'
        && pasoKey === 'Calificado') {
      return 'bg-muted/40 text-muted-foreground/50 border border-dashed border-amber-300 cursor-not-allowed';
    }

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
    const actividad = this.auditoriaDeEtapa(item, st.key);

    if (pasoIdx <= currentIdx && actividad) {
      return `Completado: ${this.formatearFechaHoraAuditoria(actividad.fechaEvento)} · ${actividad.usuario || 'Sistema'}`;
    }
    if (pasoIdx < currentIdx) return `Completado: ${st.label}`;
    if (pasoIdx === currentIdx) return `Estado actual: ${st.label}`;
    if (pasoIdx === currentIdx + 1) {
      if (st.key === 'Validado') return 'Clic para Validar y Encriptar Examen de Docente';
      if (st.key === 'Generado') return 'Clic para generar el examen PDF (30 preguntas A-E)';
      if (item.modalidad === 'VIRTUAL' && st.key === 'Calificado') return 'Preparar sala virtual, variantes y tokens de acceso';
      if (st.key === 'Pendiente de notas') return 'Habilita la carga de notas del docente o el procesamiento OMR';
      return `Clic para avanzar a: ${st.label}`;
    }
    return `Pendiente: ${st.label}`;
  }

  public clickPasoEstado(item: EvaluacionItemUI, pasoKey: EtapaEvaluacion): void {
    const pasos = this.getPasosFlujo(item).map(p => p.key);
    const currentIdx = pasos.indexOf(item.etapa);
    const pasoIdx = pasos.indexOf(pasoKey);

    if (pasoKey === 'Validado' && item.etapa === 'Programado') {
      if (item.modalidad === 'PRESENCIAL_SIN_CARTILLA') {
        this._mostrarToast('Para validar un examen sin cartilla, el docente debe cargar primero el archivo .doc desde Banco de preguntas.', 'error');
        return;
      }
      this.evaluacionSeleccionadaParaValidar.set(item);
      return;
    }

    if (pasoKey === 'Generado' && (item.etapa === 'Validado' || item.etapa === 'Programado')) {
      this.abrirModalParametrizacion(item);
      return;
    }

    if (item.modalidad === 'VIRTUAL' && pasoKey === 'Calificado' && item.etapa === 'Validado') {
      this.abrirModalParametrizacion(item);
      return;
    }

    if (pasoKey === 'Calificado' && item.etapa === 'Pendiente de notas' && item.modalidad === 'PRESENCIAL_CARTILLA') {
      this.abrirCalificacionOmr(item);
      return;
    }

    if (pasoKey === 'Calificado' && item.etapa === 'Pendiente de notas' && item.modalidad === 'PRESENCIAL_SIN_CARTILLA') {
      this.abrirNotasDocente(item);
      return;
    }

    if (pasoIdx === currentIdx + 1) {
      const nuevoEstado = this.estadoBackendParaEtapa(pasoKey);
      this._rolService.transicionarEstado(item.id, {
        nuevoEstado,
        usuario: 'ADMIN_EVALUACIONES'
      }).subscribe({
        next: rolActualizado => {
          const actualizado = this._mapearRolResponseA_UI(rolActualizado);
          this.evaluaciones.update(items => items.map(actual => actual.id === item.id ? actualizado : actual));
          this._mostrarToast(`${item.codigo}: Estado avanzado a '${pasoKey}'.`);
        },
        error: err => this._mostrarToast(err?.error?.message || 'No se pudo actualizar el estado oficial del examen.', 'error')
      });
    }
  }

  private estadoBackendParaEtapa(etapa: EtapaEvaluacion): RolExamenResponse['estadoFlujo'] {
    const estados: Record<EtapaEvaluacion, RolExamenResponse['estadoFlujo']> = {
      'Programado': 'PROGRAMADO',
      'Validado': 'VALIDADO',
      'Generado': 'GENERADO',
      'Impreso': 'IMPRESO',
      'Entregado': 'ENTREGADO',
      'Devuelto': 'DEVUELTO',
      'Pendiente de notas': 'PENDIENTE_NOTAS',
      'Calificado': 'CALIFICADO'
    };
    return estados[etapa];
  }

  public abrirCalificacionOmr(item: EvaluacionItemUI): void {
    if (item.etapa !== 'Devuelto' && item.etapa !== 'Pendiente de notas') return;
    this.evaluacionSeleccionadaOmr.set(item);
    this.archivoOmrSeleccionado.set(null);
    this.resultadoCalificacionOmr.set(null);
    this.edicionesOmr.set({});
    this.previewPaginasOmr.set([]);
    this.paginaPreviewOmr.set(null);
    this.cargandoPreviewOmr.set(false);
    this.recalibrandoOmr.set({});
    this.procesandoCalificacionOmr.set(false);
    this.guardandoCalificacionOmr.set(false);
    this.mensajeCalificacionOmr.set('Seleccione el PDF escaneado para iniciar la lectura página por página.');
    this.errorCalificacionOmr.set(false);
    this.dialogCalificacionOmr.set(true);
  }

  public cerrarCalificacionOmr(): void {
    if (this.procesandoCalificacionOmr() || this.guardandoCalificacionOmr()) return;
    this.dialogCalificacionOmr.set(false);
    this.evaluacionSeleccionadaOmr.set(null);
    this.archivoOmrSeleccionado.set(null);
    this.resultadoCalificacionOmr.set(null);
    this.edicionesOmr.set({});
    this.previewPaginasOmr.set([]);
    this.paginaPreviewOmr.set(null);
    this.cargandoPreviewOmr.set(false);
    this.recalibrandoOmr.set({});
  }

  public async seleccionarArchivoOmr(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] || null;
    this.archivoOmrSeleccionado.set(archivo);
    this.resultadoCalificacionOmr.set(null);
    this.previewPaginasOmr.set([]);
    this.paginaPreviewOmr.set(null);
    this.errorCalificacionOmr.set(false);
    this.mensajeCalificacionOmr.set(archivo ? 'Archivo listo para procesar.' : 'Seleccione el PDF escaneado para iniciar la lectura.');

    if (archivo) {
      this.cargandoPreviewOmr.set(true);
      try {
        const paginas = await this._renderizarPreviewEscaneado(archivo);
        this.previewPaginasOmr.set(paginas);
      } catch (error) {
        console.error('Error renderizando previsualización del escaneado OMR:', error);
        this.mensajeCalificacionOmr.set('El escaneado quedó listo, pero no se pudo preparar su previsualización.');
      } finally {
        this.cargandoPreviewOmr.set(false);
      }
    }
  }

  private async _renderizarPreviewEscaneado(archivo: File): Promise<string[]> {
    const esPdf = archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf');
    if (!esPdf) {
      return new Promise<string[]>((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = () => typeof lector.result === 'string' ? resolve([lector.result]) : reject(new Error('Imagen sin contenido.'));
        lector.onerror = () => reject(lector.error || new Error('No se pudo leer la imagen.'));
        lector.readAsDataURL(archivo);
      });
    }

    const buffer = await archivo.arrayBuffer();
    const documento = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const paginas: string[] = [];
    for (let numeroPagina = 1; numeroPagina <= documento.numPages; numeroPagina++) {
      const pagina = await documento.getPage(numeroPagina);
      const viewportBase = pagina.getViewport({ scale: 1 });
      const escala = Math.min(1.35, 950 / viewportBase.width);
      const viewport = pagina.getViewport({ scale: escala });
      const canvas = document.createElement('canvas');
      const contexto = canvas.getContext('2d');
      if (!contexto) continue;
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await pagina.render({ canvasContext: contexto, viewport }).promise;
      paginas.push(canvas.toDataURL('image/jpeg', 0.86));
      pagina.cleanup();
      canvas.width = 1;
      canvas.height = 1;
    }
    return paginas;
  }

  public alternarPreviewPaginaOmr(pagina: number): void {
    this.paginaPreviewOmr.update(actual => actual === pagina ? null : pagina);
  }

  public previewPaginaOmr(pagina: number): string | null {
    return this.previewPaginasOmr()[pagina - 1] || null;
  }

  public ejecutarCalificacionOmr(): void {
    const item = this.evaluacionSeleccionadaOmr();
    const archivo = this.archivoOmrSeleccionado();
    if (!item || !archivo || this.procesandoCalificacionOmr()) return;

    this.procesandoCalificacionOmr.set(true);
    this.resultadoCalificacionOmr.set(null);
    this.errorCalificacionOmr.set(false);
    this.mensajeCalificacionOmr.set('Enviando escaneado al motor OMR...');
    this._omrService.procesar(item.id, archivo).subscribe({
      next: aceptado => this._esperarResultadoCalificacionOmr(aceptado.jobId),
      error: err => {
        this.procesandoCalificacionOmr.set(false);
        this.errorCalificacionOmr.set(true);
        this.mensajeCalificacionOmr.set(err?.error?.message || 'No se pudo enviar el escaneado al motor OMR.');
      }
    });
  }

  private _esperarResultadoCalificacionOmr(jobId: string): void {
    this._omrService.consultar(jobId).subscribe({
      next: resultado => {
        if (resultado.estado === 'EN_COLA') {
          window.setTimeout(() => this._esperarResultadoCalificacionOmr(jobId), 1200);
          return;
        }
        this.procesandoCalificacionOmr.set(false);
        this.resultadoCalificacionOmr.set(resultado);
        this.edicionesOmr.set({});
        this.paginaPreviewOmr.set(resultado.resultados?.[0]?.pagina ?? null);
        this.errorCalificacionOmr.set(resultado.estado !== 'COMPLETADO');
        this.mensajeCalificacionOmr.set(resultado.estado === 'COMPLETADO'
          ? 'Lectura OMR completada. Revise cada página antes de pasar la evaluación a Calificado.'
          : resultado.mensaje || 'El motor OMR no pudo completar la lectura.');
      },
      error: () => {
        window.setTimeout(() => this._esperarResultadoCalificacionOmr(jobId), 1500);
      }
    });
  }

  public cantidadRespuestasLeidas(lectura: OmrLecturaResponse): number {
    return this.preguntasOmr(lectura).filter(pregunta => !!this.respuestaOmr(lectura, pregunta)).length;
  }

  public preguntasOmr(lectura: OmrLecturaResponse): number[] {
    const preguntasDetectadas = Object.keys(lectura.respuestas || {})
      .map(numero => Number(numero))
      .filter(numero => Number.isFinite(numero));
    const preguntasDetalladas = (lectura.detalles || []).map(detalle => detalle.pregunta);
    const total = Math.max(lectura.totalReactivos || 30, ...preguntasDetectadas, ...preguntasDetalladas);
    return Array.from({ length: total }, (_, indice) => indice + 1);
  }

  public codigoOmr(lectura: OmrLecturaResponse): string {
    return this.edicionesOmr()[lectura.pagina]?.codigo ?? lectura.codigoEstudiante ?? '';
  }

  public respuestaOmr(lectura: OmrLecturaResponse, pregunta: number): string {
    const edicion = this.edicionesOmr()[lectura.pagina];
    if (edicion?.respuestas[String(pregunta)] !== undefined) {
      return this.normalizarRespuestaOmr(edicion.respuestas[String(pregunta)]);
    }
    const respuestaDirecta = this.normalizarRespuestaOmr(lectura.respuestas?.[String(pregunta)]);
    if (respuestaDirecta) return respuestaDirecta;
    return this.normalizarRespuestaOmr(lectura.detalles?.find(detalle => detalle.pregunta === pregunta)?.respuesta);
  }

  private normalizarRespuestaOmr(valor: unknown): string {
    if (valor === null || valor === undefined) return '';
    const texto = Array.isArray(valor) ? valor.join('') : String(valor);
    const incisos = texto.toUpperCase().match(/[A-E]/g) || [];
    return [...new Set(incisos)].join('');
  }

  public respuestaCorrectaOmr(lectura: OmrLecturaResponse, pregunta: number): string {
    return this.normalizarRespuestaOmr(lectura.detalles?.find(detalle => detalle.pregunta === pregunta)?.respuestaCorrecta);
  }

  public estadoPreguntaOmr(lectura: OmrLecturaResponse, pregunta: number): string {
    const respuesta = this.respuestaOmr(lectura, pregunta).trim().toUpperCase();
    if (!respuesta) return 'EN_BLANCO';
    if (respuesta.length > 1) return 'DOBLE_MARCA';
    const detalle = lectura.detalles?.find(item => item.pregunta === pregunta);
    const correcta = this.normalizarRespuestaOmr(detalle?.respuestaCorrecta);
    if (correcta) {
      return respuesta === correcta ? 'CORRECTA' : 'INCORRECTA';
    }
    return detalle?.estado || 'LEIDA';
  }

  public etiquetaEstadoPreguntaOmr(lectura: OmrLecturaResponse, pregunta: number): string {
    const estado = this.estadoPreguntaOmr(lectura, pregunta);
    return {
      CORRECTA: 'Correcta',
      INCORRECTA: 'Incorrecta',
      DOBLE_MARCA: 'Doble',
      EN_BLANCO: 'Blanco',
      SIN_PATRON: 'Sin patrón',
      LEIDA: 'Leída'
    }[estado] || estado;
  }

  public editarCodigoOmr(lectura: OmrLecturaResponse, codigo: string): void {
    const actual = this.edicionesOmr()[lectura.pagina] || {
      codigo: lectura.codigoEstudiante || '',
      respuestas: { ...(lectura.respuestas || {}) }
    };
    this.edicionesOmr.update(ediciones => ({
      ...ediciones,
      [lectura.pagina]: { ...actual, codigo: codigo.replace(/\D/g, '') }
    }));
  }

  public editarRespuestaOmr(lectura: OmrLecturaResponse, pregunta: number, respuesta: string): void {
    const actual = this.edicionesOmr()[lectura.pagina] || {
      codigo: lectura.codigoEstudiante || '',
      respuestas: { ...(lectura.respuestas || {}) }
    };
    this.edicionesOmr.update(ediciones => ({
      ...ediciones,
      [lectura.pagina]: {
        ...actual,
        respuestas: { ...actual.respuestas, [String(pregunta)]: respuesta }
      }
    }));
  }

  public recalibrarPaginaOmr(lectura: OmrLecturaResponse): void {
    const item = this.evaluacionSeleccionadaOmr();
    const codigo = this.codigoOmr(lectura).trim();
    if (!item || !codigo || this.recalibrandoOmr()[lectura.pagina]) return;

    const confirmar = window.confirm(
      `El código ${codigo} se cotejará con la nómina oficial del grupo ${item.grupo}. ¿Confirmar y recalibrar esta página?`
    );
    if (!confirmar) return;

    this.recalibrandoOmr.update(paginas => ({ ...paginas, [lectura.pagina]: true }));
    this._omrService.ajustarCalificacion(item.id, {
      pagina: lectura.pagina,
      codigoAnterior: lectura.codigoEstudiante || null,
      codigoEstudiante: codigo,
      respuestas: this.respuestasOmrParaGuardar(lectura),
      usuario: 'ADMIN_EVALUACIONES'
    }).subscribe({
      next: calificacion => {
        this.resultadoCalificacionOmr.update(resultado => {
          if (!resultado) return resultado;
          return {
            ...resultado,
            resultados: (resultado.resultados || []).map(actual => actual.pagina === lectura.pagina
              ? {
                  ...actual,
                  codigoEstudiante: calificacion.codigoEstudiante,
                  codigoValidado: true,
                  letraVariante: calificacion.letraVariante,
                  estudianteNombre: calificacion.estudianteNombreCompleto,
                  estado: 'CALIFICADO',
                  totalReactivos: calificacion.totalReactivos,
                  aciertos: calificacion.aciertos,
                  fallos: calificacion.fallos,
                  blancos: calificacion.blancos,
                  doblesMarcas: calificacion.doblesMarcas,
                  notaSobre30: calificacion.notaSobre30,
                  notaSobre100: calificacion.notaSobre100,
                  estadoCalificacion: calificacion.estadoCalificacion,
                  detalles: calificacion.detalles || actual.detalles
                }
              : actual)
          };
        });
        this.recalibrandoOmr.update(paginas => ({ ...paginas, [lectura.pagina]: false }));
        this.mensajeCalificacionOmr.set(`Código ${codigo} confirmado en la nómina del grupo y variante TIPO ${calificacion.letraVariante}. Página recalibrada.`);
        this.errorCalificacionOmr.set(false);
      },
      error: err => {
        this.recalibrandoOmr.update(paginas => ({ ...paginas, [lectura.pagina]: false }));
        this.errorCalificacionOmr.set(true);
        this.mensajeCalificacionOmr.set(err?.error?.message || 'El código no pertenece a la nómina oficial de este grupo.');
      }
    });
  }

  private respuestasOmrParaGuardar(lectura: OmrLecturaResponse): Record<string, string> {
    const respuestas: Record<string, string> = {};
    for (const pregunta of this.preguntasOmr(lectura)) {
      respuestas[String(pregunta)] = this.respuestaOmr(lectura, pregunta);
    }
    return respuestas;
  }

  public todasPaginasCalificadas(resultado: OmrJobResponse): boolean {
    const paginas = resultado.resultados || [];
    return resultado.estado === 'COMPLETADO'
      && paginas.length > 0
      && paginas.every(pagina => !!this.codigoOmr(pagina) && pagina.codigoValidado === true && !!pagina.grilla);
  }

  public confirmarCalificacion(resultado: OmrJobResponse): void {
    const item = this.evaluacionSeleccionadaOmr();
    if (!item || !this.todasPaginasCalificadas(resultado) || this.guardandoCalificacionOmr()) return;

    const paginas = resultado.resultados || [];
    const ajustes: AjustarCalificacionOmrRequest[] = paginas.map(pagina => ({
      pagina: pagina.pagina,
      codigoAnterior: pagina.codigoEstudiante || null,
      codigoEstudiante: this.codigoOmr(pagina),
      respuestas: this.respuestasOmrParaGuardar(pagina),
      usuario: 'ADMIN_EVALUACIONES'
    }));
    this.guardandoCalificacionOmr.set(true);
    forkJoin(ajustes.map(ajuste => this._omrService.ajustarCalificacion(item.id, ajuste))).subscribe({
      next: () => this._transicionarACalificado(item),
      error: err => {
        this.guardandoCalificacionOmr.set(false);
        this.errorCalificacionOmr.set(true);
        this.mensajeCalificacionOmr.set(err?.error?.message || 'No se pudieron guardar los ajustes de código y respuestas. Verifique que el código pertenezca a la nómina oficial.');
      }
    });
  }

  private _transicionarACalificado(item: EvaluacionItemUI): void {
    this._rolService.transicionarEstado(item.id, {
      nuevoEstado: 'CALIFICADO',
      usuario: 'ADMIN_EVALUACIONES'
    }).subscribe({
      next: rolActualizado => {
        const actualizado = this._mapearRolResponseA_UI(rolActualizado);
        this.evaluaciones.update(items => items.map(actual => actual.id === item.id ? actualizado : actual));
        this.guardandoCalificacionOmr.set(false);
        this.dialogCalificacionOmr.set(false);
        this.evaluacionSeleccionadaOmr.set(null);
        this._mostrarToast(`${item.codigo}: resultados confirmados y evaluación pasada a Calificado.`);
      },
      error: err => {
        this.guardandoCalificacionOmr.set(false);
        this.errorCalificacionOmr.set(true);
        this.mensajeCalificacionOmr.set(err?.error?.message || 'Los resultados se guardaron, pero no se pudo pasar la evaluación a Calificado.');
      }
    });
  }

  public abrirNotasOmr(item: EvaluacionItemUI): void {
    if (!this.puedeMostrarNotas(item)) return;
    this.evaluacionSeleccionadaNotas.set(item);
    this.notasOmr.set([]);
    this.cargandoNotasOmr.set(true);
    this.dialogNotasOmr.set(true);
    this._omrService.listarCalificaciones(item.id).subscribe({
      next: notas => {
        this.notasOmr.set(notas);
        this.cargandoNotasOmr.set(false);
      },
      error: () => {
        this.cargandoNotasOmr.set(false);
        this._mostrarToast('No se pudieron consultar las notas OMR guardadas.', 'error');
      }
    });
  }

  public cerrarNotasOmr(): void {
    this.dialogNotasOmr.set(false);
    this.evaluacionSeleccionadaNotas.set(null);
    this.notasOmr.set([]);
  }

  public abrirNotasDocente(item: EvaluacionItemUI): void {
    if (!this.puedeMostrarNotasDocente(item)) return;
    this.evaluacionSeleccionadaNotasDocente.set(item);
    this.notasDocente.set([]);
    this.cargandoNotasDocente.set(true);
    this.dialogNotasDocente.set(true);
    this._sinCartillaService.listarNotas(item.id).subscribe({
      next: notas => {
        this.notasDocente.set(notas);
        this.cargandoNotasDocente.set(false);
      },
      error: err => {
        this.cargandoNotasDocente.set(false);
        this._mostrarToast(err?.error?.message || err?.error?.error || 'No se pudo consultar la nómina oficial y sus notas.', 'error');
      }
    });
  }

  public cerrarNotasDocente(): void {
    if (this.guardandoNotasDocente()) return;
    this.dialogNotasDocente.set(false);
    this.evaluacionSeleccionadaNotasDocente.set(null);
    this.notasDocente.set([]);
  }

  public editarNotaDocente(codigoEstudiante: string, valor: string): void {
    const nota = valor === '' ? null : Number(valor);
    this.notasDocente.update(notas => notas.map(actual => actual.codigoEstudiante === codigoEstudiante
      ? { ...actual, notaSobre30: Number.isFinite(nota) ? nota : null, notaSobre100: Number.isFinite(nota) ? Number(((nota! * 100) / 30).toFixed(2)) : null }
      : actual));
  }

  public notasDocenteConCarga(): number {
    return this.notasDocente().filter(nota => nota.notaSobre30 !== null && nota.notaSobre30 !== undefined).length;
  }

  public notasDocenteCompletas(): boolean {
    const notas = this.notasDocente();
    return notas.length > 0 && notas.every(nota => nota.notaSobre30 !== null
      && nota.notaSobre30 !== undefined
      && Number.isFinite(Number(nota.notaSobre30))
      && Number(nota.notaSobre30) >= 0
      && Number(nota.notaSobre30) <= 30);
  }

  public guardarNotasDocente(): void {
    const item = this.evaluacionSeleccionadaNotasDocente();
    if (!item || item.etapa !== 'Pendiente de notas' || !this.notasDocenteCompletas() || this.guardandoNotasDocente()) return;
    this.guardandoNotasDocente.set(true);
    const notas = this.notasDocente().map(nota => ({
      codigoEstudiante: nota.codigoEstudiante,
      notaSobre30: Number(nota.notaSobre30)
    }));
    this._sinCartillaService.guardarNotas(item.id, notas, 'DOCENTE').subscribe({
      next: guardadas => {
        this.notasDocente.set(guardadas);
        this.guardandoNotasDocente.set(false);
        const actualizado = { ...item, etapa: 'Calificado' as EtapaEvaluacion, estado: 'CALIFICADO' as const };
        this.evaluaciones.update(items => items.map(actual => actual.id === item.id ? actualizado : actual));
        this.evaluacionSeleccionadaNotasDocente.set(actualizado);
        this._mostrarToast(`${item.codigo}: notas guardadas y evaluación pasada a Calificado.`);
      },
      error: err => {
        this.guardandoNotasDocente.set(false);
        this._mostrarToast(err?.error?.message || err?.error?.error || 'No se pudieron guardar las notas del docente.', 'error');
      }
    });
  }

  public imprimirReporteNotasDocente(): void {
    const item = this.evaluacionSeleccionadaNotasDocente();
    const notas = this.notasDocente();
    if (!item || !notas.length) return;
    const ventana = window.open('', '_blank', 'width=1000,height=750');
    if (!ventana) {
      this._mostrarToast('El navegador bloqueó la ventana del reporte. Permita las ventanas emergentes.', 'error');
      return;
    }
    const filas = notas.map((nota, indice) => `<tr><td>${indice + 1}</td><td>${this.escapeHtml(nota.codigoEstudiante)}</td><td>${this.escapeHtml(nota.estudianteNombreCompleto)}</td><td>${nota.notaSobre30 ?? '—'}</td><td>${nota.notaSobre100 ?? '—'}</td></tr>`).join('');
    ventana.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Reporte de notas ${this.escapeHtml(item.codigo)}</title><style>body{font-family:Arial,sans-serif;color:#172033;padding:32px}h1{font-size:20px;margin:0 0 6px}p{color:#53627b;font-size:12px;margin:4px 0 20px}.meta{border:1px solid #d9e1ef;padding:12px;border-radius:8px;margin-bottom:18px;font-size:12px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #d9e1ef;padding:9px;text-align:left}th{background:#eef3fa;text-transform:uppercase;font-size:10px}td:nth-child(1),td:nth-child(4),td:nth-child(5){text-align:center}@media print{body{padding:0}}</style></head><body><h1>Reporte de notas — examen sin cartilla</h1><p>Sistema de Evaluaciones</p><div class="meta"><strong>${this.escapeHtml(item.codigo)} — ${this.escapeHtml(item.materia)}</strong><br>Grupo: ${this.escapeHtml(item.grupo)} · Parcial: ${this.escapeHtml(item.tipo)} · Docente: ${this.escapeHtml(item.docenteNombre || '—')}<br>Estado: ${this.escapeHtml(item.etapa)}</div><table><thead><tr><th>N°</th><th>Código</th><th>Estudiante</th><th>Nota /30</th><th>Nota /100</th></tr></thead><tbody>${filas}</tbody></table><script>window.onload=()=>window.print();</script></body></html>`);
    ventana.document.close();
  }

  private escapeHtml(valor: string): string {
    return String(valor ?? '').replace(/[&<>'"]/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[caracter] || caracter));
  }

  public abrirSalaVirtualDesdeLista(item: EvaluacionItemUI): void {
    if (item.modalidad !== 'VIRTUAL' || this.consultandoSalaVirtual()) return;
    this.consultandoSalaVirtual.set(true);
    this._http.get<SalaVirtualOperacion>(`/api/examenes-virtuales/roles/${item.id}/sala`).subscribe({
      next: sala => {
        this.consultandoSalaVirtual.set(false);
        this.salaVirtualCreada.set(sala);
        this.salaVirtualExistente.set(true);
        this.accesosVirtuales.set([]);
        this.tokenGrupoVirtual.set(null);
        this.abrirDialogoRestablecerSalaVirtual();
      },
      error: err => {
        this.consultandoSalaVirtual.set(false);
        this._mostrarToast(
          err?.error?.message || err?.error?.error || 'Este examen todavía no tiene una sala virtual preparada.',
          'error'
        );
      }
    });
  }

  public abrirResultadosVirtuales(item: EvaluacionItemUI): void {
    if (!this.puedeMostrarResultadosVirtuales(item)) return;
    this.evaluacionSeleccionadaResultados.set(item);
    this.resultadosVirtuales.set([]);
    this.cargandoResultadosVirtuales.set(true);
    this.dialogResultadosVirtuales.set(true);
    this._http.get<ResultadoVirtual[]>(`/api/examenes-virtuales/roles/${item.id}/resultados`).subscribe({
      next: resultados => {
        this.resultadosVirtuales.set(resultados || []);
        this.cargandoResultadosVirtuales.set(false);
      },
      error: err => {
        this.cargandoResultadosVirtuales.set(false);
        this._mostrarToast(err?.error?.message || 'No se pudieron consultar los resultados virtuales.', 'error');
      }
    });
  }

  public cerrarResultadosVirtuales(): void {
    this.dialogResultadosVirtuales.set(false);
    this.evaluacionSeleccionadaResultados.set(null);
    this.resultadosVirtuales.set([]);
  }

  public cerrarModalValidar(): void {
    this.evaluacionSeleccionadaParaValidar.set(null);
  }

  public confirmarValidacionDocente(): void {
    const item = this.evaluacionSeleccionadaParaValidar();
    if (!item) return;

    this._rolService.transicionarEstado(item.id, {
      nuevoEstado: 'VALIDADO',
      usuario: 'ADMIN_EVALUACIONES'
    }).subscribe({
      next: rolActualizado => {
        const actualizado = this._mapearRolResponseA_UI(rolActualizado);
        this.evaluaciones.update(items => items.map(actual => actual.id === item.id ? actualizado : actual));
        this.evaluacionSeleccionadaParaValidar.set(null);
        this._mostrarToast(`${item.codigo}: Examen validado y listo para generación.`);
      },
      error: err => this._mostrarToast(err?.error?.message || 'No se pudo validar el examen en el backend oficial.', 'error')
    });
  }

  public abrirModalParametrizacion(item: EvaluacionItemUI): void {
    this.evaluacionSeleccionadaParaParametrizar.set(item);
    this.bancoSeleccionado.set(null);
    this.errorGeneracionTypst.set(null);
    this.resultadoGeneracionTypst.set(null);
    this.jobIdGeneracionTypst.set(null);
    this.generacionVirtualActual.set(item.modalidad === 'VIRTUAL');
    this.grupoSEAActualParaGenerar = null;
    this.estudiantesInscritos.set([]);
    this.cargandoEstudiantesInscritos.set(true);
    this.errorEstudiantesInscritos.set(null);
    this.ratioEstudiantesPorVariante.set(
      this._configuracionEvaluaciones.configuracion().ratioEstudiantesPorVariante
    );

    // La nómina siempre proviene de SEA. Se resuelve el grupo para todas las
    // modalidades, porque los roles antiguos pueden conservar un groupId
    // vacío o desactualizado, especialmente cuando existen varios TA-01.
    const groupId$ = this._resolverGrupoSEA(item);
    groupId$.pipe(
      tap(groupId => this.grupoSEAActualParaGenerar = groupId || null),
      switchMap(groupId => groupId
        ? this._studentService.getEstudiantesPorMateriaYGrupo(item.codigo, item.grupo, groupId)
        : throwError(() => new Error('No se encontró el grupo oficial en SEA para esta evaluación')))
    ).subscribe({
      next: estudiantes => {
        this.estudiantesInscritos.set(estudiantes);
        this.cargandoEstudiantesInscritos.set(false);
        this.errorEstudiantesInscritos.set(estudiantes.length ? null : 'No se encontraron estudiantes inscritos para este grupo');
      },
      error: err => {
        this.estudiantesInscritos.set([]);
        this.cargandoEstudiantesInscritos.set(false);
        this.errorEstudiantesInscritos.set(err?.message || 'No se pudo consultar la nómina oficial del grupo');
      }
    });

    // Cargar el banco de preguntas desde el backend
    this._bancoService.obtenerPorRol(item.id).subscribe({
      next: banco => {
        this.bancoSeleccionado.set(banco);
      },
      error: () => {
        this.bancoSeleccionado.set(null);
        this._mostrarToast('No se encontró un banco de preguntas validado para este rol de examen en el servidor.', 'error');
      }
    });

    this.archivoExcelNombre.set(`BANCO_${item.codigo.replace('-', '')}_FINAL_2026.xlsx`);
  }

  private _resolverGrupoSEA(item: EvaluacionItemUI): Observable<string | undefined> {
    const syllabusCourseId$ = item.seaSyllabusCourseId
      ? of(item.seaSyllabusCourseId)
      : this._gateway.getCourses(item.sedeCode || '', item.careerCode || '').pipe(
          map(cursos => cursos.find(curso =>
            curso.courseCode?.trim().toLowerCase() === item.codigo?.trim().toLowerCase()
          )?.syllabusCourseId)
        );

    return syllabusCourseId$.pipe(
      switchMap(syllabusCourseId => this._gateway.getGroups('2-2026', undefined, undefined, syllabusCourseId)),
      map(grupos => {
        const delMismoCodigo = (grupos || []).filter(grupo =>
          grupo.code?.trim().toLowerCase() === item.grupo?.trim().toLowerCase()
        );
        const porIdPersistido = delMismoCodigo.find(grupo => grupo.groupId === item.seaGroupId);
        const delMismoDocente = item.docenteCI
          ? delMismoCodigo.find(grupo => grupo.teacherIdentityNumber?.trim() === item.docenteCI.trim())
          : undefined;
        return (porIdPersistido || delMismoDocente || delMismoCodigo[0])?.groupId || item.seaGroupId;
      }),
      catchError(() => of(item.seaGroupId || undefined))
    );
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
    const esVirtual = item.modalidad === 'VIRTUAL';

    if (esVirtual && this.rolVirtualVerificadoParaGenerar !== item.id) {
      if (this.consultandoSalaVirtual()) return;
      this.consultandoSalaVirtual.set(true);
      this._http.get<SalaVirtualOperacion>(`/api/examenes-virtuales/roles/${item.id}/sala`).subscribe({
        next: sala => {
          this.consultandoSalaVirtual.set(false);
          this.rolVirtualVerificadoParaGenerar = null;
          this.salaVirtualCreada.set(sala);
          this.salaVirtualExistente.set(true);
          this.accesosVirtuales.set([]);
          this.tokenGrupoVirtual.set(null);
          this.dialogSalaVirtual.set(true);
          this._mostrarToast(`${item.codigo}: ya tiene una sala virtual generada. Se muestran sus datos disponibles.`);
        },
        error: err => {
          this.consultandoSalaVirtual.set(false);
          if (err?.status === 404) {
            this.rolVirtualVerificadoParaGenerar = item.id;
            this.ejecutarGeneracionVariantes();
            return;
          }
          const mensaje = err?.error?.message || err?.error?.error || 'No se pudo consultar la sala virtual existente.';
          this._mostrarToast(mensaje, 'error');
        }
      });
      return;
    }
    this.rolVirtualVerificadoParaGenerar = null;

    if (this.cargandoEstudiantesInscritos()) {
      this._mostrarToast('Espera a que termine la consulta de estudiantes inscritos antes de continuar.', 'info');
      return;
    }

    if (estudiantes.length === 0) {
      this._mostrarToast(`No se puede ${esVirtual ? 'preparar el examen virtual' : 'generar el examen'} porque no hay estudiantes inscritos para este grupo. Verifica la asignatura, el grupo y el docente.`, 'error');
      return;
    }

    const jobId = crypto.randomUUID();
    const request: GeneracionTypstRequest = {
      jobId,
      rolExamenId: item.id,
      bancoPreguntasId: banco.id,
      seaGroupId: this.grupoSEAActualParaGenerar || item.seaGroupId,
      variantes,
      ratioEstudiantesPorVariante: this.ratioEstudiantesPorVariante(),
      soloVirtual: esVirtual
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
      `[${new Date().toLocaleTimeString()}] ${esVirtual ? '🖥️ Preparación web: 30 preguntas, sin PDF ni cartilla' : '📄 Configuración oficial: 30 preguntas (7 fáciles, 16 medias, 7 difíciles), Oficio, Times New Roman 11 pt'}`,
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

            if (String(resultado.estado || '').startsWith('ERROR')) {
              this.generandoTypst.set(false);
              this.errorGeneracionTypst.set(resultado.mensaje || 'Error desconocido en generación.');
              this.queueProgress.set(100);
              this.queuePasoActual.set(esVirtual ? 'Error al preparar el examen virtual' : 'Error al generar el examen PDF');
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
              this.queuePasoActual.set(esVirtual ? '¡Variantes virtuales preparadas!' : '¡Examen PDF generado exitosamente!');
              this.queueJobCompleted.set(true);
              this.queueLogs.update(logs => [
                ...logs,
                `[${new Date().toLocaleTimeString()}] ✅ ${resultado.variantes.length} variantes generadas`,
                `[${new Date().toLocaleTimeString()}] ✅ ${esVirtual ? 'Asignaciones estudiante-variante listas' : `${resultado.mapeos.length} cuadernillos listos`}`
              ]);

              item.etapa = esVirtual ? 'Validado' : 'Generado';
              item.estado = esVirtual ? 'VALIDADO' : 'GENERADO';
              item.variantesGeneradas = cantVariantes;
              item.estudiantesInscritosCount = estudiantes.length;
              this.evaluaciones.update(items => [...items]);
              if (esVirtual) {
                this.queuePasoActual.set('Creando sala y tokens individuales...');
                this.queueProgress.set(100);
                this.crearSalaVirtual(item);
              } else {
                this._mostrarToast(`${item.codigo}: Examen PDF generado exitosamente.`);
                this.dialogQueueWorker.set(false);
              }
            }
          },
          error: err => {
            this.generandoTypst.set(false);
            const msg = err?.error?.message || err?.error?.error || err?.message || 'No se pudo obtener el resultado de generación.';
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
        const msg = err?.error?.message || err?.error?.error || err?.message || 'No se pudo iniciar la generación del examen.';
        this.errorGeneracionTypst.set(msg);
        this.queueProgress.set(100);
        this.queuePasoActual.set('Error al encolar la tarea');
        this.queueLogs.update(logs => [...logs, `[${new Date().toLocaleTimeString()}] ❌ ${msg}`]);
        this._mostrarToast(msg, 'error');
      }
    });
  }

  public esGeneracionVirtualActual(): boolean {
    return this.generacionVirtualActual();
  }

  public cerrarColaGeneracion(): void {
    if (this.generandoTypst() || this.creandoSalaVirtual()) return;
    this.dialogQueueWorker.set(false);
  }

  private crearSalaVirtual(item: EvaluacionItemUI): void {
    this.creandoSalaVirtual.set(true);
    this.errorGeneracionTypst.set(null);
    this._http.post<SalaVirtualCreada>('/api/examenes-virtuales/salas', {
      rolExamenId: item.id,
      duracionMinutos: this.duracionExamenVirtualMinutos() || 45,
      graciaIngresoMinutos: 10
    }).subscribe({
      next: creada => {
        this.creandoSalaVirtual.set(false);
        this.salaVirtualCreada.set(creada.sala);
        this.salaVirtualExistente.set(false);
        this.accesosVirtuales.set(creada.accesos || []);
        this.tokenGrupoVirtual.set(creada.tokenGrupo || null);
        this.dialogQueueWorker.set(false);
        this.dialogSalaVirtual.set(true);
        this._mostrarToast(`${item.codigo}: sala virtual preparada con tokens individuales.`);
      },
      error: err => {
        this.creandoSalaVirtual.set(false);
        const mensaje = err?.error?.message || err?.error?.error || 'Las variantes se prepararon, pero no se pudo crear la sala virtual.';
        this.errorGeneracionTypst.set(mensaje);
        this.queuePasoActual.set('Variantes listas; falta crear la sala');
        this.queueLogs.update(logs => [...logs, `[${new Date().toLocaleTimeString()}] ❌ ${mensaje}`]);
        this._mostrarToast(mensaje, 'error');
      }
    });
  }

  public abrirSalaVirtual(): void {
    const sala = this.salaVirtualCreada();
    if (!sala || this.creandoSalaVirtual()) return;
    this.creandoSalaVirtual.set(true);
    this._http.post<SalaVirtualOperacion>(`/api/examenes-virtuales/salas/${sala.id}/abrir`, {}).subscribe({
      next: actualizada => {
        this.salaVirtualCreada.set(actualizada);
        this.creandoSalaVirtual.set(false);
        this._mostrarToast('Sala abierta. Los estudiantes ya pueden ingresar y esperar al docente.');
      },
      error: err => {
        this.creandoSalaVirtual.set(false);
        this._mostrarToast(err?.error?.message || 'No se pudo abrir la sala virtual.', 'error');
      }
    });
  }

  public iniciarSalaVirtual(): void {
    const sala = this.salaVirtualCreada();
    if (!sala || sala.estado !== 'ABIERTA' || this.creandoSalaVirtual()) return;
    this.creandoSalaVirtual.set(true);
    this._http.post<SalaVirtualOperacion>(`/api/examenes-virtuales/salas/${sala.id}/iniciar`, {}).subscribe({
      next: actualizada => {
        this.salaVirtualCreada.set(actualizada);
        this.creandoSalaVirtual.set(false);
        this._mostrarToast('Examen iniciado. Los estudiantes ya pueden resolver sus variantes.');
      },
      error: err => {
        this.creandoSalaVirtual.set(false);
        this._mostrarToast(err?.error?.message || 'No se pudo iniciar el examen virtual.', 'error');
      }
    });
  }

  public restablecerSalaVirtual(): void {
    const sala = this.salaVirtualCreada();
    const motivo = this.motivoRestablecimientoSalaVirtual.trim();
    if (!sala || !['ABIERTA', 'EN_CURSO', 'PAUSADA', 'CERRADA', 'CALIFICADA'].includes(sala.estado)
      || !motivo || this.creandoSalaVirtual()) return;
    this.creandoSalaVirtual.set(true);
    this._http.post<SalaVirtualOperacion>(`/api/examenes-virtuales/salas/${sala.id}/restablecer`, { motivo }).subscribe({
      next: actualizada => {
        this.salaVirtualCreada.set(actualizada);
        this.creandoSalaVirtual.set(false);
        this.dialogRestablecerSalaVirtual.set(false);
        this.motivoRestablecimientoSalaVirtual = '';
        this.accesosVirtuales.set([]);
        this.tokenGrupoVirtual.set(null);
        this.dialogSalaVirtual.set(true);
        this._mostrarToast('Sala restablecida. Las respuestas guardadas se conservaron; inicia nuevamente cuando estén listos.', 'info');
      },
      error: err => {
        this.creandoSalaVirtual.set(false);
        this._mostrarToast(err?.error?.message || err?.error?.error || 'No se pudo restablecer la sala virtual.', 'error');
      }
    });
  }

  public cerrarSalaVirtual(): void {
    this.dialogSalaVirtual.set(false);
  }

  public abrirDialogoRestablecerSalaVirtual(): void {
    const sala = this.salaVirtualCreada();
    if (!sala || !['ABIERTA', 'EN_CURSO', 'PAUSADA', 'CERRADA', 'CALIFICADA'].includes(sala.estado)) {
      this._mostrarToast('La sala todavía no está disponible para restablecer.', 'error');
      return;
    }
    this.motivoRestablecimientoSalaVirtual = '';
    this.dialogRestablecerSalaVirtual.set(true);
  }

  public cerrarDialogoRestablecerSalaVirtual(): void {
    if (this.creandoSalaVirtual()) return;
    this.dialogRestablecerSalaVirtual.set(false);
    this.motivoRestablecimientoSalaVirtual = '';
  }

  public emitirTokenGrupoDesdeLista(): void {
    const sala = this.salaVirtualCreada();
    if (!sala || this.emitiendoTokenGrupoVirtual()) return;
    const confirmar = window.confirm('Se emitirá un token grupal nuevo y el anterior dejará de funcionar. ¿Deseas continuar?');
    if (!confirmar) return;

    this.emitiendoTokenGrupoVirtual.set(true);
    this._http.post<TokenGrupoVirtual>(`/api/examenes-virtuales/salas/${encodeURIComponent(sala.id)}/token-grupo`, {}).subscribe({
      next: respuesta => {
        this.tokenGrupoVirtual.set(respuesta.tokenGrupo);
        this.emitiendoTokenGrupoVirtual.set(false);
        this._mostrarToast('Token grupal emitido. Compártelo junto con el código de sala.', 'info');
      },
      error: err => {
        this.emitiendoTokenGrupoVirtual.set(false);
        this._mostrarToast(err?.error?.message || err?.error?.error || 'No se pudo emitir el token grupal.', 'error');
      }
    });
  }

  public copiarTokenGrupoDesdeLista(): void {
    const token = this.tokenGrupoVirtual();
    if (!token) return;
    const escritura = navigator.clipboard?.writeText(token);
    if (!escritura) {
      this._mostrarToast('Selecciona el token y cópialo manualmente.', 'error');
      return;
    }
    escritura.then(
      () => this._mostrarToast('Token grupal copiado.', 'info'),
      () => this._mostrarToast('No se pudo copiar automáticamente. Selecciona el token y cópialo.', 'error')
    );
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

  public getVarianteParaEstudiante(est: EstudianteInscrito): VarianteCompilada | null {
    const list = this.estudiantesInscritos();
    const idx = list.findIndex(e => e.codigo === est.codigo);
    const letra = this.getLetraVarianteParaIndice(idx >= 0 ? idx : 0);
    const tipo = `TIPO ${letra}`;

    const compiladas = this.variantesCompiladas();
    return compiladas.find(v => v.tipo === tipo) || compiladas[0] || null;
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
    this._mostrarToast('El patrón oficial estará disponible cuando exista una generación persistida para el rol de examen.', 'info');
  }

  public descargarRemarkExcelOficial(): void {
    this._mostrarToast('La matriz Remark oficial estará disponible cuando exista una generación persistida para el rol de examen.', 'info');
  }

  public abrirListaFirmasPdfTypst(item?: EvaluacionItemUI): void {
    this._mostrarToast('La lista oficial de firmas estará disponible cuando exista un documento generado para el rol de examen.', 'info');
  }

  private _urlArchivo(pdfPath: string): string {
    return `/api/archivos?path=${encodeURIComponent(pdfPath)}`;
  }

  public imprimirVentanaLimpia(): void {
    window.print();
  }

  public abrirBitacora(item: EvaluacionItemUI): void {
    this.evaluacionSeleccionadaParaBitacora.set(item);
    this.auditoriaBitacora.set(item.auditoria || []);
    this.errorBitacora.set('');
    this.cargandoBitacora.set(true);
    this._rolService.listarAuditoria(item.id).subscribe({
      next: auditoria => {
        this.auditoriaBitacora.set(auditoria);
        const actualizado = { ...item, auditoria };
        this.evaluacionSeleccionadaParaBitacora.set(actualizado);
        this.evaluaciones.update(items => items.map(actual =>
          actual.id === item.id ? actualizado : actual
        ));
        this.cargandoBitacora.set(false);
      },
      error: () => {
        this.errorBitacora.set('No se pudo cargar la bitácora de este rol de examen.');
        this.cargandoBitacora.set(false);
      }
    });
  }

  public cerrarBitacora(): void {
    this.evaluacionSeleccionadaParaBitacora.set(null);
    this.auditoriaBitacora.set([]);
    this.errorBitacora.set('');
    this.cargandoBitacora.set(false);
  }

  public ultimaActividad(item: EvaluacionItemUI): AuditoriaRolExamen | undefined {
    return item.auditoria?.[0];
  }

  public formatearFechaHoraAuditoria(fecha?: string): string {
    if (!fecha) return 'Fecha no disponible';
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return fecha.replace('T', ' ');
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(valor);
  }

  public descripcionAuditoria(evento: AuditoriaRolExamen): string {
    const accion = evento.accion || '';
    if (accion.startsWith('SUSPENSION_ROL_EXAMEN')) return 'Se suspendió el rol de examen';
    const descripciones: Record<string, string> = {
      CREACION_ROL_EXAMEN: 'Se creó el rol de examen',
      ACTUALIZACION_ROL_EXAMEN: 'Se actualizó el rol de examen',
      VALIDACION_BANCO_PREGUNTAS: 'Se validó el banco de preguntas',
      REVALIDACION_BANCO_PREGUNTAS: 'Se volvió a validar el banco de preguntas',
      ELIMINACION_BANCO_PREGUNTAS: 'Se eliminó el banco de preguntas',
      GENERACION_LOTE_CARTILLAS_OMR: 'Se generaron las marcas OMR',
      CONFIRMACION_IMPRESION_CARTILLAS_OMR: 'Se confirmó la impresión de las marcas OMR',
      RESTABLECIMIENTO_A_VALIDADO: 'Se restableció el rol de examen a Validado',
      TRANSICION_ESTADO: 'Se avanzó el estado del rol de examen'
    };
    return descripciones[accion] || accion.replaceAll('_', ' ').toLowerCase()
      .replace(/^./, letra => letra.toUpperCase());
  }

  public etapaAuditoria(evento: AuditoriaRolExamen): string {
    if (!evento.etapaOrigen || evento.etapaOrigen === '-') {
      return `Estado registrado: ${this.formatearEstadoAuditoria(evento.etapaDestino)}`;
    }
    return `${this.formatearEstadoAuditoria(evento.etapaOrigen)} → ${this.formatearEstadoAuditoria(evento.etapaDestino)}`;
  }

  public detalleAuditoria(evento: AuditoriaRolExamen): string {
    if (!evento.detallesJson) return '';
    try {
      const detalles = JSON.parse(evento.detallesJson) as { motivo?: string };
      return detalles.motivo ? `Motivo: ${detalles.motivo}` : '';
    } catch {
      return '';
    }
  }

  private formatearEstadoAuditoria(estado?: string): string {
    if (!estado) return 'Sin estado';
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  }

  private auditoriaDeEtapa(item: EvaluacionItemUI, etapa: EtapaEvaluacion): AuditoriaRolExamen | undefined {
    const destino = etapa.toUpperCase();
    return item.auditoria?.find(evento => evento.etapaDestino?.toUpperCase() === destino);
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
    this.actualizarFiltros();
    this._mostrarToast('Mostrando todas las evaluaciones programadas.');
  }

  public limpiarFiltros(): void {
    this.filtroFechaInicio = this.hoyIso;
    this.filtroFechaFin = this.hoyIso;
    this.filtroParcial = '1er Parcial';
    this.filtroModalidad = 'Todos';
    this.estadosSeleccionados.set([]);
    this.busquedaTexto = '';
    this.actualizarFiltros();
  }

  public actualizarFiltros(): void {
    this.filtrosActualizados.update(valor => valor + 1);
  }

  public cambiarFiltroParcial(valor: string): void {
    this.filtroParcial = valor;
    this.actualizarFiltros();
  }

  public cambiarFiltroModalidad(valor: string): void {
    const modalidades: EvaluacionesDiaComponent['filtroModalidad'][] = [
      'Todos', 'PRESENCIAL_CARTILLA', 'PRESENCIAL_SIN_CARTILLA', 'VIRTUAL'
    ];
    this.filtroModalidad = modalidades.includes(valor as EvaluacionesDiaComponent['filtroModalidad'])
      ? valor as EvaluacionesDiaComponent['filtroModalidad']
      : 'Todos';
    this.actualizarFiltros();
  }

  public cambiarFiltroFechaInicio(valor: string): void {
    this.filtroFechaInicio = valor || '';
    this.actualizarFiltros();
  }

  public cambiarFiltroFechaFin(valor: string): void {
    this.filtroFechaFin = valor || '';
    this.actualizarFiltros();
  }

  public cambiarBusqueda(valor: string): void {
    this.busquedaTexto = valor || '';
    this.actualizarFiltros();
  }

  private _mostrarToast(msg: string, _tipo?: string): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastMessage.set(msg);
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set(null);
      this.toastTimer = undefined;
    }, 3500);
  }
}
