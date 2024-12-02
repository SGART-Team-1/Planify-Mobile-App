import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.custom';
import { MatDialog } from '@angular/material/dialog';
import { AdviseModalComponent } from '../components/advise-modal/advise-modal';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private readonly apiUrl = environment.apiUrl + '/api/users'; // URL base del backend

  constructor(private readonly client: HttpClient, private readonly dialog: MatDialog) {}

  getAllUsers() {
    return this.client.get(`${this.apiUrl}/showUsers`);
  }

  deleteUser(id: number): Observable<any> {
    return this.client.delete<any>(`${this.apiUrl}/${id}`);
  }

  blockUser(id: number): Observable<any> {
    return new Observable((observer) => {
      this.checkUserMeetings(id)
        .then((hasMeetings) => {
          if (hasMeetings) {
            this.showConfirmationDialog().subscribe((result) => {
              if (result) {
                this.performBlockUser(id, observer);
              } else {
                observer.next();
                observer.complete();
              }
            });
          } else {
            this.performBlockUser(id, observer);
          }
        })
        .catch((err) => observer.error(err));
    });
  }

  unBlockUser(id: number): Observable<any> {
    return this.client.put<any>(`${this.apiUrl}/${id}/unblock`, null);
  }

  activateUser(id: number): Observable<any> {
    return this.client.put<any>(`${this.apiUrl}/${id}/activate`, null);
  }

  // Métodos auxiliares para reducir la anidación
  private checkUserMeetings(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.get<boolean>(`${this.apiUrl}/${id}/hasOpenedMeetings`).subscribe(
        (response) => resolve(response),
        (err) => reject(err)
      );
    });
  }

  private showConfirmationDialog(): Observable<boolean> {
    const dialogRef = this.dialog.open(AdviseModalComponent, {
      disableClose: true,
      data: {
        titulo: 'Confirmar Acción',
        error: 'El usuario tiene reuniones abiertas',
        cancelar: true,
        aceptar: true,
      },
    });
    return dialogRef.afterClosed();
  }

  private performBlockUser(id: number, observer: any): void {
    this.client.put<any>(`${this.apiUrl}/${id}/block`, null).subscribe(
      (res) => {
        observer.next(res);
        observer.complete();
      },
      (err) => observer.error(err)
    );
  }
}
