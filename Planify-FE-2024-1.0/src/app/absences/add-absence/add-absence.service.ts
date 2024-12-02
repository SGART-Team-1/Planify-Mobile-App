import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.custom';
import { AdviseModalComponent } from '../../components/advise-modal/advise-modal';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class AddAbsenceService {
 
  constructor(private readonly client: HttpClient, private readonly dialog: MatDialog) { }
  
  private readonly apiUrl = environment.apiUrl + '/absences';

  confirmAbsence(allDayLong: boolean, fromDate: string, fromTime: string, toDate: string, toTime: string, absenceType: string): Observable<any> {
    const userId = window.location.pathname.split('/').pop();
    let info = {
      allDayLong: allDayLong,
      fromDate: fromDate,
      fromTime: fromTime,
      toDate: toDate,
      toTime: toTime,
      absenceType: absenceType,
      userId: userId,
      overlapsMeeting: false
    }
    return new Observable((observer)=> {
      this.client.put(this.apiUrl+'/checkMeetingOverlap', info).subscribe((response) => {
        if (response === true) {
          const dialogRef = this.dialog.open(AdviseModalComponent, {
            disableClose: true, data: { titulo: 'Confirmar Acción', error: 'El usuario tiene alguna reunión que se solapa con la ausencia, aceptar las cancelará o rechazará.', cancelar: true, aceptar: true }
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
              info.overlapsMeeting = true;
              this.client.post(this.apiUrl+'/create', info).subscribe(
                (res) => {
                  observer.next(res);
                  observer.complete();
                },
                (err) => observer.error(err)
              );
            } else {
              observer.next();
              observer.complete();
            }
          });
        } else {
          this.client.post(this.apiUrl+'/create', info).subscribe(
            (res) => {
              observer.next(res);
              observer.complete();
            },
            (err) => observer.error(err)
          );
        }
      });
    });
  }
}