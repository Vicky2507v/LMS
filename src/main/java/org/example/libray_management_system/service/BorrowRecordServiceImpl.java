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

import java.time.LocalDate;
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

        if(existingBook.getAvailableCopies()<=0) {
            return false;
        }

        existingBook.setAvailableCopies(existingBook.getAvailableCopies() - 1);

        BorrowRecord record = new BorrowRecord();

        record.setMember(existingMember);
        record.setBook(existingBook);
        record.setIssueDate(LocalDate.now());
        record.setIssueDate(LocalDate.now().plusDays(14));
        record.setReturnedDate(null);
        record.setStatus(BorrowStatus.ISSUED);

        bookRepository.save(existingBook);
        borrowRecordRepository.save(record);

        return true;

    }

    @Override
    public boolean returnBook(Long borrowRecordId) {
        return false;
    }
}
