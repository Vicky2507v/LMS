import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { MemberService } from '../../core/services/member.service';
import { BorrowRecordService } from '../../core/services/borrow-record.service';
import { NotificationService } from '../../core/services/notification.service';
import { Book } from '../../core/models/book.model';
import { Member } from '../../core/models/member.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-issue-book',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="issue-book-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Issue Book to Member</h2>
          <p class="text-secondary small mb-0">Record a new book loan. The backend automatically manages 14-day due dates and inventory.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <a routerLink="/return-book" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
            <i class="bi bi-arrow-down-left"></i>
            <span>Return Books</span>
          </a>
          <a routerLink="/borrowing-history" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
            <i class="bi bi-clock-history"></i>
            <span>Borrowing History</span>
          </a>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-spinner message="Loading available books and members..."></app-loading-spinner>
      } @else {
        <div class="row g-4">
          <!-- Form Section -->
          <div class="col-12 col-lg-7">
            <div class="card-saas p-4">
              <h5 class="fw-bold text-dark mb-3">
                <i class="bi bi-journal-arrow-up text-primary me-2"></i>Loan Application
              </h5>

              <form [formGroup]="issueForm" (ngSubmit)="onSubmit()">
                <!-- Member Selection -->
                <div class="mb-4">
                  <label for="memberSelect" class="form-label fw-semibold text-dark small d-flex justify-content-between align-items-center">
                    <span>1. Select Member <span class="text-danger">*</span></span>
                    <a routerLink="/members" class="small text-decoration-none">
                      <i class="bi bi-person-plus me-1"></i>New Member?
                    </a>
                  </label>
                  <select
                    id="memberSelect"
                    class="form-select form-select-lg"
                    formControlName="memberId"
                    [class.is-invalid]="f['memberId'].touched && f['memberId'].invalid">
                    <option [ngValue]="null">-- Choose a registered member --</option>
                    @for (m of members(); track m.id) {
                      <option [ngValue]="m.id">
                        {{ m.name }} &mdash; {{ m.email }} ({{ m.phone }})
                      </option>
                    }
                  </select>
                  @if (f['memberId'].touched && f['memberId'].errors) {
                    <div class="invalid-feedback">Please select a valid library member.</div>
                  }
                </div>

                <!-- Book Selection -->
                <div class="mb-4">
                  <label for="bookSelect" class="form-label fw-semibold text-dark small d-flex justify-content-between align-items-center">
                    <span>2. Select Book <span class="text-danger">*</span></span>
                    <a routerLink="/books" class="small text-decoration-none">
                      <i class="bi bi-book me-1"></i>New Title?
                    </a>
                  </label>
                  <select
                    id="bookSelect"
                    class="form-select form-select-lg"
                    formControlName="bookId"
                    [class.is-invalid]="f['bookId'].touched && f['bookId'].invalid">
                    <option [ngValue]="null">-- Choose a book title --</option>
                    @for (b of books(); track b.id) {
                      <option [ngValue]="b.id" [disabled]="b.availableCopies <= 0">
                        {{ b.title }} by {{ b.author }} &mdash; ({{ b.availableCopies }} of {{ b.totalCopies }} available)
                        @if (b.availableCopies <= 0) { [OUT OF STOCK] }
                      </option>
                    }
                  </select>
                  @if (f['bookId'].touched && f['bookId'].errors) {
                    <div class="invalid-feedback">Please select a book from the catalog.</div>
                  }
                </div>

                <!-- Out of stock alert if selected book has no copies -->
                @if (selectedBook() && selectedBook()!.availableCopies <= 0) {
                  <div class="alert alert-danger d-flex align-items-center gap-2 mb-4">
                    <i class="bi bi-exclamation-octagon-fill fs-5"></i>
                    <div>
                      <strong>Cannot Issue Book:</strong> No copies of "{{ selectedBook()!.title }}" are currently available in the library. All copies have been loaned out.
                    </div>
                  </div>
                }

                <!-- Action Button -->
                <div class="d-grid mt-4">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2"
                    [disabled]="issueForm.invalid || isSubmitting() || (selectedBook() && selectedBook()!.availableCopies <= 0)">
                    @if (isSubmitting()) {
                      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Processing Loan via Backend...</span>
                    } @else {
                      <i class="bi bi-check-circle-fill"></i>
                      <span>Confirm & Issue Book</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Summary & Verification Card -->
          <div class="col-12 col-lg-5">
            <div class="card-saas p-4 mb-4">
              <h6 class="fw-bold text-dark mb-3 text-uppercase small text-secondary">Loan Verification Summary</h6>

              <!-- Selected Member Info -->
              <div class="mb-3 p-3 bg-light rounded-3">
                <div class="text-secondary small fw-medium mb-1">Borrower Details</div>
                @if (selectedMember()) {
                  <div class="fw-bold text-dark fs-6">{{ selectedMember()!.name }}</div>
                  <div class="text-secondary small">{{ selectedMember()!.email }}</div>
                  <div class="text-secondary small">{{ selectedMember()!.phone }}</div>
                  <div class="mt-2">
                    <span class="badge bg-secondary-subtle text-secondary border">Member ID #{{ selectedMember()!.id }}</span>
                  </div>
                } @else {
                  <div class="text-muted small fst-italic">No member selected yet.</div>
                }
              </div>

              <!-- Selected Book Info -->
              <div class="mb-3 p-3 bg-light rounded-3">
                <div class="text-secondary small fw-medium mb-1">Book Details</div>
                @if (selectedBook()) {
                  <div class="fw-bold text-dark fs-6">{{ selectedBook()!.title }}</div>
                  <div class="text-secondary small">{{ selectedBook()!.author }} &bull; {{ selectedBook()!.category }}</div>
                  <div class="mt-2 d-flex align-items-center gap-2">
                    <span class="badge" [ngClass]="selectedBook()!.availableCopies > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'">
                      {{ selectedBook()!.availableCopies }} of {{ selectedBook()!.totalCopies }} copies available
                    </span>
                  </div>
                } @else {
                  <div class="text-muted small fst-italic">No book selected yet.</div>
                }
              </div>

              <!-- Loan Terms Info -->
              <div class="p-3 border rounded-3 bg-white">
                <div class="d-flex justify-content-between text-secondary small mb-1">
                  <span>Issue Date:</span>
                  <span class="fw-semibold text-dark">Today ({{ todayStr }})</span>
                </div>
                <div class="d-flex justify-content-between text-secondary small mb-1">
                  <span>Due Date:</span>
                  <span class="fw-semibold text-primary">+14 days ({{ dueDateStr }})</span>
                </div>
                <div class="d-flex justify-content-between text-secondary small">
                  <span>Initial Status:</span>
                  <span class="badge-status badge-status-issued">ISSUED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class IssueBookComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly memberService = inject(MemberService);
  private readonly borrowService = inject(BorrowRecordService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);

  readonly books = signal<Book[]>([]);
  readonly members = signal<Member[]>([]);

  issueForm!: FormGroup;

  todayStr: string = '';
  dueDateStr: string = '';

  constructor() {
    this.initForm();
    this.calculateDates();
  }

  get f() {
    return this.issueForm.controls;
  }

  readonly selectedMember = computed(() => {
    const id = this.issueForm?.get('memberId')?.value;
    if (!id) return null;
    return this.members().find(m => m.id === id) || null;
  });

  readonly selectedBook = computed(() => {
    const id = this.issueForm?.get('bookId')?.value;
    if (!id) return null;
    return this.books().find(b => b.id === id) || null;
  });

  ngOnInit(): void {
    this.loadData();
  }

  private initForm(): void {
    this.issueForm = this.fb.group({
      memberId: [null, [Validators.required]],
      bookId: [null, [Validators.required]]
    });
  }

  private calculateDates(): void {
    const today = new Date();
    this.todayStr = today.toISOString().split('T')[0];

    const due = new Date();
    due.setDate(today.getDate() + 14);
    this.dueDateStr = due.toISOString().split('T')[0];
  }

  loadData(): void {
    this.isLoading.set(true);
    this.bookService.getAllBooks().subscribe({
      next: books => {
        this.books.set(books || []);
        this.memberService.getAllMembers().subscribe({
          next: members => {
            this.members.set(members || []);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSubmit(): void {
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      return;
    }

    const memberId = Number(this.issueForm.value.memberId);
    const bookId = Number(this.issueForm.value.bookId);

    const book = this.books().find(b => b.id === bookId);
    if (book && book.availableCopies <= 0) {
      this.notificationService.error('Cannot issue book: No available copies left.');
      return;
    }

    this.isSubmitting.set(true);

    this.borrowService.issueBook(memberId, bookId).subscribe({
      next: msg => {
        this.notificationService.success(msg || 'Book issued successfully!');
        this.isSubmitting.set(false);
        this.issueForm.reset({ memberId: null, bookId: null });
        // Refresh books list to reflect updated available copies from backend
        this.loadData();
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
