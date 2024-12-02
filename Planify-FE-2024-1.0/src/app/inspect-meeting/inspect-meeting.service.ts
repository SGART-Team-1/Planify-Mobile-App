import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.custom';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InspectMeetingService {

  constructor(private readonly client: HttpClient) { }
  private readonly apiUrl = environment.apiUrl + '/meetings';
  
  
    // Método para obtener los datos del usuario por su ID
   getMeeting(meetingId: number): Observable<any> {
      return this.client.get(`${this.apiUrl}/${meetingId}`);
   }
  modifyMeeting(issue: string,allDayLong:boolean, meetingDate: string, meetingInitTime: string, meetingEndTime: string, isOnline:boolean, location: string,  attendants: any[], observations: string) {

    let info = {

    }

    return this.client.post(this.apiUrl + '/create', info);
  }
}
