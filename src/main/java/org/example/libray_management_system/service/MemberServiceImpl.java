package org.example.libray_management_system.service;

import org.example.libray_management_system.entity.Member;
import org.example.libray_management_system.exception.MemberNotFoundException;
import org.example.libray_management_system.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;
import java.util.Optional;

@Service
public class MemberServiceImpl implements MemberService {

    @Autowired
    private MemberRepository memberRepository;

    public boolean addMember(Member member) {

        if(member.getName() == null || member.getPhone()==null || member.getEmail() == null ||
                member.getName().isEmpty()) {
            return false;
        }

        else if(member.getPhone().length()!=10 || ! member.getEmail().contains("@")) {
            return false;
        }

        memberRepository.save(member);
        return true;
    }

    public List<Member> getMembers() {
        List<Member> li = memberRepository.findAll();
        return li;
    }

    public Member getMemberById(Long id) {
        Optional<Member> member = memberRepository.findById(id);

        if (member.isEmpty()) {
            throw new MemberNotFoundException(
                    "Member not found with id: " + id
            );
        }

        return member.get();
    }

    @Override
    public List<Member> getMembersByName(String name) {

        if(name == null || name.isBlank()) {
            return List.of();
        }

        return memberRepository.getMembersByName(name);

    }

    @Override
    public List<Member> findByEmail(String email) {

        if(email == null || email.isBlank()) {
            return List.of();
        }

        return memberRepository.findByEmail(email);
    }

    public List<Member> findByPhone(String phone) {

        if(phone == null || phone.isBlank()) {
            return List.of();
        }
        return memberRepository.findByPhone(phone);
    }

    public boolean deleteById(Long id) {

        if (!memberRepository.existsById(id)) {
            return false;
        }

        memberRepository.deleteById(id);
        return true;

    }

    @Transactional
    public boolean deleteByName(String name) {

        if(name == null || name.isBlank()) {
            return false;
        }

        int deleteCount = memberRepository.deleteByName(name);
        return deleteCount > 0;
    }

    @Override
    public boolean updateById(Long id, Member member) {

        Optional<Member> optionalMember = memberRepository.findById(id);

        if(optionalMember.isEmpty()) {
            throw new MemberNotFoundException(
                    "Member not found with id: " + id
            );
        }

        Member existingMember = optionalMember.get();

        if(member.getEmail()!=null) {
            existingMember.setEmail(member.getEmail());
        }
        if(member.getPhone()!=null) {
            existingMember.setPhone(member.getPhone());
        }
        if(member.getName()!=null) {
            existingMember.setName(member.getName());
        }

        memberRepository.save(existingMember);

        return true;

    }

    @Override
    public boolean updateByName(String name, Member member) {

        List<Member> members = memberRepository.getMembersByName(name);

        if(members.size()!=1) {
            return false;
        }

        Member existingMember = members.get(0);

        if(member.getEmail()!=null) {
            existingMember.setEmail(member.getEmail());
        }

        if(member.getPhone()!=null) {
            existingMember.setPhone(member.getPhone());
        }

        if(member.getName()!=null) {
            existingMember.setName(member.getName());
        }

        memberRepository.save(existingMember);
        return true;

    }

    public boolean updateByEmail(String email, Member member) {

        List<Member> membersList = memberRepository.findByEmail(email);

        if(membersList.size()!=1) {
            return false;
        }

        Member existingMember = membersList.get(0);

        if(member.getEmail()!=null) {
            existingMember.setEmail(member.getEmail());
        }
        if(member.getPhone()!=null) {
            existingMember.setPhone(member.getPhone());
        }
        if(member.getName()!=null) {
            existingMember.setName(member.getName());
        }

        memberRepository.save(existingMember);
        return true;
    }

    public boolean updateByPhone(String phone, Member member) {

        List<Member> membersList = memberRepository.findByPhone(phone);

        if(membersList.size()!=1) {
            return false;
        }

        Member existingMember = membersList.get(0);

        if(member.getEmail()!=null) {
            existingMember.setEmail(member.getEmail());
        }
        if(member.getPhone()!=null) {
            existingMember.setPhone(member.getPhone());
        }
        if(member.getName()!=null) {
            existingMember.setName(member.getName());
        }

        memberRepository.save(existingMember);
        return true;

    }

}