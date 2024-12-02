
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ModalDialogComponent } from '../../user-management/modal-dialog/modal-dialog.component';
import { LoginService } from '../login.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doble-factor-verify-modal',
  standalone: true,
  imports: [MatDialogModule, CommonModule, FormsModule],
  templateUrl: './doble-factor-verify-modal.component.html',
  styleUrl: './doble-factor-verify-modal.component.css'
})
export class DobleFactorVerifyModalComponent {
  constructor(private readonly loginService: LoginService,
    public dialogRef: MatDialogRef<ModalDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { qr_code: string , userId:number}) { }

  hasQr: boolean = false;
  verificationcode: number | undefined;
  messageSiQr: string = "Introduce el código de 6 dígitos que aparece en tu app de Google Authenticator";
  messageNoQr: string = 'Escanea el siguiente código QR con tu app de Google Authenticator para añadirlo a tu cuenta. <strong>Esta acción es única y solo se puede hacer una vez</strong>';
  message: string = this.messageSiQr;
  error: string = "";
  userId: number | undefined
  qrCode: string | undefined
  ngOnInit(): void {
    this.userId = this.data.userId;
    if (this.data.qr_code) {
      this.hasQr = true;
      this.message = this.messageNoQr;
      this.qrCode = this.data.qr_code;
    }
  }

  onGoverify(): void {
    this.dialogRef.close(true);
  }

  onVerify(): void {
    if (this.verificationcode !== undefined && this.verificationcode.toString().length === 6 && /^\d+$/.test(this.verificationcode.toString())) {

      if (this.userId)
        this.loginService.verifyDobleFactor(this.userId, this.verificationcode).subscribe(
          resultado => {
            localStorage.setItem("user", resultado.headers?.get("Authorization").replace("Bearer ", ""));
              this.dialogRef.close(true);
          },
          error => {
            this.error = "Codigo incorrecto";
          }
        );

    } else {
      this.error = "Introduce un codigo valido";
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
    localStorage.clear();
  }
}

