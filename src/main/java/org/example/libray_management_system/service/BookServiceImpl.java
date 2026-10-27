package org.example.libray_management_system.service;

import org.example.libray_management_system.entity.Book;
import org.example.libray_management_system.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepository bookRepository;

    @Override
    public boolean addBook(Book book) {

        if(book.getTitle() == null || book.getTitle().isEmpty() == true ||
                book.getAuthor() == null || book.getAuthor().isEmpty() == true ||
                book.getCategory() == null || book.getCategory().isEmpty() == true ) {

            return false;

        }

        if (book.getTotalCopies() <= 0 ||
                book.getAvailableCopies() < 0 ||
                book.getAvailableCopies() > book.getTotalCopies()) {

            System.out.println("Invalid book copy details");
            return false;
        }


        bookRepository.save(book);
        return true;
    }

    @Override
    public List<Book> getAllBooks() {

        List<Book> li = bookRepository.findAll();
        return li;

    }

    public List<Book> getAllBooksByTitle(String title) {

        if(title == null || title.isBlank()) {
            return List.of();
        }

        return bookRepository.getAllBooksByTitle(title);

    }

}