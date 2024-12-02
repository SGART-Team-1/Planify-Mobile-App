import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Admin } from '../admin-management/admins';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { AdminManagementService } from '../admin-management/admin-management.service';
import { MatDialog } from '@angular/material/dialog';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { FailDialogEditDataComponent } from '../inspect-user/fail-dialog-edit-data/fail-dialog-edit-data.component';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [FormsModule, NgClass, CommonModule, SidebarComponent],
  templateUrl: './create-admin.component.html',
  styleUrl: './create-admin.component.css'
})
export class CreateAdminComponent {

  admin: Admin = {} as Admin;
  pwd: string = "*****************";


  isInvalidName: boolean = true;
  isInvalidSurnames: boolean = true;
  isInvalidPassword: boolean = false;
  isInvalidPassword2: boolean = true;
  isInvalidEmail: boolean = true;
  isInvalidForm: boolean = true;


  isEmptyName: boolean = true;
  isEmptySurnames: boolean = true;
  isEmptyCenter: boolean = true;
  isEmptyPassword: boolean = true;
  isEmptyPassword2: boolean = true;
  isEmptyEmail: boolean = true;

  center: string = ""
  email: string = ""
  name: string = ""
  surnames: string = ""
  pwd1: string = ""
  pwd2: string = ""
  showPassword: boolean = false;
  profileImageUrl: string | ArrayBuffer | null = '../../assets/register/userDefault.png';
  interno: boolean = false;

  constructor(private readonly dialog: MatDialog, private readonly route: ActivatedRoute, private readonly router: Router, private adminManagmentServices: AdminManagementService) { }

  validateName(): void {
    this.isEmptyName = this.name.trim() == '';
    this.isInvalidName = this.noNumbers(this.name);
    this.checkFormValidity();
  }
  validateSurnames(): void {
    this.isEmptySurnames = this.surnames.trim() == '';
    this.isInvalidSurnames = this.noNumbers(this.surnames);
    this.checkFormValidity();
  }

  validateCenter(): void {
    this.isEmptyCenter = this.center.trim() == '';
    this.checkFormValidity();
  }

  validateEmail(): void {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.isEmptyEmail = this.email.trim() === '';
    this.isInvalidEmail = !emailRegex.test(this.email);
    this.checkFormValidity();
  }

  validatePassword(): void {
    this.isEmptyPassword = this.pwd1.trim() == '';
    this.isInvalidPassword = this.passwordRequirements(this.pwd1);
    this.checkFormValidity();
  }

  validatePassword2(): void {
    this.isEmptyPassword2 = this.pwd2.trim() == '';
    this.isInvalidPassword2 = this.pwd1 !== this.pwd2 || this.passwordRequirements(this.pwd2);
    this.checkFormValidity();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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
      this.isEmptyCenter ||
      this.isInvalidEmail ||
      this.isEmptyEmail ||
      this.isInvalidPassword ||
      this.isEmptyPassword ||
      this.isEmptyPassword2 ||
      this.isInvalidPassword2;
  }

  // Método para activar el diálogo de selección de archivos
  triggerFileInput(): void {
    const fileInput = document.getElementById('profilePic') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
  // Método para manejar la selección del archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        // Verifica si el resultado es definido antes de asignarlo
        if (e.target?.result) {
          this.profileImageUrl = e.target.result;
        } else {
          this.profileImageUrl = null; // O cualquier otro manejo que desees
        }
      };

      reader.readAsDataURL(file);
    }
  }

  closeWindow() {
    this.router.navigate(["/admin-management"]);
  }

  logOut() {
    localStorage.removeItem("token");
    this.router.navigate(["/login"]);
  }

  crearAdmin() {

    if (this.isInvalidForm) {
      this.dialog.open(FailDialogEditDataComponent, { data: {
        titulo: 'Error al crear un administrador',
        error: 'Rellene los campos obligatorios sin errores, por favor.',
        }
      });
    } else {
      if (typeof this.profileImageUrl === 'string') {
        // Eliminar el prefijo base64 si existe
        const base64Data = this.profileImageUrl.split(',')[1]; // Solo obtiene la parte base64 pura

        this.adminManagmentServices.createAdmin(this.email, this.name, this.surnames, this.center, this.pwd1, this.pwd2, this.interno, base64Data).subscribe(
          result => {
            this.router.navigate(['/admin-management']);
          },
          response => {
            this.dialog.open(FailDialogEditDataComponent, { data: {
              titulo: 'Error inesperado',
              error: 'No se pudo completar la operación: ' + response.error.message,
              }
            }); 
          }
        )
      }
    }
  }

}
