import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.custom';

@Injectable({
  providedIn: 'root'
})
export class ListAbsencesService {

  constructor(private readonly client: HttpClient) { }
  private readonly apiUrl = environment.apiUrl + '/absences';


  getAbsences(userId: number): Observable<any> {
    
    return this.client.get(this.apiUrl+`/${userId}/list`);

  }

  deleteAbsence(absenceId: number): Observable<any> {
    
    return this.client.delete(this.apiUrl+`/${absenceId}/delete`);
  }

}
