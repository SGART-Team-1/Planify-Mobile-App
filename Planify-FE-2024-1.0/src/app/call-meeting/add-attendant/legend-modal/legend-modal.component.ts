import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-legend-modal',
  standalone: true,
  imports: [MatDialogModule, MatCardModule],
  templateUrl: './legend-modal.component.html',
  styleUrl: './legend-modal.component.css'
})
export class LegendModalComponent {

  constructor(public dialogRef: MatDialogRef<LegendModalComponent>) {}
  closeLegendModal() {
    this.dialogRef.close();
  }
}
