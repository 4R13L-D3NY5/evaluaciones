import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackDialogTone, UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'sea-ui-feedback',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (feedback.dialogo(); as dialogo) {
      <div class="fixed inset-0 z-[30000] grid place-items-start sm:place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm"
        role="presentation">
        <section class="my-1 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
          role="alertdialog" aria-modal="true" [attr.aria-label]="dialogo.title">
          <div class="flex items-start gap-3 border-b border-border px-5 py-4">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              [class.bg-blue-100]="dialogo.tone === 'info'"
              [class.text-blue-700]="dialogo.tone === 'info'"
              [class.bg-amber-100]="dialogo.tone === 'warning'"
              [class.text-amber-700]="dialogo.tone === 'warning'"
              [class.bg-rose-100]="dialogo.tone === 'error'"
              [class.text-rose-700]="dialogo.tone === 'error'"
              [class.bg-emerald-100]="dialogo.tone === 'success'"
              [class.text-emerald-700]="dialogo.tone === 'success'">
              <i [class]="icono(dialogo.tone)"></i>
            </div>
            <div class="min-w-0">
              <h2 class="text-sm font-black text-foreground">{{ dialogo.title }}</h2>
              <p class="mt-1 text-xs leading-5 text-muted-foreground">{{ dialogo.message }}</p>
            </div>
          </div>
          <div class="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-border bg-card/95 px-5 py-3 backdrop-blur">
            @if (dialogo.kind === 'confirm') {
              <button type="button" (click)="resolver(false)"
                class="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary">
                {{ dialogo.cancelLabel }}
              </button>
            }
            <button type="button" autofocus (click)="resolver(true)"
              class="rounded-xl bg-primary px-5 py-2 text-xs font-black text-white transition hover:brightness-95">
              {{ dialogo.acceptLabel }}
            </button>
          </div>
        </section>
      </div>
    }
  `
})
export class UiFeedbackComponent {
  public readonly feedback = inject(UiFeedbackService);

  public resolver(resultado: boolean): void {
    this.feedback.resolver(resultado);
  }

  public icono(tone: FeedbackDialogTone): string {
    return tone === 'error'
      ? 'pi pi-times-circle text-lg'
      : tone === 'warning'
        ? 'pi pi-exclamation-triangle text-lg'
        : tone === 'success'
          ? 'pi pi-check-circle text-lg'
          : 'pi pi-info-circle text-lg';
  }
}
