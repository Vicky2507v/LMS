package org.example.libray_management_system.service;

import org.example.libray_management_system.entity.Book;
import org.example.libray_management_system.entity.BorrowRecord;
import org.example.libray_management_system.entity.BorrowStatus;
import org.example.libray_management_system.entity.Member;
import org.example.libray_management_system.repository.BookRepository;
import org.example.libray_management_system.repository.BorrowRecordRepository;
import org.example.libray_management_system.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BorrowRecordServiceImpl implements BorrowRecordService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private BookRepository bookRepository;

    @Override
    public boolean issueBook(Long memberId, Long bookId) {

        Optional<Book> optionalBook = bookRepository.findById(bookId);

        if(optionalBook.isEmpty()) {
            return false;
        }

        Optional<Member> optionalMember = memberRepository.findById(memberId);

        if(optionalMember.isEmpty()) {
            return false;
        }

        Member existingMember = optionalMember.get();
        Book existingBook = optionalBook.get();

        if(existingBook.getAvailableCopies() <= 0) {
            return false;
        }

        existingBook.setAvailableCopies(existingBook.getAvailableCopies() - 1);

        BorrowRecord record = new BorrowRecord();

        record.setMember(existingMember);
        record.setBook(existingBook);
        record.setIssueDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(14));
        record.setReturnedDate(null);
        record.setStatus(BorrowStatus.ISSUED);

        bookRepository.save(existingBook);
        borrowRecordRepository.save(record);

        return true;

    }

    @Override
    @Transactional
    public boolean returnBook(Long borrowRecordId) {

        System.out.println("Return method started for ID: " + borrowRecordId);

        // 1. find the borrowing record
        Optional<BorrowRecord> optionalRecord = borrowRecordRepository.findById(borrowRecordId);

        // 2. check whether the record exists
        if(optionalRecord.isEmpty()) {
            return false;
        }

        // 3. record exists
        BorrowRecord existingRecord = optionalRecord.get();

        // 4. check whether book already returned
        if(existingRecord.getStatus() == BorrowStatus.RETURNED) {
            return false;
        }

        Book existingBook = existingRecord.getBook();

        existingRecord.setStatus(BorrowStatus.RETURNED);
        existingRecord.setReturnedDate(LocalDate.now());

        existingBook.setAvailableCopies(
                existingBook.getAvailableCopies() + 1
        );

        System.out.println("Before saving: " + existingRecord.getStatus());

        bookRepository.save(existingBook);
        borrowRecordRepository.save(existingRecord);

        System.out.println("After saving: " + existingRecord.getStatus());

        return true;
    }

    @Override
    public List<BorrowRecord> getAllBorrowRecord() {

        List<BorrowRecord> list = borrowRecordRepository.findAll();

        return list;
    }

    @Override
    public List<BorrowRecord> getAllBorrowRecordByMemberId(Long memberId) {
        List<BorrowRecord> records = borrowRecordRepository.getBorrowRecordsByMemberId(memberId);
        return records;
    }

    public List<BorrowRecord> getBorrowRecordsByBookId(Long bookId) {
        return borrowRecordRepository.findByBook_Id(bookId);
    }

    public List<BorrowRecord> getCurrentIssuedBooks() {
        return borrowRecordRepository.findByStatus(BorrowStatus.ISSUED);
    }

    public List<BorrowRecord> getCurrentReturnedBooks() {
        return borrowRecordRepository.findByStatus(BorrowStatus.RETURNED);
    }

    public List<BorrowRecord> getOverdueBooks() {
        return borrowRecordRepository.findByStatusAndDueDateBefore(BorrowStatus.ISSUED, LocalDate.now());
    }

}