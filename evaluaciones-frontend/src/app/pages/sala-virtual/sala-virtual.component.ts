import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, interval } from 'rxjs';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

interface Participante {
  codigoEstudiante: string;
  nombreEstudiante: string;
  estado: string;
  preguntasRespondidas?: number;
  totalPreguntas?: number;
  porcentajeAvance?: number;
  salidasPantalla?: number;
  advertenciasDocente?: number;
  mensajeAdvertencia?: string;
  ultimaActividadEn?: string;
}
interface Sala { id: string; rolExamenId: string; codigoSala: string; tokenGrupo?: string; estado: string; duracionMinutos: number; participantes: Participante[]; }
interface Acceso { codigoEstudiante: string; nombreEstudiante: string; token: string; }
interface Creada { sala: Sala; accesos: Acceso[]; tokenGrupo?: string; }
interface TokenGrupo { codigoSala: string; tokenGrupo: string; }

@Component({
  selector: 'sea-sala-virtual', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <header>
        <p class="text-[10px] font-black uppercase tracking-[.2em] text-primary">Operación virtual</p>
        <h1 class="text-2xl font-black text-foreground">Salas de examen virtual</h1>
        <p class="mt-1 text-sm text-muted-foreground">Monitorea la sala de evaluación asignada a tu grupo e inicia el examen cuando tus estudiantes estén conectados.</p>
      </header>

      @if (!sala()) {
        <div class="space-y-6">
          <!-- MIS EXÁMENES VIRTUALES ASIGNADOS -->
          @if (cargandoMisExamenes()) {
            <div class="rounded-2xl border border-border bg-card p-6 text-center text-xs font-bold text-muted-foreground">
              <i class="pi pi-spin pi-spinner text-xl text-primary"></i>
              <p class="mt-2">Consultando tus evaluaciones virtuales programadas...</p>
            </div>
          } @else if (misExamenesVirtuales().length > 0) {
            <section class="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/30 p-6 shadow-xs">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                <div>
                  <h2 class="text-base font-black text-indigo-950 flex items-center gap-2">
                    <i class="pi pi-desktop text-indigo-700"></i>
                    <span>Mis Exámenes Virtuales Asignados</span>
                  </h2>
                  <p class="text-xs text-indigo-800/80 mt-0.5">Selecciona tu evaluación para ingresar a su sala de monitoreo e iniciar el examen cuando tus estudiantes estén listos.</p>
                </div>
                <span class="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-bold">
                  {{ misExamenesVirtuales().length }} {{ misExamenesVirtuales().length === 1 ? 'examen virtual' : 'exámenes virtuales' }}
                </span>
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                @for (item of misExamenesVirtuales(); track item.id) {
                  <div class="rounded-xl border border-indigo-100 bg-white p-4 shadow-2xs hover:shadow-xs transition space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between gap-1">
                        <span class="text-[9px] font-black uppercase bg-indigo-700 text-white px-2 py-0.5 rounded">
                          {{ item.tipoParcial }}
                        </span>
                        <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border"
                              [ngClass]="{
                                'bg-emerald-50 text-emerald-700 border-emerald-200': item.estadoFlujo === 'GENERADO' || item.estadoFlujo === 'CALIFICADO',
                                'bg-blue-50 text-blue-700 border-blue-200': item.estadoFlujo === 'VALIDADO',
                                'bg-amber-50 text-amber-800 border-amber-200': item.estadoFlujo === 'PROGRAMADO'
                              }">
                          {{ item.estadoFlujo }}
                        </span>
                      </div>
                      <h3 class="font-black text-xs text-foreground mt-2 leading-tight">
                        [{{ item.materiaCodigo }}] {{ item.materiaNombre }}
                      </h3>
                      <p class="text-[10.5px] text-muted-foreground mt-0.5">
                        Grupo {{ item.grupo }} · {{ item.carreraNombre }}
                      </p>
                      <div class="flex items-center gap-3 font-mono text-[9.5px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border/50">
                        <span><i class="pi pi-calendar text-[9px] text-primary"></i> {{ item.fechaDisplay }}</span>
                        <span><i class="pi pi-clock text-[9px] text-primary"></i> {{ item.horario }}</span>
                      </div>
                    </div>

                    @if (item.estadoFlujo === 'GENERADO' || item.estadoFlujo === 'CALIFICADO') {
                      <button 
                        (click)="seleccionarExamenVirtual(item)" 
                        [disabled]="cargando()"
                        class="w-full mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 px-3 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50">
                        <i class="pi pi-sign-in text-xs"></i>
                        <span>Ingresar a Sala de Monitoreo</span>
                      </button>
                    } @else {
                      <div class="mt-2 rounded-xl border border-amber-200 bg-amber-50/80 p-2 text-center text-[10.5px] font-semibold text-amber-800 flex items-center justify-center gap-1.5">
                        <i class="pi pi-clock text-[10px]"></i>
                        <span>Sala pendiente de preparación por Evaluaciones</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          } @else {
            <div class="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <i class="pi pi-desktop text-4xl text-muted-foreground/40"></i>
              <h3 class="mt-3 text-sm font-black text-foreground">No tienes exámenes virtuales asignados</h3>
              <p class="mt-1 text-xs text-muted-foreground max-w-md mx-auto">Cuando el Departamento de Evaluaciones programe y prepare los exámenes virtuales para tus materias y grupos, aparecerán aquí para su monitoreo en vivo.</p>
            </div>
          }
        </div>
      }

      @if (sala(); as actual) {
        <section class="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <button (click)="salirDeSala()" class="rounded-lg border border-border bg-muted/50 hover:bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition flex items-center gap-1 cursor-pointer">
                  <i class="pi pi-arrow-left text-[10px]"></i>
                  <span>Volver a mis exámenes</span>
                </button>
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sala {{ actual.codigoSala }}</p>
              @if (examenSeleccionado(); as ex) {
                <h2 class="text-xl font-black text-foreground">[{{ ex.materiaCodigo }}] {{ ex.materiaNombre }}</h2>
                <p class="text-xs text-muted-foreground font-semibold mt-0.5">Grupo {{ ex.grupo }} · {{ ex.carreraNombre }} · {{ ex.tipoParcial }}</p>
              } @else {
                <h2 class="text-xl font-black text-foreground">{{ actual.rolExamenId }}</h2>
              }
              <div class="mt-2 flex items-center gap-2">
                <span class="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase text-indigo-700 border border-indigo-200">{{ actual.estado }}</span>
                <span class="text-[10.5px] text-muted-foreground font-medium"><i class="pi pi-clock text-[10px] text-primary"></i> Duración: {{ actual.duracionMinutos }} min</span>
              </div>
            </div>
            <div class="flex flex-wrap justify-end gap-2">
              @if (actual.estado === 'PREPARADA' || actual.estado === 'ABIERTA') { 
                <button (click)="iniciar()" [disabled]="cargando()" class="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-black text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50">
                  <i class="pi pi-play text-xs"></i>
                  <span>Iniciar examen</span>
                </button>
              }
              @if (actual.estado === 'EN_CURSO') { 
                <button (click)="cerrar()" [disabled]="cargando()" class="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-black text-white transition cursor-pointer flex items-center gap-1 disabled:opacity-50">
                  <i class="pi pi-stop-circle text-xs"></i>
                  <span>Finalizar / Cerrar sala</span>
                </button> 
              }
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div class="rounded-xl bg-muted/50 p-4 border border-border">
              <span class="text-[10px] font-black uppercase text-muted-foreground">Total inscritos</span>
              <b class="mt-1 block text-2xl font-black text-foreground">{{ actual.participantes.length }}</b>
            </div>
            <div class="rounded-xl bg-amber-500/10 p-4 border border-amber-500/20">
              <span class="text-[10px] font-black uppercase text-amber-700">Conectados (espera)</span>
              <b class="mt-1 block text-2xl font-black text-amber-700">{{ contar('EN_ESPERA') }}</b>
            </div>
            <div class="rounded-xl bg-slate-500/10 p-4 border border-slate-500/20">
              <span class="text-[10px] font-black uppercase text-slate-600">Faltan por ingresar</span>
              <b class="mt-1 block text-2xl font-black text-slate-700">{{ contar('PENDIENTE') }}</b>
            </div>
            <div class="rounded-xl bg-indigo-500/10 p-4 border border-indigo-500/20">
              <span class="text-[10px] font-black uppercase text-indigo-700">Rindiendo en curso</span>
              <b class="mt-1 block text-2xl font-black text-indigo-700">{{ contar('EN_CURSO') }}</b>
            </div>
            <div class="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
              <span class="text-[10px] font-black uppercase text-emerald-700">Entregados</span>
              <b class="mt-1 block text-2xl font-black text-emerald-700">{{ contarEntregados() }}</b>
            </div>
            <div class="rounded-xl bg-rose-500/10 p-4 border border-rose-500/20">
              <span class="text-[10px] font-black uppercase text-rose-700 flex items-center gap-1">
                <i class="pi pi-exclamation-triangle"></i> Con alertas
              </span>
              <b class="mt-1 block text-2xl font-black text-rose-700">{{ contarConAlertas() }}</b>
            </div>
          </div>
        </section>

        @if (tokenGrupo()) {
          <section class="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 p-6 sm:p-7 shadow-lg shadow-indigo-100/50">
            <div class="border-b border-indigo-100 pb-4">
              <span class="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">Acceso Grupal</span>
              <h2 class="mt-2 text-lg font-black text-indigo-950">Datos de Ingreso para Proyectar en el Aula</h2>
              <p class="mt-1 max-w-2xl text-xs text-indigo-800/80">Proyecta estos datos en la pizarra o comparte el enlace directo. Cada estudiante ingresará con este PIN y su propio código de estudiante.</p>
            </div>

            <!-- PROJECTION CARDS: SALA & PIN -->
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl border border-indigo-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">1. Código de Sala</span>
                  <div class="mt-1 font-mono text-3xl sm:text-4xl font-black text-indigo-900 tracking-wider select-all">{{ actual.codigoSala }}</div>
                </div>
                <p class="mt-2 text-[11px] text-slate-500">Identificador único de la sala de evaluación generado por Evaluaciones.</p>
              </div>

              <div class="rounded-2xl border border-indigo-300 bg-indigo-600 text-white p-5 shadow-md flex flex-col justify-between">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span class="text-[10px] font-black uppercase tracking-wider text-indigo-200">2. PIN de Acceso (6 dígitos)</span>
                    <div class="mt-1 font-mono text-3xl sm:text-4xl font-black tracking-widest select-all">{{ tokenGrupo() }}</div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <button (click)="copiarDatosCompletosEstudiante()" class="rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 px-3.5 py-2 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs" title="Copiar mensaje con sala, link institucional y token para enviar a los estudiantes">
                      <i class="pi pi-copy text-xs"></i>
                      <span>Copiar datos para estudiantes</span>
                    </button>
                    <button (click)="copiarTokenGrupo()" class="rounded-xl bg-white/20 hover:bg-white/30 text-white px-3 py-2 text-xs font-bold transition flex items-center gap-1 cursor-pointer" title="Copiar únicamente el PIN de 6 dígitos">
                      <i class="pi pi-key text-xs"></i>
                      <span>Solo PIN</span>
                    </button>
                  </div>
                </div>
                <p class="mt-2 text-[11px] text-indigo-100">Fácil de escribir en celular o computadora.</p>
              </div>
            </div>

            <!-- DIRECT URL & QR BUTTON -->
            <div class="mt-5 rounded-2xl bg-white border border-indigo-100 p-4 flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <span class="block text-[10px] font-black uppercase tracking-wider text-slate-400">Enlace directo con PIN incluido</span>
                <span class="font-mono text-xs font-bold text-indigo-900 truncate block mt-0.5 select-all">{{ urlAccesoConParams() }}</span>
              </div>
              <div class="flex items-center gap-2">
                <button (click)="copiarEnlaceDirecto()" class="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                  <i class="pi pi-link text-xs"></i>
                  <span>Copiar enlace directo</span>
                </button>
              </div>
            </div>
          </section>
        }
        
        <!-- SECCIÓN DE SEGUIMIENTO EN VIVO Y CONTROL DOCENTE -->
        <section class="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 class="font-black text-foreground">Monitoreo y Seguimiento en Vivo</h2>
              <p class="text-xs text-muted-foreground">Progreso de preguntas, detección antifraude y control docente por estudiante.</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none"></i>
                <input [(ngModel)]="busquedaEstudiante" placeholder="Filtrar estudiante o código..." class="rounded-xl border border-border bg-muted/40 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary">
              </div>
              <span class="text-xs text-muted-foreground font-semibold">{{ participantesFiltrados().length }} de {{ actual.participantes.length }}</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th class="p-2.5">Código</th>
                  <th class="p-2.5">Estudiante</th>
                  <th class="p-2.5 text-center">Estado</th>
                  <th class="p-2.5 text-center min-w-[140px]">Avance de Respuestas</th>
                  <th class="p-2.5 text-center min-w-[120px]">Supervisión Antifraude</th>
                  <th class="p-2.5 text-right min-w-[160px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (participante of participantesFiltrados(); track participante.codigoEstudiante) { 
                  <tr class="border-b border-border/60 hover:bg-muted/30 transition">
                    <td class="p-2.5 font-mono font-bold text-foreground">{{ participante.codigoEstudiante }}</td>
                    <td class="p-2.5 font-medium text-foreground">
                      <div>{{ participante.nombreEstudiante }}</div>
                      @if (participante.mensajeAdvertencia) {
                        <span class="inline-block text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-0.5 border border-amber-200">
                          Último aviso: {{ participante.mensajeAdvertencia }}
                        </span>
                      }
                    </td>
                    <td class="p-2.5 text-center">
                      <span class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase border"
                            [ngClass]="{
                              'bg-amber-50 text-amber-800 border-amber-200': participante.estado === 'EN_ESPERA',
                              'bg-slate-100 text-slate-700 border-slate-200': participante.estado === 'PENDIENTE',
                              'bg-indigo-50 text-indigo-700 border-indigo-200': participante.estado === 'EN_CURSO',
                              'bg-emerald-50 text-emerald-700 border-emerald-200': ['CALIFICADO', 'ENVIADO'].includes(participante.estado),
                              'bg-rose-50 text-rose-700 border-rose-200': participante.estado === 'ANULADO',
                              'bg-muted text-muted-foreground border-border': !['EN_ESPERA', 'PENDIENTE', 'EN_CURSO', 'CALIFICADO', 'ENVIADO', 'ANULADO'].includes(participante.estado)
                            }">
                        {{ participante.estado === 'PENDIENTE' ? 'Sin ingresar' : (participante.estado === 'EN_ESPERA' ? 'Conectado' : participante.estado) }}
                      </span>
                    </td>
                    <td class="p-2.5 text-center">
                      <div class="flex flex-col items-center gap-1">
                        <div class="flex items-center justify-between w-full max-w-[130px] text-[10.5px] font-bold">
                          <span>{{ participante.preguntasRespondidas || 0 }}/{{ participante.totalPreguntas || 0 }}</span>
                          <span class="font-mono text-muted-foreground">{{ participante.porcentajeAvance || 0 }}%</span>
                        </div>
                        <div class="h-1.5 w-full max-w-[130px] bg-muted rounded-full overflow-hidden">
                          <div class="h-full bg-indigo-600 rounded-full transition-all duration-300"
                               [style.width.%]="participante.porcentajeAvance || 0"></div>
                        </div>
                      </div>
                    </td>
                    <td class="p-2.5 text-center">
                      <div class="flex flex-col items-center gap-1">
                        @if ((participante.salidasPantalla || 0) > 0) {
                          <span class="inline-flex items-center gap-1 text-[10.5px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <i class="pi pi-exclamation-triangle text-[10px]"></i>
                            {{ participante.salidasPantalla }} salida{{ participante.salidasPantalla === 1 ? '' : 's' }}
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <i class="pi pi-check text-[9px]"></i> Sin salidas
                          </span>
                        }
                        @if ((participante.advertenciasDocente || 0) > 0) {
                          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <i class="pi pi-bell text-[9px]"></i> {{ participante.advertenciasDocente }} adv.
                          </span>
                        }
                      </div>
                    </td>
                    <td class="p-2.5 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        @if (participante.estado !== 'ANULADO' && !['CALIFICADO', 'ENVIADO'].includes(participante.estado)) {
                          <button (click)="abrirModalAdvertir(participante)"
                                  [disabled]="procesandoEstudiante() === participante.codigoEstudiante"
                                  title="Enviar advertencia en vivo al estudiante"
                                  class="rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                            <i class="pi pi-bell text-[10px]"></i>
                            <span>Advertir</span>
                          </button>
                          <button (click)="abrirModalAnular(participante)"
                                  [disabled]="procesandoEstudiante() === participante.codigoEstudiante"
                                  title="Anular intento del estudiante"
                                  class="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                            <i class="pi pi-ban text-[10px]"></i>
                            <span>Anular</span>
                          </button>
                        } @else if (participante.estado === 'ANULADO') {
                          <button (click)="restaurarEstudiante(participante)"
                                  [disabled]="procesandoEstudiante() === participante.codigoEstudiante"
                                  title="Restaurar intento anulado para que continúe rindiendo"
                                  class="rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                            <i class="pi pi-refresh text-[10px]"></i>
                            <span>Restaurar</span>
                          </button>
                        } @else {
                          <span class="text-[10px] text-muted-foreground font-semibold">Finalizado</span>
                        }
                      </div>
                    </td>
                  </tr> 
                } @empty {
                  <tr>
                    <td colspan="6" class="p-6 text-center text-muted-foreground">
                      No se encontraron estudiantes para la búsqueda actual.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }



      <!-- MODAL ADVERTIR ESTUDIANTE -->
      @if (estudianteParaAdvertir(); as est) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div class="w-full max-w-md overflow-hidden rounded-2xl border border-amber-200 bg-card shadow-2xl">
            <div class="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-amber-700">Llamada de atención</p>
                <h2 class="text-lg font-black text-foreground">Advertir a {{ est.nombreEstudiante }}</h2>
                <p class="text-xs text-muted-foreground font-mono">Código: {{ est.codigoEstudiante }}</p>
              </div>
              <button (click)="cerrarModalAdvertir()" class="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div class="space-y-4 p-5 text-xs">
              <p class="text-muted-foreground">
                El estudiante verá este mensaje en una ventana emergente en su pantalla de forma inmediata:
              </p>
              <div class="flex flex-wrap gap-1.5">
                <button type="button" (click)="mensajeAdvertir = 'Se detectó cambio de ventana. Permanece en el examen.'" class="text-[10.5px] bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-lg border border-border">
                  Cambio de ventana
                </button>
                <button type="button" (click)="mensajeAdvertir = 'Advertencia disciplinaria: no uses aplicaciones secundarias.'" class="text-[10.5px] bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-lg border border-border">
                  Uso secundario
                </button>
                <button type="button" (click)="mensajeAdvertir = 'Tu actividad está siendo monitoreada por el docente.'" class="text-[10.5px] bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-lg border border-border">
                  Monitoreo activo
                </button>
              </div>
              <label class="block">
                <span class="font-black text-foreground">Mensaje personalizado:</span>
                <textarea [(ngModel)]="mensajeAdvertir" rows="3" placeholder="Escribe el mensaje de advertencia..." class="mt-2 w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs outline-none focus:border-amber-500"></textarea>
              </label>
            </div>
            <div class="flex justify-end gap-2 border-t border-border p-4">
              <button (click)="cerrarModalAdvertir()" class="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground">Cancelar</button>
              <button (click)="enviarAdvertencia()" [disabled]="!mensajeAdvertir.trim() || !!procesandoEstudiante()" class="rounded-xl bg-amber-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50 flex items-center gap-1.5">
                <i class="pi pi-send text-xs"></i>
                <span>Enviar advertencia</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL ANULAR ESTUDIANTE -->
      @if (estudianteParaAnular(); as est) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div class="w-full max-w-md overflow-hidden rounded-2xl border border-rose-200 bg-card shadow-2xl">
            <div class="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-rose-700">Anulación de intento</p>
                <h2 class="text-lg font-black text-foreground">Anular examen de {{ est.nombreEstudiante }}</h2>
                <p class="text-xs text-muted-foreground font-mono">Código: {{ est.codigoEstudiante }}</p>
              </div>
              <button (click)="cerrarModalAnular()" class="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div class="space-y-4 p-5 text-xs">
              <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 leading-relaxed text-rose-900">
                ⚠️ Al anular el intento, la nota se fijará en 0 y el estudiante será bloqueado de la evaluación. Podrás restaurarlo más tarde si fue una equivocación.
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button type="button" (click)="motivoAnular = 'Abandono reiterado de pestaña o aplicación.'" class="text-[10.5px] bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-lg border border-border">
                  Abandono de pestaña
                </button>
                <button type="button" (click)="motivoAnular = 'Conducta sospechosa o intento de copia.'" class="text-[10.5px] bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-lg border border-border">
                  Conducta sospechosa
                </button>
              </div>
              <label class="block">
                <span class="font-black text-foreground">Motivo de anulación:</span>
                <textarea [(ngModel)]="motivoAnular" rows="3" placeholder="Ingresa la razón para el registro..." class="mt-2 w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs outline-none focus:border-rose-500"></textarea>
              </label>
            </div>
            <div class="flex justify-end gap-2 border-t border-border p-4">
              <button (click)="cerrarModalAnular()" class="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground">Cancelar</button>
              <button (click)="confirmarAnulacion()" [disabled]="!motivoAnular.trim() || !!procesandoEstudiante()" class="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50 flex items-center gap-1.5">
                <i class="pi pi-ban text-xs"></i>
                <span>Confirmar anulación</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>`
})
export class SalaVirtualComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly feedback = inject(UiFeedbackService);
  private readonly route = inject(ActivatedRoute);

  sala = signal<Sala | null>(null);
  accesos = signal<Acceso[]>([]);
  tokenGrupo = signal('');
  cargando = signal(false);
  error = signal('');
  private monitoreo?: Subscription;
  examenSeleccionado = signal<any | null>(null);

  misExamenesVirtuales = signal<any[]>([]);
  cargandoMisExamenes = signal(false);

  busquedaEstudiante = '';
  estudianteParaAdvertir = signal<Participante | null>(null);
  mensajeAdvertir = '';
  estudianteParaAnular = signal<Participante | null>(null);
  motivoAnular = '';
  procesandoEstudiante = signal<string | null>(null);

  ngOnInit(): void {
    const qSala = this.route.snapshot.queryParams['salaId'];
    const qRol = this.route.snapshot.queryParams['rolId'];

    if (qSala) {
      this.cargarPorCodigoSala(qSala);
    } else if (qRol) {
      this.seleccionarExamenVirtual({ id: qRol });
    }

    this.cargarMisExamenesVirtuales();
  }

  cargarMisExamenesVirtuales(): void {
    this.cargandoMisExamenes.set(true);
    this.http.get<any[]>('/api/roles-examen').subscribe({
      next: data => {
        this.cargandoMisExamenes.set(false);
        const virtuales = (data || []).filter(item => item.modalidad === 'VIRTUAL');
        this.misExamenesVirtuales.set(virtuales);
      },
      error: () => {
        this.cargandoMisExamenes.set(false);
        this.misExamenesVirtuales.set([]);
      }
    });
  }

  seleccionarExamenVirtual(item: any): void {
    if (!item?.id) return;
    this.examenSeleccionado.set(item);
    this.cargando.set(true);
    this.error.set('');
    this.http.get<Sala>(`/api/examenes-virtuales/roles/${encodeURIComponent(item.id)}/sala`).subscribe({
      next: salaExistente => {
        this.cargando.set(false);
        this.sala.set(salaExistente);
        this.accesos.set([]);
        const tokenOficial = salaExistente.tokenGrupo || this._recuperarToken(salaExistente.id) || '';
        this.tokenGrupo.set(tokenOficial);
        if (tokenOficial) {
          this._guardarToken(salaExistente.id, tokenOficial);
        }
        this.iniciarMonitoreo();
      },
      error: () => {
        this.cargando.set(false);
        this.feedback.mostrar(
          'La sala para esta materia aún no ha sido generada o preparada por el Departamento de Evaluaciones.',
          'Sala no disponible',
          'warning'
        );
      }
    });
  }

  cargarPorCodigoSala(codigo: string): void {
    if (!codigo?.trim()) return;
    this.ejecutar(this.http.get<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(codigo.trim())}`), data => {
      this.sala.set(data);
      this.accesos.set([]);
      const tokenOficial = data.tokenGrupo || this._recuperarToken(data.id) || '';
      this.tokenGrupo.set(tokenOficial);
      if (tokenOficial) {
        this._guardarToken(data.id, tokenOficial);
      }
      this.iniciarMonitoreo();
    });
  }

  salirDeSala(): void {
    this.detenerMonitoreo();
    this.sala.set(null);
    this.examenSeleccionado.set(null);
    this.accesos.set([]);
    this.tokenGrupo.set('');
    this.cargarMisExamenesVirtuales();
  }

  urlAcceso(): string { return `${window.location.origin}/examen-virtual`; }

  private _guardarToken(salaId: string, token: string): void {
    try { sessionStorage.setItem(`sea_token_sala_${salaId}`, token); } catch (_) {}
  }

  private _recuperarToken(salaId: string): string | null {
    try { return sessionStorage.getItem(`sea_token_sala_${salaId}`); } catch (_) { return null; }
  }

  copiarTokenGrupo(): void {
    if (navigator.clipboard && this.tokenGrupo()) {
      navigator.clipboard.writeText(this.tokenGrupo());
      this.feedback.mostrar('PIN copiado al portapapeles', 'Copiado', 'success');
    }
  }

  copiarDatosCompletosEstudiante(): void {
    const sala = this.sala();
    const pin = this.tokenGrupo();
    const codigoSala = sala?.codigoSala || '';
    const linkExamen = 'https://planificacion.unitepc.edu.bo/examen-virtual';

    const lineas = [
      '📋 *EVALUACIÓN VIRTUAL · UNITEPC*',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      sala?.duracionMinutos ? `⏱️ *Duración:* ${sala.duracionMinutos} minutos` : null,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '🌐 *ENLACE DE ACCESO:*',
      linkExamen,
      '',
      '🔑 *DATOS PARA INGRESAR:*',
      `• *Código de Sala:* ${codigoSala}`,
      `• *PIN / Token:* ${pin}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'ℹ️ *Instrucciones para el estudiante:*',
      `1. Ingresa al enlace: ${linkExamen}`,
      '2. Introduce tu Código de Estudiante (matrícula institucional).',
      `3. Introduce el Código de Sala (${codigoSala}) y el PIN (${pin}).`,
      '4. Presiona "Ingresar" y espera en la sala de espera hasta que el docente inicie la evaluación.'
    ].filter(Boolean).join('\n');

    if (navigator.clipboard && lineas) {
      navigator.clipboard.writeText(lineas);
      this.feedback.mostrar('Información de acceso para estudiantes copiada al portapapeles', 'Copiado', 'success');
    }
  }

  urlAccesoConParams(): string {
    const sala = this.sala()?.codigoSala || '';
    const pin = this.tokenGrupo() || '';
    const host = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? window.location.origin
      : 'https://planificacion.unitepc.edu.bo';
    return `${host}/examen-virtual?sala=${encodeURIComponent(sala)}&pin=${encodeURIComponent(pin)}`;
  }

  copiarEnlaceDirecto(): void {
    const url = this.urlAccesoConParams();
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      this.feedback.mostrar('Enlace directo copiado al portapapeles', 'Copiado', 'success');
    }
  }
  iniciar(): void { this.cambiarEstado('iniciar'); }
  cerrar(): void { this.cambiarEstado('cerrar'); }
  contar(estado: string): number { return this.sala()?.participantes.filter(p => p.estado === estado).length || 0; }
  contarEntregados(): number {
    return (this.sala()?.participantes || []).filter(p => ['CALIFICADO', 'ENVIADO'].includes(p.estado)).length;
  }
  contarConAlertas(): number {
    return (this.sala()?.participantes || []).filter(p => (p.salidasPantalla || 0) > 0 || (p.advertenciasDocente || 0) > 0).length;
  }
  participantesFiltrados(): Participante[] {
    const pts = this.sala()?.participantes || [];
    const q = this.busquedaEstudiante.trim().toLowerCase();
    if (!q) return pts;
    return pts.filter(p => {
      const nombre = (p.nombreEstudiante || '').toLowerCase();
      const codigo = (p.codigoEstudiante || '').toLowerCase();
      const estado = (p.estado || '').toLowerCase();
      const estadoAmigable = p.estado === 'PENDIENTE' ? 'sin ingresar pendiente falta' : (p.estado === 'EN_ESPERA' ? 'conectado espera lobby' : estado);
      return nombre.includes(q) || codigo.includes(q) || estado.includes(q) || estadoAmigable.includes(q);
    });
  }

  abrirModalAdvertir(participante: Participante): void {
    this.estudianteParaAdvertir.set(participante);
    this.mensajeAdvertir = 'Se detectó cambio de ventana. Permanece en el examen.';
  }

  cerrarModalAdvertir(): void {
    this.estudianteParaAdvertir.set(null);
    this.mensajeAdvertir = '';
  }

  enviarAdvertencia(): void {
    const est = this.estudianteParaAdvertir();
    const salaId = this.sala()?.id;
    const motivo = this.mensajeAdvertir.trim();
    if (!est || !salaId || !motivo) return;

    this.procesandoEstudiante.set(est.codigoEstudiante);
    this.cerrarModalAdvertir();
    this.http.post<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(salaId)}/estudiantes/${encodeURIComponent(est.codigoEstudiante)}/advertir`, { mensaje: motivo, motivo }).subscribe({
      next: data => {
        this.procesandoEstudiante.set(null);
        if (data && Array.isArray(data.participantes)) {
          this.sala.set(data);
        } else {
          this.actualizarSala();
        }
        this.feedback.mostrar(`Advertencia enviada a ${est.nombreEstudiante}`, 'Aviso enviado', 'success');
      },
      error: err => {
        this.procesandoEstudiante.set(null);
        this.feedback.mostrar(err?.error?.message || err?.error?.error || 'No se pudo enviar la advertencia.', 'Error', 'error');
      }
    });
  }

  abrirModalAnular(participante: Participante): void {
    this.estudianteParaAnular.set(participante);
    this.motivoAnular = 'Abandono reiterado de pestaña o aplicación.';
  }

  cerrarModalAnular(): void {
    this.estudianteParaAnular.set(null);
    this.motivoAnular = '';
  }

  confirmarAnulacion(): void {
    const est = this.estudianteParaAnular();
    const salaId = this.sala()?.id;
    const motivo = this.motivoAnular.trim();
    if (!est || !salaId || !motivo) return;

    this.procesandoEstudiante.set(est.codigoEstudiante);
    this.cerrarModalAnular();
    this.http.post<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(salaId)}/estudiantes/${encodeURIComponent(est.codigoEstudiante)}/anular`, { motivo }).subscribe({
      next: data => {
        this.procesandoEstudiante.set(null);
        if (data && Array.isArray(data.participantes)) {
          this.sala.set(data);
        } else {
          this.actualizarSala();
        }
        this.feedback.mostrar(`Intento de ${est.nombreEstudiante} anulado`, 'Evaluación anulada', 'info');
      },
      error: err => {
        this.procesandoEstudiante.set(null);
        this.feedback.mostrar(err?.error?.message || err?.error?.error || 'No se pudo anular la evaluación.', 'Error', 'error');
      }
    });
  }

  async restaurarEstudiante(participante: Participante): Promise<void> {
    const salaId = this.sala()?.id;
    if (!salaId) return;

    const ok = await this.feedback.confirmar(
      `¿Deseas restaurar el intento de ${participante.nombreEstudiante} (${participante.codigoEstudiante}) para que pueda continuar rindiendo?`,
      'Restaurar evaluación',
      'info',
      'Restaurar intento'
    );
    if (!ok) return;

    this.procesandoEstudiante.set(participante.codigoEstudiante);
    this.http.post<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(salaId)}/estudiantes/${encodeURIComponent(participante.codigoEstudiante)}/restaurar`, {}).subscribe({
      next: data => {
        this.procesandoEstudiante.set(null);
        if (data && Array.isArray(data.participantes)) {
          this.sala.set(data);
        } else {
          this.actualizarSala();
        }
        this.feedback.mostrar(`Intento de ${participante.nombreEstudiante} restaurado`, 'Restaurado con éxito', 'success');
      },
      error: err => {
        this.procesandoEstudiante.set(null);
        this.feedback.mostrar(err?.error?.message || err?.error?.error || 'No se pudo restaurar el intento.', 'Error', 'error');
      }
    });
  }
  private cambiarEstado(accion: string): void { const id = this.sala()?.id; if (!id) return; this.ejecutar(this.http.post<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(id)}/${accion}`, {}), data => { this.sala.set(data); if (accion === 'cerrar') this.detenerMonitoreo(); }); }
  private iniciarMonitoreo(): void { this.detenerMonitoreo(); this.monitoreo = interval(3000).subscribe(() => this.actualizarSala()); }
  private actualizarSala(): void {
    const id = this.sala()?.id;
    if (!id) return;
    this.http.get<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(id)}`).subscribe({
      next: data => {
        this.sala.set(data);
        if (data.tokenGrupo && this.tokenGrupo() !== data.tokenGrupo) {
          this.tokenGrupo.set(data.tokenGrupo);
          this._guardarToken(data.id, data.tokenGrupo);
        }
        if (['CERRADA', 'CALIFICADA', 'ANULADA'].includes(data.estado)) this.detenerMonitoreo();
      }
    });
  }
  private detenerMonitoreo(): void { this.monitoreo?.unsubscribe(); this.monitoreo = undefined; }
  private ejecutar<T>(request: Observable<T>, next: (data: T) => void): void { this.cargando.set(true); this.error.set(''); request.subscribe({ next: data => { this.cargando.set(false); next(data); }, error: err => { this.cargando.set(false); this.error.set(err?.error?.message || err?.error?.error || 'No se pudo completar la operación.'); } }); }
  ngOnDestroy(): void { this.detenerMonitoreo(); }
}
