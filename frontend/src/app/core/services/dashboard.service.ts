import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { BookService } from './book.service';
import { MemberService } from './member.service';
import { BorrowRecordService } from './borrow-record.service';
import { DashboardData, DashboardStats, CategoryDistribution } from '../models/dashboard.model';
import { Book } from '../models/book.model';
import { Member } from '../models/member.model';
import { BorrowRecord } from '../models/borrow-record.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly bookService = inject(BookService);
  private readonly memberService = inject(MemberService);
  private readonly borrowService = inject(BorrowRecordService);

  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      books: this.bookService.getAllBooks().pipe(catchError(() => of([] as Book[]))),
      members: this.memberService.getAllMembers().pipe(catchError(() => of([] as Member[]))),
      records: this.borrowService.getAllBorrowRecords().pipe(catchError(() => of([] as BorrowRecord[]))),
      issued: this.borrowService.getCurrentlyIssuedBooks().pipe(catchError(() => of([] as BorrowRecord[]))),
      returned: this.borrowService.getCurrentlyReturnedBooks().pipe(catchError(() => of([] as BorrowRecord[]))),
      overdue: this.borrowService.getOverdueBooks().pipe(catchError(() => of([] as BorrowRecord[])))
    }).pipe(
      map(data => {
        const totalCopies = data.books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
        const availableCopies = data.books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);

        // Calculate category distribution
        const categoryMap = new Map<string, number>();
        data.books.forEach(b => {
          if (b.category) {
            const count = categoryMap.get(b.category) || 0;
            categoryMap.set(b.category, count + 1);
          }
        });

        const categoryDistribution: CategoryDistribution[] = Array.from(categoryMap.entries()).map(
          ([category, count]) => ({ category, count })
        );

        // Sort recent records by issueDate descending
        const recentRecords = [...data.records]
          .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
          .slice(0, 7);

        const stats: DashboardStats = {
          totalBooks: data.books.length,
          totalMembers: data.members.length,
          totalBorrowRecords: data.records.length,
          currentlyIssued: data.issued.length,
          returnedBooks: data.returned.length,
          overdueBooks: data.overdue.length,
          totalCopies,
          availableCopies
        };

        return {
          stats,
          recentRecords,
          categoryDistribution
        };
      })
    );
  }
}
