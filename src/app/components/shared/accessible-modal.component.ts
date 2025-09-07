import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

@Component({
  selector: 'app-accessible-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="backdrop"
      *ngIf="open"
      (click)="backdropClosable ? onClose.emit() : null"
    ></div>

    <div
      class="modal"
      *ngIf="open"
      role="dialog"
      [attr.aria-modal]="'true'"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="descriptionId"
      (keydown.escape)="onClose.emit()"
    >
      <div #focusRegion class="modal-content" tabindex="-1">
        <header class="modal-header">
          <h2 [id]="titleId" class="modal-title">{{ title }}</h2>
          <button class="close-btn" type="button" (click)="onClose.emit()" aria-label="Cerrar">×</button>
        </header>
        <section class="modal-body" [id]="descriptionId">
          <ng-content></ng-content>
        </section>
        <footer class="modal-footer">
          <ng-content select="[modal-actions]"></ng-content>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 1000;
    }
    .modal {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      z-index: 1001;
    }
    .modal-content {
      width: min(640px, 92vw);
      max-height: 86vh;
      overflow: auto;
      background: #111827;
      color: #e5e7eb;
      border: 1px solid #374151;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .modal-header, .modal-footer {
      padding: 16px;
      border-bottom: 1px solid #1f2937;
    }
    .modal-footer { border-top: 1px solid #1f2937; border-bottom: none; }
    .modal-body { padding: 16px; }
    .modal-title { margin: 0; font-size: 18px; }
    .close-btn {
      margin-left: auto;
      background: transparent;
      border: none;
      color: #9ca3af;
      font-size: 20px;
      cursor: pointer;
    }
    .close-btn:focus { outline: 2px solid #10b981; outline-offset: 2px; }
  `]
})
export class AccessibleModalComponent implements AfterViewInit, OnDestroy {
  @Input() open = false;
  @Input() title = '';
  @Input() titleId = 'modal-title';
  @Input() descriptionId = 'modal-description';
  @Input() backdropClosable = true;
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('focusRegion') focusRegion!: ElementRef<HTMLElement>;
  private previousActiveElement: Element | null = null;
  private focusTrap?: FocusTrap;

  constructor(private focusTrapFactory: FocusTrapFactory, private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (this.open && this.focusRegion) {
      this.activateFocusTrap();
    }
  }

  ngOnDestroy(): void {
    this.deactivateFocusTrap();
  }

  private activateFocusTrap(): void {
    this.previousActiveElement = document.activeElement;
    this.focusTrap = this.focusTrapFactory.create(this.focusRegion.nativeElement);
    // Move focus inside the modal
    setTimeout(() => {
      this.focusTrap?.focusInitialElementWhenReady();
      this.focusRegion.nativeElement.focus();
    });
  }

  private deactivateFocusTrap(): void {
    this.focusTrap?.destroy();
    if (this.previousActiveElement instanceof HTMLElement) {
      this.previousActiveElement.focus();
    }
  }
}

