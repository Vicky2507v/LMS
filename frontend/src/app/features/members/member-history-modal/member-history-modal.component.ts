import { Component, EventEmitter, Input, Output, OnInit, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowRecordService } from '../../../core/services/borrow-record.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Member } from '../../../core/models/member.model';
import { BorrowRecord } from '../../../core/models/borrow-record.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DaysOverduePipe } from '../../../shared/pipes/days-overdue.pipe';

@Component({
  selector: 'app-member-history-modal',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgeComponent, DaysOverduePipe],
  template: `
    @if (isOpen && member) {
      <div class="modal-backdrop-custom" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom modal-dialog-wide" role="dialog" aria-modal="true">
          <div class="p-4">
            <!-- Modal Header -->
            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <h5 class="mb-0 fw-bold text-dark">{{ member.name }}</h5>
                  <span class="badge bg-light text-dark border">ID #{{ member.id }}</span>
                </div>
                <div class="text-secondary small mt-1">
                  <i class="bi bi-envelope me-1"></i> {{ member.email }}
                  <span class="mx-2">&bull;</span>
                  <i class="bi bi-telephone me-1"></i> {{ member.phone }}
                </div>
              </div>
              <button type="button" class="btn-close" aria-label="Close" (click)="close.emit()"></button>
            </div>

            <!-- Content -->
            @if (isLoading()) {
              <app-loading-spinner message="Fetching member borrowing logs..."></app-loading-spinner>
            } @else if (records().length === 0) {
              <app-empty-state
                icon="bi bi-journal-x"
                title="No borrowing history"
                description="This member has not borrowed any books yet.">
              </app-empty-state>
            } @else {
              <!-- Summary pills -->
              <div class="d-flex gap-2 mb-3">
                <span class="badge bg-light text-dark border p-2">
                  Total Loans: <strong>{{ records().length }}</strong>
                </span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle p-2">
                  Active: <strong>{{ activeLoansCount }}</strong>
                </span>
                <span class="badge bg-success-subtle text-success border border-success-subtle p-2">
                  Returned: <strong>{{ returnedCount }}</strong>
                </span>
              </div>

              <!-- Records List -->
              <div class="table-responsive" style="max-height: 420px; overflow-y: auto;">
                <table class="table table-saas align-middle">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Book</th>
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th class="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (rec of records(); track rec.id) {
                      <tr>
                        <td>
                          <span class="badge bg-light text-dark border fw-mono">#{{ rec.id }}</span>
                        </td>
                        <td>
                          <div class="fw-semibold text-dark">{{ rec.book.title }}</div>
                          <div class="text-secondary small">{{ rec.book.author }}</div>
                        </td>
                        <td class="text-nowrap">{{ rec.issueDate }}</td>
                        <td class="text-nowrap">
                          {{ rec.dueDate }}
                          @if (rec.status === 'ISSUED' && (rec.dueDate | daysOverdue) > 0) {
                            <span class="badge bg-danger-subtle text-danger ms-1">
                              {{ rec.dueDate | daysOverdue }}d overdue
                            </span>
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
                              (click)="returnBook(rec)">
                              @if (returningId() === rec.id) {
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              } @else {
                                <i class="bi bi-arrow-down-left me-1"></i> Return
                              }
                            </button>
                          } @else {
                            <span class="text-muted small">Returned {{ rec.returnedDate }}</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <div class="d-flex justify-content-end pt-3 border-top mt-3">
              <button type="button" class="btn btn-secondary px-4" (click)="close.emit()">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-dialog-wide {
      max-width: 800px;
    }
  `]
})
export class MemberHistoryModalComponent implements OnChanges {
  private readonly borrowService = inject(BorrowRecordService);
  private readonly notificationService = inject(NotificationService);

  @Input() isOpen: boolean = false;
  @Input() member: Member | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() recordUpdated = new EventEmitter<void>();

  readonly isLoading = signal<boolean>(false);
  readonly records = signal<BorrowRecord[]>([]);
  readonly returningId = signal<number | null>(null);

  get activeLoansCount(): number {
    return this.records().filter(r => r.status === 'ISSUED').length;
  }

  get returnedCount(): number {
    return this.records().filter(r => r.status === 'RETURNED').length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['member'] || changes['isOpen']) && this.isOpen && this.member?.id) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    if (!this.member?.id) return;

    this.isLoading.set(true);
    this.borrowService.getBorrowRecordsByMember(this.member.id).subscribe({
      next: data => {
        this.records.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  returnBook(rec: BorrowRecord): void {
    if (!rec.id) return;

    this.returningId.set(rec.id);
    this.borrowService.returnBook(rec.id).subscribe({
      next: msg => {
        this.notificationService.success(msg || 'Book returned successfully!');
        this.returningId.set(null);
        this.loadHistory();
        this.recordUpdated.emit();
      },
      error: () => {
        this.returningId.set(null);
      }
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom')) {
      this.close.emit();
    }
  }
}
