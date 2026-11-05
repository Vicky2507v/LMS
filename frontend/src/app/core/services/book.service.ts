import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.baseUrl}/getBooks`);
  }

  getBooksByTitle(title: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.baseUrl}/getBooksByTitle/${encodeURIComponent(title)}`);
  }

  getBooksByAuthor(author: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.baseUrl}/getBooksByAuthor/${encodeURIComponent(author)}`);
  }

  getBooksByCategory(category: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.baseUrl}/getBooksByCategory/${encodeURIComponent(category)}`);
  }

  addBook(book: Book): Observable<string> {
    return this.http.post(`${this.baseUrl}/books`, book, { responseType: 'text' });
  }

  updateBookById(id: number, book: Book): Observable<string> {
    return this.http.put(`${this.baseUrl}/updateById/${id}`, book, { responseType: 'text' });
  }

  updateBookByTitle(title: string, book: Book): Observable<string> {
    return this.http.put(`${this.baseUrl}/updateByTitle/${encodeURIComponent(title)}`, book, { responseType: 'text' });
  }

  updateBookByAuthor(author: string, book: Book): Observable<string> {
    return this.http.put(`${this.baseUrl}/updateByAuthor/${encodeURIComponent(author)}`, book, { responseType: 'text' });
  }

  deleteBookById(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteById/${id}`, { responseType: 'text' });
  }

  deleteBookByTitle(title: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteByTitle/${encodeURIComponent(title)}`, { responseType: 'text' });
  }

  deleteBookByAuthor(author: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteByAuthor/${encodeURIComponent(author)}`, { responseType: 'text' });
  }
}
