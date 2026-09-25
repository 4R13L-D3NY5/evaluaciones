import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { MathContentDirective } from '../../shared/components/math-content.directive';

interface OpcionVirtual { letra: string; texto: string; }
interface PreguntaVirtual {
  reactivoId: number;
  numeroPregunta: number;
  tipoReactivo: string;
  grupoContexto?: string;
  enunciado: string;
  imagenBase64?: string;
  opciones: OpcionVirtual[];
  opcionesRespuesta?: OpcionVirtual[];
}
interface ContextoSeccion {
  titulo: string;
  enunciado: string;
  opciones: OpcionVirtual[];
}
interface SeccionVirtual {
  codigo: string;
  titulo: string;
  instrucciones: string[];
  contexto?: ContextoSeccion;
  preguntas: PreguntaVirtual[];
}
interface AccesoVirtual {
  intentoId: string;
  tokenSesion: string;
  codigoEstudiante: string;
  nombreEstudiante: string;
  codigoSala: string;
  institucionNombre?: string;
  sedeNombre?: string;
  carreraNombre?: string;
  materiaCodigo?: string;
  materiaNombre?: string;
  grupo?: string;
  docenteNombre?: string;
  tipoParcial?: string;
  modalidad?: string;
  fecha?: string;
  horario?: string;
  aula?: string;
  estadoSala: string;
  estadoIntento: string;
  salidasPantalla?: number;
  advertenciasDocente?: number;
  mensajeAdvertencia?: string;
  iniciadaEn?: string;
  terminaEn?: string;
  cuentaRegresivaSegundos?: number;
  tiempoRestanteSegundos?: number;
  preguntas: PreguntaVirtual[];
  respuestasGuardadas?: Record<number, string>;
}

