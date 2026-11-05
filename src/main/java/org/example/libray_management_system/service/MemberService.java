package org.example.libray_management_system.service;

import org.example.libray_management_system.entity.Member;

import java.util.List;

public interface MemberService {

    public boolean addMember(Member member);
    public List<Member> getMembers();
    public Member getMemberById(Long id);
    public List<Member> getMembersByName(String name);
    public List<Member> findByEmail(String email);
    public List<Member> findByPhone(String phone);

    public boolean deleteById(Long id);
    public boolean deleteByName(String name);

    public boolean updateById(Long id, Member member);
    public boolean updateByName(String name, Member member);
    public boolean updateByEmail(String email, Member member);
    public boolean updateByPhone(String phone, Member member);
}