import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Client, EventLog } from '../../../models/types';
import { ImportStatus } from '../../../models/postventa';
import { AviVerificationModalComponent } from '../../shared/avi-verification-modal/avi-verification-modal.component';
import { EventLogComponent } from '../../shared/event-log.component';
import { ImportTrackerComponent } from '../../shared/import-tracker.component';
import { ProgressBarComponent } from '../../shared/progress-bar.component';
import { ProtectionRealComponent } from '../protection-real/protection-real.component';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [CommonModule, AviVerificationModalComponent, ProgressBarComponent, EventLogComponent, ImportTrackerComponent, ProtectionRealComponent],
  template: `
    <div class="cliente-detail-container">
      <!-- Header -->
      <div class="detail-header ui-card">
        <div class="client-info">
          <h1 class="client-name">{{ client?.name || 'Cliente' }}</h1>
          <div class="client-status">
            <span class="status-badge" [class]="'status-' + (client?.status || 'unknown').toLowerCase().replace(' ', '-')">
              {{ client?.status || 'Sin estado' }}
            </span>
          </div>
        </div>
        <div class="client-score" *ngIf="client?.healthScore != null">
          <span class="score-label">Score de Salud</span>
          <span class="score-value" [class]="getScoreClass(client?.healthScore || 0)">{{ client?.healthScore != null ? client?.healthScore : 'N/A' }}%</span>
        </div>
        
        <!-- Protection Status Indicator (Financial Products Only) -->
        <div class="protection-status" *ngIf="isFinancialProduct() && client">
          <span class="status-label">🛡️ Protección</span>
          <span class="status-indicator protection-available">
            Disponible
          </span>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-card ui-card">
          <div class="stat-icon">📄</div>
          <div class="stat-info">
            <span class="stat-label">Documentos</span>
            <span class="stat-value">{{ getDocumentStats() }}</span>
          </div>
        </div>
        <div class="stat-card ui-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <span class="stat-label">Flujo</span>
            <span class="stat-value">{{ getFlowDisplayName(client?.flow) }}</span>
          </div>
        </div>
        <div class="stat-card ui-card">
          <div class="stat-icon">📍</div>
          <div class="stat-info">
            <span class="stat-label">Municipio</span>
            <span class="stat-value">{{ getMunicipalityName(client?.market) }}</span>
          </div>
        </div>
      </div>

      <!-- Main Actions -->
      <div class="main-actions">
        <div class="action-section ui-card">
          <h2>Verificación y Validación</h2>
          <div class="action-buttons">
            
            <!-- AVI Button - Revolutionary -->
            <button 
              class="ui-btn ui-btn-primary"
              [disabled]="!canStartAviVerification()"
              (click)="startAviVerification()">
              <span class="btn-icon">🎤</span>
              <div class="btn-content">
                <span class="btn-title">Iniciar Verificación Inteligente AVI</span>
                <span class="btn-subtitle">Validación por voz con preguntas micro-locales</span>
              </div>
              <span class="btn-arrow">→</span>
            </button>

            <!-- Traditional KYC (Backup) -->
            <button 
              class="ui-btn ui-btn-secondary"
              [disabled]="!canStartKyc()"
              (click)="startTraditionalKyc()">
              <span class="btn-icon">🔍</span>
              <div class="btn-content">
                <span class="btn-title">KYC Tradicional</span>
                <span class="btn-subtitle">Verificación biométrica estándar</span>
              </div>
            </button>
          </div>
        </div>

        <div class="action-section ui-card">
          <h2>Documentos y Contratos</h2>
          <div class="action-buttons">
            <button class="ui-btn ui-btn-secondary" (click)="viewDocuments()">
              <span class="btn-icon">📋</span>
              <div class="btn-content">
                <span class="btn-title">Ver Documentos</span>
                <span class="btn-subtitle">Revisar estado de documentación</span>
              </div>
            </button>
            
            <button class="ui-btn ui-btn-secondary" [disabled]="!canGenerateContract()" (click)="generateContract()">
              <span class="btn-icon">📜</span>
              <div class="btn-content">
                <span class="btn-title">Generar Contrato</span>
                <span class="btn-subtitle">Crear documentos legales</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Protection Section (Financial Products Only) -->
      <div class="protection-section ui-card" *ngIf="isFinancialProduct() && client">
        <div class="section-header mb-6">
          <h2 class="text-xl font-semibold">🛡️ Sistema de Protección</h2>
          <p class="text-sm mt-2">
            Gestión de protección financiera para productos con plazo
          </p>
        </div>
        
        <app-protection-real
          [client]="client"
          [contractId]="getContractId()">
        </app-protection-real>
      </div>

      <!-- Client Details -->
      <div class="client-details ui-card" *ngIf="client">
        <div class="details-grid">
          <div class="detail-card ui-card">
            <h3>Información Personal</h3>
            <div class="detail-items">
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ client.email || 'No proporcionado' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Teléfono:</span>
                <span class="detail-value">{{ client.phone || 'No proporcionado' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">RFC:</span>
                <span class="detail-value">{{ client.rfc || 'No proporcionado' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-card ui-card">
            <h3>Información del Proceso</h3>
            <div class="detail-items">
              <div class="detail-item">
                <span class="detail-label">Fecha de Creación:</span>
                <span class="detail-value">{{ client.createdAt | date:'medium' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Última Actualización:</span>
                <span class="detail-value">{{ client.updatedAt | date:'medium' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ecosistema:</span>
                <span class="detail-value">{{ client.ecosystemId || 'No asignado' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Tracking Section -->
      <div class="progress-tracking-section" *ngIf="client">
        <div class="section-header mb-6">
          <h2 class="text-xl font-semibold">📈 Progreso Financiero</h2>
        </div>
        
        <div class="progress-cards grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Savings Progress -->
          <div class="progress-card ui-card p-6 rounded-xl border">
            <h3 class="text-lg font-semibold mb-4">💰 Plan de Ahorro</h3>
            <app-progress-bar 
              [progress]="getSavingsProgress()"
              [goal]="getSavingsGoal()"
              label="Ahorro Acumulado"
              currency="MXN"
              theme="success"
              size="lg"
              [animated]="true"
              [showValues]="true"
              [showMessages]="true"
              [showRemaining]="true"
              actionLabel="Realizar Aportación"
              [actionCallback]="openPaymentModal">
            </app-progress-bar>
            
            <div class="savings-details mt-4 pt-4 border-t">
              <div class="flex justify-between text-sm">
                <span>Última aportación:</span>
                <span class="font-medium">{{ getLastContributionDate() }}</span>
              </div>
              <div class="flex justify-between text-sm mt-1">
                <span>Próximo vencimiento:</span>
                <span class="font-medium">{{ getNextPaymentDue() }}</span>
              </div>
            </div>
          </div>
          
          <!-- Payment Progress -->
          <div class="progress-card ui-card p-6 rounded-xl border">
            <h3 class="text-lg font-semibold mb-4">💳 Plan de Pagos</h3>
            <app-progress-bar 
              [progress]="getPaymentProgress()"
              [goal]="getTotalPayments()"
              label="Pagos Realizados"
              theme="info"
              size="lg"
              [animated]="true"
              [showValues]="false"
              [showMessages]="true"
              [milestones]="getPaymentMilestones()">
            </app-progress-bar>
            
            <div class="payment-details mt-4 pt-4 border-t">
              <div class="flex justify-between text-sm">
                <span>Pagos restantes:</span>
                <span class="font-medium">{{ getRemainingPayments() }}</span>
              </div>
              <div class="flex justify-between text-sm mt-1">
                <span>Fecha estimada de liquidación:</span>
                <span class="font-medium">{{ getEstimatedCompletion() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Import Tracker Section -->
      <div class="import-tracker-section" *ngIf="client && client.importStatus">
        <div class="section-header mb-6">
          <h2 class="text-xl font-semibold">🚢 Seguimiento de Importación</h2>
        </div>
        <app-import-tracker [client]="client" (onUpdateMilestone)="updateImportMilestone($event)"></app-import-tracker>
      </div>

      <!-- Event Log Section -->
      <div class="event-log-section">
        <div class="section-header mb-6">
          <h2 class="text-xl font-semibold">📜 Historial de Actividad</h2>
        </div>
        <app-event-log 
          [events]="clientEvents"
          [maxEvents]="20"
          [showFilters]="true"
          [showActions]="true">
        </app-event-log>
      </div>

      <!-- Payment Actions Section -->
      <div class="payment-actions-section" *ngIf="client">
        <div class="section-header mb-6">
          <h2 class="text-xl font-semibold">💳 Opciones de Pago</h2>
        </div>
        
        <div class="payment-options grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button 
            (click)="generatePaymentLink('spei')"
            class="payment-option-card ui-btn ui-btn-secondary p-6 text-left group"
          >
            <div class="flex items-center space-x-4">
              <div class="payment-icon w-12 h-12 rounded-lg flex items-center justify-center transition-colors">
                <span class="text-2xl">🏦</span>
              </div>
              <div>
                <h3 class="font-semibold">Transferencia SPEI</h3>
                <p class="text-sm">Pago inmediato desde tu banco</p>
                <p class="text-xs mt-1">Sin comisiones adicionales</p>
              </div>
            </div>
          </button>
          
          <button 
            (click)="generatePaymentLink('conekta')"
            class="payment-option-card ui-btn ui-btn-secondary p-6 text-left group"
          >
            <div class="flex items-center space-x-4">
              <div class="payment-icon w-12 h-12 rounded-lg flex items-center justify-center transition-colors">
                <span class="text-2xl">💳</span>
              </div>
              <div>
                <h3 class="font-semibold">Tarjeta de Crédito/Débito</h3>
                <p class="text-sm">Pago seguro con Conekta</p>
                <p class="text-xs mt-1">Meses sin intereses disponibles</p>
              </div>
            </div>
          </button>
        </div>
        
        <!-- Account Statement -->
        <div class="account-statement-section">
          <div class="ui-card p-6 rounded-xl border">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold">📄 Estado de Cuenta</h3>
                <p class="text-sm mt-1">Genera y descarga tu estado de cuenta actualizado</p>
              </div>
              <div class="flex space-x-3">
                <button 
                  (click)="previewAccountStatement()"
                  class="ui-btn ui-btn-secondary flex items-center space-x-2"
                >
                  <span>👁️</span>
                  <span>Vista Previa</span>
                </button>
                <button 
                  (click)="generatePDF()"
                  [disabled]="isGeneratingPDF"
                  class="ui-btn ui-btn-primary flex items-center space-x-2"
                >
                  <span *ngIf="!isGeneratingPDF">📄</span>
                  <span *ngIf="isGeneratingPDF" class="animate-spin">⏳</span>
                  <span>{{ isGeneratingPDF ? 'Generando...' : 'Descargar PDF' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AVI Modal -->
      <app-avi-verification-modal
        *ngIf="showAviModal"
        [clientId]="client?.id || ''"
        [municipality]="getMunicipality()"
        [visible]="showAviModal"
        (completed)="onAviCompleted($event)"
        (closed)="onAviClosed()">
      </app-avi-verification-modal>
    </div>
  `,
  styles: [`
    .cliente-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      background: var(--surface-dark);
      min-height: 100vh;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 32px;
      border-radius: 16px;
      border: 1px solid var(--border-dark);
      background: var(--surface-dark);
      margin-bottom: 24px;
    }

    .client-info {
      flex: 1;
    }

    .client-name {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-light);
      margin: 0 0 12px 0;
    }

    .client-status {
      margin-bottom: 8px;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
    }

    .status-expediente-en-proceso { border: 1px solid var(--border-dark); color: var(--text-light); }

    .status-verificación-avi-completada { border: 1px solid var(--border-dark); color: var(--text-light); }

    .status-requiere-supervisión { border: 1px solid var(--border-dark); color: var(--text-light); }

    .client-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: var(--surface-2);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid var(--border-dark);
    }
    
    .protection-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: var(--surface-2);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid var(--border-dark);
    }

    .score-label, .status-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-2);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-indicator {
      font-size: 14px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 8px;
    }
    
    .status-indicator.protection-available {
      background: var(--surface-3);
      color: var(--text-light);
      border: 1px solid var(--border-dark);
    }

    .score-value {
      font-size: 24px;
      font-weight: 700;
    }

    .score-excellent { color: var(--text-light); }
    .score-good { color: var(--text-light); }
    .score-fair { color: var(--text-light); }
    .score-poor { color: var(--text-light); }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--surface-dark);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid var(--border-dark);
    }

    .stat-icon {
      font-size: 32px;
      opacity: 0.8;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-2);
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-light);
    }

    .main-actions {
      display: flex;
      flex-direction: column;
      gap: 32px;
      margin-bottom: 32px;
    }

    .action-section {
      background: var(--surface-dark);
      padding: 32px;
      border-radius: 16px;
      border: 1px solid var(--border-dark);
    }

    .action-section h2 {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-light);
      border-bottom: 1px solid var(--border-dark);
      padding-bottom: 12px;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .btn-avi-verification { }
    .btn-secondary-action { }

    .btn-icon {
      font-size: 24px;
      min-width: 24px;
    }

    .btn-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      flex: 1;
    }

    .btn-title {
      font-size: 16px;
      font-weight: 600;
    }

    .btn-subtitle {
      font-size: 14px;
      opacity: 0.8;
    }

    .btn-arrow {
      font-size: 20px;
      opacity: 0.8;
    }

    .client-details {
      background: var(--surface-dark);
      padding: 32px;
      border-radius: 16px;
      border: 1px solid var(--border-dark);
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .detail-card {
      background: var(--surface-2);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid var(--border-dark);
    }

    .detail-card h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-light);
      border-bottom: 1px solid var(--border-dark);
      padding-bottom: 12px;
    }

    .detail-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 600;
      color: var(--text-2);
      font-size: 14px;
    }

    .detail-value {
      color: var(--text-light);
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .cliente-detail-container {
        padding: 16px;
      }

      .detail-header {
        flex-direction: column;
        gap: 20px;
        padding: 24px;
      }

      .client-score, .protection-status {
        width: 100%;
      }

      .quick-stats {
        grid-template-columns: 1fr;
      }

      .action-section {
        padding: 24px;
      }

      .btn-avi-verification,
      .btn-secondary-action {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .btn-content {
        align-items: center;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .protection-section {
      background: var(--surface-dark);
      padding: 32px;
      border-radius: 16px;
      border: 1px solid var(--border-dark);
      margin-bottom: 32px;
    }
    
    .protection-section .section-header h2 {
      color: var(--text-light);
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .protection-section .section-header p {
      color: var(--text-2);
      font-size: 14px;
      margin: 8px 0 0 0;
    }
    
    @media (max-width: 768px) {
      .protection-section {
        padding: 24px;
        margin-bottom: 24px;
      }
    }
  `]
})
export class ClienteDetailComponent implements OnInit {
  client: Client | null = null;
  showAviModal = false;
  clientEvents: EventLog[] = [];
  isGeneratingPDF = false;
  
