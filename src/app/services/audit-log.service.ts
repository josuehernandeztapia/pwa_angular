import { Injectable } from '@angular/core';
import { CorrelationService } from './correlation.service';

export interface AuditEntry<T = unknown> {
  timestamp: string;
  actor: string;
  action: string;
  entity?: string;
  entityId?: string;
  before?: T;
  after?: T;
  correlationId: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private buffer: AuditEntry[] = [];

  constructor(private correlation: CorrelationService) {}

  record<T>(entry: Omit<AuditEntry<T>, 'timestamp' | 'correlationId'>): void {
    const full: AuditEntry<T> = {
      ...entry,
      timestamp: new Date().toISOString(),
      correlationId: this.correlation.getOrCreateCorrelationId(),
    };
    this.buffer.push(full);
  }

  list(): AuditEntry[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }
}

