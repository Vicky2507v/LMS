package org.example.libray_management_system.repository;

import jakarta.transaction.Transactional;
import org.example.libray_management_system.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    public List<Book> getAllBooksByTitle(String title);
    public List<Book> getAllBooksByAuthor(String author);
    public List<Book> getAllBooksByCategory(String category);

    @Modifying
    @Transactional
    @Query("DELETE FROM Book b WHERE b.title = :title")
    int deleteBooksByTitle(@Param("title") String title);

    @Modifying
    @Transactional
    @Query("DELETE FROM Book b WHERE b.author = :author")
    int deleteBooksByAuthor(@Param("author") String author);

    List<Book> findAllByAuthor(String author);
    List<Book> findAllByCategory(String category);
}
