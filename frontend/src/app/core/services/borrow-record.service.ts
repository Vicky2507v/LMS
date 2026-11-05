import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BorrowRecord } from '../models/borrow-record.model';
import { SpringPage } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class BorrowRecordService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  issueBook(memberId: number, bookId: number): Observable<string> {
    const params = new HttpParams()
      .set('memberId', memberId.toString())
      .set('bookId', bookId.toString());

    return this.http.post(`${this.baseUrl}/borrow/issueBook`, null, {
      params,
      responseType: 'text'
    });
  }

  returnBook(borrowRecordId: number): Observable<string> {
    return this.http.post(`${this.baseUrl}/borrow/returnBook/${borrowRecordId}`, null, {
      responseType: 'text'
    });
  }

  getAllBorrowRecords(): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.baseUrl}/borrow/allBorrowRecords`);
  }

  getBorrowRecordsByMember(memberId: number): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.baseUrl}/borrow/getBorrowRecordsByMember/${memberId}`);
  }

  getBorrowRecordsByBook(bookId: number): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.baseUrl}/borrow/getBorrowRecordsByBook/${bookId}`);
  }

  getCurrentlyIssuedBooks(): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.baseUrl}/borrow/getCurrentlyIssuedBook`);
  }

  getCurrentlyReturnedBooks(): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.baseUrl}/borrow/getCurrentlyReturnedBook`);
  }

  getOverdueBooks(): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.baseUrl}/borrow/getOverdueBooks`);
  }

  getBorrowingHistory(
    page: number = 0,
    size: number = 5,
    sortBy: string = 'issueDate',
    direction: string = 'desc'
  ): Observable<SpringPage<BorrowRecord>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<SpringPage<BorrowRecord>>(`${this.baseUrl}/borrow/history`, { params });
  }
}
