import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.custom';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly apiUrl = environment.apiUrl + '/users';

  constructor(private readonly client: HttpClient) { }


  login(email: string, password: string): Observable<any> {
    let info = {
      email: email,
      password: password
    }
    return this.client.put(this.apiUrl + "/login", info, { observe: 'response' });
  }

  verifyDobleFactor(userId: number, verificationcode: number): Observable<any> {
    return this.client.put(`${this.apiUrl}/${userId}/second-factor-verify/${verificationcode}`, null, { observe: 'response' });

  }

  getUser(jwt: string): Observable<any> {
    
    return this.client.get(this.apiUrl+'/validateJWT');
  }
}
