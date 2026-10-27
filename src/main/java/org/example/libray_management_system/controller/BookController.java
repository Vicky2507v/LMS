package org.example.libray_management_system.controller;

import org.example.libray_management_system.entity.Book;
import org.example.libray_management_system.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BookController {

    @Autowired
    private BookService bookService;

    @PostMapping("/books")
    public ResponseEntity<String> addNewBook(@RequestBody Book book) {

        boolean status = bookService.addBook(book);

        if(status) {
            return ResponseEntity.status(HttpStatus.CREATED).body("Book added successfully");
        }

        return ResponseEntity.badRequest().body("Invalid Book copy details");

    }

    @GetMapping("/getBooks")
    List<Book> getAllBooks() {

        return bookService.getAllBooks();

    }

    @GetMapping("/getBooksByTitle/{title}")
    List<Book> getBooksByTitle(@PathVariable String title) {

        return bookService.getAllBooksByTitle(title);

    }

}