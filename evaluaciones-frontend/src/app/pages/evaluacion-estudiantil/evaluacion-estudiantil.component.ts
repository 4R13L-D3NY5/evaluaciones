import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EvaluacionDocenteService } from '../../core/services/evaluacion-docente.service';
import {
  EstudianteAvanceEvaluacion,
  EvaluacionInstrumento,
  MateriaEstudiante
} from '../../core/models/evaluacion-docente.models';
import { UNITEPC_LOGO_PNG } from '../../core/constants/unitepc-assets';

@Component({
  selector: 'app-evaluacion-estudiantil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      <!-- Cabecera Institucional Pública -->
      <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img [src]="logoUnitepc" alt="UNITEPC" class="h-9 object-contain" />
            <div class="border-l border-slate-300 dark:border-slate-700 pl-3">
              <h1 class="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                Evaluación Docente
              </h1>
              <p class="text-[11px] text-slate-500 font-medium">Portal Estudiantil de Calidad Académica</p>
            </div>
          </div>

          @if (estudiante()) {
            <button
              (click)="salir()"
              class="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-300 transition-colors cursor-pointer flex items-center gap-1.5">
              <i class="pi pi-sign-out text-xs"></i>
              Cambiar de Estudiante
            </button>
          }
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-8">

        <!-- PASO 1: Ingreso de Código de Estudiante -->
        @if (!estudiante()) {
          <div class="max-w-lg mx-auto mt-6 sm:mt-12">
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 text-center">
              <div class="w-16 h-16 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                <i class="pi pi-user-edit"></i>
              </div>

              <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                Evaluación de Desempeño Docente
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                Ingresa tu código de estudiante o cédula de identidad para cargar tus asignaturas inscritas en la gestión activa.
              </p>

              <form (ngSubmit)="consultarMaterias()" class="space-y-4 text-left">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Código de Estudiante / Matrícula
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i class="pi pi-id-card text-base"></i>
                    </span>
                    <input
                      type="text"
                      [(ngModel)]="codigoIngresado"
                      name="codigoEstudiante"
                      placeholder="Ej. 8763871"
                      required
                      class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                @if (errorConsulta()) {
                  <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                    <i class="pi pi-exclamation-circle shrink-0"></i>
                    <span>{{ errorConsulta() }}</span>
                  </div>
                }

                <button
                  type="submit"
                  [disabled]="cargandoConsulta() || !codigoIngresado.trim()"
                  class="w-full py-3.5 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl font-black shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  @if (cargandoConsulta()) {
                    <i class="pi pi-spin pi-spinner text-base"></i>
                    <span>Buscando materias...</span>
                  } @else {
                    <i class="pi pi-search text-base"></i>
                    <span>Ingresar y Evaluar</span>
                  }
                </button>
              </form>

              <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <i class="pi pi-shield text-purple-600 dark:text-purple-400"></i>
                <span>Tus respuestas son estrictamente confidenciales y anónimas.</span>
              </div>
            </div>
          </div>
        }

        <!-- PASO 2: Dashboard de Materias Asignadas -->
        @if (estudiante()) {
          <div class="space-y-6 animate-fade-in">

            <!-- Banner Informativo del Estudiante -->
            <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div class="flex items-center gap-2 text-xs font-bold text-purple-300 tracking-wider uppercase mb-1">
                    <i class="pi pi-graduation-cap"></i>
                    <span>{{ estudiante()?.carreraNombre || 'Carrera Universitaria' }}</span>
                  </div>
                  <h2 class="text-xl sm:text-2xl font-black tracking-tight mb-1">
                    {{ estudiante()?.estudianteNombre }}
                  </h2>
                  <p class="text-xs text-purple-200/80 font-mono">
                    Código: {{ estudiante()?.estudianteCodigo }} · Gestión: {{ estudiante()?.gestion || 'II-2026' }}
                  </p>
                </div>

                <!-- Tarjeta de Progreso -->
                <div class="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 min-w-[240px]">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-purple-200 uppercase tracking-wider">Tu Avance</span>
                    <span class="text-sm font-black text-white">
                      {{ estudiante()?.materiasEvaluadas }} / {{ estudiante()?.totalMaterias }} Materias
                    </span>
                  </div>
                  <div class="w-full bg-white/20 rounded-full h-3 overflow-hidden mb-2">
                    <div
                      class="bg-gradient-to-r from-emerald-400 to-teal-300 h-3 rounded-full transition-all duration-500"
                      [style.width.%]="estudiante()?.porcentajeAvance">
                    </div>
                  </div>
                  <p class="text-[11px] text-right font-bold text-emerald-300">
                    {{ estudiante()?.porcentajeAvance }}% Completado
                  </p>
                </div>
              </div>
            </div>

            <!-- Listado de Asignaturas -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <i class="pi pi-list text-purple-600"></i>
                  <span>Tus Asignaturas Inscritas ({{ estudiante()?.materias?.length || 0 }})</span>
                </h3>
                <span class="text-xs text-slate-500 font-medium hidden sm:inline">
                  Selecciona una materia pendiente para evaluar al docente
                </span>
              </div>

              @if (estudiante()?.materias?.length === 0) {
                <div class="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                  <i class="pi pi-info-circle text-2xl mb-2 text-purple-600"></i>
                  <p class="text-sm font-bold">No se encontraron asignaturas registradas para este código en la gestión activa.</p>
                </div>
              }

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (materia of estudiante()?.materias; track materia.materiaCodigo + '_' + materia.grupoCodigo) {
                  <div
                    class="bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between"
                    [class.border-emerald-300]="materia.evaluada"
                    [class.dark:border-emerald-800]="materia.evaluada"
                    [class.border-purple-200]="!materia.evaluada && materia.habilitadaParaEvaluacion"
                    [class.dark:border-purple-900]="!materia.evaluada && materia.habilitadaParaEvaluacion"
                    [class.border-slate-200]="!materia.evaluada && !materia.habilitadaParaEvaluacion"
                    [class.dark:border-slate-800]="!materia.evaluada && !materia.habilitadaParaEvaluacion"
                    [class.opacity-80]="!materia.evaluada && !materia.habilitadaParaEvaluacion">
                    <div>
                      <div class="flex items-start justify-between gap-3 mb-2">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                            {{ materia.materiaCodigo }} · {{ materia.grupoCodigo.includes(',') ? 'Grupos: ' + materia.grupoCodigo : 'Grupo ' + materia.grupoCodigo }}
                          </span>
                          @if (materia.semestre) {
                            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {{ materia.semestre }}° Semestre
                            </span>
                          }
                        </div>

                        @if (materia.evaluada) {
                          <span class="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <i class="pi pi-check-circle text-xs"></i>
                            Evaluado
                          </span>
                        } @else if (materia.habilitadaParaEvaluacion) {
                          <span class="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
                            <i class="pi pi-clock text-xs"></i>
                            Quedan {{ formatearTiempo(materia.segundosRestantesVentana) }}
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <i class="pi pi-lock text-xs"></i>
                            No Habilitado
                          </span>
                        }
                      </div>

                      <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-2 leading-snug">
                        {{ materia.materiaNombre }}
                      </h4>

                      <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                        <i class="pi pi-user text-purple-600 shrink-0"></i>
                        <span class="font-bold truncate">{{ materia.docenteNombre }}</span>
                      </div>
                    </div>

                    <div>
                      @if (materia.evaluada) {
                        <div class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span>Evaluación completada</span>
                          <i class="pi pi-verified"></i>
                        </div>
                      } @else if (materia.habilitadaParaEvaluacion) {
                        <button
                          (click)="abrirModalEvaluacion(materia)"
                          class="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <i class="pi pi-pencil text-xs"></i>
                          <span>Evaluar a este Docente</span>
                        </button>
                      } @else {
                        <div class="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            disabled
                            class="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-not-allowed">
                            <i class="pi pi-lock text-xs"></i>
                            <span>Evaluación no disponible</span>
                          </button>
                          <p class="text-[10px] text-center text-slate-400 font-medium">
                            {{ materia.motivoBloqueo || 'El semestre aún no fue habilitado por el Director de Carrera.' }}
                          </p>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

          </div>
        }

      </main>

      <!-- MODAL DE EVALUACIÓN INTERACTIVA -->
      @if (dialogEvaluacion() && materiaActiva()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-in">

            <!-- Cabecera del Modal -->
            <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 flex items-start justify-between border-b border-purple-800/40 shrink-0">
              <div>
                <span class="text-[10px] font-bold text-purple-300 uppercase tracking-widest block mb-1">
                  Evaluación de Docente
                </span>
                <h3 class="text-base sm:text-lg font-black leading-tight mb-1">
                  {{ materiaActiva()?.materiaNombre }}
                </h3>
                <p class="text-xs text-purple-200/90 font-medium">
                  Docente: <strong class="text-white">{{ materiaActiva()?.docenteNombre }}</strong> · {{ materiaActiva()?.grupoCodigo?.includes(',') ? 'Grupos: ' + materiaActiva()?.grupoCodigo : 'Grupo ' + materiaActiva()?.grupoCodigo }}
                </p>
              </div>

              <button
                (click)="cerrarModalEvaluacion()"
                class="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <i class="pi pi-times text-base"></i>
              </button>
            </div>

            <!-- Cuerpo con preguntas -->
            <div class="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

              @if (cargandoInstrumento()) {
                <div class="py-12 text-center text-slate-500">
                  <i class="pi pi-spin pi-spinner text-3xl mb-3 text-purple-600"></i>
                  <p class="text-xs font-bold">Cargando cuestionario de evaluación...</p>
                </div>
              } @else if (instrumento()) {

                <!-- Escala de Referencia Oficial UNITEPC -->
                <div class="p-4 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <i class="pi pi-info-circle text-purple-600"></i>
                      <span>Escala de Referencia</span>
                    </span>
                    <span class="text-[11px] text-slate-500 font-medium">Selecciona una opción por cada pregunta</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-700 text-white font-bold text-xs shadow-xs">
                      <span class="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center font-black text-xs shrink-0">1</span>
                      <span class="tracking-wide">NUNCA</span>
                    </div>
                    <div class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-xs">
                      <span class="w-6 h-6 rounded-full bg-white text-cyan-900 flex items-center justify-center font-black text-xs shrink-0">2</span>
                      <span class="tracking-wide">CASI SIEMPRE</span>
                    </div>
                    <div class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs shadow-xs">
                      <span class="w-6 h-6 rounded-full bg-white text-purple-900 flex items-center justify-center font-black text-xs shrink-0">3</span>
                      <span class="tracking-wide">SIEMPRE</span>
                    </div>
                  </div>
                </div>

                <!-- Secciones y Criterios -->
                @for (seccion of instrumento()?.secciones; track seccion.id) {
                  <div class="space-y-3">
                    <div class="border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      <h4 class="text-xs font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                        {{ seccion.nombre }}
                      </h4>
                      @if (seccion.descripcion) {
                        <p class="text-[11px] text-slate-500">{{ seccion.descripcion }}</p>
                      }
                    </div>

                    <div class="space-y-4">
                      @for (criterio of seccion.criterios; track criterio.id) {
                        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                          <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            <span class="font-bold text-purple-600 dark:text-purple-400 mr-1.5">{{ criterio.numero }}</span>
                            {{ criterio.enunciado }}
                          </p>

                          <!-- Opciones de Calificación -->
                          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            @for (item of obtenerEscalaValores(); track item.valor) {
                              <button
                                type="button"
                                (click)="seleccionarPuntaje(criterio.id, item.valor)"
                                [class]="respuestas[criterio.id] === item.valor 
                                  ? item.estiloActivo + ' shadow-md' 
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-purple-400'"
                                class="py-2.5 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 text-center">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                                  [class]="respuestas[criterio.id] === item.valor ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'">
                                  {{ item.label }}
                                </span>
                                <span class="text-xs font-bold uppercase tracking-wide">{{ item.desc }}</span>
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- COMPARTENOS TU OPINIÓN (respuesta opcional) -->
                <div class="p-4 bg-slate-100/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label class="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    COMPÁRTENOS TU OPINIÓN (Respuesta opcional)
                  </label>
                  <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Si has notado alguna situación que no te parezca correcta, te invitamos a compartir brevemente lo sucedido, mencionando: <b>Qué</b>, <b>Cuándo</b> y <b>Dónde</b> ocurrió. Tu opinión es valiosa para mejorar nuestra comunidad universitaria.
                  </p>
                  <textarea
                    [(ngModel)]="observaciones"
                    rows="3"
                    placeholder="Escribe aquí tu opinión o comentarios constructivos..."
                    class="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500">
                  </textarea>
                </div>

              }

            </div>

            <!-- Pie del Modal con Guardado -->
            <div class="p-4 sm:p-5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                (click)="cerrarModalEvaluacion()"
                class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                Cancelar
              </button>

              <button
                type="button"
                (click)="enviarEvaluacion()"
                [disabled]="guardandoEvaluacion() || !todasRespondidas()"
                class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                @if (guardandoEvaluacion()) {
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>Guardando...</span>
                } @else {
                  <i class="pi pi-check"></i>
                  <span>Enviar Evaluación Oficial</span>
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- TOAST DE NOTIFICACIÓN -->
      @if (toastMensaje()) {
        <div class="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-sm">
          <div
            class="px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-bold text-white"
            [class.bg-emerald-600]="toastTipo() === 'success'"
            [class.bg-rose-600]="toastTipo() === 'error'">
            <i class="pi" [class.pi-check-circle]="toastTipo() === 'success'" [class.pi-exclamation-triangle]="toastTipo() === 'error'"></i>
            <span>{{ toastMensaje() }}</span>
          </div>
        </div>
      }

    </div>
  `
})
export class EvaluacionEstudiantilComponent implements OnInit, OnDestroy {
  private readonly _evaluacionService = inject(EvaluacionDocenteService);
  private _temporizadorInterval: any = null;

  public readonly logoUnitepc = UNITEPC_LOGO_PNG;

  public codigoIngresado = '';
  public cargandoConsulta = signal(false);
  public errorConsulta = signal<string | null>(null);

  public estudiante = signal<EstudianteAvanceEvaluacion | null>(null);

  // Modal de evaluación
  public dialogEvaluacion = signal(false);
  public materiaActiva = signal<MateriaEstudiante | null>(null);
  public instrumento = signal<EvaluacionInstrumento | null>(null);
  public cargandoInstrumento = signal(false);
  public guardandoEvaluacion = signal(false);

  public respuestas: Record<string, number> = {};
  public observaciones = '';

  // Toast
  public toastMensaje = signal<string | null>(null);
  public toastTipo = signal<'success' | 'error'>('success');

  public ngOnInit(): void {
    // Si viene código en query params, se podría auto-consultar
  }

  public ngOnDestroy(): void {
    this._detenerTemporizador();
  }

  public consultarMaterias(): void {
    const cod = this.codigoIngresado.trim();
    if (!cod) return;

    this.cargandoConsulta.set(true);
    this.errorConsulta.set(null);

    this._evaluacionService.consultarMateriasEstudiante(cod).subscribe({
      next: res => {
        this.cargandoConsulta.set(false);
        if (!res || !res.materias || res.materias.length === 0) {
          this.errorConsulta.set('No se encontraron materias asignadas para este código en la gestión académica.');
          return;
        }
        this.estudiante.set(res);
        this._iniciarTemporizador();
      },
      error: err => {
        this.cargandoConsulta.set(false);
        this.errorConsulta.set(err?.error?.message || err?.message || 'No se pudo consultar el código de estudiante.');
      }
    });
  }

  public salir(): void {
    this._detenerTemporizador();
    this.estudiante.set(null);
    this.codigoIngresado = '';
    this.errorConsulta.set(null);
  }

  public abrirModalEvaluacion(materia: MateriaEstudiante): void {
    if (!materia.habilitadaParaEvaluacion) {
      this.mostrarToast(materia.motivoBloqueo || 'La evaluación no está habilitada actualmente para este semestre.', 'error');
      return;
    }

    this.materiaActiva.set(materia);
    this.respuestas = {};
    this.observaciones = '';
    this.dialogEvaluacion.set(true);

    if (!this.instrumento()) {
      this.cargandoInstrumento.set(true);
      this._evaluacionService.obtenerInstrumentoEstudianteVigente().subscribe({
        next: inst => {
          this.cargandoInstrumento.set(false);
          this.instrumento.set(inst);
        },
        error: err => {
          this.cargandoInstrumento.set(false);
          this.mostrarToast('Error al cargar las preguntas de evaluación.', 'error');
        }
      });
    }
  }

  public cerrarModalEvaluacion(): void {
    if (this.guardandoEvaluacion()) return;
    this.dialogEvaluacion.set(false);
    this.materiaActiva.set(null);
  }

  public seleccionarPuntaje(criterioId: string, valor: number): void {
    this.respuestas[criterioId] = valor;
  }

  public obtenerEscalaValores(): { valor: number; label: string; desc: string; estiloActivo: string }[] {
    const min = this.instrumento()?.escalaMin ?? 1;
    const max = this.instrumento()?.escalaMax ?? 3;
    if (min === 1 && max === 3) {
      return [
        { valor: 1, label: '1', desc: 'Nunca', estiloActivo: 'bg-slate-700 text-white border-slate-700' },
        { valor: 2, label: '2', desc: 'Casi Siempre', estiloActivo: 'bg-cyan-600 text-white border-cyan-600' },
        { valor: 3, label: '3', desc: 'Siempre', estiloActivo: 'bg-purple-700 text-white border-purple-700' }
      ];
    }
    const list = [];
    for (let v = min; v <= max; v++) {
      list.push({ valor: v, label: String(v), desc: '', estiloActivo: 'bg-purple-700 text-white border-purple-700' });
    }
    return list;
  }

  public todasRespondidas(): boolean {
    const inst = this.instrumento();
    if (!inst || !inst.secciones) return false;
    for (const sec of inst.secciones) {
      for (const crit of sec.criterios) {
        if (!this.respuestas[crit.id]) return false;
      }
    }
    return true;
  }

  public enviarEvaluacion(): void {
    const est = this.estudiante();
    const mat = this.materiaActiva();
    if (!est || !mat) return;

    this.guardandoEvaluacion.set(true);

    const payload = {
      estudianteCodigo: est.estudianteCodigo,
      estudianteNombre: est.estudianteNombre,
      materiaCodigo: mat.materiaCodigo,
      materiaNombre: mat.materiaNombre,
      grupoCodigo: mat.grupoCodigo,
      docenteNombre: mat.docenteNombre,
      gestion: est.gestion || 'ACTIVA',
      sedeCodigo: mat.sedeCodigo || est.sedeCodigo || 'CBA',
      carreraCodigo: mat.carreraCodigo || est.carreraCodigo || 'GENERAL',
      instrumentoId: this.instrumento()?.id,
      observaciones: this.observaciones,
      respuestas: this.respuestas
    };

    this._evaluacionService.aplicarEvaluacionEstudiante(payload).subscribe({
      next: () => {
        this.guardandoEvaluacion.set(false);
        this.dialogEvaluacion.set(false);
        this.mostrarToast('¡Evaluación registrada con éxito! Gracias por tu participación.', 'success');

        // Refrescar materias del estudiante
        this._evaluacionService.consultarMateriasEstudiante(est.estudianteCodigo, est.gestion).subscribe({
          next: actualizado => {
            this.estudiante.set(actualizado);
            this._iniciarTemporizador();
          }
        });
      },
      error: err => {
        this.guardandoEvaluacion.set(false);
        const msg = err?.error?.message || err?.message || 'Error al guardar la evaluación.';
        this.mostrarToast(msg, 'error');
      }
    });
  }

  public formatearTiempo(segundos?: number): string {
    if (segundos === undefined || segundos === null || segundos <= 0) return '00:00';
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    const mm = m < 10 ? '0' + m : m;
    const ss = s < 10 ? '0' + s : s;
    if (h > 0) {
      const hh = h < 10 ? '0' + h : h;
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  }

  private _iniciarTemporizador(): void {
    this._detenerTemporizador();
    this._temporizadorInterval = setInterval(() => {
      const est = this.estudiante();
      if (!est || !est.materias) return;
      let huboCambios = false;
      for (const mat of est.materias) {
        if (mat.segundosRestantesVentana !== undefined && mat.segundosRestantesVentana !== null && mat.segundosRestantesVentana > 0) {
          mat.segundosRestantesVentana--;
          if (mat.segundosRestantesVentana <= 0) {
            mat.habilitadaParaEvaluacion = false;
            mat.motivoBloqueo = 'El tiempo de habilitación para este semestre ha expirado';
            huboCambios = true;
          }
        }
      }
      if (huboCambios) {
        this.estudiante.set({ ...est });
      }
    }, 1000);
  }

  private _detenerTemporizador(): void {
    if (this._temporizadorInterval) {
      clearInterval(this._temporizadorInterval);
      this._temporizadorInterval = null;
    }
  }

  private mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje.set(mensaje);
    this.toastTipo.set(tipo);
    setTimeout(() => this.toastMensaje.set(null), 4000);
  }
}
