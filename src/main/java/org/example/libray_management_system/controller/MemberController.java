package org.example.libray_management_system.controller;

import jakarta.validation.Valid;
import org.example.libray_management_system.entity.Member;
import org.example.libray_management_system.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class MemberController {

    @Autowired
    private MemberService memberService;

    @PostMapping("/addMember")
    public ResponseEntity<String> addNewMember(@Valid @RequestBody Member member) {

        boolean status = memberService.addMember(member);

        if(status) {
            return ResponseEntity.status(HttpStatus.CREATED).body("Member added successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Member not added, try again !!");
    }

    @GetMapping("/getAllMember")
    public List<Member> getAllMembers(){
        return memberService.getMembers();
    }

    @GetMapping("/getMemberById/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {

        Member member = memberService.getMemberById(id);

        return new ResponseEntity<>(member, HttpStatus.OK);
    }

    @GetMapping("/getMemberByName/{name}")
    public List<Member> getAllMembersByName(@PathVariable String name){
        return memberService.getMembersByName(name);
    }

    @GetMapping("/getMemberByEmail/{email}")
    public List<Member> getAllMembersByEmailId(@PathVariable String email){

        if(!email.contains("@") || email==null) {
            return null;
        }

        return memberService.findByEmail(email);
    }

    @GetMapping("/getMemberByPhone/{phone}")
    public List<Member> getAllMembersByPhoneNo(@PathVariable String phone){

        if(phone.matches("\\d") || phone!=null) {
            return memberService.findByPhone(phone);
        }
        return List.of();
    }

    @DeleteMapping("/deleteByMemberId/{id}")
    public ResponseEntity<String> deleteMemberById(@PathVariable Long id) {

        boolean status = memberService.deleteById(id);

        if(status) {
            return ResponseEntity.status(HttpStatus.OK).body("Member deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not deleted successfully");
        }

    }

    @DeleteMapping("/deleteByMemberName/{name}")
    public ResponseEntity<String> deleteByName(@PathVariable String name) {

        boolean status = memberService.deleteByName(name);
        if(status) {
            return ResponseEntity.status(HttpStatus.OK).body("Member deleted successfully");
        }  else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not deleted successfully");
        }

    }

    @PutMapping("/updateMemberById/{id}")
    public ResponseEntity<String> updateById(@PathVariable Long id, @RequestBody Member member) {

        boolean status = memberService.updateById(id, member);

        if(status) {
            return ResponseEntity.status(HttpStatus.OK).body("Member updated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not updated successfully");
        }

    }

    @PutMapping("/updateMemberByName/{name}")
    public ResponseEntity<String> updateByName(@PathVariable String name, @RequestBody Member member) {

        boolean status = memberService.updateByName(name, member);

        if(status) {
            return ResponseEntity.status(HttpStatus.OK).body("Member updated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not updated, try again");
        }
    }

    @PutMapping("/updateByEmail/{email}")
    public ResponseEntity<String> updateByEmail(@PathVariable String email, @RequestBody Member member) {

        boolean status = memberService.updateByEmail(email, member);

        if(status) {
            return ResponseEntity.status(HttpStatus.OK).body("Member updated successfully");
        }  else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not updated, try again");
        }

    }

    @PutMapping("/updateByPhone/{phone}")
    public ResponseEntity<String> updateByPhone(@PathVariable String phone, @RequestBody Member member) {

        boolean status = memberService.updateByPhone(phone, member);

        if(status) {
            return ResponseEntity.status(HttpStatus.OK).body("Member updated successfully");
        }  else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not updated, try again");
        }
    }

}