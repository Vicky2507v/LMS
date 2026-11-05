import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getAllMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.baseUrl}/getAllMember`);
  }

  getMemberById(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.baseUrl}/getMemberById/${id}`);
  }

  getMembersByName(name: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.baseUrl}/getMemberByName/${encodeURIComponent(name)}`);
  }

  getMembersByEmail(email: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.baseUrl}/getMemberByEmail/${encodeURIComponent(email)}`);
  }

  getMembersByPhone(phone: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.baseUrl}/getMemberByPhone/${encodeURIComponent(phone)}`);
  }

  addMember(member: Member): Observable<string> {
    return this.http.post(`${this.baseUrl}/addMember`, member, { responseType: 'text' });
  }

  updateMemberById(id: number, member: Partial<Member>): Observable<string> {
    return this.http.patch(`${this.baseUrl}/updateMemberById/${id}`, member, { responseType: 'text' });
  }

  updateMemberByName(name: string, member: Member): Observable<string> {
    return this.http.put(`${this.baseUrl}/updateMemberByName/${encodeURIComponent(name)}`, member, { responseType: 'text' });
  }

  updateMemberByEmail(email: string, member: Member): Observable<string> {
    return this.http.put(`${this.baseUrl}/updateByEmail/${encodeURIComponent(email)}`, member, { responseType: 'text' });
  }

  updateMemberByPhone(phone: string, member: Member): Observable<string> {
    return this.http.put(`${this.baseUrl}/updateByPhone/${encodeURIComponent(phone)}`, member, { responseType: 'text' });
  }

  deleteMemberById(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteByMemberId/${id}`, { responseType: 'text' });
  }

  deleteMemberByName(name: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteByMemberName/${encodeURIComponent(name)}`, { responseType: 'text' });
  }
}
