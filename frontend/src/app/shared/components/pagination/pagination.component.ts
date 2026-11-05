import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 pt-3 px-1">
      <div class="text-secondary small">
        Showing
        <span class="fw-semibold text-dark">{{ startRecord }}</span>
        to
        <span class="fw-semibold text-dark">{{ endRecord }}</span>
        of
        <span class="fw-semibold text-dark">{{ totalElements }}</span>
        records
      </div>

      <div class="d-flex align-items-center gap-3">
        @if (showPageSize) {
          <div class="d-flex align-items-center gap-2">
            <span class="text-secondary small">Per page:</span>
            <select
              class="form-select form-select-sm"
              style="width: 72px;"
              [value]="pageSize"
              (change)="onPageSizeChange($event)">
              @for (opt of pageSizeOptions; track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>
          </div>
        }

        <nav aria-label="Table pagination">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" [class.disabled]="currentPage === 0">
              <button
                type="button"
                class="page-link"
                (click)="setPage(currentPage - 1)"
                [disabled]="currentPage === 0"
                aria-label="Previous">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>

            @for (page of visiblePages; track page) {
              @if (page === -1) {
                <li class="page-item disabled"><span class="page-link">…</span></li>
              } @else {
                <li class="page-item" [class.active]="currentPage === page">
                  <button
                    type="button"
                    class="page-link"
                    (click)="setPage(page)">
                    {{ page + 1 }}
                  </button>
                </li>
              }
            }

            <li class="page-item" [class.disabled]="currentPage >= totalPages - 1">
              <button
                type="button"
                class="page-link"
                (click)="setPage(currentPage + 1)"
                [disabled]="currentPage >= totalPages - 1"
                aria-label="Next">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  `,
  styles: [`
    .page-link {
      color: var(--app-secondary);
      border-color: var(--app-border);
      padding: 0.35rem 0.65rem;
    }
    .page-item.active .page-link {
      background-color: var(--app-accent);
      border-color: var(--app-accent);
      color: #ffffff;
    }
    .page-link:hover:not(.disabled) {
      background-color: var(--app-border-light);
      color: var(--app-accent);
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage: number = 0; // 0-based
  @Input() totalPages: number = 1;
  @Input() totalElements: number = 0;
  @Input() pageSize: number = 5;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() showPageSize: boolean = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  get startRecord(): number {
    if (this.totalElements === 0) return 0;
    return this.currentPage * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);
      if (current > 2) pages.push(-1);

      const start = Math.max(1, current - 1);
      const end = Math.min(total - 2, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 3) pages.push(-1);
      pages.push(total - 1);
    }

    return pages;
  }

  setPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const size = parseInt(select.value, 10);
    this.sizeChange.emit(size);
  }
}
