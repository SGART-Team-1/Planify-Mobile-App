import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './password-recovery/change-password/change-password.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { WorkScheduleComponent } from './work-schedule/work-schedule.component';
import { UsersViewerComponent } from './users-viewer/users-viewer.component';
import { MeetingCalendarComponent } from './meeting-calendar/meeting-calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    PasswordRecoveryComponent,
    LoginComponent,
    ChangePasswordComponent,
    UserManagementComponent,
    WorkScheduleComponent,
    UsersViewerComponent,
    MeetingCalendarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Planify-FE-2024';

}
