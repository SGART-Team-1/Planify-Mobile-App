import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../users-viewer/users';
@Component({
  selector: 'app-modal-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './modal-dialog.component.html',
  styleUrl: './modal-dialog.component.css'
})
export class ModalDialogComponent {

  user: User | undefined;

  constructor(public dialogRef: MatDialogRef<ModalDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { user: User, accion: string }) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);

  }
}

