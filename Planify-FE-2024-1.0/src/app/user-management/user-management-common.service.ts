import { Injectable } from '@angular/core';
import { UserManagementService } from './user-management.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { User } from '../users-viewer/users';
import { AdviseModalComponent } from '../components/advise-modal/advise-modal';

@Injectable({
  providedIn: 'root'
})
export class UserManagementCommonService {



  constructor(private readonly userViewerService: UserManagementService, private readonly dialog: MatDialog) { }


  openModalDialog(accion: string, usuairoSeleccionado: User, callback?: () => void): void {
    const dialogRef = this.dialog.open(ModalDialogComponent, {
      data: { user: usuairoSeleccionado, accion: accion }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ejecutar la acción correspondiente basada en el tipo de acción
        let actionObservable;
        if (accion === "eliminar") {
          actionObservable = this.userViewerService.deleteUser(usuairoSeleccionado.id);
        } else if (accion === "Bloquear") {
          actionObservable = this.userViewerService.blockUser(usuairoSeleccionado.id);
        } else if (accion === "Activar") {
          actionObservable = this.userViewerService.activateUser(usuairoSeleccionado.id);
        } else if (accion === "Desbloquear") {
          actionObservable = this.userViewerService.unBlockUser(usuairoSeleccionado.id);
        }

        if (actionObservable) {
          actionObservable.subscribe({
            next: (response) => {
              if (callback) {
                callback(); // Esto debería llamar a accionCompleted
              }
            },
            error: (err) => {
              console.error('Error ejecutando la acción:', err);
              // Asegúrate de manejar el error también
              if (callback) {
                callback(); // Esto también llamará a accionCompleted
              }
            }
          });

        }
      }
    });
  }


  deleteUser(id: number): void {
    this.userViewerService.deleteUser(id).subscribe(
      respuesta => { 
      },
      response => {
        this.dialog.open(AdviseModalComponent, {
          disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
        });
    });
  }

  bloqUser(id: number): void {
    this.userViewerService.blockUser(id).subscribe(
      respuesta => { 
      },
      response => {
        this.dialog.open(AdviseModalComponent, {
          disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
        });
    });

  }

  desBloqUser(id: number): void {
    this.userViewerService.unBlockUser(id).subscribe(
      respuesta => { 
      },
      response => {
        this.dialog.open(AdviseModalComponent, {
          disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
        });
    });

  }

  activateUser(id: number): void {
    this.userViewerService.activateUser(id).subscribe(
      respuesta => { 
      },
      response => {
        this.dialog.open(AdviseModalComponent, {
          disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
        });
    });

  }
}
