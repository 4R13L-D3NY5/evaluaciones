import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SearchableSelectOption {
  value: string;
  label: string;
  searchText?: string;
}

@Component({
  selector: 'sea-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full" (click)="$event.stopPropagation()">
      <button
        type="button"
        [disabled]="disabled"
        (click)="toggle()"
        [attr.aria-expanded]="abierto"
        aria-haspopup="listbox"
        class="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50">
        <span class="min-w-0 truncate">{{ etiquetaSeleccionada }}</span>
        <i [class]="abierto ? 'pi pi-chevron-up text-primary' : 'pi pi-chevron-down text-muted-foreground'" class="shrink-0 text-[10px]"></i>
      </button>

      @if (abierto) {
        <div class="absolute left-0 top-[calc(100%+4px)] z-[100] w-full min-w-[260px] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div class="border-b border-border bg-muted/40 p-2">
            <div class="relative">
              <input
                type="text"
                [ngModel]="busqueda"
                (ngModelChange)="busqueda = $event"
                [placeholder]="searchPlaceholder"
                class="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-2 text-xs font-medium text-foreground outline-none focus:border-primary"
                autocomplete="off" />
              <i class="pi pi-search absolute left-2.5 top-2.5 text-xs text-muted-foreground"></i>
            </div>
          </div>

          <div class="max-h-64 overflow-y-auto p-1" role="listbox">
            @if (opcionesFiltradas.length === 0) {
              <div class="px-3 py-3 text-center text-xs font-medium text-muted-foreground">{{ noResultsText }}</div>
            } @else {
              @for (option of opcionesFiltradas; track option.value) {
                <button
                  type="button"
                  role="option"
                  [attr.aria-selected]="option.value === value"
                  (click)="seleccionar(option.value)"
                  [class]="option.value === value ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-muted'"
                  class="block w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors">
                  <span class="block truncate">{{ option.label }}</span>
                </button>
              }
            }
          </div>
        </div>
      }
    </div>
  `
})
export class SearchableSelectComponent {
  @Input() public options: SearchableSelectOption[] = [];
  @Input() public value = '';
  @Input() public placeholder = 'Seleccione una opción';
  @Input() public searchPlaceholder = 'Buscar por código o nombre...';
  @Input() public noResultsText = 'No se encontraron opciones.';
  @Input() public disabled = false;
  @Output() public readonly valueChange = new EventEmitter<string>();

  public abierto = false;
  public busqueda = '';

  public get opcionesFiltradas(): SearchableSelectOption[] {
    const query = this.busqueda.trim().toLocaleLowerCase();
    if (!query) return this.options;
    return this.options.filter(option =>
      `${option.label} ${option.searchText || ''}`.toLocaleLowerCase().includes(query)
    );
  }

  public get etiquetaSeleccionada(): string {
    return this.options.find(option => option.value === this.value)?.label || this.placeholder;
  }

  public toggle(): void {
    if (this.disabled) return;
    this.abierto = !this.abierto;
    if (this.abierto) this.busqueda = '';
  }

  public seleccionar(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
    this.abierto = false;
    this.busqueda = '';
  }

  @HostListener('document:click')
  public cerrarAlHacerClickFuera(): void {
    this.abierto = false;
  }
}
