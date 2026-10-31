import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { errorInterceptor } from './_interceptors/error-interceptor';
import { CalculatorPreloadStrategy } from './_services/calculator-preload.strategy';

const httpProviders = provideHttpClient(withInterceptors([errorInterceptor]));

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      }),
      withPreloading(CalculatorPreloadStrategy)
    ),
    httpProviders,
  ],
};
