import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-schedule-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  templateUrl: './schedule-confirm-dialog.component.html',
  styleUrl: './schedule-confirm-dialog.component.css',
})
export class ScheduleConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ScheduleConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { error: boolean; message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
