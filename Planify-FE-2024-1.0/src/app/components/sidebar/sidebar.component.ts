import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppUser } from './AppUser';
import { InspectAdminService } from '../../inspect-admin/inspect-admin.service';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.custom';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDetailComponent } from './notification-detail.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  actualUser: AppUser = {} as AppUser;
  private readonly apiUrl = environment.apiUrl;

  notificationCount: number = 0; // Inicializado dinámicamente
  notifications: { id: string; message: string; reading_date: any | null }[] = [];
  showNotifications: boolean = false;

  constructor(
    private readonly client: HttpClient,
    private readonly router: Router,
    private readonly inspectServices: InspectAdminService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('SidebarComponent inicializado');
    if (typeof window !== "undefined") {
      const user = window.localStorage.getItem("user") as string;
      if (user) {
        this.getUser(user).subscribe(
          (resultado: any) => {
            this.actualUser.id = resultado.id;
            this.actualUser.name = resultado.name;
            this.actualUser.surnames = resultado.surname;
            this.actualUser.photo = resultado.photo;
            this.actualUser.dtype = resultado.type;

            if (this.actualUser.photo === null) {
              this.actualUser.photo = "../../../assets/register/userDefault.png";
            } else {
              this.actualUser.photo = 'data:image/png;base64,' + this.actualUser.photo;
            }

            // Cargar notificaciones del backend
            this.loadNotifications();
          },
          (error: any) => {
            console.error('Error fetching user:', error);
          }
        );
      }
    }
  }

  // Método para obtener el usuario
  getUser(jwt: string): Observable<any> {
    return this.client.get(`${this.apiUrl}/api/users/validateJWT`);
  }

  // Método para cargar las notificaciones del backend
  loadNotifications(): void {
    this.client.get<{ id: string; message: string; readingDate: string | null }[]>(
      `${this.apiUrl}/notifications/user`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    ).subscribe(
      (notifications) => {
        this.notifications = notifications.map(notification => ({
          ...notification,
          reading_date: notification.readingDate ? new Date(notification.readingDate) : null // Conversión explícita
        }));
        this.updateUnreadCount();
        this.sortNotifications();
      },
      (error) => {
        console.error('Error loading notifications:', error);
      }
    );
  }
  

  updateUnreadCount(): void {
    this.notificationCount = this.notifications.filter(n => n.reading_date == null).length;
    console.log("Las notificaciones son: ", this.notificationCount);
  }
  

  // Método para alternar las notificaciones
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  // Método para marcar notificación como leída
  markAsRead(notification: any, index: number): void {
    if (!notification.reading_date) {
      this.client.patch(
        `${this.apiUrl}/notifications/${notification.id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      ).subscribe(
        () => {
          notification.reading_date = new Date().toISOString();
          this.updateUnreadCount(); // Actualizar el conteo dinámicamente
          this.sortNotifications();
          console.log(`Notificación en el índice ${index} marcada como leída.`);
        },
        (error) => {
          console.error('Error marking notification as read:', error);
        }
      );
    }
  }
  

  // Método para descartar una notificación
  removeNotification(index: number, event: Event): void {
    event.stopPropagation();
    const notification = this.notifications[index];
    this.client.patch(
      `${this.apiUrl}/notifications/${notification.id}/discard`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    ).subscribe(
      () => {
        this.notifications.splice(index, 1); // Eliminar notificación de la lista
        this.updateUnreadCount(); // Actualizar el conteo dinámicamente
        console.log(`Notificación en el índice ${index} eliminada.`);
      },
      (error) => {
        console.error('Error discarding notification:', error);
      }
    );
  }
  
  

  // Método para abrir el detalle de una notificación
  openNotificationDetail(notification: string): void {
    this.dialog.open(NotificationDetailComponent, {
      data: { notification },
      width: '400px',
    });
  }

  // Método para ordenar las notificaciones
  sortNotifications(): void {
    this.notifications.sort((a, b) => {
      if (a.reading_date == null && b.reading_date != null) return -1; // Coloca no leídos al final
      if (a.reading_date != null && b.reading_date == null) return 1; // Coloca leídos al principio
      return (b.reading_date?.getTime() || 0) - (a.reading_date?.getTime() || 0); // Ordena por fecha
    });
  }
  

  // Método para cerrar sesión
  logOut(): void {
    this.router.navigate(["/home"]);
  }
}
