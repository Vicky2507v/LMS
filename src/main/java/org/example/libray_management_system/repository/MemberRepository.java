package org.example.libray_management_system.repository;

import org.example.libray_management_system.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member,Long> {

    public List<Member> getMembersByName(String name);
    public List<Member> findByEmail(String email);
    public List<Member> findByPhone(String phone);
    public List<Member> findByName(String email);

    @Query("DELETE FROM Member m WHERE m.name = :name")
    @Modifying
    public int deleteByName(@Param("name") String name);
}