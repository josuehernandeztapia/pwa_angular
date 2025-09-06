import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  /**
   * Minimal audit logger. Tries to POST to backend if configured; otherwise logs to console.
   */
  logEvent(eventType: string, payload: Record<string, unknown>): void {
    const auditEndpoint = (window as any).__AUDIT_ENDPOINT__ as string | undefined;
    const body = { eventType, timestamp: new Date().toISOString(), payload };
    try {
      if (auditEndpoint) {
        // Fire and forget
        this.http.post(auditEndpoint, body).subscribe({
          next: () => {},
          error: () => {
            // Fallback to console to avoid disrupting UX
            // eslint-disable-next-line no-console
            console.info('[audit:fallback]', body);
          }
        });
      } else {
        // eslint-disable-next-line no-console
        console.info('[audit]', body);
      }
    } catch {
      // eslint-disable-next-line no-console
      console.info('[audit:catch]', body);
    }
  }
}

