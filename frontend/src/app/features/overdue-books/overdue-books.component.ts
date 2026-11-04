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
  selector: 'app-overdue-books',
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
    <div class="overdue-books-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2">
            <h2 class="h4 fw-bold text-dark mb-1">Overdue Loans</h2>
            @if (overdueRecords().length > 0) {
              <span class="badge bg-danger rounded-pill px-2 py-1">
                {{ overdueRecords().length }} Critical
              </span>
            }
          </div>
          <p class="text-secondary small mb-0">Books currently in circulation past their return deadline. Immediate follow-up required.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            [disabled]="isLoading()"
            (click)="loadOverdue()">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
          <a routerLink="/return-book" class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm">
            <i class="bi bi-arrow-down-left"></i>
            <span>All Active Loans</span>
          </a>
        </div>
      </div>

      <!-- Critical Notice Banner if Overdue Records Exist -->
      @if (!isLoading() && overdueRecords().length > 0) {
        <div class="alert alert-danger d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 p-3 border-danger-subtle shadow-sm rounded-3">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill fs-4 text-danger"></i>
            <div>
              <strong class="text-danger">Action Required:</strong>
              <span class="ms-1 text-dark">There are {{ overdueRecords().length }} books currently overdue. Reach out to borrowers using the email or phone buttons below.</span>
            </div>
          </div>
          <span class="badge bg-danger text-white">Delinquent Inventory</span>
        </div>
      }

      <!-- Search Filter Bar -->
      <div class="card-saas p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-6">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-secondary"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search overdue records by book title or member name..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilter()">
              @if (searchQuery) {
                <button class="btn btn-outline-secondary" type="button" (click)="searchQuery = ''; applyFilter()">
                  <i class="bi bi-x"></i>
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content / Table -->
      @if (isLoading()) {
        <app-loading-spinner message="Checking overdue records from backend..."></app-loading-spinner>
      } @else if (filteredRecords().length === 0) {
        <div class="card-saas">
          <app-empty-state
            icon="bi bi-shield-check"
            title="All loans are on schedule!"
            description="There are currently zero overdue books in the library. All active borrowers are within their 14-day borrowing window."
            actionLabel="View All Active Loans"
            actionIcon="bi bi-arrow-down-left"
            (actionClick)="navigateTo('/return-book')">
          </app-empty-state>
        </div>
      } @else {
        <div class="card-saas">
          <div class="table-responsive">
            <table class="table table-saas align-middle">
              <thead>
                <tr>
                  <th style="width: 80px;">ID</th>
                  <th>Book Details</th>
                  <th>Member Information</th>
                  <th>Loan Period</th>
                  <th style="width: 150px;">Days Overdue</th>
                  <th class="text-end" style="width: 180px;">Immediate Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (rec of paginatedRecords(); track rec.id) {
                  <tr>
                    <td>
                      <span class="badge bg-light text-dark border fw-mono">#{{ rec.id }}</span>
                    </td>
                    <td>
                      <div class="fw-semibold text-dark">{{ rec.book.title }}</div>
                      <div class="text-secondary small">
                        {{ rec.book.author }} &bull; <span class="badge bg-light text-secondary border">{{ rec.book.category }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="fw-semibold text-dark">{{ rec.member.name }}</div>
                      <div class="d-flex align-items-center gap-2 small mt-1">
                        <a [href]="'mailto:' + rec.member.email" class="text-primary text-decoration-none" title="Email Borrower">
                          <i class="bi bi-envelope-fill me-1"></i>{{ rec.member.email }}
                        </a>
                        <span class="text-muted">&bull;</span>
                        <a [href]="'tel:' + rec.member.phone" class="text-secondary text-decoration-none" title="Call Borrower">
                          <i class="bi bi-telephone-fill me-1"></i>{{ rec.member.phone }}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div class="small">
                        <span class="text-secondary">Issued:</span> <span class="fw-medium text-dark">{{ rec.issueDate }}</span>
                      </div>
                      <div class="small">
                        <span class="text-secondary">Due:</span> <span class="fw-bold text-danger">{{ rec.dueDate }}</span>
                      </div>
                    </td>
                    <td>
                      @let days = (rec.dueDate | daysOverdue);
                      <div class="d-flex align-items-center gap-2">
                        <span
                          class="badge px-2 py-1 text-white"
                          [ngClass]="days > 7 ? 'bg-danger' : 'bg-warning text-dark'">
                          <i class="bi bi-exclamation-diamond-fill me-1"></i>
                          {{ days }} {{ days === 1 ? 'Day' : 'Days' }} Late
                        </span>
                      </div>
                    </td>
                    <td class="text-end">
                      <div class="btn-group btn-group-sm">
                        <a
                          [href]="getReminderMailto(rec)"
                          class="btn btn-outline-primary"
                          title="Send Email Reminder">
                          <i class="bi bi-send me-1"></i> Remind
                        </a>
                        <button
                          type="button"
                          class="btn btn-outline-success"
                          title="Mark Returned"
                          (click)="confirmReturn(rec)">
                          <i class="bi bi-arrow-down-left me-1"></i> Return
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
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
        title="Confirm Overdue Return"
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
export class OverdueBooksComponent implements OnInit {
  private readonly borrowService = inject(BorrowRecordService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal<boolean>(true);
  readonly overdueRecords = signal<BorrowRecord[]>([]);
  readonly filteredRecords = signal<BorrowRecord[]>([]);

  searchQuery: string = '';

  // Pagination
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);

  // Return modal
  readonly isReturnModalOpen = signal<boolean>(false);
  readonly isReturningModal = signal<boolean>(false);
  private recordToReturn: BorrowRecord | null = null;
  returnModalMessage: string = '';

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredRecords().length / this.pageSize()) || 1;
  });

  readonly paginatedRecords = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.filteredRecords().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadOverdue();
  }

  loadOverdue(): void {
    this.isLoading.set(true);
    this.borrowService.getOverdueBooks().subscribe({
      next: records => {
        this.overdueRecords.set(records || []);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  applyFilter(): void {
    let list = [...this.overdueRecords()];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(r =>
        r.book.title.toLowerCase().includes(q) ||
        r.member.name.toLowerCase().includes(q) ||
        r.member.email.toLowerCase().includes(q)
      );
    }
    this.filteredRecords.set(list);
    this.currentPage.set(0);
  }

  getReminderMailto(rec: BorrowRecord): string {
    const subject = encodeURIComponent(`Library Overdue Notice - ${rec.book.title}`);
    const body = encodeURIComponent(
      `Dear ${rec.member.name},\n\nYour borrowed book "${rec.book.title}" was due on ${rec.dueDate}.\nPlease return the book to the library as soon as possible.\n\nThank you,\nLibrary Management`
    );
    return `mailto:${rec.member.email}?subject=${subject}&body=${body}`;
  }

  confirmReturn(record: BorrowRecord): void {
    this.recordToReturn = record;
    this.returnModalMessage = `Return overdue book "${record.book.title}" borrowed by ${record.member.name}? The backend will close this loan and restore book copies.`;
    this.isReturnModalOpen.set(true);
  }

  executeReturn(): void {
    if (!this.recordToReturn || !this.recordToReturn.id) return;

    this.isReturningModal.set(true);
    this.borrowService.returnBook(this.recordToReturn.id).subscribe({
      next: msg => {
        this.notificationService.success(msg || 'Overdue book returned successfully!');
        this.isReturningModal.set(false);
        this.isReturnModalOpen.set(false);
        this.recordToReturn = null;
        this.loadOverdue();
      },
      error: () => {
        this.isReturningModal.set(false);
      }
    });
  }

  navigateTo(path: string): void {
    window.location.href = path;
  }
}
