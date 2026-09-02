import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  iniciadaEn?: string;
  terminaEn?: string;
  cuentaRegresivaSegundos?: number;
  tiempoRestanteSegundos?: number;
  preguntas: PreguntaVirtual[];
}

@Component({
  selector: 'sea-examen-virtual', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <main class="min-h-screen bg-slate-50 px-4 py-8 text-slate-900"><div class="mx-auto max-w-4xl">
      <header class="mb-6 flex items-center gap-3"><div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg"><i class="pi pi-check-square text-xl"></i></div><div><p class="text-[10px] font-black uppercase tracking-[.2em] text-indigo-600">UNITEPC · Sistema de Evaluaciones</p><h1 class="text-2xl font-black">Examen virtual</h1></div></header>
      @if (vista() === 'acceso') { <section class="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><h2 class="text-lg font-black">Ingresar a la evaluación</h2><p class="mt-1 text-sm text-slate-500">Utiliza el código de sala, tu código de estudiante y el token compartido por tu docente.</p><label class="mt-6 block text-xs font-black uppercase tracking-wide">Código de sala</label><input [(ngModel)]="codigoSala" placeholder="SALA-XXXXXX" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold uppercase outline-none focus:border-indigo-500"><label class="mt-4 block text-xs font-black uppercase tracking-wide">Código de estudiante</label><input [(ngModel)]="codigoEstudiante" placeholder="Código institucional" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"><label class="mt-4 block text-xs font-black uppercase tracking-wide">Token de acceso</label><input [(ngModel)]="token" type="password" placeholder="Token individual o grupal" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"><p class="mt-2 text-xs text-slate-500">Si tu docente entregó un token grupal, todos usan el mismo token y su propio código de estudiante.</p>@if (error()) { <div class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{{ error() }}</div> }<button (click)="ingresar()" [disabled]="cargando()" class="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-black text-white shadow hover:bg-indigo-700 disabled:opacity-50">{{ cargando() ? 'Validando…' : 'Ingresar a la sala' }}</button></section> }
      @if (vista() === 'espera') { <section class="mx-auto max-w-lg rounded-2xl border border-indigo-100 bg-white p-8 text-center shadow-sm"><i class="pi pi-clock text-4xl text-indigo-600"></i><h2 class="mt-4 text-xl font-black">Estás en la sala de espera</h2><p class="mt-2 text-sm text-slate-500">{{ acceso()?.nombreEstudiante }}. El docente debe iniciar el examen. Esta página se actualizará automáticamente.</p><div class="mt-6 rounded-xl bg-indigo-50 p-4 text-left text-sm"><b>Sala:</b> {{ acceso()?.codigoSala }}<br><b>Estado:</b> Esperando inicio</div></section> }
      @if (vista() === 'preinicio' && acceso(); as examen) { <section class="mx-auto max-w-lg rounded-2xl border border-indigo-200 bg-white p-8 text-center shadow-sm"><div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700"><i class="pi pi-hourglass text-3xl"></i></div><p class="mt-5 text-xs font-black uppercase tracking-widest text-indigo-600">El examen comenzará en</p><div class="mt-2 font-mono text-6xl font-black tabular-nums text-indigo-700">{{ cuentaRegresiva() }}</div><h2 class="mt-4 text-xl font-black">Prepárate para comenzar</h2><p class="mt-2 text-sm leading-6 text-slate-500">El docente ya inició la evaluación. Cuando termine el conteo aparecerán las instrucciones y las preguntas de tu variante.</p><div class="mt-5 rounded-xl bg-indigo-50 p-3 text-left text-xs text-indigo-800"><b>Estudiante:</b> {{ examen.nombreEstudiante }}<br><b>Sala:</b> {{ examen.codigoSala }}</div></section> }
      @if (vista() === 'examen' && acceso(); as examen) { <section class="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="border-b border-slate-200 bg-slate-50 px-5 py-5 text-center"><p class="text-[10px] font-black uppercase tracking-[.18em] text-indigo-600">{{ examen.institucionNombre || 'UNIVERSIDAD TÉCNICA PRIVADA COSMOS' }}</p><h1 class="mt-1 text-lg font-black uppercase text-slate-900">{{ examen.carreraNombre || 'Examen virtual' }}</h1><p class="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Sede {{ examen.sedeNombre || '—' }}</p><p class="mt-3 text-sm font-black uppercase text-indigo-700">{{ examen.tipoParcial || 'Evaluación' }}</p></div><div class="grid gap-3 border-b border-slate-200 px-5 py-4 text-xs sm:grid-cols-4"><div><span class="block text-[10px] font-black uppercase tracking-wide text-slate-400">Asignatura</span><b class="text-slate-800">{{ examen.materiaCodigo }} · {{ examen.materiaNombre }}</b></div><div><span class="block text-[10px] font-black uppercase tracking-wide text-slate-400">Grupo y docente</span><b class="text-slate-800">{{ examen.grupo || '—' }} · {{ examen.docenteNombre || '—' }}</b></div><div><span class="block text-[10px] font-black uppercase tracking-wide text-slate-400">Fecha y modalidad</span><b class="text-slate-800">{{ examen.fecha || '—' }} · {{ examen.modalidad === 'VIRTUAL' ? 'Virtual' : (examen.modalidad || '—') }}</b></div><div><span class="block text-[10px] font-black uppercase tracking-wide text-slate-400">Horario y aula</span><b class="text-slate-800">{{ examen.horario || '—' }} · {{ examen.aula || '—' }}</b></div></div><div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p class="text-xs font-black uppercase tracking-wide text-indigo-600">{{ examen.codigoSala }}</p><h2 class="text-lg font-black text-slate-900">{{ examen.nombreEstudiante }}</h2><p class="text-xs text-slate-500">Código: {{ examen.codigoEstudiante }}</p></div><div class="rounded-xl bg-rose-50 px-4 py-2 text-center text-rose-700"><span class="block text-[10px] font-black uppercase">Tiempo restante</span><b class="font-mono text-xl">{{ tiempoRestante() }}</b></div></div></section><section class="space-y-6">@for (seccion of secciones(); track seccion.codigo + '-' + $index) { <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><header class="border-b border-slate-200 bg-slate-50 px-5 py-4"><p class="text-[10px] font-black uppercase tracking-widest text-indigo-600">Sección {{ $index + 1 }}</p><h2 class="mt-1 text-base font-black text-slate-900">{{ seccion.titulo }}</h2><div class="mt-2 space-y-1">@for (instruccion of seccion.instrucciones; track instruccion) { <p class="text-xs leading-5 text-slate-600">{{ instruccion }}</p> }</div></header>@if (seccion.contexto; as contexto) { <div class="mx-5 mt-5 rounded-xl border border-slate-400 bg-slate-50 p-4"><p class="text-sm font-black uppercase text-slate-800">{{ contexto.titulo }}</p>@if (contexto.enunciado) { <p class="mt-2 text-sm font-semibold leading-6 text-slate-800">{{ contexto.enunciado }}</p> }@if (contexto.opciones.length) { <div class="mt-3 space-y-1">@for (opcion of contexto.opciones; track opcion.letra) { <p class="text-sm text-slate-700"><b>{{ opcion.letra }})</b> {{ opcion.texto }}</p> }</div> }</div> }<div class="space-y-4 p-5">@for (pregunta of seccion.preguntas; track pregunta.numeroPregunta) { <article class="rounded-xl border border-slate-200 p-4"><div class="flex gap-3"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 font-black text-indigo-700">{{ pregunta.numeroPregunta }}</span><div class="min-w-0 flex-1"><p class="font-semibold leading-6 text-slate-900">{{ pregunta.enunciado }}</p>@if (pregunta.imagenBase64) { <div class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2"><img [src]="imagenBase64SinMetadatos(pregunta.imagenBase64)" alt="Imagen de apoyo de la pregunta" loading="lazy" class="mx-auto max-w-full object-contain" [style.max-height.%]="alturaImagenPregunta(pregunta.imagenBase64)"></div> }</div></div>@if (pregunta.tipoReactivo === 'VERDADERO_O_FALSO_COMPLEJAS') { <div class="mt-4 space-y-2">@for (afirmacion of pregunta.opciones; let indice = $index; track afirmacion.letra) { <div class="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-800"><b>{{ indice + 1 }})</b> {{ afirmacion.texto }}</div> }</div> }<div class="mt-4 grid gap-2" [ngClass]="claseOpciones(pregunta)">@for (opcion of opcionesParaResponder(pregunta); track opcion.letra) { <label class="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300" [class.justify-center]="esGrupoCompacto(pregunta)" [class.px-2]="esGrupoCompacto(pregunta)" [class.py-2]="esGrupoCompacto(pregunta)" [attr.title]="esGrupoCompacto(pregunta) ? opcion.texto : null" [class.border-indigo-500]="respuestas[pregunta.numeroPregunta] === opcion.letra" [class.bg-indigo-50]="respuestas[pregunta.numeroPregunta] === opcion.letra"><input type="radio" [name]="'pregunta-' + pregunta.numeroPregunta" [value]="opcion.letra" [checked]="respuestas[pregunta.numeroPregunta] === opcion.letra" (change)="responder(pregunta, opcion.letra)" [class.sr-only]="esGrupoCompacto(pregunta)" class="accent-indigo-600"><span class="text-center text-xs leading-4"><b>{{ opcion.letra }})</b>@if (!esGrupoCompacto(pregunta)) { {{ opcion.texto }} }</span></label> }</div></article> }</div></section> }</section><div class="sticky bottom-4 mt-6 flex justify-end"><button (click)="enviar()" class="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white shadow-lg hover:bg-emerald-700">Finalizar examen</button></div> }
      @if (vista() === 'finalizado') { <section class="mx-auto max-w-lg rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm"><i class="pi pi-check-circle text-5xl text-emerald-600"></i><h2 class="mt-4 text-xl font-black">Examen enviado</h2><p class="mt-2 text-sm text-slate-500">Tu intento fue registrado correctamente.</p></section> }
    </div></main>`
})
export class ExamenVirtualComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  vista = signal<'acceso' | 'espera' | 'preinicio' | 'examen' | 'finalizado'>('acceso');
  acceso = signal<AccesoVirtual | null>(null); secciones = signal<SeccionVirtual[]>([]); cargando = signal(false); error = signal('');
  codigoSala = ''; codigoEstudiante = ''; token = ''; respuestas: Record<number, string> = {};
  private polling?: ReturnType<typeof setInterval>; private reloj?: ReturnType<typeof setInterval>; private cuenta?: ReturnType<typeof setInterval>;
  private segundos = 0; private segundosInicio = 0;

  ingresar(): void {
    this.error.set(''); this.cargando.set(true);
    this.http.post<AccesoVirtual>('/api/acceso-virtual/validar', { codigoSala: this.codigoSala.trim(), codigoEstudiante: this.codigoEstudiante.trim(), token: this.token.trim() }).subscribe({
      next: data => { this.cargando.set(false); this.actualizarVista(data); },
      error: err => { this.cargando.set(false); this.error.set(err?.error?.error || err?.error?.message || 'No se pudo validar el acceso.'); }
    });
  }

  responder(pregunta: PreguntaVirtual, respuesta: string): void {
    this.respuestas[pregunta.numeroPregunta] = respuesta;
    const headers = new HttpHeaders({ 'X-Examen-Token': this.acceso()?.tokenSesion || this.token });
    this.http.put('/api/examen-virtual/respuestas', { numeroPregunta: pregunta.numeroPregunta, reactivoId: pregunta.reactivoId, respuesta }, { headers }).subscribe({ error: () => this.error.set('No se pudo guardar la última respuesta.') });
  }

  enviar(confirmar = true): void {
    if (confirmar && !confirm('¿Deseas finalizar y enviar el examen?')) return;
    const headers = new HttpHeaders({ 'X-Examen-Token': this.acceso()?.tokenSesion || this.token });
    this.http.post('/api/examen-virtual/enviar', {}, { headers }).subscribe({ next: () => { this.detener(); this.vista.set('finalizado'); }, error: err => this.error.set(err?.error?.error || err?.error?.message || 'No se pudo enviar el examen.') });
  }

  tiempoRestante(): string { return `${Math.floor(this.segundos / 60).toString().padStart(2, '0')}:${(this.segundos % 60).toString().padStart(2, '0')}`; }
  cuentaRegresiva(): string { return `${this.segundosInicio}`.padStart(2, '0'); }
  imagenBase64SinMetadatos(imagen?: string): string { return (imagen || '').split('#', 1)[0]; }
  alturaImagenPregunta(imagen?: string): number {
    const tamano = imagen?.match(/#sea-size=(GRANDE|MEDIANA|PEQUENA|MUY_PEQUENA)$/i)?.[1]?.toUpperCase();
    return tamano === 'GRANDE' ? 58 : tamano === 'MUY_PEQUENA' ? 15 : tamano === 'PEQUENA' ? 24 : 36;
  }

  private actualizarVista(data: AccesoVirtual): void {
    this.acceso.set(data);
    if (data.estadoSala === 'EN_CURSO') {
      const restante = this.obtenerCuentaRegresiva(data);
      if (restante > 0 || !data.preguntas?.length) {
        this.vista.set('preinicio');
        if (!this.cuenta) this.iniciarCuentaRegresiva(restante);
        else this.segundosInicio = restante;
        if (!this.polling) this.polling = setInterval(() => this.recargar(), 3000);
        return;
      }
      this.detenerCuentaRegresiva(); this.detenerPolling(); this.secciones.set(this.organizarSecciones(data.preguntas || [])); this.vista.set('examen'); this.iniciarReloj(data.tiempoRestanteSegundos); return;
    }
    this.detenerCuentaRegresiva(); this.vista.set('espera'); if (!this.polling) this.polling = setInterval(() => this.recargar(), 3000);
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
    this.http.get<AccesoVirtual>('/api/examen-virtual/actual', { headers }).subscribe({ next: data => this.actualizarVista(data), error: err => this.error.set(err?.error?.error || 'Se perdió la conexión con la sala.') });
  }

  private iniciarReloj(segundosIniciales?: number): void { this.detenerReloj(); this.segundos = Math.max(0, Math.ceil(segundosIniciales || 0)); if (!this.segundos) return; this.reloj = setInterval(() => { this.segundos = Math.max(0, this.segundos - 1); if (!this.segundos) this.enviar(false); }, 1000); }
  private organizarSecciones(preguntas: PreguntaVirtual[]): SeccionVirtual[] {
    const secciones: SeccionVirtual[] = [];
    for (const pregunta of preguntas) {
      const codigo = this.codigoSeccion(pregunta.tipoReactivo);
      let seccion = secciones[secciones.length - 1];
      if (!seccion || seccion.codigo !== codigo) { const meta = this.metaSeccion(codigo); seccion = { codigo, titulo: meta.titulo, instrucciones: meta.instrucciones, preguntas: [] }; secciones.push(seccion); }
      if (pregunta.tipoReactivo === 'EMPAREJAMIENTO_TRONCO') {
        const titulo = 'Relacione el concepto con su definición correcta:';
        seccion.contexto = { titulo, enunciado: this.enunciadoContexto(pregunta.enunciado, titulo), opciones: pregunta.opciones || [] };
      } else if (pregunta.tipoReactivo === 'CASO_CLINICO_TRONCO') {
        seccion.contexto = { titulo: 'Caso clínico o problema:', enunciado: pregunta.enunciado || 'Resuelva el caso planteado y responda cada pregunta del grupo.', opciones: [] };
      } else {
        if (codigo === 'SUBITEM_CASO' && !seccion.contexto) seccion.contexto = { titulo: 'Caso clínico o problema:', enunciado: 'Resuelva el caso planteado y responda cada pregunta del grupo.', opciones: [] };
        if (codigo === 'OPCION_EMPAREJAMIENTO' && !seccion.contexto) seccion.contexto = { titulo: 'Relacione el concepto con su definición correcta:', enunciado: '', opciones: ['A', 'B', 'C', 'D', 'E'].map(letra => ({ letra, texto: '...' })) };
        if (codigo === 'OPCION_EMPAREJAMIENTO') pregunta.opcionesRespuesta = seccion.contexto?.opciones || [];
        seccion.preguntas.push(pregunta);
      }
    }
    return secciones;
  }

  private codigoSeccion(tipo: string): string { return ['EMPAREJAMIENTO_TRONCO', 'OPCION_EMPAREJAMIENTO'].includes(tipo) ? 'OPCION_EMPAREJAMIENTO' : ['CASO_CLINICO_TRONCO', 'SUBITEM_CASO'].includes(tipo) ? 'SUBITEM_CASO' : tipo; }
  opcionesParaResponder(pregunta: PreguntaVirtual): OpcionVirtual[] {
    if (pregunta.tipoReactivo === 'VERDADERO_O_FALSO_COMPLEJAS') return [
      { letra: 'A', texto: '1, 2 y 3 son verdaderas.' },
      { letra: 'B', texto: '1 y 3 son verdaderas.' },
      { letra: 'C', texto: '2 y 4 son verdaderas.' },
      { letra: 'D', texto: 'Solo 4 es verdadera.' },
      { letra: 'E', texto: 'Todas son verdaderas.' }
    ];
    return pregunta.opcionesRespuesta?.length ? pregunta.opcionesRespuesta : pregunta.opciones;
  }
  esGrupoCompacto(pregunta: PreguntaVirtual): boolean { return ['VERDADERO_O_FALSO_COMPLEJAS', 'OPCION_EMPAREJAMIENTO'].includes(pregunta.tipoReactivo); }
  claseOpciones(pregunta: PreguntaVirtual): string { return this.esGrupoCompacto(pregunta) ? 'grid-cols-5' : 'grid-cols-1 sm:grid-cols-2'; }
  private enunciadoContexto(enunciado: string, titulo: string): string { return this.normalizarTexto(enunciado) === this.normalizarTexto(titulo) ? '' : enunciado; }
  private normalizarTexto(texto: string): string { return (texto || '').replace(/[:\s]+$/g, '').trim().toLowerCase(); }
  private metaSeccion(codigo: string): { titulo: string; instrucciones: string[] } {
    const metas: Record<string, { titulo: string; instrucciones: string[] }> = {
      SELECCION_MEJOR_RESPUESTA: { titulo: 'Selección de la mejor respuesta', instrucciones: ['INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.'] },
      VERDADERO_O_FALSO_SIMPLE: { titulo: 'Verdadero o falso simple', instrucciones: ['INSTRUCCIONES: Marque la respuesta correcta.'] },
      RESPUESTA_PREMISAS_ABCD: { titulo: 'Respuesta A / B / Ambas / Ninguna', instrucciones: ['INSTRUCCIONES: Las siguientes preguntas están compuestas por dos premisas.', 'Responda con:', 'A: Si solo la primera premisa es verdadera.', 'B: Si solo la segunda premisa es verdadera.', 'C: Si ambas premisas son verdaderas.', 'D: Si ninguna premisa es verdadera.'] },
      VERDADERO_O_FALSO_COMPLEJAS: { titulo: 'Verdadero o falso complejas', instrucciones: ['INSTRUCCIONES: Seleccione la opción correcta de acuerdo con la siguiente clave:', 'A: 1, 2 y 3 son verdaderas.', 'B: 1 y 3 son verdaderas.', 'C: 2 y 4 son verdaderas.', 'D: Solo 4 es verdadera.', 'E: Todas son verdaderas.'] },
      SUBITEM_CASO: { titulo: 'Ítems agrupados por caso clínico o problema', instrucciones: ['INSTRUCCIONES: El siguiente caso clínico o problema tendrá varias preguntas.', 'Seleccione la respuesta correcta en cada una.'] },
      OPCION_EMPAREJAMIENTO: { titulo: 'Emparejamiento ampliado', instrucciones: ['INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta', 'para cada enunciado.'] }
    };
    return metas[codigo] || { titulo: 'Preguntas del examen', instrucciones: [] };
  }

  private detenerPolling(): void { if (this.polling) { clearInterval(this.polling); this.polling = undefined; } }
  private detenerCuentaRegresiva(): void { if (this.cuenta) { clearInterval(this.cuenta); this.cuenta = undefined; } }
  private detenerReloj(): void { if (this.reloj) { clearInterval(this.reloj); this.reloj = undefined; } }
  private detener(): void { this.detenerPolling(); this.detenerCuentaRegresiva(); this.detenerReloj(); }
  ngOnDestroy(): void { this.detener(); }
}
