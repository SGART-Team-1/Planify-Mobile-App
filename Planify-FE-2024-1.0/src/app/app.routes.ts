import { UserCalendarComponent } from './user-calendar/user-calendar.component';
import { AdminManagementComponent } from './admin-management/admin-management.component';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { ChangePasswordComponent } from './password-recovery/change-password/change-password.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { UserManagementComponent } from './user-management/user-management.component';
import { RegisterComponent } from './register/register.component';
import { WorkScheduleComponent } from './work-schedule/work-schedule.component';
import { AuthGuard } from './auth.guard.service';
import { InspectAdminComponent } from './inspect-admin/inspect-admin.component';
import { CreateAdminComponent } from './create-admin/create-admin.component';
import { AbsencesComponent } from './absences/absences.component';
import { InspectUserComponent } from './inspect-user/inspect-user.component';
import { CallMeetingComponent } from './call-meeting/call-meeting.component';
import { InspectMeetingComponent } from './inspect-meeting/inspect-meeting.component';
import { DobleFactorVerifyModalComponent } from './login/doble-factor-verify-modal/doble-factor-verify-modal.component';
export const routes: Routes = [
  //rutas externas a la intranet
  { path: 'home', component: HomeComponent }, // ruta para ir a home, si no se pone nada en la url
  { path: 'login', component: LoginComponent }, //ruta para ir a login
  { path: 'register', component: RegisterComponent }, //ruta para ir a register
  { path: 'password-recovery', component: PasswordRecoveryComponent }, //ruta para ir a password-recovery
  { path: 'change-password', component: ChangePasswordComponent }, //ruta para ir a change-password
  { path: 'doble-factor-verify', component: DobleFactorVerifyModalComponent }, //ruta para ir a doble-factor-verify
  //rutas internas a la intranet
  { path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard], data: { role: 'Administrator' } }, //ruta para ir a user-management
  { path: 'inspect-user/:userId', component: InspectUserComponent , canActivate: [AuthGuard], data: { role: 'Administrator' }}, //ruta para ir a inspect-user
  { path: 'absences/:userId', component: AbsencesComponent, canActivate: [AuthGuard], data: { role: 'Administrator' } }, //ruta para ir a absences
  { path: 'admin-management', component: AdminManagementComponent, canActivate: [AuthGuard], data: { role: 'Administrator' } }, //ruta para ir a admin-management
  { path: 'user-calendar', component: UserCalendarComponent, canActivate: [AuthGuard], data: { role: 'CommonUser' } }, //ruta para ir a user-calendar
  { path: 'inspect-admin/:adminId', component: InspectAdminComponent, canActivate: [AuthGuard], data: { role: 'Administrator' } }, //ruta para ir a inspect-admin
  { path: 'work-schedule', component: WorkScheduleComponent, canActivate: [AuthGuard], data: { role: 'Administrator' } }, //ruta para ir a work-schedule
  { path: 'create-admin', component: CreateAdminComponent, canActivate: [AuthGuard], data: { role: 'Administrator' } }, //ruta para ir a create-admin
  { path: 'call-meeting', component: CallMeetingComponent , canActivate: [AuthGuard], data: { role: 'CommonUser' }}, //ruta para ir a call-meeting
  { path: 'inspect-meeting/:meetingId', component: InspectMeetingComponent , canActivate: [AuthGuard], data: { role: 'CommonUser' }},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
