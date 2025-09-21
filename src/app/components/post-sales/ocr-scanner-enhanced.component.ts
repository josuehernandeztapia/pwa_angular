/**
 * 📱 Enhanced OCR Scanner Component
 * Production-ready OCR with retry mechanism and manual fallback
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HumanMicrocopyService } from '../../services/human-microcopy.service';
import { OCRProgress, OCRService } from '../../services/ocr.service';
import { HumanMessageComponent } from '../human-message/human-message.component';

export interface OCRScanResult {
  success: boolean;
  value: string;
  confidence: number;
  method: 'ocr' | 'manual';
  needsManualEntry: boolean;
}

export type ScanMode = 'vin' | 'odometer' | 'general';

@Component({
  selector: 'app-ocr-scanner-enhanced',
  standalone: true,
  imports: [CommonModule, FormsModule, HumanMessageComponent],
  template: `
    <div class="ui-card ocr-scanner-enhanced" [attr.data-testid]="'ocr-scanner-' + mode">
      
      <!-- Scanner Header -->
      <div class="scanner-header">
        <div class="scanner-title">
          <h3>{{ getScannerTitle() }}</h3>
        </div>
        <div class="scanner-status" [class]="'status-' + currentStatus">
          {{ getStatusText() }}
        </div>
      </div>

      <!-- Camera Input -->
      <div class="camera-section" *ngIf="!showManualEntry">
        <input 
          #fileInput
          type="file"
          accept="image/*"
          capture="environment"
          (change)="onImageSelected($event)"
          class="ui-input"
          [attr.data-testid]="mode + '-camera-input'"
          hidden>
          
        <div class="camera-preview" *ngIf="selectedImage">
          <img [src]="selectedImage" alt="Imagen seleccionada" class="preview-image">
          <button class="ui-btn ui-btn-secondary" (click)="retakePhoto()">
            Tomar otra foto
          </button>
        </div>
        
        <button 
          class="ui-btn ui-btn-primary camera-trigger"
          (click)="triggerCamera()"
          [disabled]="isProcessing"
          [attr.data-testid]="mode + '-camera-trigger'">
          <span>{{ selectedImage ? 'Procesar imagen' : 'Tomar foto del ' + getScannerLabel() }}</span>
        </button>
      </div>

      <!-- OCR Progress -->
      <div class="ocr-progress" *ngIf="isProcessing && ocrProgress">
        <div class="progress-header">
          <span class="progress-status">{{ ocrProgress.message }}</span>
          <span class="progress-attempt" *ngIf="ocrProgress.attempt">
            Intento {{ ocrProgress.attempt }}/{{ ocrProgress.maxAttempts }}
          </span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            [style.width.%]="ocrProgress.progress"
            [class]="'progress-' + ocrProgress.status">
          </div>
        </div>
      </div>

      <!-- OCR Results -->
      <div class="ocr-results" *ngIf="ocrResult && !showManualEntry">
        <div class="result-header">
          <span>{{ ocrResult.needsManualEntry ? 'Verificación necesaria' : 'Detectado automáticamente' }}</span>
        </div>
        
        <div class="result-value">
          <input 
            type="text" 
            [(ngModel)]="detectedValue"
            class="ui-input"
            [attr.data-testid]="mode + '-detected-value'"
            [placeholder]="getPlaceholderText()">
          <span class="confidence-badge" *ngIf="ocrResult.confidence > 0">
            {{ ocrResult.confidence }}% confianza
          </span>
        </div>

        <app-human-message 
          *ngIf="ocrResult.needsManualEntry"
          [context]="'ocr-manual-verification'"
          [data]="{ field: getScannerLabel(), confidence: ocrResult.confidence }">
        </app-human-message>
      </div>

      <!-- Manual Entry Mode -->
      <div class="manual-entry" *ngIf="showManualEntry">
        <div class="manual-header">
          <span>Entrada manual</span>
        </div>
        
        <div class="manual-input-group">
          <input 
            type="text"
            [(ngModel)]="manualValue"
            [placeholder]="getPlaceholderText()"
            class="ui-input"
            [attr.data-testid]="mode + '-manual-input'"
            (input)="onManualValueChange()">
          <div class="input-validation" *ngIf="validationMessage">
            <span>{{ validationMessage }}</span>
          </div>
        </div>

        <app-human-message 
          [context]="'manual-entry-guidance'"
          [data]="{ field: getScannerLabel() }">
        </app-human-message>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          class="ui-btn ui-btn-secondary"
          (click)="toggleManualEntry()"
          [disabled]="isProcessing"
          [attr.data-testid]="mode + '-toggle-manual'">
          {{ showManualEntry ? 'Usar cámara' : 'Entrada manual' }}
        </button>

        <button 
          class="ui-btn ui-btn-primary"
          (click)="confirmValue()"
          [disabled]="!canConfirm()"
          [attr.data-testid]="mode + '-confirm'">
          Confirmar {{ getScannerLabel() }}
        </button>
      </div>

      <!-- Error Display -->
      <div class="error-display" *ngIf="errorMessage">
        <app-human-message 
          context="ocr-error"
          [data]="{ error: errorMessage, canRetry: true }">
        </app-human-message>
        <button class="ui-btn ui-btn-secondary" (click)="retry()">
          Reintentar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ocr-scanner-enhanced {
      background: var(--surface-dark);
      border: 1px solid var(--border-dark);
      border-radius: 12px;
      padding: 16px;
      color: var(--text-light);
    }

    .scanner-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .scanner-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-light);
    }

    .scanner-status {
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      background: var(--bg-dark);
      color: var(--text-2);
      border: 1px solid var(--border-dark);
    }

    .status-success { color: var(--green); border-color: var(--green); }
    .status-error { color: var(--red); border-color: var(--red); }
    .status-processing { color: var(--yellow); border-color: var(--yellow); }

    .camera-section { margin-bottom: 16px; }

    .camera-preview { position: relative; margin-bottom: 12px; }

    .preview-image {
      width: 100%;
      max-height: 300px;
      object-fit: contain;
      border-radius: 10px;
      border: 1px solid var(--border-dark);
      background: var(--bg-dark);
    }

    .ocr-progress {
      margin-bottom: 12px;
      padding: 12px;
      background: var(--bg-dark);
      border: 1px solid var(--border-dark);
      border-radius: 10px;
    }

    .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 13px; }
    .progress-attempt { color: var(--text-2); font-size: 11px; }

    .progress-bar { height: 6px; background: var(--bg-dark); border: 1px solid var(--border-dark); border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; transition: width 0.3s ease; background: var(--green); }

    .ocr-results, .manual-entry {
      margin-bottom: 12px;
      padding: 12px;
      background: var(--bg-dark);
      border: 1px solid var(--border-dark);
      border-radius: 10px;
    }

    .result-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; font-weight: 500; }

    .confidence-badge {
      position: absolute;
      top: -8px;
      right: 8px;
      background: var(--bg-dark);
      color: var(--text-2);
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 12px;
      border: 1px solid var(--border-dark);
    }

    .input-validation { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 12px; color: var(--text-2); }

    .action-buttons { display: flex; gap: 12px; margin-bottom: 12px; }

    .error-display {
      padding: 12px;
      background: var(--bg-dark);
      border: 1px solid var(--border-dark);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `]
})
export class OCRScannerEnhancedComponent implements OnInit, OnDestroy {
  @Input() mode: ScanMode = 'general';
  @Input() required: boolean = true;
  @Input() validateInput: boolean = true;
  @Output() valueDetected = new EventEmitter<OCRScanResult>();
  @Output() scanError = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

  selectedImage: string | null = null;
  isProcessing = false;
  showManualEntry = false;
  currentStatus: 'idle' | 'processing' | 'success' | 'error' = 'idle';
  
  ocrProgress: OCRProgress | null = null;
  ocrResult: any = null;
  detectedValue = '';
  manualValue = '';
  errorMessage = '';
  validationMessage = '';

  constructor(
    private ocrService: OCRService,
    private microcopyService: HumanMicrocopyService
  ) {}

  ngOnInit() {
    // Subscribe to OCR progress
    this.ocrService.progress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.ocrProgress = progress;
        this.updateStatus(progress.status);
      });

    // Initialize microcopy contexts
    this.initializeMicrocopy();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMicrocopy() {
    // Add OCR-specific microcopy contexts
    this.microcopyService.registerContext('ocr-manual-verification', {
      message: 'No pudimos detectar el {{field}} con suficiente confianza ({{confidence}}%). Por favor, revisa y corrige si es necesario.',
      tone: 'helpful',
      actionable: true
    });

    this.microcopyService.registerContext('manual-entry-guidance', {
      message: 'Ingresa el {{field}} manualmente. Asegúrate de que la información sea correcta.',
      tone: 'instructional',
      actionable: true
    });

    this.microcopyService.registerContext('ocr-error', {
      message: 'No pudimos procesar la imagen: {{error}}. {{canRetry ? "Puedes reintentar o usar entrada manual." : "Por favor, usa entrada manual."}}',
      tone: 'apologetic',
      actionable: true
    });
  }

  triggerCamera() {
    if (this.selectedImage && !this.isProcessing) {
      this.processImage();
    } else {
      const fileInput = document.querySelector(`input[data-testid="${this.mode}-camera-input"]`) as HTMLInputElement;
      fileInput?.click();
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
        // Automatically process the image
        this.processImage();
      };
      reader.readAsDataURL(file);
    }
  }

  private async processImage() {
    if (!this.selectedImage) return;

    this.isProcessing = true;
    this.currentStatus = 'processing';
    this.errorMessage = '';
    this.ocrResult = null;

    try {
      // Convert data URL to file
      const file = await this.dataUrlToFile(this.selectedImage, 'scan.jpg');
      
      let result;
      switch (this.mode) {
        case 'vin':
          result = await this.ocrService.extractVINFromImage(file);
          this.ocrResult = {
            value: result.vin,
            confidence: result.confidence,
            needsManualEntry: result.needsManualEntry
          };
          this.detectedValue = result.vin;
          break;
          
        case 'odometer':
          result = await this.ocrService.extractOdometerFromImage(file);
          this.ocrResult = {
            value: result.odometer?.toString() || '',
            confidence: result.confidence,
            needsManualEntry: result.needsManualEntry
          };
          this.detectedValue = result.odometer?.toString() || '';
          break;
          
        default:
          const generalResult = await this.ocrService.extractTextFromImage(file);
          this.ocrResult = {
            value: generalResult.text,
            confidence: generalResult.confidence,
            needsManualEntry: generalResult.confidence < 70
          };
          this.detectedValue = generalResult.text;
      }

      this.currentStatus = 'success';
    } catch (error) {
      this.currentStatus = 'error';
      this.errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.scanError.emit(this.errorMessage);
    } finally {
      this.isProcessing = false;
    }
  }

  private async dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }

  retakePhoto() {
    this.selectedImage = null;
    this.ocrResult = null;
    this.detectedValue = '';
    this.currentStatus = 'idle';
    this.errorMessage = '';
  }

  toggleManualEntry() {
    this.showManualEntry = !this.showManualEntry;
    if (this.showManualEntry) {
      this.manualValue = this.detectedValue;
    }
  }

  onManualValueChange() {
    if (this.validateInput) {
      this.validateManualInput();
    }
  }

  private validateManualInput() {
    this.validationMessage = '';
    
    if (!this.manualValue.trim()) {
      this.validationMessage = `${this.getScannerLabel()} es requerido`;
      return;
    }

    switch (this.mode) {
      case 'vin':
        if (this.manualValue.length !== 17) {
          this.validationMessage = 'VIN debe tener exactamente 17 caracteres';
        } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(this.manualValue)) {
          this.validationMessage = 'VIN contiene caracteres inválidos';
        }
        break;
        
      case 'odometer':
        const odometerValue = parseInt(this.manualValue);
        if (isNaN(odometerValue) || odometerValue < 0 || odometerValue > 9999999) {
          this.validationMessage = 'Odómetro debe ser un número entre 0 y 9,999,999';
        }
        break;
    }
  }

  confirmValue() {
    const value = this.showManualEntry ? this.manualValue : this.detectedValue;
    const method = this.showManualEntry ? 'manual' : 'ocr';
    
    this.valueDetected.emit({
      success: true,
      value: value.trim(),
      confidence: this.showManualEntry ? 100 : (this.ocrResult?.confidence || 0),
      method,
      needsManualEntry: false
    });
  }

  canConfirm(): boolean {
    if (this.isProcessing) return false;
    
    const value = this.showManualEntry ? this.manualValue : this.detectedValue;
    
    if (!value?.trim()) return false;
    
    if (this.showManualEntry && this.validateInput) {
      this.validateManualInput();
      return !this.validationMessage;
    }
    
    return true;
  }

  retry() {
    this.errorMessage = '';
    this.currentStatus = 'idle';
    if (this.selectedImage) {
      this.processImage();
    }
  }

  private updateStatus(status: string) {
    switch (status) {
      case 'recognizing':
      case 'retrying':
      case 'processing':
        this.currentStatus = 'processing';
        break;
      case 'completed':
        this.currentStatus = 'success';
        break;
      case 'error':
      case 'failed':
        this.currentStatus = 'error';
        break;
      default:
        this.currentStatus = 'idle';
    }
  }

  getScannerIcon(): string {
    switch (this.mode) {
      case 'vin': return 'car';
      case 'odometer': return 'speedometer';
      default: return 'scan';
    }
  }

  getScannerTitle(): string {
    switch (this.mode) {
      case 'vin': return 'Escanear VIN';
      case 'odometer': return 'Escanear Odómetro';
      default: return 'Escanear Documento';
    }
  }

  getScannerLabel(): string {
    switch (this.mode) {
      case 'vin': return 'VIN';
      case 'odometer': return 'odómetro';
      default: return 'documento';
    }
  }

  getPlaceholderText(): string {
    switch (this.mode) {
      case 'vin': return 'Ej: 1HGCM82633A123456';
      case 'odometer': return 'Ej: 85432';
      default: return 'Texto detectado...';
    }
  }

  getStatusText(): string {
    switch (this.currentStatus) {
      case 'idle': return 'Listo para escanear';
      case 'processing': return 'Procesando...';
      case 'success': return 'Completado';
      case 'error': return 'Error';
      default: return '';
    }
  }
}