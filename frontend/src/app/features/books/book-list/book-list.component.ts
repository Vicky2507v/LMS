import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Book } from '../../../core/models/book.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { BookFormModalComponent } from '../book-form-modal/book-form-modal.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    PaginationComponent,
    BookFormModalComponent
  ],
  template: `
    <div class="books-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Book Management</h2>
          <p class="text-secondary small mb-0">Browse, search, add, update, and manage the library catalog.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            [disabled]="isLoading()"
            (click)="loadBooks()">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
            (click)="openAddModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card-saas p-3 mb-4">
        <div class="row g-2 align-items-center">
          <!-- Search by Title -->
          <div class="col-12 col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-secondary"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by title..."
                [(ngModel)]="searchTitle"
                (ngModelChange)="onSearchTitleChange()">
              @if (searchTitle) {
                <button class="btn btn-outline-secondary" type="button" (click)="searchTitle = ''; onSearchTitleChange()">
                  <i class="bi bi-x"></i>
                </button>
              }
            </div>
          </div>

          <!-- Search by Author -->
          <div class="col-12 col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-person text-secondary"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Filter by author..."
                [(ngModel)]="searchAuthor"
                (ngModelChange)="applyClientFilters()">
              @if (searchAuthor) {
                <button class="btn btn-outline-secondary" type="button" (click)="searchAuthor = ''; applyClientFilters()">
                  <i class="bi bi-x"></i>
                </button>
              }
            </div>
          </div>

          <!-- Filter by Category -->
          <div class="col-12 col-md-4">
            <select
              class="form-select form-select-sm"
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onCategoryChange()">
              <option value="">All Categories</option>
              @for (cat of distinctCategories(); track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Main Content / Table -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading library catalog..."></app-loading-spinner>
      } @else if (filteredBooks().length === 0) {
        <div class="card-saas">
          <app-empty-state
            icon="bi bi-journal-x"
            title="No books match your criteria"
            description="Try modifying search keywords or clearing filters."
            actionLabel="Reset Search & Filters"
            actionIcon="bi bi-arrow-repeat"
            (actionClick)="resetFilters()">
          </app-empty-state>
        </div>
      } @else {
        <div class="card-saas">
          <div class="table-responsive">
            <table class="table table-saas align-middle">
              <thead>
                <tr>
                  <th style="width: 80px;" (click)="toggleSort('id')" class="cursor-pointer">
                    ID
                    <i class="bi ms-1" [ngClass]="getSortIcon('id')"></i>
                  </th>
                  <th (click)="toggleSort('title')" class="cursor-pointer">
                    Book Title
                    <i class="bi ms-1" [ngClass]="getSortIcon('title')"></i>
                  </th>
                  <th (click)="toggleSort('author')" class="cursor-pointer">
                    Author
                    <i class="bi ms-1" [ngClass]="getSortIcon('author')"></i>
                  </th>
                  <th (click)="toggleSort('category')" class="cursor-pointer">
                    Category
                    <i class="bi ms-1" [ngClass]="getSortIcon('category')"></i>
                  </th>
                  <th style="width: 180px;">Inventory & Availability</th>
                  <th style="width: 120px;">Status</th>
                  <th class="text-end" style="width: 130px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (book of paginatedBooks(); track book.id) {
                  <tr>
                    <td>
                      <span class="badge bg-light text-dark border fw-mono">#{{ book.id }}</span>
                    </td>
                    <td>
                      <div class="fw-semibold text-dark">{{ book.title }}</div>
                    </td>
                    <td>
                      <div class="text-secondary">{{ book.author }}</div>
                    </td>
                    <td>
                      <span class="badge bg-light text-secondary border px-2 py-1">
                        {{ book.category }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center justify-content-between small mb-1">
                        <span class="fw-semibold text-dark">{{ book.availableCopies }}</span>
                        <span class="text-secondary">/ {{ book.totalCopies }} copies</span>
                      </div>
                      <div class="progress" style="height: 6px;">
                        <div
                          class="progress-bar"
                          role="progressbar"
                          [style.width.%]="book.totalCopies > 0 ? (book.availableCopies / book.totalCopies * 100) : 0"
                          [ngClass]="getAvailabilityBarClass(book)">
                        </div>
                      </div>
                    </td>
                    <td>
                      <app-status-badge [status]="getStockStatus(book)"></app-status-badge>
                    </td>
                    <td class="text-end">
                      <div class="btn-group btn-group-sm">
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          title="Edit Book"
                          (click)="openEditModal(book)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-danger"
                          title="Delete Book"
                          (click)="confirmDelete(book)">
                          <i class="bi bi-trash3"></i>
                        </button>
                      </div>
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
              [totalElements]="filteredBooks().length"
              [pageSize]="pageSize()"
              (pageChange)="onPageChange($event)"
              (sizeChange)="onPageSizeChange($event)">
            </app-pagination>
          </div>
        </div>
      }

      <!-- Add/Edit Modal -->
      <app-book-form-modal
        [isOpen]="isFormModalOpen()"
        [bookToEdit]="bookToEdit"
        [isSubmitting]="isSubmittingForm()"
        (save)="onSaveBook($event)"
        (cancel)="isFormModalOpen.set(false)">
      </app-book-form-modal>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen()"
        title="Delete Book"
        [message]="deleteModalMessage"
        confirmText="Delete Book"
        type="danger"
        [isLoading]="isDeleting()"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen.set(false)">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
      user-select: none;
    }
    .cursor-pointer:hover {
      background-color: #f1f5f9;
    }
  `]
})
export class BookListComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal<boolean>(true);
  readonly allBooks = signal<Book[]>([]);
  readonly filteredBooks = signal<Book[]>([]);

  // Filter states
  searchTitle: string = '';
  searchAuthor: string = '';
  selectedCategory: string = '';

  // Sort states
  sortField: keyof Book = 'title';
  sortAscending: boolean = true;

  // Pagination states
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);

  // Modal states
  readonly isFormModalOpen = signal<boolean>(false);
  readonly isSubmittingForm = signal<boolean>(false);
  bookToEdit: Book | null = null;

  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  private bookToDelete: Book | null = null;
  deleteModalMessage: string = '';

  // Derived properties
  readonly distinctCategories = computed(() => {
    const set = new Set<string>();
    this.allBooks().forEach(b => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredBooks().length / this.pageSize()) || 1;
  });

  readonly paginatedBooks = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.filteredBooks().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading.set(true);
    this.bookService.getAllBooks().subscribe({
      next: books => {
        this.allBooks.set(books || []);
        this.applyClientFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSearchTitleChange(): void {
    if (this.searchTitle.trim().length > 0) {
      // Use backend search by title if desired
      this.bookService.getBooksByTitle(this.searchTitle.trim()).subscribe({
        next: results => {
          this.applyFilterResults(results);
        },
        error: () => {
          this.applyClientFilters();
        }
      });
    } else {
      this.applyClientFilters();
    }
  }

  onCategoryChange(): void {
    if (this.selectedCategory) {
      this.bookService.getBooksByCategory(this.selectedCategory).subscribe({
        next: results => {
          this.applyFilterResults(results);
        },
        error: () => {
          this.applyClientFilters();
        }
      });
    } else {
      this.applyClientFilters();
    }
  }

  applyClientFilters(): void {
    let result = [...this.allBooks()];

    if (this.searchTitle.trim()) {
      const q = this.searchTitle.trim().toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(q));
    }

    if (this.searchAuthor.trim()) {
      const q = this.searchAuthor.trim().toLowerCase();
      result = result.filter(b => b.author.toLowerCase().includes(q));
    }

    if (this.selectedCategory) {
      result = result.filter(b => b.category === this.selectedCategory);
    }

    this.sortAndSet(result);
  }

  private applyFilterResults(results: Book[]): void {
    let list = results || [];
    if (this.searchAuthor.trim()) {
      const q = this.searchAuthor.trim().toLowerCase();
      list = list.filter(b => b.author.toLowerCase().includes(q));
    }
    this.sortAndSet(list);
  }

  private sortAndSet(list: Book[]): void {
    list.sort((a, b) => {
      let valA: any = a[this.sortField];
      let valB: any = b[this.sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortAscending ? -1 : 1;
      if (valA > valB) return this.sortAscending ? 1 : -1;
      return 0;
    });

    this.filteredBooks.set(list);
    this.currentPage.set(0);
  }

  toggleSort(field: keyof Book): void {
    if (this.sortField === field) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortField = field;
      this.sortAscending = true;
    }
    this.sortAndSet([...this.filteredBooks()]);
  }

  getSortIcon(field: keyof Book): string {
    if (this.sortField !== field) return 'bi-arrow-down-up text-muted';
    return this.sortAscending ? 'bi-sort-alpha-down text-primary' : 'bi-sort-alpha-up-alt text-primary';
  }

  getStockStatus(book: Book): string {
    if (book.availableCopies === 0) return 'OUT_OF_STOCK';
    if (book.availableCopies <= 2) return 'LOW_STOCK';
    return 'IN_STOCK';
  }

  getAvailabilityBarClass(book: Book): string {
    if (book.availableCopies === 0) return 'bg-danger';
    if (book.availableCopies <= 2) return 'bg-warning';
    return 'bg-success';
  }

  resetFilters(): void {
    this.searchTitle = '';
    this.searchAuthor = '';
    this.selectedCategory = '';
    this.loadBooks();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
  }

  // Modal Triggers
  openAddModal(): void {
    this.bookToEdit = null;
    this.isFormModalOpen.set(true);
  }

  openEditModal(book: Book): void {
    this.bookToEdit = { ...book };
    this.isFormModalOpen.set(true);
  }

  onSaveBook(book: Book): void {
    this.isSubmittingForm.set(true);

    if (book.id) {
      // Update by ID
      this.bookService.updateBookById(book.id, book).subscribe({
        next: msg => {
          this.notificationService.success(msg || 'Book updated successfully!');
          this.isSubmittingForm.set(false);
          this.isFormModalOpen.set(false);
          this.loadBooks();
        },
        error: () => {
          this.isSubmittingForm.set(false);
        }
      });
    } else {
      // Add new book
      this.bookService.addBook(book).subscribe({
        next: msg => {
          this.notificationService.success(msg || 'Book added successfully!');
          this.isSubmittingForm.set(false);
          this.isFormModalOpen.set(false);
          this.loadBooks();
        },
        error: () => {
          this.isSubmittingForm.set(false);
        }
      });
    }
  }

  confirmDelete(book: Book): void {
    this.bookToDelete = book;
    this.deleteModalMessage = `Are you sure you want to delete "${book.title}" by ${book.author} (ID: ${book.id})? This action cannot be undone.`;
    this.isDeleteModalOpen.set(true);
  }

  executeDelete(): void {
    if (!this.bookToDelete || !this.bookToDelete.id) return;

    this.isDeleting.set(true);
    this.bookService.deleteBookById(this.bookToDelete.id).subscribe({
      next: msg => {
        this.notificationService.success(msg || 'Book deleted successfully!');
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.bookToDelete = null;
        this.loadBooks();
      },
      error: () => {
        this.isDeleting.set(false);
      }
    });
  }
}
