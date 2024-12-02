import { Component } from '@angular/core';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { ListAbsencesComponent } from "./list-absences/list-absences.component";
import { AddAbsenceComponent } from '../absences/add-absence/add-absence.component';
import { Router } from '@angular/router';



@Component({
  selector: 'app-absences',
  standalone: true,
  imports: [SidebarComponent, ListAbsencesComponent, AddAbsenceComponent],
  templateUrl: './absences.component.html',
  styleUrl: './absences.component.css'
})
export class AbsencesComponent {
  constructor(private readonly router: Router) { }
  closeWindow() {
    this.router.navigate(["/user-management"]);
  }
}
