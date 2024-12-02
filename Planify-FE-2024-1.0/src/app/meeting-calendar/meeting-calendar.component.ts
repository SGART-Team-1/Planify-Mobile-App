import { Component, ViewChild, OnInit,} from '@angular/core';
import { Router } from '@angular/router';
import {
  FullCalendarModule,
  FullCalendarComponent,
} from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { MeetingServiceService } from './meeting-service.service';
import { Block } from '../work-schedule/Block';
import { MatDialog } from '@angular/material/dialog';
import { ErrorWorkScheduleLoadComponent } from './error-work-schedule-load/error-work-schedule-load.component';
import { LegendCalendarComponent } from './legend-calendar/legend-calendar.component';

@Component({
  selector: 'app-meeting-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './meeting-calendar.component.html',
  styleUrl: './meeting-calendar.component.css',
})
export class MeetingCalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  isClicked = false;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek', // vista semanal con horas

    // Restringir la selección de eventos a las horas laborales
    selectConstraint: 'businessHours',

    selectable: false,
    editable: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: [], // Inicialmente sin eventos
    weekends: false, // Mostrar fines de semana
    eventClick: this.inspeccionarReunion.bind(this),
    locale: esLocale, // Idioma en español
    timeZone: 'local', // Zona horaria local
  };

  meetings: EventInput[] = [];
  absences: EventInput[] = [];
  workScheduleBlocks: Block[] = [];

  constructor(
    private readonly meetingService: MeetingServiceService,
    private readonly workScheduleService: MeetingServiceService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}

  //Metodo para obtener las reuniones al iniciar el componente
  ngOnInit() {
    this.loadEvents();
  }
  loadEvents() {
    this.getWorkSchedule();
    this.getMeetings();
    this.getAbsences();
  }

  //Metodo para traer el horario de trabajo del backend
  getWorkSchedule() {
    this.workScheduleService.getWorkSchedule().subscribe((data: any) => {
      const blocks = data.map((block: Block) => ({
        blockName: block.blockName,
        startHour: block.startHour,
        endHour: block.endHour,
      }));
      this.workScheduleBlocks = blocks;
      this.updateCalendarWorkHours();
    });
  }

  //Metodo para traer las reuniones del backend
  getMeetings() {
    this.meetingService.getMeetings().subscribe((data: any) => {
      const meetings = data
        .map((attendance: any) => ({
          id: attendance.id,
          title: attendance.subject,
          startDate: attendance.fromDateTime, //new Date(attendance.meeting.fromDateTime), se puede poner de esta manera para que se vea mas claro
          endDate: attendance.toDateTime, //new Date(attendance.meeting.toDateTime),
          allDay: attendance.allDayLong,
          color: this.colors(
            attendance.role,
            attendance.status,
            attendance.invitationStatus
          ),
          status: attendance.status,
          invitationStatus: attendance.invitationStatus,
        }))
        .filter(
          (meetings: { status: string }) => meetings.status !== 'CANCELADA'
        );
      this.meetings = meetings;
      this.updateCalendarEvents();
    });
  }

  colors(role: string, status: string, invitationStatus: string): any {
    let color = '';

    if (role === 'ORGANIZADOR') {
      if (status === 'ABIERTA') {
        color = '#f48c06';
        return color; // Naranja si es organizador y está abierta
      } else if (status === 'CERRADA') {
        color = '#8d99ae';
        return color; // Gris si es organizador y está cerrada
      }
    } else if (role === 'ASISTENTE') {
      if (status === 'CERRADA') {
        color = '#8d99ae';
        return color; // Gris si está cerrada
      } else if (status === 'ABIERTA') {
        if (invitationStatus === 'ACEPTADA') {
          color = '#40916c';
          return color; // Verde si está aceptada
        } else if (invitationStatus === 'PENDIENTE') {
          color = '#1d3557';
          return color; // Gris si está pendiente
        } else if (invitationStatus === 'RECHAZADA') {
          color = '#e63946';
          return color; // Rojo si está rechazada
        }
      }
    }
  }

  //Metodo para traer las ausencias del backend //Metodo para traer las ausencias del backend
  getAbsences() {
    this.meetingService.getAbsences().subscribe((data: any) => {
      const absences = data.map((absence: any) => ({
        id: absence.id,
        title: absence.absenceType,
        startDate: absence.fromDateTime,
        endDate: absence.toDateTime,
        allDay: absence.allDayLong,
        color: '#ff85a1',
        status: null,
        invitationStatus: null,
      }));

      this.absences = absences;
      this.updateCalendarEvents();
    });
  }

  updateCalendarEvents() {
    const allEvents = [...this.meetings, ...this.absences];
    const calendarApi = this.calendarComponent.getApi();
    if (calendarApi) {
      calendarApi.removeAllEvents();
      this.calendarOptions = {
        ...this.calendarOptions,
        events: allEvents.map((event) => ({
          id: event.id,
          title: event.title,
          start: event['startDate'],
          end: event['endDate'],
          allDay: event.allDay,
          color: event.color,
          status: event['status'],
          invitationStatus: event['invitationStatus'],
        })),
      };
    } else {
      console.error('No se pudo obtener la instancia del calendario.');
    }
  }

  openErrorConfirmDialog() {
    const dialogRef = this.dialog.open(ErrorWorkScheduleLoadComponent, {
      data: {
        errorMessage:
          'No se encontraron horarios laborales. Requiere que un administrador cree unos.',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      //
      if (result) {
        // Ejecuta la acción si el usuario confirma
        this.router.navigate(['/']);
      }
    });
  }

  updateCalendarWorkHours() {
    //modal de error para cuando no se encuentren bloques horarios
    if (!this.workScheduleBlocks || this.workScheduleBlocks.length === 0) {
      this.openErrorConfirmDialog();

      return;
    }

    // Ordenar bloques por hora de inicio para determinar los límites globales
    const sortedBlocks = [...this.workScheduleBlocks].sort((a, b) =>
      a.startHour.localeCompare(b.startHour)
    );

    // Determinar la hora mínima (inicio del primer bloque)
    const slotMinTime = sortedBlocks[0].startHour;

    // Determinar la hora máxima (fin del último bloque) y ajustarla
    const lastBlockEndHour = sortedBlocks[sortedBlocks.length - 1].endHour;
    const slotMaxTime = this.adjustSlotMaxTime(lastBlockEndHour);

    // Configurar las horas laborales
    const businessHours = this.workScheduleBlocks.map((block) => ({
      daysOfWeek: [1, 2, 3, 4, 5], // De lunes a viernes
      startTime: block.startHour,
      endTime: block.endHour,
    }));

    // Actualizar las opciones del calendario de = forma que se hacía en ausencias y reuniones
    this.calendarOptions = {
      ...this.calendarOptions,
      slotMinTime, // Hora de inicio del calendario
      slotMaxTime, // Hora de fin del calendario
      businessHours, // Configurar bloques laborales
    };
  }

  // Método auxiliar para ajustar slotMaxTime
  adjustSlotMaxTime(endHour: string): string {
    // Separar las horas y minutos
    const [hour, minute] = endHour.split(':').map(Number);

    // Si el minuto no es 00, aumentar la hora en 1
    if (minute > 0) {
      return `${hour + 1}:00`;
    }

    // Si el minuto es 00, devolver la misma hora
    return `${hour}:00`;
  }

  //Metodo para inspeccionar una reunion
  inspeccionarReunion(clickInfo: any) {
    const event = clickInfo.event;

    if (event.extendedProps.status)
      this.router.navigate(['/inspect-meeting', event.id]);
  }

  crearReunion() {
    this.router.navigate(['/call-meeting']);
  }

  openLegendCalendarModal() {
    this.dialog.open(LegendCalendarComponent, {
      disableClose: true,
    });
  }
}
