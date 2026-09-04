import { Injectable, signal } from '@angular/core';

export type VistaContenido = 'centrado' | 'fluido';

@Injectable({ providedIn: 'root' })
export class LayoutPreferencesService {
  private readonly _storageKey = 'sea.layout.content-view';
  public readonly vistaContenido = signal<VistaContenido>(this._leerVista());

  public cambiarVista(vista: VistaContenido): void {
    this.vistaContenido.set(vista);
    localStorage.setItem(this._storageKey, vista);
  }

  private _leerVista(): VistaContenido {
    const vista = localStorage.getItem(this._storageKey);
    return vista === 'fluido' ? 'fluido' : 'centrado';
  }
}
