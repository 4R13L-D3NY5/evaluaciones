import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerificacionExamenDetalle, VerificacionExamenFiltros, VerificacionExamenLista, VerificacionExamenService } from '../../core/services/verificacion-examen.service';
import { MathContentDirective } from '../../shared/components/math-content.directive';

@Component({
  selector: 'sea-examenes-aprobados',
  standalone: true,
  imports: [CommonModule, MathContentDirective],
  template: `
    <div class="space-y-6">
      @if (error()) { <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800"><i class="pi pi-exclamation-triangle mr-2"></i>{{ error() }}</div> }
      @if (cargando()) { <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground"><i class="pi pi-spin pi-spinner mr-2"></i>Cargando exámenes aprobados...</div> }
      @else if (!examenes().length) { <div class="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No hay exámenes aprobados en tu alcance con estos filtros.</div> }
      @else {
        <div class="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
          <table class="w-full min-w-[1180px] text-left text-xs">
            <thead class="bg-muted/50 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><tr><th class="p-3">Fecha examen</th><th class="p-3">Sede / carrera</th><th class="p-3">Asignatura</th><th class="p-3">Grupo · parcial</th><th class="p-3">Docente</th><th class="p-3">Aprobado por</th><th class="p-3">Fecha aprobación</th><th class="p-3">Modalidad</th><th class="p-3 text-right">Consulta</th></tr></thead>
            <tbody class="divide-y divide-border">
              @for (examen of examenes(); track examen.rolExamenId) {
                <tr class="hover:bg-muted/20">
                  <td class="p-3 font-bold">{{ examen.fechaExamen | date:'dd/MM/yyyy' }}<span class="block font-normal text-muted-foreground">{{ examen.horario }}</span></td>
                  <td class="p-3"><strong>{{ examen.sedeCodigo }}</strong><span class="block text-muted-foreground">{{ examen.carreraCodigo }} · {{ examen.carreraNombre }}</span></td>
                  <td class="p-3"><strong>{{ examen.materiaCodigo }}</strong><span class="block max-w-[220px] truncate text-muted-foreground">{{ examen.materiaNombre }}</span></td>
                  <td class="p-3 font-bold">{{ examen.grupo }}<span class="block font-normal text-muted-foreground">{{ examen.tipoParcial }}</span></td>
                  <td class="p-3">{{ examen.docenteNombre }}</td>
                  <td class="p-3">{{ examen.verificadoPor || 'Verificador' }}</td>
                  <td class="p-3 text-muted-foreground">{{ examen.fechaVerificacion | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="p-3">{{ etiquetaModalidad(examen.modalidad) }}</td>
                  <td class="p-3 text-right"><button type="button" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-800 hover:bg-emerald-100" [disabled]="cargandoDetalle()" (click)="abrir(examen)"><i class="pi pi-eye mr-1"></i>Ver examen</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (detalle()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3" (click)="cerrar()">
          <section class="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl" (click)="$event.stopPropagation()">
            <header class="flex items-center justify-between border-b border-border px-5 py-4">
              <div><p class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Consulta de examen aprobado</p><h2 class="text-lg font-black">{{ detalle()!.materiaCodigo }} · {{ detalle()!.materiaNombre }} · {{ detalle()!.grupo }}</h2><p class="text-xs text-muted-foreground">{{ detalle()!.fechaExamen | date:'dd/MM/yyyy' }} · {{ detalle()!.tipoParcial }} · {{ detalle()!.horario }}</p></div>
              <button type="button" aria-label="Cerrar" class="icon-button" (click)="cerrar()"><i class="pi pi-times"></i></button>
            </header>
            <div class="flex-1 space-y-4 overflow-y-auto p-5">
              <div class="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:grid-cols-2"><p><strong>Estado:</strong> Aprobado</p><p><strong>Versión:</strong> {{ detalle()!.version }}</p><p><strong>Verificado por:</strong> {{ detalle()!.verificadoPor || 'Verificador' }}</p><p><strong>Fecha de aprobación:</strong> {{ detalle()!.fechaVerificacion | date:'dd/MM/yyyy HH:mm' }}</p></div>
              @if (detalle()!.observacionesGenerales) { <p class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"><strong>Observación registrada:</strong> {{ detalle()!.observacionesGenerales }}</p> }
              <div class="space-y-3">
                @for (pregunta of detalle()!.preguntas; track pregunta.numeroOriginal) {
                  <article class="rounded-xl border border-border bg-background p-4"><div class="flex items-start gap-3"><span class="rounded-lg bg-purple-100 px-2 py-1 text-xs font-black text-purple-800">Pregunta {{ pregunta.numeroOriginal }}</span><span class="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">D{{ pregunta.dificultad }}</span></div><p [seaMathContent]="pregunta.enunciado" class="mt-3 whitespace-pre-wrap text-sm font-semibold text-foreground"></p>
                    @if (imagenDataUrl(pregunta.imagenBase64); as imagen) { <img [src]="imagen" [alt]="'Imagen de la pregunta ' + pregunta.numeroOriginal" class="mt-3 max-h-80 max-w-full rounded-lg border border-border object-contain"> }
                    @if (pregunta.respuestaCorrecta) { <p class="mt-3 inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">Clave correcta: {{ pregunta.respuestaCorrecta }}</p> }
                    @if (pregunta.opciones.length) { <div class="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">@for (opcion of pregunta.opciones; track opcion.letra) { <div [class.font-bold]="esOpcionCorrecta(pregunta, opcion)" [class.text-emerald-700]="esOpcionCorrecta(pregunta, opcion)"><strong>{{ opcion.letra }})</strong> <span [seaMathContent]="opcion.texto"></span> @if (esOpcionCorrecta(pregunta, opcion)) {<i class="pi pi-check ml-1" aria-label="Respuesta correcta"></i>}</div> }</div> }
                    @if (pregunta.observacion) { <p class="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900"><strong>Observación:</strong> {{ pregunta.observacion }}</p> }
                  </article>
                }
              </div>
            </div>
            <footer class="flex justify-end border-t border-border bg-muted/20 p-4"><button type="button" class="rounded-xl border border-border bg-card px-4 py-2 text-xs font-black" (click)="cerrar()">Cerrar consulta</button></footer>
          </section>
        </div>
      }
    </div>
  `
})
export class ExamenesAprobadosComponent implements OnChanges {
  private readonly service = inject(VerificacionExamenService);
  @Input() public filtros: VerificacionExamenFiltros = {};
  @Input() public activo = false;
  public readonly examenes = signal<VerificacionExamenLista[]>([]);
  public readonly detalle = signal<VerificacionExamenDetalle | null>(null);
  public readonly cargando = signal(false);
  public readonly cargandoDetalle = signal(false);
  public readonly error = signal<string | null>(null);
  public esOpcionCorrecta(pregunta: VerificacionExamenDetalle['preguntas'][number], opcion: VerificacionExamenDetalle['preguntas'][number]['opciones'][number]): boolean {
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
  public ngOnChanges(changes: SimpleChanges): void {
    if (this.activo && (changes['activo'] || changes['filtros'])) this.cargar(this.filtros);
  }

  public cargar(filtros: VerificacionExamenFiltros = this.filtros): void {
    this.cargando.set(true);
    this.error.set(null);
    this.service.listar({ ...filtros, estado: 'VERIFICADO' }).subscribe({
      next: datos => { this.examenes.set(datos); this.cargando.set(false); },
      error: error => { this.cargando.set(false); this.error.set(error?.error?.mensaje || error?.error?.message || 'No se pudieron cargar los exámenes aprobados.'); }
    });
  }

  public abrir(examen: VerificacionExamenLista): void {
    this.cargandoDetalle.set(true);
    this.error.set(null);
    this.service.obtenerAprobado(examen.rolExamenId).subscribe({
      next: detalle => { this.detalle.set(detalle); this.cargandoDetalle.set(false); },
      error: error => { this.cargandoDetalle.set(false); this.error.set(error?.error?.mensaje || error?.error?.message || 'No se pudo consultar el examen aprobado.'); }
    });
  }

  public cerrar(): void { this.detalle.set(null); }
  public etiquetaModalidad(valor: string): string { return valor === 'VIRTUAL' ? 'Virtual' : 'Con cartilla'; }

}
