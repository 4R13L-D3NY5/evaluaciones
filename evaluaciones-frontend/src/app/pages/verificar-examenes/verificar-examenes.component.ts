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
            <div><h1 class="text-2xl font-black tracking-tight text-foreground">{{ vistaActual === 'aprobados' ? 'Exámenes aprobados' : 'Verificar exámenes' }}</h1><p class="text-xs text-muted-foreground">{{ vistaActual === 'aprobados' ? 'Historial de exámenes aprobados por verificación dentro de tu alcance.' : 'Revisión completa de exámenes validados antes de generar el material oficial.' }}</p></div>
          </div>
        </div>
        <button type="button" class="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:border-primary" (click)="actualizarVista()"><i class="pi pi-refresh mr-2"></i>Actualizar</button>
      </div>

      <nav class="flex w-fit gap-1 rounded-xl border border-border bg-muted/40 p-1" role="tablist" aria-label="Vistas de verificación">
        <button type="button" role="tab" [attr.aria-selected]="vistaActual === 'revision'" (click)="cambiarVista('revision')" [class.bg-card]="vistaActual === 'revision'" [class.text-primary]="vistaActual === 'revision'" [class.shadow-xs]="vistaActual === 'revision'" class="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"><i class="pi pi-search mr-2"></i>Por verificar@if (examenes().length) { <span class="ml-1">({{ examenes().length }})</span> }</button>
        <button type="button" role="tab" [attr.aria-selected]="vistaActual === 'aprobados'" (click)="cambiarVista('aprobados')" [class.bg-card]="vistaActual === 'aprobados'" [class.text-primary]="vistaActual === 'aprobados'" [class.shadow-xs]="vistaActual === 'aprobados'" class="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"><i class="pi pi-check-circle mr-2"></i>Aprobados</button>
      </nav>

      <div class="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs md:grid-cols-3 lg:grid-cols-4">
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Orden<select [(ngModel)]="orden" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs font-bold"><option value="FECHA_EXAMEN_ASC">Fecha examen ↑</option><option value="FECHA_EXAMEN_DESC">Fecha examen ↓</option><option value="FECHA_SUBIDA_ASC">Fecha subida ↑</option><option value="FECHA_SUBIDA_DESC">Fecha subida ↓</option></select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Sede · SEA<select [(ngModel)]="sedeCodigo" (ngModelChange)="cambiarSede($event)" [disabled]="cargandoSedes" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">{{ cargandoSedes ? 'Cargando sedes...' : 'Todas las sedes de mi alcance' }}</option>@for (sede of sedes; track sede.code) {<option [value]="sede.code">{{ sede.code }} · {{ sede.name }}</option>}</select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Carrera · SEA<select [(ngModel)]="carreraCodigo" (ngModelChange)="cargar()" [disabled]="!sedeCodigo || cargandoCarreras" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">{{ !sedeCodigo ? 'Todas las carreras' : cargandoCarreras ? 'Cargando carreras...' : 'Todas las carreras de la sede' }}</option>@for (carrera of carreras; track carrera.careerCode) {<option [value]="carrera.careerCode">{{ carrera.careerCode }} · {{ carrera.careerName }}</option>}</select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Fecha examen · desde<input type="date" [(ngModel)]="fechaDesde" (ngModelChange)="cambiarRangoFechas()" [max]="fechaHasta || null" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Fecha examen · hasta<input type="date" [(ngModel)]="fechaHasta" (ngModelChange)="cambiarRangoFechas()" [min]="fechaDesde || null" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Parcial<select [(ngModel)]="tipoParcial" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">Todos</option><option>1er Parcial</option><option>2do Parcial</option><option>Examen Final</option><option>2da Instancia</option></select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Modalidad<select [(ngModel)]="modalidad" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">Todas</option><option value="PRESENCIAL_CARTILLA">Con cartilla</option><option value="VIRTUAL">Virtual</option></select></label>
        @if (vistaActual === 'revision') { <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Estado<select [(ngModel)]="estado" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">Pendientes y devueltos</option><option value="PENDIENTE">Pendiente</option><option value="DEVUELTO">Devuelto</option></select></label> }
      </div>

      @if (errorCatalogos) { <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900"><i class="pi pi-exclamation-triangle mr-2"></i>{{ errorCatalogos }}</div> }
      @if (error()) { <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800"><i class="pi pi-exclamation-triangle mr-2"></i>{{ error() }}</div> }

      @if (vistaActual === 'revision') {
      @if (cargando()) { <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground"><i class="pi pi-spin pi-spinner mr-2"></i>Cargando exámenes validados...</div> }
      @else if (!examenes().length) { <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No hay exámenes pendientes de verificación en tu alcance.</div> }
      @else {
        <div class="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
          <table class="w-full min-w-[1200px] text-left text-xs"><thead class="bg-muted/50 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><tr><th class="p-3">Fecha examen</th><th class="p-3">Sede / carrera</th><th class="p-3">Asignatura</th><th class="p-3">Grupo</th><th class="p-3">Docente</th><th class="p-3">Subido</th><th class="p-3">Versión</th><th class="p-3">Modalidad</th><th class="p-3">Estado</th><th class="p-3 text-right">Acción</th></tr></thead>
            <tbody class="divide-y divide-border">@for (examen of examenes(); track examen.rolExamenId) {<tr class="hover:bg-muted/20"><td class="p-3 font-bold">{{ examen.fechaExamen | date:'dd/MM/yyyy' }}<span class="block font-normal text-muted-foreground">{{ examen.horario }}</span></td><td class="p-3"><strong>{{ examen.sedeCodigo || '—' }}</strong><span class="block text-muted-foreground">{{ examen.sedeNombre || 'Sede no registrada' }}</span><span class="block text-muted-foreground">{{ examen.carreraCodigo }} · {{ examen.carreraNombre }}</span></td><td class="p-3"><strong>{{ examen.materiaCodigo }}</strong><span class="block max-w-[220px] truncate text-muted-foreground">{{ examen.materiaNombre }}</span></td><td class="p-3 font-black">{{ examen.grupo }}</td><td class="p-3">{{ examen.docenteNombre }}</td><td class="p-3 text-muted-foreground">{{ examen.fechaSubida | date:'dd/MM/yyyy HH:mm' }}</td><td class="p-3 font-mono font-bold">{{ examen.version }}</td><td class="p-3">{{ etiquetaModalidad(examen.modalidad) }}</td><td class="p-3"><span [class]="examen.estadoVerificacion === 'DEVUELTO' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'" class="rounded-full px-2 py-1 text-[10px] font-black">{{ examen.estadoVerificacion }}</span></td><td class="p-3 text-right"><button type="button" class="rounded-lg bg-purple-700 px-3 py-2 text-[11px] font-black text-white hover:bg-purple-800" (click)="abrir(examen)"><i class="pi pi-search mr-1"></i>Revisar</button></td></tr>}</tbody></table>
        </div>
      }

      @if (detalle()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3" (click)="cerrar()">
          <div class="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Revisión de examen validado</p>
                <h2 class="text-lg font-black">{{ detalle()!.materiaCodigo }} · {{ detalle()!.materiaNombre }} · {{ detalle()!.grupo }}</h2>
                <p class="text-xs text-muted-foreground">{{ detalle()!.tipoParcial }} · {{ detalle()!.version }} · {{ detalle()!.estadoVerificacion }}</p>
                <p class="text-xs text-muted-foreground">{{ detalle()!.sedeNombre || 'Sede no registrada' }} · {{ detalle()!.carreraNombre }}</p>
              </div>
              <button type="button" class="icon-button" (click)="cerrar()"><i class="pi pi-times"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-5">
              <div class="mb-4 flex flex-wrap items-center gap-2">
                <button type="button" class="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50" [disabled]="procesando()" (click)="previsualizar()"><i class="pi pi-file-pdf mr-2"></i>{{ procesando() ? 'Generando...' : 'Previsualizar examen completo' }}</button>
                <span class="rounded-xl bg-muted px-3 py-2 text-[11px] text-muted-foreground">{{ detalle()!.preguntas.length }} preguntas · incluye clave separada</span>
              </div>
              @if (detalle()!.historialDevoluciones.length) {
                <section class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div class="mb-3 flex items-center gap-2 text-sm font-black text-amber-950"><i class="pi pi-history"></i>Historial de observaciones</div>
                  <p class="mb-4 text-xs text-amber-900">Se conserva únicamente el contenido de las preguntas que tuvieron observaciones. Compara la versión devuelta con la versión actualizada.</p>
                  <div class="space-y-4">
                    @for (revision of detalle()!.historialDevoluciones; track revision.id) {
                      <div class="rounded-lg border border-amber-200 bg-card p-3">
                        <p class="mb-2 text-[11px] font-bold text-muted-foreground">Devuelto {{ revision.fechaDevolucion | date:'dd/MM/yyyy HH:mm' }} · {{ revision.verificadoPor || 'Verificador' }}</p>
                        @if (revision.observacionesGenerales) { <p class="mb-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-950"><strong>Observación general:</strong> {{ revision.observacionesGenerales }}</p> }
                        @for (item of revision.preguntasObservadas; track item.numeroPregunta) {
                          <article class="mb-3 last:mb-0 rounded-lg border border-border p-3">
                            <p class="mb-2 text-xs font-black">Pregunta {{ item.numeroPregunta }}</p>
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
                              <div class="rounded-lg bg-emerald-50 p-3">
                                <p class="mb-1 text-[10px] font-extrabold uppercase text-emerald-800">Versión corregida</p>
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
                <span class="text-xs font-bold text-muted-foreground">Mostrando {{ preguntasParaRevision().length }} de {{ detalle()!.preguntas.length }} preguntas</span>
                @if (preguntasParaRevision().length < detalle()!.preguntas.length) {
                  <button type="button" class="text-xs font-bold text-primary underline" (click)="mostrarTodasPreguntas = !mostrarTodasPreguntas">{{ mostrarTodasPreguntas ? 'Enfocar preguntas observadas' : 'Mostrar examen completo' }}</button>
                }
              </div>
              <div class="space-y-3">
                @for (pregunta of preguntasParaRevision(); track pregunta.numeroOriginal) {
                  <article class="rounded-xl border border-border bg-background p-4">
                    <div class="flex items-start gap-3"><span class="rounded-lg bg-purple-100 px-2 py-1 text-xs font-black text-purple-800">{{ pregunta.tipoReactivo }} ({{ pregunta.numeroOriginal }})</span><span class="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">D{{ pregunta.dificultad }}</span></div>
                    <p [seaMathContent]="pregunta.enunciado" class="mt-3 whitespace-pre-wrap text-sm font-semibold text-foreground"></p>
                    @if (imagenDataUrl(pregunta.imagenBase64); as imagen) { <img [src]="imagen" [alt]="'Imagen de la pregunta ' + pregunta.numeroOriginal" class="mt-3 max-h-80 max-w-full rounded-lg border border-border object-contain"> }
                    @if (pregunta.respuestaCorrecta) { <p class="mt-3 inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">Clave correcta: {{ pregunta.respuestaCorrecta }}</p> }
                    @if (pregunta.opciones.length) { <div class="mt-2 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">@for (opcion of pregunta.opciones; track opcion.letra) { <div [class.font-bold]="esOpcionCorrecta(pregunta, opcion)" [class.text-emerald-700]="esOpcionCorrecta(pregunta, opcion)"><strong>{{ opcion.letra }})</strong> <span [seaMathContent]="opcion.texto"></span> @if (esOpcionCorrecta(pregunta, opcion)) {<i class="pi pi-check ml-1" aria-label="Respuesta correcta"></i>}</div> }</div> }
                    @if (pregunta.observacion) { <p class="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-800"><strong>Observación enviada:</strong> {{ pregunta.observacion }}</p> }
                    <textarea [(ngModel)]="observacionesPreguntas[pregunta.numeroOriginal]" rows="2" placeholder="Nueva observación si aún requiere corrección" class="mt-3 w-full rounded-lg border border-border bg-card p-2 text-xs"></textarea>
                  </article>
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
  public vistaActual: 'revision' | 'aprobados' = 'revision';
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
    if (this.vistaActual === 'aprobados') {
      this.error.set(null);
      return;
    }
    this.cargando.set(true); this.error.set(null);
    this.service.listar({ ...filtros, estado: this.estado || undefined }).subscribe({ next: datos => { this.examenes.set(datos); this.cargando.set(false); }, error: e => { this.cargando.set(false); this.error.set(this.mensajeError(e, 'No se pudo cargar la lista de exámenes.')); } });
  }
  public cambiarVista(vista: 'revision' | 'aprobados'): void {
    if (this.vistaActual === vista) return;
    this.vistaActual = vista;
    this.error.set(null);
    if (vista === 'aprobados') this.aprobadosInicializados = true;
    else this.cargar();
  }
  public actualizarVista(): void {
    if (this.vistaActual === 'aprobados') this.panelAprobados?.cargar(this.filtrosCompartidos);
    else this.cargar();
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
  public etiquetaModalidad(valor: string): string { return valor === 'VIRTUAL' ? 'Virtual' : 'Con cartilla'; }
  private mensajeError(error: any, fallback: string): string { return error?.error?.mensaje || error?.error?.message || fallback; }
  public ngOnDestroy(): void { this.cerrarPdf(); }
}
