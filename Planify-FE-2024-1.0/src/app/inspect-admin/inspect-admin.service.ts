import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.custom';
@Injectable({
  providedIn: 'root',
})
export class InspectAdminService {
  private readonly apiUrl = environment.apiUrl + '/api/administrators'; // URL base del backend

  constructor(private readonly client: HttpClient) {}

  // Método para obtener los datos del admin por su ID
  getAdmin(adminId: number): Observable<any> {
    return this.client.get(`${this.apiUrl}/${adminId}/inspect`);
  }

  // Método para actualizar los datos del admin
  updateAdmin(adminId: number, updatedAdmin: any): Observable<any> {
    return this.client.put(`${this.apiUrl}/${adminId}/edit`, updatedAdmin);
  }
}
