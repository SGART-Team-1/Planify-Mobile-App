import { CommonModule, NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog'; // Import MatDialogRef



@Component({
  selector: 'app-advise-modal',
  standalone: true,
  imports: [MatDialogModule, NgClass, CommonModule],
  templateUrl: './advise-modal.html',
  styleUrl: './advise-modal.css'
})
export class AdviseModalComponent {

  constructor(public dialogRef: MatDialogRef<AdviseModalComponent>, @Inject(MAT_DIALOG_DATA) public data: { titulo: string, error: string, cancelar: boolean, aceptar: boolean }) { }

  aceptar: boolean = false;
  eliminar: boolean = false;

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);

  }

}
