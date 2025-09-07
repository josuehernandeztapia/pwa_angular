import { Component, Input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-error-navigator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="errorIds().length > 0" class="error-summary" role="alert" aria-live="assertive">
      <p class="error-title">Se encontraron {{ errorIds().length }} errores.</p>
      <button type="button" class="btn-next" (click)="focusNextError()">
        Ir al siguiente error
      </button>
    </div>
  `,
  styles: [`
    .error-summary {
      border: 1px solid #b91c1c;
      background: #7f1d1d;
      color: #fecaca;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .error-title { margin: 0 0 8px; font-weight: 600; }
    .btn-next {
      background: #ef4444; color: #fff; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer;
    }
    .btn-next:focus { outline: 2px solid #fca5a5; outline-offset: 2px; }
  `]
})
export class FormErrorNavigatorComponent {
  @Input() errorIdsInput: string[] = [];
  errorIds = signal<string[]>([]);
  private currentIndex = 0;

  constructor() {
    effect(() => {
      this.errorIds.set(this.errorIdsInput.filter(Boolean));
      this.currentIndex = 0;
    });
  }

  focusNextError(): void {
    const ids = this.errorIds();
    if (ids.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % ids.length;
    const targetId = ids[this.currentIndex];
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el instanceof HTMLElement) {
        el.focus();
      }
    }
  }
}

