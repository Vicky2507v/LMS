package org.example.libray_management_system.service;

import jakarta.transaction.Transactional;
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

        List<Book> li =  bookRepository.getAllBooksByTitle(title);

        return li;

    }

    public List<Book> getAllBooksByAuthor(String author) {

        if(author == null || author.isBlank()) {
            return List.of();
        }

        List<Book> li =  bookRepository.getAllBooksByAuthor(author);

        return li;
    }

    public List<Book> getAllBooksByCategory(String category) {

        if(category == null || category.isBlank()) {
            return List.of();
        }

        List<Book> li = bookRepository.getAllBooksByCategory(category);

        return li;

    }

    public boolean deleteBookById(long id) {

        if(!bookRepository.existsById(id)) {
            return false;
        } else {
            bookRepository.deleteById(id);
            return true;
        }
    }

    @Override
    @Transactional
    public int deleteByTitle(String title) {
        return bookRepository.deleteBooksByTitle(title);
    }

    @Override
    @Transactional
    public int deleteByAuthor(String author) {
        return bookRepository.deleteBooksByAuthor(author);
    }

    private boolean isValidBook(Book book) {
        return book != null
                && book.getTitle() != null && !book.getTitle().isBlank()
                && book.getAuthor() != null && !book.getAuthor().isBlank()
                && book.getCategory() != null && !book.getCategory().isBlank()
                && book.getTotalCopies() > 0
                && book.getAvailableCopies() >= 0
                && book.getAvailableCopies() <= book.getTotalCopies();
    }

    private void copyBookDetails(Book existingBook, Book updatedBook) {
        existingBook.setTitle(updatedBook.getTitle());
        existingBook.setAuthor(updatedBook.getAuthor());
        existingBook.setCategory(updatedBook.getCategory());
        existingBook.setTotalCopies(updatedBook.getTotalCopies());
        existingBook.setAvailableCopies(updatedBook.getAvailableCopies());
    }

    @Override
    @Transactional
    public int updateById(long id, Book book) {
        if (!isValidBook(book)) {
            return 0;
        }

        return bookRepository.findById(id)
                .map(existingBook -> {
                    copyBookDetails(existingBook, book);
                    bookRepository.save(existingBook);
                    return 1;
                })
                .orElse(0);
    }

    @Override
    @Transactional
    public int updateByTitle(String title, Book book) {
        if (title == null || title.isBlank() || !isValidBook(book)) {
            return 0;
        }

        List<Book> books = bookRepository.getAllBooksByTitle(title);

        books.forEach(existingBook -> copyBookDetails(existingBook, book));

        bookRepository.saveAll(books);
        return books.size();
    }

    @Override
    @Transactional
    public int updateByAuthor(String author, Book book) {
        if (author == null || author.isBlank() || !isValidBook(book)) {
            return 0;
        }

        List<Book> books = bookRepository.getAllBooksByAuthor(author);

        books.forEach(existingBook -> copyBookDetails(existingBook, book));

        bookRepository.saveAll(books);
        return books.size();
    }

}