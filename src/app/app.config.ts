import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { errorInterceptor } from './_interceptors/error-interceptor';

const httpProviders = provideHttpClient(withInterceptors([errorInterceptor]));

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    httpProviders
  ],
};
