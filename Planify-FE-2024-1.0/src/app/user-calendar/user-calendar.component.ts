import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { MeetingCalendarComponent } from '../meeting-calendar/meeting-calendar.component';

@Component({
  selector: 'app-user-calendar',
  standalone: true,
  imports: [SidebarComponent, MeetingCalendarComponent],
  templateUrl: './user-calendar.component.html',
  styleUrl: './user-calendar.component.css'
})
export class UserCalendarComponent {
  constructor(private readonly router: Router, private readonly dialog: MatDialog) { }

}
