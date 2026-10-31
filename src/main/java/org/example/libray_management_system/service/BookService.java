package org.example.libray_management_system.service;

import org.example.libray_management_system.entity.Book;

import java.util.List;

public interface BookService {

    public boolean addBook(Book book);
    public List<Book> getAllBooks();
    public List<Book> getAllBooksByTitle(String title);
    public List<Book> getAllBooksByAuthor(String author);
    public List<Book> getAllBooksByCategory(String category);

    public boolean deleteBookById(long id);
    public int deleteByTitle(String title);
    public int deleteByAuthor(String author);

    public int updateById(long id, Book book);
    public int updateByTitle(String title, Book book);
    public int updateByAuthor(String author, Book book);

}
