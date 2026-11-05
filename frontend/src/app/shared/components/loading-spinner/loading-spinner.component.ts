import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center p-5 text-center" [style.min-height.px]="minHeight">
      <div class="spinner-border text-primary mb-3" style="width: 2.75rem; height: 2.75rem;" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-secondary mb-0 fw-medium">{{ message }}</p>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message: string = 'Loading data...';
  @Input() minHeight: number = 220;
}
