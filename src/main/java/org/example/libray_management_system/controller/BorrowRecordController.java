package org.example.libray_management_system.controller;

import org.example.libray_management_system.entity.BorrowRecord;
import org.example.libray_management_system.entity.BorrowStatus;
import org.example.libray_management_system.service.BorrowRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/borrow")
public class BorrowRecordController {

    @Autowired
    private BorrowRecordService borrowRecordService;

    @PostMapping("/issueBook")
    public ResponseEntity<String> issueBook(@RequestParam Long memberId, @RequestParam Long bookId) {

        boolean status = borrowRecordService.issueBook(memberId, bookId);

        if(status) {
            return ResponseEntity.ok("Book issued successfully");
        } else {
            return ResponseEntity.badRequest().body("Book could not be issued. Check member, book and availability.");
        }
    }

    @PostMapping("/returnBook/{borrowRecordId}")
    public ResponseEntity<String> returnBook(@PathVariable Long borrowRecordId) {

        System.out.println("Borrow Id: "+borrowRecordId);

        boolean status = borrowRecordService.returnBook(borrowRecordId);

        System.out.println("API Status: "+status);

        if (status) {
            return ResponseEntity.ok("Book returned successfully!");
        } else {
            return ResponseEntity.badRequest().body("Book could not be returned. Check borrowing record and its status.");
        }
    }

    @GetMapping("/allBorrowRecords")
    public ResponseEntity<List<BorrowRecord>> getAllBorrowRecord() {
        List<BorrowRecord> list = borrowRecordService.getAllBorrowRecord();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/getBorrowRecordsByMember/{memberId}")
    public ResponseEntity<List<BorrowRecord>> getAllBorrowRecordByMemberId(@PathVariable Long memberId) {
        List<BorrowRecord> records = borrowRecordService.getAllBorrowRecordByMemberId(memberId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/getBorrowRecordsByBook/{bookId}")
    public ResponseEntity<List<BorrowRecord>> getAllBorrowRecordByBookId(@PathVariable Long bookId) {
        List<BorrowRecord> records = borrowRecordService.getBorrowRecordsByBookId(bookId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/getCurrentlyIssuedBook")
    public ResponseEntity<List<BorrowRecord>> getCurrentlyIssuedBook() {

        List<BorrowRecord> records = borrowRecordService.getCurrentIssuedBooks();

        return ResponseEntity.ok(records);
    }

    @GetMapping("/getCurrentlyReturnedBook")
    public ResponseEntity<List<BorrowRecord>> getCurrentReturnedBooks() {

        List<BorrowRecord> records = borrowRecordService.getCurrentReturnedBooks();

        return ResponseEntity.ok(records);
    }

    @GetMapping("/getOverdueBooks")
    public ResponseEntity<List<BorrowRecord>> getOverdueBooks() {

        List<BorrowRecord> records = borrowRecordService.getOverdueBooks();

        return ResponseEntity.ok(records);
    }
}