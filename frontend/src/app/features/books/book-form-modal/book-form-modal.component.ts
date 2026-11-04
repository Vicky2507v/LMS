import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Book } from '../../../core/models/book.model';

@Component({
  selector: 'app-book-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop-custom" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom" role="dialog" aria-modal="true" aria-labelledby="book-modal-title">
          <div class="p-4">
            <!-- Modal Header -->
            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div class="d-flex align-items-center gap-2">
                <div class="modal-icon bg-primary-subtle text-primary">
                  <i [class]="isEditMode ? 'bi bi-pencil-square' : 'bi bi-book-half'"></i>
                </div>
                <h5 class="mb-0 fw-bold text-dark" id="book-modal-title">
                  {{ isEditMode ? 'Edit Book Details' : 'Add New Book' }}
                </h5>
              </div>
              <button
                type="button"
                class="btn-close"
                aria-label="Close"
                [disabled]="isSubmitting"
                (click)="cancel.emit()">
              </button>
            </div>

            <!-- Form -->
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <!-- Title -->
              <div class="mb-3">
                <label for="title" class="form-label fw-semibold text-dark small">Book Title <span class="text-danger">*</span></label>
                <input
                  id="title"
                  type="text"
                  class="form-control"
                  placeholder="e.g. Clean Code"
                  formControlName="title"
                  [class.is-invalid]="f['title'].touched && f['title'].invalid">
                @if (f['title'].touched && f['title'].errors) {
                  <div class="invalid-feedback">
                    @if (f['title'].errors['required']) { Book title is required. }
                    @if (f['title'].errors['whitespace']) { Book title cannot be only spaces. }
                  </div>
                }
              </div>

              <!-- Author -->
              <div class="mb-3">
                <label for="author" class="form-label fw-semibold text-dark small">Author <span class="text-danger">*</span></label>
                <input
                  id="author"
                  type="text"
                  class="form-control"
                  placeholder="e.g. Robert C. Martin"
                  formControlName="author"
                  [class.is-invalid]="f['author'].touched && f['author'].invalid">
                @if (f['author'].touched && f['author'].errors) {
                  <div class="invalid-feedback">
                    @if (f['author'].errors['required']) { Author is required. }
                    @if (f['author'].errors['whitespace']) { Author cannot be only spaces. }
                  </div>
                }
              </div>

              <!-- Category -->
              <div class="mb-3">
                <label for="category" class="form-label fw-semibold text-dark small">Category / Genre <span class="text-danger">*</span></label>
                <input
                  id="category"
                  type="text"
                  class="form-control"
                  placeholder="e.g. Software Engineering, Fiction, Science"
                  formControlName="category"
                  [class.is-invalid]="f['category'].touched && f['category'].invalid">
                @if (f['category'].touched && f['category'].errors) {
                  <div class="invalid-feedback">
                    @if (f['category'].errors['required']) { Category is required. }
                    @if (f['category'].errors['whitespace']) { Category cannot be only spaces. }
                  </div>
                }
              </div>

              <!-- Copies Row -->
              <div class="row g-3 mb-3">
                <div class="col-6">
                  <label for="totalCopies" class="form-label fw-semibold text-dark small">Total Copies <span class="text-danger">*</span></label>
                  <input
                    id="totalCopies"
                    type="number"
                    min="1"
                    class="form-control"
                    formControlName="totalCopies"
                    (input)="onTotalCopiesChange()"
                    [class.is-invalid]="f['totalCopies'].touched && f['totalCopies'].invalid">
                  @if (f['totalCopies'].touched && f['totalCopies'].errors) {
                    <div class="invalid-feedback">
                      @if (f['totalCopies'].errors['required']) { Required. }
                      @if (f['totalCopies'].errors['min']) { Minimum 1 copy. }
                    </div>
                  }
                </div>

                <div class="col-6">
                  <label for="availableCopies" class="form-label fw-semibold text-dark small">Available Copies <span class="text-danger">*</span></label>
                  <input
                    id="availableCopies"
                    type="number"
                    min="0"
                    class="form-control"
                    formControlName="availableCopies"
                    [class.is-invalid]="(f['availableCopies'].touched && f['availableCopies'].invalid) || form.errors?.['availableExceedsTotal']">
                  @if (f['availableCopies'].touched && f['availableCopies'].errors) {
                    <div class="invalid-feedback">
                      @if (f['availableCopies'].errors['required']) { Required. }
                      @if (f['availableCopies'].errors['min']) { Cannot be negative. }
                    </div>
                  }
                </div>

                @if (form.errors?.['availableExceedsTotal'] && (f['availableCopies'].touched || f['totalCopies'].touched)) {
                  <div class="col-12 mt-1">
                    <div class="alert alert-warning py-1 px-2 small mb-0 d-flex align-items-center gap-1">
                      <i class="bi bi-exclamation-triangle"></i>
                      Available copies cannot exceed total copies.
                    </div>
                  </div>
                }
              </div>

              <!-- Action Buttons -->
              <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  class="btn btn-light px-3"
                  [disabled]="isSubmitting"
                  (click)="cancel.emit()">
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary px-4 d-flex align-items-center gap-2"
                  [disabled]="form.invalid || isSubmitting">
                  @if (isSubmitting) {
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  }
                  {{ isEditMode ? 'Save Changes' : 'Add Book' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
  `]
})
export class BookFormModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() bookToEdit: Book | null = null;
  @Input() isSubmitting: boolean = false;

  @Output() save = new EventEmitter<Book>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  get isEditMode(): boolean {
    return !!this.bookToEdit && !!this.bookToEdit.id;
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookToEdit'] || changes['isOpen']) {
      if (this.isOpen) {
        this.populateForm();
      }
    }
  }

  private initForm(): void {
    this.form = this.fb.group(
      {
        title: ['', [Validators.required, this.noWhitespaceValidator]],
        author: ['', [Validators.required, this.noWhitespaceValidator]],
        category: ['', [Validators.required, this.noWhitespaceValidator]],
        totalCopies: [1, [Validators.required, Validators.min(1)]],
        availableCopies: [1, [Validators.required, Validators.min(0)]]
      },
      { validators: this.copiesValidator }
    );
  }

  private populateForm(): void {
    if (this.bookToEdit) {
      this.form.patchValue({
        title: this.bookToEdit.title,
        author: this.bookToEdit.author,
        category: this.bookToEdit.category,
        totalCopies: this.bookToEdit.totalCopies,
        availableCopies: this.bookToEdit.availableCopies
      });
    } else {
      this.form.reset({
        title: '',
        author: '',
        category: '',
        totalCopies: 1,
        availableCopies: 1
      });
    }
  }

  onTotalCopiesChange(): void {
    if (!this.isEditMode) {
      // In add mode, conveniently default available copies to total copies if user increases total copies
      const total = this.form.get('totalCopies')?.value;
      if (total && total > 0) {
        this.form.patchValue({ availableCopies: total });
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const bookData: Book = {
      id: this.bookToEdit?.id,
      title: val.title.trim(),
      author: val.author.trim(),
      category: val.category.trim(),
      totalCopies: Number(val.totalCopies),
      availableCopies: Number(val.availableCopies)
    };

    this.save.emit(bookData);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom') && !this.isSubmitting) {
      this.cancel.emit();
    }
  }

  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  private copiesValidator(group: AbstractControl): ValidationErrors | null {
    const total = group.get('totalCopies')?.value;
    const available = group.get('availableCopies')?.value;
    if (total !== null && available !== null && available > total) {
      return { availableExceedsTotal: true };
    }
    return null;
  }
}
