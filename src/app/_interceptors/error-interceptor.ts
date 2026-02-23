import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    tap({
      error: (err) => {
        if (err.status === 404) {
          console.error('404 request:', req.urlWithParams);
        }
      }
    })
  );
};
