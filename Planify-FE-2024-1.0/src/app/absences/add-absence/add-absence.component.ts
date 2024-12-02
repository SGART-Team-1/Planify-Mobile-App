import { Component } from '@angular/core';
import { AddAbsenceService } from './add-absence.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { User } from '../../users-viewer/users';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MatDialog } from '@angular/material/dialog';
import { AdviseModalComponent } from '../../components/advise-modal/advise-modal';

@Component({
  selector: 'app-add-absence',
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, NgClass, SidebarComponent],
  templateUrl: './add-absence.component.html',
  styleUrl: './add-absence.component.css'
})
export class AddAbsenceComponent {

  allDayLong: boolean = true
  fromDate: string = ""
  fromTime: string = ""
  toDate: string = ""
  toTime: string = ""
  absenceType: string = ""
  userId: number = 0;
  user: User = {} as User;
  error: string = ""

  constructor( private readonly AddAbsenceService: AddAbsenceService, private readonly dialog: MatDialog ) {
  }

  confirmAbsence() {

    this.error = "";

    if (!this.fromDate || !this.toDate ||  (!this.allDayLong && (!this.fromTime || !this.toTime))) {
      this.error = "Introduzca la fecha y hora de inicio y fin";
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: this.error, cancelar: false, aceptar: true }
      });
      return;
    } else if (this.fromDate == this.toDate && this.fromTime > this.toTime) {
      this.error = "La hora de inicio no puede ser posterior a la hora de fin";
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: this.error, cancelar: false, aceptar: true }
      });
      return;
    }
    else if (this.fromDate > this.toDate) {
      this.error = "La fecha de inicio no puede ser posterior a la fecha de fin";
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: this.error, cancelar: false, aceptar: true }
      });
      return;
    }
    else if (this.fromDate == this.toDate && this.fromTime == this.toTime && !this.allDayLong) {
      this.error = "La hora de inicio no puede ser igual a la hora de fin";
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: this.error, cancelar: false, aceptar: true }
      });
      return;
    }
    else if (!this.absenceType) {
      this.error = "Introduzca el tipo de ausencia";
      this.dialog.open(AdviseModalComponent, {
        disableClose: true, data: { titulo: 'Error', error: this.error, cancelar: false, aceptar: true }
      });
      return;
    }

    this.AddAbsenceService.confirmAbsence(this.allDayLong, this.fromDate, this.fromTime, this.toDate, this.toTime, this.absenceType).subscribe(
      resultado => {
          window.location.reload();
      },
      response => {
        
        this.dialog.open(AdviseModalComponent, {
          disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
        });
      }

    );

  }

  cancelAbsence() {
    window.location.reload();
  }

}
