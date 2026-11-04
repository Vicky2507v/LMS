import { Book } from './book.model';
import { Member } from './member.model';

export type BorrowStatus = 'ISSUED' | 'RETURNED';

export interface BorrowRecord {
  id?: number;
  member: Member;
  book: Book;
  issueDate: string;
  dueDate: string;
  returnedDate?: string | null;
  status: BorrowStatus;
}
