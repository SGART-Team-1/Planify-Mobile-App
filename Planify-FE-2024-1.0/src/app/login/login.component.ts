import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { LoginService } from './login.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule,  } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DobleFactorVerifyModalComponent } from './doble-factor-verify-modal/doble-factor-verify-modal.component';
import { FailDialogComponent } from './fail-dialog/fail-dialog.component';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = ""
  password: string = ""
  error: string = ""
  showPassword: boolean = false;
  dialogRef: any;
  isBlocked = false;
  remainingTime: number = 0;

  constructor(private readonly router: Router, private readonly loginService: LoginService, private readonly dialog: MatDialog) {

  }

  login() {

    this.error = "";
    if (!this.email || !this.password) {
      this.error = "Introduzca un email y una contraseña";
      return;
    }

    //Login
    this.loginService.login(this.email, this.password).subscribe(

      resultado => {
       
        if (resultado.body.role === "CommonUser") {
          this.dialogRef = this.dialog.open(DobleFactorVerifyModalComponent, { data: { userId: resultado.body.id } });

          this.dialogRef.afterClosed().subscribe((result: any) => {

            if (result) {
              this.redirectUser(resultado.body.role);
            
            }
            
          });
        } else if(resultado.body.role === "Administrator") {
          localStorage.setItem("user", resultado.headers?.get("Authorization").replace("Bearer ", ""));
          this.redirectUser(resultado.body.role);

        }
        
      },  
      error => {
        if (error.error.status === 403 && error.error.message === "IP bloqueada temporalmente") {
          this.isBlocked = true;
          console.log(this.isBlocked);
          this.startUnlockTimer();
        }
        this.dialog.open(FailDialogComponent);
      }
    );
  }
  
  redirectUser(role: string) {
    switch (role) {
      
      case 'Administrator': this.router.navigate(['/user-management']); break; // Redirigir a la página de administrador
      case 'CommonUser': this.router.navigate(['/user-calendar']); break;  // Redirigir a la página de usuario común
    }
}

startUnlockTimer() {
  const blockMinutes = 1; 
  this.remainingTime = blockMinutes * 60; 
  let interval = setInterval(() => {
    if (this.remainingTime > 0) {
      this.remainingTime--;
    } else {
      this.isBlocked = false;  
      clearInterval(interval); 
    }
  }, 1000);
}

}
