import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordRecoveryService } from '../password-recovery.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  email: string = "";
  pwd1: string = "";
  pwd2: string = "";
  token: string = "";
  respuesta: string = "";
  showPassword: boolean = false;


  constructor(private readonly router: Router, private readonly passwordRecoveryService: PasswordRecoveryService, private readonly route: ActivatedRoute) { }

  changePassword() {
    this.respuesta = "Cambiando contraseña...";
    if (this.pwd1 === "" || this.pwd2 === "" || this.email === "") {
      this.respuesta = "Complete todos los campos";
      return;
    }

    if (this.pwd1 !== this.pwd2) {
      this.respuesta = "Las contraseñas no coinciden";
      return;
    }

    if (this.passwordRequirements(this.pwd1)) {
      this.respuesta = "La contraseña no cumple con los requisitos de: al menos 8 caracteres, 1 mayuscula, 1 minuscula, 1 número y 1 carácter especial";
    }
    else {
      this.token = this.route.snapshot.queryParamMap.get('token')!;
      this.passwordRecoveryService.changePassword(this.email, this.pwd1, this.token).subscribe(
        (response) => {
          this.respuesta = response.resultado;
          this.router.navigate(["/home"]);
        },
        (error) => {
          this.respuesta = error.error.message
        }
      );
    }
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

}