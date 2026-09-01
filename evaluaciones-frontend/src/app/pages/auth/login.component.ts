import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'sea-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <main class="sea-login">
      <section class="sea-login__context" aria-label="Información del sistema">
        <div class="sea-login__context-inner">
          <img class="sea-login__logo" src="assets/logo_unitepc_clean.png" alt="UNITEPC">
          <p class="sea-login__eyebrow">Plataforma institucional</p>
          <h1>Gestión integral de evaluaciones académicas.</h1>
          <p class="sea-login__context-copy">
            Un espacio seguro para planificar, generar, imprimir y calificar las evaluaciones de la Universidad.
          </p>

          <div class="sea-login__features">
            <div class="sea-login__feature">
              <span class="sea-login__feature-icon"><i class="pi pi-shield"></i></span>
              <div>
                <strong>Acceso por roles</strong>
                <span>Cada usuario visualiza únicamente lo que necesita.</span>
              </div>
            </div>
            <div class="sea-login__feature">
              <span class="sea-login__feature-icon sea-login__feature-icon--teal"><i class="pi pi-check-square"></i></span>
              <div>
                <strong>Proceso trazable</strong>
                <span>Evaluaciones controladas desde su configuración hasta el resultado.</span>
              </div>
            </div>
          </div>
        </div>
        <div class="sea-login__pattern" aria-hidden="true"></div>
      </section>

      <section class="sea-login__panel">
        <div class="sea-login__card">
          <div class="sea-login__brand-mark" aria-hidden="true">
            <i class="pi pi-check-square"></i>
          </div>
          <p class="sea-login__card-eyebrow">Acceso interno</p>
          <h2>Bienvenido</h2>
          <p class="sea-login__subtitle">Ingresa con tu usuario y contraseña del sistema.</p>

          <form class="sea-login__form" (ngSubmit)="iniciarSesion()" #loginForm="ngForm">
            <div class="sea-login__field">
              <label for="usuario">Usuario</label>
              <div class="sea-login__input-wrap">
                <i class="pi pi-user"></i>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  autocomplete="username"
                  [(ngModel)]="usuario"
                  placeholder="Ingresa tu usuario"
                  required
                  [disabled]="auth.cargando()">
              </div>
            </div>

            <div class="sea-login__field">
              <div class="sea-login__label-row">
                <label for="contrasena">Contraseña</label>
              </div>
              <div class="sea-login__input-wrap">
                <i class="pi pi-lock"></i>
                <input
                  id="contrasena"
                  name="contrasena"
                  [type]="mostrarContrasena ? 'text' : 'password'"
                  autocomplete="current-password"
                  [(ngModel)]="contrasena"
                  placeholder="Ingresa tu contraseña"
                  required
                  [disabled]="auth.cargando()">
                <button
                  type="button"
                  class="sea-login__password-toggle"
                  [attr.aria-label]="mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  (click)="mostrarContrasena = !mostrarContrasena">
                  <i [class]="mostrarContrasena ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            @if (mensajeError()) {
              <div class="sea-login__error" role="alert">
                <i class="pi pi-exclamation-circle"></i>
                <span>{{ mensajeError() }}</span>
              </div>
            }

            <button class="sea-login__submit" type="submit" [disabled]="loginForm.invalid || auth.cargando()">
              @if (auth.cargando()) {
                <i class="pi pi-spin pi-spinner"></i>
                <span>Validando acceso...</span>
              } @else {
                <span>Ingresar al sistema</span>
                <i class="pi pi-arrow-right"></i>
              }
            </button>
          </form>

          <div class="sea-login__security-note">
            <i class="pi pi-lock"></i>
            <span>Sesión protegida para usuarios autorizados.</span>
          </div>
        </div>

        <footer class="sea-login__footer">
          <span>Sistema de Evaluaciones · UNITEPC</span>
          <span>Acceso interno</span>
        </footer>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .sea-login {
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr);
      background: var(--surface-ground);
      color: var(--text-color);
    }

    .sea-login__context {
      position: relative;
      display: flex;
      align-items: center;
      overflow: hidden;
      padding: 3rem clamp(2rem, 6vw, 6rem);
      background: var(--surface-card);
      border-right: 1px solid var(--surface-border);
      isolation: isolate;
    }

    .sea-login__context-inner {
      position: relative;
      z-index: 1;
      max-width: 34rem;
    }

    .sea-login__logo {
      display: block;
      width: 174px;
      height: auto;
      margin-bottom: 4.5rem;
    }

    .sea-login__eyebrow,
    .sea-login__card-eyebrow {
      margin: 0 0 0.75rem;
      color: var(--primary-color);
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .sea-login__context h1 {
      max-width: 11ch;
      margin: 0;
      color: var(--text-color);
      font-size: clamp(2rem, 4vw, 3.75rem);
      font-weight: 800;
      letter-spacing: -0.055em;
      line-height: 1.02;
    }

    .sea-login__context-copy {
      max-width: 38rem;
      margin: 1.5rem 0 0;
      color: var(--text-color-secondary);
      font-size: 0.95rem;
      line-height: 1.65;
    }

    .sea-login__features {
      display: grid;
      gap: 1rem;
      margin-top: 3rem;
    }

    .sea-login__feature {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      color: var(--text-color);
    }

    .sea-login__feature-icon {
      display: grid;
      flex: 0 0 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      place-items: center;
      border: 1px solid var(--sea-primary-ring);
      border-radius: 0.75rem;
      background: var(--sea-primary-soft);
      color: var(--primary-color);
    }

    .sea-login__feature-icon--teal {
      border-color: color-mix(in srgb, var(--sea-teal) 18%, transparent);
      background: color-mix(in srgb, var(--sea-teal) 8%, transparent);
      color: var(--sea-teal);
    }

    .sea-login__feature strong,
    .sea-login__feature span {
      display: block;
    }

    .sea-login__feature strong {
      font-size: 0.8rem;
      font-weight: 800;
    }

    .sea-login__feature div span {
      margin-top: 0.15rem;
      color: var(--text-color-secondary);
      font-size: 0.75rem;
      line-height: 1.45;
    }

    .sea-login__pattern {
      position: absolute;
      right: -12rem;
      bottom: -14rem;
      z-index: 0;
      width: 38rem;
      height: 38rem;
      border: 1px solid rgba(79, 57, 246, 0.08);
      border-radius: 50%;
      box-shadow: 0 0 0 3rem var(--sea-primary-soft), 0 0 0 6rem color-mix(in srgb, var(--sea-teal) 4%, transparent);
    }

    .sea-login__panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 0;
      padding: 2rem;
    }

    .sea-login__card {
      width: min(100%, 28rem);
      padding: clamp(1.75rem, 4vw, 3rem);
      border: 1px solid var(--surface-border);
      border-radius: 1rem;
      background: var(--surface-card);
      box-shadow: 0 16px 45px rgba(15, 23, 42, 0.08);
    }

    .sea-login__brand-mark {
      display: grid;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1.75rem;
      place-items: center;
      border-radius: 0.9rem;
      background: var(--primary-color);
      box-shadow: 0 8px 18px var(--sea-primary-ring);
      color: #fff;
      font-size: 1.25rem;
    }

    .sea-login__card h2 {
      margin: 0;
      color: var(--text-color);
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.045em;
    }

    .sea-login__subtitle {
      margin: 0.65rem 0 2rem;
      color: var(--text-color-secondary);
      font-size: 0.85rem;
      line-height: 1.55;
    }

    .sea-login__form {
      display: grid;
      gap: 1.15rem;
    }

    .sea-login__field {
      display: grid;
      gap: 0.45rem;
    }

    .sea-login__field label {
      color: var(--text-color);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .sea-login__input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .sea-login__input-wrap > i {
      position: absolute;
      left: 0.95rem;
      z-index: 1;
      color: var(--text-color-secondary);
      font-size: 0.9rem;
    }

    .sea-login__input-wrap input {
      width: 100%;
      min-height: 2.9rem;
      padding: 0.75rem 2.8rem;
      border: 1px solid var(--surface-border);
      border-radius: 0.7rem;
      outline: none;
      background: var(--surface-ground);
      color: var(--text-color);
      font: inherit;
      font-size: 0.85rem;
      transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
      box-sizing: border-box;
    }

    .sea-login__input-wrap input::placeholder {
      color: #94a3b8;
    }

    .sea-login__input-wrap input:focus {
      border-color: var(--primary-color);
      background: var(--surface-card);
      box-shadow: 0 0 0 3px var(--sea-primary-ring);
    }

    .sea-login__password-toggle {
      position: absolute;
      right: 0.8rem;
      display: grid;
      width: 2rem;
      height: 2rem;
      place-items: center;
      border: 0;
      background: transparent;
      color: var(--text-color-secondary);
      cursor: pointer;
    }

    .sea-login__password-toggle:hover {
      color: var(--primary-color);
    }

    .sea-login__error {
      display: flex;
      align-items: flex-start;
      gap: 0.55rem;
      padding: 0.75rem 0.85rem;
      border: 1px solid var(--sea-danger-border);
      border-radius: 0.65rem;
      background: var(--sea-danger-soft);
      color: var(--sea-danger);
      font-size: 0.75rem;
      line-height: 1.45;
    }

    .sea-login__submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      min-height: 3rem;
      margin-top: 0.35rem;
      border: 0;
      border-radius: 0.7rem;
      background: var(--primary-color);
      color: #fff;
      cursor: pointer;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 800;
      transition: background 150ms ease, box-shadow 150ms ease, transform 150ms ease;
    }

    .sea-login__submit:hover:not(:disabled) {
      background: #432dd7;
      box-shadow: 0 8px 18px var(--sea-primary-ring);
      transform: translateY(-1px);
    }

    .sea-login__submit:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .sea-login__security-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      margin-top: 1.75rem;
      color: var(--text-color-secondary);
      font-size: 0.7rem;
    }

    .sea-login__security-note i {
      color: var(--sea-teal);
    }

    .sea-login__footer {
      display: flex;
      justify-content: space-between;
      width: min(100%, 28rem);
      margin-top: 1.25rem;
      color: var(--text-color-secondary);
      font-size: 0.65rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    @media (max-width: 820px) {
      .sea-login {
        display: block;
      }

      .sea-login__context {
        min-height: 19rem;
        padding: 2rem 1.5rem;
        border-right: 0;
        border-bottom: 1px solid var(--surface-border);
      }

      .sea-login__logo {
        width: 145px;
        margin-bottom: 2.25rem;
      }

      .sea-login__context h1 {
        max-width: 22ch;
        font-size: clamp(1.8rem, 8vw, 2.5rem);
      }

      .sea-login__context-copy,
      .sea-login__features {
        display: none;
      }

      .sea-login__panel {
        min-height: calc(100vh - 19rem);
        padding: 2rem 1rem 1.25rem;
      }
    }

    @media (max-width: 480px) {
      .sea-login__card {
        padding: 1.5rem;
      }

      .sea-login__footer {
        font-size: 0.58rem;
      }
    }
  `]
})
export class LoginComponent {
  public readonly auth = inject(AuthService);
  private readonly _router = inject(Router);

  public usuario = '';
  public contrasena = '';
  public mostrarContrasena = false;
  public mensajeError = signal<string | null>(null);

  public iniciarSesion(): void {
    this.mensajeError.set(null);
    this.auth.iniciarSesion(this.usuario.trim(), this.contrasena).subscribe({
      next: () => this._router.navigateByUrl('/dashboard'),
      error: error => {
        this.mensajeError.set(error?.status === 401
          ? 'El usuario o la contraseña no son válidos.'
          : 'No se pudo conectar con el servicio de acceso. Intenta nuevamente.');
      }
    });
  }
}
