import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BorrowRecordService } from '../../core/services/borrow-record.service';
import { NotificationService } from '../../core/services/notification.service';
import { BorrowRecord } from '../../core/models/borrow-record.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DaysOverduePipe } from '../../shared/pipes/days-overdue.pipe';

@Component({
  selector: 'app-return-book',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmModalComponent,
    PaginationComponent,
    DaysOverduePipe
  ],
  template: `
    <div class="return-book-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Return Issued Books</h2>
          <p class="text-secondary small mb-0">Active loans currently in circulation. Mark books as returned to update inventory.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            [disabled]="isLoading()"
            (click)="loadIssuedRecords()">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
          <a routerLink="/issue-book" class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm">
            <i class="bi bi-arrow-up-right-circle"></i>
            <span>Issue Another Book</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <div class="stat-card">
            <div>
              <div class="text-secondary small fw-medium mb-1">Active Loans</div>
              <div class="h4 fw-bold text-dark mb-0">{{ allIssuedRecords().length }}</div>
            </div>
            <div class="stat-icon" style="background-color: #dbeafe; color: #1d4ed8;">
              <i class="bi bi-journal-bookmark-fill"></i>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-card">
            <div>
              <div class="text-secondary small fw-medium mb-1">Overdue Loans</div>
              <div class="h4 fw-bold text-danger mb-0">{{ overdueCount() }}</div>
            </div>
            <div class="stat-icon" style="background-color: #fee2e2; color: #dc2626;">
              <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-card">
            <div>
              <div class="text-secondary small fw-medium mb-1">On Schedule</div>
              <div class="h4 fw-bold text-success mb-0">{{ onScheduleCount() }}</div>
            </div>
            <div class="stat-icon" style="background-color: #dcfce7; color: #15803d;">
              <i class="bi bi-check2-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="card-saas p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-5">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-secondary"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by book title or member name..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()">
              @if (searchQuery) {
                <button class="btn btn-outline-secondary" type="button" (click)="searchQuery = ''; applyFilters()">
                  <i class="bi bi-x"></i>
                </button>
              }
            </div>
          </div>

          <div class="col-12 col-md-4">
            <select
              class="form-select form-select-sm"
              [(ngModel)]="statusFilter"
              (ngModelChange)="applyFilters()">
              <option value="ALL">All Active Loans</option>
              <option value="OVERDUE">Overdue Only (Late)</option>
              <option value="NORMAL">On Schedule Only</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Main Content / Table -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading issued records from backend..."></app-loading-spinner>
      } @else if (filteredRecords().length === 0) {
        <div class="card-saas">
          <app-empty-state
            icon="bi bi-check-all"
            title="No books are currently issued"
            description="All borrowed books have either been returned or no records match your search."
            actionLabel="Issue a Book"
            actionIcon="bi bi-plus-lg"
            (actionClick)="navigateTo('/issue-book')">
          </app-empty-state>
        </div>
      } @else {
        <div class="card-saas">
          <div class="table-responsive">
            <table class="table table-saas align-middle">
              <thead>
                <tr>
                  <th style="width: 80px;">Record ID</th>
                  <th>Book Title & Author</th>
                  <th>Member Info</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Overdue Status</th>
                  <th class="text-end" style="width: 140px;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (record of paginatedRecords(); track record.id) {
                  <tr>
                    <td>
                      <span class="badge bg-light text-dark border fw-mono">#{{ record.id }}</span>
                    </td>
                    <td>
                      <div class="fw-semibold text-dark">{{ record.book.title }}</div>
                      <div class="text-secondary small">{{ record.book.author }} &bull; {{ record.book.category }}</div>
                    </td>
                    <td>
                      <div class="fw-medium text-dark">{{ record.member.name }}</div>
                      <div class="text-secondary small">{{ record.member.email }} &bull; {{ record.member.phone }}</div>
                    </td>
                    <td class="text-nowrap">{{ record.issueDate }}</td>
                    <td class="text-nowrap">
                      {{ record.dueDate }}
                    </td>
                    <td>
                      @if ((record.dueDate | daysOverdue) > 0) {
                        <span class="badge bg-danger text-white">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>
                          {{ record.dueDate | daysOverdue }} Days Late
                        </span>
                      } @else {
                        <span class="badge bg-success-subtle text-success border border-success-subtle">
                          <i class="bi bi-check-circle me-1"></i> On Schedule
                        </span>
                      }
                    </td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-success d-inline-flex align-items-center gap-1 shadow-sm"
                        [disabled]="isReturningId() === record.id"
                        (click)="confirmReturn(record)">
                        @if (isReturningId() === record.id) {
                          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        } @else {
                          <i class="bi bi-arrow-down-left"></i>
                        }
                        <span>Return Book</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div class="p-3 border-top">
            <app-pagination
              [currentPage]="currentPage()"
              [totalPages]="totalPages()"
              [totalElements]="filteredRecords().length"
              [pageSize]="pageSize()"
              (pageChange)="currentPage.set($event)"
              (sizeChange)="pageSize.set($event); currentPage.set(0)">
            </app-pagination>
          </div>
        </div>
      }

      <!-- Return Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isReturnModalOpen()"
        title="Confirm Book Return"
        [message]="returnModalMessage"
        confirmText="Confirm Return"
        type="success"
        [isLoading]="isReturningModal()"
        (confirm)="executeReturn()"
        (cancel)="isReturnModalOpen.set(false)">
      </app-confirm-modal>
    </div>
  `
})
export class ReturnBookComponent implements OnInit {
  private readonly borrowService = inject(BorrowRecordService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal<boolean>(true);
  readonly allIssuedRecords = signal<BorrowRecord[]>([]);
  readonly filteredRecords = signal<BorrowRecord[]>([]);

  // Search and filter
  searchQuery: string = '';
  statusFilter: 'ALL' | 'OVERDUE' | 'NORMAL' = 'ALL';

  // Pagination
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);

