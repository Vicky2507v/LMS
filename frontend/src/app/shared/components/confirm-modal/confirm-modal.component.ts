import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop-custom" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom" role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId">
          <div class="p-4">
            <div class="d-flex align-items-center mb-3">
              <div class="modal-icon me-3" [ngClass]="iconBgClass">
                <i [class]="iconClass"></i>
              </div>
              <h5 class="mb-0 fw-bold text-dark" [id]="titleId">{{ title }}</h5>
            </div>

            <p class="text-secondary mb-4">{{ message }}</p>

            <div class="d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-light px-3"
                [disabled]="isLoading"
                (click)="cancel.emit()">
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="btn px-3 text-white d-flex align-items-center gap-2"
                [ngClass]="confirmBtnClass"
                [disabled]="isLoading"
                (click)="confirm.emit()">
                @if (isLoading) {
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                }
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .icon-bg-danger { background-color: #fee2e2; color: #dc2626; }
    .icon-bg-warning { background-color: #fef3c7; color: #d97706; }
    .icon-bg-primary { background-color: #e0e7ff; color: #4f46e5; }
    .icon-bg-success { background-color: #dcfce7; color: #16a34a; }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() type: 'danger' | 'warning' | 'primary' | 'success' = 'danger';
  @Input() isLoading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly titleId = 'modal-title-' + Math.random().toString(36).substring(2, 9);

  get iconBgClass(): string {
    return `icon-bg-${this.type}`;
  }

  get iconClass(): string {
    switch (this.type) {
      case 'danger': return 'bi bi-trash3';
      case 'warning': return 'bi bi-exclamation-triangle';
      case 'success': return 'bi bi-check-circle';
      default: return 'bi bi-question-circle';
    }
  }

  get confirmBtnClass(): string {
    switch (this.type) {
      case 'danger': return 'btn-danger';
      case 'warning': return 'btn-warning';
      case 'success': return 'btn-success';
      default: return 'btn-primary';
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom') && !this.isLoading) {
      this.cancel.emit();
    }
  }
}
