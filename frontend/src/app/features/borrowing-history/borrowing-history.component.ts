import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BorrowRecordService } from '../../core/services/borrow-record.service';
import { NotificationService } from '../../core/services/notification.service';
import { BorrowRecord } from '../../core/models/borrow-record.model';
import { SpringPage } from '../../core/models/page.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DaysOverduePipe } from '../../shared/pipes/days-overdue.pipe';

@Component({
  selector: 'app-borrowing-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    PaginationComponent,
    DaysOverduePipe
  ],
  template: `
    <div class="borrowing-history-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Borrowing History & Logs</h2>
          <p class="text-secondary small mb-0">Server-paginated audit trail of all library circulation records.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            [disabled]="isLoading()"
            (click)="reloadCurrentView()">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
          <a routerLink="/issue-book" class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm">
            <i class="bi bi-plus-lg"></i>
            <span>Issue Book</span>
          </a>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="card-saas p-3 mb-4">
        <!-- Status Tabs -->
        <ul class="nav nav-pills mb-3 border-bottom pb-2">
          <li class="nav-item">
            <button
              class="nav-link btn-sm py-1 px-3"
              [class.active]="activeTab === 'PAGINATED_ALL'"
              (click)="switchTab('PAGINATED_ALL')">
              <i class="bi bi-list-ul me-1"></i> All Records (Server Paginated)
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link btn-sm py-1 px-3"
              [class.active]="activeTab === 'ISSUED'"
              (click)="switchTab('ISSUED')">
              <i class="bi bi-clock me-1"></i> Currently Issued
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link btn-sm py-1 px-3"
              [class.active]="activeTab === 'RETURNED'"
              (click)="switchTab('RETURNED')">
              <i class="bi bi-check2-all me-1"></i> Returned
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link btn-sm py-1 px-3 text-danger"
              [class.active]="activeTab === 'OVERDUE'"
              (click)="switchTab('OVERDUE')">
              <i class="bi bi-exclamation-triangle me-1"></i> Overdue
            </button>
          </li>
        </ul>

        <!-- Specific ID Search Inputs -->
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light text-secondary">Member ID:</span>
              <input
                type="number"
                min="1"
                class="form-control"
                placeholder="Lookup by Member ID..."
                [(ngModel)]="searchMemberId"
                (keyup.enter)="searchByMemberId()">
              <button
                class="btn btn-outline-primary"
                type="button"
                [disabled]="!searchMemberId"
                (click)="searchByMemberId()">
                Search
              </button>
              @if (isSpecificSearch) {
                <button class="btn btn-outline-secondary" type="button" (click)="resetSearch()">
                  <i class="bi bi-x"></i>
                </button>
              }
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light text-secondary">Book ID:</span>
              <input
                type="number"
                min="1"
                class="form-control"
                placeholder="Lookup by Book ID..."
                [(ngModel)]="searchBookId"
                (keyup.enter)="searchByBookId()">
              <button
                class="btn btn-outline-primary"
                type="button"
                [disabled]="!searchBookId"
                (click)="searchByBookId()">
                Search
              </button>
              @if (isSpecificSearch) {
                <button class="btn btn-outline-secondary" type="button" (click)="resetSearch()">
                  <i class="bi bi-x"></i>
                </button>
              }
            </div>
          </div>

          @if (activeTab === 'PAGINATED_ALL' && !isSpecificSearch) {
            <!-- Sorting Controls -->
            <div class="col-12 col-md-4">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-light text-secondary">Sort:</span>
                <select class="form-select" [(ngModel)]="sortBy" (ngModelChange)="loadPaginatedHistory()">
                  <option value="issueDate">Issue Date</option>
                  <option value="dueDate">Due Date</option>
                  <option value="id">Record ID</option>
                  <option value="status">Status</option>
                </select>
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  title="Toggle Direction"
                  (click)="toggleDirection()">
                  <i class="bi" [class.bi-sort-down]="direction === 'desc'" [class.bi-sort-up]="direction === 'asc'"></i>
                  {{ direction | uppercase }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Main Content / Table -->
      @if (isLoading()) {
        <app-loading-spinner message="Fetching circulation history..."></app-loading-spinner>
      } @else if (displayRecords().length === 0) {
        <div class="card-saas">
          <app-empty-state
            icon="bi bi-clock-history"
            title="No borrowing records found"
            description="No loan records match your current tab or filter parameters."
            actionLabel="Reset to All Records"
            actionIcon="bi bi-arrow-repeat"
            (actionClick)="resetToAll()">
          </app-empty-state>
        </div>
      } @else {
        <div class="card-saas">
          <div class="table-responsive">
            <table class="table table-saas align-middle">
              <thead>
                <tr>
                  <th style="width: 80px;">ID</th>
                  <th>Member Info</th>
                  <th>Book Title & Details</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Returned Date</th>
                  <th>Status</th>
                  <th class="text-end" style="width: 130px;">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (rec of displayRecords(); track rec.id) {
                  <tr>
                    <td>
                      <span class="badge bg-light text-dark border fw-mono">#{{ rec.id }}</span>
                    </td>
                    <td>
                      <div class="fw-semibold text-dark">{{ rec.member.name }}</div>
                      <div class="text-secondary small">
                        ID: {{ rec.member.id }} &bull; {{ rec.member.email }}
                      </div>
                    </td>
                    <td>
                      <div class="fw-semibold text-dark">{{ rec.book.title }}</div>
                      <div class="text-secondary small">
                        ID: {{ rec.book.id }} &bull; {{ rec.book.author }} ({{ rec.book.category }})
                      </div>
                    </td>
                    <td class="text-nowrap">{{ rec.issueDate }}</td>
                    <td class="text-nowrap">
                      {{ rec.dueDate }}
                      @if (rec.status === 'ISSUED' && (rec.dueDate | daysOverdue) > 0) {
                        <span class="badge bg-danger-subtle text-danger ms-1">
                          {{ rec.dueDate | daysOverdue }}d late
                        </span>
                      }
                    </td>
                    <td class="text-nowrap">
                      @if (rec.returnedDate) {
                        <span class="text-success">{{ rec.returnedDate }}</span>
                      } @else {
                        <span class="text-muted small">&mdash;</span>
                      }
                    </td>
                    <td>
                      <app-status-badge [status]="rec.status === 'ISSUED' && (rec.dueDate | daysOverdue) > 0 ? 'OVERDUE' : rec.status"></app-status-badge>
                    </td>
                    <td class="text-end">
                      @if (rec.status === 'ISSUED') {
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-success"
                          [disabled]="returningId() === rec.id"
                          (click)="confirmReturn(rec)">
                          <i class="bi bi-arrow-down-left me-1"></i> Return
                        </button>
                      } @else {
                        <span class="badge bg-light text-muted border">Completed</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar (Only when viewing server-paginated mode) -->
          @if (activeTab === 'PAGINATED_ALL' && !isSpecificSearch) {
            <div class="p-3 border-top">
              <app-pagination
                [currentPage]="pageNumber()"
                [totalPages]="totalPages()"
                [totalElements]="totalElements()"
                [pageSize]="pageSize()"
                (pageChange)="onPageChange($event)"
                (sizeChange)="onPageSizeChange($event)">
              </app-pagination>
            </div>
          }
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
export class BorrowingHistoryComponent implements OnInit {
  private readonly borrowService = inject(BorrowRecordService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal<boolean>(true);
  readonly displayRecords = signal<BorrowRecord[]>([]);

  // Server-side pagination parameters
  readonly pageNumber = signal<number>(0);
  readonly pageSize = signal<number>(5);
  readonly totalPages = signal<number>(1);
  readonly totalElements = signal<number>(0);

  sortBy: string = 'issueDate';
  direction: 'desc' | 'asc' = 'desc';

  // Active tab
  activeTab: 'PAGINATED_ALL' | 'ISSUED' | 'RETURNED' | 'OVERDUE' = 'PAGINATED_ALL';

  // Search by ID
  searchMemberId: number | null = null;
  searchBookId: number | null = null;
  isSpecificSearch: boolean = false;

  // Return modal state
  readonly isReturnModalOpen = signal<boolean>(false);
  readonly isReturningModal = signal<boolean>(false);
  readonly returningId = signal<number | null>(null);
  private recordToReturn: BorrowRecord | null = null;
  returnModalMessage: string = '';

  ngOnInit(): void {
    this.loadPaginatedHistory();
  }

  loadPaginatedHistory(): void {
    this.isLoading.set(true);
    this.isSpecificSearch = false;

    this.borrowService.getBorrowingHistory(
      this.pageNumber(),
      this.pageSize(),
      this.sortBy,
      this.direction
    ).subscribe({
      next: (page: SpringPage<BorrowRecord>) => {
        this.displayRecords.set(page.content || []);
        this.pageNumber.set(page.number);
        this.totalPages.set(page.totalPages || 1);
        this.totalElements.set(page.totalElements || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  switchTab(tab: 'PAGINATED_ALL' | 'ISSUED' | 'RETURNED' | 'OVERDUE'): void {
    this.activeTab = tab;
    this.isSpecificSearch = false;
    this.searchMemberId = null;
    this.searchBookId = null;

    if (tab === 'PAGINATED_ALL') {
      this.loadPaginatedHistory();
    } else if (tab === 'ISSUED') {
      this.loadCurrentlyIssued();
    } else if (tab === 'RETURNED') {
      this.loadCurrentlyReturned();
    } else if (tab === 'OVERDUE') {
      this.loadOverdueBooks();
    }
  }

  private loadCurrentlyIssued(): void {
    this.isLoading.set(true);
    this.borrowService.getCurrentlyIssuedBooks().subscribe({
      next: records => {
        this.displayRecords.set(records || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private loadCurrentlyReturned(): void {
    this.isLoading.set(true);
    this.borrowService.getCurrentlyReturnedBooks().subscribe({
      next: records => {
        this.displayRecords.set(records || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private loadOverdueBooks(): void {
    this.isLoading.set(true);
    this.borrowService.getOverdueBooks().subscribe({
      next: records => {
        this.displayRecords.set(records || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  searchByMemberId(): void {
    if (!this.searchMemberId) return;

    this.isLoading.set(true);
    this.isSpecificSearch = true;
    this.borrowService.getBorrowRecordsByMember(this.searchMemberId).subscribe({
      next: records => {
        this.displayRecords.set(records || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  searchByBookId(): void {
    if (!this.searchBookId) return;

    this.isLoading.set(true);
    this.isSpecificSearch = true;
    this.borrowService.getBorrowRecordsByBook(this.searchBookId).subscribe({
      next: records => {
        this.displayRecords.set(records || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  resetSearch(): void {
    this.searchMemberId = null;
    this.searchBookId = null;
    this.isSpecificSearch = false;
    this.reloadCurrentView();
  }

  resetToAll(): void {
    this.searchMemberId = null;
    this.searchBookId = null;
    this.switchTab('PAGINATED_ALL');
  }

  toggleDirection(): void {
    this.direction = this.direction === 'desc' ? 'asc' : 'desc';
    this.loadPaginatedHistory();
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadPaginatedHistory();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageNumber.set(0);
    this.loadPaginatedHistory();
  }

  reloadCurrentView(): void {
    if (this.isSpecificSearch) {
      if (this.searchMemberId) this.searchByMemberId();
      else if (this.searchBookId) this.searchByBookId();
    } else {
      this.switchTab(this.activeTab);
    }
  }

  confirmReturn(record: BorrowRecord): void {
    this.recordToReturn = record;
    this.returnModalMessage = `Return "${record.book.title}" borrowed by ${record.member.name} (Record #${record.id})?`;
    this.isReturnModalOpen.set(true);
  }

  executeReturn(): void {
    if (!this.recordToReturn || !this.recordToReturn.id) return;

    const id = this.recordToReturn.id;
    this.isReturningModal.set(true);
    this.returningId.set(id);

    this.borrowService.returnBook(id).subscribe({
      next: msg => {
        this.notificationService.success(msg || 'Book returned successfully!');
        this.isReturningModal.set(false);
        this.isReturnModalOpen.set(false);
        this.returningId.set(null);
        this.recordToReturn = null;
        this.reloadCurrentView();
      },
      error: () => {
        this.isReturningModal.set(false);
        this.returningId.set(null);
      }
    });
  }
}
