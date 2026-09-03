import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { GlobalLoadingService } from '../services/global-loading.service';

export const globalLoadingInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url.includes('/assets/') || !['GET', 'HEAD'].includes(request.method)) {
    return next(request);
  }

  const loading = inject(GlobalLoadingService);
  loading.iniciar();
  return next(request).pipe(finalize(() => loading.finalizar()));
};
