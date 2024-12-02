import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-legend-calendar',
  standalone: true,
  imports: [MatDialogModule, MatCardModule],
  templateUrl: './legend-calendar.component.html',
  styleUrl: './legend-calendar.component.css'
})
export class LegendCalendarComponent {
  constructor(public dialogRef: MatDialogRef<LegendCalendarComponent>) {}
  closeLegendModal() {
    this.dialogRef.close();
  }
}