  openPaymentModal = () => {
    console.log('Opening payment modal');
    this.generatePaymentLink('spei');
  };
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    // Mock client data - replace with actual service call
    this.client = {
      id: 'client-001',
      name: 'Juan Pérez García',
      avatarUrl: '',
      email: 'juan.perez@email.com',
      phone: '+52 449 123 4567',
      rfc: 'PEGJ850315ABC',
      status: 'Expediente en Proceso',
      market: 'aguascalientes',
      flow: 'VentaPlazo' as any,
      healthScore: 85,
      events: [],
      documents: [
        { id: 'doc1', name: 'INE Vigente', status: 'Aprobado' as any },
        { id: 'doc2', name: 'Comprobante de domicilio', status: 'Pendiente' as any },
        { id: 'doc3', name: 'Constancia de situación fiscal', status: 'En Revisión' as any }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      ecosystemId: 'ags-ruta-5',
      savingsGoal: 150000,
      currentSavings: 87500,
      totalPayments: 24,
      completedPayments: 8,
      lastPaymentDate: new Date('2024-01-18'),
      nextPaymentDue: new Date('2024-02-15'),
      vehicleInfo: {
        model: 'Nissan Sentra 2024',
        vin: 'JN1AB7AP1PM123456'
      },
      importStatus: {
        pedidoPlanta: { completed: true, completedAt: new Date('2024-01-10') },
        unidadFabricada: { completed: true, completedAt: new Date('2024-02-05') },
        transitoMaritimo: { inProgress: true, startedAt: new Date('2024-02-10') },
        enAduana: { completed: false },
        liberada: { completed: false },
        entregada: { completed: false },
        documentosTransferidos: { completed: false },
        placasEntregadas: { completed: false }
      }
    };
    
    this.loadClientEvents();
  }
  
