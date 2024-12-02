
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgClass, CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Useredit } from '../../assets/Types/types';
import { User } from '../users-viewer/users';
import { MatDialog } from '@angular/material/dialog';
import { InspectUserService } from './inspect-user.service';
import { UserManagementCommonService } from '../user-management/user-management-common.service';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { FailDialogEditDataComponent } from './fail-dialog-edit-data/fail-dialog-edit-data.component';

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
  templateUrl: './inspect-user.component.html',
  styleUrls: ['./inspect-user.component.css'],
})
export class InspectUserComponent implements OnInit {
  user: User = {} as User;
  pwd1: string = '';
  email: string = '';
  name: string = '';
  surnames: string = '';
  department: string = '';
  center: string = '';
  profile: string = '';
  discharge_date: string = '';
  pwd2: string = ''; // Campo para confirmar contraseña
  isBlocked: boolean = false; /* false - notBlocked, true - Blocked */
  profileImageUrl: string = '';
  originalProfileImageUrl: string = ''; // Imagen original
  tempProfileImageUrl: string = ''; // Imagen temporal para previsualización
  showPassword: boolean = false;
  isEditing: boolean = false; // Controla si está en modo edición
  isPasswordChanging = false;
  userId: number = -1; // Id del usuario a modificar, puedes ajustarlo según tu lógica
  isImageUpdated: boolean = false;

  isInvalidName: boolean = false;
  isInvalidSurnames: boolean = false;
  isInvalidDischargeDate: boolean = false;
  isEmptyName: boolean = false;
  isEmptySurnames: boolean = false;
  isEmptyCenter: boolean = false;
  isEmptyDischargeDate: boolean = false;
  isInvalidForm: boolean = false;
  isInvalidPassword: boolean = false;
  isInvalidPassword2: boolean = false;
  isEmptyPassword: boolean = false;
  isEmptyPassword2: boolean = false;
  

  constructor(
    private readonly dialog: MatDialog,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: InspectUserService,
    private readonly userManagementCommon: UserManagementCommonService,
    private readonly location: Location
  ) { }

