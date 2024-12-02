import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Block } from './Block';
import {environment} from '../../environments/environment.custom';

@Injectable({
  providedIn: 'root',
})
export class WorkScheduleService {
  private readonly apiUrl = environment.apiUrl + '/workSchedule'; // URL base del backend

  constructor(private readonly router: Router, private readonly client: HttpClient) { }

  addWorkSchedule(blocks: Block[]): Observable<any> {
    let info = {
      blocks: blocks,
    };
    return this.client.post(
      `${this.apiUrl}/addWorkSchedule`,
      info
    );
  }

  getWorkSchedule() {
    return this.client.get(
      `${this.apiUrl}/getWorkSchedule`
    );
  }
}
