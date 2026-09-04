import { Component, inject } from '@angular/core';
import { GlobalLoadingService } from '../../../core/services/global-loading.service';

@Component({
  selector: 'sea-global-loading',
  standalone: true,
  template: `
    @if (loading.visible()) {
      <div class="sea-global-loading" role="status" aria-live="polite" aria-label="Cargando información">
        <span class="sea-global-loading__spinner" aria-hidden="true"><i class="pi pi-spinner"></i></span>
        <span>Cargando información...</span>
      </div>
    }
  `,
  styles: [`
    :host { position: relative; z-index: 25000; }
    .sea-global-loading {
      position: fixed;
      top: .85rem;
      left: 50%;
      transform: translateX(-50%);
      display: inline-flex;
      align-items: center;
      gap: .55rem;
      min-height: 2.1rem;
      padding: .5rem .8rem;
      border: 1px solid var(--surface-border);
      border-radius: 999px;
      background: var(--surface-card);
      color: var(--text-color);
      box-shadow: 0 10px 26px rgba(15, 23, 42, .14);
      font-size: .7rem;
      font-weight: 800;
      pointer-events: none;
      animation: sea-loading-enter 160ms ease-out both;
    }
    .sea-global-loading::before {
      content: '';
      position: fixed;
      top: -.85rem;
      left: 50%;
      width: 4rem;
      height: 2px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: var(--primary-color);
      box-shadow: 0 0 0 1px var(--sea-primary-ring);
      animation: sea-loading-pulse 900ms ease-in-out infinite alternate;
    }
    .sea-global-loading__spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.35rem;
      height: 1.35rem;
      border-radius: 50%;
      background: var(--sea-primary-soft);
      color: var(--primary-color);
    }
    .sea-global-loading__spinner i { animation: sea-loading-spin 900ms linear infinite; }
    @keyframes sea-loading-spin { to { transform: rotate(360deg); } }
    @keyframes sea-loading-pulse { from { opacity: .35; transform: translateX(-50%) scaleX(.65); } to { opacity: 1; transform: translateX(-50%) scaleX(1); } }
    @keyframes sea-loading-enter { from { opacity: 0; transform: translate(-50%, -.35rem); } to { opacity: 1; transform: translate(-50%, 0); } }
    @media (max-width: 640px) {
      .sea-global-loading { top: .65rem; max-width: calc(100vw - 2rem); }
    }
  `]
})
export class GlobalLoadingComponent {
  public readonly loading = inject(GlobalLoadingService);
}
