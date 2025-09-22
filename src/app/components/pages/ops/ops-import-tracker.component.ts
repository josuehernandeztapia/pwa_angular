import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';
import { IntegratedImportTrackerService, ImportTrackerMetrics, IntegratedImportStatus } from '../../../services/integrated-import-tracker.service';

@Component({
  selector: 'app-ops-import-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 space-y-6" style="background: var(--bg-dark)">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-light)">Import Tracker</h1>
          <p style="color: var(--text-2)">Estado de importación, entregas y triggers</p>
        </div>
        <div class="flex items-center gap-2">
          <input class="border rounded-lg px-3 py-2 text-sm" [formControl]="clientIdCtrl" placeholder="Buscar por Client ID" />
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm" (click)="refresh()">Actualizar</button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-xl shadow p-4" style="background: var(--surface-dark); border: 1px solid var(--border-dark)">
          <div class="text-sm" style="color: var(--text-2)">Importaciones activas</div>
          <div class="text-2xl font-semibold">{{ (metrics$ | async)?.totalActiveImports ?? 0 }}</div>
        </div>
        <div class="rounded-xl shadow p-4" style="background: var(--surface-dark); border: 1px solid var(--border-dark)">
          <div class="text-sm" style="color: var(--text-2)">On-time rate</div>
          <div class="text-2xl font-semibold">{{ ((metrics$ | async)?.onTimeDeliveryRate ?? 0) | number:'1.0-0' }}%</div>
        </div>
        <div class="rounded-xl shadow p-4" style="background: var(--surface-dark); border: 1px solid var(--border-dark)">
          <div class="text-sm" style="color: var(--text-2)">Tiempo medio en tránsito</div>
          <div class="text-2xl font-semibold">{{ (metrics$ | async)?.averageTransitTime ?? 0 }} d</div>
        </div>
        <div class="rounded-xl shadow p-4" style="background: var(--surface-dark); border: 1px solid var(--border-dark)">
          <div class="text-sm" style="color: var(--text-2)">Retrasadas</div>
          <div class="text-2xl font-semibold">{{ (metrics$ | async)?.delayedImports ?? 0 }}</div>
        </div>
      </div>

      <!-- Integrated status for a client -->
      <div class="rounded-xl shadow p-6" *ngIf="(status$ | async) as status" style="background: var(--surface-dark); border: 1px solid var(--border-dark)">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold" style="color: var(--text-light)">Cliente: {{ currentClientId || '—' }}</h2>
          <div class="text-sm" *ngIf="status?.lastSyncDate" style="color: var(--text-2)">Última sync: {{ status.lastSyncDate | date:'short' }}</div>
        </div>

        <ng-container *ngIf="status; else emptyState">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="p-4 border rounded-lg" style="border-color: var(--border-dark)">
              <div class="text-sm mb-1" style="color: var(--text-2)">Orden de entrega</div>
              <div class="font-medium">{{ status.deliveryOrderId || '—' }}</div>
            </div>
            <div class="p-4 border rounded-lg" style="border-color: var(--border-dark)">
              <div class="text-sm mb-1" style="color: var(--text-2)">Contrato</div>
              <div class="font-medium">{{ status.contractId || '—' }}</div>
            </div>
            <div class="p-4 border rounded-lg" style="border-color: var(--border-dark)">
              <div class="text-sm mb-1" style="color: var(--text-2)">Entrega estimada</div>
              <div class="font-medium">{{ status.estimatedDeliveryDate ? (status.estimatedDeliveryDate | date:'mediumDate') : '—' }}</div>
            </div>
            <div class="p-4 border rounded-lg" style="border-color: var(--border-dark)">
              <div class="text-sm mb-1" style="color: var(--text-2)">Sync status</div>
              <div class="font-medium">{{ status.syncStatus || '—' }}</div>
            </div>
          </div>

          <!-- Milestones -->
          <div class="mb-6">
            <h3 class="font-semibold mb-2">Milestones de Importación</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ng-container *ngFor="let m of milestoneKeys">
                <div class="border rounded-lg p-3 flex items-center justify-between" style="border-color: var(--border-dark)">
                  <div>
                    <div class="text-sm" style="color: var(--text-2)">{{ m }}</div>
                    <div class="font-medium">{{ ($any(status)[m]?.status) || 'pending' }}</div>
                  </div>
                  <div class="flex gap-2">
                    <button class="text-xs px-2 py-1 rounded" style="background: var(--surface-dark); color: var(--text-2)" (click)="setMilestone(m, 'in_progress')">En curso</button>
                    <button class="text-xs px-2 py-1 rounded bg-green-600 text-white" (click)="setMilestone(m, 'completed')">Completar</button>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>

          <!-- Triggers -->
          <div>
            <h3 class="font-semibold mb-2" style="color: var(--text-light)">Triggers recientes</h3>
            <div class="border rounded-lg p-3" *ngIf="status.triggerHistory?.length; else noTriggers" style="border-color: var(--border-dark)">
              <div class="divide-y">
                <div class="py-2" *ngFor="let t of status.triggerHistory | slice:0:5">
                  <div class="text-sm" style="color: var(--text-2)">{{ t.triggerDate | date:'short' }} — {{ t.eventType }}</div>
                  <div class="text-xs" style="color: var(--text-2)">Umbral: {{ t.triggerPercentage }}% • Orden creada: {{ t.deliveryOrderCreated ? 'Sí' : 'No' }}</div>
                </div>
              </div>
            </div>
            <ng-template #noTriggers>
              <div class="text-sm" style="color: var(--text-2)">Sin triggers recientes.</div>
            </ng-template>
          </div>
        </ng-container>
        <ng-template #emptyState>
          <div class="text-sm" style="color: var(--text-2)">Ingresa un Client ID para ver el estado integrado.</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class OpsImportTrackerComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  metrics$: Observable<ImportTrackerMetrics> = of({
    totalActiveImports: 0,
    averageTransitTime: 0,
    onTimeDeliveryRate: 0,
    delayedImports: 0,
    milestoneStats: {} as any,
    monthlyImportVolume: [],
    delayTrends: []
  });

  status$: Observable<IntegratedImportStatus | null> = of(null);
  clientIdCtrl = new FormControl<string>('');
  currentClientId: string | null = null;

  milestoneKeys: (keyof IntegratedImportStatus)[] = [
    'pedidoPlanta',
    'unidadFabricada',
    'transitoMaritimo',
    'enAduana',
    'liberada'
  ] as any;

  constructor(private tracker: IntegratedImportTrackerService) {
    this.metrics$ = this.tracker.getImportTrackerMetrics().pipe(
      catchError(() => of({
        totalActiveImports: 0,
        averageTransitTime: 0,
        onTimeDeliveryRate: 0,
        delayedImports: 0,
        milestoneStats: {} as any,
        monthlyImportVolume: [],
        delayTrends: []
      }))
    );

    this.status$ = this.clientIdCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(v => this.currentClientId = (v || '').trim() || null),
      switchMap(v => v ? this.fetchStatus(v) : of(null))
    );
  }

  refresh(): void {
    const id = (this.clientIdCtrl.value || '').trim();
    if (id) {
      this.status$ = this.fetchStatus(id);
    }
  }

  private fetchStatus(clientId: string): Observable<IntegratedImportStatus | null> {
    return this.tracker.getIntegratedImportStatus(clientId).pipe(
      catchError(() => of(null))
    );
  }

  setMilestone(milestone: keyof IntegratedImportStatus, state: 'completed' | 'in_progress' | 'pending'): void {
    const id = (this.clientIdCtrl.value || '').trim();
    if (!id) return;
    if (!['pedidoPlanta','unidadFabricada','transitoMaritimo','enAduana','liberada'].includes(milestone as string)) return;
    this.tracker.updateImportMilestone(id, milestone as any, state).pipe(takeUntil(this.destroy$)).subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

