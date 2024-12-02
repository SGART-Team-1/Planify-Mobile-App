import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-error-work-schedule-load',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './error-work-schedule-load.component.html',
  styleUrl: './error-work-schedule-load.component.css',
})
export class ErrorWorkScheduleLoadComponent {
  constructor(
    public dialogRef: MatDialogRef<ErrorWorkScheduleLoadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { errorMessage: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
