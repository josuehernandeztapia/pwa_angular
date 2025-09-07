import { Injectable } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SwUpdateService {
  constructor(private swUpdate: SwUpdate, private toast: ToastService) {
    this.initialize();
  }

  private initialize(): void {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
      if (event.type === 'VERSION_READY') {
        this.toast.info('Nueva versión disponible. Actualizando en segundo plano...');
        this.swUpdate.activateUpdate().then(() => {
          this.toast.success('Actualización lista. Recargando...');
          setTimeout(() => document.location.reload(), 800);
        });
      }
    });
  }
}

