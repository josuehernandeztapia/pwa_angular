import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { interval, filter } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SwUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly toast = inject(ToastService);

  init(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Listen for new versions becoming ready
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(async () => {
        try {
          const shouldReload = window.confirm('Hay una nueva versión disponible. ¿Actualizar ahora?');
          if (shouldReload) {
            await this.swUpdate.activateUpdate();
            document.location.reload();
          }
        } catch (err) {
          console.error('SW update activation failed', err);
          this.toast.error('No se pudo actualizar la aplicación');
        }
      });

    // Periodic check for updates (cada 6 horas)
    interval(6 * 60 * 60 * 1000).subscribe(() => {
      this.checkForUpdates();
    });

    // Initial check shortly after startup
    setTimeout(() => this.checkForUpdates(), 30_000);
  }

  private async checkForUpdates(): Promise<void> {
    try {
      const updated = await this.swUpdate.checkForUpdate();
      if (updated) {
        this.toast.info('Descargando actualización en segundo plano…');
      }
    } catch (err) {
      // Silent failure; logs for diagnostics only
      console.debug('No SW update available or check failed', err);
    }
  }
}

