import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminManagementService } from '../admin-management/admin-management.service';
import { UsersViewerComponent } from "../users-viewer/users-viewer.component";
import { NgClass } from '@angular/common';
import { ModalDialogComponent } from '../user-management/modal-dialog/modal-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Admin } from './admins';
import { User } from '../users-viewer/users';
import { InspectAdminService } from '../inspect-admin/inspect-admin.service';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { AdviseModalComponent } from '../components/advise-modal/advise-modal';

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [UsersViewerComponent, NgClass, FormsModule, SidebarComponent],
  templateUrl: './admin-management.component.html',
  styleUrl: './admin-management.component.css'
})
export class AdminManagementComponent {

  isClicked = false;
  administradorSeleccionado: Admin | undefined;
  admins: Admin[] = [];
  allAdmins: Admin[] = [];
  selectedFilter: string = 'all';
  actualUser: User = {} as User;
  actualUserId: number = 0;


  constructor(private readonly router: Router, private readonly AdminManagementService: AdminManagementService, private readonly dialog: MatDialog, private readonly inspectServices: InspectAdminService) { }

  ngOnInit(): void {
    this.selectedFilter = 'all'; // Establecer el filtro en "Todos" al inicio
    this.getAlladmins();
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUserId = localStorage.getItem('user_id');
      this.actualUserId = storedUserId ? parseInt(storedUserId) : 0;
    }
    if (this.actualUserId != 0) {
      this.inspectServices.getAdmin(this.actualUserId).subscribe(
        (user: any) => {
          this.actualUser = user;
        });

    }
  }

  accionCompleted() {
    this.isClicked = false;
    this.administradorSeleccionado = undefined;
    this.selectedFilter = 'all'; // Establecer el filtro en "Todos" al hace cambios
    this.getAlladmins();
  }

  getAlladmins() {
    this.AdminManagementService.getAllAdmins().subscribe(
      (admins: any) => {
        this.admins = admins.sort((a: Admin, b: Admin) => a.surnames.localeCompare(b.surnames));; //usado para el filtro
        this.allAdmins = admins.sort((a: Admin, b: Admin) => a.surnames.localeCompare(b.surnames));; //usado para el filtro;

      },
      error => {
        this.admins = []; // Reset admins array on error
      }
    );
  }



  onSearch($event: Event) {
    const searchTerm = ($event.target as HTMLInputElement).value.toLowerCase();
    if (!searchTerm) {
      this.getAlladmins(); // Reset to all admins if search term is empty
    } else {
      this.admins = this.admins.filter(admin =>
        (admin.name?.toLowerCase().includes(searchTerm)) ||
        (admin.surnames?.toLowerCase().includes(searchTerm)) ||
        (admin.email?.toLowerCase().includes(searchTerm))
      );
    }
  }




  openModalDialog(accion: string): void {
    const dialogRef = this.dialog.open(ModalDialogComponent, {
      data: { user: this.administradorSeleccionado, accion: accion }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (accion === "eliminar") {
          this.deleteItem();
        }
      }
    });
  }

  deleteItem(): void {
    if (this.administradorSeleccionado) {//Validar que el usuario seleccionado no sea nulo
      this.AdminManagementService.deleteAdmin(this.administradorSeleccionado.id).subscribe(
        resultado => {
          this.accionCompleted();
        },
        response => {
          this.accionCompleted();
          this.dialog.open(AdviseModalComponent, {
            disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
          });
        }
      );
    }
  }

  //Aqui puedes manejar la lógica cuando se hace clic en un usuario
  //este es un simple ejemplo  
  onUserClick(adminClick: any): void {
    this.administradorSeleccionado = adminClick;
    this.isClicked = true;
  }


  inspectAdmin() {
    if (this.administradorSeleccionado) {
      this.router.navigate(['/inspect-admin', this.administradorSeleccionado.id]);
    }
  }

  createAdmin() {
      this.router.navigate(['/create-admin']);
  }

  inspecActualAdmin() {
    if (this.actualUser) {
      this.router.navigate(['/inspect-admin', this.actualUser.id]);
    }
  }

}
