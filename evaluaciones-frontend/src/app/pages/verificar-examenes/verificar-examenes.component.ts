import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VerificacionExamenService, VerificacionExamenLista, VerificacionExamenDetalle } from '../../core/services/verificacion-examen.service';
import { GeneracionTypstService } from '../../core/services/generacion-typst.service';

@Component({
  selector: 'sea-verificar-examenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700"><i class="pi pi-verified text-xl"></i></span>
            <div><h1 class="text-2xl font-black tracking-tight text-foreground">Verificar exámenes</h1><p class="text-xs text-muted-foreground">Revisión completa de exámenes validados antes de generar el material oficial.</p></div>
          </div>
        </div>
        <button type="button" class="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:border-primary" (click)="cargar()"><i class="pi pi-refresh mr-2"></i>Actualizar</button>
      </div>

      <div class="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs md:grid-cols-3 lg:grid-cols-6">
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Orden<select [(ngModel)]="orden" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs font-bold"><option value="FECHA_EXAMEN_ASC">Fecha examen ↑</option><option value="FECHA_EXAMEN_DESC">Fecha examen ↓</option><option value="FECHA_SUBIDA_ASC">Fecha subida ↑</option><option value="FECHA_SUBIDA_DESC">Fecha subida ↓</option></select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Sede<input [(ngModel)]="sedeCodigo" (keyup.enter)="cargar()" placeholder="Código de sede" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Carrera<input [(ngModel)]="carreraCodigo" (keyup.enter)="cargar()" placeholder="Código de carrera" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Parcial<select [(ngModel)]="tipoParcial" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">Todos</option><option>1er Parcial</option><option>2do Parcial</option><option>Examen Final</option><option>2da Instancia</option></select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Modalidad<select [(ngModel)]="modalidad" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">Todas</option><option value="PRESENCIAL_CARTILLA">Con cartilla</option><option value="VIRTUAL">Virtual</option></select></label>
        <label class="text-[10px] font-extrabold uppercase text-muted-foreground">Estado<select [(ngModel)]="estado" (ngModelChange)="cargar()" class="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"><option value="">Pendientes y devueltos</option><option value="PENDIENTE">Pendiente</option><option value="DEVUELTO">Devuelto</option></select></label>
      </div>

      @if (error()) { <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800"><i class="pi pi-exclamation-triangle mr-2"></i>{{ error() }}</div> }
      @if (cargando()) { <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground"><i class="pi pi-spin pi-spinner mr-2"></i>Cargando exámenes validados...</div> }
      @else if (!examenes().length) { <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No hay exámenes pendientes de verificación en tu alcance.</div> }
      @else {
        <div class="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
          <table class="w-full min-w-[1050px] text-left text-xs"><thead class="bg-muted/50 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><tr><th class="p-3">Fecha examen</th><th class="p-3">Asignatura</th><th class="p-3">Grupo</th><th class="p-3">Docente</th><th class="p-3">Subido</th><th class="p-3">Versión</th><th class="p-3">Modalidad</th><th class="p-3">Estado</th><th class="p-3 text-right">Acción</th></tr></thead>
            <tbody class="divide-y divide-border">@for (examen of examenes(); track examen.rolExamenId) {<tr class="hover:bg-muted/20"><td class="p-3 font-bold">{{ examen.fechaExamen | date:'dd/MM/yyyy' }}<span class="block font-normal text-muted-foreground">{{ examen.horario }}</span></td><td class="p-3"><strong>{{ examen.materiaCodigo }}</strong><span class="block max-w-[220px] truncate text-muted-foreground">{{ examen.materiaNombre }}</span></td><td class="p-3 font-black">{{ examen.grupo }}</td><td class="p-3">{{ examen.docenteNombre }}</td><td class="p-3 text-muted-foreground">{{ examen.fechaSubida | date:'dd/MM/yyyy HH:mm' }}</td><td class="p-3 font-mono font-bold">{{ examen.version }}</td><td class="p-3">{{ etiquetaModalidad(examen.modalidad) }}</td><td class="p-3"><span [class]="examen.estadoVerificacion === 'DEVUELTO' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'" class="rounded-full px-2 py-1 text-[10px] font-black">{{ examen.estadoVerificacion }}</span></td><td class="p-3 text-right"><button type="button" class="rounded-lg bg-purple-700 px-3 py-2 text-[11px] font-black text-white hover:bg-purple-800" (click)="abrir(examen)"><i class="pi pi-search mr-1"></i>Revisar</button></td></tr>}</tbody></table>
        </div>
      }

      @if (detalle()) { <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3" (click)="cerrar()"><div class="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl" (click)="$event.stopPropagation()"><div class="flex items-center justify-between border-b border-border px-5 py-4"><div><p class="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Revisión de examen validado</p><h2 class="text-lg font-black">{{ detalle()!.materiaCodigo }} · {{ detalle()!.materiaNombre }} · {{ detalle()!.grupo }}</h2><p class="text-xs text-muted-foreground">{{ detalle()!.tipoParcial }} · {{ detalle()!.version }} · {{ detalle()!.estadoVerificacion }}</p></div><button type="button" class="icon-button" (click)="cerrar()"><i class="pi pi-times"></i></button></div>
          <div class="flex-1 overflow-y-auto p-5"><div class="mb-4 flex flex-wrap items-center gap-2"><button type="button" class="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50" [disabled]="procesando()" (click)="previsualizar()"><i class="pi pi-file-pdf mr-2"></i>{{ procesando() ? 'Generando...' : 'Previsualizar examen completo' }}</button><span class="rounded-xl bg-muted px-3 py-2 text-[11px] text-muted-foreground">{{ detalle()!.preguntas.length }} preguntas · incluye clave separada</span></div>
            @if (detalle()!.observacionesGenerales) {<div class="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"><strong>Observaciones anteriores:</strong> {{ detalle()!.observacionesGenerales }}</div>}
            <div class="space-y-3">@for (pregunta of detalle()!.preguntas; track pregunta.numeroOriginal) {<article class="rounded-xl border border-border bg-background p-4"><div class="flex items-start gap-3"><span class="rounded-lg bg-purple-100 px-2 py-1 text-xs font-black text-purple-800">{{ pregunta.tipoReactivo }} ({{ pregunta.numeroOriginal }})</span><span class="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">D{{ pregunta.dificultad }}</span></div><p class="mt-3 text-sm font-semibold text-foreground">{{ pregunta.enunciado }}</p>@if (pregunta.opciones.length) {<div class="mt-2 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">@for (opcion of pregunta.opciones; track opcion.letra) {<div><strong>{{ opcion.letra }})</strong> {{ opcion.texto }}</div>}</div>}<textarea [(ngModel)]="observacionesPreguntas[pregunta.numeroOriginal]" rows="2" placeholder="Observación para esta pregunta (opcional)" class="mt-3 w-full rounded-lg border border-border bg-card p-2 text-xs"></textarea></article>}</div>
          </div><div class="border-t border-border bg-muted/20 p-5"><label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Observación general <textarea [(ngModel)]="observacionGeneral" rows="2" class="mt-1 w-full rounded-lg border border-border bg-card p-2 text-xs" placeholder="Escribe una observación general..."></textarea></label><div class="mt-3 flex flex-wrap justify-end gap-2"><button type="button" class="rounded-xl border border-rose-300 bg-card px-4 py-2 text-xs font-black text-rose-700" [disabled]="guardando()" (click)="decidir('DEVOLVER')">Devolver con observaciones</button><button type="button" class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white" [disabled]="guardando()" (click)="decidir('APROBAR')"><i class="pi pi-check mr-1"></i>Aprobar examen</button></div></div>
        </div></div> }
      @if (pdfUrl()) { <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-3" (click)="cerrarPdf()"><div class="h-[94vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-card" (click)="$event.stopPropagation()"><div class="flex items-center justify-between border-b border-border px-4 py-3"><strong class="text-sm">Previsualización completa para verificación</strong><button type="button" class="icon-button" (click)="cerrarPdf()"><i class="pi pi-times"></i></button></div><iframe [src]="pdfUrl()" class="h-[calc(100%-3.5rem)] w-full" title="Previsualización del examen"></iframe></div></div> }
    </div>
  `
})
export class VerificarExamenesComponent implements OnDestroy {
  private readonly service = inject(VerificacionExamenService);
  private readonly generacion = inject(GeneracionTypstService);
  private readonly sanitizer = inject(DomSanitizer);
  private pdfObjectUrl: string | null = null;
  public readonly examenes = signal<VerificacionExamenLista[]>([]);
  public readonly detalle = signal<VerificacionExamenDetalle | null>(null);
  public readonly cargando = signal(false);
  public readonly guardando = signal(false);
  public readonly procesando = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly pdfUrl = signal<SafeResourceUrl | null>(null);
  public orden = 'FECHA_EXAMEN_ASC'; public sedeCodigo = ''; public carreraCodigo = ''; public tipoParcial = ''; public modalidad = ''; public estado = '';
  public observacionGeneral = ''; public observacionesPreguntas: Record<number, string> = {};

  constructor() { this.cargar(); }
  public cargar(): void { this.cargando.set(true); this.error.set(null); this.service.listar({ orden: this.orden, sedeCodigo: this.sedeCodigo || undefined, carreraCodigo: this.carreraCodigo || undefined, tipoParcial: this.tipoParcial || undefined, modalidad: this.modalidad || undefined, estado: this.estado || undefined }).subscribe({ next: datos => { this.examenes.set(datos); this.cargando.set(false); }, error: e => { this.cargando.set(false); this.error.set(this.mensajeError(e, 'No se pudo cargar la lista de exámenes.')); } }); }
  public abrir(examen: VerificacionExamenLista): void { this.error.set(null); this.service.obtener(examen.rolExamenId).subscribe({ next: detalle => { this.detalle.set(detalle); this.observacionGeneral = detalle.observacionesGenerales || ''; this.observacionesPreguntas = {}; }, error: e => this.error.set(this.mensajeError(e, 'No se pudo obtener el examen para revisión.')) }); }
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
