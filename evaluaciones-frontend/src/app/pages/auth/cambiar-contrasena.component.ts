import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'sea-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="password-page">
      <section class="password-card">
        <div class="password-icon"><i class="pi pi-lock"></i></div>
        <p class="eyebrow">Primer ingreso</p>
        <h1>Actualiza tu contraseña</h1>
        <p class="intro">Por seguridad, debes reemplazar la contraseña temporal antes de ingresar al sistema.</p>

        <form (ngSubmit)="guardar()" #form="ngForm">
          <label>Contraseña actual
            <input type="password" name="actual" [(ngModel)]="actual" autocomplete="current-password" required>
          </label>
          <label>Nueva contraseña
            <input type="password" name="nueva" [(ngModel)]="nueva" minlength="8" maxlength="72" autocomplete="new-password" required>
          </label>
          <label>Repetir nueva contraseña
            <input type="password" name="confirmacion" [(ngModel)]="confirmacion" minlength="8" maxlength="72" autocomplete="new-password" required>
          </label>
          <div class="password-rules" aria-live="polite">
            <p class="rules-title"><i class="pi pi-shield"></i> Reglas de la nueva contraseña</p>
            <ul>
              <li [class.valid]="nueva.length >= 8" [class.invalid]="nueva.length > 0 && nueva.length < 8"><i [class]="iconoRegla(nueva.length >= 8, nueva.length > 0 && nueva.length < 8)"></i><span>Debe tener entre 8 y 72 caracteres.</span></li>
              <li [class.valid]="nueva.length > 0 && nueva !== actual" [class.invalid]="nueva.length > 0 && nueva === actual"><i [class]="iconoRegla(nueva.length > 0 && nueva !== actual, nueva.length > 0 && nueva === actual)"></i><span>Debe ser diferente de la contraseña actual.</span></li>
              <li [class.valid]="confirmacion.length > 0 && nueva === confirmacion" [class.invalid]="confirmacion.length > 0 && nueva !== confirmacion"><i [class]="iconoRegla(confirmacion.length > 0 && nueva === confirmacion, confirmacion.length > 0 && nueva !== confirmacion)"></i><span>La confirmación debe coincidir con la nueva contraseña.</span></li>
            </ul>
          </div>

          @if (error()) {
            <div class="message error"><i class="pi pi-exclamation-circle"></i>{{ error() }}</div>
          }
          <button type="submit" [disabled]="form.invalid || nueva !== confirmacion || guardando()">
            @if (guardando()) { <i class="pi pi-spin pi-spinner"></i> Guardando... }
            @else { Guardar nueva contraseña <i class="pi pi-arrow-right"></i> }
          </button>
        </form>
        <p class="hint">Estas reglas también se verifican al guardar la contraseña.</p>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .password-page { min-height: 100vh; display: grid; place-items: center; padding: 2rem; background: var(--surface-ground); }
    .password-card { width: min(100%, 29rem); padding: 2.5rem; border: 1px solid var(--surface-border); border-radius: 1.2rem; background: var(--surface-card); box-shadow: 0 20px 50px rgba(15,23,42,.1); color: var(--text-color); }
    .password-icon { display: grid; width: 3.2rem; height: 3.2rem; place-items: center; margin-bottom: 1.5rem; border-radius: 1rem; background: var(--primary-color); color: #fff; font-size: 1.25rem; }
    .eyebrow { margin: 0 0 .6rem; color: var(--primary-color); font-size: .68rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1 { margin: 0; font-size: 1.8rem; letter-spacing: -.04em; }
    .intro { margin: .7rem 0 1.8rem; color: var(--text-color-secondary); font-size: .82rem; line-height: 1.55; }
    form { display: grid; gap: 1rem; }
    label { display: grid; gap: .4rem; color: var(--text-color); font-size: .72rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
    input { min-height: 2.8rem; padding: .7rem .8rem; border: 1px solid var(--surface-border); border-radius: .65rem; background: var(--surface-ground); color: var(--text-color); outline: none; font: inherit; }
    input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px var(--sea-primary-ring); }
    .password-rules { margin-top: -.35rem; padding: .8rem .9rem; border: 1px solid var(--surface-border); border-radius: .75rem; background: var(--surface-ground); }
    .rules-title { display: flex; align-items: center; gap: .45rem; margin: 0 0 .55rem; color: var(--text-color); font-size: .7rem; font-weight: 800; text-transform: none; letter-spacing: 0; }
    .rules-title i { color: var(--primary-color); }
    .password-rules ul { display: grid; gap: .38rem; margin: 0; padding: 0; list-style: none; }
    .password-rules li { display: flex; align-items: flex-start; gap: .45rem; color: var(--text-color-secondary); font-size: .68rem; font-weight: 600; line-height: 1.35; }
    .password-rules li i { margin-top: .1rem; color: var(--text-color-secondary); font-size: .7rem; }
    .password-rules li.valid { color: #047857; }
    .password-rules li.valid i { color: #059669; }
    .password-rules li.invalid { color: var(--sea-danger); }
    .password-rules li.invalid i { color: var(--sea-danger); }
    button { display: flex; align-items: center; justify-content: center; gap: .55rem; min-height: 2.9rem; margin-top: .3rem; border: 0; border-radius: .7rem; background: var(--primary-color); color: #fff; font: inherit; font-size: .8rem; font-weight: 800; cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: .5; }
    .message { display: flex; gap: .5rem; padding: .7rem .8rem; border-radius: .6rem; font-size: .75rem; line-height: 1.4; }
    .error { border: 1px solid var(--sea-danger-border); background: var(--sea-danger-soft); color: var(--sea-danger); }
    .hint { margin: 1.4rem 0 0; color: var(--text-color-secondary); font-size: .68rem; line-height: 1.5; text-align: center; }
    @media (max-width: 480px) { .password-page { padding: 1rem; } .password-card { padding: 1.6rem; } }
  `]
})
export class CambiarContrasenaComponent {
  public readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  public actual = '';
  public nueva = '';
  public confirmacion = '';
  public readonly error = signal<string | null>(null);
  public readonly guardando = signal(false);

  public iconoRegla(cumple: boolean, invalida: boolean): string {
    return cumple ? 'pi pi-check-circle' : invalida ? 'pi pi-times-circle' : 'pi pi-circle';
  }

  public guardar(): void {
    this.error.set(null);
    if (this.nueva.length < 8 || this.nueva.length > 72) {
      this.error.set('La nueva contraseña debe tener entre 8 y 72 caracteres.');
      return;
    }
    if (this.nueva === this.actual) {
      this.error.set('La nueva contraseña debe ser diferente a la actual.');
      return;
    }
    if (this.nueva !== this.confirmacion) {
      this.error.set('Las contraseñas nuevas no coinciden.');
      return;
    }
    this.guardando.set(true);
    this.auth.cambiarContrasena(this.actual, this.nueva).subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: error => {
        this.guardando.set(false);
        this.error.set(error?.error?.message || 'No se pudo actualizar la contraseña.');
      }
    });
  }
}
