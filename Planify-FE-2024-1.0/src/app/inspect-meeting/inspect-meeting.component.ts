import { Component, Input } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { User } from '../users-viewer/users';
import { environment } from '../../environments/environment.custom';
import { MatDialog } from '@angular/material/dialog';
import { AddAttendantComponent } from '../call-meeting/add-attendant/add-attendant.component';
import { HttpClient } from '@angular/common/http';
import { AdviseModalComponent } from '../components/advise-modal/advise-modal';
import { Meeting } from '../user-calendar/meeting';
import { RejectReasonComponent } from './reject-reason/reject-reason.component';
import { CallMeetingService } from '../call-meeting/call-meeting.service';

@Component({
  selector: 'app-inspect-meeting',
  standalone: true,
  imports: [FormsModule, NgClass, CommonModule, SidebarComponent],
  templateUrl: './inspect-meeting.component.html',
  styleUrl: './inspect-meeting.component.css',
})
export class InspectMeetingComponent {
  @Input() attendants: any[] = [];
  attendantsToSend: any[] = [];
  meetingId: number = -1;
  meeting: Meeting = {} as Meeting;
  organizer: User = {} as User;
  issue: string = '';
  meetingDate: string = ''; // Habría que formatear la fecha para que se mostrara
  isAllDay: boolean = false;
  meetingInitTime: string = '';
  meetingEndTime: string = '';
  location: string = 'ESI';
  isOnline: boolean = true;

  isEditing: boolean = false;
  isOrganizer: boolean = false;
  state: string = 'ABIERTA';
  invitationState: string = 'PENDIENTE';
  rejectReason: string = '';
  attending: boolean = false;

  scheduleInitTime: any;
  schedulegEndTime: any;
  workSchedules: any;

