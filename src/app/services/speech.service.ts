import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  constructor(private toast: ToastService) {}

  speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      speechSynthesis.speak(utterance);
    } else {
      this.toast.info('Tu navegador no soporta síntesis de voz');
    }
  }

  cancel(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
}

