import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type IntegrationStatus = 'Pendiente' | 'Completado' | 'Error';

@Component({
  selector: 'app-odoo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './odoo.component.html'
})
export class OdooComponent {
  readonly title = 'Odoo';

  requestText = JSON.stringify({
    model: 'res.partner',
    method: 'search_read',
    args: [['is_company', '=', true]],
    kwargs: { limit: 5, fields: ['name', 'email'] }
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
        count: 3,
        data: [
          { id: 1, name: 'Acme Corp', email: 'info@acme.com' },
          { id: 2, name: 'Globex', email: 'hello@globex.io' },
          { id: 3, name: 'Initech', email: 'contact@initech.dev' }
        ]
      };
      this.status.set('Completado');
      this.loading.set(false);
    }, 900);
  }

  reset(): void {
    this.requestText = JSON.stringify({
      model: 'res.partner',
      method: 'search_read',
      args: [['is_company', '=', true]],
      kwargs: { limit: 5, fields: ['name', 'email'] }
    }, null, 2);
    this.requestPayload = null;
    this.responsePayload = null;
    this.status.set('Pendiente');
    this.loading.set(false);
  }
}