  same_afterDay: boolean = false;
  attendanceAvailable: boolean = true;
  profileImageUrl: string = '';
  originalProfileImageUrl: string = ''; // Imagen original
  tempProfileImageUrl: string = ''; // Imagen temporal para previsualización
  observations: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly client: HttpClient,
    private readonly dialog: MatDialog,
    private readonly callMeetingService: CallMeetingService
  ) { }
  private readonly apiUrl = environment.apiUrl + '/api/users';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const meetingId = params.get('meetingId');
      if (meetingId && this.meetingId) {
        this.meetingId = Number(meetingId);
        this.getMeetingInformation();
        this.getAttendants();
        this.attendStatus();
        this.obteinWorkSchedule();
      }
    });
  }

  //obtenemos el horario laboral para futuras validacion de horarios
  getWorkSchedule() {
    return this.client.get(
      `${environment.apiUrl}/workSchedule/getWorkSchedule`
    );
  }
  obteinWorkSchedule() {
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
        } else {
          console.error('No se encontraron bloques de horario');
        }
      },
      (error: any) => {
        console.error('Error fetching work schedule:', error);
      }
    );
  }

  compareDate() {
    const [day, month, year] = this.meetingDate.split('/').map(Number); // Parsear la fecha
    const meeting = new Date(this.meetingDate); // Crear la fecha del meetingDate
    const today = new Date(); // Fecha actual

    // Ignorar la hora y comparar solo las fechas
    today.setHours(0, 0, 0, 0);
    this.same_afterDay = meeting <= today;
    this.attendanceAvailable = meeting >= today;
    if (this.same_afterDay) {
      this.state = 'CERRADA';
    } else {
      this.state = 'ABIERTA';
    }
  }

  getMeetingInformation(): void {
    // Llamar al servicio que obtiene la información de la reunión
    this.callMeetingService.getMeetingInformation(this.meetingId).subscribe(
      (data: any) => {
        this.issue = data.subject;
        this.meetingDate = new Date(data.toDateTime)
          .toISOString()
          .split('T')[0];
        this.compareDate();

        this.isAllDay = data.allDayLong;
        this.meetingInitTime = new Date(data.fromDateTime).toLocaleTimeString(
          [],
          { hour: '2-digit', minute: '2-digit' }
        );
        this.meetingEndTime = new Date(data.toDateTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        this.location = data.location;
        this.isOnline = data.isOnline;
        this.observations = data.observations;
        this.state = data.status;
      },
      (error: any) => {
        console.error('Error al obtener la información de la reunión', error);
      }
    );
  }

  getAttendants(): void {
    // Llamar al servicio que obtiene los asistentes de la reunión
    this.callMeetingService.getAttendants(this.meetingId).subscribe(
      (data: any) => {
        this.attendants = data.filter(
          (attendant: any) => attendant.role !== 'ORGANIZADOR'
        );
        this.organizer = data.find(
          (attendant: any) => attendant.role === 'ORGANIZADOR'
        );
        this.getOrganizadorDetails(this.organizer.id);
      },

      (error: any) => {
        console.error('Error al obtener los asistentes de la reunión', error);
      }
    );
  }

  getOrganizadorDetails(organizerId: number): void {
    // Llamar al servicio que obtiene la información del usuario actual
    this.callMeetingService.getOrganizadorDetails(organizerId).subscribe(
      (data: any) => {
        this.organizer = data;
        this.originalProfileImageUrl = data.photo;

        // Verificar si 'user.photo' ya incluye el prefijo
        if (data.photo && typeof data.photo === 'string') {
          if (data.photo.startsWith('data:image')) {
            this.originalProfileImageUrl = data.photo;
          } else {
            this.originalProfileImageUrl =
              'data:image/png;base64,' + data.photo;
          }
        } else {
          this.originalProfileImageUrl = ''; // O una imagen por defecto
        }
      },
      (error: any) => {
        console.error('Error al obtener la información del organizador', error);
      }
    );
  }

  attendStatus(): void {
    // Llamar al servicio que obtiene la asistencia , invitacion de la reunion del usuario actual y su id para poder ver si es organizador
    this.callMeetingService.attendStatus(this.meetingId).subscribe(
      (data: any) => {
        this.attending = data.hasAssisted === 'true';
        this.invitationState = data.hasAccepted;
        if (this.organizer.id == data.ActulUserId) {
          this.isOrganizer = true;
        }
      },
      (error: any) => {
        console.error('Error al obtener la información de la reunión', error);
      }
    );
  }

  // While being Organizer
  cancelMeeting(): void {

    const dialog = this.dialog.open(AdviseModalComponent, {
      disableClose: true,
      data: {
        titulo: 'Advertencia',
        error: '¿Seguro que quieres cancelar esta reunión?',
        cancelar: true,
        aceptar: true,
      },
    });

    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.state = 'CANCELADA';
        this.callMeetingService
          .cancelMeeting(this.meetingId, this.state)
          .subscribe(
            (result: any) => {
              this.router.navigate(['/user-calendar']);
            },
            (response: any) => {
              this.dialog.open(AdviseModalComponent, {
                disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
              });
            }
          );
      }
    });
  }

  modifyMeeting(): void {
    this.isEditing = true;
  }

  saveMeeting(): void {
    if (this.isFormInvalid()) return;
    if (this.isTimeOutsideWorkSchedule()) return;
    if (this.isMeetingDateInvalid()) return;
    if (this.isInitTimeGreaterThanEndTime()) return;
    if (this.isMeetingSpanningMultipleWorkBlocks()) return;
    if (this.isMeetingDurationTooShort()) return;
    if (this.isAttendantsEmpty()) return;

    this.createMeeting();
  }

  isFormInvalid(): boolean {
    if (
      this.issue === '' ||
      this.meetingDate === '' ||
      this.meetingInitTime === '' ||
      this.meetingEndTime === ''
    ) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true,
        data: {
          titulo: 'Error',
          error: 'Por favor, rellene todos los campos',
          cancelar: false,
          aceptar: true,
        },
      });
      return true;
    }
    return false;
  }

  isTimeOutsideWorkSchedule(): boolean {
    if (
      this.meetingInitTime < this.scheduleInitTime.slice(0, 5) ||
      this.meetingEndTime > this.schedulegEndTime.slice(0, 5)
    ) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true,
        data: {
          titulo: 'Error',
          error:
            'La hora de inicio y fin debe estar dentro del horario laboral \nInicio: ' +
            this.scheduleInitTime +
            '\nFin: ' +
            this.schedulegEndTime,
          cancelar: false,
          aceptar: true,
        },
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
        disableClose: true,
        data: {
          titulo: 'Error',
          error: 'La fecha de la reunión debe ser posterior a la fecha actual',
          cancelar: false,
          aceptar: true,
        },
      });
      return true;
    }
    return false;
  }

  isInitTimeGreaterThanEndTime(): boolean {
    if (this.meetingInitTime > this.meetingEndTime) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true,
        data: {
          titulo: 'Error',
          error: 'La hora de inicio debe ser menor a la hora de fin',
          cancelar: false,
          aceptar: true,
        },
      });
      return true;
    }
    return false;
  }

  isMeetingSpanningMultipleWorkBlocks(): boolean {
    for (let i = 0; i < this.workSchedules.length - 1; i++) {
      const currentEnd = this.workSchedules[i].endHour;
      const nextStart = this.workSchedules[i + 1].startHour;
      if (
        this.meetingInitTime < nextStart &&
        this.meetingEndTime > currentEnd
      ) {
        this.dialog.open(AdviseModalComponent, {
          disableClose: true,
          data: {
            titulo: 'Error',
            error:
              'La reunión no puede abarcar múltiples bloques de horario laboral',
            cancelar: false,
            aceptar: true,
          },
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
        disableClose: true,
        data: {
          titulo: 'Error',
          error: 'La reunión debe durar al menos 30 minutos',
          cancelar: false,
          aceptar: true,
        },
      });
      return true;
    }
    return false;
  }

  isAttendantsEmpty(): boolean {
    if (this.attendants.length === 0) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true,
        data: {
          titulo: 'Error',
          error: 'Debe tener al menos un asistente',
          cancelar: false,
          aceptar: true,
        },
      });
      return true;
    }
    return false;
  }

  createMeeting(): void {
    this.attendantsToSend = this.attendants.map((attendant) => attendant.email);
    this.isEditing = false;
    const meeting = {
      meetingId: this.meetingId,
      issue: this.issue,
      meetingDate: this.meetingDate,
      isAllDay: this.isAllDay,
      meetingInitTime: this.meetingInitTime.slice(0, 5), // Format time to HH:mm
      meetingEndTime: this.meetingEndTime.slice(0, 5), // Format time to HH:mm
      location: this.location,
      isOnline: this.isOnline,
      observations: this.observations,
      attendants: this.attendantsToSend, // Use attendantsToSend which contains only emails
    };
    this.callMeetingService.saveMeeting(meeting).subscribe(
      (data: any) => {
        window.location.reload();
      },
      (error: any) => {
        console.error('Error saving meeting', error);
        this.dialog.open(AdviseModalComponent, {
          disableClose: true,
          data: {
            titulo: 'Error',
            error: error.error.message,
            cancelar: false,
            aceptar: true,
          },
        });
      }
    );
  }

  cancelChanges(): void {
    this.isEditing = false;
    // REVERTIR LOS CAMBIOS
    window.location.reload();
  }

  onAllDayChange() {
    this.isAllDay = !this.isAllDay;
  }

  onOnlineChange() {
    this.isOnline = !this.isOnline;
    this.location = this.isOnline ? 'Online' : 'ESI';
  }
  deleteAttendant(id: string) {
    this.attendants = this.attendants.filter(
      (attendant) => attendant.id !== id
    );
  }

  openModalDialogModifyAttendants(): void {
    const dialogRef = this.dialog.open(AddAttendantComponent, {
      disableClose: true,
      width: '80%',
      height: '80%',
      maxWidth: 'none',
      data: {
        already_attending: this.attendants,
        organizerId: this.organizer.id,
        fromDateTime: this.meetingInitTime,
        toDateTime: this.meetingEndTime,
        isAllDay: this.isAllDay,
        meetingDate: this.meetingDate,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.attendants = result;
      this.attendants = result.sort((a: User, b: User) =>
        a.surnames.localeCompare(b.surnames)
      ); //usado para el filtro
    });
  }

  onDateChange() {
    //Cuando la fecha cambia, se debe actualizar la lista de asistentes
    if (this.attendants.length > 0) {
      this.dialog.open(AdviseModalComponent, {
        disableClose: true,
        data: {
          titulo: 'Advertencia',
          error:
            'Con el cambio de fecha puede cambiar la disponibilidad de los asistentes',
          cancelar: false,
          aceptar: true,
        },
      });
      this.callMeetingService
        .getCandidatesToMeeting(
          this.meetingInitTime,
          this.meetingEndTime,
          this.isAllDay,
          this.meetingDate
        )
        .subscribe((users: any) => {
          this.attendants = this.attendants.map((attendant) => attendant.email); //usuarios que ya estaban en la reunion como asistentes

          this.attendants = users.filter((user: any) =>
            this.attendants.includes(user.email)
          ); //solo cambiamos los que ya estaban
          this.attendants = this.attendants.sort((a: User, b: User) =>
            a.surnames.localeCompare(b.surnames)
          ); //los ordenamos alfabeticamente
        });
    }
  }

  openModalDialogRejectReason(): void {
    const dialogRef = this.dialog.open(RejectReasonComponent, {
      disableClose: true,
      width: '50%',
      height: '70%',
      maxWidth: 'none',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result != '') {
        this.invitationState = 'RECHAZADA';
        this.attending = false;
        this.rejectReason = result;
        this.callMeetingService
          .changeStatusMeeting(
            this.meetingId,
            this.invitationState,
            this.rejectReason
          )
          .subscribe(
            (data: any) => {
              window.location.reload();
            },
            (error: any) => {
              console.error('Error accepting meeting', error);
            }
          );
      }
    });
  }

  // While being Attendant
  rejectMeeting(): void {
    this.openModalDialogRejectReason();
  }

  acceptMeeting(): void {
    this.invitationState = 'ACEPTADA';
    this.callMeetingService
      .changeStatusMeeting(this.meetingId, this.invitationState, '')
      .subscribe(
        (result: any) => {
          window.location.reload();
        },
        (response: any) => {
          this.dialog.open(AdviseModalComponent, {
            disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
          });
        }
      );
  }

  onAttendingChange(): void {
    this.attending = !this.attending; // Cambia el estado de attending
    this.callMeetingService.assistMeeting(this.meetingId).subscribe(
      (data: any) => {
        window.location.reload();
      },
      (error: any) => {
        console.error('Error accepting meeting', error);
      }
    );
  }

  closeWindow() {
    this.router.navigate(['/user-calendar']);
  }
}
