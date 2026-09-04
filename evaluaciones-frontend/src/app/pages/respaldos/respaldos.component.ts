import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RespaldosService, ConfiguracionRespaldos, Respaldo } from '../../core/services/respaldos.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

@Component({
  selector: 'sea-respaldos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center"><i class="pi pi-cloud-upload text-lg"></i></div>
            <div><span class="text-[10px] font-extrabold uppercase tracking-widest text-primary">CONTINGENCIA · ADMINISTRACIÓN</span><h2 class="text-2xl font-black tracking-tight text-foreground">Respaldos y contingencia</h2></div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">Protege la base de datos, archivos generados y escaneos con snapshots cifrados y verificables.</p>
        </div>
        <button (click)="generar()" [disabled]="cargando()" class="bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2"><i class="pi pi-plus-circle"></i> Generar respaldo ahora</button>
      </header>

      @if (error()) { <div class="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-2"><i class="pi pi-exclamation-triangle"></i>{{ error() }}</div> }
      @if (mensaje()) { <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2"><i class="pi pi-check-circle"></i>{{ mensaje() }}</div> }

      @if (config()) {
        <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <article class="bg-card border border-border rounded-2xl p-5 shadow-xs"><span class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Último respaldo</span><strong class="block mt-2 text-xl font-black text-foreground">{{ ultimoEstado() }}</strong><span class="text-[11px] text-muted-foreground">{{ ultimoFecha() }}</span></article>
          <article class="bg-card border border-border rounded-2xl p-5 shadow-xs"><span class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Almacenamiento local</span><strong class="block mt-2 text-xl font-black" [class.text-emerald-600]="localDisponible()" [class.text-amber-600]="!localDisponible()">{{ localDisponible() ? 'Disponible' : 'Sin copia' }}</strong><span class="text-[11px] text-muted-foreground truncate block" [title]="config()?.repositorioLocalConfigurado">{{ config()?.repositorioLocalConfigurado }}</span></article>
          <article class="bg-card border border-border rounded-2xl p-5 shadow-xs"><span class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Copia externa</span><strong class="block mt-2 text-xl font-black" [class.text-emerald-600]="tieneCopiaVerificada()" [class.text-amber-600]="!tieneCopiaVerificada()">{{ tieneCopiaVerificada() ? 'Verificada' : 'Pendiente' }}</strong><span class="text-[11px] text-muted-foreground truncate block" [title]="config()?.destinoExternoConfigurado">{{ config()?.destinoExternoConfigurado }}</span></article>
          <article class="bg-card border border-border rounded-2xl p-5 shadow-xs"><span class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Próxima ejecución</span><strong class="block mt-2 text-xl font-black text-foreground">{{ config()?.proximaEjecucion ? (config()?.proximaEjecucion | date:'dd/MM HH:mm') : 'Al activar' }}</strong><span class="text-[11px] text-muted-foreground">Destino configurado en despliegue</span></article>
        </section>

        <section class="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-4"><div><h3 class="text-sm font-black text-foreground">Programación y retención</h3><p class="text-xs text-muted-foreground mt-1">La carpeta externa se configura en Docker y se muestra solo como información.</p></div><span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full" [class]="config()?.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'">{{ config()?.activo ? 'Automático activo' : 'Automático desactivado' }}</span></div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"><label class="flex items-center gap-2 text-xs font-bold text-foreground"><input type="checkbox" [(ngModel)]="configForm.activo" class="h-4 w-4 accent-purple-700"> Ejecutar automáticamente</label><label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Frecuencia (minutos)<input type="number" min="1" [(ngModel)]="configForm.frecuenciaMinutos" class="mt-1 w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground"></label><label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Retención (días)<input type="number" min="1" [(ngModel)]="configForm.retencionDias" class="mt-1 w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground"></label></div>
          <div class="flex justify-end"><button (click)="guardarConfiguracion()" [disabled]="cargando()" class="bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-4 rounded-xl"><i class="pi pi-save mr-2"></i>Guardar configuración</button></div>
        </section>

        <section class="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex gap-3"><i class="pi pi-info-circle text-blue-700 mt-0.5"></i><div><strong>Importante sobre Vault:</strong> estos respaldos incluyen la base y los archivos, pero no incluyen llaves de desbloqueo, tokens ni secretos. Para recuperar bancos cifrados también se necesita el respaldo técnico de Vault y su procedimiento de recuperación.</div></section>

        <section class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden"><div class="p-5 border-b border-border"><h3 class="text-sm font-black text-foreground">Historial de respaldos</h3><p class="text-xs text-muted-foreground mt-1">La copia externa y la verificación son pasos independientes y trazables.</p></div><div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground"><th class="p-3.5">Identificador</th><th class="p-3.5">Solicitado</th><th class="p-3.5">Estado</th><th class="p-3.5">Contenido</th><th class="p-3.5 text-right">Acciones</th></tr></thead><tbody class="divide-y divide-border">@for (item of respaldos(); track item.id) {<tr class="hover:bg-muted/20"><td class="p-3.5"><strong class="font-mono text-[11px] text-foreground">{{ item.id }}</strong><span class="block text-[10px] text-muted-foreground">{{ item.solicitadoPor }}</span></td><td class="p-3.5 font-mono text-[11px]">{{ item.solicitadoEn | date:'dd/MM/yyyy HH:mm' }}</td><td class="p-3.5"><span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase" [class]="claseEstado(item.estado)">{{ etiquetaEstado(item.estado) }}</span>@if (item.errorMensaje) {<span class="block max-w-xs text-[10px] text-rose-600 mt-1">{{ item.errorMensaje }}</span>}</td><td class="p-3.5 text-muted-foreground">{{ item.archivosCount || '—' }} archivos<span class="block text-[10px]">{{ item.tamanoBytes ? (item.tamanoBytes | number) + ' bytes' : 'DB + storage' }}</span></td><td class="p-3.5"><div class="flex justify-end gap-1.5"><button (click)="copiar(item)" [disabled]="!puedeCopiar(item) || cargando()" title="Copiar al destino externo" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-primary disabled:opacity-40"><i class="pi pi-cloud-upload text-xs"></i></button><button (click)="verificar(item)" [disabled]="!puedeVerificar(item) || cargando()" title="Verificar integridad" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-emerald-600 disabled:opacity-40"><i class="pi pi-verified text-xs"></i></button><button (click)="eliminar(item)" [disabled]="item.estado !== 'VERIFICADO' || cargando()" title="Eliminar copia local (requiere verificación externa)" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-rose-600 disabled:opacity-40"><i class="pi pi-trash text-xs"></i></button><button (click)="abrirRestauracion(item)" [disabled]="item.estado !== 'VERIFICADO' || cargando()" title="Restaurar respaldo verificado" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-purple-700 disabled:opacity-40"><i class="pi pi-history text-xs"></i></button></div></td></tr>} @empty {<tr><td colspan="5" class="p-10 text-center text-xs text-muted-foreground">Todavía no hay respaldos registrados.</td></tr>}</tbody></table></div></section>
      }

      @if (restaurarItem()) {<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div class="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"><div class="p-5 border-b border-border flex items-start justify-between"><div><span class="text-[10px] uppercase tracking-wider font-extrabold text-rose-600">Operación crítica</span><h3 class="text-base font-black text-foreground mt-1">Restaurar respaldo</h3></div><button (click)="cerrarRestauracion()" class="text-muted-foreground hover:text-foreground"><i class="pi pi-times"></i></button></div><div class="p-5 space-y-4"><p class="text-xs text-muted-foreground">Esta operación reemplazará la base de datos y los archivos actuales. Escribe exactamente el texto siguiente para continuar:</p><code class="block p-3 rounded-xl bg-muted border border-border text-xs font-mono font-black text-foreground break-all">RESTAURAR {{ restaurarItem()?.id }}</code><input [(ngModel)]="confirmacion" class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground" placeholder="RESTAURAR BKP-..."><div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">La segunda confirmación se solicitará antes de enviar la restauración.</div></div><div class="p-4 bg-muted/30 border-t border-border flex justify-end gap-2"><button (click)="cerrarRestauracion()" class="px-4 py-2 border border-border rounded-xl text-xs font-bold text-muted-foreground">Cancelar</button><button (click)="confirmarRestauracion()" [disabled]="confirmacion !== 'RESTAURAR ' + restaurarItem()?.id || cargando()" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold">Confirmar restauración</button></div></div></div>}
    </div>
  `
})
export class RespaldosComponent implements OnInit {
  private readonly service = inject(RespaldosService);
  private readonly feedback = inject(UiFeedbackService);
  public readonly config = signal<ConfiguracionRespaldos | null>(null);
  public readonly respaldos = signal<Respaldo[]>([]);
  public readonly cargando = signal(false);
  public readonly error = signal('');
  public readonly mensaje = signal('');
  public readonly restaurarItem = signal<Respaldo | null>(null);
  public confirmacion = '';
  public configForm = { activo: false, frecuenciaMinutos: 1440, retencionDias: 30 };

  public ngOnInit(): void { this.cargar(); }
  public cargar(): void { this.service.obtenerConfiguracion().subscribe({ next: value => { this.config.set(value); this.configForm = { activo: value.activo, frecuenciaMinutos: value.frecuenciaMinutos, retencionDias: value.retencionDias }; }, error: error => this.mostrarError(error) }); this.service.listar().subscribe({ next: value => this.respaldos.set(value), error: error => this.mostrarError(error) }); }
  public guardarConfiguracion(): void { this.ejecutar(this.service.actualizarConfiguracion(this.configForm), 'Configuración actualizada.'); }
  public generar(): void { this.ejecutar(this.service.generar(), 'Respaldo encolado para generación.'); }
  public copiar(item: Respaldo): void { this.ejecutar(this.service.copiarExterno(item.id), 'Copia externa encolada.'); }
  public verificar(item: Respaldo): void { this.ejecutar(this.service.verificar(item.id), 'Verificación encolada.'); }
  public async eliminar(item: Respaldo): Promise<void> {
    if (await this.feedback.confirmar('¿Eliminar la copia local? La copia externa ya fue verificada.', 'Eliminar copia local', 'warning', 'Eliminar')) {
      this.ejecutar(this.service.eliminarLocal(item.id), 'Eliminación local encolada.');
    }
  }
  public async abrirRestauracion(item: Respaldo): Promise<void> {
    if (await this.feedback.confirmar('La restauración reemplazará la información actual. ¿Deseas continuar con la primera confirmación?', 'Restaurar respaldo', 'error', 'Continuar')) {
      this.confirmacion = '';
      this.restaurarItem.set(item);
    }
  }
  public cerrarRestauracion(): void { this.restaurarItem.set(null); this.confirmacion = ''; }
  public async confirmarRestauracion(): Promise<void> {
    const item = this.restaurarItem();
    if (!item || !await this.feedback.confirmar(`Confirmación final: restaurar ${item.id}. ¿Deseas ejecutar la restauración?`, 'Confirmar restauración', 'error', 'Restaurar ahora')) return;
    this.ejecutar(this.service.restaurar(item.id, this.confirmacion), 'Restauración encolada. El sistema validará la integridad al finalizar.');
    this.cerrarRestauracion();
  }
  public ultimoEstado(): string { return this.respaldos()[0] ? this.etiquetaEstado(this.respaldos()[0].estado) : 'Sin respaldos'; }
  public ultimoFecha(): string { const value = this.respaldos()[0]?.solicitadoEn; return value ? new Date(value).toLocaleString('es-BO') : 'Aún no ejecutado'; }
  public localDisponible(): boolean { return this.respaldos().some(item => !!item.snapshotLocalId && item.estado !== 'ELIMINADO'); }
  public tieneCopiaVerificada(): boolean { return this.respaldos().some(item => item.estado === 'VERIFICADO'); }
  public puedeCopiar(item: Respaldo): boolean { return item.estado === 'GENERADO' || (item.estado === 'ERROR' && !!item.snapshotLocalId); }
  public puedeVerificar(item: Respaldo): boolean { return item.estado === 'COPIADO' || (item.estado === 'ERROR' && !!item.snapshotExternoId); }
  public etiquetaEstado(estado: string): string { return ({ SOLICITADO: 'Solicitado', EN_PROCESO: 'En proceso', GENERADO: 'Generado', COPIANDO: 'Copiando', COPIADO: 'Copiado', VERIFICANDO: 'Verificando', VERIFICADO: 'Verificado', RESTAURANDO: 'Restaurando', ELIMINADO: 'Eliminado', ERROR: 'Error' } as Record<string, string>)[estado] || estado; }
  public claseEstado(estado: string): string { if (estado === 'VERIFICADO') return 'bg-emerald-100 text-emerald-700'; if (estado === 'ERROR') return 'bg-rose-100 text-rose-700'; if (estado === 'ELIMINADO') return 'bg-slate-100 text-slate-700'; return 'bg-indigo-100 text-indigo-700'; }
  private ejecutar<T>(request: import('rxjs').Observable<T>, texto: string): void { this.cargando.set(true); this.error.set(''); this.mensaje.set(''); request.subscribe({ next: () => { this.cargando.set(false); this.mensaje.set(texto); this.cargar(); }, error: error => { this.cargando.set(false); this.mostrarError(error); } }); }
  private mostrarError(error: { error?: { message?: string }; message?: string }): void { this.error.set(error?.error?.message || error?.message || 'No se pudo completar la operación.'); }
}
