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
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Consulta de examen aprobado</p>
                <h2 class="text-lg font-black">{{ detalle()!.materiaCodigo }} · {{ detalle()!.materiaNombre }} · {{ detalle()!.grupo }}</h2>
                <p class="text-xs text-muted-foreground">
                  {{ detalle()!.fechaExamen | date:'dd/MM/yyyy' }} · {{ detalle()!.tipoParcial }} · {{ detalle()!.horario }}
                  · <span class="font-semibold text-foreground">{{ totalRespondibles() }} preguntas evaluables</span>
                  @if (totalTroncos() > 0) {
                    <span> (+ {{ totalTroncos() }} enunciados/casos de contexto)</span>
                  }
                </p>
              </div>
              <button type="button" aria-label="Cerrar" class="icon-button" (click)="cerrar()"><i class="pi pi-times"></i></button>
            </header>
            <div class="flex-1 space-y-4 overflow-y-auto p-5">
              <div class="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:grid-cols-2"><p><strong>Estado:</strong> Aprobado (Verificado)</p><p><strong>Versión:</strong> {{ detalle()!.version }}</p><p><strong>Verificado por:</strong> {{ detalle()!.verificadoPor || 'Verificador' }}</p><p><strong>Fecha de aprobación:</strong> {{ detalle()!.fechaVerificacion | date:'dd/MM/yyyy HH:mm' }}</p></div>
              @if (detalle()!.observacionesGenerales) { <p class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"><strong>Observación registrada:</strong> {{ detalle()!.observacionesGenerales }}</p> }
              <div class="space-y-4">
                @for (pregunta of detalle()!.preguntas; track pregunta.numeroOriginal) {
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
                        <p class="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900 border border-amber-200">
                          <strong>Observación:</strong> {{ pregunta.observacion }}
                        </p>
                      }
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
                        <p class="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900 border border-amber-200">
                          <strong>Observación:</strong> {{ pregunta.observacion }}
                        </p>
                      }
                    </article>
                  }
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
  public readonly alternativasVfComplejas = [
    { letra: 'A', texto: '1, 2 y 3 son verdaderas' },
    { letra: 'B', texto: '1 y 3 son verdaderas' },
    { letra: 'C', texto: '2 y 4 son verdaderas' },
    { letra: 'D', texto: 'Solo 4 es verdadera' },
    { letra: 'E', texto: 'Todas son verdaderas' }
  ];

  public esTronco(pregunta: VerificacionExamenDetalle['preguntas'][number]): boolean {
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

  public numeroPreguntaVisible(pregunta: VerificacionExamenDetalle['preguntas'][number]): number | null {
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

  public etiquetaTipo(pregunta: VerificacionExamenDetalle['preguntas'][number]): string {
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

  public proposicionesVfComplejas(pregunta: VerificacionExamenDetalle['preguntas'][number]): { numero: number; texto: string }[] {
    const letras = ['A', 'B', 'C', 'D'];
    return letras.map((letra, index) => {
      const op = pregunta.opciones.find(o => o.letra?.toUpperCase() === letra);
      let texto = op?.texto || '';
      texto = texto.replace(/^\s*[1-4][\.\)\-\:\s]+\s*/, '').trim();
      return { numero: index + 1, texto };
    }).filter(p => p.texto.length > 0);
  }

  public esClaveVfCompleja(pregunta: VerificacionExamenDetalle['preguntas'][number], letra: string): boolean {
    return (pregunta.respuestaCorrecta || '').trim().toUpperCase() === letra.toUpperCase();
  }

  public opcionesPremisasAbcd(pregunta: VerificacionExamenDetalle['preguntas'][number]): { letra: string; texto: string; correcta: boolean }[] {
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

  public esOpcionCorrecta(pregunta: VerificacionExamenDetalle['preguntas'][number], opcion: VerificacionExamenDetalle['preguntas'][number]['opciones'][number]): boolean {
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
