import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'sea-session-expiry',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (auth.mostrarAvisoSesion()) {
      <aside class="fixed bottom-5 right-5 z-[29000] w-[min(92vw,25rem)] rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl ring-1 ring-amber-100"
        role="status" aria-live="polite">
        <div class="flex items-start gap-3">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <i class="pi pi-clock text-lg"></i>
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-sm font-black text-slate-900">Tu sesión está por terminar</h2>
            <p class="mt-1 text-xs leading-5 text-slate-600">
              Por seguridad, permanecerás en el sistema durante
              <strong class="font-black text-amber-700">{{ formatear(auth.segundosSesion()) }}</strong>.
            </p>
          </div>
        </div>
        <div class="mt-3 flex justify-end gap-2">
          <button type="button" (click)="cerrarSesion()"
            class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
            Cerrar sesión
          </button>
          <button type="button" (click)="renovar()" [disabled]="auth.renovandoSesion()"
            class="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60">
            {{ auth.renovandoSesion() ? 'Renovando…' : 'Continuar sesión' }}
          </button>
        </div>
      </aside>
    }

    @if (auth.sesionTerminadaVisible()) {
      <div class="fixed inset-0 z-[30000] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
        role="presentation">
        <section class="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          role="alertdialog" aria-modal="true" aria-labelledby="session-expired-title">
          <div class="flex items-start gap-3 border-b border-border px-5 py-5">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700">
              <i class="pi pi-lock text-lg"></i>
            </div>
            <div>
              <h2 id="session-expired-title" class="text-base font-black text-foreground">Sesión finalizada</h2>
              <p class="mt-1 text-sm leading-6 text-muted-foreground">
                Tu sesión terminó por seguridad. Vuelve a iniciar sesión para continuar trabajando.
              </p>
            </div>
          </div>
          <div class="flex justify-end border-t border-border bg-card/95 px-5 py-3">
            <button type="button" (click)="irAlLogin()"
              class="rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-white transition hover:brightness-95">
              Volver a iniciar sesión
            </button>
          </div>
        </section>
      </div>
    }
  `
})
export class SessionExpiryComponent {
  public readonly auth = inject(AuthService);
  private readonly _router = inject(Router);

  public renovar(): void {
    if (this.auth.renovandoSesion()) return;
    this.auth.renovarSesion().subscribe({
      error: () => this.auth.notificarSesionExpirada()
    });
  }

  public cerrarSesion(): void {
    this.auth.cerrarSesion().subscribe({
      next: () => void this._router.navigateByUrl('/login'),
      error: () => void this._router.navigateByUrl('/login')
    });
  }

  public irAlLogin(): void {
    this.cerrarSesion();
  }

  public formatear(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  }
}
