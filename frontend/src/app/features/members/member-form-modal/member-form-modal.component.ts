import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Member } from '../../../core/models/member.model';

@Component({
  selector: 'app-member-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop-custom" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
          <div class="p-4">
            <!-- Modal Header -->
            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div class="d-flex align-items-center gap-2">
                <div class="modal-icon bg-primary-subtle text-primary">
                  <i [class]="isEditMode ? 'bi bi-person-gear' : 'bi bi-person-plus-fill'"></i>
                </div>
                <h5 class="mb-0 fw-bold text-dark" id="member-modal-title">
                  {{ isEditMode ? 'Edit Member Information' : 'Register New Member' }}
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
              <!-- Name -->
              <div class="mb-3">
                <label for="memberName" class="form-label fw-semibold text-dark small">Full Name <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-person text-secondary"></i></span>
                  <input
                    id="memberName"
                    type="text"
                    class="form-control"
                    placeholder="e.g. John Doe"
                    formControlName="name"
                    [class.is-invalid]="f['name'].touched && f['name'].invalid">
                </div>
                @if (f['name'].touched && f['name'].errors) {
                  <div class="text-danger small mt-1">
                    @if (f['name'].errors['required']) { Name is required. }
                    @if (f['name'].errors['whitespace']) { Name cannot be only spaces. }
                  </div>
                }
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label for="memberEmail" class="form-label fw-semibold text-dark small">Email Address <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-envelope text-secondary"></i></span>
                  <input
                    id="memberEmail"
                    type="email"
                    class="form-control"
                    placeholder="e.g. john@example.com"
                    formControlName="email"
                    [class.is-invalid]="f['email'].touched && f['email'].invalid">
                </div>
                @if (f['email'].touched && f['email'].errors) {
                  <div class="text-danger small mt-1">
                    @if (f['email'].errors['required']) { Email is required. }
                    @if (f['email'].errors['email']) { Please enter a valid email address. }
                  </div>
                }
              </div>

              <!-- Phone -->
              <div class="mb-3">
                <label for="memberPhone" class="form-label fw-semibold text-dark small">Phone Number <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-telephone text-secondary"></i></span>
                  <input
                    id="memberPhone"
                    type="tel"
                    maxlength="10"
                    class="form-control"
                    placeholder="10 digit phone number (e.g. 9876543210)"
                    formControlName="phone"
                    [class.is-invalid]="f['phone'].touched && f['phone'].invalid">
                </div>
                <div class="form-text small text-muted">Backend requires exactly 10 numeric digits.</div>
                @if (f['phone'].touched && f['phone'].errors) {
                  <div class="text-danger small mt-1">
                    @if (f['phone'].errors['required']) { Phone number is required. }
                    @if (f['phone'].errors['pattern']) { Phone must be exactly 10 digits (0-9). }
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
                  {{ isEditMode ? 'Update Member' : 'Register Member' }}
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
export class MemberFormModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() memberToEdit: Member | null = null;
  @Input() isSubmitting: boolean = false;

  @Output() save = new EventEmitter<Member>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  get isEditMode(): boolean {
    return !!this.memberToEdit && !!this.memberToEdit.id;
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['memberToEdit'] || changes['isOpen']) {
      if (this.isOpen) {
        this.populateForm();
      }
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, this.noWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  private populateForm(): void {
    if (this.memberToEdit) {
      this.form.patchValue({
        name: this.memberToEdit.name,
        email: this.memberToEdit.email,
        phone: this.memberToEdit.phone
      });
    } else {
      this.form.reset({
        name: '',
        email: '',
        phone: ''
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const memberData: Member = {
      id: this.memberToEdit?.id,
      name: val.name.trim(),
      email: val.email.trim(),
      phone: val.phone.trim()
    };

    this.save.emit(memberData);
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
}
