import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { BorrowRecordService } from '../../core/services/borrow-record.service';
import { NotificationService } from '../../core/services/notification.service';
import { DashboardData } from '../../core/models/dashboard.model';
import { BorrowRecord } from '../../core/models/borrow-record.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { DaysOverduePipe } from '../../shared/pipes/days-overdue.pipe';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    DaysOverduePipe
  ],
  template: `
    <div class="dashboard-page">
      <!-- Header with Refresh & Quick Actions -->
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Library Overview</h2>
          <p class="text-secondary small mb-0">Real-time metrics, circulation stats, and catalog inventory.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            [disabled]="isLoading()"
            (click)="loadDashboard()">
            <i class="bi bi-arrow-clockwise" [class.spin-icon]="isLoading()"></i>
            <span>Refresh</span>
          </button>
          <a routerLink="/issue-book" class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm">
            <i class="bi bi-plus-lg"></i>
            <span>Issue Book</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Calculating dashboard statistics..."></app-loading-spinner>
      } @else if (dashboardData()) {
        <!-- Metric Summary Cards Grid -->
        <div class="row g-3 mb-4">
          <!-- Total Books -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card">
              <div>
                <div class="text-secondary small fw-medium mb-1">Total Books (Titles)</div>
                <div class="h3 fw-bold text-dark mb-1">{{ dashboardData()!.stats.totalBooks }}</div>
                <div class="text-secondary small">
                  <span class="text-primary fw-semibold">{{ dashboardData()!.stats.totalCopies }}</span> total copies
                </div>
              </div>
              <div class="stat-icon" style="background-color: #e0e7ff; color: #4338ca;">
                <i class="bi bi-journal-album"></i>
              </div>
            </div>
          </div>

          <!-- Available Copies -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card">
              <div>
                <div class="text-secondary small fw-medium mb-1">Available Copies</div>
                <div class="h3 fw-bold text-dark mb-1">{{ dashboardData()!.stats.availableCopies }}</div>
                <div class="text-secondary small">
                  @if (dashboardData()!.stats.totalCopies > 0) {
                    <span class="text-success fw-semibold">
                      {{ (dashboardData()!.stats.availableCopies / dashboardData()!.stats.totalCopies * 100) | number:'1.0-0' }}%
                    </span> in library
                  } @else {
                    <span>No inventory</span>
                  }
                </div>
              </div>
              <div class="stat-icon" style="background-color: #ecfdf5; color: #059669;">
                <i class="bi bi-check2-circle"></i>
              </div>
            </div>
          </div>

          <!-- Total Members -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card">
              <div>
                <div class="text-secondary small fw-medium mb-1">Registered Members</div>
                <div class="h3 fw-bold text-dark mb-1">{{ dashboardData()!.stats.totalMembers }}</div>
                <div class="text-secondary small">Active borrowers</div>
              </div>
              <div class="stat-icon" style="background-color: #f0fdf4; color: #16a34a;">
                <i class="bi bi-people-fill"></i>
              </div>
            </div>
          </div>

          <!-- Total Borrow Records -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card">
              <div>
                <div class="text-secondary small fw-medium mb-1">Total Borrow Logs</div>
                <div class="h3 fw-bold text-dark mb-1">{{ dashboardData()!.stats.totalBorrowRecords }}</div>
                <div class="text-secondary small">Lifetime circulation records</div>
              </div>
              <div class="stat-icon" style="background-color: #f1f5f9; color: #475569;">
                <i class="bi bi-clock-history"></i>
              </div>
            </div>
          </div>

          <!-- Currently Issued -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="stat-card border-start border-primary border-3">
              <div>
                <div class="text-secondary small fw-medium mb-1">Currently Issued</div>
                <div class="h3 fw-bold text-primary mb-1">{{ dashboardData()!.stats.currentlyIssued }}</div>
                <div class="text-secondary small">Books with members right now</div>
              </div>
              <div class="stat-icon" style="background-color: #dbeafe; color: #1d4ed8;">
                <i class="bi bi-arrow-up-right-circle"></i>
              </div>
            </div>
          </div>

          <!-- Returned Books -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="stat-card border-start border-success border-3">
              <div>
                <div class="text-secondary small fw-medium mb-1">Returned Books</div>
                <div class="h3 fw-bold text-success mb-1">{{ dashboardData()!.stats.returnedBooks }}</div>
                <div class="text-secondary small">Successfully completed loans</div>
              </div>
              <div class="stat-icon" style="background-color: #dcfce7; color: #15803d;">
                <i class="bi bi-arrow-down-left-circle"></i>
              </div>
            </div>
          </div>

          <!-- Overdue Books -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="stat-card border-start border-danger border-3">
              <div>
                <div class="text-secondary small fw-medium mb-1">Overdue Records</div>
                <div class="h3 fw-bold text-danger mb-1">{{ dashboardData()!.stats.overdueBooks }}</div>
                <div class="text-danger small fw-medium">
                  @if (dashboardData()!.stats.overdueBooks > 0) {
                    <span>Action required</span>
                  } @else {
                    <span class="text-success">No overdue loans</span>
                  }
                </div>
              </div>
              <div class="stat-icon" style="background-color: #fee2e2; color: #dc2626;">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Action Shortcuts Panel -->
        <div class="card-saas p-3 mb-4 bg-light-subtle">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-lightning-charge-fill text-warning fs-5"></i>
              <span class="fw-semibold text-dark">Quick Operations:</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <a routerLink="/books" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                <i class="bi bi-plus-circle"></i> Add Book
              </a>
              <a routerLink="/members" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                <i class="bi bi-person-plus"></i> Add Member
              </a>
              <a routerLink="/issue-book" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                <i class="bi bi-arrow-up-right"></i> Issue Book
              </a>
              <a routerLink="/return-book" class="btn btn-sm btn-outline-success d-flex align-items-center gap-1">
                <i class="bi bi-arrow-down-left"></i> Return Book
              </a>
              @if (dashboardData()!.stats.overdueBooks > 0) {
                <a routerLink="/overdue-books" class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                  <i class="bi bi-bell"></i> Overdue ({{ dashboardData()!.stats.overdueBooks }})
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row g-4 mb-4">
          <!-- Status Distribution Chart -->
          <div class="col-12 col-lg-6">
            <div class="card-saas h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span><i class="bi bi-pie-chart me-2 text-primary"></i>Circulation Status</span>
                <span class="badge bg-light text-secondary border">Issued vs Returned</span>
              </div>
              <div class="card-body d-flex flex-column align-items-center justify-content-center" style="min-height: 280px;">
                @if (dashboardData()!.stats.totalBorrowRecords === 0) {
                  <app-empty-state
                    icon="bi bi-pie-chart"
                    title="No borrowing activity yet"
                    description="Issue books to see circulation analytics.">
                  </app-empty-state>
                } @else {
                  <div class="chart-wrapper w-100" style="max-height: 240px; position: relative;">
                    <canvas #statusChartCanvas></canvas>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Category Distribution Chart -->
          <div class="col-12 col-lg-6">
            <div class="card-saas h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span><i class="bi bi-bar-chart-fill me-2 text-primary"></i>Catalog by Category</span>
                <span class="badge bg-light text-secondary border">{{ dashboardData()!.categoryDistribution.length }} Categories</span>
              </div>
              <div class="card-body d-flex flex-column align-items-center justify-content-center" style="min-height: 280px;">
                @if (dashboardData()!.categoryDistribution.length === 0) {
                  <app-empty-state
                    icon="bi bi-tags"
                    title="No category data"
                    description="Add books with categories to view category distribution.">
                  </app-empty-state>
                } @else {
                  <div class="chart-wrapper w-100" style="max-height: 240px; position: relative;">
                    <canvas #categoryChartCanvas></canvas>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Borrowing Activity Table -->
        <div class="card-saas">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="bi bi-activity me-2 text-primary"></i>Recent Borrowing Activity</span>
            <a routerLink="/borrowing-history" class="btn btn-sm btn-link text-decoration-none">View All History &rarr;</a>
          </div>
          <div class="card-body p-0">
            @if (dashboardData()!.recentRecords.length === 0) {
              <app-empty-state
                icon="bi bi-inbox"
                title="No recent borrowing activity"
                description="Borrowing transactions will show up here as books are issued."
                actionLabel="Issue First Book"
                actionIcon="bi bi-plus-lg"
                (actionClick)="navigateTo('/issue-book')">
              </app-empty-state>
            } @else {
              <div class="table-responsive">
                <table class="table table-saas align-middle">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Book</th>
                      <th>Member</th>
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th class="text-end">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (record of dashboardData()!.recentRecords; track record.id) {
                      <tr>
                        <td>
                          <span class="badge bg-light text-dark border fw-mono">#{{ record.id }}</span>
                        </td>
                        <td>
                          <div class="fw-semibold text-dark">{{ record.book.title }}</div>
                          <div class="text-secondary small">{{ record.book.author }}</div>
                        </td>
                        <td>
                          <div class="fw-medium text-dark">{{ record.member.name }}</div>
                          <div class="text-secondary small">{{ record.member.email }}</div>
                        </td>
                        <td class="text-nowrap">{{ record.issueDate }}</td>
                        <td class="text-nowrap">
                          {{ record.dueDate }}
                          @if (record.status === 'ISSUED' && (record.dueDate | daysOverdue) > 0) {
                            <span class="badge bg-danger-subtle text-danger ms-1">
                              {{ record.dueDate | daysOverdue }}d late
                            </span>
                          }
                        </td>
                        <td>
                          <app-status-badge [status]="record.status === 'ISSUED' && (record.dueDate | daysOverdue) > 0 ? 'OVERDUE' : record.status"></app-status-badge>
                        </td>
                        <td class="text-end">
                          @if (record.status === 'ISSUED') {
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-success"
                              (click)="confirmReturn(record)">
                              <i class="bi bi-arrow-down-left me-1"></i> Return
                            </button>
                          } @else {
                            <span class="text-muted small">Returned on {{ record.returnedDate }}</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
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
        [isLoading]="isReturning()"
        (confirm)="executeReturn()"
        (cancel)="isReturnModalOpen.set(false)">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .spin-icon {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    .chart-wrapper {
      position: relative;
      height: 240px;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly borrowService = inject(BorrowRecordService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal<boolean>(true);
  readonly dashboardData = signal<DashboardData | null>(null);

  // Return modal state
  readonly isReturnModalOpen = signal<boolean>(false);
  readonly isReturning = signal<boolean>(false);
  private recordToReturn: BorrowRecord | null = null;
  returnModalMessage: string = '';

  @ViewChild('statusChartCanvas') statusChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChartCanvas') categoryChartCanvas?: ElementRef<HTMLCanvasElement>;

  private statusChartInstance?: Chart;
  private categoryChartInstance?: Chart;

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.destroyCharts();

    this.dashboardService.getDashboardData().subscribe({
      next: data => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
        // Initialize charts on next tick when canvas elements are rendered
        setTimeout(() => this.renderCharts(data), 50);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  confirmReturn(record: BorrowRecord): void {
    this.recordToReturn = record;
    this.returnModalMessage = `Return "${record.book.title}" borrowed by ${record.member.name}? The backend will automatically mark it as RETURNED and increment available copies.`;
    this.isReturnModalOpen.set(true);
  }

  executeReturn(): void {
    if (!this.recordToReturn || !this.recordToReturn.id) return;

    this.isReturning.set(true);
    this.borrowService.returnBook(this.recordToReturn.id).subscribe({
      next: responseMsg => {
        this.notificationService.success(responseMsg || 'Book returned successfully!');
        this.isReturning.set(false);
        this.isReturnModalOpen.set(false);
        this.recordToReturn = null;
        this.loadDashboard();
      },
      error: () => {
        this.isReturning.set(false);
      }
    });
  }

  navigateTo(path: string): void {
    window.location.href = path;
  }

  private renderCharts(data: DashboardData): void {
    // 1. Circulation Status Doughnut Chart
    if (this.statusChartCanvas && data.stats.totalBorrowRecords > 0) {
      const ctx = this.statusChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.statusChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Currently Issued', 'Returned', 'Overdue'],
            datasets: [{
              data: [
                Math.max(0, data.stats.currentlyIssued - data.stats.overdueBooks),
                data.stats.returnedBooks,
                data.stats.overdueBooks
              ],
              backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { boxWidth: 12, padding: 14 }
              }
            },
            cutout: '65%'
          }
        });
      }
    }

    // 2. Category Distribution Bar Chart
    if (this.categoryChartCanvas && data.categoryDistribution.length > 0) {
      const ctx = this.categoryChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const sortedCats = [...data.categoryDistribution].sort((a, b) => b.count - a.count).slice(0, 6);
        this.categoryChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: sortedCats.map(c => c.category),
            datasets: [{
              label: 'Book Titles',
              data: sortedCats.map(c => c.count),
              backgroundColor: '#6366f1',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
              },
              x: {
                grid: { display: false }
              }
            }
          }
        });
      }
    }
  }

  private destroyCharts(): void {
    if (this.statusChartInstance) {
      this.statusChartInstance.destroy();
      this.statusChartInstance = undefined;
    }
    if (this.categoryChartInstance) {
      this.categoryChartInstance.destroy();
      this.categoryChartInstance = undefined;
    }
  }
}