  ngOnInit(): void {
    // Inicializar datos del usuario al cargar la página
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('userId');
      if (userId && this.user) {
        this.userId = Number(userId);
        this.loadUser(this.userId);
      }
    });
  }

  // Modo edición
  toggleEdit() {
    if (this.isEditing) {
      this.tempProfileImageUrl = ''; // Si se está cancelando la edición, revertir la imagen temporal
      this.isPasswordChanging = false; // Modo edición pwd desactivado
      window.location.reload();
    }
    this.isEditing = !this.isEditing; // Cambiar entre modo de edición y vista
  }

  // Modo edición pwd
  toggleChangePassword() {
    // Vaciar las contraseñas cuando se active la edición
    this.pwd1 = '';
    this.pwd2 = '';
    // Cambiar entre modo de edición de contraseña y modo de edición normal
    this.isPasswordChanging = !this.isPasswordChanging;
    // Validar los campos pwd1 y pwd2 equivale a impedir guardar los cambios con esos campos vacíos.
    this.validatePassword(); 
  }

  loadUser(userId: number) {
    // Cargar la información del usuario usando el servicio
    this.userService.getUser(userId).subscribe((user) => {
      this.user = user;
      this.email = user.email;
      this.name = user.name;
      this.surnames = user.surnames;
      this.department = user.department;
      this.center = user.centre;
      this.profile = user.profile;
      this.discharge_date = user.registrationDate;
      this.isBlocked = user.isBlocked;
      this.pwd2 = this.pwd1;

      // Verificar si 'user.photo' ya incluye el prefijo
      if (user.photo && typeof user.photo === 'string') {
        if (user.photo.startsWith('data:image')) {
          this.originalProfileImageUrl = user.photo;
        } else {
          this.originalProfileImageUrl = 'data:image/png;base64,' + user.photo;
        }
      } else {
        this.originalProfileImageUrl = ''; // O una imagen por defecto
      }

      this.profileImageUrl = this.originalProfileImageUrl; // Usada para display inicial

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

  saveChanges() {
    if (this.isInvalidForm) {
      this.dialog.open(FailDialogEditDataComponent, { data: {
          titulo: 'Error al modificar los datos del usuario',
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
    } else if (this.originalProfileImageUrl) {
      // Si hay una imagen original, quitar el prefijo base64
      photoToSave = this.originalProfileImageUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    }

    // Crear objeto con los datos modificados del usuario
    const updatedUser: Useredit = {
      id: this.userId,
      email: this.email,
      name: this.name,
      surnames: this.surnames,
      department: this.department,
      centre: this.center,
      profile: this.profile,
      registrationDate: this.discharge_date,
      password: this.pwd1,
      confirmPassword: this.pwd2,
      photo: photoToSave, // Solo agrega la foto si fue actualizada
    };

    // Llamar al servicio para guardar los cambios
    this.userService.updateUser(this.userId, updatedUser).subscribe({
      next: (response) => {
        this.isEditing = false; // Desactivar modo edición
        this.isImageUpdated = false; // Resetear el estado de la imagen
        if (this.tempProfileImageUrl) {
          this.originalProfileImageUrl = this.tempProfileImageUrl; // Actualizar la imagen original
          this.tempProfileImageUrl = ''; // Limpiar la imagen temporal
        }

      },
      error: (response) => {
        this.dialog.open(FailDialogEditDataComponent, { data: {
          titulo: 'Error inesperado',
          error: 'No se pudo completar la operación: ' + response.error.message,
          }
        });
      },
    });
  }

  closeWindow() {
    if (window.history.length > 1) {
      this.location.back(); // Volver a la página anterior si hay un historial
    } else {
      this.logOut();
    }
    
  }

  logOut() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // Método para activar el diálogo de selección de archivos
  triggerFileInput(): void {
    const fileInput = document.getElementById('profilePic') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
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

  validateDischargeDate(): void {
    this.isEmptyDischargeDate = this.discharge_date.trim() === '';
    const discharge_date = new Date(this.discharge_date);
    this.isInvalidDischargeDate = isNaN(discharge_date.getDate()) || // Verifica formato de fecha
        discharge_date < new Date("2024-01-01") || // Verifica que no sea antes de 2024
        discharge_date > new Date(); // Verifica que no sea en el futuro
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

  validatePassword(): void {
    this.isEmptyPassword = this.pwd1.trim() == '';
    this.isInvalidPassword = this.passwordRequirements(this.pwd1);
    this.validatePassword2();
    this.checkFormValidity();
  }

  validatePassword2(): void {
    this.isEmptyPassword2 = this.pwd2.trim() == '';
    this.isInvalidPassword2 = this.pwd1 !== this.pwd2 || this.passwordRequirements(this.pwd2);
    this.checkFormValidity();
  }

  passwordRequirements(input: string): boolean {
    // - Al menos 8 caracteres
    // - Al menos 1 mayúscula
    // - Al menos 1 minúscula
    // - Al menos 1 número
    // - Al menos 1 carácter especial
    let isInvalid = false;
    const regex = /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÄËÏÖÜäëïöüÀÈÌÒÙàèìòùÇç])(?=.*[a-záéíóúäëïöüàèìòùç])(?=.*[A-ZÁÉÍÓÚÄËÏÖÜÀÈÌÒÙÇ])(?=.*\d)(?=.*[!@#$%^&*(),.?":¿'¡+{}|<>_\-\/\\=\[\]`;ºª~€¬¨])[A-Za-zÁÉÍÓÚáéíóúÑñÄËÏÖÜäëïöüÀÈÌÒÙàèìòùÇç\d!@#$%^&*(),.?":¿'¡+{}|<>_\-\/\\=\[\]`;ºª~€¬¨]{8,}$/;
    isInvalid = !regex.test(input);
    return isInvalid;
  }

  checkFormValidity() {
    this.isInvalidForm =
      this.isInvalidName ||
      this.isEmptyName ||
      this.isInvalidSurnames ||
      this.isEmptySurnames ||
      this.isEmptyCenter ||
      this.isEmptyDischargeDate ||
      this.isInvalidDischargeDate ||
      this.isInvalidPassword ||
      this.isInvalidPassword2 ||
      this.isEmptyPassword ||
      this.isEmptyPassword2;
  }



}
