import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersViewerComponent } from '../users-viewer/users-viewer.component';
import { NgClass } from '@angular/common';
import { User } from '../users-viewer/users';
import { UserManagementService } from './user-management.service';
import { FormsModule } from '@angular/forms';
import { UserManagementCommonService } from './user-management-common.service';
import { InspectAdminService } from '../inspect-admin/inspect-admin.service';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [UsersViewerComponent, NgClass, FormsModule, SidebarComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent {
  isClicked = false;
  usuairoSeleccionado: User | undefined;
  users: User[] = []; //usado para el filtro
  allUsers: User[] = [];
  selectedFilter: string = 'all';
  btnBloquear: string = 'Bloquear/Desbloquear';
  actualUser: User = {} as User;
  actualUserId: number = 0;
  isLegendModalOpen: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly userViewerService: UserManagementService,
    private userCommonServices: UserManagementCommonService,
    private inspectServices: InspectAdminService
  ) { }

  ngOnInit(): void {
    this.selectedFilter = 'all'; // Establecer el filtro en "Todos" al inicio
    this.getAllUsers();
  }

  accionCompleted() {
    this.isClicked = false;
    this.usuairoSeleccionado = undefined;
    this.btnBloquear = 'Bloquear/Desbloquear';
    this.selectedFilter = 'all'; // Establecer el filtro en "Todos" al hace cambios
    this.getAllUsers();
  }

  openModalDialog(accion: string): void {
    if (this.usuairoSeleccionado) {
      this.userCommonServices.openModalDialog(
        accion,
        this.usuairoSeleccionado,
        () => {
          // Esta función se llamará después de que el modal se cierre y se manejen las acciones.
          this.accionCompleted();
        }
      );
    }
  }

  getAllUsers(): void {
    this.userViewerService.getAllUsers().subscribe(
      (users: any) => {
        
        this.users = users.sort((a: User, b: User) => a.surnames.localeCompare(b.surnames));; //usado para el filtro
        this.allUsers = users.sort((a: User, b: User) => a.surnames.localeCompare(b.surnames));; // Populate allUsers correctly
      },
      (error) => {
        this.users = []; // Reset users array on error
      }
    );
  }

  onSearch($event: Event) {
    const searchTerm = ($event.target as HTMLInputElement).value.toLowerCase();

    if (!searchTerm) {
      this.getAllUsers(); // Reset to all users if search term is empty
    } else {
      this.users = this.allUsers.filter(
        (user) =>
          (user.name?.toLowerCase().includes(searchTerm)) ||
          (user.surnames?.toLowerCase().includes(searchTerm)) ||
          (user.email?.toLowerCase().includes(searchTerm))
      );
    }
  }

  onFilterChange($event: Event) {
    this.selectedFilter = ($event.target as HTMLSelectElement).value;
    if (this.selectedFilter === 'Bloqueados') {
      this.users = this.allUsers.filter((user) => user.blocked);
    } else if (this.selectedFilter === 'Desbloqueados') {
      this.users = this.allUsers.filter((user) => !user.blocked && user.activated);
    } else if (this.selectedFilter === 'Activos') {
      this.users = this.allUsers.filter((user) => user.activated);
    } else if (this.selectedFilter === 'No activos') {
      this.users = this.allUsers.filter((user) => !user.activated);
    } else {
      this.users = this.allUsers;
    }
  }

  openLegendModal() {
    this.isLegendModalOpen = true;
  }

  closeLegendModal() {
    this.isLegendModalOpen = false;
  }

  //Aqui puedes manejar la lógica cuando se hace clic en un usuario
  //este es un simple ejemplo
  onUserClick(userClick: any): void {
    this.usuairoSeleccionado = userClick;
    this.isClicked = true;
    if (this.usuairoSeleccionado) {
      if (
        (this.usuairoSeleccionado.blocked &&
          this.usuairoSeleccionado.activated) 
      ) {
        this.btnBloquear = 'Desbloquear';
      } else if(!this.usuairoSeleccionado.blocked &&
          !this.usuairoSeleccionado.activated) {
          this.btnBloquear = 'Activar';
      } else {
        this.btnBloquear = 'Bloquear';
      }
    }
  }

  inspectUser() {
    if (this.usuairoSeleccionado) {
      this.router.navigate(['/inspect-user', this.usuairoSeleccionado.id]);
    }
  }

  gestionarAusencias() {
    if (this.usuairoSeleccionado) {
      this.router.navigate(['/absences', this.usuairoSeleccionado.id]);
    }
  }

  inspecActualAdmin() {
    if (this.actualUser) {
      this.router.navigate(['/inspect-admin', this.actualUser.id]);
    }
  }

}
