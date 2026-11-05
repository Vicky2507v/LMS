package org.example.libray_management_system.repository;

import org.example.libray_management_system.entity.BorrowRecord;
import org.example.libray_management_system.entity.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByBook_Id(Long bookId);
    List<BorrowRecord> getBorrowRecordsByMemberId(Long memberId);
    List<BorrowRecord> findByStatus(BorrowStatus status);
    List<BorrowRecord> findByStatusAndDueDateBefore(BorrowStatus status, LocalDate date);
}