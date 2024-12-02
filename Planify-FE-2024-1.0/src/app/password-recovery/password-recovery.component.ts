import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordRecoveryService } from './password-recovery.service';
import { RouterModule } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';


@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.css'
})
export class PasswordRecoveryComponent {
  email: string = "";
  respuesta: string = "";
  isClicked = false;


  constructor(private readonly passwordRecoveryService: PasswordRecoveryService) { }

  sendEmail() {

    //Comprobamos que el email sea correcto y no este vacio
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (this.email === "" || !emailPattern.test(this.email)) {
      this.respuesta = "Introduzca un email correcto en el formato usuario@dominio.com";
      return;
    }

    this.respuesta = "Enviando email...";
    this.isClicked = !this.isClicked;//establecer un tiempo de espera para el boton
    setTimeout(() => {
      this.isClicked = false;
    }, 10000);

    this.passwordRecoveryService.sendEmail(this.email).subscribe(
      (response) => {
        this.respuesta = response.resultado;
      },
      (error) => {
        this.respuesta = error.error.message;
      }
    );
  }




}
