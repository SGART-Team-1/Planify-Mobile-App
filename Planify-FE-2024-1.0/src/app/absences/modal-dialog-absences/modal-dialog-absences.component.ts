import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog'; // Import MatDialogRef

@Component({
  selector: 'app-modal-dialog-absences',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './modal-dialog-absences.component.html',
  styleUrls: ['./modal-dialog-absences.component.css'] // Correct styleUrl to styleUrls
})
export class ModalDialogAbsencesComponent {

  constructor(private dialogRef: MatDialogRef<ModalDialogAbsencesComponent>) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  
}

