import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (status === 'ISSUED') {
      <span class="badge-status badge-status-issued">
        <i class="bi bi-clock-history"></i> Issued
      </span>
    } @else if (status === 'RETURNED') {
      <span class="badge-status badge-status-returned">
        <i class="bi bi-check-circle-fill"></i> Returned
      </span>
    } @else if (status === 'OVERDUE') {
      <span class="badge-status badge-status-overdue">
        <i class="bi bi-exclamation-circle-fill"></i> Overdue
      </span>
    } @else if (status === 'IN_STOCK') {
      <span class="badge-status badge-status-instock">
        <i class="bi bi-check2"></i> Available
      </span>
    } @else if (status === 'LOW_STOCK') {
      <span class="badge-status badge-status-lowstock">
        <i class="bi bi-dash-circle"></i> Low Stock
      </span>
    } @else if (status === 'OUT_OF_STOCK') {
      <span class="badge-status badge-status-outstock">
        <i class="bi bi-x-circle-fill"></i> Out of Stock
      </span>
    } @else {
      <span class="badge bg-secondary">{{ status }}</span>
    }
  `
})
export class StatusBadgeComponent {
  @Input() status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | string = '';
}
