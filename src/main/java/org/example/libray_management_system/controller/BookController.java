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
    public List<Book> getAllBooks() {

        return bookService.getAllBooks();

    }

    @GetMapping("/getBooksByTitle/{title}")
    public List<Book> getBooksByTitle(@PathVariable String title) {

        return bookService.getAllBooksByTitle(title);

    }

    @GetMapping("/getBooksByAuthor/{author}")
    public List<Book> getBooksByAuthor(@PathVariable String author) {

        return bookService.getAllBooksByAuthor(author);

    }

    @GetMapping("/getBooksByCategory/{category}")
    public List<Book> getAllBooksByCategory(@PathVariable String category) {

        return bookService.getAllBooksByCategory(category);

    }

    @DeleteMapping("/deleteById/{id}")
    public ResponseEntity<String> deleteBookById(@PathVariable long id) {

        boolean status = bookService.deleteBookById(id);

        if(status) {
            return ResponseEntity.status(HttpStatus.OK).body("Book deleted successfully");
        } else {
            return ResponseEntity.badRequest().body("Invalid Book copy details");
        }

    }

    @DeleteMapping("/deleteByTitle/{title}")
    public ResponseEntity<String> deleteByTitle(@PathVariable String title) {
        int deleteCount = bookService.deleteByTitle(title);

        if(deleteCount == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No book found with title: " + title);
        }

        return ResponseEntity.ok(deleteCount + " book(s) deleted successfully");
    }

    @DeleteMapping("/deleteByAuthor/{author}")
    public ResponseEntity<String> deleteByAuthor(@PathVariable String author) {
        int deleteCount = bookService.deleteByAuthor(author);

        if(deleteCount == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No book found with author: " + author);
        }

        return ResponseEntity.ok(deleteCount + " book(s) deleted successfully");

    }

    @PutMapping("/updateById/{id}")
    public ResponseEntity<String> updateBookById(@PathVariable long id, @RequestBody Book book) {

        int updated = bookService.updateById(id, book);

        if(updated == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Book not found with id: " + id);
        }

        return ResponseEntity.ok(" book(s) updated successfully");
    }

    @PutMapping("/updateByTitle/{title}")
    public ResponseEntity<String> updateBookByTitle(@PathVariable String title, @RequestBody Book book) {

        book.setTitle(title);

        int updated = bookService.updateByTitle(title, book);

        if(updated == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Book not found with title: " + title);
        }
        return ResponseEntity.ok(" book(s) updated successfully");

    }

    @PutMapping("/updateByAuthor/{author}")
    public ResponseEntity<String> updateBookByAuthor(@PathVariable String author, @RequestBody Book book) {

        book.setAuthor(author);

        int updated = bookService.updateByAuthor(author, book);

        if(updated == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Book not found with author: " + author);
        }
        return ResponseEntity.ok(" book(s) updated successfully");
    }

}