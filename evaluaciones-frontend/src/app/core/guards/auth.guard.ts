import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppRole } from '../models/auth.models';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.restaurarSesion().pipe(
    map(usuario => usuario ? true : router.createUrlTree(['/login'])),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.restaurarSesion().pipe(
    map(usuario => usuario ? router.createUrlTree(['/dashboard']) : true),
    catchError(() => of(true))
  );
};

export const roleGuard = (roles: AppRole[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.restaurarSesion().pipe(
    map(usuario => {
      if (!usuario) return router.createUrlTree(['/login']);
      if (usuario.rol === 'ADMINISTRADOR_SISTEMA' || roles.includes(usuario.rol)) return true;
      return router.createUrlTree(['/dashboard']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

export const passwordGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.restaurarSesion().pipe(
    map(usuario => {
      if (!usuario) return router.createUrlTree(['/login']);
      return usuario.debeCambiarContrasena
        ? router.createUrlTree(['/cambiar-contrasena'])
        : true;
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
