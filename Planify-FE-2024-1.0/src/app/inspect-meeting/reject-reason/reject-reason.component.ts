import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reject-reason',
  standalone: true,
  imports: [FormsModule, NgClass, CommonModule, MatDialogModule, MatCardModule],
  templateUrl: './reject-reason.component.html',
  styleUrl: './reject-reason.component.css'
})
export class RejectReasonComponent {
 reason: string="";
 constructor(private readonly dialog: MatDialog, public dialogRef: MatDialogRef<RejectReasonComponent>){

 }
 onCancel(): void {
  this.dialogRef.close("");
 }
 onConfirm(): void {
  this.dialogRef.close(this.reason);
 }
}
