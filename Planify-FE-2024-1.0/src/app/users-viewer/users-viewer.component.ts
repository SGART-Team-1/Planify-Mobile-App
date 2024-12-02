import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-viewer',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './users-viewer.component.html',
  styleUrls: ['./users-viewer.component.css']
})
export class UsersViewerComponent {


  @Input() users: any[] = []; // Define users como un @Input
  @Output() userClick = new EventEmitter<any>(); // Define el EventEmitter
  @Input() selectedUser: any; // Define selectedUser como un @Input
  
  constructor() { }

  onUserClick(user: any): void {
    this.userClick.emit(user); // Emite el evento cuando se hace clic en un usuario

  }
  

}