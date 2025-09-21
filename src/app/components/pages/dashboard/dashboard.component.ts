import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ActionableClient, ActionableGroup, ActivityFeedItem, DashboardStats, Market, OpportunityStage } from '../../../models/types';
import { DashboardService } from '../../../services/dashboard.service';
import { ClientModeToggleComponent, ViewMode } from '../../shared/client-mode-toggle/client-mode-toggle.component';
import { ContextualKPIsComponent, KPIData } from '../../shared/contextual-kpis/contextual-kpis.component';
import { DevKpiMiniComponent } from '../../shared/dev-kpi-mini.component';
import { ActivityItem, HumanActivityFeedComponent } from '../../shared/human-activity-feed/human-activity-feed.component';
import { ActionButton, NextBestActionData, NextBestActionHeroComponent } from '../../shared/next-best-action-hero/next-best-action-hero.component';
import { RiskRadarClient, RiskRadarComponent } from '../../shared/risk-radar/risk-radar.component';
 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NextBestActionHeroComponent,
    ContextualKPIsComponent,
    RiskRadarComponent,
    HumanActivityFeedComponent,
    ClientModeToggleComponent,
    DevKpiMiniComponent
  ],
  template: `
    <div class="command-center-dashboard">
      <!-- Dashboard Header with Client Mode Toggle -->
      <header class="command-header ui-card">
        <div class="command-title-section">
          <h1 class="command-title">
            Centro de Comando
          </h1>
          <p class="command-subtitle">Tu plan de acción para hoy, Ricardo.</p>
        </div>
        
        <div class="command-controls">
          <app-client-mode-toggle 
            [currentMode]="currentViewMode" 
            (modeChanged)="onViewModeChanged($event)">
          </app-client-mode-toggle>
          
          <div class="user-info">
            <span class="user-name">👤 {{ userName }} ⏷</span>
            <button
              class="ui-btn ui-btn-secondary client-mode-badge"
              (click)="toggleProfileDropdown()"
            >
              Modo Cliente
            </button>
          </div>
        </div>
      </header>

      <main class="command-dashboard-main">
        <!-- Tu Próxima Mejor Acción (The Brain) -->
        <section class="next-best-action-hero ui-card">
          <div class="hero-header">
            <h2 class="hero-title">TU PRÓXIMA MEJOR ACCIÓN</h2>
          </div>
          
          <app-next-best-action-hero 
            *ngIf="nextBestAction"
            [data]="nextBestAction"
            (actionExecuted)="onActionExecuted($event)">
          </app-next-best-action-hero>
        </section>

        <!-- KPIs Contextuales & Radar de Riesgo -->
        <section class="intelligence-grid">
          <div class="kpis-section ui-card">
            <h3 class="section-title">KPIs Clave (vs. Semana Pasada)</h3>
            <app-contextual-kpis 
              [kpis]="contextualKPIs"
              [showTrends]="true">
            </app-contextual-kpis>
            <div *ngIf="env.features?.enableDevKpi" style="margin-top:12px">
              <app-dev-kpi-mini></app-dev-kpi-mini>
            </div>
          </div>
          
          <div class="risk-radar-section ui-card">
            <h3 class="section-title">Radar de Riesgo</h3>
            <p class="section-subtitle">(Visualización de clientes por Health Score)</p>
            <app-risk-radar 
              [clients]="riskRadarClients"
              (clientSelected)="onRiskClientSelected($event)"
              (actionRequested)="onRiskActionRequested($event)">
            </app-risk-radar>
          </div>
        </section>

        <!-- Feed de Actividad Humano -->
        <section class="human-activity-section ui-card">
          <h2 class="section-title">Feed de Actividad en Tiempo Real</h2>
          <div class="activity-feed-container">
            <app-human-activity-feed 
              [activities]="activityFeed"
              [maxItems]="4"
              [showSuggestedActions]="true">
            </app-human-activity-feed>
          </div>
        </section>

      </main>
    </div>
  `,
  styles: [`
    /* ===== COMMAND CENTER DASHBOARD (Minimal Dark) ===== */
    .command-center-dashboard {
      min-height: 100vh;
      background: var(--surface-dark);
      color: var(--text-light);
    }

    /* ===== HEADER ===== */
    .command-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      border: 1px solid var(--border-dark);
    }

    .command-title-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .command-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-light);
      letter-spacing: -0.01em;
    }

    .command-subtitle {
      margin: 0;
      color: var(--text-2);
      font-size: 1rem;
      font-weight: 500;
    }

    .command-controls {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-name {
      color: var(--text-2);
      font-weight: 600;
      font-size: 0.95rem;
    }

    .client-mode-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    /* ===== MAIN DASHBOARD LAYOUT ===== */
    .command-dashboard-main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 32px 32px 32px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* ===== CARDS ===== */
    .next-best-action-hero,
    .kpis-section,
    .risk-radar-section,
    .human-activity-section {
      border: 1px solid var(--border-dark);
      padding: 32px;
    }

    .hero-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .hero-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-light);
      margin: 0;
      letter-spacing: 0.01em;
    }

    /* ===== GRID ===== */
    .intelligence-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-light);
      margin: 0 0 8px 0;
    }

    .section-subtitle {
      font-size: 0.95rem;
      color: var(--text-2);
      margin: 0 0 24px 0;
    }

    .activity-feed-container {
      margin-top: 16px;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1200px) {
      .intelligence-grid {
        grid-template-columns: 1fr;
      }
      .command-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }
    }

    @media (max-width: 768px) {
      .command-dashboard-main {
        padding: 0 16px 16px 16px;
      }
      .command-header {
        padding: 20px 16px;
      }
      .command-title {
        font-size: 1.4rem;
      }
      .next-best-action-hero,
      .kpis-section,
      .risk-radar-section,
      .human-activity-section {
        padding: 24px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State management
  userName = 'Ricardo Montoya';
  selectedMarket: Market = 'all';
  isLoading = true;
  showProfileDropdown = false;
  
  // Dashboard data
  stats: DashboardStats | null = null;
  // Back-compat for specs
  dashboardStats!: DashboardStats;
  activityFeed: ActivityFeedItem[] = [];
  funnelData: OpportunityStage[] = [];
  actionableGroups: ActionableGroup[] = [];
  allClients: ActionableClient[] = [];

  // Dashboard features data
  currentViewMode: ViewMode = 'advisor';
  nextBestAction?: NextBestActionData;
  contextualKPIs: KPIData[] = [];
  riskRadarClients: RiskRadarClient[] = [];

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  env = environment as any;

  ngOnInit(): void {
    this.loadDashboardData();
    this.subscribeToActivityFeed();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Strategic Implementation: Center of Command
   * Creates new opportunity using guided modal flow with SMART CONTEXT
   */
  createNewOpportunity(): void {
    // Smart Context Integration: Pass current dashboard state as intelligence
    const smartContext = {
      // Market intelligence from current filter
      market: this.selectedMarket !== 'all' ? this.selectedMarket : undefined,
      // Business intelligence from current stats
      suggestedFlow: this.getSuggestedFlowFromStats(),
      // Temporal context
      timestamp: Date.now(),
      // Dashboard context for return navigation
      returnContext: 'dashboard-filtered'
    };
    
    this.router.navigate(['/nueva-oportunidad'], { 
      queryParams: smartContext
    });
  }

  /**
   * Intelligent Flow Suggestion based on current pipeline stats
   */
  private getSuggestedFlowFromStats(): string | undefined {
    if (!this.stats) return undefined;
    
    const { nuevas, expediente, aprobado } = this.stats.opportunitiesInPipeline;
    
    // Business Intelligence: Suggest based on pipeline balance
    if (nuevas > expediente + aprobado) {
      return 'COTIZACION'; // Pipeline needs more conversions
    } else if (aprobado > nuevas) {
      return 'SIMULACION'; // Pipeline is healthy, focus on long-term planning
    }
    
    return undefined; // Let user choose
  }

  /**
   * Toggle profile dropdown menu
   */
  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  /**
   * Filter dashboard by market
   */
  onMarketFilter(market: Market): void {
    this.selectedMarket = market;
    this.loadDashboardData();
  }

  // Methods expected by specs
  onMarketChanged(market: Market): void {
    this.selectedMarket = market;
    this.dashboardService.updateMarket(market);
  }

  navigateToClient(clientId: string): void {
    this.router.navigate(['/clientes', clientId]);
  }

  navigateToOpportunities(): void {
    this.router.navigate(['/opportunities']);
  }

  /**
   * Load dashboard statistics
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Use forkJoin so synchronous Observables (of(...)) resolve within the same tick in tests
    const stats$ = this.dashboardService.getDashboardStats(this.selectedMarket);
    const funnel$ = this.dashboardService.getOpportunityStages(this.selectedMarket);
    const groups$ = this.dashboardService.getActionableGroups(this.selectedMarket);
    const clients$ = this.dashboardService.getAllClients?.(this.selectedMarket) ?? of([]);

    forkJoin({ stats: stats$, funnel: funnel$, groups: groups$, clients: clients$ }).subscribe({
      next: ({ stats, funnel, groups, clients }: any) => {
        this.stats = stats || null;
        if (stats) {
          this.dashboardStats = stats;
        }
        this.funnelData = funnel || [];
        this.actionableGroups = groups || [];
        this.allClients = clients || [];

        // Initialize dashboard features with loaded data
        this.initializeDashboardFeatures();

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error?.message || error);
        this.isLoading = false;

        // Fallback mock data for development
        this.loadMockData();
        // Initialize dashboard features with mock data
        this.initializeDashboardFeatures();
      }
    });
  }

  /**
   * Subscribe to real-time activity feed
   */
  private subscribeToActivityFeed(): void {
    const source: any = (this.dashboardService as any).activityFeed$ || this.dashboardService.getActivityFeed?.();
    if (!source || typeof source.pipe !== 'function') {
      return;
    }
    source
      .pipe(takeUntil(this.destroy$))
      .subscribe((activities: ActivityItem[] | ActivityFeedItem[]) => {
        this.activityFeed = activities as ActivityFeedItem[];
      });
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format time ago for activity feed
   */
  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minutos`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} días`;
  }

  // Premium Component Event Handlers
  onViewModeChanged(mode: ViewMode): void {
    this.currentViewMode = mode;
    if (mode === 'client') {
      this.loadClientViewData();
    }
  }

  onActionExecuted(event: {action: ActionButton, context: NextBestActionData}): void {
    console.log('Executing action:', event.action, 'for context:', event.context);
    switch (event.action.action) {
      case 'call_client':
        // Navigate to client detail or trigger call interface
        break;
      case 'send_whatsapp':
        // Trigger WhatsApp integration
        break;
      case 'view_expediente':
        // Navigate to client expediente
        this.router.navigate(['/clientes', event.context.client.id]);
        break;
    }
  }

  onRiskClientSelected(client: RiskRadarClient): void {
    console.log('Risk client selected:', client);
  }

  onRiskActionRequested(client: RiskRadarClient): void {
    console.log('Risk action requested for:', client);
    this.convertRiskClientToNextBestAction(client);
  }

  private convertRiskClientToNextBestAction(riskClient: RiskRadarClient): void {
    this.nextBestAction = {
      id: `risk-action-${riskClient.id}`,
      type: 'contact',
      priority: riskClient.riskLevel === 'critical' ? 'critical' : 'high',
      client: {
        id: riskClient.id,
        name: riskClient.name,
        healthScore: riskClient.healthScore
      },
      action: {
        title: `Contactar a ${riskClient.name}`,
        description: `Cliente en riesgo ${riskClient.riskLevel} requiere atención inmediata`,
        reasoning: `Health Score: ${riskClient.healthScore}. Issues: ${riskClient.issues.join(', ')}`,
        timeEstimate: '10 min'
      },
      context: {
        daysWaiting: Math.floor((Date.now() - new Date(riskClient.lastContact).getTime()) / (1000 * 60 * 60 * 24)),
        amountInvolved: riskClient.value
      },
      suggestedActions: {
        primary: {
          label: 'Llamar Ahora',
          icon: '📞',
          action: 'call_client',
          params: { clientId: riskClient.id }
        },
        secondary: [
          {
            label: 'Enviar WhatsApp',
            icon: '📱',
            action: 'send_whatsapp',
            params: { clientId: riskClient.id }
          },
          {
            label: 'Ver Expediente',
            icon: '📄',
            action: 'view_expediente',
            params: { clientId: riskClient.id }
          }
        ]
      }
    };
  }

  private loadClientViewData(): void {
    // Load simplified data for client view mode
    console.log('Loading client view data');
  }

  private initializeDashboardFeatures(): void {
    this.loadNextBestAction();
    this.loadContextualKPIs();
    this.loadRiskRadarData();
  }

  private loadNextBestAction(): void {
    // Generate NextBestAction from current actionable groups
    if (this.actionableGroups.length > 0) {
      const highPriorityGroup = this.actionableGroups.find(g => (g as any).priority === 'high');
      if (highPriorityGroup && highPriorityGroup.clients.length > 0) {
        const client = highPriorityGroup.clients[0];
        this.nextBestAction = {
          id: `action-${client.id}`,
          type: 'document',
          priority: 'high',
          client: {
            id: client.id,
            name: client.name,
            healthScore: 78,
            route: 'Ruta 27'
          },
          action: {
            title: `Contactar a ${client.name}`,
            description: `Su expediente está incompleto (falta INE). Tiene un Health Score de 78.`,
            reasoning: `Cliente con alto potencial, requiere atención inmediata para mantener el momentum.`,
            timeEstimate: '5 min'
          },
          context: {
            daysWaiting: (client as any).daysInStage || 5,
            amountInvolved: 15000
          },
          suggestedActions: {
            primary: {
              label: 'Ver Expediente',
              icon: '📄',
              action: 'view_expediente'
            },
            secondary: [
              {
                label: 'Llamar Ahora',
                icon: '📞',
                action: 'call_client'
              },
              {
                label: 'Enviar Recordatorio por WhatsApp',
                icon: '📱',
                action: 'send_whatsapp'
              }
            ]
          }
        };
      }
    }

    // Fallback mock action if no actionable groups
    if (!this.nextBestAction) {
      this.nextBestAction = {
        id: 'mock-action-1',
        type: 'contact',
        priority: 'high',
        client: {
          id: 'client-1',
          name: 'María García',
          healthScore: 78,
          route: 'Ruta 27'
        },
        action: {
          title: 'Contactar a María García (Ruta 27)',
          description: 'Su expediente está incompleto (falta INE). Tiene un Health Score de 78.',
          reasoning: 'Cliente con alto potencial que necesita completar documentación para avanzar en el proceso.',
          timeEstimate: '5 min'
        },
        context: {
          daysWaiting: 5,
          amountInvolved: 15000
        },
        suggestedActions: {
          primary: {
            label: 'Ver Expediente',
            icon: '📄',
            action: 'view_expediente'
          },
          secondary: [
            {
              label: 'Llamar Ahora',
              icon: '📞',
              action: 'call_client'
            },
            {
              label: 'Enviar Recordatorio por WhatsApp',
              icon: '📱',
              action: 'send_whatsapp'
            }
          ]
        }
      };
    }
  }

  getCompletionPercentage(): number {
    if (!this.dashboardStats) return 0;
    const collected = this.dashboardStats.monthlyRevenue.collected;
    const projected = this.dashboardStats.monthlyRevenue.projected || 1;
    return Math.round((collected / projected) * 100);
  }

  getNextBestAction(): { title: string } {
    return { title: 'Siguiente acción sugerida' };
  }

  getHighPriorityClients(): any[] {
    return (this.actionableGroups?.[0]?.clients as any[]) || [];
  }

  private loadContextualKPIs(): void {
    if (!this.stats) {
      // Mock KPIs for development
      this.contextualKPIs = [
        {
          id: 'opportunities',
          title: 'Oportunidades',
          value: 5,
          previousValue: 4,
          trend: 'up',
          trendPercentage: 25,
          format: 'number',
          icon: '💡',
          color: 'primary',
          subtitle: 'Nuevas esta semana'
        },
        {
          id: 'conversion',
          title: 'Tasa de Cierre',
          value: 28,
          previousValue: 32,
          trend: 'down',
          trendPercentage: 12.5,
          format: 'percentage',
          icon: '🎯',
          color: 'accent'
        },
        {
          id: 'contracts',
          title: 'Contratos Activos',
          value: 28,
          previousValue: 26,
          trend: 'stable',
          trendPercentage: 7.7,
          format: 'number',
          icon: '📋',
          color: 'success'
        },
        {
          id: 'revenue',
          title: 'Revenue del Mes',
          value: 1250000,
          previousValue: 1115000,
          trend: 'up',
          trendPercentage: 12.1,
          format: 'currency',
          icon: '💰',
          color: 'accent'
        }
      ];
      return;
    }

    this.contextualKPIs = [
      {
        id: 'opportunities',
        title: 'Oportunidades',
        value: this.stats.opportunitiesInPipeline.nuevas,
        previousValue: this.stats.opportunitiesInPipeline.nuevas - 1,
        trend: this.stats.opportunitiesInPipeline.nuevas > 4 ? 'up' : 'down',
        trendPercentage: 25,
        format: 'number',
        icon: '💡',
        color: 'primary',
        subtitle: 'Nuevas esta semana'
      },
      {
        id: 'conversion',
        title: 'Tasa de Cierre',
        value: 28,
        previousValue: 32,
        trend: 28 > 25 ? 'up' : 'down',
        trendPercentage: 15,
        format: 'percentage',
        icon: '🎯',
        color: 'accent'
      },
      {
        id: 'contracts',
        title: 'Contratos Activos',
        value: this.stats.activeContracts,
        previousValue: this.stats.activeContracts - 2,
        trend: 'stable',
        trendPercentage: 0,
        format: 'number',
        icon: '📋',
        color: 'success'
      },
      {
        id: 'revenue',
        title: 'Revenue del Mes',
        value: this.stats.monthlyRevenue.collected,
        previousValue: this.stats.monthlyRevenue.collected * 0.88,
        trend: 'up',
        trendPercentage: 12,
        format: 'currency',
        icon: '💰',
        color: 'accent'
      }
    ];
  }

  private loadRiskRadarData(): void {
    // Mock risk radar data
    this.riskRadarClients = [
      {
        id: 'client-risk-1',
        name: 'María González',
        healthScore: 45,
        riskLevel: 'critical',
        position: { x: 20, y: 80 },
        issues: ['Documentos Vencidos', 'Sin contacto 7 días'],
        lastContact: 'hace 7 días',
        value: 25000,
        urgency: 9
      },
      {
        id: 'client-risk-2',
        name: 'Carlos Méndez', 
        healthScore: 62,
        riskLevel: 'medium',
        position: { x: 65, y: 45 },
        issues: ['INE Vencida'],
        lastContact: 'hace 3 días',
        value: 18000,
        urgency: 6
      },
      {
        id: 'client-risk-3',
        name: 'Ana Ruiz',
        healthScore: 85,
        riskLevel: 'low',
        position: { x: 80, y: 20 },
        issues: ['Meta Completada'],
        lastContact: 'hace 1 día',
        value: 30000,
        urgency: 2
      },
      {
        id: 'client-risk-4',
        name: 'José Hernández',
        healthScore: 38,
        riskLevel: 'critical',
        position: { x: 15, y: 70 },
        issues: ['Pago Vencido', 'Sin respuesta'],
        lastContact: 'hace 12 días',
        value: 22000,
        urgency: 10
      }
    ];
  }

  

  // Mock data loader for development
  private loadMockData(): void {
    this.stats = {
      opportunitiesInPipeline: {
        nuevas: 5,
        expediente: 3,
        aprobado: 2
      },
      pendingActions: {
        clientsWithMissingDocs: 7,
        clientsWithGoalsReached: 2
      },
      activeContracts: 28,
      monthlyRevenue: {
        collected: 1250000,
        projected: 1450000
      }
    };

    this.actionableGroups = [
      {
        title: 'Documentos Vencidos',
        description: 'Clientes con documentación que requiere renovación',
        clients: [
          {
            id: '1',
            name: 'María González',
            status: 'Documentos Vencidos',
            avatarUrl: 'https://via.placeholder.com/40'
          },
          {
            id: '2',
            name: 'Carlos Méndez',
            status: 'INE Vencida',
            avatarUrl: 'https://via.placeholder.com/40'
          }
        ]
      }
    ];
  }
}