  private loadClientEvents(): void {
    // Mock event data - in real implementation, this would come from a service
    this.clientEvents = [
      {
        id: '1',
        type: 'Contribution' as any,
        actor: 'Cliente' as any,
        message: 'Aportación mensual realizada',
        timestamp: new Date('2024-01-18'),
        details: { amount: 8500, paymentMethod: 'Transferencia SPEI', currency: 'MXN' as const }
      },
      {
        id: '2',
        type: 'AdvisorAction' as any,
        actor: 'Asesor' as any,
        message: 'Documento INE aprobado',
        timestamp: new Date('2024-01-16'),
        details: { documentName: 'INE Vigente', status: 'Aprobado' }
      },
      {
        id: '3',
        type: 'System' as any,
        actor: 'Sistema' as any,
        message: 'Estado de cuenta generado',
        timestamp: new Date('2024-01-15'),
        details: {}
      }
    ];
  }
  
  // AVI Methods
  canStartAviVerification(): boolean {
    return this.client?.status === 'Expediente en Proceso';
  }
  
  startAviVerification(): void {
    this.showAviModal = true;
  }
  
  onAviCompleted(result: any): void {
    console.log('AVI Completed:', result);
    this.showAviModal = false;
    
    // Update client data with AVI results
    if (this.client) {
      // Pre-fill data extracted from AVI
      if (result.extractedData.nombre) {
        this.client.name = result.extractedData.nombre;
      }
      if (result.extractedData.rfc) {
        this.client.rfc = result.extractedData.rfc;
      }
      
      // Update status based on risk score
      if (result.riskScore < 30) {
        this.client.status = 'Verificación AVI Completada';
      } else {
        this.client.status = 'Requiere Supervisión';
      }
    }
  }
  
