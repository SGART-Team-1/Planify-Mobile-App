import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgClass, CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterService } from './register.service';
import { RegisterParams } from '../../assets/Types/types';
import { DobleFactorVerifyModalComponent } from '../login/doble-factor-verify-modal/doble-factor-verify-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgClass,
    CommonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class RegisterComponent {
  email: string = '';
  name: string = '';
  surnames: string = '';
  department: string = '';
  center: string = '';
  profile: string = '';
  discharge_date: string = '';
  pwd1: string = '';
  pwd2: string = '';
  profileImageUrl: string | ArrayBuffer | null =
    '../../assets/register/userDefault.png';
  error: string = '';
  showPassword: boolean = false;

  isInvalidName: boolean = true;
  isInvalidSurnames: boolean = true;
  isInvalidPassword: boolean = false;
  isInvalidPassword2: boolean = true;
  isInvalidEmail: boolean = true;
  isInvalidForm: boolean = true;

  isEmptyName: boolean = true;
  isEmptySurnames: boolean = true;
  isEmptyPassword: boolean = true;
  isEmptyPassword2: boolean = true;
  isEmptyEmail: boolean = true;
  constructor(
    private readonly registerService: RegisterService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}

  register() {
    if (!this.isInvalidForm) {
      if (typeof this.profileImageUrl === 'string') {
        // Eliminar el prefijo base64 si existe
        const base64Data = this.profileImageUrl.split(',')[1]; // Solo obtiene la parte base64 pura

        const params: RegisterParams = {
          email: this.email,
          name: this.name,
          surnames: this.surnames,
          department: this.department,
          center: this.center,
          profile: this.profile,
          discharge_date: this.discharge_date,
          pwd1: this.pwd1,
          pwd2: this.pwd2,
          profileImageUrl: base64Data,
        };

        this.registerService.register(params).subscribe(
          resultado => {
            if (resultado.qr_code) {
              const dialogRef = this.dialog.open(
                DobleFactorVerifyModalComponent,
                {
                  data: { qr_code: resultado.qr_code },
                }
              );
              dialogRef.afterClosed().subscribe((resultado: any) => { //COmprobar, he metido la pezuña GONZALO
                if (resultado) {
                  this.router.navigate(['/']);
                  window.scrollTo(0, 0);
                }
              });
            }
          },
          (error) => {
            this.error = error.error.message;
          }
        );
      }
    } else {
      this.error = 'Rellene todos los campos obligatorios sin errores';
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
    this.isInvalidPassword2 =
      this.pwd1 !== this.pwd2 || this.passwordRequirements(this.pwd2);
    this.checkFormValidity();
  }

  passwordRequirements(input: string): boolean {
    // - Al menos 8 caracteres
    // - Al menos 1 mayúscula
    // - Al menos 1 minúscula
    // - Al menos 1 número
    // - Al menos 1 carácter especial
    let isInvalid = false;
    const regex =
      /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÄËÏÖÜäëïöüÀÈÌÒÙàèìòùÇç])(?=.*[a-záéíóúäëïöüàèìòùç])(?=.*[A-ZÁÉÍÓÚÄËÏÖÜÀÈÌÒÙÇ])(?=.*\d)(?=.*[!@#$%^&*(),.?":¿'¡+{}|<>_\-\/\\=\[\]`;ºª~€¬¨])[A-Za-zÁÉÍÓÚáéíóúÑñÄËÏÖÜäëïöüÀÈÌÒÙàèìòùÇç\d!@#$%^&*(),.?":¿'¡+{}|<>_\-\/\\=\[\]`;ºª~€¬¨]{8,}$/;
    isInvalid = !regex.test(input);
    return isInvalid;
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

  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.isEmptyEmail = this.email.trim() === '';
    this.isInvalidEmail = !emailRegex.test(this.email);
    this.checkFormValidity();
  }

  checkFormValidity() {
    this.isInvalidForm =
      this.isInvalidName ||
      this.isEmptyName ||
      this.isInvalidSurnames ||
      this.isEmptySurnames ||
      this.center.trim() === '' ||
      this.discharge_date.trim() === '' ||
      this.isInvalidEmail ||
      this.isEmptyEmail ||
      this.isInvalidPassword ||
      this.isEmptyPassword ||
      this.isEmptyPassword2 ||
      this.isInvalidPassword2;
  }
}
