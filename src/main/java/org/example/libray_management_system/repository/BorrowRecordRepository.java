package org.example.libray_management_system.repository;

import org.example.libray_management_system.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByBook_Id(Long bookId);
    List<BorrowRecord> getBorrowRecordsByMemberId(Long memberId);
}