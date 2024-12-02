import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.custom';

@Injectable({
  providedIn: 'root',
})
export class MeetingServiceService {
  private readonly apiUrl = environment.apiUrl + '/meetings'; // URL base del backend
  private readonly absencesUrl = environment.apiUrl + '/absences'; // URL base del backend
  private readonly workScheduleUrl = environment.apiUrl + '/workSchedule'; // URL base del backend

  constructor(
    private readonly router: Router,
    private readonly client: HttpClient
  ) {}

  getMeetings() {
    return this.client.get(`${this.apiUrl}/listAll`);
  }

  getAbsences() {
    return this.client.get(`${this.absencesUrl}/list`);
  }

  getWorkSchedule() {
    return this.client.get(`${this.workScheduleUrl}/getWorkSchedule`);
  }
}
