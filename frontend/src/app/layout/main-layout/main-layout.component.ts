import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ToastNotificationComponent } from '../../shared/components/toast-notification/toast-notification.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent, ToastNotificationComponent],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <app-sidebar
        [isMobileOpen]="isMobileOpen()"
        (closeMobile)="isMobileOpen.set(false)">
      </app-sidebar>

      <!-- Main Content Container -->
      <div class="main-wrapper">
        <!-- Top Navbar -->
        <app-navbar
          (toggleMobile)="isMobileOpen.update(v => !v)">
        </app-navbar>

        <!-- Main Page View -->
        <main class="content-body p-3 p-lg-4">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Global Toasts -->
      <app-toast-notification></app-toast-notification>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
    }

    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      margin-left: var(--sidebar-width);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 991.98px) {
      .main-wrapper {
        margin-left: 0;
      }
    }

    .content-body {
      flex: 1;
      background-color: var(--app-bg);
    }
  `]
})
export class MainLayoutComponent {
  readonly isMobileOpen = signal<boolean>(false);
}
