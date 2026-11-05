import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - Library Management System'
      },
      {
        path: 'books',
        loadComponent: () => import('./features/books/book-list/book-list.component').then(m => m.BookListComponent),
        title: 'Books - Library Management System'
      },
      {
        path: 'members',
        loadComponent: () => import('./features/members/member-list/member-list.component').then(m => m.MemberListComponent),
        title: 'Members - Library Management System'
      },
      {
        path: 'issue-book',
        loadComponent: () => import('./features/issue-book/issue-book.component').then(m => m.IssueBookComponent),
        title: 'Issue Book - Library Management System'
      },
      {
        path: 'return-book',
        loadComponent: () => import('./features/return-book/return-book.component').then(m => m.ReturnBookComponent),
        title: 'Return Book - Library Management System'
      },
      {
        path: 'borrowing-history',
        loadComponent: () => import('./features/borrowing-history/borrowing-history.component').then(m => m.BorrowingHistoryComponent),
        title: 'Borrowing History - Library Management System'
      },
      {
        path: 'overdue-books',
        loadComponent: () => import('./features/overdue-books/overdue-books.component').then(m => m.OverdueBooksComponent),
        title: 'Overdue Books - Library Management System'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
