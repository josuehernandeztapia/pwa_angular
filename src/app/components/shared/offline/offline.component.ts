import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offline">
      <div class="icon">📴</div>
      <h1>Sin conexión</h1>
      <p>No pudimos conectar con el servidor. Revisa tu red e inténtalo de nuevo.</p>
      <button (click)="retry()">Reintentar</button>
    </div>
  `,
  styles: [`
    .offline { min-height: 60vh; display: grid; place-items: center; text-align: center; gap: 12px; }
    .icon { font-size: 48px; }
    h1 { font-size: 24px; }
    button { padding: 12px 16px; border-radius: 8px; border: none; background: #06b6d4; color: #fff; font-weight: 600; cursor: pointer; }
    button:hover { background: #0891b2; }
  `]
})
export class OfflineComponent {
  retry(): void { window.location.reload(); }
}