  onAviClosed(): void {
    this.showAviModal = false;
  }
  
  getMunicipality(): 'aguascalientes' | 'edomex' {
    return this.client?.market === 'edomex' ? 'edomex' : 'aguascalientes';
  }
  
  // Traditional Methods
  canStartKyc(): boolean {
    return this.client?.status === 'Documentos Completos';
  }
  
  startTraditionalKyc(): void {
    console.log('Starting traditional KYC');
  }
  
  canGenerateContract(): boolean {
    return this.client?.status === 'KYC Completado' || this.client?.status === 'Verificación AVI Completada';
  }
  
  generateContract(): void {
    console.log('Generating contract');
  }
  
  viewDocuments(): void {
    console.log('Viewing documents');
  }
  
  // Utility Methods
  getDocumentStats(): string {
    if (!this.client?.documents) return '0/0';
    const approved = this.client.documents.filter(d => d.status === 'Aprobado').length;
    const total = this.client.documents.length;
    return `${approved}/${total}`;
  }
  
  getFlowDisplayName(flow: any): string {
    const flowNames: Record<string, string> = {
      'VentaDirecta': 'Venta Directa',
      'VentaPlazo': 'Venta a Plazo',
      'AhorroProgramado': 'Ahorro Programado',
      'CreditoColectivo': 'Crédito Colectivo'
    };
    return flowNames[flow] || flow || 'No definido';
  }
  
