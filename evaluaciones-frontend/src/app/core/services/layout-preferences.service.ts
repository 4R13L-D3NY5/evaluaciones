import { Injectable, signal } from '@angular/core';

export type VistaContenido = 'centrado' | 'fluido';

@Injectable({ providedIn: 'root' })
export class LayoutPreferencesService {
  private readonly _storageKey = 'sea.layout.content-view';
  private readonly _sidebarStorageKey = 'sea.sidebar.collapsed';
  public readonly vistaContenido = signal<VistaContenido>(this._leerVista());
  public readonly sidebarColapsado = signal(this._leerEstadoSidebar());

  public cambiarVista(vista: VistaContenido): void {
    this.vistaContenido.set(vista);
    localStorage.setItem(this._storageKey, vista);
  }

  public alternarSidebar(): void {
    this.sidebarColapsado.update(colapsado => !colapsado);
    this._guardarEstadoSidebar();
  }

  public abrirSidebar(): void {
    this.sidebarColapsado.set(false);
    this._guardarEstadoSidebar();
  }

  public cerrarSidebar(): void {
    this.sidebarColapsado.set(true);
    this._guardarEstadoSidebar();
  }

  private _leerVista(): VistaContenido {
    const vista = localStorage.getItem(this._storageKey);
    return vista === 'fluido' ? 'fluido' : 'centrado';
  }

  private _leerEstadoSidebar(): boolean {
    return localStorage.getItem(this._sidebarStorageKey) === 'true';
  }

  private _guardarEstadoSidebar(): void {
    localStorage.setItem(this._sidebarStorageKey, String(this.sidebarColapsado()));
  }
}
