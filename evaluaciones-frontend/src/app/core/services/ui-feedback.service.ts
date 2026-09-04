import { Injectable, signal } from '@angular/core';

export type FeedbackDialogKind = 'alert' | 'confirm';
export type FeedbackDialogTone = 'info' | 'warning' | 'error' | 'success';

export interface FeedbackDialogState {
  kind: FeedbackDialogKind;
  tone: FeedbackDialogTone;
  title: string;
  message: string;
  acceptLabel: string;
  cancelLabel: string;
}

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  private readonly _dialogo = signal<FeedbackDialogState | null>(null);
  private _resolver: ((resultado: boolean) => void) | null = null;

  public readonly dialogo = this._dialogo.asReadonly();

  public mostrar(
    mensaje: string,
    titulo = 'Aviso del sistema',
    tone: FeedbackDialogTone = 'info'
  ): Promise<void> {
    return new Promise(resolve => {
      this._abrir({
        kind: 'alert',
        tone,
        title: titulo,
        message: mensaje,
        acceptLabel: 'Aceptar',
        cancelLabel: 'Cancelar'
      }, resultado => resolve());
    });
  }

  public confirmar(
    mensaje: string,
    titulo = 'Confirmar operación',
    tone: FeedbackDialogTone = 'warning',
    acceptLabel = 'Continuar'
  ): Promise<boolean> {
    return new Promise(resolve => {
      this._abrir({
        kind: 'confirm',
        tone,
        title: titulo,
        message: mensaje,
        acceptLabel,
        cancelLabel: 'Cancelar'
      }, resultado => resolve(resultado));
    });
  }

  public resolver(resultado: boolean): void {
    const resolver = this._resolver;
    this._resolver = null;
    this._dialogo.set(null);
    resolver?.(resultado);
  }

  private _abrir(estado: FeedbackDialogState, resolver: (resultado: boolean) => void): void {
    // No se apilan ventanas: la alerta más reciente reemplaza una solicitud
    // anterior y libera su promesa para evitar diálogos bloqueados.
    this._resolver?.(false);
    this._resolver = resolver;
    this._dialogo.set(estado);
  }
}
