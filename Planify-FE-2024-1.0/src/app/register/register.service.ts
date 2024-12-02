import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.custom';

import { RegisterParams } from '../../assets/Types/types';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private readonly apiUrl = environment.apiUrl + '/users';

  constructor(private readonly client: HttpClient) {}

  // NOSONAR
  register(params: RegisterParams): Observable<any> {
    const {
      email,
      name,
      surnames,
      department,
      center,
      profile,
      discharge_date,
      pwd1,
      pwd2,
      profileImageUrl,
    } = params;

    let info = {
      email: email,
      name: name,
      surnames: surnames,
      department: department,
      centre: center, 
      profile: profile,
      registrationDate: discharge_date,
      password: pwd1,
      confirmPassword: pwd2,
      photo: profileImageUrl,
    };

    return this.client.post(`${this.apiUrl}/register`, info);
  }
}
