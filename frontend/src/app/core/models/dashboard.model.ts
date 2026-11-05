import { BorrowRecord } from './borrow-record.model';

export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  totalBorrowRecords: number;
  currentlyIssued: number;
  returnedBooks: number;
  overdueBooks: number;
  totalCopies: number;
  availableCopies: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentRecords: BorrowRecord[];
  categoryDistribution: CategoryDistribution[];
}
