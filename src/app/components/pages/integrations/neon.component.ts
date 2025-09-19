import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type IntegrationStatus = 'Pendiente' | 'Completado' | 'Error';

@Component({
  selector: 'app-neon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './neon.component.html'
})
export class NeonComponent {
  readonly title = 'NEON';

  requestText = JSON.stringify({
    query: 'SELECT id, name FROM customers LIMIT 5;',
    params: []
  }, null, 2);

  requestPayload: unknown = null;
  responsePayload: unknown = null;

  loading = signal(false);
  status = signal<IntegrationStatus>('Pendiente');

  submit(): void {
    this.responsePayload = null;
    this.status.set('Pendiente');

    try {
      this.requestPayload = JSON.parse(this.requestText || '{}');
    } catch (error) {
      this.status.set('Error');
      this.responsePayload = { message: 'JSON inválido en request' };
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      this.responsePayload = {
        ok: true,
        rows: [
          { id: 'c1', name: 'Alice' },
          { id: 'c2', name: 'Bob' },
          { id: 'c3', name: 'Charlie' }
        ],
        rowCount: 3
      };
      this.status.set('Completado');
      this.loading.set(false);
    }, 800);
  }

  reset(): void {
    this.requestText = JSON.stringify({
      query: 'SELECT id, name FROM customers LIMIT 5;',
      params: []
    }, null, 2);
    this.requestPayload = null;
    this.responsePayload = null;
    this.status.set('Pendiente');
    this.loading.set(false);
  }
}

