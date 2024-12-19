import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterService } from './register.service';
import { RegisterParams } from '../../assets/Types/types';
import { DobleFactorVerifyModalComponent } from '../login/doble-factor-verify-modal/doble-factor-verify-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { IonicModule} from '@ionic/angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgClass,
    CommonModule,
    IonicModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
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
        const base64Data = this.profileImageUrl.split(',')[1];

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
          (resultado) => {
            if (resultado.qr_code) {
              const dialogRef = this.dialog.open(
                DobleFactorVerifyModalComponent,
                {
                  data: { qr_code: resultado.qr_code },
                }
              );
              dialogRef.afterClosed().subscribe((resultado: any) => {
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
    this.isInvalidName = this.noNumbers(this.name);
    this.checkFormValidity();
  }

  validateSurnames(): void {
    this.isEmptySurnames = this.surnames.trim() == '';
    this.isInvalidSurnames = this.noNumbers(this.surnames);
    this.checkFormValidity();
  }

  noNumbers(input: string): boolean {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    return !regex.test(input);
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
    const regex =
      /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÄËÏÖÜäëïöüÀÈÌÒÙàèìòùÇç])(?=.*[a-záéíóúäëïöüàèìòùç])(?=.*[A-ZÁÉÍÓÚÄËÏÖÜÀÈÌÒÙÇ])(?=.*\d)(?=.*[!@#$%^&*(),.?":¿'¡+{}|<>_\-\/\\=\[\]`;ºª~€¬¨])[A-Za-zÁÉÍÓÚáéíóúÑñÄËÏÖÜäëïöüÀÈÌÒÙàèìòùÇç\d!@#$%^&*(),.?":¿'¡+{}|<>_\-\/\\=\[\]`;ºª~€¬¨]{8,}$/;
    return !regex.test(input);
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('profilePic') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.profileImageUrl = e.target.result;
        } else {
          this.profileImageUrl = null;
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