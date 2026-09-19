import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, interval } from 'rxjs';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

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
          <section class="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 p-6 sm:p-7 shadow-lg shadow-indigo-100/50">
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100 pb-4">
              <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">Acceso Grupal Rápido</span>
                <h2 class="mt-2 text-lg font-black text-indigo-950">Datos de Ingreso para Proyectar en el Aula</h2>
                <p class="mt-1 max-w-2xl text-xs text-indigo-800/80">Proyecta estos datos en la pizarra o comparte el enlace directo. Cada estudiante ingresará con este PIN y su propio código de estudiante.</p>
              </div>
              <button (click)="emitirTokenGrupo()" [disabled]="cargando()" class="rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5 shadow-xs">
                <i class="pi pi-refresh text-xs"></i>
                <span>Generar otro PIN</span>
              </button>
            </div>

            <!-- PROJECTION CARDS: SALA & PIN -->
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl border border-indigo-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">1. Código de Sala</span>
                  <div class="mt-1 font-mono text-3xl sm:text-4xl font-black text-indigo-900 tracking-wider select-all">{{ actual.codigoSala }}</div>
                </div>
                <p class="mt-2 text-[11px] text-slate-500">Identificador único de la sala de evaluación.</p>
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

        @if (accesos().length) {
          <section class="rounded-2xl border border-amber-200 bg-amber-50 p-6"><div class="flex items-center justify-between"><div><h2 class="font-black text-amber-900">Tokens individuales</h2><p class="text-xs text-amber-800">Se conservan como alternativa. Para este grupo puedes compartir un solo token grupal.</p></div><button (click)="accesos.set([])" class="text-xs font-bold text-amber-800 cursor-pointer">Ocultar tokens</button></div><div class="mt-4 overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="border-b border-amber-200 text-[10px] uppercase text-amber-800"><th class="p-2">Estudiante</th><th class="p-2">Token</th></tr></thead><tbody>@for (acceso of accesos(); track acceso.codigoEstudiante) { <tr class="border-b border-amber-100"><td class="p-2 font-bold">{{ acceso.codigoEstudiante }} · {{ acceso.nombreEstudiante }}</td><td class="p-2 font-mono">{{ acceso.token }}</td></tr> }</tbody></table></div></section>
        }

        @if (['ABIERTA', 'EN_CURSO', 'PAUSADA', 'CERRADA', 'CALIFICADA'].includes(actual.estado)) { <p class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Si ocurre una interrupción, puedes restablecer el examen. Se conservarán las respuestas guardadas; los intentos podrán continuar cuando inicies nuevamente la sala.</p> }
        <section class="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-black text-foreground">Participantes y Estados</h2>
            <span class="text-xs text-muted-foreground font-semibold">{{ actual.participantes.length }} registrados</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th class="p-2.5">Código</th>
                  <th class="p-2.5">Estudiante</th>
                  <th class="p-2.5 text-center">Estado del Intento</th>
                </tr>
              </thead>
              <tbody>
                @for (participante of actual.participantes; track participante.codigoEstudiante) { 
                  <tr class="border-b border-border/60 hover:bg-muted/30 transition">
                    <td class="p-2.5 font-mono font-bold text-foreground">{{ participante.codigoEstudiante }}</td>
                    <td class="p-2.5 font-medium text-foreground">{{ participante.nombreEstudiante }}</td>
                    <td class="p-2.5 text-center">
                      <span class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase border"
                            [ngClass]="{
                              'bg-amber-50 text-amber-800 border-amber-200': participante.estado === 'EN_ESPERA',
                              'bg-indigo-50 text-indigo-700 border-indigo-200': participante.estado === 'EN_CURSO',
                              'bg-emerald-50 text-emerald-700 border-emerald-200': ['CALIFICADO', 'ENVIADO'].includes(participante.estado),
                              'bg-rose-50 text-rose-700 border-rose-200': participante.estado === 'ANULADO',
                              'bg-muted text-muted-foreground border-border': !['EN_ESPERA', 'EN_CURSO', 'CALIFICADO', 'ENVIADO', 'ANULADO'].includes(participante.estado)
                            }">
                        {{ participante.estado }}
                      </span>
                    </td>
                  </tr> 
                }
              </tbody>
            </table>
          </div>
        </section>
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
  private readonly feedback = inject(UiFeedbackService);
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

  async emitirTokenGrupo(): Promise<void> {
    const id = this.sala()?.id;
    if (!id) return;
    if (this.tokenGrupo() && !await this.feedback.confirmar(
      'Se emitirá un token nuevo y el anterior dejará de funcionar. ¿Deseas continuar?',
      'Renovar token grupal',
      'warning',
      'Renovar token'
    )) return;
    this.ejecutar(this.http.post<TokenGrupo>(`/api/examenes-virtuales/salas/${encodeURIComponent(id)}/token-grupo`, {}), data => this.tokenGrupo.set(data.tokenGrupo));
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
    const portalUrl = 'https://planificacion.unitepc.edu.bo/';
    const directUrl = `https://planificacion.unitepc.edu.bo/examen-virtual?sala=${encodeURIComponent(codigoSala)}&pin=${encodeURIComponent(pin)}`;

    const lineas = [
      '📋 *EVALUACIÓN VIRTUAL · UNITEPC*',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      sala?.duracionMinutos ? `⏱️ *Duración:* ${sala.duracionMinutos} minutos` : null,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '🔑 *DATOS DE INGRESO:*',
      `• *Código de Sala:* ${codigoSala}`,
      `• *PIN / Token Grupal:* ${pin}`,
      '',
      '🌐 *Enlace directo al examen:*',
      directUrl,
      '',
      '🌐 *Portal institucional:*',
      portalUrl,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'ℹ️ *Instrucciones para el estudiante:*',
      '1. Ingresa al enlace institucional ' + portalUrl + ' o al enlace directo.',
      '2. Introduce tu código de estudiante y verifica la sala y PIN.',
      '3. Espera a que el docente inicie la evaluación.'
    ].filter(Boolean).join('\n');

    if (navigator.clipboard && lineas) {
      navigator.clipboard.writeText(lineas);
      this.feedback.mostrar('Información completa para estudiantes copiada al portapapeles', 'Copiado', 'success');
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
