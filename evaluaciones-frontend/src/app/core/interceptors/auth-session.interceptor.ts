import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const ENDPOINTS_PUBLICOS = ['/api/auth/login', '/api/auth/session', '/api/auth/logout'];

export const authSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);

  if (ENDPOINTS_PUBLICOS.some(endpoint => request.url.includes(endpoint))) {
    return next(request);
  }

  return next(request).pipe(
    tap(() => auth.registrarActividadSesion()),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.notificarSesionExpirada()) {
        // El aviso visual y la navegación se resuelven en el componente global
        // para evitar que varias peticiones 401 apilen diálogos.
      }
      return throwError(() => error);
    })
  );
};
