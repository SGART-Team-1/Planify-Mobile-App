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

  checkingIssue: boolean=true;
  checkingDate: boolean=true;
  checkingInitTime: boolean=true;
  checkingEndTime: boolean=true;
  checkingLocation: boolean=true;

  isInvalidIssue: boolean=true;
  isInvalidDate: boolean=false;
  isInvalidInitTime: boolean=false;
  isInvalidEndTime: boolean=false;
  isInvalidLocation: boolean=false;

  errorIssue: string='Rellene este campo.';
  errorDate: string='Rellene este campo.';
  errorInitTime: string='Rellene este campo.';
  errorEndTime: string='Rellene este campo.';
  errorLocation: string='Rellene este campo.'; 

  checkingIssue: boolean=true;
  checkingDate: boolean=true;
  checkingInitTime: boolean=true;
  checkingEndTime: boolean=true;
  checkingLocation: boolean=true;

  isInvalidIssue: boolean=true;
  isInvalidDate: boolean=false;
  isInvalidInitTime: boolean=false;
  isInvalidEndTime: boolean=false;
  isInvalidLocation: boolean=false;

  errorIssue: string='Rellene este campo.';
  errorDate: string='Rellene este campo.';
  errorInitTime: string='Rellene este campo.';
  errorEndTime: string='Rellene este campo.';
  errorLocation: string='Rellene este campo.'; 


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
    this.checkingDate=true;
    if(this.meetingDate.trim()===''){
      this.isInvalidDate=true;
      this.errorDate='Rellene este campo.';
    }else
      this.isInvalidDate=false;
      
    this.checkingDate=true;
    if(this.meetingDate.trim()===''){
      this.isInvalidDate=true;
      this.errorDate='Rellene este campo.';
    }else
      this.isInvalidDate=false;
      
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
    let invalidMeeting=false;
    this.checkAll();
    if (this.isMeetingDurationTooShort()) invalidMeeting=true;
    if (this.isMeetingSpanningMultipleWorkBlocks()) invalidMeeting=true;
    if (this.isStartTimeAfterEndTime()) invalidMeeting=true;
    if (this.isInvalidMeeting()) invalidMeeting=true;
    if (this.isOutsideWorkHours()) invalidMeeting=true;
    if (this.isMeetingDateInvalid()) invalidMeeting=true;
    if (this.hasNoAttendants()) invalidMeeting=true;
    let invalidMeeting=false;
    this.checkAll();
    if (this.isMeetingDurationTooShort()) invalidMeeting=true;
    if (this.isMeetingSpanningMultipleWorkBlocks()) invalidMeeting=true;
    if (this.isStartTimeAfterEndTime()) invalidMeeting=true;
    if (this.isInvalidMeeting()) invalidMeeting=true;
    if (this.isOutsideWorkHours()) invalidMeeting=true;
    if (this.isMeetingDateInvalid()) invalidMeeting=true;
    if (this.hasNoAttendants()) invalidMeeting=true;

    if (!invalidMeeting){
      this.createMeeting();
    }
  }
  isInvalidMeeting(){
    return this.isInvalidDate || this.isInvalidEndTime || this.isInvalidInitTime || this.isInvalidIssue || this.isInvalidLocation;
    if (!invalidMeeting){
      this.createMeeting();
    }
  }
  isInvalidMeeting(){
    return this.isInvalidDate || this.isInvalidEndTime || this.isInvalidInitTime || this.isInvalidIssue || this.isInvalidLocation;
  }

   isOutsideWorkHours(): boolean {
    if(this.isAllDay) return false;
    let isInvalidWorkHour=false;
    if (this.meetingInitTime < this.scheduleInitTime.slice(0.5) || this.meetingInitTime > this.schedulegEndTime.slice(0.5)){
      this.isInvalidInitTime=true;
      this.errorInitTime='La hora de inicio debe estar dentro del horario laboral.';
      isInvalidWorkHour= true;
    }
      
    if(this.meetingEndTime > this.schedulegEndTime.slice(0.5) || this.meetingEndTime < this.scheduleInitTime.slice(0.5)) {
      this.isInvalidEndTime=true;
      this.errorEndTime='La hora de fin debe estar dentro del horario laboral.';
      isInvalidWorkHour= true;
    if(this.isAllDay) return false;
    let isInvalidWorkHour=false;
    if (this.meetingInitTime < this.scheduleInitTime.slice(0.5) || this.meetingInitTime > this.schedulegEndTime.slice(0.5)){
      this.isInvalidInitTime=true;
      this.errorInitTime='La hora de inicio debe estar dentro del horario laboral.';
      isInvalidWorkHour= true;
    }
      
    if(this.meetingEndTime > this.schedulegEndTime.slice(0.5) || this.meetingEndTime < this.scheduleInitTime.slice(0.5)) {
      this.isInvalidEndTime=true;
      this.errorEndTime='La hora de fin debe estar dentro del horario laboral.';
      isInvalidWorkHour= true;
    }
    return isInvalidWorkHour;
    return isInvalidWorkHour;
  }

   isMeetingDateInvalid(): boolean {
    const today = new Date();
    const meetingDate = new Date(this.meetingDate);
    if (meetingDate < today) {
      this.isInvalidDate=true;
      this.errorDate='La fecha de la reunión debe ser posterior a la fecha actual';
      this.isInvalidDate=true;
      this.errorDate='La fecha de la reunión debe ser posterior a la fecha actual';
      return true;
    }
    return false;
  }

   isStartTimeAfterEndTime(): boolean {
    if(this.isAllDay) return false;
    if(this.isAllDay) return false;
    if (this.meetingInitTime > this.meetingEndTime) {
      this.isInvalidInitTime=true;
      this.errorInitTime='La hora de inicio debe ser menor a la hora de fin';
      this.isInvalidEndTime=true;
      this.errorEndTime='La hora de fin debe ser mayor a la hora de inicio';
      this.isInvalidInitTime=true;
      this.errorInitTime='La hora de inicio debe ser menor a la hora de fin';
      this.isInvalidEndTime=true;
      this.errorEndTime='La hora de fin debe ser mayor a la hora de inicio';
      return true;
    }
    return false;
  }

   isMeetingSpanningMultipleWorkBlocks(): boolean {
    if(this.isAllDay) return false;
    if(this.isAllDay) return false;
    for (let i = 0; i < this.workSchedules.length - 1; i++) {
      const currentEnd = this.workSchedules[i].endHour;
      const nextStart = this.workSchedules[i + 1].startHour;

      if (this.meetingInitTime < nextStart && this.meetingEndTime > currentEnd) {
        this.isInvalidEndTime=true;
        this.errorEndTime='La reunión no puede abarcar múltiples bloques de horario laboral';
        this.isInvalidEndTime=true;
        this.errorEndTime='La reunión no puede abarcar múltiples bloques de horario laboral';
        return true;
      }
    }
    return false;
  }

   isMeetingDurationTooShort(): boolean {
    if(this.isAllDay) return false;
    if(this.isAllDay) return false;
    const initTime = new Date('1970-01-01T' + this.meetingInitTime + ':00');
    const endTime = new Date('1970-01-01T' + this.meetingEndTime + ':00');
    const diff = endTime.getTime() - initTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 30) {
      this.isInvalidEndTime=true;
      this.errorEndTime='La reunión debe durar al menos 30 minutos';
      this.isInvalidEndTime=true;
      this.errorEndTime='La reunión debe durar al menos 30 minutos';
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

  deleteAttendant(id: string) {
    this.attendants = this.attendants.filter(
      (attendant) => attendant.id !== id
    );
  }

  deleteAttendant(id: string) {
    this.attendants = this.attendants.filter(
      (attendant) => attendant.id !== id
    );
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
    if(this.isAllDay){
      this.isInvalidInitTime=false;
      this.isInvalidEndTime=false;
    }else{
      this.onInitTimeChange();
      this.onEndTimeChange();
    }
  }

  onIssueChange(){
    this.checkingIssue=true;
    if(this.issue.trim()===''){
      this.isInvalidIssue=true;
    }else
      this.isInvalidIssue=false;
  }

  onInitTimeChange(){
    this.checkingInitTime=true;
    if(this.meetingInitTime<this.meetingEndTime)
      this.checkingEndTime=true;
      this.isInvalidEndTime=false;
    if(this.meetingInitTime.trim()===''){
      this.isInvalidInitTime=true;
    }else
      this.isInvalidInitTime=false;
  }

  onEndTimeChange(){
    this.checkingEndTime=true;
    if(this.meetingInitTime<this.meetingEndTime)
      this.checkingInitTime=true;
      this.isInvalidInitTime=false;
    if(this.meetingEndTime.trim()===''){
      this.isInvalidEndTime=true;
    }else
      this.isInvalidEndTime=false;
  }

  onLocationChange(){
    this.checkingLocation=true;
    if(this.location.trim()===''){
      this.isInvalidLocation=true;
    }else
      this.isInvalidLocation=false;
  }
    if(this.isAllDay){
      this.isInvalidInitTime=false;
      this.isInvalidEndTime=false;
    }else{
      this.onInitTimeChange();
      this.onEndTimeChange();
    }
  }

  onIssueChange(){
    this.checkingIssue=true;
    if(this.issue.trim()===''){
      this.isInvalidIssue=true;
    }else
      this.isInvalidIssue=false;
  }

  onInitTimeChange(){
    this.checkingInitTime=true;
    if(this.meetingInitTime<this.meetingEndTime)
      this.checkingEndTime=true;
      this.isInvalidEndTime=false;
    if(this.meetingInitTime.trim()===''){
      this.isInvalidInitTime=true;
    }else
      this.isInvalidInitTime=false;
  }

  onEndTimeChange(){
    this.checkingEndTime=true;
    if(this.meetingInitTime<this.meetingEndTime)
      this.checkingInitTime=true;
      this.isInvalidInitTime=false;
    if(this.meetingEndTime.trim()===''){
      this.isInvalidEndTime=true;
    }else
      this.isInvalidEndTime=false;
  }

  onLocationChange(){
    this.checkingLocation=true;
    if(this.location.trim()===''){
      this.isInvalidLocation=true;
    }else
      this.isInvalidLocation=false;
  }

  onOnlineChange() {
    this.isOnline = !this.isOnline;
    this.location = this.isOnline ? 'Online' : 'ESI';
    if(this.isOnline){
      this.isInvalidLocation=false;
    }else
      this.onLocationChange();
    if(this.isOnline){
      this.isInvalidLocation=false;
    }else
      this.onLocationChange();
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

  checkAll(){
    this.checkingLocation=false;
    this.checkingEndTime=false;
    this.checkingInitTime=false;
    this.checkingIssue=false;
    this.checkingDate=false;
  }

  checkAll(){
    this.checkingLocation=false;
    this.checkingEndTime=false;
    this.checkingInitTime=false;
    this.checkingIssue=false;
    this.checkingDate=false;
  }

  closeWindow() {
    this.router.navigate(["/user-calendar"]);
  }
}