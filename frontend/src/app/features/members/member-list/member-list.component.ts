import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../../core/services/member.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Member } from '../../../core/models/member.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { MemberFormModalComponent } from '../member-form-modal/member-form-modal.component';
import { MemberHistoryModalComponent } from '../member-history-modal/member-history-modal.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmModalComponent,
    PaginationComponent,
    MemberFormModalComponent,
    MemberHistoryModalComponent
  ],
  template: `
    <div class="members-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Member Management</h2>
          <p class="text-secondary small mb-0">Manage registered library members, search records, and check borrowing history.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            [disabled]="isLoading()"
            (click)="loadMembers()">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
            (click)="openAddModal()">
            <i class="bi bi-person-plus-fill"></i>
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <!-- Search Toolbar -->
      <div class="card-saas p-3 mb-4">
        <div class="row g-2 align-items-center">
          <!-- Search by Name -->
          <div class="col-12 col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-person text-secondary"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by name..."
                [(ngModel)]="searchName"
                (ngModelChange)="onSearchNameChange()">
              @if (searchName) {
                <button class="btn btn-outline-secondary" type="button" (click)="searchName = ''; onSearchNameChange()">
                  <i class="bi bi-x"></i>
                </button>
              }
            </div>
          </div>

          <!-- Search by Email -->
          <div class="col-12 col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-envelope text-secondary"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by email..."
                [(ngModel)]="searchEmail"
                (ngModelChange)="onSearchEmailChange()">
              @if (searchEmail) {
                <button class="btn btn-outline-secondary" type="button" (click)="searchEmail = ''; onSearchEmailChange()">
                  <i class="bi bi-x"></i>
                </button>
              }
            </div>
          </div>

          <!-- Search by Phone -->
          <div class="col-12 col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-telephone text-secondary"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by phone..."
                [(ngModel)]="searchPhone"
                (ngModelChange)="onSearchPhoneChange()">
              @if (searchPhone) {
                <button class="btn btn-outline-secondary" type="button" (click)="searchPhone = ''; onSearchPhoneChange()">
                  <i class="bi bi-x"></i>
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content / Table -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading member registry..."></app-loading-spinner>
      } @else if (filteredMembers().length === 0) {
        <div class="card-saas">
          <app-empty-state
            icon="bi bi-people"
            title="No members found"
            description="No library members match your search criteria."
            actionLabel="Reset Search"
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
                  <th (click)="toggleSort('name')" class="cursor-pointer">
                    Member Name
                    <i class="bi ms-1" [ngClass]="getSortIcon('name')"></i>
                  </th>
                  <th (click)="toggleSort('email')" class="cursor-pointer">
                    Email Address
                    <i class="bi ms-1" [ngClass]="getSortIcon('email')"></i>
                  </th>
                  <th (click)="toggleSort('phone')" class="cursor-pointer">
                    Phone Number
                    <i class="bi ms-1" [ngClass]="getSortIcon('phone')"></i>
                  </th>
                  <th class="text-end" style="width: 200px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (member of paginatedMembers(); track member.id) {
                  <tr>
                    <td>
                      <span class="badge bg-light text-dark border fw-mono">#{{ member.id }}</span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="avatar-circle">
                          {{ getInitials(member.name) }}
                        </div>
                        <div class="fw-semibold text-dark">{{ member.name }}</div>
                      </div>
                    </td>
                    <td>
                      <a [href]="'mailto:' + member.email" class="text-decoration-none text-secondary">
                        <i class="bi bi-envelope me-1"></i>{{ member.email }}
                      </a>
                    </td>
                    <td>
                      <a [href]="'tel:' + member.phone" class="text-decoration-none text-secondary">
                        <i class="bi bi-telephone me-1"></i>{{ member.phone }}
                      </a>
                    </td>
                    <td class="text-end">
                      <div class="btn-group btn-group-sm">
                        <button
                          type="button"
                          class="btn btn-outline-primary"
                          title="View Borrowing History"
                          (click)="openHistoryModal(member)">
                          <i class="bi bi-clock-history me-1"></i> History
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          title="Edit Member"
                          (click)="openEditModal(member)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-danger"
                          title="Delete Member"
                          (click)="confirmDelete(member)">
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
              [totalElements]="filteredMembers().length"
              [pageSize]="pageSize()"
              (pageChange)="onPageChange($event)"
              (sizeChange)="onPageSizeChange($event)">
            </app-pagination>
          </div>
        </div>
      }

      <!-- Add/Edit Form Modal -->
      <app-member-form-modal
        [isOpen]="isFormModalOpen()"
        [memberToEdit]="memberToEdit"
        [isSubmitting]="isSubmittingForm()"
        (save)="onSaveMember($event)"
        (cancel)="isFormModalOpen.set(false)">
      </app-member-form-modal>

      <!-- Member History Modal -->
      <app-member-history-modal
        [isOpen]="isHistoryModalOpen()"
        [member]="selectedMemberForHistory"
        (close)="isHistoryModalOpen.set(false)"
        (recordUpdated)="loadMembers()">
      </app-member-history-modal>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen()"
        title="Delete Member"
        [message]="deleteModalMessage"
        confirmText="Delete Member"
        type="danger"
        [isLoading]="isDeleting()"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen.set(false)">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
      color: #3730a3;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cursor-pointer {
      cursor: pointer;
      user-select: none;
    }
    .cursor-pointer:hover {
      background-color: #f1f5f9;
    }
  `]
})
export class MemberListComponent implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal<boolean>(true);
  readonly allMembers = signal<Member[]>([]);
  readonly filteredMembers = signal<Member[]>([]);

  // Search models
  searchName: string = '';
  searchEmail: string = '';
  searchPhone: string = '';

  // Sort states
  sortField: keyof Member = 'name';
  sortAscending: boolean = true;

  // Pagination states
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);

  // Form modal state
  readonly isFormModalOpen = signal<boolean>(false);
  readonly isSubmittingForm = signal<boolean>(false);
  memberToEdit: Member | null = null;

  // History modal state
  readonly isHistoryModalOpen = signal<boolean>(false);
  selectedMemberForHistory: Member | null = null;

  // Delete modal state
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  private memberToDelete: Member | null = null;
  deleteModalMessage: string = '';

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredMembers().length / this.pageSize()) || 1;
  });

  readonly paginatedMembers = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.filteredMembers().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.isLoading.set(true);
    this.memberService.getAllMembers().subscribe({
      next: data => {
        this.allMembers.set(data || []);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSearchNameChange(): void {
    if (this.searchName.trim().length > 0) {
      this.memberService.getMembersByName(this.searchName.trim()).subscribe({
        next: results => {
          this.applyExternalResults(results);
        },
        error: () => {
          this.applyFilters();
        }
      });
    } else {
      this.applyFilters();
    }
  }

  onSearchEmailChange(): void {
    if (this.searchEmail.trim().length > 0 && this.searchEmail.includes('@')) {
      this.memberService.getMembersByEmail(this.searchEmail.trim()).subscribe({
        next: results => {
          this.applyExternalResults(results);
        },
        error: () => {
          this.applyFilters();
        }
      });
    } else {
      this.applyFilters();
    }
  }

  onSearchPhoneChange(): void {
    if (this.searchPhone.trim().length > 0) {
      this.memberService.getMembersByPhone(this.searchPhone.trim()).subscribe({
        next: results => {
          this.applyExternalResults(results);
        },
        error: () => {
          this.applyFilters();
        }
      });
    } else {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    let result = [...this.allMembers()];

    if (this.searchName.trim()) {
      const q = this.searchName.trim().toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q));
    }

    if (this.searchEmail.trim()) {
      const q = this.searchEmail.trim().toLowerCase();
      result = result.filter(m => m.email.toLowerCase().includes(q));
    }

    if (this.searchPhone.trim()) {
      const q = this.searchPhone.trim();
      result = result.filter(m => m.phone.includes(q));
    }

    this.sortAndSet(result);
  }

  private applyExternalResults(results: Member[]): void {
    this.sortAndSet(results || []);
  }

  private sortAndSet(list: Member[]): void {
    list.sort((a, b) => {
      let valA: any = a[this.sortField];
      let valB: any = b[this.sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortAscending ? -1 : 1;
      if (valA > valB) return this.sortAscending ? 1 : -1;
      return 0;
    });

    this.filteredMembers.set(list);
    this.currentPage.set(0);
  }

  toggleSort(field: keyof Member): void {
    if (this.sortField === field) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortField = field;
      this.sortAscending = true;
    }
    this.sortAndSet([...this.filteredMembers()]);
  }

  getSortIcon(field: keyof Member): string {
    if (this.sortField !== field) return 'bi-arrow-down-up text-muted';
    return this.sortAscending ? 'bi-sort-alpha-down text-primary' : 'bi-sort-alpha-up-alt text-primary';
  }

  getInitials(name: string): string {
    if (!name) return 'M';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  resetFilters(): void {
    this.searchName = '';
    this.searchEmail = '';
    this.searchPhone = '';
    this.loadMembers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
  }

  // Modals
  openAddModal(): void {
    this.memberToEdit = null;
    this.isFormModalOpen.set(true);
  }

  openEditModal(member: Member): void {
    this.memberToEdit = { ...member };
    this.isFormModalOpen.set(true);
  }

  openHistoryModal(member: Member): void {
    this.selectedMemberForHistory = member;
    this.isHistoryModalOpen.set(true);
  }

  onSaveMember(member: Member): void {
    this.isSubmittingForm.set(true);

    if (member.id) {
      // Backend uses PATCH /updateMemberById/{id}
      this.memberService.updateMemberById(member.id, member).subscribe({
        next: msg => {
          this.notificationService.success(msg || 'Member updated successfully!');
          this.isSubmittingForm.set(false);
          this.isFormModalOpen.set(false);
          this.loadMembers();
        },
        error: () => {
          this.isSubmittingForm.set(false);
        }
      });
    } else {
      // Add member: POST /addMember
      this.memberService.addMember(member).subscribe({
        next: msg => {
          this.notificationService.success(msg || 'Member registered successfully!');
          this.isSubmittingForm.set(false);
          this.isFormModalOpen.set(false);
          this.loadMembers();
        },
        error: () => {
          this.isSubmittingForm.set(false);
        }
      });
    }
  }

  confirmDelete(member: Member): void {
    this.memberToDelete = member;
    this.deleteModalMessage = `Are you sure you want to remove member "${member.name}" (${member.email})? Note: Deleting a member with active borrow records will fail integrity checks.`;
    this.isDeleteModalOpen.set(true);
  }

  executeDelete(): void {
    if (!this.memberToDelete || !this.memberToDelete.id) return;

    this.isDeleting.set(true);
    this.memberService.deleteMemberById(this.memberToDelete.id).subscribe({
      next: msg => {
        this.notificationService.success(msg || 'Member deleted successfully!');
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.memberToDelete = null;
        this.loadMembers();
      },
      error: () => {
        this.isDeleting.set(false);
      }
    });
  }
}
