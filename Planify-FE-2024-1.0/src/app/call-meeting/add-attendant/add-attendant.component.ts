import { CommonModule, NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../users-viewer/users';
import { UserManagementService } from '../../user-management/user-management.service';
import { LegendModalComponent } from './legend-modal/legend-modal.component';
import { CallMeetingService } from '../call-meeting.service';

@Component({
  selector: 'app-add-attendant',
  standalone: true,
  imports: [FormsModule, NgClass, CommonModule, MatDialogModule, MatCardModule],
  templateUrl: './add-attendant.component.html',
  styleUrl: './add-attendant.component.css'
})
export class AddAttendantComponent {
  allAttendants: any[] = [];
  attendants: any[] = []; //usado para el filtro
  already_attending: any[] = []; // por si se cancela
  users: any[] = []; //usado para el filtro
  allUsers: any[] = [];
  selectedFilter: string = 'all';
  isLegendModalOpen: boolean = false;
  organizerId: string = '';
  dataInjected: any;

  constructor(private readonly dialog: MatDialog, public dialogRef: MatDialogRef<AddAttendantComponent>, @Inject(MAT_DIALOG_DATA) public data: { already_attending: any[], organizerId: string, fromDateTime: string, toDateTime: string, isAllday: boolean, meetingDate: string }, private readonly userViewerService: UserManagementService, private readonly callMeetingService: CallMeetingService) {
    this.already_attending = data.already_attending.slice();
    this.attendants = data.already_attending.slice();
    this.allAttendants = data.already_attending.slice();
    this.dataInjected = data;
    this.organizerId = data.organizerId;
    this.getAllUsers();

  }

  deleteAttendant(id: string) {
    this.users.push(this.attendants.find(attendant => attendant.id === id));
    this.allUsers.push(this.attendants.find(attendant => attendant.id === id));
    this.attendants = this.attendants.filter(attendant => attendant.id !== id);
    this.allAttendants = this.allAttendants.filter(attendant => attendant.id !== id);
  }
  addAttendant(id: string) {
    this.attendants.push(this.users.find(user => user.id === id));
    this.allAttendants.push(this.users.find(user => user.id === id));
    this.users = this.users.filter(user => user.id !== id);
    this.allUsers = this.allUsers.filter(user => user.id !== id);
  }

  onConfirm(): void {
    this.dialogRef.close(this.attendants);
  }

  onCancel(): void {
    this.dialogRef.close(this.already_attending);

  }
  getAllUsers(): void {
    this.callMeetingService.getCandidatesToMeeting(this.dataInjected.fromDateTime, this.dataInjected.toDateTime, this.dataInjected.isAllDay, this.dataInjected.meetingDate).subscribe(
      (users: any) => {
        this.users = users.sort((a: User, b: User) => a.surnames.localeCompare(b.surnames));; //usado para el filtro
        this.allUsers = users.sort((a: User, b: User) => a.surnames.localeCompare(b.surnames));; // Populate allUsers correctly

        //quitar el usuario actual que es el organizador
        this.allUsers = this.users.filter(user => user.id !== this.organizerId);
        this.users = this.users.filter(user => user.id !== this.organizerId);

        //quitar los usuarios que ya estan en la reunion para no poder añadirlos
        this.users = this.users.filter(user => !this.attendants.some(attendant => attendant.id === user.id));
        this.allUsers = this.allUsers.filter(user => !this.attendants.some(attendant => attendant.id === user.id));
      },
      (error) => {
        this.users = []; // Reset users array on error
      }
    );
  }






  onSearchUsers($event: Event) {
    const searchTerm = ($event.target as HTMLInputElement).value.toLowerCase();

    if (!searchTerm) {
      this.users = this.allUsers.slice();
    } else {
      this.users = this.allUsers.filter(
        (element) =>
          (element.name?.toLowerCase().includes(searchTerm)) ||
          (element.surnames?.toLowerCase().includes(searchTerm)) ||
          (element.email?.toLowerCase().includes(searchTerm))
      );
    }
  }
  onSearchAttendants($event: Event) {
    const searchTerm = ($event.target as HTMLInputElement).value.toLowerCase();

    if (!searchTerm) {
      this.attendants = this.allAttendants.slice();
    } else {
      this.attendants = this.allAttendants.filter(
        (element) =>
          (element.name?.toLowerCase().includes(searchTerm)) ||
          (element.surnames?.toLowerCase().includes(searchTerm)) ||
          (element.email?.toLowerCase().includes(searchTerm))
      );
    }
  }

  onFilterChange($event: Event) {
    this.selectedFilter = ($event.target as HTMLSelectElement).value;
    if (this.selectedFilter === 'Ausentes') {
      this.users = this.allUsers.filter((user) => user.hasAbsences);
    } else {
      this.users = this.allUsers;
    }
  }

  openLegendModal() {
    this.dialog.open(LegendModalComponent, {
      disableClose: true,
    });
  }



}
