package org.example.libray_management_system.service;

import org.example.libray_management_system.entity.BorrowRecord;

import java.util.List;

public interface BorrowRecordService {

    boolean issueBook(Long memberId, Long bookId);
    boolean returnBook(Long borrowRecordId);
    List<BorrowRecord> getAllBorrowRecord();
    List<BorrowRecord> getAllBorrowRecordByMemberId(Long memberId);
    List<BorrowRecord> getBorrowRecordsByBookId(Long bookId);
    List<BorrowRecord> getCurrentIssuedBooks();
    List<BorrowRecord> getCurrentReturnedBooks();
    List<BorrowRecord> getOverdueBooks();
//    List<BorrowRecord> getOverdueReturnedBooks();
}