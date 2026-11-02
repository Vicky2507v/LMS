package org.example.libray_management_system.service;

public interface BorrowRecordService {

    boolean issueBook(Long memberId, Long bookId);
    boolean returnBook(Long borrowRecordId);
}
