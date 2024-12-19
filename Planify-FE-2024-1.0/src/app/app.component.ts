import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './password-recovery/change-password/change-password.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { WorkScheduleComponent } from './work-schedule/work-schedule.component';
import { UsersViewerComponent } from './users-viewer/users-viewer.component';
import { MeetingCalendarComponent } from './meeting-calendar/meeting-calendar.component';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';

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
  styleUrls: ['./app.component.css'], // nota: corregí "styleUrl" a "styleUrls"
})
export class AppComponent {
  title = 'Planify-FE-2024';

  constructor(private platform: Platform, private location: Location) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        if (this.location.isCurrentPathEqualTo('/login')) {
          App.exitApp(); // Usamos Capacitor para cerrar la app
        } else {
          this.location.back();
        }
      });
    });
  }
}
