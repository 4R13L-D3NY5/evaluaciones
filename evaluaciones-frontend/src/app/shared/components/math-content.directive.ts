import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';
import katex from 'katex';

@Directive({
  selector: '[seaMathContent]',
  standalone: true
})
export class MathContentDirective implements OnChanges {
  @Input('seaMathContent') public content: string | null | undefined = '';
  private readonly element = inject(ElementRef<HTMLElement>);

  public ngOnChanges(): void {
    const fragment = document.createDocumentFragment();
    const segments = String(this.content || '').split(/(\$\$[\s\S]*?\$\$|\$(?!\$)[^$\r\n]+\$)/g);

    for (const segment of segments) {
      if (!segment) continue;
      const display = segment.startsWith('$$') && segment.endsWith('$$');
      const inline = !display && segment.startsWith('$') && segment.endsWith('$');
      if (!display && !inline) {
        this.appendTextAndUnwrappedEquations(fragment, segment);
        continue;
      }

      const formula = segment.slice(display ? 2 : 1, display ? -2 : -1);
      this.appendEquation(fragment, formula, display, segment);
    }

    this.element.nativeElement.replaceChildren(fragment);
  }

  private appendTextAndUnwrappedEquations(fragment: DocumentFragment, text: string): void {
    const pattern = /\$([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z][A-Za-z0-9]*)?\s*=[\s\S]*?)(?=(?:\.(?:\s|$)|$))/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      fragment.append(document.createTextNode(text.slice(cursor, match.index)));
      this.appendEquation(fragment, `\\$${match[1]}`, false, match[0]);
      cursor = pattern.lastIndex;
    }

    fragment.append(document.createTextNode(text.slice(cursor)));
  }

  private appendEquation(fragment: DocumentFragment, formula: string, display: boolean, fallback: string): void {
    const equation = document.createElement(display ? 'div' : 'span');
    equation.className = display ? 'sea-math-display' : 'sea-math-inline';
    try {
      katex.render(this.normalizarFormula(formula), equation, {
        displayMode: display,
        throwOnError: true,
        strict: 'ignore',
        trust: false
      });
    } catch {
      equation.textContent = fallback;
    }
    fragment.append(equation);
  }

  private normalizarFormula(formula: string): string {
    const equivalencias: Record<string, string> = {
      times: '\\times', equiv: '\\equiv', arrow: '\\to', sqrt: '\\sqrt', frac: '\\frac',
      plusminus: '\\pm', minusplus: '\\mp', sum: '\\sum', prod: '\\prod', int: '\\int', lim: '\\lim',
      pi: '\\pi', alpha: '\\alpha', beta: '\\beta', gamma: '\\gamma', delta: '\\delta',
      epsilon: '\\epsilon', theta: '\\theta', lambda: '\\lambda', mu: '\\mu', sigma: '\\sigma',
      omega: '\\omega', phi: '\\phi', psi: '\\psi', log: '\\log', ln: '\\ln', exp: '\\exp',
      sin: '\\sin', cos: '\\cos', tan: '\\tan', cot: '\\cot', sec: '\\sec', csc: '\\csc',
      arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\arctan', sinh: '\\sinh',
      cosh: '\\cosh', tanh: '\\tanh', arcsinh: '\\operatorname{arcsinh}',
      arccosh: '\\operatorname{arccosh}', arctanh: '\\operatorname{arctanh}'
    };
    const nombres = Object.keys(equivalencias).filter(nombre => !['plusminus', 'minusplus'].includes(nombre));
    return formula.split(/("(?:\\.|[^"\\])*")/g).map((segmento, indice) => {
      if (indice % 2 === 1) {
        const texto = segmento.slice(1, -1).replace(/([\\{}_$%&#])/g, '\\$1');
        return `\\text{${texto}}`;
      }
      return segmento
        .replace(/\bplus\.minus\b/g, '\\pm')
        .replace(/\bminus\.plus\b/g, '\\mp')
        .replace(/(?<!\\)%/g, '\\%')
        .replace(/\*+/g, ' \\times ')
        .replace(/_([A-Za-z]{2,}[A-Za-z0-9]*)/g, (_match, subscript: string) => `_{\\text{${subscript}}}`)
        .replace(/\bUSD\b/g, '\\text{USD}')
        .replace(new RegExp(`(?<!\\\\)\\b(${nombres.join('|')})\\b`, 'gi'), nombre => equivalencias[nombre.toLowerCase()]);
    }).join('');
  }
}
