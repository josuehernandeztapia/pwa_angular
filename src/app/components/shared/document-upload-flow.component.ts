import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { DocumentRequirementsService } from '../../services/document-requirements.service';
import { DocumentValidationService } from '../../services/document-validation.service';
import { VoiceValidationService } from '../../services/voice-validation.service';
import { AviSimpleConfigService } from '../../services/avi-simple-config.service';
import { OCRService, OCRResult, OCRProgress } from '../../services/ocr.service';
import { Document, DocumentStatus, BusinessFlow, Client } from '../../models/types';

interface FlowContext {
  clientId?: string;
  source: 'nueva-oportunidad' | 'simulador' | 'cotizador';
  market: 'aguascalientes' | 'edomex';
  businessFlow: BusinessFlow;
  clientType: 'individual' | 'colectivo';
  quotationData?: any;
  simulatorData?: any;
}

@Component({
  selector: 'app-document-upload-flow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="document-upload-flow" *ngIf="flowContext">
      <!-- Progress Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-2xl font-bold">Carga de Documentos</h1>
            <p class="text-blue-100">
              {{ getFlowTitle() }} - {{ flowContext.market === 'aguascalientes' ? 'Aguascalientes' : 'Estado de México' }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ completionStatus.completionPercentage }}%</div>
            <div class="text-blue-100 text-sm">{{ completionStatus.completedDocs }}/{{ completionStatus.totalDocs }} completos</div>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="w-full bg-blue-400 rounded-full h-3">
          <div 
            class="bg-white rounded-full h-3 transition-all duration-500"
            [style.width.%]="completionStatus.completionPercentage">
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Document Requirements Panel -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">📄</span>
              Documentos Requeridos
            </h2>
            
            <div class="space-y-4">
              <div *ngFor="let doc of requiredDocuments; let i = index" 
                   class="border rounded-lg p-4 transition-all duration-200"
                   [class.border-green-300]="doc.status === DocumentStatus.Aprobado"
                   [class.bg-green-50]="doc.status === DocumentStatus.Aprobado"
                   [class.border-yellow-300]="doc.status === DocumentStatus.Pendiente"
                   [class.bg-yellow-50]="doc.status === DocumentStatus.Pendiente"
                   [class.border-red-300]="doc.status === DocumentStatus.Rechazado"
                   [class.bg-red-50]="doc.status === DocumentStatus.Rechazado">
                
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center flex-wrap gap-2">
                      <span class="font-medium text-gray-800">{{ doc.name }}</span>
                      <span *ngIf="getDocumentTooltip(doc.name)" 
                            class="text-gray-400 cursor-help"
                            [title]="getDocumentTooltip(doc.name)">ℹ️</span>
                      <span *ngIf="isCritical(doc)"
                            class="ml-2 inline-block px-2 py-0.5 text-[11px] rounded-full bg-red-100 text-red-700 border border-red-200 cursor-help"
                            [title]="getCriticalTooltip(doc)">Crítico</span>
                      <span *ngIf="!isCritical(doc) && !isOptional(doc)"
                            class="ml-1 inline-block px-2 py-0.5 text-[11px] rounded-full bg-gray-100 text-gray-700 border border-gray-200">Obligatorio</span>
                      <span *ngIf="isOptional(doc)"
                            class="ml-1 inline-block px-2 py-0.5 text-[11px] rounded-full bg-blue-50 text-blue-700 border border-blue-200">Opcional</span>
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                      {{ getStatusText(doc.status) }}
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <!-- Upload Button -->
                    <button
                      *ngIf="doc.status === DocumentStatus.Pendiente"
                      (click)="uploadDocument(doc)"
                      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📤 Subir
                    </button>
                    
                    <!-- Status Icon -->
                    <div class="flex items-center">
                      <span *ngIf="doc.status === DocumentStatus.Aprobado" class="text-green-500 text-xl">✅</span>
                      <span *ngIf="doc.status === DocumentStatus.Pendiente" class="text-yellow-500 text-xl">⏳</span>
                      <span *ngIf="doc.status === DocumentStatus.Rechazado" class="text-red-500 text-xl">❌</span>
                      <div *ngIf="doc.status === DocumentStatus.EnRevision" 
                           class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Voice Pattern Verification Panel -->
          <div class="bg-white rounded-xl shadow-lg p-6" *ngIf="showVoicePattern">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span class="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">🎤</span>
              Verificación de Identidad por Voz
            </h2>
            
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p class="text-purple-700 text-sm mb-2">
                <strong>Patrón de Voz:</strong> "{{ voicePattern }}"
              </p>
              <p class="text-purple-600 text-xs">
                Repite exactamente esta frase para verificar tu identidad
              </p>
            </div>

            <div class="flex items-center space-x-4">
              <button
                (click)="startVoiceRecording()"
                [disabled]="isRecording || voiceVerified"
                class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <span *ngIf="!isRecording && !voiceVerified">🎤 Iniciar Grabación</span>
                <span *ngIf="isRecording" class="flex items-center">
                  <div class="animate-pulse w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Grabando...
                </span>
                <span *ngIf="voiceVerified">✅ Verificado</span>
              </button>
              
              <div *ngIf="voiceVerified" class="text-green-600 font-medium">
                Identidad verificada correctamente
              </div>
            </div>
          </div>

          <!-- AVI Integration Panel -->
          <div class="bg-white rounded-xl shadow-lg p-6" *ngIf="showAVI">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span class="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">🤖</span>
              Análisis AVI (Automated Voice Intelligence)
            </h2>
            
            <div class="space-y-4">
              <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="font-medium text-indigo-800">Estado del Análisis:</span>
                  <span class="px-3 py-1 rounded-full text-sm font-medium"
                        [class.bg-green-100]="aviAnalysis?.status === 'completed'"
                        [class.text-green-800]="aviAnalysis?.status === 'completed'"
                        [class.bg-yellow-100]="aviAnalysis?.status === 'processing'"
                        [class.text-yellow-800]="aviAnalysis?.status === 'processing'">
                    {{ getAVIStatusText(aviAnalysis?.status) }}
                  </span>
                </div>
                
                <div *ngIf="aviAnalysis?.status === 'completed'" class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-indigo-600">Confiabilidad:</span>
                    <span class="font-medium">{{ aviAnalysis.confidence }}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-indigo-600">Riesgo de Fraude:</span>
                    <span class="font-medium" 
                          [class.text-green-600]="aviAnalysis.fraudRisk === 'LOW'"
                          [class.text-yellow-600]="aviAnalysis.fraudRisk === 'MEDIUM'"
                          [class.text-red-600]="aviAnalysis.fraudRisk === 'HIGH'">
                      {{ getFraudRiskText(aviAnalysis.fraudRisk) }}
                    </span>
                  </div>
                </div>
                
                <div *ngIf="aviAnalysis?.status === 'processing'" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  <span class="text-indigo-600">Analizando patrones de voz...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Ecosistema EdoMex Panel -->
          <div class="bg-white rounded-xl shadow-lg p-6" *ngIf="flowContext.market === 'edomex'">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Ecosistema de Ruta (EdoMex)</h2>
            <p class="text-sm mb-4" [class.text-green-700]="isEcosystemComplete()" [class.text-yellow-700]="!isEcosystemComplete()">
              Validación de Ecosistema: {{ isEcosystemComplete() ? 'Completa' : 'Pendiente' }}
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Documentos de Ecosistema/Ruta -->
              <div>
                <h3 class="font-medium text-gray-700 mb-2">Ecosistema / Ruta</h3>
                <div class="space-y-2">
                  <div *ngFor="let name of ecosystemDocNames" class="flex items-center justify-between border rounded-lg p-3">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-gray-800">{{ name }}</span>
                      <span class="inline-block px-2 py-0.5 text-[11px] rounded-full bg-gray-100 text-gray-700 border border-gray-200">Obligatorio</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span [ngClass]="getDocStatusBadgeClass(name)">{{ getDocStatusText(name) }}</span>
                      <button class="text-xs px-2 py-1 rounded bg-blue-600 text-white" (click)="uploadEcosystemDoc(name)">Subir</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Agremiado (Críticos) -->
              <div>
                <h3 class="font-medium text-gray-700 mb-2">Agremiado (Críticos)</h3>
                <div class="space-y-2">
                  <div *ngFor="let item of memberCriticalDocs" class="flex items-center justify-between border rounded-lg p-3">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-gray-800">{{ item.name }}</span>
                      <span class="inline-block px-2 py-0.5 text-[11px] rounded-full bg-red-100 text-red-700 border border-red-200" [title]="item.tooltip">Crítico</span>
                      <span *ngIf="getRecencyLabel(item.name) as rec"
                            class="inline-block px-2 py-0.5 text-[11px] rounded-full border"
                            [ngClass]="rec.level === 'expired' ? 'bg-red-50 text-red-700 border-red-200' : (rec.level === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200')"
                      >{{ rec.text }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span [ngClass]="getDocStatusBadgeClass(item.name)">{{ getDocStatusText(item.name) }}</span>
                      <button class="text-xs px-2 py-1 rounded bg-blue-600 text-white" (click)="uploadEcosystemDoc(item.name)">Subir</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Colectivo: Padrón de Socios -->
            <div class="mt-4" *ngIf="flowContext.businessFlow === BusinessFlow.CreditoColectivo">
              <div class="flex items-center justify-between border rounded-lg p-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-gray-800">Padrón de Socios Actualizado</span>
                  <span class="inline-block px-2 py-0.5 text-[11px] rounded-full bg-gray-100 text-gray-700 border border-gray-200">Obligatorio</span>
                </div>
                <div class="flex items-center gap-2">
                  <span [ngClass]="getDocStatusBadgeClass('Padrón de Socios Actualizado')">{{ getDocStatusText('Padrón de Socios Actualizado') }}</span>
                  <button class="text-xs px-2 py-1 rounded bg-blue-600 text-white" (click)="uploadEcosystemDoc('Padrón de Socios Actualizado')">Subir</button>
                </div>
              </div>
            </div>

            <!-- Recordatorios sugeridos -->
            <div class="mt-4" *ngIf="edomexReminders().length">
              <h3 class="font-medium text-gray-700 mb-2">Recordatorios sugeridos</h3>
              <ul class="list-disc pl-6 text-sm space-y-1">
                <li *ngFor="let r of edomexReminders()">{{ r }}</li>
              </ul>
              <div class="mt-3 flex gap-2">
                <a class="text-xs inline-block px-3 py-1 rounded bg-green-600 text-white" [href]="whatsAppReminderLink()" target="_blank">Enviar por WhatsApp</a>
                <button class="text-xs inline-block px-3 py-1 rounded bg-gray-200 text-gray-800 border border-gray-300" (click)="copyReminderMessage()">Copiar mensaje</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions & Summary Panel -->
        <div class="space-y-6">
          <!-- Flow Context Summary -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Contexto del Flujo</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Origen:</span>
                <span class="font-medium">{{ getSourceText(flowContext.source) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Mercado:</span>
                <span class="font-medium">{{ flowContext.market === 'aguascalientes' ? 'Aguascalientes' : 'EdoMex' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tipo:</span>
                <span class="font-medium">{{ flowContext.clientType === 'individual' ? 'Individual' : 'Colectivo' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Flujo:</span>
                <span class="font-medium">{{ getBusinessFlowText(flowContext.businessFlow) }}</span>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Siguientes Pasos</h3>
            <div class="space-y-3">
              <div class="flex items-center" 
                   [class.opacity-50]="!completionStatus.allComplete">
                <span class="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3"
                      [class.bg-green-500]="completionStatus.allComplete"
                      [class.border-green-500]="completionStatus.allComplete"
                      [class.text-white]="completionStatus.allComplete"
                      [class.border-gray-300]="!completionStatus.allComplete">
                  <span *ngIf="completionStatus.allComplete">✓</span>
                  <span *ngIf="!completionStatus.allComplete">1</span>
                </span>
                <span [class.font-medium]="completionStatus.allComplete">Documentos completos</span>
              </div>
              
              <div class="flex items-center"
                   [class.opacity-50]="!voiceVerified">
                <span class="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3"
                      [class.bg-green-500]="voiceVerified"
                      [class.border-green-500]="voiceVerified"
                      [class.text-white]="voiceVerified"
                      [class.border-gray-300]="!voiceVerified">
                  <span *ngIf="voiceVerified">✓</span>
                  <span *ngIf="!voiceVerified">2</span>
                </span>
                <span [class.font-medium]="voiceVerified">Verificación de voz</span>
              </div>
              
              <div class="flex items-center"
                   [class.opacity-50]="!canProceedToContracts">
                <span class="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3"
                      [class.bg-green-500]="canProceedToContracts"
                      [class.border-green-500]="canProceedToContracts"
                      [class.text-white]="canProceedToContracts"
                      [class.border-gray-300]="!canProceedToContracts">
                  <span *ngIf="canProceedToContracts">✓</span>
                  <span *ngIf="!canProceedToContracts">3</span>
                </span>
                <span [class.font-medium]="canProceedToContracts">Listo para contratos</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button
              *ngIf="canProceedToContracts"
              (click)="proceedToContracts()"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Generar Contratos
            </button>
            
            <button
              (click)="goBack()"
              class="w-full border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Regresar
            </button>
            
            <button
              (click)="saveProgress()"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              💾 Guardar Progreso
            </button>
          </div>
        </div>
      </div>

      <!-- OCR Preview Modal -->
      <div class="ocr-preview-modal" *ngIf="showOCRPreview" (click)="closeOCRPreview()">
        <div class="ocr-preview-container" (click)="$event.stopPropagation()">
          <div class="ocr-preview-header">
            <h3>📄 Preview de Documento</h3>
            <button class="close-btn" (click)="closeOCRPreview()">✕</button>
          </div>
          
          <div class="ocr-progress-section" *ngIf="ocrProgress.status !== 'idle' && ocrProgress.status !== 'completed'">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="ocrProgress.progress"></div>
            </div>
            <p class="progress-message">{{ ocrProgress.message }}</p>
          </div>

          <div class="ocr-results" *ngIf="ocrResult">
            <div class="confidence-indicator" [class]="'confidence-' + getConfidenceLevel(ocrResult.confidence)">
              <span class="confidence-label">Confianza:</span>
              <span class="confidence-value">{{ (ocrResult.confidence * 100).toFixed(1) }}%</span>
            </div>

            <div class="extracted-data" *ngIf="ocrResult.extractedData">
              <h4>📋 Datos Extraídos:</h4>
              <div class="data-grid">
                <div class="data-item" *ngFor="let item of getExtractedDataArray(ocrResult.extractedData.fields)">
                  <span class="data-label">{{ item.key }}:</span>
                  <span class="data-value">{{ item.value }}</span>
                </div>
              </div>
            </div>

            <div class="raw-text-section">
              <h4>📝 Texto Completo:</h4>
              <div class="raw-text-container">
                <textarea readonly [value]="ocrResult.text" rows="8"></textarea>
              </div>
            </div>

            <div class="ocr-actions">
              <button class="btn-confirm" (click)="confirmOCRResult()">
                ✅ Confirmar y Continuar
              </button>
              <button class="btn-reprocess" (click)="reprocessOCR()">
                🔄 Subir Otra Imagen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .document-upload-flow {
      min-height: 100vh;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 20px;
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* OCR Preview Modal Styles */
    .ocr-preview-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .ocr-preview-container {
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
    }

    .ocr-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
    }

    .ocr-preview-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .ocr-progress-section {
      padding: 24px 32px;
      border-bottom: 1px solid #e5e7eb;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    .progress-message {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
      text-align: center;
    }

    .ocr-results {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .confidence-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      font-weight: 600;
    }

    .confidence-indicator.confidence-high {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .confidence-indicator.confidence-medium {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .confidence-indicator.confidence-low {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .extracted-data h4 {
      margin: 0 0 16px 0;
      color: #374151;
      font-size: 16px;
      font-weight: 600;
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .data-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .data-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .data-value {
      font-size: 14px;
      color: #374151;
      font-weight: 500;
      word-break: break-word;
    }

    .raw-text-section h4 {
      margin: 0 0 12px 0;
      color: #374151;
      font-size: 16px;
      font-weight: 600;
    }

    .raw-text-container textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      color: #374151;
      background: #f9fafb;
      resize: vertical;
    }

    .ocr-actions {
      display: flex;
      gap: 16px;
      margin-top: auto;
    }

    .btn-confirm,
    .btn-reprocess {
      flex: 1;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      border: none;
    }

    .btn-confirm {
      background: #10b981;
      color: white;
    }

    .btn-confirm:hover {
      background: #059669;
    }

    .btn-reprocess {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-reprocess:hover {
      background: #e5e7eb;
    }

    @media (max-width: 768px) {
      .ocr-preview-container {
        width: 95%;
        max-height: 95vh;
      }

      .ocr-preview-header {
        padding: 16px 20px;
      }

      .ocr-results {
        padding: 20px;
        gap: 20px;
      }

      .data-grid {
        grid-template-columns: 1fr;
      }

      .ocr-actions {
        flex-direction: column;
      }
    }
  `]
})
export class DocumentUploadFlowComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() flowContext!: FlowContext;
  @Output() flowComplete = new EventEmitter<any>();
  @Output() goBackRequested = new EventEmitter<void>();

  requiredDocuments: Document[] = [];
  completionStatus: any = {
    totalDocs: 0,
    completedDocs: 0,
    pendingDocs: 0,
    completionPercentage: 0,
    allComplete: false
  };

  // Voice Pattern & AVI
  voicePattern = '';
  showVoicePattern = false;
  isRecording = false;
  voiceVerified = false;
  showAVI = false;
  aviAnalysis: any = null;

  // OCR State
  ocrProgress: OCRProgress = { status: 'idle', progress: 0, message: '' };
  ocrResult: OCRResult | null = null;
  showOCRPreview = false;
  currentUploadingDoc: Document | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private documentRequirements: DocumentRequirementsService,
    private documentValidation: DocumentValidationService,
    private voiceValidation: VoiceValidationService,
    private aviConfig: AviSimpleConfigService,
    private ocrService: OCRService
  ) {}

  // Expose enums to template
  protected readonly DocumentStatus = DocumentStatus;
  protected readonly BusinessFlow = BusinessFlow;

  ngOnInit() {
    this.initializeFlow();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Cleanup OCR worker
    this.ocrService.terminateWorker();
  }

  private async initializeFlow() {
    if (!this.flowContext) return;

    // Load required documents based on flow context
    this.documentRequirements.getDocumentRequirements({
      market: this.flowContext.market,
      saleType: 'financiero', // Default for most flows
      businessFlow: this.flowContext.businessFlow,
      clientType: this.flowContext.clientType
    }).pipe(takeUntil(this.destroy$)).subscribe(docs => {
      this.requiredDocuments = docs;
      this.updateCompletionStatus();
    });

    // Initialize Voice Pattern for complex flows (not VentaDirecta)
    if (this.shouldUseVoicePattern()) {
      this.initializeVoicePattern();
    }

    // Initialize AVI for high-risk flows
    if (this.shouldUseAVI()) {
      this.initializeAVI();
    }
  }

  private shouldUseVoicePattern(): boolean {
    // Voice Pattern for complex flows (exclude VentaDirecta)
    return this.flowContext.businessFlow !== BusinessFlow.VentaDirecta &&
           (this.flowContext.businessFlow === BusinessFlow.VentaPlazo ||
            this.flowContext.businessFlow === BusinessFlow.CreditoColectivo ||
            this.flowContext.market === 'edomex');
  }

  private initializeVoicePattern() {
    this.voicePattern = this.voiceValidation.generateVoicePattern();
    this.showVoicePattern = true;
  }

  private shouldUseAVI(): boolean {
    // Use AVI for complex flows (exclude VentaDirecta/Contado)
    return this.flowContext.businessFlow !== BusinessFlow.VentaDirecta &&
           (this.flowContext.clientType === 'colectivo' || 
            this.flowContext.businessFlow === BusinessFlow.CreditoColectivo ||
            this.flowContext.businessFlow === BusinessFlow.VentaPlazo);
  }

  private initializeAVI() {
    this.showAVI = true;
    this.aviAnalysis = {
      status: 'pending',
      confidence: 0,
      fraudRisk: 'UNKNOWN'
    };
  }

  uploadDocument(document: Document) {
    this.currentUploadingDoc = document;
    this.showFileUploadDialog(document);
  }

  private showFileUploadDialog(document: Document) {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.multiple = false;

    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        await this.processUploadedFile(file, document);
      }
    };

    input.click();
  }

  private async processUploadedFile(file: File, document: Document) {
    try {
      document.status = DocumentStatus.EnRevision;
      this.updateCompletionStatus();

      // Check if it's an image for OCR processing
      if (file.type.startsWith('image/')) {
        await this.processImageWithOCR(file, document);
      } else if (file.type === 'application/pdf') {
        await this.processPDFUpload(file, document);
      } else {
        throw new Error('Tipo de archivo no soportado');
      }

    } catch (error) {
      console.error('Error processing file:', error);
      document.status = DocumentStatus.Rechazado;
      this.updateCompletionStatus();
    }
  }

  private async processImageWithOCR(file: File, document: Document) {
    try {
      // Initialize OCR worker
      await this.ocrService.initializeWorker();

      // Subscribe to OCR progress
      this.ocrService.progress$.pipe(takeUntil(this.destroy$)).subscribe(
        progress => this.ocrProgress = progress
      );

      // Extract text with OCR
      this.ocrResult = await this.ocrService.extractTextFromImage(file, document.name);
      
      // Show OCR preview for user confirmation
      this.showOCRPreview = true;
      this.currentUploadingDoc = document;

      console.log('OCR Result:', this.ocrResult);

    } catch (error) {
      console.error('OCR processing failed:', error);
      // Continue with regular upload even if OCR fails
      await this.finalizeDocumentUpload(document, file);
    }
  }

  private async processPDFUpload(file: File, document: Document) {
    // For PDF files, skip OCR and proceed with upload
    await this.finalizeDocumentUpload(document, file);
  }

  confirmOCRResult() {
    if (this.currentUploadingDoc && this.ocrResult) {
      this.finalizeDocumentUpload(this.currentUploadingDoc, null, this.ocrResult);
      this.closeOCRPreview();
    }
  }

  reprocessOCR() {
    if (this.currentUploadingDoc) {
      // Allow user to upload a different image
      this.showFileUploadDialog(this.currentUploadingDoc);
      this.closeOCRPreview();
    }
  }

  closeOCRPreview() {
    this.showOCRPreview = false;
    this.ocrResult = null;
    this.currentUploadingDoc = null;
    this.ocrProgress = { status: 'idle', progress: 0, message: '' };
  }

  private async finalizeDocumentUpload(document: Document, file: File | null, ocrData?: OCRResult) {
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate document based on OCR results if available
    if (ocrData && ocrData.extractedData) {
      const validation = this.ocrService.validateDocumentType(ocrData.text, document.name);
      
      if (validation.valid && validation.confidence > 0.7) {
        document.status = DocumentStatus.Aprobado;
        // Store extracted data for later use
        (document as any).extractedData = ocrData.extractedData;
      } else {
        document.status = DocumentStatus.EnRevision;
        console.log('Document needs review - low confidence or type mismatch');
      }
    } else {
      // Default approval for non-OCR uploads
      document.status = DocumentStatus.Aprobado;
    }

    // Mark timestamps for recency/expiry checks
    (document as any).uploadedAt = new Date();

    this.updateCompletionStatus();
    
    // Check if all core documents are complete to enable voice verification
    if (this.completionStatus.allComplete && this.showVoicePattern && !this.voiceVerified) {
      // Auto-start voice pattern if all docs are uploaded
      this.showVoicePattern = true;
    }
  }

  startVoiceRecording() {
    this.isRecording = true;
    
    // Mock voice recording and pattern matching
    setTimeout(() => {
      this.isRecording = false;
      this.voiceVerified = true;
      
      // Trigger AVI analysis if enabled
      if (this.showAVI) {
        this.startAVIAnalysis();
      }
    }, 3000);
  }

  private startAVIAnalysis() {
    this.aviAnalysis = {
      status: 'processing',
      confidence: 0,
      fraudRisk: 'UNKNOWN'
    };

    // Mock AVI processing
    setTimeout(() => {
      this.aviAnalysis = {
        status: 'completed',
        confidence: 94,
        fraudRisk: 'LOW'
      };
    }, 4000);
  }

  private updateCompletionStatus() {
    this.completionStatus = this.documentRequirements.getDocumentCompletionStatus(this.requiredDocuments);
  }

  get canProceedToContracts(): boolean {
    const docsComplete = this.completionStatus.allComplete;
    const voiceComplete = !this.showVoicePattern || this.voiceVerified;
    const aviComplete = !this.showAVI || (this.aviAnalysis?.status === 'completed' && this.aviAnalysis?.fraudRisk !== 'HIGH');
    
    return docsComplete && voiceComplete && aviComplete;
  }

  proceedToContracts() {
    const contractData = {
      flowContext: this.flowContext,
      documentsComplete: true,
      voiceVerified: this.voiceVerified,
      aviAnalysis: this.aviAnalysis,
      contractType: this.getContractType()
    };

    // Emit completion event with all flow data
    this.flowComplete.emit(contractData);
    
    // Navigate to contract generation or final step
    this.router.navigate(['/contratos/generacion'], {
      queryParams: {
        clientId: this.flowContext.clientId,
        source: this.flowContext.source,
        market: this.flowContext.market,
        businessFlow: this.flowContext.businessFlow
      }
    });
  }

  private getContractType(): string {
    if (this.flowContext.businessFlow === BusinessFlow.VentaPlazo) {
      return this.flowContext.market === 'edomex' ? 'PAQUETE_DACION_PAGO' : 'VENTA_PLAZO';
    }
    return 'PROMESA_COMPRAVENTA';
  }

  saveProgress() {
    const progressData = {
      flowContext: this.flowContext,
      requiredDocuments: this.requiredDocuments,
      voicePattern: this.voicePattern,
      voiceVerified: this.voiceVerified,
      aviAnalysis: this.aviAnalysis,
      timestamp: new Date().toISOString()
    };

    sessionStorage.setItem(`documentProgress_${this.flowContext.clientId}`, JSON.stringify(progressData));
    console.log('Progreso guardado:', progressData);
  }

  goBack() {
    this.goBackRequested.emit();
  }

  // Helper methods for template
  getFlowTitle(): string {
    switch (this.flowContext.source) {
      case 'cotizador': return 'Cotización Generada';
      case 'simulador': return 'Simulación Completada';
      case 'nueva-oportunidad': return 'Nueva Oportunidad';
      default: return 'Proceso de Documentos';
    }
  }

  getSourceText(source: string): string {
    switch (source) {
      case 'cotizador': return 'Cotizador';
      case 'simulador': return 'Simulador';
      case 'nueva-oportunidad': return 'Nueva Oportunidad';
      default: return source;
    }
  }

  getBusinessFlowText(flow: BusinessFlow): string {
    switch (flow) {
      case BusinessFlow.VentaPlazo: return 'Venta a Plazo';
      case BusinessFlow.VentaDirecta: return 'Venta Directa';
      case BusinessFlow.CreditoColectivo: return 'Crédito Colectivo';
      case BusinessFlow.AhorroProgramado: return 'Ahorro Programado';
      default: return flow;
    }
  }

  getStatusText(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.Pendiente: return 'Pendiente de subir';
      case DocumentStatus.EnRevision: return 'Procesando...';
      case DocumentStatus.Aprobado: return 'Aprobado';
      case DocumentStatus.Rechazado: return 'Rechazado - Revisar';
      default: return status;
    }
  }

  getAVIStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'completed': return 'Completado';
      default: return status;
    }
  }

  getFraudRiskText(risk: string): string {
    switch (risk) {
      case 'LOW': return 'Bajo';
      case 'MEDIUM': return 'Medio';
      case 'HIGH': return 'Alto';
      default: return 'Desconocido';
    }
  }

  getDocumentTooltip(documentName: string): string | undefined {
    return this.documentRequirements.getDocumentTooltip(documentName);
  }

  // === Label helpers (Obligatorio / Crítico / Opcional) ===
  isOptional(doc: Document): boolean {
    return (doc.name || '').toLowerCase().includes('opcional');
  }

  isCritical(doc: Document): boolean {
    const name = (doc.name || '').toLowerCase();
    const market = this.flowContext?.market;
    const flow = this.flowContext?.businessFlow;

    // Flujos con financiamiento requieren KYC
    const kycRequired = flow !== BusinessFlow.VentaDirecta;

    // Desbloqueo de KYC
    if (kycRequired && (name === 'ine vigente' || name === 'comprobante de domicilio')) return true;

    // KYC en sí mismo
    if (kycRequired && name.includes('verificación biométrica')) return true;

    // EdoMex agremiado: críticos
    if (market === 'edomex' && (name.includes('carta aval de ruta') || name.includes('carta de antigüedad'))) return true;

    return false;
  }

  getCriticalTooltip(doc: Document): string {
    const name = (doc.name || '').toLowerCase();
    const market = this.flowContext?.market;
    const flow = this.flowContext?.businessFlow;
    const kycRequired = flow !== BusinessFlow.VentaDirecta;

    if (kycRequired && (name === 'ine vigente' || name === 'comprobante de domicilio')) {
      return 'Desbloquea KYC biométrico';
    }
    if (kycRequired && name.includes('verificación biométrica')) {
      return 'Desbloquea scoring y contrato';
    }
    if (market === 'edomex' && name.includes('carta aval de ruta')) {
      return 'Validación de agremiado: requisito crítico de ecosistema';
    }
    if (market === 'edomex' && name.includes('carta de antigüedad')) {
      return 'Valida antigüedad en la ruta (EdoMex)';
    }
    return 'Requisito crítico para avanzar en el flujo';
  }

  // === Ecosistema EdoMex Helpers ===
  protected readonly ecosystemDocNames: string[] = [
    'Acta Constitutiva de la Ruta',
    'Poderes',
    'INE Representante Legal',
    'Constancia Situación Fiscal Ruta'
  ];

  protected readonly memberCriticalDocs: { name: string; tooltip: string; windowDays: number }[] = [
    { name: 'Carta Aval de Ruta', tooltip: 'Validación de agremiado: requisito crítico de ecosistema', windowDays: 180 },
    { name: 'Carta de Antigüedad de la Ruta', tooltip: 'Valida antigüedad en la ruta (EdoMex)', windowDays: 90 }
  ];

  private findDocByName(name: string): Document | undefined {
    const lower = name.toLowerCase();
    return this.requiredDocuments.find(d => (d.name || '').toLowerCase() === lower)
        || this.requiredDocuments.find(d => (d.name || '').toLowerCase().includes(lower));
  }

  getDocStatusText(name: string): string {
    const doc = this.findDocByName(name);
    if (!doc) return 'Pendiente';
    return this.getStatusText(doc.status as any);
  }

  getDocStatusBadgeClass(name: string): string {
    const doc = this.findDocByName(name);
    const status = doc?.status;
    if (status === DocumentStatus.Aprobado) return 'text-xs px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200';
    if (status === DocumentStatus.EnRevision) return 'text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200';
    if (status === DocumentStatus.Rechazado) return 'text-xs px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200';
    return 'text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200';
  }

  isEcosystemComplete(): boolean {
    const allEco = this.ecosystemDocNames.every(n => this.findDocByName(n)?.status === DocumentStatus.Aprobado);
    const allCritical = this.memberCriticalDocs.every(c => this.findDocByName(c.name)?.status === DocumentStatus.Aprobado);
    return allEco && allCritical;
  }

  getRecencyLabel(name: string): { level: 'ok'|'warning'|'expired'; text: string } | null {
    const doc = this.findDocByName(name) as any;
    if (!doc) return null;
    const windowDays = this.memberCriticalDocs.find(c => c.name === name)?.windowDays || 0;
    const now = new Date();
    // Priorizar expirationDate si existe
    if (doc?.expirationDate) {
      const exp = new Date(doc.expirationDate);
      const diffDays = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return { level: 'expired', text: 'Vencido' };
      if (diffDays <= 14) return { level: 'warning', text: `Por expirar (${diffDays} días)` };
      return { level: 'ok', text: `Vigente (${diffDays} días)` };
    }
    if (!windowDays) return null;
    const uploadedAt = doc?.uploadedAt ? new Date(doc.uploadedAt) : null;
    if (!uploadedAt) return null;
    const elapsedDays = Math.floor((now.getTime() - uploadedAt.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = windowDays - elapsedDays;
    if (remaining <= 0) return { level: 'expired', text: 'Vencido' };
    if (remaining <= 14) return { level: 'warning', text: `Por expirar (${remaining} días)` };
    return { level: 'ok', text: `Vigente (${remaining} días)` };
  }

  // OCR Helper methods
  getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  getExtractedDataArray(fields: any): { key: string; value: string }[] {
    return Object.entries(fields).map(([key, value]) => ({
      key: this.formatFieldName(key),
      value: value as string
    }));
  }

  private formatFieldName(key: string): string {
    const fieldNames: { [key: string]: string } = {
      'curp': 'CURP',
      'nombre': 'Nombre',
      'apellidos': 'Apellidos',
      'fechaNacimiento': 'Fecha de Nacimiento',
      'placas': 'Placas',
      'marca': 'Marca',
      'modelo': 'Modelo',
      'año': 'Año',
      'direccion': 'Dirección',
      'fecha': 'Fecha',
      'proveedor': 'Proveedor',
      'rfc': 'RFC'
    };
    
    return fieldNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  // === Upload helpers for Ecosystem panel ===
  private ensureDoc(name: string): Document {
    const existing = this.findDocByName(name);
    if (existing) return existing;
    const doc: Document = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      status: DocumentStatus.Pendiente
    } as any;
    this.requiredDocuments = [...this.requiredDocuments, doc];
    this.updateCompletionStatus();
    return doc;
  }

  uploadEcosystemDoc(name: string) {
    const doc = this.ensureDoc(name);
    this.uploadDocument(doc);
  }

  // === Reminders for EdoMex criticals ===
  edomexReminders(): string[] {
    if (this.flowContext.market !== 'edomex') return [];
    const msgs: string[] = [];
    // Missing criticals
    this.memberCriticalDocs.forEach(c => {
      const d = this.findDocByName(c.name);
      if (!d || d.status !== DocumentStatus.Aprobado) {
        msgs.push(`Falta documento crítico: ${c.name}.`);
      } else {
        const rec = this.getRecencyLabel(c.name);
        if (rec?.level === 'warning') msgs.push(`${c.name} por expirar: ${rec.text}.`);
        if (rec?.level === 'expired') msgs.push(`${c.name} vencido: subir documento actualizado.`);
      }
    });
    // Colectivo: padrón
    if (this.flowContext.businessFlow === BusinessFlow.CreditoColectivo) {
      const padron = this.findDocByName('Padrón de Socios Actualizado');
      if (!padron || padron.status !== DocumentStatus.Aprobado) msgs.push('Falta Padrón de Socios Actualizado.');
    }
    return msgs;
  }

  whatsAppReminderLink(): string {
    const client = this.flowContext.clientId || '';
    const lines = this.edomexReminders();
    const base = `Hola, te comparto los pendientes de documentación para continuar tu proceso:\n- ${lines.join('\n- ')}\nGracias.`;
    const url = 'https://wa.me/?text=' + encodeURIComponent(base);
    return url;
  }

  async copyReminderMessage() {
    const lines = this.edomexReminders();
    const text = `Hola, te comparto los pendientes de documentación para continuar tu proceso:\n- ${lines.join('\n- ')}\nGracias.`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      console.log('Mensaje copiado');
    } catch (e) {
      console.warn('No se pudo copiar al portapapeles');
    }
  }
}
