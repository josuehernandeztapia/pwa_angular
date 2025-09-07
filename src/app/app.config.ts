import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { ApiService } from './services/api.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { HttpClientService } from './services/http-client.service';
import { TESSERACT_CREATE_WORKER } from './tokens/ocr.tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptorsFromDi()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    },
    ApiService,
    HttpClientService
    ,
    {
      provide: TESSERACT_CREATE_WORKER,
      useValue: (lang: string, oem?: number, options?: any) => import('tesseract.js').then((m: any) => m.createWorker(lang, oem as any, options))
    }
  ]
};
