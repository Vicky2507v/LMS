package org.example.libray_management_system.controller;

import org.example.libray_management_system.service.BorrowRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

}