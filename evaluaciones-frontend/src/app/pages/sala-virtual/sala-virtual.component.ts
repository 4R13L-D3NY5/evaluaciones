import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, interval } from 'rxjs';

interface Participante { codigoEstudiante: string; nombreEstudiante: string; estado: string; }
interface Sala { id: string; rolExamenId: string; codigoSala: string; estado: string; duracionMinutos: number; participantes: Participante[]; }
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
        <p class="mt-1 text-sm text-muted-foreground">Organiza el ingreso de estudiantes sin que necesiten iniciar sesión en el sistema.</p>
      </header>

      @if (!sala()) {
        <section class="max-w-xl rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 class="font-black text-foreground">{{ esCodigoSala() ? 'Consultar sala existente' : 'Crear sala desde un examen generado' }}</h2>
          <p class="mt-1 text-xs text-muted-foreground">{{ esCodigoSala() ? 'Ingresa el código de la sala ya generada para consultar su estado y participantes.' : 'El examen debe tener modalidad virtual, banco validado y variantes generadas.' }}</p>
          <label class="mt-5 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">{{ esCodigoSala() ? 'Código de sala' : 'ID del rol de examen' }}</label>
          <input [(ngModel)]="rolExamenId" placeholder="SALA-XXXXXX o ROL-GRUPO-1P-FECHA" class="mt-2 w-full rounded-xl border border-border bg-muted/50 px-3 py-3 text-sm font-mono uppercase outline-none focus:border-primary">
          <div class="mt-4 grid grid-cols-2 gap-3">
            <div><label class="block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Duración (minutos)</label><input [(ngModel)]="duracion" type="number" min="1" max="480" class="mt-2 w-full rounded-xl border border-border bg-muted/50 px-3 py-3 text-sm outline-none focus:border-primary"></div>
            <div><label class="block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Gracia de ingreso</label><input [(ngModel)]="gracia" type="number" min="0" max="60" class="mt-2 w-full rounded-xl border border-border bg-muted/50 px-3 py-3 text-sm outline-none focus:border-primary"></div>
          </div>
          @if (error()) { <div class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{{ error() }}</div> }
          <button (click)="crear()" [disabled]="cargando()" class="mt-5 rounded-xl bg-primary px-5 py-3 text-xs font-black text-white shadow hover:opacity-90 disabled:opacity-50">{{ cargando() ? (esCodigoSala() ? 'Consultando…' : 'Creando…') : (esCodigoSala() ? 'Consultar sala' : 'Crear sala y generar accesos') }}</button>
        </section>
      }

      @if (sala(); as actual) {
        <section class="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div><p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sala {{ actual.codigoSala }}</p><h2 class="text-xl font-black text-foreground">{{ actual.rolExamenId }}</h2><span class="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase text-indigo-700">{{ actual.estado }}</span></div>
            <div class="flex flex-wrap justify-end gap-2">
              @if (!tokenGrupo()) { <button (click)="emitirTokenGrupo()" [disabled]="cargando()" class="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white disabled:opacity-50">Generar acceso grupal</button> }
              @if (actual.estado === 'PREPARADA') { <button (click)="abrir()" class="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700">Abrir sala</button> }
              @if (actual.estado === 'ABIERTA') { <button (click)="iniciar()" class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white">Iniciar examen</button> }
              @if (['ABIERTA', 'EN_CURSO', 'PAUSADA', 'CERRADA', 'CALIFICADA'].includes(actual.estado)) { <button (click)="abrirRestablecimiento()" [disabled]="cargando()" class="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-black text-amber-800 disabled:opacity-50">Restablecer examen</button> }
              @if (actual.estado === 'EN_CURSO') { <button (click)="cerrar()" class="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white">Cerrar sala</button> }
            </div>
          </div>
          <div class="mt-6 grid gap-3 sm:grid-cols-3"><div class="rounded-xl bg-muted/50 p-4"><span class="text-[10px] font-black uppercase text-muted-foreground">Estudiantes</span><b class="mt-1 block text-2xl font-black">{{ actual.participantes.length }}</b></div><div class="rounded-xl bg-muted/50 p-4"><span class="text-[10px] font-black uppercase text-muted-foreground">En espera</span><b class="mt-1 block text-2xl font-black">{{ contar('EN_ESPERA') }}</b></div><div class="rounded-xl bg-muted/50 p-4"><span class="text-[10px] font-black uppercase text-muted-foreground">En curso</span><b class="mt-1 block text-2xl font-black">{{ contar('EN_CURSO') }}</b></div></div>
        </section>

        @if (tokenGrupo()) {
          <section class="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div><h2 class="font-black text-indigo-950">Acceso para todo el grupo</h2><p class="mt-1 max-w-2xl text-xs text-indigo-800">Comparte este token y el código de sala con todos los estudiantes. Cada uno debe ingresar también su código institucional; así el sistema lo vincula con su propio intento.</p></div>
              <button (click)="emitirTokenGrupo()" [disabled]="cargando()" class="rounded-xl border border-indigo-300 bg-white px-3 py-2 text-xs font-black text-indigo-700 disabled:opacity-50">Emitir otro token</button>
            </div>
            <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><div><label class="block text-[10px] font-black uppercase tracking-wide text-indigo-700">Token grupal</label><div class="mt-2 break-all rounded-xl border border-indigo-200 bg-white px-4 py-3 font-mono text-sm font-black text-indigo-950">{{ tokenGrupo() }}</div></div><button (click)="copiarTokenGrupo()" class="rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white hover:bg-indigo-700">Copiar token</button></div>
            <p class="mt-3 text-xs text-indigo-800">Acceso de estudiantes: <span class="font-mono font-bold">{{ urlAcceso() }}</span></p>
          </section>
        }

        @if (accesos().length) {
          <section class="rounded-2xl border border-amber-200 bg-amber-50 p-6"><div class="flex items-center justify-between"><div><h2 class="font-black text-amber-900">Tokens individuales</h2><p class="text-xs text-amber-800">Se conservan como alternativa. Para este grupo puedes compartir un solo token grupal.</p></div><button (click)="accesos.set([])" class="text-xs font-bold text-amber-800">Ocultar tokens</button></div><div class="mt-4 overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="border-b border-amber-200 text-[10px] uppercase text-amber-800"><th class="p-2">Estudiante</th><th class="p-2">Token</th></tr></thead><tbody>@for (acceso of accesos(); track acceso.codigoEstudiante) { <tr class="border-b border-amber-100"><td class="p-2 font-bold">{{ acceso.codigoEstudiante }} · {{ acceso.nombreEstudiante }}</td><td class="p-2 font-mono">{{ acceso.token }}</td></tr> }</tbody></table></div></section>
        }

        @if (['ABIERTA', 'EN_CURSO', 'PAUSADA', 'CERRADA', 'CALIFICADA'].includes(actual.estado)) { <p class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Si ocurre una interrupción, puedes restablecer el examen. Se conservarán las respuestas guardadas; los intentos podrán continuar cuando inicies nuevamente la sala.</p> }
        <section class="rounded-2xl border border-border bg-card p-6 shadow-xs"><h2 class="font-black text-foreground">Participantes</h2><div class="mt-4 overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="border-b border-border text-[10px] uppercase text-muted-foreground"><th class="p-2">Código</th><th class="p-2">Estudiante</th><th class="p-2">Estado</th></tr></thead><tbody>@for (participante of actual.participantes; track participante.codigoEstudiante) { <tr class="border-b border-border"><td class="p-2 font-mono font-bold">{{ participante.codigoEstudiante }}</td><td class="p-2">{{ participante.nombreEstudiante }}</td><td class="p-2"><span class="rounded-full bg-muted px-2 py-1 text-[10px] font-black">{{ participante.estado }}</span></td></tr> }</tbody></table></div></section>
      }

      @if (mostrarMotivoRestablecimiento()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div class="w-full max-w-md overflow-hidden rounded-2xl border border-amber-200 bg-card shadow-2xl">
            <div class="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-amber-700">Restablecimiento controlado</p>
                <h2 class="text-lg font-black text-foreground">Restablecer examen virtual</h2>
                <p class="text-xs text-muted-foreground">{{ sala()?.codigoSala }}</p>
              </div>
              <button (click)="cerrarRestablecimiento()" class="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div class="space-y-4 p-5 text-xs">
              <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 leading-relaxed text-amber-900">Se conservarán las respuestas guardadas y la acción quedará registrada en la bitácora.</div>
              <label class="block"><span class="font-black text-foreground">Motivo del restablecimiento</span><textarea [(ngModel)]="motivoRestablecimiento" rows="3" placeholder="Ej.: interrupción de internet durante el examen" class="mt-2 w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs outline-none focus:border-amber-500"></textarea></label>
            </div>
            <div class="flex justify-end gap-2 border-t border-border p-4">
              <button (click)="cerrarRestablecimiento()" class="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground">Cancelar</button>
              <button (click)="restablecer()" [disabled]="!motivoRestablecimiento.trim() || cargando()" class="rounded-xl bg-amber-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50">{{ cargando() ? 'Restableciendo…' : 'Confirmar restablecimiento' }}</button>
            </div>
          </div>
        </div>
      }
    </div>`
})
export class SalaVirtualComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  sala = signal<Sala | null>(null); accesos = signal<Acceso[]>([]); tokenGrupo = signal(''); cargando = signal(false); error = signal(''); mostrarMotivoRestablecimiento = signal(false);
  rolExamenId = ''; duracion = 90; gracia = 10; private monitoreo?: Subscription;
  motivoRestablecimiento = '';

  esCodigoSala(): boolean { return /^(SALA|SEA)-/i.test(this.rolExamenId.trim()); }
  urlAcceso(): string { return `${window.location.origin}/examen-virtual`; }

  crear(): void {
    if (this.esCodigoSala()) {
      this.ejecutar(this.http.get<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(this.rolExamenId.trim())}`), data => { this.sala.set(data); this.accesos.set([]); this.tokenGrupo.set(''); this.iniciarMonitoreo(); });
      return;
    }
    this.ejecutar(this.http.post<Creada>('/api/examenes-virtuales/salas', { rolExamenId: this.rolExamenId.trim(), duracionMinutos: this.duracion, graciaIngresoMinutos: this.gracia }), data => { this.sala.set(data.sala); this.accesos.set(data.accesos || []); this.tokenGrupo.set(data.tokenGrupo || ''); this.iniciarMonitoreo(); });
  }

  emitirTokenGrupo(): void {
    const id = this.sala()?.id;
    if (!id) return;
    if (this.tokenGrupo() && !confirm('Se emitirá un token nuevo y el anterior dejará de funcionar. ¿Deseas continuar?')) return;
    this.ejecutar(this.http.post<TokenGrupo>(`/api/examenes-virtuales/salas/${encodeURIComponent(id)}/token-grupo`, {}), data => this.tokenGrupo.set(data.tokenGrupo));
  }

  copiarTokenGrupo(): void { navigator.clipboard?.writeText(this.tokenGrupo()); }
  abrir(): void { this.cambiarEstado('abrir'); }
  iniciar(): void { this.cambiarEstado('iniciar'); }
  cerrar(): void { this.cambiarEstado('cerrar'); }
  abrirRestablecimiento(): void {
    if (!this.sala()) return;
    this.motivoRestablecimiento = '';
    this.mostrarMotivoRestablecimiento.set(true);
  }
  cerrarRestablecimiento(): void {
    if (this.cargando()) return;
    this.mostrarMotivoRestablecimiento.set(false);
    this.motivoRestablecimiento = '';
  }
  restablecer(): void {
    const id = this.sala()?.id;
    const motivo = this.motivoRestablecimiento.trim();
    if (!id || !motivo) return;
    this.ejecutar(this.http.post<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(id)}/restablecer`, { motivo }), data => {
      this.sala.set(data);
      this.mostrarMotivoRestablecimiento.set(false);
      this.motivoRestablecimiento = '';
    });
  }
  contar(estado: string): number { return this.sala()?.participantes.filter(p => p.estado === estado).length || 0; }
  private cambiarEstado(accion: string): void { const id = this.sala()?.id; if (!id) return; this.ejecutar(this.http.post<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(id)}/${accion}`, {}), data => { this.sala.set(data); if (accion === 'cerrar') this.detenerMonitoreo(); }); }
  private iniciarMonitoreo(): void { this.detenerMonitoreo(); this.monitoreo = interval(3000).subscribe(() => this.actualizarSala()); }
  private actualizarSala(): void { const id = this.sala()?.id; if (!id) return; this.http.get<Sala>(`/api/examenes-virtuales/salas/${encodeURIComponent(id)}`).subscribe({ next: data => { this.sala.set(data); if (['CERRADA', 'CALIFICADA', 'ANULADA'].includes(data.estado)) this.detenerMonitoreo(); } }); }
  private detenerMonitoreo(): void { this.monitoreo?.unsubscribe(); this.monitoreo = undefined; }
  private ejecutar<T>(request: Observable<T>, next: (data: T) => void): void { this.cargando.set(true); this.error.set(''); request.subscribe({ next: data => { this.cargando.set(false); next(data); }, error: err => { this.cargando.set(false); this.error.set(err?.error?.message || err?.error?.error || 'No se pudo completar la operación.'); } }); }
  ngOnDestroy(): void { this.detenerMonitoreo(); }
}
