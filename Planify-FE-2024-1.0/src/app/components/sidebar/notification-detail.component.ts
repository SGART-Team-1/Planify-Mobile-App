import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-notification-detail',
    template: `
      <div class="popup-container">
        <h2 class="popup-title">Detalles de Notificación</h2>
        <p class="popup-text">{{ data.notification }}</p>
        <button class="popup-close-button" mat-button (click)="close()">Cerrar</button>
      </div>
    `,
    styles: [`
      .popup-container {
        background-color: #ffffff; /* Fondo blanco puro */
        border: 1px solid #ccc; /* Borde más claro */
        border-radius: 8px; /* Bordes ligeramente redondeados */
        padding: 20px;
        max-width: 400px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); /* Sombra más definida */
        font-family: 'Arial', sans-serif;
        text-align: left; /* Alineación izquierda */
      }
  
      .popup-title {
        font-size: 1.25rem; /* Título más proporcionado */
        margin-bottom: 15px;
        color: #444; /* Texto más neutral */
        font-weight: 600;
        border-bottom: 1px solid #ddd; /* Separación visual */
        padding-bottom: 5px;
      }
  
      .popup-text {
        font-size: 1rem;
        color: #555; /* Texto ligeramente más claro */
        margin-bottom: 20px;
        line-height: 1.6; /* Mejora la legibilidad */
      }
  
      .popup-close-button {
        background-color: #007bff; /* Azul estándar */
        color: white;
        font-size: 0.9rem;
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: block;
        margin: 0 auto; /* Centrado */
      }
  
      .popup-close-button:hover {
        background-color: #0056b3; /* Azul más oscuro al pasar el ratón */
      }
    `]
  })
  export class NotificationDetailComponent {
    constructor(
      @Inject(MAT_DIALOG_DATA) public data: { notification: string },
      private readonly dialogRef: MatDialogRef<NotificationDetailComponent>
    ) {}
  
    close(): void {
      this.dialogRef.close(); // Cierra el diálogo
    }
  }
  