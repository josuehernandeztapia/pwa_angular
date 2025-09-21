import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { GnvHealthService, StationHealthRow } from '../../../services/gnv-health.service';

@Component({
  selector: 'app-gnv-health',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-card p-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">⛽ GNV T+1 — Salud por estación</h2>
          <p class="text-sm text-[var(--text-2)]">Estado de la ingesta del día anterior por estación</p>
        </div>
        <div class="flex gap-2">
          <a class="ui-btn ui-btn-secondary" href="assets/gnv/template.csv" download data-cy="dl-template">Plantilla CSV</a>
          <a class="ui-btn ui-btn-secondary" href="assets/gnv/gnv_guide.pdf" target="_blank" rel="noopener" data-cy="dl-guide">Guía PDF</a>
          <a class="ui-btn ui-btn-secondary" href="assets/gnv/ingesta_yesterday.csv" download data-cy="dl-latest">Última ingesta</a>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <input type="file" accept=".csv" class="ui-input" data-cy="gnv-upload" (change)="onCsvSelected($event)" />
        <button class="ui-btn ui-btn-primary" data-cy="gnv-upload-btn" (click)="ingestCsv()" [disabled]="!selectedCsv">Subir CSV</button>
      </div>

      <div class="mt-4" *ngIf="rows().length === 0">
        <div class="space-y-2" aria-busy="true">
          <div class="h-8 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div class="h-8 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div class="h-8 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        </div>
      </div>

      <div class="mt-4 overflow-x-auto" *ngIf="rows().length > 0">
        <table class="w-full text-sm" data-cy="gnv-table">
          <thead class="text-[var(--text-2)]">
            <tr>
              <th class="text-left py-2">Estación</th>
              <th class="text-left py-2">Archivo</th>
              <th class="text-right py-2">Total</th>
              <th class="text-right py-2">Aceptadas</th>
              <th class="text-right py-2">Rechazadas</th>
              <th class="text-right py-2">Warnings</th>
              <th class="text-left py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows(); trackBy: trackByStation" class="border-t border-[var(--border-dark)]">
              <td class="py-2 whitespace-nowrap">{{ r.stationName }}</td>
              <td class="py-2">{{ r.fileName || '—' }}</td>
              <td class="py-2 text-right">{{ r.rowsTotal }}</td>
              <td class="py-2 text-right">{{ r.rowsAccepted }}</td>
              <td class="py-2 text-right">{{ r.rowsRejected }}</td>
              <td class="py-2 text-right">{{ r.warnings }}</td>
              <td class="py-2">
                <span [ngClass]="getStatusClass(r)" data-cy="status-text">{{ getStatusText(r) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .status-green { color: var(--green); }
    .status-yellow { color: var(--yellow); }
    .status-red { color: var(--red); }
    .status-pending { color: var(--text-2); }
  `]
})
export class GnvHealthComponent implements OnInit {
  private svc = inject(GnvHealthService);
  rows = signal<StationHealthRow[]>([]);
  selectedCsv: File | null = null;

  ngOnInit(): void {
    this.svc.getYesterdayHealth().subscribe((rows: StationHealthRow[]) => this.rows.set(rows));
  }

  trackByStation(_: number, r: StationHealthRow) { return r.stationId; }

  getStatusText(r: StationHealthRow): string {
    switch (r.status) {
      case 'green': return 'OK';
      case 'yellow': return 'Degradado';
      case 'red': return 'Offline';
      default: return 'Pendiente';
    }
  }

  getStatusClass(r: StationHealthRow): string {
    switch (r.status) {
      case 'green': return 'status-green';
      case 'yellow': return 'status-yellow';
      case 'red': return 'status-red';
      default: return 'status-pending';
    }
  }

  onCsvSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedCsv = input.files && input.files[0] ? input.files[0] : null;
  }

  ingestCsv() {
    if (!this.selectedCsv) return;
    // Minimal stub: simulate ingestion and refresh rows
    setTimeout(() => {
      this.svc.getYesterdayHealth().subscribe((rows: StationHealthRow[]) => this.rows.set(rows));
      this.selectedCsv = null;
    }, 500);
  }
}
