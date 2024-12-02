import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.custom';

@Injectable({
  providedIn: 'root',
})
export class PasswordRecoveryService {
  private readonly apiUrl = environment.apiUrl + '/users'; // URL base del backend

  constructor(private readonly client: HttpClient) {}

  sendEmail(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.client.post<any>(`${this.apiUrl}/sendRecoveyEmail`, null, {
      params,
    });
  }

  changePassword(
    email: string,
    password: string,
    token: string
  ): Observable<any> {
    let info = {
      email: email,
      password: password,
    };
    return this.client.put(
      `${this.apiUrl}/changePassword?token=` + token,
      info
    );
  }
}
