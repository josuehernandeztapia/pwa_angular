import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type IntegrationStatus = 'Pendiente' | 'Completado' | 'Error';

@Component({
  selector: 'app-callbacks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './callbacks.component.html'
})
export class CallbacksComponent {
  readonly title = 'Callbacks';

  requestText = JSON.stringify({
    event: 'order.created',
    url: 'https://example.com/callback',
    payload: { orderId: '12345', total: 199.99 }
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
        delivered: true,
        statusCode: 200,
        receivedAt: new Date().toISOString()
      };
      this.status.set('Completado');
      this.loading.set(false);
    }, 700);
  }

  reset(): void {
    this.requestText = JSON.stringify({
      event: 'order.created',
      url: 'https://example.com/callback',
      payload: { orderId: '12345', total: 199.99 }
    }, null, 2);
    this.requestPayload = null;
    this.responsePayload = null;
    this.status.set('Pendiente');
    this.loading.set(false);
  }
}

