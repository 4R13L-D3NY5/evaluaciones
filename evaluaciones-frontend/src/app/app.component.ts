import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'sea-root',
  standalone: true,
  imports: [RouterModule],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  title = 'sistema-evaluaciones-ui';

  constructor() {
    this.limpiarPersistenciaLocalNoOficial();
  }

  /**
   * El negocio oficial vive en PostgreSQL y en el Gateway SEA. Se eliminan
   * las claves históricas del frontend para impedir que roles, bancos o
   * configuraciones ficticias vuelvan a aparecer después de recargar.
   */
  private limpiarPersistenciaLocalNoOficial(): void {
    if (typeof localStorage === 'undefined') return;

    const clavesAEliminar: string[] = [];
    for (let indice = 0; indice < localStorage.length; indice++) {
      const clave = localStorage.key(indice);
      if (clave && (clave.startsWith('sea_eval_') || clave.startsWith('xf_sistema_evaluaciones_') || clave === 'xf_config_estudiantes_por_variante')) {
        clavesAEliminar.push(clave);
      }
    }

    clavesAEliminar.forEach(clave => localStorage.removeItem(clave));
  }
}
