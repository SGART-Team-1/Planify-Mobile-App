import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { User } from '../users-viewer/users';
import { MatDialog } from '@angular/material/dialog';
import { AddAttendantComponent } from './add-attendant/add-attendant.component';
import { environment } from '../../environments/environment.custom';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdviseModalComponent } from '../components/advise-modal/advise-modal';
import { CallMeetingService } from './call-meeting.service';

@Component({
  selector: 'app-call-meeting',
  standalone: true,
  imports: [FormsModule, NgClass, CommonModule, SidebarComponent],
  templateUrl: './call-meeting.component.html',
  styleUrl: './call-meeting.component.css'
})
export class CallMeetingComponent {

  @Input() attendants: any[] = [];
  attendantsToSend: any[] = [];

  organizer: User = {} as User;
  issue: string = '';
  meetingDate: string = '';
  isAllDay: boolean = false;
  meetingInitTime: string = '';
  meetingEndTime: string = '';
  location: string = 'ESI';
  isOnline: boolean = false;


  state: string = ''; // SE ASIGNA UN ESTADO PREDETERMINADO COMO "Abierta"



  profileImage: string = '';
  observations: string = '';
  name: string = '';
  surnames: string = '';
  scheduleInitTime: any;
  schedulegEndTime: any;
  organizerId: string = '';
  workSchedules: any;


  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly dialog: MatDialog, private readonly client: HttpClient, private callMeetingService: CallMeetingService) { }
  private readonly apiUrl = environment.apiUrl + '/api/users';

  ngOnInit(): void {
    this.setInitDate();
    // Obtén el usuario actual para la foto y el nombre
    if (typeof window !== "undefined") {
      const user = window.localStorage.getItem("user") as string;
      if (user) {
        this.getUser(user).subscribe(
          (resultado: any) => {
            this.name = resultado.name;
            this.surnames = resultado.surnames;
            this.profileImage = resultado.photo;
            this.organizerId = resultado.id;

            if (this.profileImage === null) {
              this.profileImage = "../../../assets/register/userDefault.png";
            }
            else {
              this.profileImage = 'data:image/png;base64,' + this.profileImage
            }

          },
          (error: any) => {
            console.error('Error fetching user:', error);
          }
        );
      }
    }

    //obtenemos el horario laboral para futuras validacion de horarios
    this.getWorkSchedule().subscribe(
      (resultado: any) => {
        if (resultado && resultado.length > 0) {
          const startTimes = resultado.map((block: any) => block.startHour);
          const endTimes = resultado.map((block: any) => block.endHour);

          this.scheduleInitTime = startTimes.reduce((min: string, current: string) => current < min ? current : min, startTimes[0]);
          this.schedulegEndTime = endTimes.reduce((max: string, current: string) => current > max ? current : max, endTimes[0]);

          this.workSchedules = resultado.map((block: any) => ({
            startHour: block.startHour,
            endHour: block.endHour
          }));

          this.meetingInitTime = this.workSchedules[0].startHour;
          this.meetingEndTime = this.workSchedules[0].endHour;


        } else {
          console.error('No se encontraron bloques de horario');
        }
      },
      (error: any) => {
        console.error('Error fetching work schedule:', error);
      }
    );

  }

  getWorkSchedule() {
    return this.client.get(
      `${environment.apiUrl}/workSchedule/getWorkSchedule`
    );
  }

  getUser(jwt: string): Observable<any> {
    return this.client.get(this.apiUrl + "/validateJWT");
  }

  onDateChange() {
    //Cuando la fecha cambia, se debe actualizar la lista de asistentes
    if (this.attendants.length > 0) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Advertencia', error: 'Con el cambio de fecha puede cambiar la disponibilidad de los asistentes', cancelar: false, aceptar: true }
      });
      this.callMeetingService.getCandidatesToMeeting(this.meetingInitTime, this.meetingEndTime, this.isAllDay, this.meetingDate).subscribe(
        (users: any) => {
          this.attendants = this.attendants.map(attendant => attendant.email);//usuarios que ya estaban en la reunion como asistentes

          this.attendants = users.filter((user: any) => this.attendants.includes(user.email)); //solo cambiamos los que ya estaban
          this.attendants = this.attendants.sort((a: User, b: User) => a.surnames.localeCompare(b.surnames));; //los ordenamos alfabeticamente
        }
      );

    }
  }


  callMeeting(): void {
    if (this.hasEmptyFields()) return;
    if (this.isOutsideWorkHours()) return;
    if (this.isMeetingDateInvalid()) return;
    if (this.isStartTimeAfterEndTime()) return;
    if (this.isMeetingSpanningMultipleWorkBlocks()) return;
    if (this.isMeetingDurationTooShort()) return;
    if (this.hasNoAttendants()) return;

    this.createMeeting();
  }

   hasEmptyFields(): boolean {
    if (this.issue === '' || this.meetingDate === '' || this.meetingInitTime === '' || this.meetingEndTime === '') {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: 'Por favor, rellene todos los campos', cancelar: false, aceptar: true }
      });
      return true;
    }
    return false;
  }

   isOutsideWorkHours(): boolean {
    if (this.meetingInitTime < this.scheduleInitTime.slice(0.5) || this.meetingEndTime > this.schedulegEndTime.slice(0.5)) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true,
        data: {
          titulo: 'Error',
          error: 'La hora de inicio y fin debe estar dentro del horario laboral \nInicio: ' + this.scheduleInitTime + '\nFin: ' + this.schedulegEndTime,
          cancelar: false,
          aceptar: true
        }
      });
      return true;
    }
    return false;
  }

   isMeetingDateInvalid(): boolean {
    const today = new Date();
    const meetingDate = new Date(this.meetingDate);
    if (meetingDate < today) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: 'La fecha de la reunión debe ser posterior a la fecha actual', cancelar: false, aceptar: true }
      });
      return true;
    }
    return false;
  }

   isStartTimeAfterEndTime(): boolean {
    if (this.meetingInitTime > this.meetingEndTime) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: 'La hora de inicio debe ser menor a la hora de fin', cancelar: false, aceptar: true }
      });
      return true;
    }
    return false;
  }

   isMeetingSpanningMultipleWorkBlocks(): boolean {
    for (let i = 0; i < this.workSchedules.length - 1; i++) {
      const currentEnd = this.workSchedules[i].endHour;
      const nextStart = this.workSchedules[i + 1].startHour;

      if (this.meetingInitTime < nextStart && this.meetingEndTime > currentEnd) {
        this.dialog.open(AdviseModalComponent, {
          disableClose: true,
          data: {
            titulo: 'Error',
            error: 'La reunión no puede abarcar múltiples bloques de horario laboral',
            cancelar: false,
            aceptar: true
          }
        });
        return true;
      }
    }
    return false;
  }

   isMeetingDurationTooShort(): boolean {
    const initTime = new Date('1970-01-01T' + this.meetingInitTime + ':00');
    const endTime = new Date('1970-01-01T' + this.meetingEndTime + ':00');
    const diff = endTime.getTime() - initTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 30) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: 'La reunión debe durar al menos 30 minutos', cancelar: false, aceptar: true }
      });
      return true;
    }
    return false;
  }

   hasNoAttendants(): boolean {
    if (this.attendants.length === 0) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: 'Debe tener al menos un asistente', cancelar: false, aceptar: true }
      });
      return true;
    }
    return false;
  }

   createMeeting(): void {
    this.attendantsToSend = this.attendants.map(attendant => attendant.email);
    this.callMeetingService.createMeeting(this.issue, this.isAllDay, this.meetingDate, this.meetingInitTime.slice(0, 5), this.meetingEndTime.slice(0, 5), this.isOnline, this.location, this.attendantsToSend, this.observations).subscribe(
      result => {
        this.router.navigate(['/user-calendar']);
      },
      response => {
        this.dialog.open(AdviseModalComponent, {
          disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
        });
      }
    );
  }



  setInitDate() {
    // Obtén la fecha actual
    const today = new Date();

    // Añade un día a la fecha actual
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Formatea la fecha como "YYYY-MM-DD"
    const formattedDate = tomorrow.toISOString().split('T')[0];

    // Asigna el valor al input de tipo date
    this.meetingDate = formattedDate;
  }
  onAllDayChange() {
    this.isAllDay = !this.isAllDay;
  }



  onOnlineChange() {
    this.isOnline = !this.isOnline;
    this.location = this.isOnline ? 'Online' : 'ESI';
  }
  deleteAttendant(id: string) {
    this.attendants = this.attendants.filter(attendant => attendant.id !== id);
  }


  openModalDialog(): void {

    let fromDateTime = this.meetingInitTime
    let toDateTime = this.meetingEndTime
    if (this.isAllDay) {
      fromDateTime = '00:00';
      toDateTime = '00:00';
    }

    const dialogRef = this.dialog.open(AddAttendantComponent, {
      disableClose: true, width: '80%', height: '80%', maxWidth: 'none', data: {
        already_attending: this.attendants, organizerId: this.organizerId,
        fromDateTime: fromDateTime, toDateTime: toDateTime, isAllDay: this.isAllDay, meetingDate: this.meetingDate
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.attendants = result;
      this.attendants = result.sort((a: User, b: User) => a.surnames.localeCompare(b.surnames));; //usado para el filtro


    });
  }



  compareTimes(time1: string, time2: string): number {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    if (hours1 !== hours2) {
      return hours1 - hours2;
    }
    return minutes1 - minutes2;
  }

  closeWindow() {
    this.router.navigate(["/user-calendar"]);
  }


}
