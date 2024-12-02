import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.custom';

@Injectable({
  providedIn: 'root'
})
export class AdminManagementService {


  constructor(private readonly client: HttpClient) { }
  private readonly apiUrl = environment.apiUrl + '/api/administrators';

  getAllAdmins() {
   
    return this.client.get(this.apiUrl+'/showAdmins');
  }

  deleteAdmin(id: number) {
    return this.client.delete<any>(`${this.apiUrl}/${id}`);
  }


  createAdmin(email: string, name: string, surnames: string,
    center: string, pwd1: string,
    pwd2: string, interno: boolean, profileImageUrl: string | ArrayBuffer | null): Observable<any> {
    let info = {
      email: email,
      name: name,
      surnames: surnames,
      centre: center,
      password: pwd1,
      confirmPassword: pwd2,
      photo: profileImageUrl,
      interno: interno
    }
    return this.client.post(this.apiUrl+`/create`, info);

  }



}

