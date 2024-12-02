import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog'; // Import MatDialogRef



@Component({
  selector: 'app-fail-dialog-inspect-user',
  standalone: true,
  imports:  [MatDialogModule],
  templateUrl: './fail-dialog-edit-data.component.html',
  styleUrl: './fail-dialog-edit-data.component.css'
})
export class FailDialogEditDataComponent {

  constructor(public dialogRef: MatDialogRef<FailDialogEditDataComponent>, @Inject(MAT_DIALOG_DATA) public data: { titulo: string, error: string, info?: string }) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

}