  // Return action state
  readonly isReturningId = signal<number | null>(null);
  readonly isReturnModalOpen = signal<boolean>(false);
  readonly isReturningModal = signal<boolean>(false);
  private recordToReturn: BorrowRecord | null = null;
  returnModalMessage: string = '';

  readonly overdueCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allIssuedRecords().filter(r => {
      const due = new Date(r.dueDate);
      due.setHours(0, 0, 0, 0);
      return today.getTime() > due.getTime();
    }).length;
  });

  readonly onScheduleCount = computed(() => {
    return Math.max(0, this.allIssuedRecords().length - this.overdueCount());
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredRecords().length / this.pageSize()) || 1;
  });

  readonly paginatedRecords = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.filteredRecords().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadIssuedRecords();
  }

  loadIssuedRecords(): void {
    this.isLoading.set(true);
    this.borrowService.getCurrentlyIssuedBooks().subscribe({
      next: records => {
        this.allIssuedRecords.set(records || []);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let list = [...this.allIssuedRecords()];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(r =>
        r.book.title.toLowerCase().includes(q) ||
        r.member.name.toLowerCase().includes(q) ||
        r.member.email.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter === 'OVERDUE') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      list = list.filter(r => new Date(r.dueDate).getTime() < today.getTime());
    } else if (this.statusFilter === 'NORMAL') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      list = list.filter(r => new Date(r.dueDate).getTime() >= today.getTime());
    }

    this.filteredRecords.set(list);
    this.currentPage.set(0);
  }

  confirmReturn(record: BorrowRecord): void {
    this.recordToReturn = record;
    this.returnModalMessage = `Are you sure you want to return "${record.book.title}" borrowed by ${record.member.name} (Record #${record.id})? The backend will update inventory and mark this loan as RETURNED.`;
    this.isReturnModalOpen.set(true);
  }

  executeReturn(): void {
    if (!this.recordToReturn || !this.recordToReturn.id) return;

    const id = this.recordToReturn.id;
    this.isReturningModal.set(true);
    this.isReturningId.set(id);

    this.borrowService.returnBook(id).subscribe({
      next: msg => {
        this.notificationService.success(msg || 'Book returned successfully!');
        this.isReturningModal.set(false);
        this.isReturnModalOpen.set(false);
        this.isReturningId.set(null);
        this.recordToReturn = null;
        this.loadIssuedRecords();
      },
      error: () => {
        this.isReturningModal.set(false);
        this.isReturningId.set(null);
      }
    });
  }

  navigateTo(path: string): void {
    window.location.href = path;
  }
}
