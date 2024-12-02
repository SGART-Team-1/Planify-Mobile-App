import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.custom';

@Injectable({
  providedIn: 'root',
})
export class InspectUserService {
  private readonly apiUrl = environment.apiUrl + '/api/users'; // URL base del backend

  constructor(private readonly client: HttpClient) {}

  // Método para obtener los datos del usuario por su ID
  getUser(userId: number): Observable<any> {
    return this.client.get(`${this.apiUrl}/${userId}/inspect`);
  }

  // Método para actualizar los datos del usuario
  updateUser(userId: number, updatedUser: any): Observable<any> {
    return this.client.put(`${this.apiUrl}/${userId}/edit`, updatedUser);
  }
}
