import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.custom';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CallMeetingService {
  constructor(private readonly client: HttpClient) {}
  private readonly apiUrl = environment.apiUrl + '/meetings';

  createMeeting(
    issue: string,
    allDayLong: boolean,
    meetingDate: string,
    meetingInitTime: string,
    meetingEndTime: string,
    isOnline: boolean,
    location: string,
    attendants: any[],
    observations: string
  ) {
    let info = {
      subject: issue,
      allDayLong: allDayLong,
      date: meetingDate,
      fromTime: meetingInitTime,
      toTime: meetingEndTime,
      isOnline: isOnline,
      location: location,
      observations: observations,
      participants: attendants,
    };

    return this.client.post(this.apiUrl + '/create', info);
  }

  getCandidatesToMeeting(
    fromDateTime: string,
    toDateTime: string,
    isAllDay: boolean,
    meetingDate: string
  ) {
    const body = {
      fromDateTime: fromDateTime,
      toDateTime: toDateTime,
      isAllDay: isAllDay,
      meetingDate: meetingDate,
    };

    return this.client.post(this.apiUrl + '/getCandidatesToMeeting', body);
  }

  getMeetingInformation(meetingId: number) {
    return this.client.get(`${this.apiUrl}/${meetingId}`);
  }

  getAttendants(meetingId: number) {
    return this.client.get(`${this.apiUrl}/${meetingId}/attendees`);
  }

  changeStatusMeeting(
    meetingId: number,
    invitationState: string,
    declineReason: string
  ) {
    const body = {
      invitationStatus: invitationState,
      declineReason: declineReason,
    };

    return this.client.patch(
      `${this.apiUrl}/${meetingId}/changeInvitationStatus`,
      body
    );
  }

  assistMeeting(meetingId: number) {
    return this.client.patch(`${this.apiUrl}/${meetingId}/assist`, null);
  }

  attendStatus(meetingId: number) {
    return this.client.get(`${this.apiUrl}/${meetingId}/attendStatus`);
  }

  getOrganizadorDetails(id: number) {
    return this.client.get(`${this.apiUrl}/${id}/organizador`);
  }

  cancelMeeting(meetingId: number, status: string) {
    const body = {
      status: status,
    };
    return this.client.patch(`${this.apiUrl}/${meetingId}/changeStatus`, body);
  }

  saveMeeting(meeting: {
    meetingId: number;
    issue: string;
    meetingDate: string;
    isAllDay: boolean;
    meetingInitTime: string;
    meetingEndTime: string;
    location: string;
    isOnline: boolean;
    observations: string;
    attendants: any[];
  }) {
    const body = {
      subject: meeting.issue,
      date: meeting.meetingDate,
      allDayLong: meeting.isAllDay,
      fromTime: meeting.meetingInitTime,
      toTime: meeting.meetingEndTime,
      location: meeting.location,
      isOnline: meeting.isOnline,
      observations: meeting.observations,
      participants: meeting.attendants,
    };

    return this.client.patch(`${this.apiUrl}/${meeting.meetingId}/edit`, body);
  }
}
