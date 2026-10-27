package org.example.libray_management_system.service;

import org.example.libray_management_system.entity.Book;

import java.util.List;

public interface BookService {

    public boolean addBook(Book book);
    public List<Book> getAllBooks();
    public List<Book> getAllBooksByTitle(String title);

}
