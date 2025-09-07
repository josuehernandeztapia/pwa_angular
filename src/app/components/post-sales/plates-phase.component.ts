import { Component, computed, signal, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IntegratedImportTrackerService } from '../../services/integrated-import-tracker.service';
import { PostSalesApiService } from '../../services/post-sales-api.service';
import { 
  PlatesData, 
  DocumentFile
} from '../../models/types';
import { PlatesValidationService } from '../../services/plates-validation.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';

/**
 * FASE 8: PLACAS ENTREGADAS - HANDOVER CRÍTICO
 * Pantalla final que dispara el evento vehicle.delivered
 * Identificación: VIN + PLACA (sistema robusto)
 * ¡ESTA ES LA PUERTA PRINCIPAL AL SISTEMA POST-VENTA!
 */
@Component({
  selector: 'app-plates-phase',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="plates-phase-container">
      <!-- Header -->
      <div class="phase-header">
        <div class="phase-indicator">
          <span class="phase-number">8</span>
          <div class="phase-info">
            <h2>Placas Entregadas</h2>
            <p>Finalización y activación del sistema post-venta</p>
          </div>
        </div>
        <div class="client-info" *ngIf="clientInfo()">
          <span class="client-name">{{ clientInfo()?.name }}</span>
          <span class="vin-placa">VIN: {{ clientInfo()?.vin }} | Placa: {{ platesForm.get('numeroPlacas')?.value || 'Pendiente' }}</span>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="progress-steps">
        <div class="step completed">
          <span class="step-number">✓</span>
          <span class="step-label">Entrega</span>
        </div>
        <div class="step completed">
          <span class="step-number">✓</span>
          <span class="step-label">Documentos</span>
        </div>
        <div class="step active critical">
          <span class="step-number">8</span>
          <span class="step-label">Placas</span>
          <span class="step-badge">🚀 HANDOVER</span>
        </div>
      </div>

      <!-- Critical Notice -->
      <div class="critical-notice">
        <div class="notice-icon">🎯</div>
        <div class="notice-content">
          <h3>Paso Final Crítico</h3>
          <p>Al completar esta fase se activará automáticamente:</p>
          <ul>
            <li>✅ Expediente post-venta (VIN + Placa)</li>
            <li>📅 Recordatorios de mantenimiento</li>
            <li>📱 Encuestas de satisfacción</li>
            <li>🔗 Integración con sistema de servicios</li>
          </ul>
        </div>
      </div>

      <!-- Main Form -->
      <form [formGroup]="platesForm" (ngSubmit)="onSubmit()" class="plates-form">
        
        <!-- Vehicle Identification -->
        <div class="form-section">
          <h3>🚗 Identificación del Vehículo</h3>
          <div class="identification-grid">
            <div class="id-item readonly">
              <label>VIN (Vehicle Identification Number)</label>
              <div class="vin-display">
                <span class="vin-code">{{ vehicleInfo()?.vin || 'Cargando...' }}</span>
                <span class="vin-verified">✅ Verificado</span>
              </div>
            </div>
            <div class="id-item">
              <label for="numeroPlacas">Número de Placas *</label>
              <input 
                type="text" 
                id="numeroPlacas"
                formControlName="numeroPlacas"
                placeholder="ABC-123-DEF"
                class="form-input placa-input"
                [class.error]="platesForm.get('numeroPlacas')?.invalid && platesForm.get('numeroPlacas')?.touched"
                (input)="onPlacaInput($event)"
              >
              @if (platesForm.get('numeroPlacas')?.invalid && platesForm.get('numeroPlacas')?.touched) {
                <div class="error-message">Formato de placa inválido (ej: ABC-123-DEF)</div>
              }
              @if (placaValidation().isValid && placaValidation().estado) {
                <div class="validation-success">
                  ✅ Placa válida - Estado: {{ placaValidation().estado }}
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Unique Identifier Preview -->
        <div class="form-section" *ngIf="hasValidPlaca()">
          <h3>🔑 Identificador Único Post-Venta</h3>
          <div class="unique-identifier">
            <div class="identifier-display">
              <span class="identifier-label">ID Sistema:</span>
              <span class="identifier-code">{{ getUniqueIdentifier() }}</span>
            </div>
            <div class="identifier-note">
              <small>Este identificador se usará en todo el sistema post-venta</small>
            </div>
          </div>
        </div>

        <!-- Plates Information -->
        <div class="form-section">
          <h3>📋 Información de Placas</h3>
          <div class="plates-info">
            <div class="input-group">
              <label for="estado">Estado de Emisión *</label>
              <select 
                id="estado"
                formControlName="estado"
                class="form-input"
                [class.error]="platesForm.get('estado')?.invalid && platesForm.get('estado')?.touched"
              >
                <option value="">Seleccionar estado...</option>
                <option value="AGUASCALIENTES">Aguascalientes</option>
                <option value="BAJA_CALIFORNIA">Baja California</option>
                <option value="BAJA_CALIFORNIA_SUR">Baja California Sur</option>
                <option value="CAMPECHE">Campeche</option>
                <option value="CHIAPAS">Chiapas</option>
                <option value="CHIHUAHUA">Chihuahua</option>
                <option value="CDMX">Ciudad de México</option>
                <option value="COAHUILA">Coahuila</option>
                <option value="COLIMA">Colima</option>
                <option value="DURANGO">Durango</option>
                <option value="GUANAJUATO">Guanajuato</option>
                <option value="GUERRERO">Guerrero</option>
                <option value="HIDALGO">Hidalgo</option>
                <option value="JALISCO">Jalisco</option>
                <option value="MEXICO">Estado de México</option>
                <option value="MICHOACAN">Michoacán</option>
                <option value="MORELOS">Morelos</option>
                <option value="NAYARIT">Nayarit</option>
                <option value="NUEVO_LEON">Nuevo León</option>
                <option value="OAXACA">Oaxaca</option>
                <option value="PUEBLA">Puebla</option>
                <option value="QUERETARO">Querétaro</option>
                <option value="QUINTANA_ROO">Quintana Roo</option>
                <option value="SAN_LUIS_POTOSI">San Luis Potosí</option>
                <option value="SINALOA">Sinaloa</option>
                <option value="SONORA">Sonora</option>
                <option value="TABASCO">Tabasco</option>
                <option value="TAMAULIPAS">Tamaulipas</option>
                <option value="TLAXCALA">Tlaxcala</option>
                <option value="VERACRUZ">Veracruz</option>
                <option value="YUCATAN">Yucatán</option>
                <option value="ZACATECAS">Zacatecas</option>
              </select>
            </div>
            <div class="input-group">
              <label for="fechaAlta">Fecha de Alta *</label>
              <input 
                type="date" 
                id="fechaAlta"
                formControlName="fechaAlta"
                class="form-input"
                [class.error]="platesForm.get('fechaAlta')?.invalid && platesForm.get('fechaAlta')?.touched"
                [max]="today"
              >
            </div>
            <div class="input-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="hologramas"
                  class="checkbox-input"
                >
                <span class="checkbox-custom"></span>
                Incluye hologramas de seguridad
              </label>
            </div>
          </div>
        </div>

        <!-- Document Upload -->
        <div class="form-section">
          <h3>📄 Tarjeta de Circulación</h3>
          <div class="document-upload">
            @if (!tarjetaCirculacion()) {
              <div class="upload-area" (click)="triggerDocumentUpload()">
                <span class="upload-icon">📄</span>
                <p>Subir tarjeta de circulación (PDF)</p>
                <small>Documento oficial con placas registradas</small>
              </div>
            } @else {
              <div class="document-preview">
                <div class="file-info">
                  <span class="file-icon">📄</span>
                  <div class="file-details">
                    <span class="file-name">{{ tarjetaCirculacion()?.filename }}</span>
                    <span class="file-size">{{ formatFileSize(tarjetaCirculacion()?.size || 0) }}</span>
                    <span class="upload-date">{{ formatDate(tarjetaCirculacion()?.uploadedAt) }}</span>
                  </div>
                </div>
                <div class="file-actions">
                  <button type="button" class="action-btn view" (click)="viewDocument()">👁️ Ver</button>
                  <button type="button" class="action-btn replace" (click)="triggerDocumentUpload()">🔄 Reemplazar</button>
                  <button type="button" class="action-btn remove" (click)="removeDocument()">🗑️ Eliminar</button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Photo Upload -->
        <div class="form-section">
          <h3>📷 Fotografías de Placas</h3>
          <div class="photo-upload">
            <div class="upload-instructions">
              <p>📋 Requerido: Fotos claras de ambas placas (delantera y trasera)</p>
              <small>Asegúrate que los números sean legibles</small>
            </div>
            <div class="upload-area" (click)="triggerPhotoUpload()">
              <div class="upload-placeholder">
                <span class="upload-icon">📷</span>
                <p>Toca para agregar fotos de las placas</p>
                <small>Recomendado: placa delantera, trasera, hologramas</small>
              </div>
            </div>
            <input 
              #photoInput
              type="file" 
              accept="image/*" capture="environment"
              multiple 
              (change)="onPhotoSelected($event)"
              style="display: none;"
            >
            @if (fotografiasPlacas().length > 0) {
              <div class="photo-preview">
                @for (photo of fotografiasPlacas(); track photo) {
                  <div class="photo-item">
                    <img [src]="photo" alt="Plate photo" class="photo-thumbnail">
                    <button 
                      type="button" 
                      class="remove-photo-btn"
                      (click)="removePhoto(photo)"
                    >
                      ✕
                    </button>
                    <div class="photo-label">
                      {{ getPhotoLabel($index) }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Final Verification -->
        <div class="form-section" *ngIf="hasRequiredData()">
          <h3>✅ Verificación Final</h3>
          <div class="final-verification">
            <div class="verification-item">
              <input type="checkbox" id="placasInstaladas" formControlName="placasInstaladas">
              <label for="placasInstaladas">Las placas están correctamente instaladas en el vehículo</label>
            </div>
            <div class="verification-item">
              <input type="checkbox" id="tarjetaEntregada" formControlName="tarjetaEntregada">
              <label for="tarjetaEntregada">La tarjeta de circulación fue entregada al cliente</label>
            </div>
            <div class="verification-item">
              <input type="checkbox" id="hologramasVerificados" formControlName="hologramasVerificados" *ngIf="platesForm.get('hologramas')?.value">
              <label for="hologramasVerificados">Los hologramas de seguridad fueron verificados</label>
            </div>
            <div class="verification-item critical">
              <input type="checkbox" id="entregaCompleta" formControlName="entregaCompleta">
              <label for="entregaCompleta">
                <strong>Confirmo que la entrega está 100% completa y el vehículo puede activarse en el sistema post-venta</strong>
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="goBack()"
          >
            ← Volver a Documentos
          </button>

          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="saveDraft()"
            [disabled]="isSaving()"
          >
            @if (isSaving()) {
              <span class="loading-spinner"></span>
              Guardando...
            } @else {
              💾 Guardar Borrador
            }
          </button>
          
          <button 
            type="submit" 
            class="btn btn-primary critical-action"
            [disabled]="!canCompleteHandover() || isSubmitting()"
          >
            @if (isSubmitting()) {
              <span class="loading-spinner"></span>
              Activando Sistema...
            } @else {
              🚀 ACTIVAR SISTEMA POST-VENTA
            }
          </button>
        </div>

        <!-- Validation Summary -->
        @if (validationErrors().length > 0) {
          <div class="validation-summary">
            <h4>⚠️ Campos requeridos para activar sistema:</h4>
            <ul>
              @for (error of validationErrors(); track error) {
                <li>{{ error }}</li>
              }
            </ul>
          </div>
        }
      </form>

      <!-- Document Input (Hidden) -->
      <input 
        #documentInput
        type="file" 
        accept=".pdf"
        (change)="onDocumentSelected($event)"
        style="display: none;"
      >
    </div>

    <!-- Critical Success Modal -->
    @if (showSuccessModal()) {
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="plates-success-title" aria-describedby="plates-success-desc" (keydown)="onDialogKeydown($event)" tabindex="-1">
        <div class="modal critical-success" (focusout)="maintainFocusInDialog($event)">
          <div class="modal-header">
            <div class="success-animation">🎉</div>
            <h3 id="plates-success-title">¡Sistema Post-Venta Activado!</h3>
            <p id="plates-success-desc" class="success-subtitle">VIN + Placa registrados exitosamente</p>
          </div>
          <div class="modal-body">
            <div class="activation-summary">
              <div class="identifier-confirm">
                <h4>🔑 Identificador Único:</h4>
                <div class="final-identifier">{{ getUniqueIdentifier() }}</div>
              </div>
              
              <div class="systems-activated">
                <h4>🚀 Sistemas Activados:</h4>
                <div class="activation-grid">
                  <div class="activation-item">
                    <span class="activation-icon">📊</span>
                    <div class="activation-details">
                      <strong>Expediente Post-Venta</strong>
                      <small>ID: {{ postSalesRecordId() }}</small>
                    </div>
                  </div>
                  <div class="activation-item">
                    <span class="activation-icon">📅</span>
                    <div class="activation-details">
                      <strong>Recordatorio Mantenimiento</strong>
                      <small>Próximo: {{ nextMaintenanceDate() }}</small>
                    </div>
                  </div>
                  <div class="activation-item">
                    <span class="activation-icon">📱</span>
                    <div class="activation-details">
                      <strong>Encuestas Programadas</strong>
                      <small>Primera: 30 días</small>
                    </div>
                  </div>
                  <div class="activation-item">
                    <span class="activation-icon">🔗</span>
                    <div class="activation-details">
                      <strong>Integración Odoo</strong>
                      <small>Cliente y vehículo sincronizados</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="handover-complete">
                <div class="handover-badge">
                  ✅ HANDOVER COMPLETADO
                </div>
                <p>El vehículo ha pasado oficialmente del equipo de Asesores al sistema Post-Venta</p>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="viewPostSalesDashboard()">
              📊 Ver Dashboard Post-Venta
            </button>
            <button class="btn btn-primary" (click)="completeProcess()">
              ✅ Proceso Completado
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./plates-phase.component.scss']
})
export class PlatesPhaseComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private importTracker = inject(IntegratedImportTrackerService);
  private postSalesApi = inject(PostSalesApiService);
  private platesService = inject(PlatesValidationService);

  private destroy$ = new Subject<void>();
  private validating$ = new Subject<string>();
  private lastFocusedBeforeDialog: HTMLElement | null = null;
  @ViewChild('successDialog', { read: ElementRef }) successDialog?: ElementRef<HTMLElement>;

  // Signals
  clientId = signal<string>('client_001');
  clientInfo = signal<{ name: string; vin: string } | null>(null);
  vehicleInfo = signal<any | null>(null);
  tarjetaCirculacion = signal<DocumentFile | null>(null);
  fotografiasPlacas = signal<string[]>([]);
  placaValidation = signal<{ isValid: boolean; estado?: string }>({ isValid: false });
  isSaving = signal(false);
  isSubmitting = signal(false);
  showSuccessModal = signal(false);
  postSalesRecordId = signal<string>('');
  nextMaintenanceDate = signal<string>('');

  // Form
  platesForm: FormGroup;
  today = new Date().toISOString().split('T')[0];

  // Computed
  hasValidPlaca = computed(() => {
    return this.placaValidation().isValid && this.platesForm?.get('numeroPlacas')?.value;
  });

  hasRequiredData = computed(() => {
    const form = this.platesForm;
    if (!form) return false;

    return this.hasValidPlaca() && 
           form.get('estado')?.value && 
           form.get('fechaAlta')?.value &&
           this.tarjetaCirculacion() !== null &&
           this.fotografiasPlacas().length >= 1;
  });

  canCompleteHandover = computed(() => {
    const form = this.platesForm;
    if (!form) return false;

    return form.valid && 
           this.hasRequiredData() &&
           form.get('placasInstaladas')?.value &&
           form.get('tarjetaEntregada')?.value &&
           form.get('entregaCompleta')?.value &&
           (!form.get('hologramas')?.value || form.get('hologramasVerificados')?.value);
  });

  validationErrors = computed(() => {
    const errors: string[] = [];
    const form = this.platesForm;
    if (!form) return errors;

    // Form validation
    if (!this.hasValidPlaca()) errors.push('Número de placas válido');
    if (form.get('estado')?.invalid) errors.push('Estado de emisión');
    if (form.get('fechaAlta')?.invalid) errors.push('Fecha de alta');
    
    // Documents and photos
    if (!this.tarjetaCirculacion()) errors.push('Tarjeta de circulación');
    if (this.fotografiasPlacas().length === 0) errors.push('Fotografías de placas');

    // Verification checkboxes
    if (this.hasRequiredData()) {
      if (!form.get('placasInstaladas')?.value) errors.push('Confirmación de placas instaladas');
      if (!form.get('tarjetaEntregada')?.value) errors.push('Confirmación de tarjeta entregada');
      if (!form.get('entregaCompleta')?.value) errors.push('Confirmación de entrega completa');
      if (form.get('hologramas')?.value && !form.get('hologramasVerificados')?.value) {
        errors.push('Verificación de hologramas');
      }
    }

    return errors;
  });

  constructor() {
    this.platesForm = this.fb.group({
      numeroPlacas: ['', [Validators.required, this.createPlateValidator()]],
      estado: ['', Validators.required],
      fechaAlta: [this.today, Validators.required],
      hologramas: [true],
      placasInstaladas: [false],
      tarjetaEntregada: [false],
      hologramasVerificados: [false],
      entregaCompleta: [false]
    });

    this.loadPlatesData();
  }

  ngOnInit(): void {
    this.validating$.pipe(debounceTime(350), takeUntil(this.destroy$)).subscribe((value) => {
      this.performAsyncPlateVerification(value);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createPlateValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const normalized = this.platesService.normalizePlate(control.value);
      const estado = this.platesForm?.get('estado')?.value || 'DEFAULT';
      const result = this.platesService.validatePlateByState(normalized, estado);
      return result.isValid ? null : { invalidPlaca: true };
    };
  }

  private loadPlatesData(): void {
    // Simulate loading data
    this.clientInfo.set({
      name: 'José Hernández Pérez',
      vin: '3N1CN7AP8KL123456'
    });

    this.vehicleInfo.set({
      vin: '3N1CN7AP8KL123456',
      serie: 'NIS2024001',
      modelo: 'Nissan Urvan NV200',
      year: 2024
    });
  }

  getUniqueIdentifier(): string {
    const vin = this.vehicleInfo()?.vin || '';
    const placa = this.platesForm?.get('numeroPlacas')?.value || '';
    return vin && placa ? this.platesService.buildPostSalesId(vin, placa) : 'Pendiente...';
  }

  onPlacaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = this.platesService.normalizePlate(input.value);
    // Re-insert hyphens for readability: ABC-123-D or ABC-12-34 style
    let formatted = normalized;
    if (normalized.length >= 3 && normalized.length <= 6) {
      formatted = normalized.slice(0, 3) + '-' + normalized.slice(3);
    }
    if (normalized.length > 6) {
      const first = normalized.slice(0, 3);
      const middle = normalized.slice(3, 6);
      const rest = normalized.slice(6);
      formatted = `${first}-${middle}-${rest}`;
    }
    input.value = formatted;
    this.platesForm.get('numeroPlacas')?.setValue(formatted, { emitEvent: false });
    this.placaValidation.set({ isValid: false });
    this.validating$.next(formatted);
  }

  private performAsyncPlateVerification(placa: string): void {
    this.placaValidation.set({ isValid: false });
    this.platesService.verifyPlateAsync(placa)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.placaValidation.set({ isValid: result.isValid, estado: result.estado });
        if (result.estado) {
          this.platesForm.get('estado')?.setValue(result.estado);
        }
      });
  }

  triggerDocumentUpload(): void {
    const input = document.querySelector('#documentInput') as HTMLInputElement;
    input?.click();
  }

  onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF para la tarjeta de circulación');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    const documentFile: DocumentFile = {
      filename: file.name,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
      size: file.size,
      type: 'pdf'
    };

    this.tarjetaCirculacion.set(documentFile);
    input.value = '';
  }

  removeDocument(): void {
    this.tarjetaCirculacion.set(null);
  }

  viewDocument(): void {
    const doc = this.tarjetaCirculacion();
    if (doc?.url) {
      window.open(doc.url, '_blank');
    }
  }

  triggerPhotoUpload(): void {
    const input = document.querySelector('#photoInput') as HTMLInputElement;
    input?.click();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.fotografiasPlacas.set([...this.fotografiasPlacas(), result]);
      };
      reader.readAsDataURL(file);
    });
  }

  removePhoto(photo: string): void {
    const current = this.fotografiasPlacas();
    this.fotografiasPlacas.set(current.filter(p => p !== photo));
  }

  getPhotoLabel(index: number): string {
    const labels = ['Placa Delantera', 'Placa Trasera', 'Hologramas', 'Detalle'];
    return labels[index] || `Foto ${index + 1}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  }

  saveDraft(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      console.log('📄 Plates draft saved');
    }, 1500);
  }

  onSubmit(): void {
    if (!this.canCompleteHandover()) {
      console.log('❌ Cannot complete handover - validation failed');
      return;
    }

    this.isSubmitting.set(true);

    const platesData: PlatesData = {
      numeroPlacas: this.platesForm.get('numeroPlacas')?.value,
      estado: this.platesForm.get('estado')?.value,
      fechaAlta: new Date(this.platesForm.get('fechaAlta')?.value),
      tarjetaCirculacion: this.tarjetaCirculacion()!,
      fotografiasPlacas: this.fotografiasPlacas(),
      hologramas: this.platesForm.get('hologramas')?.value
    };

    console.log('🚀 INICIANDO HANDOVER CRÍTICO - VIN + Placa:', this.getUniqueIdentifier());

    // 🎯 CRITICAL: Complete plates phase - triggers vehicle.delivered event
    this.importTracker.completePlatesPhase(this.clientId(), platesData).subscribe({
      next: (result) => {
        console.log('✅ HANDOVER COMPLETADO - Sistema Post-Venta Activado:', result);
        
        // Simulate post-sales record creation
        this.postSalesRecordId.set(`PSR_${Date.now()}`);
        this.nextMaintenanceDate.set(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'));
        
        this.isSubmitting.set(false);
        this.showSuccessModal.set(true);
      },
      error: (error) => {
        console.error('❌ HANDOVER FALLIDO:', error);
        this.isSubmitting.set(false);
        alert('Error crítico en el handover. El sistema post-venta NO se activó. Contacta soporte técnico.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/post-sales/documents', this.clientId()]);
  }

  viewPostSalesDashboard(): void {
    const identifier = this.getUniqueIdentifier();
    this.router.navigate(['/post-sales/dashboard', identifier]);
  }

  completeProcess(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/dashboard']);
  }

  // A11y: trap focus and escape to close
  onDialogKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.completeProcess();
    }
  }

  maintainFocusInDialog(event: FocusEvent): void {
    const dialog = (event.currentTarget as HTMLElement) || undefined;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const target = event.relatedTarget as HTMLElement | null;
    if (target === null || !dialog.contains(target)) {
      first.focus();
    }
    dialog.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }
}