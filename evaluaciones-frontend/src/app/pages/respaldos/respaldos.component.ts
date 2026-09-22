import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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
        <div class="flex items-center gap-2">
          <button (click)="cargar()" [disabled]="cargando()" class="bg-card hover:bg-muted text-foreground border border-border font-bold text-xs py-2.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors" title="Actualizar lista"><i class="pi pi-refresh" [class.pi-spin]="cargando()"></i> Refrescar</button>
          <button (click)="generar()" [disabled]="cargando()" class="bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2"><i class="pi pi-plus-circle"></i> Generar respaldo ahora</button>
        </div>
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

        <section class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden"><div class="p-5 border-b border-border"><h3 class="text-sm font-black text-foreground">Historial de respaldos</h3><p class="text-xs text-muted-foreground mt-1">La copia externa y la verificación son pasos independientes y trazables.</p></div><div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground"><th class="p-3.5">Identificador</th><th class="p-3.5">Solicitado</th><th class="p-3.5">Estado</th><th class="p-3.5">Contenido</th><th class="p-3.5 text-right">Acciones</th></tr></thead><tbody class="divide-y divide-border">@for (item of respaldos(); track item.id) {<tr class="hover:bg-muted/20"><td class="p-3.5"><strong class="font-mono text-[11px] text-foreground">{{ item.id }}</strong><span class="block text-[10px] text-muted-foreground">{{ item.solicitadoPor }}</span></td><td class="p-3.5 font-mono text-[11px]">{{ item.solicitadoEn | date:'dd/MM/yyyy HH:mm' }}</td><td class="p-3.5"><span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase" [class]="claseEstado(item.estado)">{{ etiquetaEstado(item.estado) }}</span>@if (item.errorMensaje) {<span class="block max-w-xs text-[10px] text-rose-600 mt-1">{{ item.errorMensaje }}</span>}</td><td class="p-3.5 text-muted-foreground">{{ item.archivosCount || '—' }} archivos<span class="block text-[10px]">{{ item.tamanoBytes ? (item.tamanoBytes | number) + ' bytes' : 'DB + storage' }}</span></td><td class="p-3.5"><div class="flex justify-end gap-1.5"><button (click)="descargarDump(item)" [disabled]="!item.dumpDisponible || cargando()" title="Descargar dump de BD (.dump) para desarrollo o pruebas locales" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-blue-600 disabled:opacity-40"><i class="pi pi-download text-xs"></i></button><button (click)="abrirGuiaDump(item)" [disabled]="!item.dumpDisponible" title="Ver guía y comandos de restauración local" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-indigo-600 disabled:opacity-40"><i class="pi pi-code text-xs"></i></button><button (click)="copiar(item)" [disabled]="!puedeCopiar(item) || cargando()" title="Copiar al destino externo" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-primary disabled:opacity-40"><i class="pi pi-cloud-upload text-xs"></i></button><button (click)="verificar(item)" [disabled]="!puedeVerificar(item) || cargando()" title="Verificar integridad" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-emerald-600 disabled:opacity-40"><i class="pi pi-verified text-xs"></i></button><button (click)="eliminar(item)" [disabled]="item.estado !== 'VERIFICADO' || cargando()" title="Eliminar copia local (requiere verificación externa)" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-rose-600 disabled:opacity-40"><i class="pi pi-trash text-xs"></i></button><button (click)="abrirRestauracion(item)" [disabled]="item.estado !== 'VERIFICADO' || cargando()" title="Restaurar respaldo verificado" class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-purple-700 disabled:opacity-40"><i class="pi pi-history text-xs"></i></button></div></td></tr>} @empty {<tr><td colspan="5" class="p-10 text-center text-xs text-muted-foreground">Todavía no hay respaldos registrados.</td></tr>}</tbody></table></div></section>
      }

      @if (restaurarItem()) {<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div class="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"><div class="p-5 border-b border-border flex items-start justify-between"><div><span class="text-[10px] uppercase tracking-wider font-extrabold text-rose-600">Operación crítica</span><h3 class="text-base font-black text-foreground mt-1">Restaurar respaldo</h3></div><button (click)="cerrarRestauracion()" class="text-muted-foreground hover:text-foreground"><i class="pi pi-times"></i></button></div><div class="p-5 space-y-4"><p class="text-xs text-muted-foreground">Esta operación reemplazará la base de datos y los archivos actuales. Escribe exactamente el texto siguiente para continuar:</p><code class="block p-3 rounded-xl bg-muted border border-border text-xs font-mono font-black text-foreground break-all">RESTAURAR {{ restaurarItem()?.id }}</code><input [(ngModel)]="confirmacion" class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground" placeholder="RESTAURAR BKP-..."><div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">La segunda confirmación se solicitará antes de enviar la restauración.</div></div><div class="p-4 bg-muted/30 border-t border-border flex justify-end gap-2"><button (click)="cerrarRestauracion()" class="px-4 py-2 border border-border rounded-xl text-xs font-bold text-muted-foreground">Cancelar</button><button (click)="confirmarRestauracion()" [disabled]="confirmacion !== 'RESTAURAR ' + restaurarItem()?.id || cargando()" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold">Confirmar restauración</button></div></div></div>}

      @if (guiaDumpItem()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="bg-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div class="p-5 border-b border-border flex items-start justify-between bg-muted/20">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg">
                  <i class="pi pi-database"></i>
                </div>
                <div>
                  <span class="text-[10px] uppercase tracking-wider font-extrabold text-blue-600">Entorno local de desarrollo</span>
                  <h3 class="text-base font-black text-foreground mt-0.5">Guía de restauración local</h3>
                </div>
              </div>
              <button (click)="cerrarGuiaDump()" class="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"><i class="pi pi-times"></i></button>
            </div>

            <div class="p-5 space-y-4 overflow-y-auto text-xs text-foreground flex-1">
              <div class="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-950">
                <div>
                  <span class="block text-[10px] uppercase font-bold text-blue-700">Archivo descargado:</span>
                  <strong class="font-mono text-xs break-all">sea_evaluaciones_{{ guiaDumpItem()?.id }}.dump</strong>
                </div>
                <span class="px-2.5 py-1 rounded-lg bg-blue-200/80 text-[10px] font-black text-blue-900 shrink-0 self-start sm:self-auto">PostgreSQL Custom Dump</span>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="font-black text-xs text-foreground flex items-center gap-2">
                    <i class="pi pi-desktop text-purple-600"></i> Opción 1: Restaurar con PowerShell / Terminal (PostgreSQL local)
                  </h4>
                  <button (click)="copiarComando(comandoLocal())" class="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                    <i class="pi pi-copy"></i> Copiar comando
                  </button>
                </div>
                <pre class="p-3 bg-muted/80 border border-border rounded-xl font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap select-all">{{ comandoLocal() }}</pre>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="font-black text-xs text-foreground flex items-center gap-2">
                    <i class="pi pi-box text-blue-600"></i> Opción 2: Si tu base corre en Docker local
                  </h4>
                  <button (click)="copiarComando(comandoDocker())" class="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                    <i class="pi pi-copy"></i> Copiar comando
                  </button>
                </div>
                <pre class="p-3 bg-muted/80 border border-border rounded-xl font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap select-all">{{ comandoDocker() }}</pre>
              </div>

              <div class="space-y-2">
                <h4 class="font-black text-xs text-foreground flex items-center gap-2">
                  <i class="pi pi-table text-emerald-600"></i> Opción 3: Con interfaz gráfica (pgAdmin o DBeaver)
                </h4>
                <ol class="list-decimal list-inside space-y-1.5 text-muted-foreground text-[11px] bg-muted/30 p-3 rounded-xl border border-border">
                  <li>En tu PostgreSQL local crea la base de datos <code class="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-foreground">sea_evaluaciones</code> si aún no existe.</li>
                  <li>Haz clic derecho sobre la base de datos y elige <strong>Restore...</strong> (o Restaurar).</li>
                  <li>Selecciona el archivo descargado <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">sea_evaluaciones_{{ guiaDumpItem()?.id }}.dump</code>.</li>
                  <li>En <em>Format</em> elige <strong>Custom or tar</strong>, marca la opción <strong>Clean before restore</strong> y pulsa <strong>Restore</strong>.</li>
                </ol>
              </div>

              <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex gap-2.5">
                <i class="pi pi-info-circle text-amber-700 mt-0.5 shrink-0 text-sm"></i>
                <div>
                  <strong>Usuarios y accesos:</strong> Este dump contiene todos los usuarios, docentes y exámenes. Al restaurarlo en tu local, podrás ingresar con las mismas cuentas y contraseñas que utilizas en el entorno actual.
                </div>
              </div>
            </div>

            <div class="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
              <span class="text-[11px] text-emerald-600 font-bold transition-opacity" [class.opacity-0]="!copiadoTexto()"><i class="pi pi-check mr-1"></i>¡Comando copiado al portapapeles!</span>
              <button (click)="cerrarGuiaDump()" class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-colors">Entendido / Cerrar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class RespaldosComponent implements OnInit, OnDestroy {
  private readonly service = inject(RespaldosService);
  private readonly feedback = inject(UiFeedbackService);
  private pollingTimer: ReturnType<typeof setTimeout> | null = null;
  public readonly config = signal<ConfiguracionRespaldos | null>(null);
  public readonly respaldos = signal<Respaldo[]>([]);
  public readonly cargando = signal(false);
  public readonly error = signal('');
  public readonly mensaje = signal('');
  public readonly restaurarItem = signal<Respaldo | null>(null);
  public confirmacion = '';
  public configForm = { activo: false, frecuenciaMinutos: 1440, retencionDias: 30 };

  public ngOnInit(): void { this.cargar(); }
  public ngOnDestroy(): void { if (this.pollingTimer) clearTimeout(this.pollingTimer); }
  public cargar(): void {
    this.service.obtenerConfiguracion().subscribe({
      next: value => { this.config.set(value); this.configForm = { activo: value.activo, frecuenciaMinutos: value.frecuenciaMinutos, retencionDias: value.retencionDias }; },
      error: error => this.mostrarError(error)
    });
    this.service.listar().subscribe({
      next: value => {
        this.respaldos.set(value);
        this.programarPolling(value);
      },
      error: error => this.mostrarError(error)
    });
  }
  private programarPolling(lista: Respaldo[]): void {
    if (this.pollingTimer) { clearTimeout(this.pollingTimer); this.pollingTimer = null; }
    const transitorios = ['SOLICITADO', 'EN_PROCESO', 'COPIANDO', 'VERIFICANDO', 'RESTAURANDO'];
    if (lista.some(item => transitorios.includes(item.estado))) {
      this.pollingTimer = setTimeout(() => this.cargar(), 3500);
    }
  }
  public guardarConfiguracion(): void { this.ejecutar(this.service.actualizarConfiguracion(this.configForm), 'Configuración actualizada.'); }
  public generar(): void { this.ejecutar(this.service.generar(), 'Respaldo encolado para generación.'); }
  public copiar(item: Respaldo): void { this.ejecutar(this.service.copiarExterno(item.id), 'Copia externa encolada.'); }
  public verificar(item: Respaldo): void { this.ejecutar(this.service.verificar(item.id), 'Verificación encolada.'); }
  public readonly guiaDumpItem = signal<Respaldo | null>(null);
  public readonly copiadoTexto = signal(false);

  public abrirGuiaDump(item: Respaldo): void {
    this.guiaDumpItem.set(item);
    this.copiadoTexto.set(false);
  }
  public cerrarGuiaDump(): void {
    this.guiaDumpItem.set(null);
    this.copiadoTexto.set(false);
  }
  public comandoLocal(): string {
    const id = this.guiaDumpItem()?.id || 'ID';
    return `pg_restore --clean --if-exists -U postgres -d sea_evaluaciones "sea_evaluaciones_${id}.dump"`;
  }
  public comandoDocker(): string {
    const id = this.guiaDumpItem()?.id || 'ID';
    return `docker cp "sea_evaluaciones_${id}.dump" evaluaciones-db:/tmp/dump.dump\n` +
           `docker exec -it evaluaciones-db pg_restore --clean --if-exists -U postgres -d sea_evaluaciones /tmp/dump.dump`;
  }
  public copiarComando(texto: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        this.copiadoTexto.set(true);
        setTimeout(() => this.copiadoTexto.set(false), 2500);
      });
    }
  }

  public descargarDump(item: Respaldo): void {
    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');
    this.service.descargarDump(item.id).subscribe({
      next: blob => {
        this.cargando.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sea_evaluaciones_${item.id}.dump`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.mensaje.set(`Descarga iniciada: sea_evaluaciones_${item.id}.dump`);
        this.abrirGuiaDump(item);
      },
      error: error => {
        this.cargando.set(false);
        this.mostrarError(error);
      }
    });
  }
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
