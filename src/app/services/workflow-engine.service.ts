import { Injectable, inject } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { WorkflowAction, WorkflowAutomation } from '../models/configuration.types';
import { ToastService } from './toast.service';

type Operator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';

@Injectable({
  providedIn: 'root'
})
export class WorkflowEngineService {
  private configurationService = inject(ConfigurationService);
  private toastService = inject(ToastService);

  /**
   * Generic event handler to process configured automations
   */
  handleEvent(eventName: string, context: any = {}): void {
    const workflows = this.configurationService.getWorkflowConfiguration();
    const automations = workflows.automations || [];

    const matching = automations.filter(a => a.enabled && a.trigger?.event === eventName);
    matching.forEach(automation => {
      if (!this.evaluateConditions(automation, context)) {
        return;
      }
      this.executeActions(automation.actions || [], context, automation);
    });
  }

  /**
   * Convenience wrapper to signal state changes by domain
   * Example: domain = 'protection', event emitted: 'protection_state_changed'
   */
  onStateChanged(domain: string, payload: { previousState?: string; newState: string; [key: string]: any }): void {
    const eventName = `${domain}_state_changed`;
    this.handleEvent(eventName, payload);
  }

  private evaluateConditions(automation: WorkflowAutomation, context: any): boolean {
    const conditions = automation.trigger?.conditions as Array<{
      field: string;
      operator: Operator;
      value: any;
    }> | undefined;

    if (!conditions || conditions.length === 0) return true;

    return conditions.every(cond => {
      const left = this.getValueFromContext(context, cond.field);
      switch (cond.operator) {
        case 'equals':
          return left === cond.value;
        case 'not_equals':
          return left !== cond.value;
        case 'greater_than':
          return Number(left) > Number(cond.value);
        case 'less_than':
          return Number(left) < Number(cond.value);
        case 'contains':
          return Array.isArray(left) ? left.includes(cond.value) : String(left).includes(String(cond.value));
        case 'in_range':
          return Array.isArray(cond.value) && cond.value.length === 2
            ? Number(left) >= Number(cond.value[0]) && Number(left) <= Number(cond.value[1])
            : false;
        default:
          return true;
      }
    });
  }

  private getValueFromContext(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  }

  private executeActions(actions: WorkflowAction[], context: any, automation: WorkflowAutomation): void {
    actions.forEach(action => {
      switch (action.type) {
        case 'update_status':
          this.handleUpdateStatus(action.parameters, context);
          break;
        case 'notify':
          this.handleNotify(action.parameters, context, automation);
          break;
        case 'assign':
        case 'create_task':
        case 'send_email':
        case 'api_call':
          // Stubs for future expansion. Log for observability.
          console.info(`[WorkflowEngine] Action '${action.type}' executed`, { action, context, automation });
          break;
        default:
          console.warn('[WorkflowEngine] Unknown action type', action);
      }
    });
  }

  private handleUpdateStatus(parameters: { status?: string; fieldPath?: string }, context: any): void {
    // If a callback exists in context, prefer it
    if (typeof context.setStatus === 'function' && parameters?.status) {
      context.setStatus(parameters.status);
      return;
    }

    // Generic field update if fieldPath provided, e.g., 'plan.state'
    if (parameters?.fieldPath) {
      const path = parameters.fieldPath.split('.');
      let target = context;
      for (let i = 0; i < path.length - 1; i++) {
        if (target[path[i]] === undefined) return;
        target = target[path[i]];
      }
      const last = path[path.length - 1];
      target[last] = parameters.status ?? target[last];
    }
  }

  private handleNotify(parameters: any, context: any, automation: WorkflowAutomation): void {
    const title = parameters?.title || automation.name || 'Notificación del sistema';
    const body = parameters?.body || `Evento: ${automation.trigger?.event}`;

    // Prefer Toast for in-app visibility; push can be integrated later
    this.toastService.info(`${title}: ${body}`);
  }
}

