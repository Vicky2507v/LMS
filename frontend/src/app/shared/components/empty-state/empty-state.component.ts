import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-wrapper text-center py-5 px-3">
      <div class="empty-icon-circle mx-auto mb-3">
        <i [class]="icon"></i>
      </div>
      <h5 class="fw-semibold text-dark mb-2">{{ title }}</h5>
      <p class="text-secondary mx-auto mb-4" style="max-width: 420px;">{{ description }}</p>
      @if (actionLabel) {
        <button type="button" class="btn btn-primary px-4" (click)="actionClick.emit()">
          <i [class]="actionIcon + ' me-1'" *ngIf="actionIcon"></i>
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-icon-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background-color: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'bi bi-inbox';
  @Input() title: string = 'No records found';
  @Input() description: string = 'There are no items to display at this moment.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  @Output() actionClick = new EventEmitter<void>();
}
