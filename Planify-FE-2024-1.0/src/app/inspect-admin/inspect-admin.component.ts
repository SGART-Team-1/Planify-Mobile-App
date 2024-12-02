import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InspectAdminService } from '../inspect-admin/inspect-admin.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { AdminManagementService } from '../admin-management/admin-management.service';
import { MatDialog } from '@angular/material/dialog';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { Adminedit } from '../../assets/Types/types';
import { Admin } from '../admin-management/admins';
import { FailDialogEditDataComponent } from '../inspect-user/fail-dialog-edit-data/fail-dialog-edit-data.component';
import { AdviseModalComponent } from '../components/advise-modal/advise-modal';

@Component({
  selector: 'app-inspect-admin',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgClass,
    CommonModule,
    SidebarComponent,
  ],
  templateUrl: './inspect-admin.component.html',
  styleUrl: './inspect-admin.component.css',
})
export class InspectAdminComponent implements OnInit {
  admin: Admin = {} as Admin;
  email: string = '';
  name: string = '';
  surnames: string = '';
  center: string = '';
  confirmPwd: string = ''; // Campo para confirmar contraseña
  profileImageUrl: string = '';
  originalProfileImageUrl: string = ''; // Imagen original
  tempProfileImageUrl: string = ''; // Imagen temporal para previsualización
  showPassword: boolean = false;
  isEditing: boolean = false; // Controla si está en modo edición
  adminId: number = -1; // Id del usuario a modificar, puedes ajustarlo según tu lógica
  isImageUpdated: boolean = false;
  internal: boolean = true;

  isInvalidName: boolean = false;
  isInvalidSurnames: boolean = false;
  isEmptyName: boolean = false;
  isEmptySurnames: boolean = false;
  isEmptyCenter: boolean = false;
  isInvalidForm: boolean = false;

  constructor(
    private readonly dialog: MatDialog,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly inspectAdminService: InspectAdminService,
    private readonly AdminManagementService: AdminManagementService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const adminId = params.get('adminId');
      if (adminId && this.admin) {
        this.adminId = Number(adminId);
        this.loadAdmin(this.adminId);
      }
    });
  }

  loadAdmin(adminId: number) {
    // Cargar la información del usuario usando el servicio
    this.inspectAdminService.getAdmin(adminId).subscribe((admin) => {
      this.admin = admin;
      this.email = admin.email;
      this.name = admin.name;
      this.surnames = admin.surnames;
      this.center = this.admin.centre;
      this.internal = this.admin.internal;
      // Verificar si 'user.photo' ya incluye el prefijo

      // Verificar si 'user.photo' ya incluye el prefijo
      if (admin.photo && typeof admin.photo === 'string') {
        if (admin.photo.startsWith('data:image')) {
          this.originalProfileImageUrl = admin.photo;
        } else {
          this.originalProfileImageUrl = 'data:image/png;base64,' + admin.photo;
        }
      } else {
        this.originalProfileImageUrl = ''; // O una imagen por defecto
      }

      this.profileImageUrl = this.originalProfileImageUrl; // Usada para display inicial
      //this.pwd = admin.credentials.password;
    });
  }

  closeWindow() {
    this.router.navigate(['/admin-management']);
  }

  logOut() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  toggleEdit() {
    if (this.isEditing) {
      // Si se está cancelando la edición, revertir la imagen temporal
      this.tempProfileImageUrl = '';
      window.location.reload();
    }
    this.isEditing = !this.isEditing; // Cambiar entre modo de edición y vista
  }

  // Método para manejar la selección del archivo (si es necesario)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        // Verifica si el resultado es definido antes de asignarlo
        if (e.target?.result) {
          this.profileImageUrl = e.target.result as string;
        } else {
          this.profileImageUrl = ''; // O cualquier otro manejo que desees
        }
      };

      reader.readAsDataURL(file);
    }
  }

  // Método para activar el diálogo de selección de archivos
  triggerFileInput(): void {
    const fileInput = document.getElementById('profilePic') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  saveChanges() {
    if (this.isInvalidForm) {
      this.dialog.open(FailDialogEditDataComponent, { data: {
        titulo: 'Error al modificar los datos del administrador',
        error: 'Rellene los campos obligatorios sin errores, por favor.',
        }
      });
      return;
    }
    // Preparar la imagen para guardar si fue actualizada
    let photoToSave: string | undefined = undefined;
    if (this.isImageUpdated && this.tempProfileImageUrl) {
      // Extraer solo la parte base64 sin el prefijo
      const base64Index = this.tempProfileImageUrl.indexOf('base64,');
      if (base64Index !== -1) {
        photoToSave = this.tempProfileImageUrl.substring(base64Index + 7);
      } else {
        photoToSave = this.tempProfileImageUrl; // En caso de que no tenga el prefijo
      }
    
  } else {
    //si la foto no ha sido modificada, se mantiene la original quitando la cadena de base 64
    photoToSave = this.originalProfileImageUrl.replace(/^data:image\/[a-z]+;base64,/, '');
  }

    // Crear objeto con los datos modificados del usuario
    const updatedAdmin: Adminedit = {
      id: this.adminId,
      email: this.email,
      name: this.name,
      surnames: this.surnames,
      centre: this.center,
      photo: photoToSave, // Solo agrega la foto si fue actualizada
      internal: this.internal,
    };

    // Llamar al servicio para guardar los cambios
    this.inspectAdminService.updateAdmin(this.adminId, updatedAdmin).subscribe(
      resultado => {
        this.isEditing = false; // Desactivar modo edición
        this.isImageUpdated = false; // Resetear el estado de la imagen
        if (this.tempProfileImageUrl) {
          this.originalProfileImageUrl = this.tempProfileImageUrl; // Actualizar la imagen original
          this.tempProfileImageUrl = ''; // Limpiar la imagen temporal
          }
      },
      response => {
        
        this.dialog.open(AdviseModalComponent, {
          disableClose: true, data: { titulo: 'Error', error: response.error.message, cancelar: false, aceptar: true }
        });
    });
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;

        // Verificar si el resultado ya incluye el prefijo
        if (result.startsWith('data:image')) {
          this.tempProfileImageUrl = result;
        } else {
          this.tempProfileImageUrl = 'data:image/png;base64,' + result;
        }

        this.isImageUpdated = true;
      };
      reader.readAsDataURL(file);
    }
  }


  validateName(): void {
    this.isEmptyName = this.name.trim() == '';
    // Si contiene números u otros caracteres, se marca como inválido.
    this.isInvalidName = this.noNumbers(this.name);
    this.checkFormValidity();
  }

  validateSurnames(): void {
    this.isEmptySurnames = this.surnames.trim() == '';
    // Si contiene números u otros caracteres, se marca como inválido.
    this.isInvalidSurnames = this.noNumbers(this.surnames);
    this.checkFormValidity();
  }

  validateCenter(): void {
    this.isEmptyCenter = this.center.trim() == '';
    this.checkFormValidity();
  }

  noNumbers(input: string): boolean {
    let isInvalid = false;
    // Definimos una expresión regular que solo permite letras y espacios.
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    // Si no cumple (es decir, contiene números u otros caracteres), se marca como inválido=true.
    isInvalid = !regex.test(input);
    return isInvalid;
  }

  checkFormValidity() {
    this.isInvalidForm =
      this.isInvalidName ||
      this.isEmptyName ||
      this.isInvalidSurnames ||
      this.isEmptySurnames ||
      this.isEmptyCenter;
  }
}