@Component({
  selector: 'sea-examen-virtual', standalone: true, imports: [CommonModule, FormsModule, MathContentDirective],
  template: `
    <main class="min-h-screen bg-slate-50 text-slate-900 pb-16 antialiased selection:bg-indigo-500 selection:text-white">
      
      <!-- TOP INSTITUTIONAL BAR -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div class="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <i class="pi pi-check-square text-lg"></i>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-indigo-600">UNITEPC · Sistema de Evaluaciones</p>
              <h1 class="text-base sm:text-lg font-black tracking-tight text-slate-900">
                {{ acceso()?.materiaNombre || 'Examen Virtual' }}
              </h1>
            </div>
          </div>

          <!-- STATUS & TIMER IF IN EXAM -->
          @if (vista() === 'examen' && acceso(); as examen) {
            <div class="flex items-center gap-3">
              <!-- Sync indicator -->
              <div class="hidden sm:flex items-center">
                @if (guardandoEstado() === 'guardado') {
                  <span class="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <i class="pi pi-check text-[10px]"></i> Guardado
                  </span>
                } @else if (guardandoEstado() === 'guardando') {
                  <span class="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 animate-pulse">
                    <i class="pi pi-spin pi-spinner text-[10px]"></i> Sincronizando...
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1.5 text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    <i class="pi pi-exclamation-triangle text-[10px]"></i> Error de red
                  </span>
                }
              </div>

              <!-- Countdown Clock -->
              <div class="flex items-center gap-2 rounded-xl px-3.5 py-1.5 border"
                   [ngClass]="{
                     'bg-rose-50 border-rose-200 text-rose-700 animate-pulse': segundos <= 180,
                     'bg-amber-50 border-amber-200 text-amber-800': segundos > 180 && segundos <= 600,
                     'bg-indigo-50 border-indigo-200 text-indigo-800': segundos > 600
                   }">
                <i class="pi pi-clock text-xs"></i>
                <div>
                  <span class="block text-[9px] font-black uppercase tracking-wider leading-none opacity-80">Tiempo</span>
                  <b class="font-mono text-sm sm:text-base font-black tabular-nums">{{ tiempoRestante() }}</b>
                </div>
              </div>
            </div>
          }
        </div>
      </header>

      <div class="mx-auto max-w-4xl px-4 pt-6">

        <!-- ========================================== -->
        <!-- VISTA: ACCESO A LA SALA                    -->
        <!-- ========================================== -->
        @if (vista() === 'acceso') {
          <section class="mx-auto mt-4 max-w-md rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/50">
            <div class="text-center mb-6">
              <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <i class="pi pi-sign-in text-2xl"></i>
              </div>
              <h2 class="text-xl font-black text-slate-900">Ingreso a la Evaluación</h2>
              <p class="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Ingresa el código de la sala, tu código institucional y el PIN o token compartido por tu docente.
              </p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">Código de sala</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <i class="pi pi-hashtag text-xs"></i>
                  </span>
                  <input [(ngModel)]="codigoSala" 
                         placeholder="SALA-XXXXXX" 
                         class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-3 text-sm font-mono font-bold uppercase tracking-wider text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100">
                </div>
              </div>

              <div>
                <label class="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">Código de estudiante</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <i class="pi pi-id-card text-xs"></i>
                  </span>
                  <input [(ngModel)]="codigoEstudiante" 
                         placeholder="Ej. 102948" 
                         class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100">
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-black uppercase tracking-wider text-slate-600">PIN o Token de acceso</label>
                  <span class="text-[10px] text-indigo-600 font-bold">6 dígitos o token</span>
                </div>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <i class="pi pi-key text-xs"></i>
                  </span>
                  <input [(ngModel)]="token" 
                         type="text" 
                         placeholder="Ej. 482109" 
                         class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-3 text-sm font-mono font-bold tracking-wider text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100">
                </div>
                <p class="mt-1.5 text-[11px] text-slate-500">
                  Dictado o proyectado por el docente en el aula.
                </p>
              </div>

              @if (error()) {
                <div class="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-center gap-2">
                  <i class="pi pi-times-circle shrink-0 text-sm"></i>
                  <span>{{ error() }}</span>
                </div>
              }

              <button (click)="ingresar()" 
                      [disabled]="cargando() || !codigoSala.trim() || !token.trim()" 
                      class="mt-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] py-3.5 font-black text-white shadow-lg shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer">
                @if (cargando()) {
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>Validando acceso...</span>
                } @else {
                  <span>Ingresar a la evaluación</span>
                  <i class="pi pi-arrow-right text-xs"></i>
                }
              </button>
            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- VISTA: SALA DE ESPERA (LOBBY)             -->
        <!-- ========================================== -->
        @if (vista() === 'espera') {
          <section class="mx-auto mt-6 max-w-lg rounded-3xl border border-indigo-100 bg-white p-8 sm:p-10 text-center shadow-xl shadow-slate-200/50">
            <div class="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <i class="pi pi-hourglass text-3xl animate-spin" style="animation-duration: 4s;"></i>
              <span class="absolute -top-1 -right-1 flex h-4 w-4">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-4 w-4 bg-indigo-600"></span>
              </span>
            </div>

            <h2 class="mt-6 text-xl font-black text-slate-900">Sala de espera</h2>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Hola, <strong class="text-slate-900">{{ acceso()?.nombreEstudiante }}</strong>. Estás registrado en la evaluación. El examen iniciará en breve cuando el docente dé la orden.
            </p>

            <div class="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left space-y-2 text-xs">
              <div class="flex justify-between border-b border-slate-200 pb-2">
                <span class="text-slate-500">Materia:</span>
                <b class="text-slate-800 text-right">{{ acceso()?.materiaNombre }}</b>
              </div>
              <div class="flex justify-between border-b border-slate-200 pb-2">
                <span class="text-slate-500">Docente:</span>
                <b class="text-slate-800 text-right">{{ acceso()?.docenteNombre || '—' }}</b>
              </div>
              <div class="flex justify-between border-b border-slate-200 pb-2">
                <span class="text-slate-500">Código de Sala:</span>
                <b class="font-mono text-indigo-700 font-black">{{ acceso()?.codigoSala }}</b>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Estado:</span>
                <span class="inline-flex items-center gap-1.5 text-indigo-600 font-bold">
                  <span class="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                  Conectado · Esperando inicio
                </span>
              </div>
            </div>

            <p class="mt-6 text-[11px] text-slate-400">
              Esta pantalla se actualizará automáticamente. No cierres esta pestaña.
            </p>
          </section>
        }

        <!-- ========================================== -->
        <!-- VISTA: CONTEO REGRESIVO DE PREINICIO       -->
        <!-- ========================================== -->
        @if (vista() === 'preinicio' && acceso(); as examen) {
          <section class="mx-auto mt-6 max-w-lg rounded-3xl border border-indigo-200 bg-white p-8 sm:p-10 text-center shadow-xl shadow-indigo-100">
            <p class="text-xs font-black uppercase tracking-widest text-indigo-600">La evaluación iniciará en</p>
            <div class="mt-4 font-mono text-7xl font-black tabular-nums text-indigo-700 animate-bounce">
              {{ cuentaRegresiva() }}
            </div>
            <h2 class="mt-4 text-xl font-black text-slate-900">¡Prepárate!</h2>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              El docente ha iniciado la sala. Cuando termine la cuenta regresiva, tus preguntas se mostrarán de forma automática.
            </p>
            <div class="mt-6 rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 text-xs text-indigo-900">
              <b>Estudiante:</b> {{ examen.nombreEstudiante }} ({{ examen.codigoEstudiante }})<br>
              <b>Sala:</b> {{ examen.codigoSala }}
            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- VISTA: EXAMEN EN CURSO                     -->
        <!-- ========================================== -->
        @if (vista() === 'examen' && acceso(); as examen) {
          
          <!-- EXAM METADATA CARD -->
          <section class="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-100 bg-slate-50/80 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">Estudiante</span>
                <strong class="text-sm font-black text-slate-900">{{ examen.nombreEstudiante }}</strong>
                <span class="text-slate-400 text-[11px] ml-1.5">({{ examen.codigoEstudiante }})</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500">Materia:</span>
                <strong class="text-slate-800">{{ examen.materiaCodigo }} · {{ examen.materiaNombre }}</strong>
                <span class="text-slate-300">|</span>
                <span class="text-slate-500">Grupo:</span>
                <strong class="text-slate-800">{{ examen.grupo }}</strong>
              </div>
            </div>

            <!-- QUESTION PROGRESS & MINIMAP -->
            <div class="p-4 sm:p-5 bg-white border-b border-slate-100">
              <div class="flex items-center justify-between gap-4 mb-2.5">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black uppercase tracking-wider text-slate-500">Progreso</span>
                  <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {{ respondidasCount() }} de {{ totalPreguntas() }} respondidas
                  </span>
                </div>
                <span class="text-xs font-black font-mono text-slate-600">{{ porcentajeProgreso() }}%</span>
              </div>

              <!-- Progress bar -->
              <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-600 transition-all duration-300 rounded-full" 
                     [style.width.%]="porcentajeProgreso()"></div>
              </div>

              <!-- MINIMAP QUESTION NAVIGATOR -->
              <div class="mt-4 pt-3 border-t border-slate-100">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-bold text-slate-500">Navegador de preguntas:</span>
                  <span class="text-[10px] text-slate-400">Clic para saltar</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  @for (pNum of listaNumerosPreguntas(); track pNum) {
                    <button (click)="saltarAPregunta(pNum)"
                            type="button"
                            class="h-7 w-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer border"
                            [ngClass]="{
                              'bg-emerald-600 text-white border-emerald-600 shadow-xs': respuestas()[pNum],
                              'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100': !respuestas()[pNum]
                            }">
                      {{ pNum }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- SECCIONES Y PREGUNTAS -->
          <div class="space-y-6">
            @for (seccion of secciones(); track seccion.codigo + '-' + $index) {
              <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                
                <!-- Header de Sección -->
                <header class="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
                  <p class="text-[10px] font-black uppercase tracking-widest text-indigo-600">Sección {{ $index + 1 }}</p>
                  <h2 class="mt-1 text-base font-black text-slate-900">{{ seccion.titulo }}</h2>
                  <div class="mt-2 space-y-1">
                    @for (instruccion of seccion.instrucciones; track instruccion) {
                      <p class="text-xs leading-5 text-slate-600">{{ instruccion }}</p>
                    }
                  </div>
                </header>

                <!-- Contexto agrupado (Casos clínicos o emparejamiento) -->
                @if (seccion.contexto; as contexto) {
                  <div class="mx-5 mt-5 rounded-xl border border-slate-300 bg-slate-50/90 p-4">
                    <p class="text-xs font-black uppercase tracking-wider text-slate-800">{{ contexto.titulo }}</p>
                    @if (contexto.enunciado) {
                      <p [seaMathContent]="contexto.enunciado" class="mt-2 text-sm font-medium leading-relaxed text-slate-800"></p>
                    }
                    @if (contexto.opciones.length) {
                      <div class="mt-3 space-y-1.5">
                        @for (opcion of contexto.opciones; track opcion.letra) {
                          <div class="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                            <b class="text-indigo-700 shrink-0">{{ opcion.letra }})</b>
                            <span [seaMathContent]="opcion.texto"></span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- Preguntas de la sección -->
                <div class="space-y-5 p-5">
                  @for (pregunta of seccion.preguntas; track pregunta.numeroPregunta) {
                    <article [id]="'pregunta-' + pregunta.numeroPregunta"
                             class="rounded-2xl border border-slate-200/80 p-5 transition hover:border-slate-300 bg-white shadow-xs">
                      
                      <!-- Header de la pregunta -->
                      <div class="flex items-start gap-3.5">
                        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black transition"
                              [ngClass]="{
                                'bg-emerald-600 text-white shadow-xs': respuestas()[pregunta.numeroPregunta],
                                'bg-indigo-50 text-indigo-700 border border-indigo-100': !respuestas()[pregunta.numeroPregunta]
                              }">
                          {{ pregunta.numeroPregunta }}
                        </span>

                        <div class="min-w-0 flex-1">
                          <p [seaMathContent]="pregunta.enunciado" class="text-sm sm:text-base font-semibold leading-relaxed text-slate-900"></p>

                          <!-- Imagen de apoyo si existe -->
                          @if (pregunta.imagenBase64) {
                            <div class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                              <img [src]="imagenBase64SinMetadatos(pregunta.imagenBase64)" 
                                   alt="Imagen de apoyo" 
                                   loading="lazy" 
                                   class="mx-auto max-w-full object-contain" 
                                   [style.max-height.%]="alturaImagenPregunta(pregunta.imagenBase64)">
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Sub-afirmaciones en preguntas complejas -->
                      @if (pregunta.tipoReactivo === 'VERDADERO_O_FALSO_COMPLEJAS') {
                        <div class="mt-4 space-y-2 pl-11">
                          @for (afirmacion of pregunta.opciones; let indice = $index; track afirmacion.letra) {
                            <div class="rounded-xl bg-slate-50/80 border border-slate-200/70 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                              <b class="text-indigo-700 shrink-0">{{ indice + 1 }}.</b>
                              <span [seaMathContent]="afirmacion.texto"></span>
                            </div>
                          }
                        </div>
                      }

                      <!-- Opciones de respuesta Card-Based -->
                      <div class="mt-4 grid gap-2.5" [ngClass]="claseOpciones(pregunta)">
                        @for (opcion of opcionesParaResponder(pregunta); track opcion.letra) {
                          <label class="group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all hover:border-indigo-200 hover:bg-slate-50"
                                 [class.border-indigo-600]="respuestas()[pregunta.numeroPregunta] === opcion.letra"
                                 [class.bg-indigo-50]="respuestas()[pregunta.numeroPregunta] === opcion.letra"
                                 [class.shadow-xs]="respuestas()[pregunta.numeroPregunta] === opcion.letra"
                                 [class.border-slate-200]="respuestas()[pregunta.numeroPregunta] !== opcion.letra"
                                 [class.justify-center]="esGrupoCompacto(pregunta)"
                                 [attr.title]="esGrupoCompacto(pregunta) ? opcion.texto : null">
                            
                            <input type="radio" 
                                   [name]="'pregunta-' + pregunta.numeroPregunta" 
                                   [value]="opcion.letra" 
                                   [checked]="respuestas()[pregunta.numeroPregunta] === opcion.letra" 
                                   (change)="responder(pregunta, opcion.letra)" 
                                   [class.sr-only]="esGrupoCompacto(pregunta)" 
                                   class="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer">

                            <span class="flex items-center gap-2 text-xs sm:text-sm"
                                  [ngClass]="{
                                    'font-black text-indigo-950': respuestas()[pregunta.numeroPregunta] === opcion.letra,
                                    'text-slate-700': respuestas()[pregunta.numeroPregunta] !== opcion.letra
                                  }">
                              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                                    [ngClass]="{
                                      'bg-indigo-600 text-white': respuestas()[pregunta.numeroPregunta] === opcion.letra,
                                      'bg-slate-100 text-slate-600': respuestas()[pregunta.numeroPregunta] !== opcion.letra
                                    }">
                                {{ opcion.letra }}
                              </span>
                              @if (!esGrupoCompacto(pregunta)) {
                                <span [seaMathContent]="opcion.texto" class="leading-snug"></span>
                              }
                            </span>
                          </label>
                        }
                      </div>

                    </article>
                  }
                </div>
              </section>
            }
          </div>

          <!-- BOTTOM ACTION BAR -->
          <div class="sticky bottom-4 mt-8 flex flex-wrap items-center justify-between gap-4 bg-white/95 backdrop-blur-xs border border-slate-200 p-4 rounded-2xl shadow-xl">
            <div class="text-xs">
              @if (totalPreguntas() > 0 && respondidasCount() >= totalPreguntas()) {
                <span class="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <i class="pi pi-check-circle text-sm text-emerald-600"></i> Has respondido todas las preguntas ({{ totalPreguntas() }} de {{ totalPreguntas() }})
                </span>
              } @else {
                <span class="text-amber-800 font-bold flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <i class="pi pi-info-circle text-sm text-amber-600"></i> Te restan {{ preguntasRestantes() }} preguntas por marcar (has respondido {{ respondidasCount() }} de {{ totalPreguntas() }})
                </span>
              }
            </div>

            <button (click)="enviar()" 
                    [disabled]="enviando()"
                    class="rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-6 py-3 font-black text-white text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              @if (enviando()) {
                <i class="pi pi-spin pi-spinner"></i>
                <span>Enviando respuestas...</span>
              } @else {
                <span>Finalizar y entregar</span>
                <i class="pi pi-send text-xs"></i>
              }
            </button>
          </div>
        }

        <!-- ========================================== -->
        <!-- VISTA: FINALIZADO                          -->
        <!-- ========================================== -->
        @if (vista() === 'finalizado') {
          <section class="mx-auto mt-6 max-w-lg rounded-3xl border border-emerald-100 bg-white p-8 sm:p-10 text-center shadow-xl shadow-slate-200/50">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              <i class="pi pi-check-circle text-4xl"></i>
            </div>
            <h2 class="mt-6 text-2xl font-black text-slate-900">¡Examen entregado!</h2>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Tu intento fue registrado correctamente en el servidor. Tus respuestas han sido aseguradas.
            </p>
            <div class="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1 text-left">
              <div><b>Estudiante:</b> {{ acceso()?.nombreEstudiante }}</div>
              <div><b>Materia:</b> {{ acceso()?.materiaNombre }}</div>
              <div><b>Código de Sala:</b> {{ acceso()?.codigoSala }}</div>
            </div>
            <p class="mt-6 text-xs text-slate-400">
              Puedes cerrar esta ventana con seguridad.
            </p>
          </section>
        }

        <!-- ========================================== -->
        <!-- VISTA: ANULADO                             -->
        <!-- ========================================== -->
        @if (vista() === 'anulado') {
          <section class="mx-auto mt-6 max-w-lg rounded-3xl border border-rose-200 bg-white p-8 sm:p-10 text-center shadow-xl shadow-rose-100">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 shadow-sm">
              <i class="pi pi-ban text-4xl"></i>
            </div>
            <h2 class="mt-6 text-2xl font-black text-rose-900">Evaluación Anulada</h2>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Tu intento en esta evaluación ha sido anulado por el docente supervisor de la sala.
            </p>
            @if (mensajeDocenteActual() || acceso()?.mensajeAdvertencia) {
              <div class="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 text-left font-medium">
                <b>Motivo registrado:</b> {{ mensajeDocenteActual() || acceso()?.mensajeAdvertencia }}
              </div>
            }
            <div class="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1 text-left">
              <div><b>Estudiante:</b> {{ acceso()?.nombreEstudiante }} ({{ acceso()?.codigoEstudiante }})</div>
              <div><b>Materia:</b> {{ acceso()?.materiaNombre }}</div>
              <div><b>Código de Sala:</b> {{ acceso()?.codigoSala }}</div>
            </div>
            <p class="mt-6 text-xs text-slate-500">
              Por favor, comunícate inmediatamente con el docente a cargo de la evaluación si consideras que se trata de un error.
            </p>
          </section>
        }

      </div>

      <!-- MODAL SUPERVISIÓN ANTIFRAUDE: SALIDA DE PESTAÑA -->
      @if (mostrarAlertaSalida()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div class="w-full max-w-md overflow-hidden rounded-3xl border-2 border-rose-500 bg-white shadow-2xl p-6 sm:p-7 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
              <i class="pi pi-exclamation-triangle text-3xl animate-bounce"></i>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-rose-600">Supervisión en vivo</p>
            <h3 class="mt-1 text-lg font-black text-slate-900">¡Alerta de Abandono de Pestaña!</h3>
            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Se detectó que cambiaste de ventana o minimizaste el examen. Este evento quedó registrado y ha sido reportado al docente en tiempo real.
            </p>
            <div class="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 text-left">
              <p class="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                <i class="pi pi-shield"></i> Reglas de control institucional:
              </p>
              <ul class="list-disc list-inside space-y-0.5 text-[11px] text-amber-950">
                <li>No navegues a otros sitios ni abras aplicaciones secundarias.</li>
                <li>Las salidas reiteradas facultan al docente para anular la evaluación.</li>
              </ul>
            </div>
            <button (click)="cerrarAlertaSalida()"
                    class="mt-5 w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black py-3 px-4 text-xs sm:text-sm shadow-lg shadow-rose-200 transition cursor-pointer">
              Comprendo y continúo con el examen
            </button>
          </div>
        </div>
      }

      <!-- MODAL ADVERTENCIA DIRECTA DEL DOCENTE -->
      @if (mostrarAdvertenciaDocente()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div class="w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-500 bg-white shadow-2xl p-6 sm:p-7 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <i class="pi pi-bell text-3xl"></i>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-amber-700">Aviso del Supervisor</p>
            <h3 class="mt-1 text-lg font-black text-slate-900">Advertencia del Docente</h3>
            <div class="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-950 text-left font-medium">
              {{ mensajeDocenteActual() || 'El docente ha emitido una llamada de atención para tu intento. Mantente enfocado en la pantalla del examen.' }}
            </div>
            <button (click)="cerrarAdvertenciaDocente()"
                    class="mt-5 w-full rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black py-3 px-4 text-xs sm:text-sm shadow-lg shadow-amber-200 transition cursor-pointer">
              Entendido
            </button>
          </div>
        </div>
      }
    </main>
  `
})
export class ExamenVirtualComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly feedback = inject(UiFeedbackService);
  private readonly route = inject(ActivatedRoute);

  vista = signal<'acceso' | 'espera' | 'preinicio' | 'examen' | 'finalizado' | 'anulado'>('acceso');
  acceso = signal<AccesoVirtual | null>(null);
  secciones = signal<SeccionVirtual[]>([]);
  cargando = signal(false);
  error = signal('');
  guardandoEstado = signal<'guardado' | 'guardando' | 'error'>('guardado');
  enviando = signal(false);

  // Antifraude y supervisión docente
  mostrarAlertaSalida = signal(false);
  mostrarAdvertenciaDocente = signal(false);
  mensajeDocenteActual = signal('');
  contadorSalidasLocal = signal(0);
  private ultimaSalidaTimestamp = 0;
  private salioDePantalla = false;
  private ultimoMensajeDocenteVisto = '';
  private monitorExamen?: ReturnType<typeof setInterval>;

  codigoSala = '';
  codigoEstudiante = '';
  token = '';
  respuestas = signal<Record<number, string>>({});

  private polling?: ReturnType<typeof setInterval>;
  private reloj?: ReturnType<typeof setInterval>;
  private cuenta?: ReturnType<typeof setInterval>;
  segundos = 0;
  segundosInicio = 0;

  totalPreguntas = computed(() => {
    return this.secciones().reduce((acc, s) => acc + s.preguntas.length, 0);
  });

  respondidasCount = computed(() => {
    const r = this.respuestas();
    return Object.keys(r).filter(k => !!r[Number(k)]).length;
  });

  preguntasRestantes = computed(() => {
    return Math.max(0, this.totalPreguntas() - this.respondidasCount());
  });

  porcentajeProgreso = computed(() => {
    const total = this.totalPreguntas();
    if (!total) return 0;
    return Math.min(100, Math.round((this.respondidasCount() / total) * 100));
  });

  listaNumerosPreguntas = computed(() => {
    const numeros: number[] = [];
    for (const s of this.secciones()) {
      for (const p of s.preguntas) {
        numeros.push(p.numeroPregunta);
      }
    }
    return numeros.sort((a, b) => a - b);
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const salaParam = params.get('sala');
      const pinParam = params.get('pin') || params.get('token');
      const estParam = params.get('estudiante') || params.get('codigo');

      if (salaParam) this.codigoSala = salaParam.trim().toUpperCase();
      if (pinParam) this.token = pinParam.trim();
      if (estParam) this.codigoEstudiante = estParam.trim();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('blur', this.onWindowBlur);
      window.addEventListener('focus', this.onWindowFocus);
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  ingresar(): void {
    this.error.set('');
    this.cargando.set(true);
    this.http.post<AccesoVirtual>('/api/acceso-virtual/validar', {
      codigoSala: this.codigoSala.trim(),
      codigoEstudiante: this.codigoEstudiante.trim(),
      token: this.token.trim()
    }).subscribe({
      next: data => {
        this.cargando.set(false);
        this.actualizarVista(data);
      },
      error: err => {
        this.cargando.set(false);
        this.error.set(err?.error?.error || err?.error?.message || 'No se pudo validar el acceso.');
      }
    });
  }

  responder(pregunta: PreguntaVirtual, respuesta: string): void {
    this.respuestas.update(r => ({ ...r, [pregunta.numeroPregunta]: respuesta }));
    this.guardandoEstado.set('guardando');

    // Guardar respaldo temporal en sessionStorage ante micro-cortes
    const intentoId = this.acceso()?.intentoId || 'temp';
    try {
      sessionStorage.setItem('sea_respuestas_' + intentoId, JSON.stringify(this.respuestas()));
    } catch {}

    const headers = new HttpHeaders({ 'X-Examen-Token': this.acceso()?.tokenSesion || this.token });
    this.http.put('/api/examen-virtual/respuestas', {
      numeroPregunta: pregunta.numeroPregunta,
      reactivoId: pregunta.reactivoId,
      respuesta
    }, { headers }).subscribe({
      next: () => this.guardandoEstado.set('guardado'),
      error: () => {
        this.guardandoEstado.set('error');
        this.error.set('No se pudo guardar la última respuesta en la red.');
      }
    });
  }

  saltarAPregunta(pNum: number): void {
    const el = document.getElementById('pregunta-' + pNum);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  async enviar(confirmar = true): Promise<void> {
    if (this.enviando()) return;

    if (confirmar) {
      const sinResponder: number[] = [];
      const respActuales = this.respuestas();
      for (const s of this.secciones()) {
        for (const p of s.preguntas) {
          if (!respActuales[p.numeroPregunta]) {
            sinResponder.push(p.numeroPregunta);
          }
        }
      }

      let mensaje = '¿Deseas finalizar y enviar el examen? Esta acción no se puede deshacer.';
      if (sinResponder.length > 0) {
        mensaje = `Tienes ${sinResponder.length} pregunta(s) sin responder (Preguntas: ${sinResponder.slice(0, 6).join(', ')}${sinResponder.length > 6 ? '...' : ''}). ¿Estás seguro de enviar la evaluación?`;
      }

      const confirmado = await this.feedback.confirmar(
        mensaje,
        'Finalizar examen',
        sinResponder.length > 0 ? 'warning' : 'info',
        'Finalizar y enviar'
      );
      if (!confirmado) return;
    }

    this.enviando.set(true);
    const headers = new HttpHeaders({ 'X-Examen-Token': this.acceso()?.tokenSesion || this.token });
    this.http.post('/api/examen-virtual/enviar', {}, { headers }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.detener();
        this.vista.set('finalizado');
      },
      error: err => {
        this.enviando.set(false);
        const mensajeError = err?.error?.error || err?.error?.message || 'No se pudo enviar el examen.';
        this.error.set(mensajeError);
        this.feedback.mostrar(mensajeError, 'Error al enviar examen', 'error');
      }
    });
  }

  tiempoRestante(): string {
    const mins = Math.floor(this.segundos / 60).toString().padStart(2, '0');
    const segs = (this.segundos % 60).toString().padStart(2, '0');
    return `${mins}:${segs}`;
  }

  cuentaRegresiva(): string {
    return `${this.segundosInicio}`.padStart(2, '0');
  }

  imagenBase64SinMetadatos(imagen?: string): string {
    return (imagen || '').split('#', 1)[0];
  }

  alturaImagenPregunta(imagen?: string): number {
    const tamano = imagen?.match(/#sea-size=(GRANDE|MEDIANA|PEQUENA|MUY_PEQUENA)$/i)?.[1]?.toUpperCase();
    return tamano === 'GRANDE' ? 58 : tamano === 'MUY_PEQUENA' ? 15 : tamano === 'PEQUENA' ? 24 : 36;
  }

  cerrarAlertaSalida(): void {
    this.mostrarAlertaSalida.set(false);
  }

  cerrarAdvertenciaDocente(): void {
    this.mostrarAdvertenciaDocente.set(false);
  }

  private onVisibilityChange = () => {
    if (this.vista() !== 'examen') return;
    if (document.visibilityState === 'hidden') {
      this.salioDePantalla = true;
      this.notificarSalidaPantalla();
    } else if (document.visibilityState === 'visible' && this.salioDePantalla) {
      this.salioDePantalla = false;
      this.mostrarAlertaSalida.set(true);
    }
  };

  private onWindowBlur = () => {
    if (this.vista() !== 'examen') return;
    this.salioDePantalla = true;
    this.notificarSalidaPantalla();
  };

  private onWindowFocus = () => {
    if (this.vista() !== 'examen') return;
    if (this.salioDePantalla) {
      this.salioDePantalla = false;
      this.mostrarAlertaSalida.set(true);
    }
  };

  private notificarSalidaPantalla(): void {
    if (this.vista() !== 'examen') return;
    const ahora = Date.now();
    if (ahora - this.ultimaSalidaTimestamp < 3000) return;
    this.ultimaSalidaTimestamp = ahora;
    this.contadorSalidasLocal.update(c => c + 1);

    const token = this.acceso()?.tokenSesion || this.token;
    if (!token) return;
    const headers = new HttpHeaders({ 'X-Examen-Token': token });
    this.http.post('/api/examen-virtual/incidencia', {
      tipo: 'SALIDA_PESTANA',
      detalle: 'Cambio de ventana, pestaña o aplicación detectado por el navegador'
    }, { headers }).subscribe({
      error: () => {}
    });
  }

  private iniciarMonitorExamen(): void {
    this.detenerMonitorExamen();
    this.monitorExamen = setInterval(() => this.verificarEstadoExamen(), 5000);
  }

  private detenerMonitorExamen(): void {
    if (this.monitorExamen) {
      clearInterval(this.monitorExamen);
      this.monitorExamen = undefined;
    }
  }

  private verificarEstadoExamen(): void {
    if (this.vista() !== 'examen') return;
    const token = this.acceso()?.tokenSesion || this.token;
    if (!token) return;
    const headers = new HttpHeaders({ 'X-Examen-Token': token });
    this.http.get<AccesoVirtual>('/api/examen-virtual/actual', { headers }).subscribe({
      next: data => {
        if (data.estadoIntento === 'ANULADO') {
          this.detener();
          this.acceso.set(data);
          this.vista.set('anulado');
          return;
        }
        if (['ENVIADO', 'CALIFICADO'].includes(data.estadoIntento)) {
          this.detener();
          this.acceso.set(data);
          this.vista.set('finalizado');
          return;
        }
        if (data.mensajeAdvertencia && data.mensajeAdvertencia !== this.ultimoMensajeDocenteVisto) {
          this.ultimoMensajeDocenteVisto = data.mensajeAdvertencia;
          this.mensajeDocenteActual.set(data.mensajeAdvertencia);
          this.mostrarAdvertenciaDocente.set(true);
        }
      },
      error: () => {}
    });
  }

  private actualizarVista(data: AccesoVirtual): void {
    this.acceso.set(data);

    if (data.estadoIntento === 'ANULADO') {
      this.detener();
      this.vista.set('anulado');
      return;
    }

    if (['ENVIADO', 'CALIFICADO'].includes(data.estadoIntento)) {
      this.detener();
      this.vista.set('finalizado');
      return;
    }

    // Hidratar respuestas guardadas previamente en base de datos o sesión local
    if (data.respuestasGuardadas && Object.keys(data.respuestasGuardadas).length > 0) {
      this.respuestas.set({ ...data.respuestasGuardadas });
    } else {
      try {
        const guardadasSession = sessionStorage.getItem('sea_respuestas_' + data.intentoId);
        if (guardadasSession) {
          this.respuestas.set({ ...JSON.parse(guardadasSession) });
        }
      } catch {}
    }

    if (data.estadoSala === 'EN_CURSO') {
      const restante = this.obtenerCuentaRegresiva(data);
      if (restante > 0 || !data.preguntas?.length) {
        this.vista.set('preinicio');
        if (!this.cuenta) this.iniciarCuentaRegresiva(restante);
        else this.segundosInicio = restante;
        if (!this.polling) this.polling = setInterval(() => this.recargar(), 3000);
        return;
      }
      this.detenerCuentaRegresiva();
      this.detenerPolling();
      this.secciones.set(this.organizarSecciones(data.preguntas || []));
      this.vista.set('examen');
      this.iniciarReloj(data.tiempoRestanteSegundos);
      this.iniciarMonitorExamen();
      return;
    }

    this.detenerCuentaRegresiva();
    this.detenerMonitorExamen();
    this.vista.set('espera');
    if (!this.polling) this.polling = setInterval(() => this.recargar(), 3000);
  }

  private obtenerCuentaRegresiva(data: AccesoVirtual): number {
    if (typeof data.cuentaRegresivaSegundos === 'number') return Math.max(0, data.cuentaRegresivaSegundos);
    if (!data.iniciadaEn) return 0;
    return Math.max(0, Math.ceil((new Date(data.iniciadaEn).getTime() - Date.now()) / 1000));
  }

  private iniciarCuentaRegresiva(segundosIniciales: number): void {
    this.detenerCuentaRegresiva();
    this.segundosInicio = Math.max(0, Math.ceil(segundosIniciales));
    this.cuenta = setInterval(() => {
      this.segundosInicio = Math.max(0, this.segundosInicio - 1);
      if (!this.segundosInicio) this.recargar();
    }, 1000);
  }

  private recargar(): void {
    const headers = new HttpHeaders({ 'X-Examen-Token': this.acceso()?.tokenSesion || this.token });
    this.http.get<AccesoVirtual>('/api/examen-virtual/actual', { headers }).subscribe({
      next: data => this.actualizarVista(data),
      error: err => this.error.set(err?.error?.error || 'Se perdió la conexión con la sala.')
    });
  }

  private iniciarReloj(segundosIniciales?: number): void {
    this.detenerReloj();
    this.segundos = Math.max(0, Math.ceil(segundosIniciales || 0));
    if (!this.segundos) return;
    this.reloj = setInterval(() => {
      this.segundos = Math.max(0, this.segundos - 1);
      if (!this.segundos) this.enviar(false);
    }, 1000);
  }

  private organizarSecciones(preguntas: PreguntaVirtual[]): SeccionVirtual[] {
    const secciones: SeccionVirtual[] = [];
    for (const pregunta of preguntas) {
      const codigo = this.codigoSeccion(pregunta.tipoReactivo);
      let seccion = secciones[secciones.length - 1];
      if (!seccion || seccion.codigo !== codigo) {
        const meta = this.metaSeccion(codigo);
        seccion = { codigo, titulo: meta.titulo, instrucciones: meta.instrucciones, preguntas: [] };
        secciones.push(seccion);
      }
      if (pregunta.tipoReactivo === 'EMPAREJAMIENTO_TRONCO') {
        const titulo = 'Relacione el concepto con su definición correcta:';
        seccion.contexto = {
          titulo,
          enunciado: this.enunciadoContexto(pregunta.enunciado, titulo),
          opciones: pregunta.opciones || []
        };
      } else if (pregunta.tipoReactivo === 'CASO_CLINICO_TRONCO') {
        seccion.contexto = {
          titulo: 'Caso clínico o problema:',
          enunciado: pregunta.enunciado || 'Resuelva el caso planteado y responda cada pregunta del grupo.',
          opciones: []
        };
      } else {
        if (codigo === 'SUBITEM_CASO' && !seccion.contexto) {
          seccion.contexto = {
            titulo: 'Caso clínico o problema:',
            enunciado: 'Resuelva el caso planteado y responda cada pregunta del grupo.',
            opciones: []
          };
        }
        if (codigo === 'OPCION_EMPAREJAMIENTO' && !seccion.contexto) {
          seccion.contexto = {
            titulo: 'Relacione el concepto con su definición correcta:',
            enunciado: '',
            opciones: ['A', 'B', 'C', 'D', 'E'].map(letra => ({ letra, texto: '...' }))
          };
        }
        if (codigo === 'OPCION_EMPAREJAMIENTO') {
          pregunta.opcionesRespuesta = seccion.contexto?.opciones || [];
        }
        seccion.preguntas.push(pregunta);
      }
    }
    return secciones;
  }

  private codigoSeccion(tipo: string): string {
    return ['EMPAREJAMIENTO_TRONCO', 'OPCION_EMPAREJAMIENTO'].includes(tipo)
      ? 'OPCION_EMPAREJAMIENTO'
      : ['CASO_CLINICO_TRONCO', 'SUBITEM_CASO'].includes(tipo)
      ? 'SUBITEM_CASO'
      : tipo;
  }

  opcionesParaResponder(pregunta: PreguntaVirtual): OpcionVirtual[] {
    if (pregunta.tipoReactivo === 'VERDADERO_O_FALSO_COMPLEJAS') {
      return [
        { letra: 'A', texto: '1, 2 y 3 son verdaderas.' },
        { letra: 'B', texto: '1 y 3 son verdaderas.' },
        { letra: 'C', texto: '2 y 4 son verdaderas.' },
        { letra: 'D', texto: 'Solo 4 es verdadera.' },
        { letra: 'E', texto: 'Todas son verdaderas.' }
      ];
    }
    return pregunta.opcionesRespuesta?.length ? pregunta.opcionesRespuesta : pregunta.opciones;
  }

  esGrupoCompacto(pregunta: PreguntaVirtual): boolean {
    return ['VERDADERO_O_FALSO_COMPLEJAS', 'OPCION_EMPAREJAMIENTO'].includes(pregunta.tipoReactivo);
  }

  claseOpciones(pregunta: PreguntaVirtual): string {
    return this.esGrupoCompacto(pregunta) ? 'grid-cols-5' : 'grid-cols-1 sm:grid-cols-2';
  }

  private enunciadoContexto(enunciado: string, titulo: string): string {
    return this.normalizarTexto(enunciado) === this.normalizarTexto(titulo) ? '' : enunciado;
  }

  private normalizarTexto(texto: string): string {
    return (texto || '').replace(/[:\s]+$/g, '').trim().toLowerCase();
  }

  private metaSeccion(codigo: string): { titulo: string; instrucciones: string[] } {
    const metas: Record<string, { titulo: string; instrucciones: string[] }> = {
      SELECCION_MEJOR_RESPUESTA: {
        titulo: 'Selección de la mejor respuesta',
        instrucciones: ['INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.']
      },
      VERDADERO_O_FALSO_SIMPLE: {
        titulo: 'Verdadero o falso simple',
        instrucciones: ['INSTRUCCIONES: Marque la respuesta correcta.']
      },
      RESPUESTA_PREMISAS_ABCD: {
        titulo: 'Respuesta A / B / Ambas / Ninguna',
        instrucciones: [
          'INSTRUCCIONES: Las siguientes preguntas están compuestas por dos premisas.',
          'Responda con:',
          'A: Si solo la primera premisa es verdadera.',
          'B: Si solo la segunda premisa es verdadera.',
          'C: Si ambas premisas son verdaderas.',
          'D: Si ninguna premisa es verdadera.'
        ]
      },
      VERDADERO_O_FALSO_COMPLEJAS: {
        titulo: 'Verdadero o falso complejas',
        instrucciones: [
          'INSTRUCCIONES: Seleccione la opción correcta de acuerdo con la siguiente clave:',
          'A: 1, 2 y 3 son verdaderas.',
          'B: 1 y 3 son verdaderas.',
          'C: 2 y 4 son verdaderas.',
          'D: Solo 4 es verdadera.',
          'E: Todas son verdaderas.'
        ]
      },
      SUBITEM_CASO: {
        titulo: 'Ítems agrupados por caso clínico o problema',
        instrucciones: [
          'INSTRUCCIONES: El siguiente caso clínico o problema tendrá varias preguntas.',
          'Seleccione la respuesta correcta en cada una.'
        ]
      },
      OPCION_EMPAREJAMIENTO: {
        titulo: 'Emparejamiento ampliado',
        instrucciones: [
          'INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta para cada enunciado.'
        ]
      }
    };
    return metas[codigo] || { titulo: 'Preguntas del examen', instrucciones: [] };
  }

  private detenerPolling(): void {
    if (this.polling) {
      clearInterval(this.polling);
      this.polling = undefined;
    }
  }

  private detenerCuentaRegresiva(): void {
    if (this.cuenta) {
      clearInterval(this.cuenta);
      this.cuenta = undefined;
    }
  }

  private detenerReloj(): void {
    if (this.reloj) {
      clearInterval(this.reloj);
      this.reloj = undefined;
    }
  }

  private detener(): void {
    this.detenerPolling();
    this.detenerCuentaRegresiva();
    this.detenerReloj();
    this.detenerMonitorExamen();
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('blur', this.onWindowBlur);
      window.removeEventListener('focus', this.onWindowFocus);
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
    this.detener();
  }
}
