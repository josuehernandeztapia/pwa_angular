/**
 * 🎨 Premium Icon Component - Conductores PWA
 * Quirúrgico icon system with micro-interactions
 * TESTING: Force recompilation to check for errors
 */

import { Component, Input, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PREMIUM_ICONS_SYSTEM, PremiumIcon, IconState } from '../../../design-system/icons/premium-icons-system';

export type IconName =
  | 'cotizador'
  | 'simulador'
  | 'tanda'
  | 'proteccion'
  | 'postventa'
  | 'entregas'
  | 'gnv'
  | 'avi';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type IconVariant = 'default' | 'hover' | 'active' | 'error';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="icon-container"
      [class]="getContainerClasses()"
      [attr.data-icon]="iconName"
      [attr.data-variant]="variant"
      [attr.data-size]="size"
      [attr.aria-label]="ariaLabel || iconConfig?.concept"
      [style.width.px]="getIconSize()"
      [style.height.px]="getIconSize()"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (click)="onClick()">

      <svg
        [attr.width]="getIconSize()"
        [attr.height]="getIconSize()"
        [attr.viewBox]="'0 0 256 256'"
        [attr.fill]="getCurrentIconState()?.style === 'filled' ? 'currentColor' : 'none'"
        [style.stroke]="getCurrentStroke()"
        [style.strokeWidth]="strokeWidth"
        [style.animation]="getCurrentAnimation()"
        [style.animationDuration]="getCurrentDuration()"
        class="ui-svg-icon">

        <ng-container [ngSwitch]="iconName">
          <g *ngSwitchCase="'cotizador'">
            <rect x="32" y="48" width="192" height="160" rx="8" stroke="currentColor" stroke-width="16" fill="none"/>
            <path d="m80,112h96m-96,32h96M80,80h96" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <g *ngSwitchCase="'simulador'">
            <circle cx="128" cy="128" r="96" stroke="currentColor" stroke-width="16" fill="none"/>
            <polyline points="128,128 128,80" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="128,128 168,168" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <g *ngSwitchCase="'tanda'">
            <circle cx="88" cy="108" r="52" stroke="currentColor" stroke-width="16" fill="none"/>
            <circle cx="168" cy="108" r="52" stroke="currentColor" stroke-width="16" fill="none"/>
            <path d="m16,197.4a88,88,0,0,1,144,0" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="m96,197.4a88,88,0,0,1,144,0" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <g *ngSwitchCase="'proteccion'">
            <path d="M208,40,128,88,48,40a8,8,0,0,0-8,8V108c0,84,52.4,119.3,75.6,130a8,8,0,0,0,8.8,0C148.6,227.3,216,192,216,108V48A8,8,0,0,0,208,40Z" stroke="currentColor" stroke-width="16" fill="none"/>
            <polyline points="88,136 112,160 168,104" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <g *ngSwitchCase="'postventa'">
            <path d="M224,64V192a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V64A8,8,0,0,1,40,56H88V48a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16v8h48A8,8,0,0,1,224,64Z" stroke="currentColor" stroke-width="16" fill="none"/>
            <path d="M168,56V72a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8V56" stroke="currentColor" stroke-width="16" fill="none"/>
            <line x1="104" y1="48" x2="152" y2="48" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <g *ngSwitchCase="'entregas'">
            <rect x="32" y="144" width="144" height="64" rx="8" stroke="currentColor" stroke-width="16" fill="none"/>
            <path d="M176,144h24a8,8,0,0,1,8,8v32a8,8,0,0,1-8,8" stroke="currentColor" stroke-width="16" fill="none"/>
            <circle cx="192" cy="192" r="24" stroke="currentColor" stroke-width="16" fill="none"/>
            <circle cx="80" cy="192" r="24" stroke="currentColor" stroke-width="16" fill="none"/>
            <line x1="32" y1="144" x2="32" y2="72" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="224,96 176,96 176,144" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <g *ngSwitchCase="'gnv'">
            <rect x="72" y="80" width="80" height="128" rx="8" stroke="currentColor" stroke-width="16" fill="none"/>
            <path d="M152,120h16a8,8,0,0,1,8,8v24a8,8,0,0,0,8,8h8a8,8,0,0,0,8-8V96a16,16,0,0,0-16-16H168" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M72,208H56a16,16,0,0,1-16-16V64A16,16,0,0,1,56,48H184a16,16,0,0,1,16,16" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="184" cy="88" r="8" fill="currentColor"/>
          </g>
          <g *ngSwitchCase="'avi'">
            <rect x="96" y="40" width="64" height="104" rx="32" stroke="currentColor" stroke-width="16" fill="none"/>
            <path d="M80,128v16a48,48,0,0,0,96,0V128" stroke="currentColor" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="128" y1="192" x2="128" y2="224" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="104" y1="224" x2="152" y2="224" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <g *ngSwitchDefault>
            <rect x="64" y="64" width="128" height="128" rx="8" stroke="currentColor" stroke-width="16" fill="none"/>
            <line x1="104" y1="104" x2="152" y2="152" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="152" y1="104" x2="104" y2="152" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </ng-container>
      </svg>

      <span
        *ngIf="showLabel"
        class="icon-label"
        [style.fontSize.px]="getLabelSize()">
        {{ label || iconConfig?.concept }}
      </span>

      <div
        *ngIf="showStatus && status"
        class="status-indicator"
        [class.status-ok]="status === 'ok'"
        [class.status-warning]="status === 'warning'"
        [class.status-error]="status === 'error'">
      </div>

      <div
        *ngIf="showBadge && badgeCount && badgeCount > 0"
        class="notification-badge"
        [attr.data-count]="badgeCount > 99 ? '99+' : badgeCount">
        {{ badgeCount > 99 ? '99+' : badgeCount }}
      </div>
    </div>
  `,
  styles: [`
    .icon-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 4px;
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease-in-out);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .ui-svg-icon {
      display: block;
      transition: all var(--transition-fast, 150ms ease-in-out);
      line-height: 1;
      color: currentColor;
    }

    .ui-svg-icon * { vector-effect: non-scaling-stroke; }

    .icon-size--xs { --icon-base-size: 16px; }
    .icon-size--sm { --icon-base-size: 20px; }
    .icon-size--md { --icon-base-size: 24px; }
    .icon-size--lg { --icon-base-size: 32px; }
    .icon-size--xl { --icon-base-size: 48px; }
    .icon-size--xxl { --icon-base-size: 64px; }

    .icon-label { font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; text-align: center; white-space: nowrap; transition: color var(--transition-fast, 150ms ease-in-out); }

    .status-indicator {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1px solid var(--bg-dark);
    }

    .status-indicator.status-ok { background: var(--success); box-shadow: 0 0 4px rgba(16, 185, 129, 0.4); }
    .status-indicator.status-warning { background: var(--warning); box-shadow: 0 0 4px rgba(245, 158, 11, 0.4); }
    .status-indicator.status-error { background: var(--error); box-shadow: 0 0 4px rgba(239, 68, 68, 0.4); }

    .icon-container:hover { transform: translateY(-1px); }
    .icon-container:active { transform: translateY(0); }
    .icon-container.disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

    @media (prefers-reduced-motion: reduce) {
      .icon-container,
      .icon-container i,
      .icon-label,
      .status-indicator,
      .notification-badge {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      .icon-container:hover { transform: none; }
    }
  `]
})
export class IconComponent implements OnInit {
  @Input() iconName: IconName = 'cotizador';
  @Input() size: IconSize = 'md';
  @Input() variant: IconVariant = 'default';
  @Input() label?: string;
  @Input() showLabel: boolean = false;
  @Input() ariaLabel?: string;
  @Input() disabled: boolean = false;
  @Input() strokeWidth: string = '2.5px';

  @Input() showStatus: boolean = false;
  @Input() status?: 'ok' | 'warning' | 'error';
  @Input() showBadge: boolean = false;
  @Input() badgeCount?: number;

  @Input() enableHover: boolean = true;
  @Input() enableClick: boolean = true;

  iconConfig?: PremiumIcon;
  currentState: IconVariant = 'default';

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.iconConfig = PREMIUM_ICONS_SYSTEM.find(icon => icon.name === this.iconName);
    this.strokeWidth = '2.5px';
  }

  getContainerClasses(): string {
    const classes = [
      'icon-container',
      `icon-size--${this.size}`,
      `icon-hover-${this.iconName}`,
      `variant--${this.variant}`
    ];

    if (this.disabled) classes.push('disabled');
    if (this.variant === 'error' || this.status === 'error') classes.push('error');

    return classes.join(' ');
  }

  getIconSize(): number {
    const sizeMap = { xs: 16, sm: 20, md: 24, lg: 32, xl: 48, xxl: 64 } as const;
    return sizeMap[this.size];
  }

  getLabelSize(): number {
    const labelSizeMap = { xs: 10, sm: 11, md: 12, lg: 14, xl: 16, xxl: 18 } as const;
    return labelSizeMap[this.size];
  }

  getCurrentIconState(): IconState | undefined {
    if (!this.iconConfig) return undefined;
    const states = this.iconConfig.states;
    switch (this.currentState) {
      case 'hover': return states.hover || states.default;
      case 'active': return states.active || states.default;
      case 'error': return states.error || states.default;
      default: return states.default;
    }
  }

  getCurrentStroke(): string {
    const state = this.getCurrentIconState();
    return state?.stroke || 'currentColor';
  }

  getCurrentAnimation(): string { return 'none'; }
  getCurrentDuration(): string { return '0s'; }

  onMouseEnter(): void { if (!this.enableHover || this.disabled) return; this.currentState = 'hover'; }
  onMouseLeave(): void { if (!this.enableHover || this.disabled) return; this.currentState = this.variant; }
  onClick(): void {
    if (!this.enableClick || this.disabled) return;
    this.currentState = 'active';
    setTimeout(() => { this.currentState = this.variant; }, 300);
    this.elementRef.nativeElement.dispatchEvent(new CustomEvent('iconClick', { detail: { iconName: this.iconName, variant: this.variant }, bubbles: true }));
  }

  public setVariant(variant: IconVariant): void { this.variant = variant; this.currentState = variant; }
  public triggerAnimation(): void { /* no-op in minimal */ }
}