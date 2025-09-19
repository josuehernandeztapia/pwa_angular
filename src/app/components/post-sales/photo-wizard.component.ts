import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ManualEntryComponent, ManualEntryData } from '../shared/manual-entry/manual-entry.component';
import { ManualOCREntryComponent, ManualOCRData } from '../shared/manual-ocr-entry/manual-ocr-entry.component';
import { VisionOCRRetryService, OCRResult } from '../../services/vision-ocr-retry.service';
import { CasesService, CaseRecord } from '../../services/cases.service';
import { environment } from '../../../environments/environment';
import { PostSalesQuoteDraftService, PartSuggestion } from '../../services/post-sales-quote-draft.service';
import { PostSalesQuoteApiService } from '../../services/post-sales-quote-api.service';
import { timeout, catchError, retry, delayWhen, tap, switchMap } from 'rxjs/operators';
import { of, timer, throwError } from 'rxjs';

type StepId = 'plate' | 'vin' | 'odometer' | 'evidence';

interface StepState {
  id: StepId;
  title: string;
  hint: string;
  example?: string; // path to example image
  file?: File | null;
  uploading?: boolean;
  done?: boolean;
  confidence?: number;
  missing?: string[];
  error?: string | null;
}

@Component({
  selector: 'app-photo-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage, ManualEntryComponent, ManualOCREntryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-card p-4 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700" *ngIf="enabled; else disabledTpl">
      <h1 class="text-lg font-semibold">Postventa — Fotos</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Sube 4 fotos básicas para validar el expediente.</p>

      <div class="mt-3" *ngIf="!caseId">
        <button class="ui-btn ui-btn-primary" (click)="next()">Iniciar</button>
      </div>

      <div class="mt-3 divide-y divide-[var(--border)]">
        <div class="py-3" *ngFor="let step of steps">
          <div class="flex items-center justify-between">
            <div class="font-medium">{{ step.title }}</div>
            <div class="text-sm" [ngClass]="getStatusClass(step)">{{ getStatusText(step) }}</div>
          </div>
          <div class="mt-2 flex items-center gap-3">
            <input type="file" accept="image/*" capture="environment" class="ui-input" data-cy="postventa-upload" (change)="onFileSelected($event, step.id)" [disabled]="step.uploading || !caseId" />
            <button class="ui-btn ui-btn-secondary" (click)="retake(step.id)" *ngIf="step.done">Repetir</button>
          </div>
          <div class="mt-2" *ngIf="step.uploading">
            <div class="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            <div class="text-xs text-slate-500 mt-1" *ngIf="step.id === 'vin' && vinRetryAttempt > 0" data-cy="postventa-ocr">Intento VIN {{ vinRetryAttempt }}/3</div>
          </div>
        </div>
      </div>

      <div class="mt-4" *ngIf="caseId">
        <div class="text-xs text-slate-500" data-cy="postventa-ocr">
          OCR: {{ isAllGood ? 'Validado' : (summaryIssues.length ? 'Pendiente' : 'Pendiente') }}
        </div>
        <div class="mt-2" *ngIf="!isAllGood && summaryIssues.length">
          <ul class="text-xs text-slate-500 list-disc pl-5">
            <li *ngFor="let msg of summaryIssues">{{ msg }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-4" *ngIf="enableAddToQuote && recommendedParts.length > 0" data-cy="postventa-refacciones">
        <div class="text-sm font-semibold mb-2">Piezas sugeridas</div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-slate-500">
              <tr>
                <th class="text-left py-2">Pieza</th>
                <th class="text-left py-2">OEM</th>
                <th class="text-left py-2">Equivalente</th>
                <th class="text-right py-2">Stock</th>
                <th class="text-right py-2">Precio</th>
                <th class="text-right py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of recommendedParts">
                <td class="py-2">{{ p.name }}</td>
                <td class="py-2">{{ p.oem }}</td>
                <td class="py-2">{{ p.equivalent || '—' }}</td>
                <td class="py-2 text-right">{{ p.stock }}</td>
                <td class="py-2 text-right">{{ p.priceMXN | currency:'MXN':'symbol-narrow':'1.0-0' }}</td>
                <td class="py-2 text-right">
                  <button class="ui-btn ui-btn-primary" (click)="addToQuote(p)">Agregar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="text-sm mt-2">En cotización provisional: <strong>{{ draftCount }}</strong></div>
      </div>

      <div class="mt-4 flex justify-end">
        <button class="ui-btn ui-btn-primary" [disabled]="!caseId" (click)="next()" data-cy="wizard-next">{{ ctaText }}</button>
      </div>
    </div>

    <!-- P0.2 Surgical Fix - Manual OCR Entry Modal -->
    <app-manual-ocr-entry
      [documentType]="manualEntryType || ''"
      [isOpen]="showManualEntry"
      (save)="onManualOCRSave($event)"
      (cancel)="onManualCancel()">
    </app-manual-ocr-entry>

    <ng-template #disabledTpl>
      <div class="ui-card p-4 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700">
        <div class="text-sm text-slate-500">El Wizard de Postventa está desactivado. Actívalo con el flag environment.features.enablePostSalesWizard.</div>
      </div>
    </ng-template>
  `,
  styles: [`
    .wizard-container { padding: 20px; color: #e5e7eb; background: #0f1419; min-height: 100vh; }
    .title { font-size: 22px; font-weight: 700; color: #06d6a0; margin-bottom: 12px; }
    .steps { display: grid; grid-template-columns: 1fr; gap: 12px; }
    .step-card { border: 1px solid #2d3748; border-radius: 10px; background: #1a1f2e; }
    .step-card.active { border-color: #06d6a0; }
    .step-card.done { opacity: 0.95; }
    .step-header { display: flex; align-items: center; gap: 10px; padding: 12px; border-bottom: 1px solid #2d3748; }
    .badge { width: 24px; height: 24px; border-radius: 999px; background: #06d6a0; color: #0b1411; font-weight: 800; display: flex; align-items: center; justify-content: center; }
    .step-title { font-weight: 600; }
    .status .ok { color: #10b981; font-weight: 700; }
    .status .warn { color: #f59e0b; font-weight: 700; }
    .step-body { padding: 12px; display: grid; grid-template-columns: 1fr; gap: 10px; }
    .hint { color: #a0aec0; font-size: 14px; }
    .example { border: 1px dashed #374151; border-radius: 8px; padding: 8px; }
    .example-label { font-size: 12px; color: #9ca3af; margin-bottom: 6px; }
    .example img { max-width: 100%; border-radius: 6px; }
    .actions { display:flex; align-items:center; gap: 10px; }
    .upload { color: #93c5fd; font-size: 14px; }
    .qa .ok { color:#10b981; }
    .qa .warn { color:#f59e0b; }
    .qa .missing { margin: 6px 0 0 16px; color:#fbbf24; }
    .banner { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 14px; }
    .banner.info { background: #1f2937; border: 1px solid #374151; }
    .banner.warn { background: #5b3a0a; border: 1px solid #b45309; color: #fde68a; }
    .banner.success { background: #0f5132; border: 1px solid #14532d; color: #bbf7d0; }
    .btn { padding: 8px 12px; border-radius: 8px; border: 1px solid #374151; background:#111827; color: #e5e7eb; cursor: pointer; }
    .btn:hover { background:#0b1220; }
    .btn.primary { background:#059669; border-color:#059669; }
    .btn.retry { background:#4b5563; }
    .summary { margin-top: 12px; }
    .cta-row { display:flex; gap: 8px; margin-top:8px; }
    .footer { margin-top: 16px; display:flex; justify-content: flex-end; }
    .badge-time { margin-top: 6px; font-size: 12px; color: #93c5fd; }

    /* Parts chips */
    .parts-suggested { margin-top: 16px; border-top: 1px dashed #374151; padding-top: 12px; }
    .parts-title { color:#fbbf24; font-size:16px; margin: 0 0 8px 0; }
    .chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
    .chip { border:1px solid #374151; background:#0b1220; border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:6px; }
    .chip-main { display:flex; justify-content:space-between; align-items:center; }
    .chip-name { font-weight:700; color:#e5e7eb; }
    .chip-price { color:#06d6a0; font-weight:700; }
    .chip-meta { display:flex; gap:8px; color:#9ca3af; font-size:12px; }
    .chip-meta .meta.low { color:#f87171; }
    .btn.add { align-self:flex-start; font-size:12px; padding:6px 8px; }
    .draft-summary { margin-top:8px; font-size:13px; color:#e5e7eb; display:flex; align-items:center; gap:8px; }
    .btn.clear { background:#374151; }
    .banner-actions { margin-top: 8px; }
    .btn.retry-vin { background: #b45309; border-color: #b45309; color: #fde68a; font-size: 12px; padding: 6px 10px; }
    .upload-progress { margin-top: 4px; color: #93c5fd; font-size: 12px; }
  `]
})
export class PhotoWizardComponent {
  enabled = environment.features?.enablePostSalesWizard === true;
  threshold = 0.7; // QA threshold
  environment = environment;
  enableAddToQuote = environment.features?.enablePostSalesAddToQuote === true;

  steps: StepState[] = [
    { id: 'plate', title: 'Placa de circulación', hint: 'Asegúrate de buena luz y enfoque. Evita reflejos.', example: 'assets/examples/plate-example.jpg' },
    { id: 'vin', title: 'VIN plate', hint: 'Captura el VIN completo y legible.', example: 'assets/examples/vin-example.jpg' },
    { id: 'odometer', title: 'Odómetro', hint: 'Captura el marcador con nitidez y sin movimiento.', example: 'assets/examples/odometer-example.jpg' },
    { id: 'evidence', title: 'Evidencia', hint: 'Una foto general de la unidad para contexto.', example: 'assets/examples/evidence-example.jpg' },
  ];

  currentIndex = 0;
  caseId: string | null = null;
  private startTimeMs: number | null = null;

  // P0.2 Surgical Fix - Manual Entry State
  showManualEntry = false;
  manualEntryType: StepId | null = null;
  private sentFirstRecommendation = false;
  private sentNeedInfo = false;
  showVinDetectionBanner = false;
  firstRecommendationMs: number | null = null;
  draftCount = 0;
  recommendedParts: PartSuggestion[] = [];
  vinRetryAttempt = 0;

  constructor(
    private cases: CasesService,
    private quoteDraft: PostSalesQuoteDraftService,
    private quoteApi: PostSalesQuoteApiService,
    private ocrRetryService: VisionOCRRetryService
  ) {
    if (this.enableAddToQuote) {
      this.recommendedParts = this.buildRecommendedParts();
      this.draftCount = this.quoteDraft.getCount();
    }
  }

  get ctaText(): string {
    if (!this.caseId) return 'Iniciar';
    if (this.currentIndex < this.steps.length - 1) return 'Siguiente';
    return this.isAllGood ? 'Continuar (Caso listo)' : 'Continuar con pendientes';
  }

  get needsVin(): boolean { return this.hasMissing('vin'); }
  get needsOdometer(): boolean { return this.hasMissing('odometer'); }
  get needsEvidence(): boolean { return this.hasMissing('evidence'); }

  get isAllGood(): boolean {
    const vin = this.find('vin');
    const odo = this.find('odometer');
    const ev = this.find('evidence');
    return !!(vin?.done && (vin.confidence || 0) >= this.threshold && (!vin.missing || vin.missing.length === 0)
      && odo?.done && (odo.confidence || 0) >= this.threshold && (!odo.missing || odo.missing.length === 0)
      && ev?.done && (ev.confidence || 0) >= this.threshold && (!ev.missing || ev.missing.length === 0));
  }

  get summaryIssues(): string[] {
    const issues: string[] = [];
    ['vin','odometer','evidence'].forEach((k) => {
      const s = this.find(k as StepId);
      if (!s?.done) issues.push(`${this.titleFor(k as StepId)} pendiente`);
      else if ((s.confidence || 0) < this.threshold) issues.push(`${this.titleFor(k as StepId)} con baja confianza`);
      if (s?.missing && s.missing.length > 0) issues.push(`${this.titleFor(k as StepId)}: faltan ${s.missing.join(', ')}`);
    });
    return issues;
  }

  get showNeedInfoRecording(): boolean {
    if (!this.caseId) return false;
    if (this.sentNeedInfo) return false;
    const allTried = this.steps.filter(s => s.id !== 'plate').every(s => s.done);
    if (allTried && !this.isAllGood) {
      const missing: string[] = [];
      if (this.needsVin) missing.push('vin');
      if (this.needsOdometer) missing.push('odometer');
      if (this.needsEvidence) missing.push('evidence');
      this.cases.recordNeedInfo(this.caseId, missing).subscribe();
      this.sentNeedInfo = true;
      try {
        const raw = localStorage.getItem('kpi:needInfo:agg');
        const agg = raw ? JSON.parse(raw) : { need: 0, total: 0 };
        agg.need = (agg.need || 0) + 1;
        agg.total = (agg.total || 0) + 1;
        localStorage.setItem('kpi:needInfo:agg', JSON.stringify(agg));
      } catch {}
    }
    return this.sentNeedInfo;
  }

  private titleFor(id: StepId): string { return this.find(id)?.title || id; }
  private find(id: StepId) { return this.steps.find(s => s.id === id); }
  private hasMissing(key: 'vin' | 'odometer' | 'evidence'): boolean {
    const s = this.find(key);
    return !!(s && s.done && (s.missing?.includes(key) || (s.confidence || 0) < this.threshold));
  }

  onExampleError(evt: Event) {
    const img = evt.target as HTMLImageElement;
    img.style.display = 'none';
  }

  openManualEntry(stepId: StepId) {
    if (stepId === 'vin' || stepId === 'odometer') {
      this.manualEntryType = stepId;
      this.showManualEntry = true;
    }
  }

  onManualOCRSave(data: ManualOCRData) {
    if (!this.manualEntryType) return;

    const step = this.find(this.manualEntryType);
    if (step) {
      step.done = true;
      step.confidence = data.confidence;
      step.missing = [];
      step.error = null;

      if (this.caseId) {
        console.log(`📝 Manual OCR data for ${this.manualEntryType}:`, data.fields);
      }
    }

    this.showManualEntry = false;
    this.manualEntryType = null;
  }

  onManualCancel() {
    this.showManualEntry = false;
    this.manualEntryType = null;
  }

  next() {
    if (!this.caseId) {
      this.cases.createCase().subscribe(rec => {
        this.caseId = rec.id;
        this.startTimeMs = performance.now();
      });
      return;
    }
    if (this.currentIndex < this.steps.length - 1) this.currentIndex += 1;
  }

  jumpTo(id: StepId) {
    const idx = this.steps.findIndex(s => s.id === id);
    if (idx >= 0) this.currentIndex = idx;
  }

  retake(id: StepId) {
    const s = this.find(id);
    if (!s) return;
    s.file = null;
    s.uploading = false;
    s.done = false;
    s.confidence = undefined;
    s.missing = undefined;
    s.error = null;
    this.jumpTo(id);
  }

  onFileSelected(evt: Event, id: StepId) {
    const input = evt.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file || !this.caseId) return;
    const step = this.find(id);
    if (!step) return;
    step.file = file;
    step.uploading = true;
    step.error = null;

    this.uploadWithOCRRetry(this.caseId, id, file).subscribe({
      next: ({ attachment, ocr }: any) => {
        step.uploading = false;
        step.done = true;
        step.confidence = ocr.confidence ?? 0;
        step.missing = ocr.missing || [];

        if ((ocr as any).requiresManualReview && id === 'vin') {
          this.showVinDetectionBanner = true;
        }

        if (!this.sentFirstRecommendation && this.isAllGood && this.startTimeMs != null) {
          const elapsed = performance.now() - this.startTimeMs;
          this.firstRecommendationMs = Math.round(elapsed);
          this.sentFirstRecommendation = true;
          this.cases.recordFirstRecommendation(this.caseId!, this.firstRecommendationMs).subscribe();
          try {
            const raw = localStorage.getItem('kpi:firstRecommendation:list');
            const arr = raw ? JSON.parse(raw) : [];
            arr.push(this.firstRecommendationMs);
            localStorage.setItem('kpi:firstRecommendation:list', JSON.stringify(arr));
          } catch {}
        }
      },
      error: (err: any) => {
        step.uploading = false;
        step.error = 'Error al subir o analizar la imagen';
      }
    });
  }

  private uploadWithOCRRetry(caseId: string, stepId: StepId, file: File) {
    const mockImageUrl = `data:image/jpeg;base64,${stepId}-${Date.now()}`;

    return this.ocrRetryService.ocrWithRetry(mockImageUrl, stepId, {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      confidenceThreshold: this.threshold,
      enableFallback: true
    }).pipe(
      tap(result => {
        if (stepId === 'vin' && result.retryCount) {
          this.vinRetryAttempt = result.retryCount;
        }
      }),
      switchMap(ocrResult => {
        if (ocrResult.fallbackUsed) {
          return of({
            attachment: null,
            ocr: {
              confidence: 0,
              missing: [`OCR falló después de ${ocrResult.retryCount || 0} intentos - fallback manual activado`],
              detectedVin: stepId === 'vin' ? 'MANUAL_ENTRY_REQUIRED' : null,
              requiresManualReview: true,
              retryCount: ocrResult.retryCount
            }
          });
        }

        return of({
          attachment: { id: `mock-${stepId}-${Date.now()}` },
          ocr: {
            confidence: ocrResult.confidence,
            missing: this.extractMissingFields(ocrResult.fields, stepId),
            detectedVin: stepId === 'vin' ? ocrResult.fields['vin'] : null,
            processingTime: ocrResult.processingTime,
            retryCount: ocrResult.retryCount
          }
        });
      })
    );
  }

  private extractMissingFields(fields: Record<string, any>, stepId: StepId): string[] {
    const missing: string[] = [];

    switch (stepId) {
      case 'vin':
        if (!fields['vin']) missing.push('vin');
        break;
      case 'odometer':
        if (!fields['kilometers']) missing.push('kilometers');
        break;
      case 'plate':
        if (!fields['plate']) missing.push('plate');
        break;
      case 'evidence':
        break;
    }

    return missing;
  }

  retakeVinWithRetry() {
    const vinStep = this.find('vin');
    if (!vinStep) return;

    this.showVinDetectionBanner = false;
    this.vinRetryAttempt = 0;
    this.retake('vin');
  }

  getStatusText(step: StepState): string {
    if (step.uploading) return 'Pendiente';
    if (step.error) return 'Error';
    if (step.done && (step.confidence || 0) >= this.threshold && (!step.missing || step.missing.length === 0)) return 'Validado';
    return 'Pendiente';
  }

  getStatusClass(step: StepState): string {
    const status = this.getStatusText(step);
    switch (status) {
      case 'Validado':
        return 'text-green-600';
      case 'Error':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  }

  private buildRecommendedParts(): PartSuggestion[] {
    return [
      { id: 'oil-filter', name: 'Filtro de aceite', oem: 'A123-OF', equivalent: 'WIX-57045', stock: 12, priceMXN: 189 },
      { id: 'air-filter', name: 'Filtro de aire', oem: 'B456-AF', equivalent: 'MANN-C26168', stock: 5, priceMXN: 349 },
      { id: 'front-brake-pads', name: 'Pastillas freno (delanteras)', oem: 'C789-BP', equivalent: 'BREMBO-P1234', stock: 0, priceMXN: 899 },
      { id: 'wiper-blade', name: 'Limpia parabrisas', oem: 'D234-WB', equivalent: 'BOSCH-AEROTWIN', stock: 20, priceMXN: 249 }
    ];
  }

  addToQuote(p: PartSuggestion) {
    if (!this.enableAddToQuote) return;
    if ((this.environment.features as any)?.enableOdooQuoteBff) {
      const meta = { caseId: this.caseId };
      this.quoteApi.getOrCreateDraftQuote(undefined, meta).subscribe(({ quoteId }) => {
        this.quoteApi.addLine(quoteId, p, 1, meta).subscribe(() => {
          this.draftCount += 1;
        });
      });
    } else {
      this.quoteDraft.addItem(p, 1);
      this.draftCount = this.quoteDraft.getCount();
    }
  }

  clearDraft() {
    if (!this.enableAddToQuote) return;
    this.quoteDraft.clear();
    this.draftCount = 0;
  }
}