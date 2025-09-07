import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CorrelationService {
  private correlationId?: string;

  getOrCreateCorrelationId(): string {
    if (!this.correlationId) {
      this.correlationId = this.generateId();
    }
    return this.correlationId;
  }

  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  private generateId(): string {
    const random = globalThis.crypto && 'getRandomValues' in globalThis.crypto
      ? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('')
      : Math.random().toString(16).slice(2) + Date.now().toString(16);
    return `corr_${random}`;
  }
}

