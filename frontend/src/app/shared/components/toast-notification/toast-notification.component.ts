import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100;">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="toast show align-items-center border-0 shadow-lg mb-2 rounded-3"
          [ngClass]="'toast-' + toast.type"
          role="alert"
          aria-live="assertive"
          aria-atomic="true">
          <div class="d-flex p-2">
            <div class="toast-icon me-2 ps-2 pt-1">
              @if (toast.type === 'success') {
                <i class="bi bi-check-circle-fill text-success fs-5"></i>
              } @else if (toast.type === 'danger') {
                <i class="bi bi-exclamation-octagon-fill text-danger fs-5"></i>
              } @else if (toast.type === 'warning') {
                <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
              } @else {
                <i class="bi bi-info-circle-fill text-info fs-5"></i>
              }
            </div>
            <div class="toast-body flex-grow-1">
              @if (toast.title) {
                <strong class="d-block text-dark fw-semibold mb-1">{{ toast.title }}</strong>
              }
              <div class="text-secondary small">{{ toast.message }}</div>
            </div>
            <button
              type="button"
              class="btn-close me-2 m-auto"
              aria-label="Close"
              (click)="notificationService.remove(toast.id)">
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      max-width: 380px;
    }
    .toast {
      background: #ffffff;
      border-left: 4px solid transparent !important;
      animation: slideIn 0.2s ease-out;
    }
    .toast-success { border-left-color: var(--app-success) !important; }
    .toast-danger { border-left-color: var(--app-danger) !important; }
    .toast-warning { border-left-color: var(--app-warning) !important; }
    .toast-info { border-left-color: var(--app-info) !important; }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastNotificationComponent {
  readonly notificationService = inject(NotificationService);
}
