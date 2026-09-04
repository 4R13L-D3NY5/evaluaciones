import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UiFeedbackService } from '../services/ui-feedback.service';

const ENDPOINTS_PUBLICOS = ['/api/auth/login', '/api/auth/session', '/api/auth/logout'];

export const authSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const feedback = inject(UiFeedbackService);
  const router = inject(Router);

  if (ENDPOINTS_PUBLICOS.some(endpoint => request.url.includes(endpoint))) {
    return next(request);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.notificarSesionExpirada()) {
        void feedback.mostrar(
          'Tu sesión ha finalizado por seguridad. Presiona Aceptar para volver al inicio de sesión.',
          'Sesión finalizada',
          'warning'
        ).then(() => {
          void auth.cerrarSesion().subscribe({
            next: () => void router.navigateByUrl('/login'),
            error: () => void router.navigateByUrl('/login')
          });
        });
      }
      return throwError(() => error);
    })
  );
};
