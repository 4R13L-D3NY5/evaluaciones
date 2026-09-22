import { Component, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VerificacionExamenService, VerificacionExamenLista, VerificacionExamenDetalle, VerificacionExamenFiltros, VerificacionPregunta } from '../../core/services/verificacion-examen.service';
import { GeneracionTypstService } from '../../core/services/generacion-typst.service';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { BranchOffice, Career } from '../../core/models/unitepc-gateway.models';
import { ExamenesAprobadosComponent } from '../examenes-aprobados/examenes-aprobados.component';
import { MathContentDirective } from '../../shared/components/math-content.directive';

@Component({
  selector: 'sea-verificar-examenes',
  standalone: true,
  imports: [CommonModule, FormsModule, ExamenesAprobadosComponent, MathContentDirective],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700"><i class="pi pi-verified text-xl"></i></span>
            <div><h1 class="text-2xl font-black tracking-tight text-foreground">{{ vistaActual === 'sin_banco' ? 'Exámenes programados sin banco' : vistaActual === 'aprobados' ? 'Exámenes aprobados' : 'Verificar exámenes' }}</h1><p class="text-xs text-muted-foreground">{{ vistaActual === 'sin_banco' ? 'Grupos con examen programado que aún no han cargado su banco de preguntas.' : vistaActual === 'aprobados' ? 'Historial de exámenes aprobados por verificación dentro de tu alcance.' : 'Revisión completa de exámenes validados antes de generar el material oficial.' }}</p></div>
          </div>
        </div>
        <button type="button" class="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:border-primary" (click)="actualizarVista()"><i class="pi pi-refresh mr-2"></i>Actualizar</button>
      </div>

      <nav class="flex w-fit gap-1 rounded-xl border border-border bg-muted/40 p-1" role="tablist" aria-label="Vistas de verificación">
        <button type="button" role="tab" [attr.aria-selected]="vistaActual === 'revision'" (click)="cambiarVista('revision')" [class.bg-card]="vistaActual === 'revision'" [class.text-primary]="vistaActual === 'revision'" [class.shadow-xs]="vistaActual === 'revision'" class="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"><i class="pi pi-search mr-2"></i>Por verificar (Validados)@if (examenes().length) { <span class="ml-1 font-black">({{ examenes().length }})</span> }</button>
        <button type="button" role="tab" [attr.aria-selected]="vistaActual === 'aprobados'" (click)="cambiarVista('aprobados')" [class.bg-card]="vistaActual === 'aprobados'" [class.text-primary]="vistaActual === 'aprobados'" [class.shadow-xs]="vistaActual === 'aprobados'" class="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"><i class="pi pi-check-circle mr-2"></i>Verificados (Aprobados)</button>
        <button type="button" role="tab" [attr.aria-selected]="vistaActual === 'sin_banco'" (click)="cambiarVista('sin_banco')" [class.bg-card]="vistaActual === 'sin_banco'" [class.text-amber-800]="vistaActual === 'sin_banco'" [class.shadow-xs]="vistaActual === 'sin_banco'" class="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"><i class="pi pi-exclamation-triangle mr-2 text-amber-500"></i>Sin banco de preguntas@if (examenesSinBanco().length) { <span class="ml-1 font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px]">({{ examenesSinBanco().length }})</span> }</button>
      </nav>

      <div class="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs md:grid-cols-3 lg:grid-cols-4">
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Orden<select [(ngModel)]="orden" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs font-bold"><option value="FECHA_EXAMEN_ASC">Fecha examen ↑</option><option value="FECHA_EXAMEN_DESC">Fecha examen ↓</option><option value="FECHA_SUBIDA_ASC">Fecha subida ↑</option><option value="FECHA_SUBIDA_DESC">Fecha subida ↓</option></select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Sede · SEA<select [(ngModel)]="sedeCodigo" (ngModelChange)="cambiarSede($event)" [disabled]="cargandoSedes" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">{{ cargandoSedes ? 'Cargando sedes...' : 'Todas las sedes de mi alcance' }}</option>@for (sede of sedes; track sede.code) {<option [value]="sede.code">{{ sede.code }} · {{ sede.name }}</option>}</select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Carrera · SEA<select [(ngModel)]="carreraCodigo" (ngModelChange)="cargar()" [disabled]="!sedeCodigo || cargandoCarreras" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">{{ !sedeCodigo ? 'Todas las carreras' : cargandoCarreras ? 'Cargando carreras...' : 'Todas las carreras de la sede' }}</option>@for (carrera of carreras; track carrera.careerCode) {<option [value]="carrera.careerCode">{{ carrera.careerCode }} · {{ carrera.careerName }}</option>}</select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Fecha examen · desde<input type="date" [(ngModel)]="fechaDesde" (ngModelChange)="cambiarRangoFechas()" [max]="fechaHasta || null" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Fecha examen · hasta<input type="date" [(ngModel)]="fechaHasta" (ngModelChange)="cambiarRangoFechas()" [min]="fechaDesde || null" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Parcial<select [(ngModel)]="tipoParcial" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">Todos</option><option>1er Parcial</option><option>2do Parcial</option><option>Examen Final</option><option>2da Instancia</option></select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Modalidad<select [(ngModel)]="modalidad" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">Todas</option><option value="PRESENCIAL_CARTILLA">Con cartilla</option><option value="PRESENCIAL_SIN_CARTILLA">Sin cartilla</option><option value="VIRTUAL">Virtual</option></select></label>
        @if (vistaActual === 'revision') {
          <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Estado
            <select [(ngModel)]="estado" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs font-bold">
              <option value="">Todos (por verificar y observados)</option>
              <option value="PENDIENTE">Validados (por verificar)</option>
              <option value="DEVUELTO">Observados / Devueltos</option>
            </select>
          </label>
        } @else if (vistaActual === 'sin_banco') {
          <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Estado
            <div class="mt-1 flex h-[34px] items-center rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
              <i class="pi pi-clock mr-1.5"></i>Programados (sin banco / doc)
            </div>
          </label>
        }
      </div>

      @if (errorCatalogos) { <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900"><i class="pi pi-exclamation-triangle mr-2"></i>{{ errorCatalogos }}</div> }
      @if (error()) { <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800"><i class="pi pi-exclamation-triangle mr-2"></i>{{ error() }}</div> }

      @if (vistaActual === 'revision') {
      @if (cargando()) { <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground"><i class="pi pi-spin pi-spinner mr-2"></i>Cargando exámenes validados...</div> }
      @else if (!examenes().length) { <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No hay exámenes validados pendientes de verificación en tu alcance.</div> }
      @else {
        <div class="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
          <table class="w-full min-w-[1200px] text-left text-xs">
            <thead class="bg-muted/50 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th class="p-3">Fecha examen</th>
                <th class="p-3">Sede / carrera</th>
                <th class="p-3">Asignatura</th>
                <th class="p-3">Grupo</th>
                <th class="p-3">Docente</th>
                <th class="p-3">Subido</th>
                <th class="p-3">Versión</th>
                <th class="p-3">Modalidad</th>
                <th class="p-3">Estado</th>
                <th class="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (examen of examenes(); track examen.rolExamenId) {
                <tr class="hover:bg-muted/20">
                  <td class="p-3 font-bold">{{ examen.fechaExamen | date:'dd/MM/yyyy' }}<span class="block font-normal text-muted-foreground">{{ examen.horario }}</span></td>
                  <td class="p-3"><strong>{{ examen.sedeCodigo || '—' }}</strong><span class="block text-muted-foreground">{{ examen.sedeNombre || 'Sede no registrada' }}</span><span class="block text-muted-foreground">{{ examen.carreraCodigo }} · {{ examen.carreraNombre }}</span></td>
                  <td class="p-3"><strong>{{ examen.materiaCodigo }}</strong><span class="block max-w-[220px] truncate text-muted-foreground">{{ examen.materiaNombre }}</span></td>
                  <td class="p-3 font-black">{{ examen.grupo }}</td>
                  <td class="p-3">{{ examen.docenteNombre }}</td>
                  <td class="p-3 text-muted-foreground">{{ examen.fechaSubida | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="p-3 font-mono font-bold">{{ examen.version }}</td>
                  <td class="p-3">{{ etiquetaModalidad(examen.modalidad) }}</td>
                  <td class="p-3">
                    <div class="flex flex-col gap-1 items-start">
                      @if (examen.estadoVerificacion === 'DEVUELTO') {
                        <span class="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-[10px] font-black tracking-wide border border-rose-200">
                          <i class="pi pi-exclamation-circle mr-1"></i>DEVUELTO
                        </span>
                      } @else {
                        <span class="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-[10px] font-black tracking-wide border border-purple-200">
                          <i class="pi pi-shield mr-1"></i>{{ examen.estadoVerificacion === 'PENDIENTE' ? 'VALIDADO' : examen.estadoVerificacion }}
                        </span>
                      }
                      @if (examen.tieneHistorialDevoluciones) {
                        <span class="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[9px] font-bold border border-amber-300" title="Reingresado con correcciones tras devolución previa">
                          <i class="pi pi-history mr-1"></i>Corregido
                        </span>
                      }
                    </div>
                  </td>
                  <td class="p-3 text-right">
                    <button type="button" class="rounded-lg px-3 py-2 text-[11px] font-black text-white" [class.bg-rose-700]="examen.estadoVerificacion === 'DEVUELTO'" [class.hover:bg-rose-800]="examen.estadoVerificacion === 'DEVUELTO'" [class.bg-purple-700]="examen.estadoVerificacion !== 'DEVUELTO'" [class.hover:bg-purple-800]="examen.estadoVerificacion !== 'DEVUELTO'" (click)="abrir(examen)">
                      <i class="pi pi-search mr-1"></i>Revisar
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (detalle()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3" (click)="cerrar()">
          <div class="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Revisión de examen</p>
                  @if (detalle()!.estadoVerificacion === 'DEVUELTO') {
                    <span class="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700 border border-rose-200">DEVUELTO / OBSERVADO</span>
                  } @else {
                    <span class="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-800 border border-purple-200">VALIDADO</span>
                  }
                  @if (detalle()!.historialDevoluciones && detalle()!.historialDevoluciones.length > 0) {
                    <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                      <i class="pi pi-history mr-1"></i>Reingresado con correcciones
                    </span>
                  }
                </div>
                <h2 class="text-lg font-black">{{ detalle()!.materiaCodigo }} · {{ detalle()!.materiaNombre }} · {{ detalle()!.grupo }}</h2>
                <p class="text-xs text-muted-foreground">{{ detalle()!.tipoParcial }} · {{ detalle()!.version }} · {{ detalle()!.estadoVerificacion }}</p>
                <p class="text-xs text-muted-foreground">{{ detalle()!.sedeNombre || 'Sede no registrada' }} · {{ detalle()!.carreraNombre }}</p>
              </div>
              <button type="button" class="icon-button" (click)="cerrar()"><i class="pi pi-times"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-5">
              <div class="mb-4 flex flex-wrap items-center gap-2">
                <button type="button" class="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50" [disabled]="procesando()" (click)="previsualizar()"><i class="pi pi-file-pdf mr-2"></i>{{ procesando() ? 'Generando...' : 'Previsualizar examen completo' }}</button>
                <span class="rounded-xl bg-muted px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                  {{ totalRespondibles() }} preguntas evaluables
                  @if (totalTroncos() > 0) {
                    <span class="font-normal">(+ {{ totalTroncos() }} enunciados/casos de contexto)</span>
                  }
                  · incluye clave separada
                </span>
              </div>
              @if (detalle()!.historialDevoluciones && detalle()!.historialDevoluciones.length > 0) {
                <section class="mb-5 rounded-xl border-2 border-amber-300 bg-amber-50/80 p-4 shadow-xs">
                  <div class="mb-2 flex items-center justify-between">
                    <div class="flex items-center gap-2 text-sm font-black text-amber-950">
                      <i class="pi pi-history text-amber-600 text-base"></i>
                      <span>Historial de observaciones y correcciones del docente</span>
                      <span class="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        {{ detalle()!.historialDevoluciones.length }} {{ detalle()!.historialDevoluciones.length === 1 ? 'devolución registrada' : 'devoluciones registradas' }}
                      </span>
                    </div>
                  </div>
                  <p class="mb-4 text-xs text-amber-900 leading-relaxed">
                    Este banco fue reingresado tras haber sido devuelto/observado. Se conserva la comparativa entre la <strong>Versión devuelta</strong> y la <strong>Versión corregida</strong> para cada reactivo observado:
                  </p>
                  <div class="space-y-4">
                    @for (revision of detalle()!.historialDevoluciones; track revision.id) {
                      <div class="rounded-lg border border-amber-200 bg-card p-3 shadow-2xs">
                        <p class="mb-2 text-[11px] font-bold text-muted-foreground">Devuelto {{ revision.fechaDevolucion | date:'dd/MM/yyyy HH:mm' }} · {{ revision.verificadoPor || 'Verificador' }}</p>
                        @if (revision.observacionesGenerales) { <p class="mb-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-950"><strong>Observación general previa:</strong> {{ revision.observacionesGenerales }}</p> }
                        @for (item of revision.preguntasObservadas; track item.numeroPregunta) {
                          <article class="mb-3 last:mb-0 rounded-lg border border-border p-3">
                            <p class="mb-2 text-xs font-black">Pregunta / Reactivo {{ item.numeroPregunta }}</p>
                            <p class="mb-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-800"><strong>Observación:</strong> {{ item.observacion }}</p>
                            <div class="grid gap-3 md:grid-cols-2">
                              <div class="rounded-lg bg-muted/40 p-3">
                                <p class="mb-1 text-[10px] font-extrabold uppercase text-muted-foreground">Versión devuelta</p>
                                @if (item.preguntaEnviada) {
                                  <p [seaMathContent]="item.preguntaEnviada.enunciado" class="whitespace-pre-wrap text-xs"></p>
                                  @if (imagenDataUrl(item.preguntaEnviada.imagenBase64); as imagen) { <img [src]="imagen" alt="Imagen de la pregunta devuelta" class="mt-2 max-h-64 max-w-full rounded-lg border border-border object-contain"> }
                                  @if (item.preguntaEnviada.respuestaCorrecta) { <p class="mt-2 text-[11px] font-bold text-emerald-700">Clave correcta: {{ item.preguntaEnviada.respuestaCorrecta }}</p> }
                                  @if (item.preguntaEnviada.opciones.length) { <div class="mt-2 space-y-1 text-xs text-muted-foreground">@for (opcion of item.preguntaEnviada.opciones; track opcion.letra) { <p [class.font-bold]="esOpcionCorrecta(item.preguntaEnviada, opcion)" [class.text-emerald-700]="esOpcionCorrecta(item.preguntaEnviada, opcion)"><strong>{{ opcion.letra }})</strong> <span [seaMathContent]="opcion.texto"></span></p> }</div> }
                                }
                                @else { <p class="text-xs text-muted-foreground">No se pudo recuperar esta pregunta.</p> }
                              </div>
                              <div class="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
                                <p class="mb-1 text-[10px] font-extrabold uppercase text-emerald-800 font-bold">Versión corregida</p>
                                @if (item.preguntaCorregida) {
                                  <p [seaMathContent]="item.preguntaCorregida.enunciado" class="whitespace-pre-wrap text-xs"></p>
                                  @if (imagenDataUrl(item.preguntaCorregida.imagenBase64); as imagen) { <img [src]="imagen" alt="Imagen de la pregunta corregida" class="mt-2 max-h-64 max-w-full rounded-lg border border-border object-contain"> }
                                  @if (item.preguntaCorregida.respuestaCorrecta) { <p class="mt-2 text-[11px] font-bold text-emerald-700">Clave correcta: {{ item.preguntaCorregida.respuestaCorrecta }}</p> }
                                  @if (item.preguntaCorregida.opciones.length) { <div class="mt-2 space-y-1 text-xs text-muted-foreground">@for (opcion of item.preguntaCorregida.opciones; track opcion.letra) { <p [class.font-bold]="esOpcionCorrecta(item.preguntaCorregida, opcion)" [class.text-emerald-700]="esOpcionCorrecta(item.preguntaCorregida, opcion)"><strong>{{ opcion.letra }})</strong> <span [seaMathContent]="opcion.texto"></span></p> }</div> }
                                }
                                @else { <p class="text-xs text-emerald-900">La pregunta ya no aparece en el banco actual.</p> }
                              </div>
                            </div>
                          </article>
                        }
                      </div>
                    }
                  </div>
                </section>
              }
              @if (detalle()!.observacionesGenerales) { <div class="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"><strong>Observaciones anteriores:</strong> {{ detalle()!.observacionesGenerales }}</div> }
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 p-3">
                <span class="text-xs font-bold text-muted-foreground">Mostrando {{ preguntasParaRevision().length }} registros ({{ totalRespondibles() }} preguntas evaluables)</span>
                @if (tieneObservacionesPrevias()) {
                  <button type="button" class="text-xs font-bold text-primary underline cursor-pointer" (click)="mostrarTodasPreguntas = !mostrarTodasPreguntas">{{ mostrarTodasPreguntas ? 'Enfocar preguntas observadas' : 'Mostrar examen completo' }}</button>
                }
              </div>
              <div class="space-y-4">
                @for (pregunta of preguntasParaRevision(); track pregunta.numeroOriginal) {
                  @if (esTronco(pregunta)) {
                    <!-- ENUNCIADO DE REFERENCIA / CONTEXTO (TRONCO) -->
                    <article class="rounded-2xl border-2 border-indigo-200/80 bg-indigo-50/20 p-4 shadow-xs">
                      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                        <div class="flex items-center gap-2">
                          @if (pregunta.tipoReactivo === 'EMPAREJAMIENTO_TRONCO') {
                            <span class="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-black text-white tracking-wide">
                              <i class="pi pi-link mr-1"></i>EMPAREJAMIENTO AMPLIADO · MATRIZ DE REFERENCIA
                            </span>
                          } @else {
                            <span class="rounded-lg bg-indigo-700 px-2.5 py-1 text-xs font-black text-white tracking-wide">
                              <i class="pi pi-book mr-1"></i>CASO CLÍNICO O PROBLEMA · CONTEXTO
                            </span>
                          }
                          <span class="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                            Enunciado de referencia (No evaluable)
                          </span>
                        </div>
                        <span class="text-[10px] font-semibold text-muted-foreground">Registro #{{ pregunta.numeroOriginal }}</span>
                      </div>

                      <p [seaMathContent]="pregunta.enunciado" class="mt-3 whitespace-pre-wrap text-sm font-medium text-foreground leading-relaxed"></p>

                      @if (imagenDataUrl(pregunta.imagenBase64); as imagen) {
                        <img [src]="imagen" [alt]="'Imagen de referencia #' + pregunta.numeroOriginal" class="mt-3 max-h-80 max-w-full rounded-lg border border-border object-contain">
                      }

                      @if (pregunta.tipoReactivo === 'EMPAREJAMIENTO_TRONCO' && pregunta.opciones.length) {
                        <div class="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                          <p class="text-[10px] font-extrabold uppercase tracking-wider text-blue-950 mb-2">
                            <i class="pi pi-list mr-1"></i>Opciones maestras de referencia (para asociar en las preguntas siguientes):
                          </p>
                          <div class="grid gap-2 sm:grid-cols-2 text-xs">
                            @for (opcion of pregunta.opciones; track opcion.letra) {
                              <div class="flex items-start gap-2 rounded-lg bg-card p-2.5 border border-blue-100 shadow-xs">
                                <span class="rounded bg-blue-100 px-1.5 py-0.5 font-black text-blue-900">{{ opcion.letra }}</span>
                                <span [seaMathContent]="opcion.texto" class="flex-1 text-foreground"></span>
                              </div>
                            }
                          </div>
                        </div>
                      }

                      @if (pregunta.observacion) {
                        <p class="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-800 border border-rose-200">
                          <strong>Observación enviada:</strong> {{ pregunta.observacion }}
                        </p>
                      }
                      <textarea [(ngModel)]="observacionesPreguntas[pregunta.numeroOriginal]" rows="2" placeholder="Observación sobre este enunciado o caso si requiere corrección..." class="mt-3 w-full rounded-lg border border-border bg-card p-2 text-xs"></textarea>
                    </article>
                  } @else {
                    <!-- PREGUNTA RESPONDIBLE EVALUABLE -->
                    <article class="rounded-xl border border-border bg-background p-4 shadow-xs">
                      <div class="flex items-center justify-between gap-3 border-b border-border/50 pb-2">
                        <div class="flex items-center gap-2">
                          <span class="rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-black text-purple-900">
                            Pregunta {{ numeroPreguntaVisible(pregunta) }}
                          </span>
                          <span class="text-xs font-bold text-muted-foreground">
                            · {{ etiquetaTipo(pregunta) }}
                          </span>
                        </div>
                        <div class="flex items-center gap-2">
                          @if (pregunta.dificultad) {
                            <span class="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                              Dificultad {{ pregunta.dificultad }}
                            </span>
                          }
                          <span class="text-[10px] text-muted-foreground">Ref. #{{ pregunta.numeroOriginal }}</span>
                        </div>
                      </div>

                      <p [seaMathContent]="pregunta.enunciado" class="mt-3 whitespace-pre-wrap text-sm font-semibold text-foreground"></p>

                      @if (imagenDataUrl(pregunta.imagenBase64); as imagen) {
                        <img [src]="imagen" [alt]="'Imagen de la pregunta ' + numeroPreguntaVisible(pregunta)" class="mt-3 max-h-80 max-w-full rounded-lg border border-border object-contain">
                      }

                      <!-- PRESENTACIÓN ESPECÍFICA POR TIPOLOGÍA -->
                      @if (pregunta.tipoReactivo === 'VERDADERO_O_FALSO_COMPLEJAS') {
                        <!-- Proposiciones 1, 2, 3, 4 -->
                        <div class="mt-3 rounded-xl border border-border bg-muted/20 p-3">
                          <p class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                            Proposiciones formuladas:
                          </p>
                          <div class="space-y-1.5 text-xs">
                            @for (prop of proposicionesVfComplejas(pregunta); track prop.numero) {
                              <div class="flex items-start gap-2 bg-card p-2 rounded-lg border border-border/60">
                                <span class="font-black text-purple-700 w-5">{{ prop.numero }})</span>
                                <span [seaMathContent]="prop.texto" class="flex-1 font-medium text-foreground"></span>
                              </div>
                            }
                          </div>
                        </div>

                        <!-- Alternativas fijas A-E de decisión -->
                        <div class="mt-3">
                          <p class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Alternativas institucionales y clave de respuesta:
                          </p>
                          <div class="grid gap-1.5 sm:grid-cols-2 text-xs">
                            @for (alt of alternativasVfComplejas; track alt.letra) {
                              <div class="flex items-center justify-between p-2.5 rounded-lg border transition-colors"
                                   [class.bg-emerald-50]="esClaveVfCompleja(pregunta, alt.letra)"
                                   [class.border-emerald-300]="esClaveVfCompleja(pregunta, alt.letra)"
                                   [class.text-emerald-950]="esClaveVfCompleja(pregunta, alt.letra)"
                                   [class.font-bold]="esClaveVfCompleja(pregunta, alt.letra)"
                                   [class.bg-card]="!esClaveVfCompleja(pregunta, alt.letra)"
                                   [class.border-border]="!esClaveVfCompleja(pregunta, alt.letra)">
                                <div>
                                  <span class="rounded bg-muted px-1.5 py-0.5 font-black mr-1" [class.bg-emerald-200]="esClaveVfCompleja(pregunta, alt.letra)">{{ alt.letra }}</span>
                                  <span>{{ alt.texto }}</span>
                                </div>
                                @if (esClaveVfCompleja(pregunta, alt.letra)) {
                                  <span class="flex items-center text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded ml-2">
                                    <i class="pi pi-check mr-1"></i>Clave
                                  </span>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      } @else if (pregunta.tipoReactivo === 'RESPUESTA_PREMISAS_ABCD') {
                        <!-- Alternativas fijas A-D de premisas -->
                        <div class="mt-3">
                          <p class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Alternativas de evaluación y clave correcta:
                          </p>
                          <div class="grid gap-1.5 sm:grid-cols-2 text-xs">
                            @for (opcion of opcionesPremisasAbcd(pregunta); track opcion.letra) {
                              <div class="flex items-center justify-between p-2.5 rounded-lg border transition-colors"
                                   [class.bg-emerald-50]="opcion.correcta"
                                   [class.border-emerald-300]="opcion.correcta"
                                   [class.text-emerald-950]="opcion.correcta"
                                   [class.font-bold]="opcion.correcta"
                                   [class.bg-card]="!opcion.correcta"
                                   [class.border-border]="!opcion.correcta">
                                <div>
                                  <span class="rounded bg-muted px-1.5 py-0.5 font-black mr-1" [class.bg-emerald-200]="opcion.correcta">{{ opcion.letra }}</span>
                                  <span [seaMathContent]="opcion.texto"></span>
                                </div>
                                @if (opcion.correcta) {
                                  <span class="flex items-center text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded ml-2">
                                    <i class="pi pi-check mr-1"></i>Clave
                                  </span>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      } @else if (pregunta.tipoReactivo === 'VERDADERO_O_FALSO') {
                        <!-- V/F Simple: no muestra opciones impresas, solo la clave limpia -->
                        @if (pregunta.respuestaCorrecta) {
                          <div class="mt-3">
                            <span class="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800">
                              <i class="pi pi-check-circle mr-1.5 text-emerald-600"></i>
                              Respuesta correcta: {{ pregunta.respuestaCorrecta === 'A' ? 'A (Verdadero)' : pregunta.respuestaCorrecta === 'B' ? 'B (Falso)' : pregunta.respuestaCorrecta }}
                            </span>
                          </div>
                        }
                      } @else {
                        <!-- Selección simple, subítem de caso, emparejamiento con opciones regulares -->
                        @if (pregunta.respuestaCorrecta) {
                          <div class="mt-3">
                            <span class="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800">
                              <i class="pi pi-check-circle mr-1.5 text-emerald-600"></i>
                              Clave correcta: {{ pregunta.respuestaCorrecta }}
                            </span>
                          </div>
                        }
                        @if (pregunta.opciones.length) {
                          <div class="mt-2 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                            @for (opcion of pregunta.opciones; track opcion.letra) {
                              <div class="flex items-center justify-between p-2 rounded-lg border transition-colors"
                                   [class.border-emerald-300]="esOpcionCorrecta(pregunta, opcion)"
                                   [class.bg-emerald-50]="esOpcionCorrecta(pregunta, opcion)"
                                   [class.text-emerald-950]="esOpcionCorrecta(pregunta, opcion)"
                                   [class.font-bold]="esOpcionCorrecta(pregunta, opcion)"
                                   [class.border-border]="!esOpcionCorrecta(pregunta, opcion)"
                                   [class.bg-card]="!esOpcionCorrecta(pregunta, opcion)">
                                <div>
                                  <strong>{{ opcion.letra }})</strong> <span [seaMathContent]="opcion.texto"></span>
                                </div>
                                @if (esOpcionCorrecta(pregunta, opcion)) {
                                  <i class="pi pi-check text-emerald-700 ml-1" aria-label="Respuesta correcta"></i>
                                }
                              </div>
                            }
                          </div>
                        }
                      }

                      @if (pregunta.observacion) {
                        <p class="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-800 border border-rose-200">
                          <strong>Observación enviada:</strong> {{ pregunta.observacion }}
                        </p>
                      }
                      <textarea [(ngModel)]="observacionesPreguntas[pregunta.numeroOriginal]" rows="2" placeholder="Nueva observación si aún requiere corrección" class="mt-3 w-full rounded-lg border border-border bg-card p-2 text-xs"></textarea>
                    </article>
                  }
                }
              </div>
            </div>
            <div class="border-t border-border bg-muted/20 p-5">
              <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Observación general <textarea [(ngModel)]="observacionGeneral" rows="2" class="mt-1 w-full rounded-lg border border-border bg-card p-2 text-xs" placeholder="Escribe una observación general..."></textarea></label>
              <div class="mt-3 flex flex-wrap justify-end gap-2"><button type="button" class="rounded-xl border border-rose-300 bg-card px-4 py-2 text-xs font-black text-rose-700" [disabled]="guardando()" (click)="decidir('DEVOLVER')">Devolver con observaciones</button><button type="button" class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white" [disabled]="guardando()" (click)="decidir('APROBAR')"><i class="pi pi-check mr-1"></i>Aprobar examen</button></div>
            </div>
          </div>
        </div>
      }
      @if (pdfUrl()) { <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-3" (click)="cerrarPdf()"><div class="h-[94vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-card" (click)="$event.stopPropagation()"><div class="flex items-center justify-between border-b border-border px-4 py-3"><strong class="text-sm">Previsualización completa para verificación</strong><button type="button" class="icon-button" (click)="cerrarPdf()"><i class="pi pi-times"></i></button></div><iframe [src]="pdfUrl()" class="h-[calc(100%-3.5rem)] w-full" title="Previsualización del examen"></iframe></div></div> }
      }
      @if (aprobadosInicializados) {
        <div [hidden]="vistaActual !== 'aprobados'"><sea-examenes-aprobados #panelAprobados [filtros]="filtrosCompartidos" [activo]="vistaActual === 'aprobados'" /></div>
      }

      @if (vistaActual === 'sin_banco') {
        <div class="space-y-4">
          <div class="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
                <i class="pi pi-clock text-lg"></i>
              </span>
              <div>
                <h3 class="text-sm font-black text-amber-950">Monitoreo de grupos sin banco de preguntas</h3>
                <p class="text-xs text-amber-900/90">
                  @if (totalExamenesHoySinBanco() > 0) {
                    <strong class="text-rose-700 font-black">¡Atención!</strong> Hay {{ totalExamenesHoySinBanco() }} grupo(s) con examen programado para <strong>HOY</strong> sin banco cargado.
                  } @else {
                    No hay exámenes programados para hoy sin banco dentro de tu alcance.
                  }
                </p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[10px] font-extrabold uppercase text-amber-950/70 mr-1">Rango rápido:</span>
              <button type="button" (click)="establecerRangoHoy()" [class.bg-amber-600]="esRangoHoy()" [class.text-white]="esRangoHoy()" [class.bg-card]="!esRangoHoy()" class="rounded-lg border border-amber-300 px-2.5 py-1 text-xs font-bold transition hover:border-amber-500 cursor-pointer shadow-2xs">
                Solo hoy
              </button>
              <button type="button" (click)="establecerRangoSemana()" [class.bg-amber-600]="esRangoSemana()" [class.text-white]="esRangoSemana()" [class.bg-card]="!esRangoSemana()" class="rounded-lg border border-amber-300 px-2.5 py-1 text-xs font-bold transition hover:border-amber-500 cursor-pointer shadow-2xs">
                Próximos 7 días
              </button>
              <button type="button" (click)="establecerRangoTodos()" [class.bg-amber-600]="esRangoTodos()" [class.text-white]="esRangoTodos()" [class.bg-card]="!esRangoTodos()" class="rounded-lg border border-amber-300 px-2.5 py-1 text-xs font-bold transition hover:border-amber-500 cursor-pointer shadow-2xs">
                Todo el alcance
              </button>
            </div>
          </div>

          @if (cargandoSinBanco()) {
            <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              <i class="pi pi-spin pi-spinner mr-2"></i>Cargando exámenes programados sin banco...
            </div>
          } @else if (!examenesSinBanco().length) {
            <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              <i class="pi pi-check-circle text-emerald-600 mr-2 text-base"></i>
              Todos los exámenes programados en el rango seleccionado ya cuentan con su banco de preguntas o no hay programaciones pendientes.
            </div>
          } @else {
            <div class="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
              <table class="w-full min-w-[1200px] text-left text-xs">
                <thead class="bg-muted/50 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th class="p-3">Fecha examen</th>
                    <th class="p-3">Sede / Carrera</th>
                    <th class="p-3">Asignatura</th>
                    <th class="p-3">Grupo · Parcial</th>
                    <th class="p-3">Aula / Campus</th>
                    <th class="p-3">Docente titular</th>
                    <th class="p-3">Modalidad</th>
                    <th class="p-3">Estado banco</th>
                    <th class="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  @for (examen of examenesSinBanco(); track examen.rolExamenId) {
                    <tr class="hover:bg-muted/20" [class.bg-rose-50]="esHoy(examen.fechaExamen)">
                      <td class="p-3 font-bold">
                        <div class="flex items-center gap-1.5">
                          <span>{{ examen.fechaExamen | date:'dd/MM/yyyy' }}</span>
                          @if (esHoy(examen.fechaExamen)) {
                            <span class="inline-flex items-center gap-1 rounded-full bg-rose-600 text-white font-black px-2 py-0.5 text-[9px] uppercase tracking-wider shadow-2xs animate-pulse">
                              <i class="pi pi-bell"></i>¡Hoy!
                            </span>
                          } @else if (diasRestantes(examen.fechaExamen) > 0) {
                            <span class="inline-flex items-center rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.2 text-[9px]">
                              En {{ diasRestantes(examen.fechaExamen) }}d
                            </span>
                          } @else {
                            <span class="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-1.5 py-0.2 text-[9px] font-bold">
                              Pasado
                            </span>
                          }
                        </div>
                        <span class="block font-normal text-muted-foreground">{{ examen.horario }}</span>
                      </td>
                      <td class="p-3">
                        <strong>{{ examen.sedeCodigo || '—' }}</strong>
                        <span class="block text-muted-foreground">{{ examen.sedeNombre || 'Sede no registrada' }}</span>
                        <span class="block text-muted-foreground">{{ examen.carreraCodigo }} · {{ examen.carreraNombre }}</span>
                      </td>
                      <td class="p-3">
                        <strong>{{ examen.materiaCodigo }}</strong>
                        <span class="block max-w-[220px] truncate text-muted-foreground">{{ examen.materiaNombre }}</span>
                      </td>
                      <td class="p-3 font-black">
                        {{ examen.grupo }}
                        <span class="block font-normal text-muted-foreground">{{ examen.tipoParcial }}</span>
                      </td>
                      <td class="p-3 text-muted-foreground">
                        <span class="font-bold text-foreground">{{ examen.aula || 'Aula sin asignar' }}</span>
                        <span class="block text-[11px]">{{ examen.campus || 'Campus principal' }}</span>
                      </td>
                      <td class="p-3">
                        <div class="flex items-center gap-1.5">
                          <i class="pi pi-user text-muted-foreground text-xs"></i>
                          <span class="font-bold text-foreground">{{ examen.docenteNombre || 'Docente no asignado' }}</span>
                        </div>
                      </td>
                      <td class="p-3">
                        <span class="rounded-lg border border-border px-2 py-1 text-[11px] font-semibold"
                              [class.bg-blue-50]="examen.modalidad === 'PRESENCIAL_SIN_CARTILLA'"
                              [class.text-blue-800]="examen.modalidad === 'PRESENCIAL_SIN_CARTILLA'"
                              [class.border-blue-200]="examen.modalidad === 'PRESENCIAL_SIN_CARTILLA'"
                              [class.bg-muted]="examen.modalidad !== 'PRESENCIAL_SIN_CARTILLA'">
                          @if (examen.modalidad === 'PRESENCIAL_SIN_CARTILLA') {
                            <i class="pi pi-file mr-1 text-blue-600"></i>Sin Cartilla
                          } @else {
                            {{ etiquetaModalidad(examen.modalidad) }}
                          }
                        </span>
                      </td>
                      <td class="p-3">
                        @if (examen.modalidad === 'PRESENCIAL_SIN_CARTILLA' || examen.estadoVerificacion === 'SIN_DOCUMENTO') {
                          <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 text-[10px] font-black tracking-wide">
                            <i class="pi pi-file"></i>Sin documento cargado
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 text-[10px] font-black tracking-wide">
                            <i class="pi pi-times-circle"></i>Sin banco cargado
                          </span>
                        }
                      </td>
                      <td class="p-3 text-right">
                        <button type="button" class="rounded-lg border border-border bg-card px-3 py-2 text-[11px] font-bold text-foreground hover:border-primary hover:text-primary transition shadow-2xs cursor-pointer" (click)="abrirDetalleSinBanco(examen)">
                          <i class="pi pi-info-circle mr-1"></i>Detalles
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        @if (detalleSinBanco()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3" (click)="cerrarDetalleSinBanco()">
            <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl border border-amber-200" (click)="$event.stopPropagation()">
              <div class="flex items-center justify-between border-b border-border px-5 py-4 bg-amber-50/50">
                <div class="flex items-center gap-2.5">
                  <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <i class="pi pi-clock text-lg"></i>
                  </span>
                  <div>
                    <p class="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                      {{ detalleSinBanco()!.modalidad === 'PRESENCIAL_SIN_CARTILLA' ? 'Examen sin cartilla programado' : 'Examen programado sin banco' }}
                    </p>
                    <h2 class="text-base font-black">{{ detalleSinBanco()!.materiaCodigo }} · {{ detalleSinBanco()!.materiaNombre }}</h2>
                  </div>
                </div>
                <button type="button" class="icon-button" (click)="cerrarDetalleSinBanco()"><i class="pi pi-times"></i></button>
              </div>
              <div class="overflow-y-auto p-5 space-y-4 text-xs">
                <div class="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                  <div>
                    <span class="text-[10px] font-extrabold uppercase text-muted-foreground block">Grupo y Parcial</span>
                    <strong class="text-sm font-black text-foreground">{{ detalleSinBanco()!.grupo }} · {{ detalleSinBanco()!.tipoParcial }}</strong>
                  </div>
                  <div>
                    <span class="text-[10px] font-extrabold uppercase text-muted-foreground block">Modalidad</span>
                    <span class="font-bold text-foreground">{{ etiquetaModalidad(detalleSinBanco()!.modalidad) }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-extrabold uppercase text-muted-foreground block">Fecha de examen</span>
                    <strong class="text-foreground">{{ detalleSinBanco()!.fechaExamen | date:'dd/MM/yyyy' }}</strong>
                    @if (esHoy(detalleSinBanco()!.fechaExamen)) {
                      <span class="ml-1 rounded bg-rose-600 px-1.5 py-0.2 text-[9px] font-black text-white uppercase">¡Hoy!</span>
                    }
                  </div>
                  <div>
                    <span class="text-[10px] font-extrabold uppercase text-muted-foreground block">Horario</span>
                    <strong class="text-foreground">{{ detalleSinBanco()!.horario }}</strong>
                  </div>
                  <div>
                    <span class="text-[10px] font-extrabold uppercase text-muted-foreground block">Aula y Campus</span>
                    <span class="font-semibold text-foreground">{{ detalleSinBanco()!.aula || 'Aula regular' }} · {{ detalleSinBanco()!.campus || 'Campus principal' }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-extrabold uppercase text-muted-foreground block">Sede y Carrera</span>
                    <span class="font-semibold text-foreground">{{ detalleSinBanco()!.sedeNombre || detalleSinBanco()!.sedeCodigo }} · {{ detalleSinBanco()!.carreraNombre }}</span>
                  </div>
                </div>

                <div class="rounded-xl border border-border bg-card p-3.5 space-y-1">
                  <span class="text-[10px] font-extrabold uppercase text-muted-foreground block">Docente Titular Asignado</span>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-user text-primary text-base"></i>
                    <strong class="text-sm text-foreground">{{ detalleSinBanco()!.docenteNombre || 'Docente no asignado' }}</strong>
                  </div>
                </div>

                <div class="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-amber-950 space-y-1">
                  <p class="font-bold flex items-center gap-1.5 text-xs">
                    <i class="pi pi-info-circle text-amber-700"></i>
                    Estado en el flujo institucional:
                  </p>
                  @if (detalleSinBanco()!.modalidad === 'PRESENCIAL_SIN_CARTILLA') {
                    <p class="text-[11px] leading-relaxed text-amber-900">
                      Este examen es de modalidad presencial <strong>Sin Cartilla</strong>. El docente titular debe cargar el documento oficial (.doc o .docx) para que el personal de evaluaciones pueda imprimirlo. En cuanto se suba el documento, pasará al estado <strong>VALIDADO</strong>.
                    </p>
                  } @else {
                    <p class="text-[11px] leading-relaxed text-amber-900">
                      Este grupo tiene examen programado en el rol oficial, pero el docente titular aún no ha subido ni validado el banco de preguntas oficial en formato Excel. En cuanto se complete la carga, el examen avanzará al estado <strong>VALIDADO</strong> y estará listo para su revisión en la pestaña <em>"Por verificar"</em>.
                    </p>
                  }
                </div>
              </div>
              <div class="border-t border-border bg-muted/20 p-4 flex justify-end">
                <button type="button" class="rounded-xl bg-slate-800 hover:bg-slate-900 px-4 py-2 text-xs font-black text-white cursor-pointer" (click)="cerrarDetalleSinBanco()">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class VerificarExamenesComponent implements OnDestroy {
  @ViewChild(ExamenesAprobadosComponent) private panelAprobados?: ExamenesAprobadosComponent;
  private readonly service = inject(VerificacionExamenService);
  private readonly generacion = inject(GeneracionTypstService);
  private readonly gateway = inject(UnitepcGatewayService);
  private readonly sanitizer = inject(DomSanitizer);
  private pdfObjectUrl: string | null = null;
  private solicitudCarreras = 0;
  public readonly examenes = signal<VerificacionExamenLista[]>([]);
  public readonly examenesSinBanco = signal<VerificacionExamenLista[]>([]);
  public readonly cargandoSinBanco = signal(false);
  public readonly detalleSinBanco = signal<VerificacionExamenLista | null>(null);
  public readonly detalle = signal<VerificacionExamenDetalle | null>(null);
  public readonly cargando = signal(false);
  public readonly guardando = signal(false);
  public readonly procesando = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly pdfUrl = signal<SafeResourceUrl | null>(null);
  public sedes: BranchOffice[] = []; public carreras: Career[] = [];
  public cargandoSedes = false; public cargandoCarreras = false; public errorCatalogos: string | null = null;
  public orden = 'FECHA_EXAMEN_ASC'; public sedeCodigo = ''; public carreraCodigo = ''; public fechaDesde = ''; public fechaHasta = ''; public tipoParcial = ''; public modalidad = ''; public estado = '';
  public filtrosCompartidos: VerificacionExamenFiltros = {};
  public mostrarTodasPreguntas = false;
  public observacionGeneral = ''; public observacionesPreguntas: Record<number, string> = {};
  public vistaActual: 'revision' | 'aprobados' | 'sin_banco' = 'revision';
  public aprobadosInicializados = false;

  constructor() {
    const hoy = new Date();
    const hastaUnaSemana = new Date(hoy);
    hastaUnaSemana.setDate(hastaUnaSemana.getDate() + 7);
    this.fechaDesde = this._fechaIsoLocal(hoy);
    this.fechaHasta = this._fechaIsoLocal(hastaUnaSemana);
    this.cargarCatalogos();
    this.cargar();
  }
  public cargar(): void {
    if (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta) {
      this.error.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    const filtros: VerificacionExamenFiltros = {
      orden: this.orden,
      sedeCodigo: this.sedeCodigo || undefined,
      carreraCodigo: this.carreraCodigo || undefined,
      fechaDesde: this.fechaDesde || undefined,
      fechaHasta: this.fechaHasta || undefined,
      tipoParcial: this.tipoParcial || undefined,
      modalidad: this.modalidad || undefined
    };
    this.filtrosCompartidos = filtros;

    // Mantener sincronizado el listado y conteo de exámenes sin banco
    this.cargarSinBanco(filtros);

    if (this.vistaActual === 'aprobados') {
      this.error.set(null);
      return;
    }
    if (this.vistaActual === 'sin_banco') {
      this.error.set(null);
      return;
    }
    this.cargando.set(true); this.error.set(null);
    this.service.listar({ ...filtros, estado: this.estado || undefined }).subscribe({
      next: datos => { this.examenes.set(datos); this.cargando.set(false); },
      error: e => { this.cargando.set(false); this.error.set(this.mensajeError(e, 'No se pudo cargar la lista de exámenes.')); }
    });
  }

  public cargarSinBanco(filtros: VerificacionExamenFiltros = this.filtrosCompartidos): void {
    this.cargandoSinBanco.set(true);
    this.service.listarSinBanco(filtros).subscribe({
      next: datos => {
        this.examenesSinBanco.set(datos);
        this.cargandoSinBanco.set(false);
      },
      error: e => {
        this.cargandoSinBanco.set(false);
        if (this.vistaActual === 'sin_banco') {
          this.error.set(this.mensajeError(e, 'No se pudieron cargar los exámenes programados sin banco.'));
        }
      }
    });
  }

  public cambiarVista(vista: 'revision' | 'aprobados' | 'sin_banco'): void {
    if (this.vistaActual === vista) return;
    this.vistaActual = vista;
    this.error.set(null);
    if (vista === 'aprobados') {
      this.aprobadosInicializados = true;
    } else if (vista === 'sin_banco') {
      this.cargarSinBanco();
    } else {
      this.cargar();
    }
  }

  public actualizarVista(): void {
    if (this.vistaActual === 'aprobados') {
      this.panelAprobados?.cargar(this.filtrosCompartidos);
    } else if (this.vistaActual === 'sin_banco') {
      this.cargarSinBanco();
    } else {
      this.cargar();
    }
  }

  public totalExamenesHoySinBanco(): number {
    return this.examenesSinBanco().filter(e => this.esHoy(e.fechaExamen)).length;
  }

  public esHoy(fechaStr?: string): boolean {
    if (!fechaStr) return false;
    const hoyStr = this._fechaIsoLocal(new Date());
    return fechaStr === hoyStr || fechaStr.startsWith(hoyStr);
  }

  public diasRestantes(fechaStr?: string): number {
    if (!fechaStr) return 0;
    const fecha = new Date(fechaStr + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffTime = fecha.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public esRangoHoy(): boolean {
    const hoy = this._fechaIsoLocal(new Date());
    return this.fechaDesde === hoy && this.fechaHasta === hoy;
  }

  public esRangoSemana(): boolean {
    const hoy = this._fechaIsoLocal(new Date());
    const hasta = new Date();
    hasta.setDate(hasta.getDate() + 7);
    return this.fechaDesde === hoy && this.fechaHasta === this._fechaIsoLocal(hasta);
  }

  public esRangoTodos(): boolean {
    return !this.fechaDesde && !this.fechaHasta;
  }

  public establecerRangoHoy(): void {
    const hoy = this._fechaIsoLocal(new Date());
    this.fechaDesde = hoy;
    this.fechaHasta = hoy;
    this.cargar();
  }

  public establecerRangoSemana(): void {
    const hoy = new Date();
    const hasta = new Date(hoy);
    hasta.setDate(hasta.getDate() + 7);
    this.fechaDesde = this._fechaIsoLocal(hoy);
    this.fechaHasta = this._fechaIsoLocal(hasta);
    this.cargar();
  }

  public establecerRangoTodos(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.cargar();
  }

  public abrirDetalleSinBanco(examen: VerificacionExamenLista): void {
    this.detalleSinBanco.set(examen);
  }

  public cerrarDetalleSinBanco(): void {
    this.detalleSinBanco.set(null);
  }
  public cambiarSede(codigo: string): void {
    this.sedeCodigo = codigo || ''; this.carreraCodigo = ''; this.carreras = [];
    const solicitud = ++this.solicitudCarreras;
    if (this.sedeCodigo) {
      this.cargandoCarreras = true;
      this.gateway.getCareers(this.sedeCodigo).subscribe({
        next: carreras => { if (solicitud !== this.solicitudCarreras) return; this.carreras = carreras || []; this.cargandoCarreras = false; this.errorCatalogos = null; },
        error: () => { if (solicitud !== this.solicitudCarreras) return; this.carreras = []; this.cargandoCarreras = false; this.errorCatalogos = 'No se pudieron cargar las carreras autorizadas desde SEA.'; }
      });
    } else { this.cargandoCarreras = false; }
    this.cargar();
  }
  public cambiarRangoFechas(): void { this.cargar(); }
  public readonly alternativasVfComplejas = [
    { letra: 'A', texto: '1, 2 y 3 son verdaderas' },
    { letra: 'B', texto: '1 y 3 son verdaderas' },
    { letra: 'C', texto: '2 y 4 son verdaderas' },
    { letra: 'D', texto: 'Solo 4 es verdadera' },
    { letra: 'E', texto: 'Todas son verdaderas' }
  ];

  public esTronco(pregunta: VerificacionPregunta): boolean {
    if (pregunta.esEnunciadoContexto != null) {
      return pregunta.esEnunciadoContexto;
    }
    const tipo = (pregunta.tipoReactivo || '').toUpperCase();
    return tipo === 'EMPAREJAMIENTO_TRONCO' || tipo === 'CASO_CLINICO_TRONCO';
  }

  public totalRespondibles(): number {
    const preguntas = this.detalle()?.preguntas || [];
    return preguntas.filter(p => !this.esTronco(p)).length;
  }

  public totalTroncos(): number {
    const preguntas = this.detalle()?.preguntas || [];
    return preguntas.filter(p => this.esTronco(p)).length;
  }

  public numeroPreguntaVisible(pregunta: VerificacionPregunta): number | null {
    if (this.esTronco(pregunta)) return null;
    if (pregunta.numeroPregunta != null) return pregunta.numeroPregunta;
    const preguntas = this.detalle()?.preguntas || [];
    let num = 0;
    for (const p of preguntas) {
      if (!this.esTronco(p)) {
        num++;
        if (p.numeroOriginal === pregunta.numeroOriginal) return num;
      }
    }
    return pregunta.numeroOriginal;
  }

  public etiquetaTipo(pregunta: VerificacionPregunta): string {
    switch (pregunta.tipoReactivo) {
      case 'EMPAREJAMIENTO_TRONCO':
        return 'Matriz de Emparejamiento';
      case 'CASO_CLINICO_TRONCO':
        return 'Caso Clínico o Problema';
      case 'OPCION_EMPAREJAMIENTO':
        return 'Emparejamiento';
      case 'SUBITEM_CASO':
        return 'Subítem de Caso';
      case 'VERDADERO_O_FALSO':
        return 'Verdadero o Falso Simple';
      case 'VERDADERO_O_FALSO_COMPLEJAS':
        return 'Verdadero o Falso Compleja';
      case 'RESPUESTA_PREMISAS_ABCD':
        return 'Premisas A/B/Ambas/Ninguna';
      case 'SELECCION_SIMPLE':
        return 'Selección Múltiple';
      default:
        return pregunta.tipoReactivo || 'Pregunta';
    }
  }

  public proposicionesVfComplejas(pregunta: VerificacionPregunta): { numero: number; texto: string }[] {
    const letras = ['A', 'B', 'C', 'D'];
    return letras.map((letra, index) => {
      const op = pregunta.opciones.find(o => o.letra?.toUpperCase() === letra);
      let texto = op?.texto || '';
      texto = texto.replace(/^\s*[1-4][\.\)\-\:\s]+\s*/, '').trim();
      return { numero: index + 1, texto };
    }).filter(p => p.texto.length > 0);
  }

  public esClaveVfCompleja(pregunta: VerificacionPregunta, letra: string): boolean {
    return (pregunta.respuestaCorrecta || '').trim().toUpperCase() === letra.toUpperCase();
  }

  public opcionesPremisasAbcd(pregunta: VerificacionPregunta): { letra: string; texto: string; correcta: boolean }[] {
    const claves: string[] = (pregunta.respuestaCorrecta || '').toUpperCase().match(/[A-D]+/g) || [];
    const defaults: Record<string, string> = {
      'A': 'Si la primera es verdadera',
      'B': 'Si la segunda es verdadera',
      'C': 'Si ambas son verdaderas',
      'D': 'Si ninguna es verdadera'
    };
    return ['A', 'B', 'C', 'D'].map(letra => {
      const op = pregunta.opciones.find(o => o.letra?.toUpperCase() === letra);
      let texto = op?.texto?.trim() || defaults[letra];
      texto = texto.replace(new RegExp(`^\\s*${letra}[\\.\\)\\-\\:\\s]+\\s*`, 'i'), '').trim();
      if (!texto) texto = defaults[letra];
      const correcta = op?.correcta || claves.includes(letra);
      return { letra, texto, correcta };
    });
  }

  public tieneObservacionesPrevias(): boolean {
    const detalle = this.detalle();
    if (!detalle) return false;
    if (detalle.estadoVerificacion === 'DEVUELTO' && detalle.preguntas.some(p => p.observacion?.trim())) return true;
    const ultimaDevolucion = detalle.historialDevoluciones?.[0];
    return !!ultimaDevolucion?.preguntasObservadas?.length;
  }

  public preguntasParaRevision(): VerificacionPregunta[] {
    const detalle = this.detalle();
    if (!detalle || this.mostrarTodasPreguntas) return detalle?.preguntas || [];
    const devueltasActualmente = detalle.preguntas.filter(pregunta => pregunta.observacion?.trim());
    if (detalle.estadoVerificacion === 'DEVUELTO' && devueltasActualmente.length) return devueltasActualmente;
    const ultimaDevolucion = detalle.historialDevoluciones?.[0];
    const numerosObservados = new Set(ultimaDevolucion?.preguntasObservadas.map(pregunta => pregunta.numeroPregunta) || []);
    if (numerosObservados.size) {
      return detalle.preguntas.filter(pregunta => numerosObservados.has(pregunta.numeroOriginal));
    }
    return detalle.preguntas;
  }

  public esOpcionCorrecta(pregunta: VerificacionPregunta, opcion: VerificacionPregunta['opciones'][number]): boolean {
    if (pregunta.tipoReactivo === 'VERDADERO_O_FALSO_COMPLEJAS') {
      return false;
    }
    const claves: string[] = (pregunta.respuestaCorrecta || '').toUpperCase().match(/[A-Z0-9]+/g) || [];
    return opcion.correcta || (!!opcion.letra && claves.includes(opcion.letra.trim().toUpperCase()));
  }
  public imagenDataUrl(valor?: string): string | null {
    const contenido = (valor || '').split('#', 1)[0].trim();
    if (!contenido) return null;
    const uri = contenido.startsWith('data:')
      ? contenido.replace(/,(.*)$/s, (_coincidencia, base64: string) => `,${base64.replace(/\s+/g, '')}`)
      : `data:image/png;base64,${contenido.replace(/\s+/g, '')}`;
    return /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(uri) ? uri : null;
  }
  private _fechaIsoLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
  private cargarCatalogos(): void {
    this.cargandoSedes = true;
    this.gateway.getBranchOffices().subscribe({
      next: sedes => { this.sedes = sedes || []; this.cargandoSedes = false; if (!this.sedes.length) this.errorCatalogos = 'SEA no devolvió sedes para el alcance de esta cuenta.'; },
      error: () => { this.sedes = []; this.cargandoSedes = false; this.errorCatalogos = 'No se pudieron cargar las sedes autorizadas desde SEA.'; }
    });
  }
  public abrir(examen: VerificacionExamenLista): void { this.error.set(null); this.service.obtener(examen.rolExamenId).subscribe({ next: detalle => { this.detalle.set(detalle); this.observacionGeneral = detalle.observacionesGenerales || ''; this.observacionesPreguntas = {}; this.mostrarTodasPreguntas = false; }, error: e => this.error.set(this.mensajeError(e, 'No se pudo obtener el examen para revisión.')) }); }
  public cerrar(): void { if (!this.guardando() && !this.procesando()) this.detalle.set(null); }
  public previsualizar(): void { const id = this.detalle()?.rolExamenId; if (!id) return; this.procesando.set(true); this.service.previsualizar(id).subscribe({ next: resultado => { if (resultado.estado === 'COMPLETADO') this.cargarPdf(resultado); else this.esperarPdf(resultado.jobId); }, error: e => { this.procesando.set(false); this.error.set(this.mensajeError(e, 'No se pudo solicitar la previsualización.')); } }); }
  private esperarPdf(jobId: string): void { this.generacion.esperarResultado(jobId, 1500, 80).subscribe({ next: resultado => { this.procesando.set(false); if (resultado.estado === 'COMPLETADO') this.cargarPdf(resultado); else this.error.set(resultado.mensaje || 'Typst no pudo generar la previsualización.'); }, error: e => { this.procesando.set(false); this.error.set(this.mensajeError(e, 'No se pudo completar la previsualización.')); } }); }
  private cargarPdf(resultado: any): void { this.procesando.set(false); const path = resultado?.variantes?.[0]?.archivoPdfPath; if (!path) { this.error.set('La previsualización terminó sin devolver un PDF.'); return; } this.generacion.descargarArchivo(path).subscribe({ next: blob => { this.cerrarPdf(); this.pdfObjectUrl = URL.createObjectURL(blob); this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfObjectUrl)); }, error: e => this.error.set(this.mensajeError(e, 'No se pudo abrir el PDF.')) }); }
  public cerrarPdf(): void { if (this.pdfObjectUrl) URL.revokeObjectURL(this.pdfObjectUrl); this.pdfObjectUrl = null; this.pdfUrl.set(null); }
  public decidir(decision: 'APROBAR' | 'DEVOLVER'): void { const detalle = this.detalle(); if (!detalle) return; this.guardando.set(true); this.service.decidir(detalle.rolExamenId, { decision, observacionesGenerales: this.observacionGeneral, observacionesPreguntas: Object.fromEntries(Object.entries(this.observacionesPreguntas).filter(([, value]) => value?.trim())) }).subscribe({ next: actualizado => { this.detalle.set(actualizado); this.guardando.set(false); this.cargar(); if (decision === 'APROBAR') this.detalle.set(null); }, error: e => { this.guardando.set(false); this.error.set(this.mensajeError(e, decision === 'DEVOLVER' ? 'Para devolver debes registrar observaciones.' : 'No se pudo aprobar el examen.')); } }); }
  public etiquetaModalidad(valor: string): string {
    if (valor === 'PRESENCIAL_SIN_CARTILLA') return 'Sin Cartilla';
    if (valor === 'VIRTUAL') return 'Virtual';
    return 'Con cartilla';
  }
  private mensajeError(error: any, fallback: string): string { return error?.error?.mensaje || error?.error?.message || fallback; }
  public ngOnDestroy(): void { this.cerrarPdf(); }
}
