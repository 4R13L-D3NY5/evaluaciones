import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GlobalLoadingComponent } from './shared/components/global-loading/global-loading.component';
import { UiFeedbackComponent } from './shared/components/ui-feedback/ui-feedback.component';
import { SessionExpiryComponent } from './shared/components/session-expiry/session-expiry.component';
import { ConfiguracionEvaluacionesService } from './core/services/configuracion-evaluaciones.service';

@Component({
  selector: 'sea-root',
  standalone: true,
  imports: [RouterModule, GlobalLoadingComponent, UiFeedbackComponent, SessionExpiryComponent],
  template: `<sea-global-loading></sea-global-loading><sea-ui-feedback></sea-ui-feedback><sea-session-expiry></sea-session-expiry><router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  title = 'sistema-evaluaciones-ui';
  private readonly _configService = inject(ConfiguracionEvaluacionesService);

  constructor() {
    this.limpiarPersistenciaLocalNoOficial();
  }

  public ngOnInit(): void {
    this._configService.cargar().subscribe({
      next: () => {},
      error: () => {}
    });
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
