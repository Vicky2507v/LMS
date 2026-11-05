import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Backdrop -->
    @if (isMobileOpen) {
      <div class="sidebar-backdrop d-lg-none" (click)="closeMobile.emit()"></div>
    }

    <aside class="sidebar d-flex flex-column" [class.mobile-open]="isMobileOpen">
      <!-- Brand Header -->
      <div class="sidebar-header d-flex align-items-center justify-content-between px-3 py-3 border-bottom border-dark-subtle">
        <a routerLink="/dashboard" class="d-flex align-items-center gap-2 text-decoration-none" (click)="onNavClick()">
          <div class="brand-icon">
            <i class="bi bi-book-half"></i>
          </div>
          <div>
            <div class="brand-title">LibManager</div>
            <div class="brand-subtitle">Library SaaS System</div>
          </div>
        </a>
        <button
          type="button"
          class="btn btn-sm btn-link text-white-50 d-lg-none p-0"
          aria-label="Close Sidebar"
          (click)="closeMobile.emit()">
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="sidebar-menu flex-grow-1 py-3 px-2">
        <div class="menu-section-header px-3 mb-2 text-uppercase">Overview</div>
        <ul class="nav flex-column mb-3">
          <li class="nav-item">
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-link"
              (click)="onNavClick()">
              <i class="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </a>
          </li>
        </ul>

        <div class="menu-section-header px-3 mb-2 text-uppercase">Catalog & People</div>
        <ul class="nav flex-column mb-3">
          <li class="nav-item">
            <a
              routerLink="/books"
              routerLinkActive="active"
              class="nav-link"
              (click)="onNavClick()">
              <i class="bi bi-journal-bookmark"></i>
              <span>Books</span>
            </a>
          </li>
          <li class="nav-item">
            <a
              routerLink="/members"
              routerLinkActive="active"
              class="nav-link"
              (click)="onNavClick()">
              <i class="bi bi-people"></i>
              <span>Members</span>
            </a>
          </li>
        </ul>

        <div class="menu-section-header px-3 mb-2 text-uppercase">Circulation</div>
        <ul class="nav flex-column mb-3">
          <li class="nav-item">
            <a
              routerLink="/issue-book"
              routerLinkActive="active"
              class="nav-link"
              (click)="onNavClick()">
              <i class="bi bi-arrow-up-right-circle"></i>
              <span>Issue Book</span>
            </a>
          </li>
          <li class="nav-item">
            <a
              routerLink="/return-book"
              routerLinkActive="active"
              class="nav-link"
              (click)="onNavClick()">
              <i class="bi bi-arrow-down-left-circle"></i>
              <span>Return Book</span>
            </a>
          </li>
          <li class="nav-item">
            <a
              routerLink="/borrowing-history"
              routerLinkActive="active"
              class="nav-link"
              (click)="onNavClick()">
              <i class="bi bi-clock-history"></i>
              <span>Borrowing History</span>
            </a>
          </li>
          <li class="nav-item">
            <a
              routerLink="/overdue-books"
              routerLinkActive="active"
              class="nav-link nav-link-danger"
              (click)="onNavClick()">
              <i class="bi bi-exclamation-triangle"></i>
              <span>Overdue Books</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Footer Info -->
      <div class="sidebar-footer p-3 border-top border-dark-subtle">
        <div class="d-flex align-items-center gap-2 text-white-50 small">
          <span class="status-indicator"></span>
          <span>Spring Boot: :8585</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background-color: var(--app-primary);
      color: #ffffff;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1040;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 991.98px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }

    .sidebar-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      z-index: 1035;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, var(--app-accent), #818cf8);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 1.25rem;
    }

    .brand-title {
      font-weight: 700;
      font-size: 1.1rem;
      color: #ffffff;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .menu-section-header {
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      color: #94a3b8;
      font-weight: 600;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1rem;
      color: #cbd5e1;
      font-size: 0.9rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: all 0.15s ease;
      margin-bottom: 0.15rem;
    }

    .nav-link i {
      font-size: 1.1rem;
      color: #94a3b8;
      transition: color 0.15s ease;
    }

    .nav-link:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.07);
    }

    .nav-link:hover i {
      color: #ffffff;
    }

    .nav-link.active {
      color: #ffffff;
      background-color: var(--app-accent);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }

    .nav-link.active i {
      color: #ffffff;
    }

    .nav-link-danger.active {
      background-color: var(--app-danger);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--app-success);
      display: inline-block;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
    }
  `]
})
export class SidebarComponent {
  @Input() isMobileOpen: boolean = false;
  @Output() closeMobile = new EventEmitter<void>();

  onNavClick(): void {
    if (this.isMobileOpen) {
      this.closeMobile.emit();
    }
  }
}
