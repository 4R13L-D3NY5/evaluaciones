import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalLoadingService {
  private readonly _solicitudesPendientes = signal(0);

  public readonly visible = computed(() => this._solicitudesPendientes() > 0);

  public iniciar(): void {
    this._solicitudesPendientes.update(total => total + 1);
  }

  public finalizar(): void {
    this._solicitudesPendientes.update(total => Math.max(0, total - 1));
  }
}
