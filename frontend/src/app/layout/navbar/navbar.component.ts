import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="top-navbar d-flex align-items-center justify-content-between px-3 px-lg-4 border-bottom">
      <div class="d-flex align-items-center gap-3">
        <!-- Mobile Toggle Button -->
        <button
          type="button"
          class="btn btn-light d-lg-none p-2 border-0"
          aria-label="Toggle navigation drawer"
          (click)="toggleMobile.emit()">
          <i class="bi bi-list fs-4"></i>
        </button>

        <!-- Current Route Title -->
        <div>
          <h1 class="page-title mb-0 fs-5 fw-bold text-dark">{{ currentTitle }}</h1>
          <div class="page-breadcrumb text-secondary small d-none d-sm-block">{{ currentBreadcrumb }}</div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="d-flex align-items-center gap-2">
        <a routerLink="/issue-book" class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm">
          <i class="bi bi-arrow-up-right-circle"></i>
          <span class="d-none d-sm-inline">Issue Book</span>
        </a>
        <a routerLink="/books" class="btn btn-sm btn-outline-secondary d-none d-md-flex align-items-center gap-1">
          <i class="bi bi-book"></i>
          <span>Catalog</span>
        </a>
      </div>
    </header>
  `,
  styles: [`
    .top-navbar {
      height: var(--navbar-height);
      background-color: var(--app-surface);
      position: sticky;
      top: 0;
      z-index: 1020;
      box-shadow: var(--shadow-sm);
    }
    .page-title {
      letter-spacing: -0.01em;
    }
  `]
})
export class NavbarComponent {
  private readonly router = inject(Router);

  @Output() toggleMobile = new EventEmitter<void>();

  currentTitle: string = 'Dashboard';
  currentBreadcrumb: string = 'Overview';

  constructor() {
    this.updateRouteInfo(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateRouteInfo(event.urlAfterRedirects || event.url);
      });
  }

  private updateRouteInfo(url: string): void {
    if (url.includes('/dashboard')) {
      this.currentTitle = 'Dashboard';
      this.currentBreadcrumb = 'Overview & Metrics';
    } else if (url.includes('/books')) {
      this.currentTitle = 'Book Management';
      this.currentBreadcrumb = 'Catalog / Books';
    } else if (url.includes('/members')) {
      this.currentTitle = 'Member Management';
      this.currentBreadcrumb = 'People / Members';
    } else if (url.includes('/issue-book')) {
      this.currentTitle = 'Issue Book';
      this.currentBreadcrumb = 'Circulation / Issue Book';
    } else if (url.includes('/return-book')) {
      this.currentTitle = 'Return Book';
      this.currentBreadcrumb = 'Circulation / Return Book';
    } else if (url.includes('/borrowing-history')) {
      this.currentTitle = 'Borrowing History';
      this.currentBreadcrumb = 'Circulation / History & Logs';
    } else if (url.includes('/overdue-books')) {
      this.currentTitle = 'Overdue Books';
      this.currentBreadcrumb = 'Circulation / Delinquent Records';
    } else {
      this.currentTitle = 'Library Management';
      this.currentBreadcrumb = 'Overview';
    }
  }
}
