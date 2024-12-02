export interface Meeting {
    idOrganizer: string;
    issue: string;
    meetingDate: string;
    isAllDay: boolean;
    meetingInitTime: string;
    meetingEndTime: string;
    location: string;
    isOnline: boolean;
    attendants: any[];
}