import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog'; // Import MatDialogRef

@Component({
  selector: 'app-fail-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './fail-dialog.component.html',
  styleUrl: './fail-dialog.component.css'
})
export class FailDialogComponent {

  constructor(private readonly dialogRef: MatDialogRef<FailDialogComponent>) { }
  
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