  getMunicipalityName(market: any): string {
    const municipalities: Record<string, string> = {
      'aguascalientes': 'Aguascalientes',
      'edomex': 'Estado de México'
    };
    return municipalities[market] || market || 'No definido';
  }
  
  getScoreClass(score: number | undefined): string {
    if (!score) return 'text-[var(--text-2)]';
    if (score >= 80) return 'text-[var(--green)]';
    if (score >= 60) return 'text-[var(--yellow)]';
    return 'text-[var(--red)]';
  }
  
  getHealthScoreClass(): string {
    const score = this.client?.healthScore;
    if (score == null) {
      return '';
    }
    return this.getScoreClass(score);
  }
  
  // Progress Methods
  getSavingsProgress(): number {
    return this.client?.currentSavings || 0;
  }
  
  getSavingsGoal(): number {
    return this.client?.savingsGoal || 100000;
  }
  
  getPaymentProgress(): number {
    return this.client?.completedPayments || 0;
  }
  
  getTotalPayments(): number {
    return this.client?.totalPayments || 24;
  }
  
  getRemainingPayments(): string {
    const completed = this.client?.completedPayments || 0;
    const total = this.client?.totalPayments || 24;
    return `${total - completed} de ${total}`;
  }
  
  getLastContributionDate(): string {
    if (!this.client?.lastPaymentDate) return 'No registrada';
    return this.client.lastPaymentDate.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  getNextPaymentDue(): string {
    if (!this.client?.nextPaymentDue) return 'No programado';
    return this.client.nextPaymentDue.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  getEstimatedCompletion(): string {
    const completed = this.client?.completedPayments || 0;
    const total = this.client?.totalPayments || 24;
    const remaining = total - completed;
    
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + remaining);
    
    return completionDate.toLocaleDateString('es-MX', {
      month: 'short',
      year: 'numeric'
    });
  }
  
  getPaymentMilestones(): { value: number, label: string }[] {
    const total = this.client?.totalPayments || 24;
    return [
      { value: Math.floor(total * 0.25), label: '25%' },
      { value: Math.floor(total * 0.5), label: '50%' },
      { value: Math.floor(total * 0.75), label: '75%' }
    ];
  }
  
  // Payment Methods
  generatePaymentLink(method: 'spei' | 'conekta'): void {
    console.log(`Generating ${method} payment link for client:`, this.client?.id);
    // Implementation would create actual payment links
    const mockLinks = {
      spei: 'https://payments.conductores.mx/spei/client-001',
      conekta: 'https://payments.conductores.mx/card/client-001'
    };
    
    // In real implementation, this would open a payment modal or redirect
    window.open(mockLinks[method], '_blank');
  }
  
  // PDF Generation
  generatePDF(): void {
    this.isGeneratingPDF = true;
    
    // Simulate PDF generation
    setTimeout(() => {
      this.isGeneratingPDF = false;
      console.log('PDF generated for client:', this.client?.id);
      
      // In real implementation, this would trigger actual PDF generation
      const mockPdfUrl = `https://documents.conductores.mx/statements/client-001-${Date.now()}.pdf`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = mockPdfUrl;
      link.download = `estado-cuenta-${this.client?.name?.replace(/\s+/g, '-')}.pdf`;
      link.click();
    }, 2000);
  }
  
  previewAccountStatement(): void {
    console.log('Opening account statement preview');
    // Implementation would show a modal with statement preview
  }
  
  // Import Tracker Methods
  updateImportMilestone(milestoneKey: keyof ImportStatus): void {
    if (!this.client?.importStatus) return;
    
    const milestone = this.client.importStatus[milestoneKey];
    if (!milestone || Array.isArray(milestone)) {
      return;
    }
    if ((milestone as any).completed === false || (milestone as any).inProgress === true || (milestone as any).status !== 'completed') {
      // Mark as in progress or completed
      const m = milestone as any;
      if (m.inProgress) {
        m.completed = true;
        m.status = 'completed';
        m.completedAt = new Date();
        m.inProgress = false;
      } else {
        m.inProgress = true;
        m.status = 'in_progress';
        m.startedAt = new Date();
      }
      
      console.log(`Updated milestone ${milestoneKey}:`, milestone);
    }
  }
  
  // Protection System Methods
  isFinancialProduct(): boolean {
    if (!this.client?.flow) return false;
    
    const financialFlows = ['VentaPlazo', 'AhorroProgramado', 'CreditoColectivo'];
    return financialFlows.includes(this.client.flow as string);
  }
  
  getContractId(): string {
    return `contract-${this.client?.id || 'unknown'}`;
  }
  
  // Added getter methods
  get currentSavings(): number {
    return this.client?.currentSavings || 0;
  }

  get savingsGoal(): number {
    return this.client?.savingsGoal || 100000;
  }

  get completedPayments(): number {
    return this.client?.completedPayments || 0;
  }

  get totalPayments(): number {
    return this.client?.totalPayments || 24;
  }
}