import { Component, Input, OnInit } from '@angular/core';
import { ListAbsencesService } from './list-absences.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { InspectUserService } from '../../inspect-user/inspect-user.service';
import { User } from '../../users-viewer/users';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogAbsencesComponent } from '../modal-dialog-absences/modal-dialog-absences.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AdviseModalComponent } from '../../components/advise-modal/advise-modal';


@Component({
  selector: 'app-list-absences',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, NgFor, NgIf, SidebarComponent],
  templateUrl: './list-absences.component.html',
  styleUrl: './list-absences.component.css'
})

export class ListAbsencesComponent implements OnInit {

  @Input() absences: any[] = [];
  userId: number = 0;
  user: User = {} as User;
  error = '';

  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly ListAbsencesService: ListAbsencesService,
     private readonly dialog: MatDialog, private readonly InspectUserService: InspectUserService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = Number(params.get('userId'));
    });
    this.InspectUserService.getUser(this.userId).subscribe(
      (user: any) => {
        this.user = user;
      },
      error => {

      }
    );
    this.ListAbsencesService.getAbsences(this.userId).subscribe((data: any[]) => {
      this.absences = data.map(absence => {
        return {
          id: absence.id,
          allDayLong: absence.allDayLong,
          fromDateTime: this.formatDateTime(absence.fromDateTime, absence.allDayLong),
          toDateTime: this.formatDateTime(absence.toDateTime, absence.allDayLong),
          absenceType: absence.absenceType,
          userId: absence.userId
        };
      });
    });
  }


  deleteAbsence(absenceId: number) {
    const dialogRef = this.dialog.open(ModalDialogAbsencesComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.ListAbsencesService.deleteAbsence(absenceId).subscribe(
          resultado => {
            this.ngOnInit();
          },
          response => {
        
            this.dialog.open(AdviseModalComponent, {
              disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
            });
          }
        );
      }
    });
  }



  formatDateTime(dateTime: string, allDayLong: boolean): string {
    const date = new Date(dateTime);
    if (allDayLong) {
      // Devuelve solo la fecha (yyyy-MM-dd)
      return date.toLocaleDateString('en-CA');
    } else {
      // Devuelve fecha completa con hora (yyyy-MM-dd HH:mm:ss)
      const datePart = date.toLocaleDateString('en-CA'); // Fecha (yyyy-MM-dd)
      const timePart = date.toTimeString().split(' ')[0]; // Hora (HH:mm:ss)
      return `${datePart} ${timePart}`;
    }

  }

}
