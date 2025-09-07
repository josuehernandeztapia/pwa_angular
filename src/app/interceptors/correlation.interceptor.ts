import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorrelationService } from '../services/correlation.service';

@Injectable()
export class CorrelationInterceptor implements HttpInterceptor {
  constructor(private correlation: CorrelationService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headerName = 'X-Correlation-Id';
    const currentId = this.correlation.getOrCreateCorrelationId();
    const alreadyHas = req.headers.has(headerName);
    const augmented = alreadyHas ? req : req.clone({ headers: req.headers.set(headerName, currentId) });
    return next.handle(augmented);
  }
}

