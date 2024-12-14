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
  styleUrls: ['./doble-factor-verify-modal.component.css']
})
export class DobleFactorVerifyModalComponent {
  constructor(private readonly loginService: LoginService,
              public dialogRef: MatDialogRef<ModalDialogComponent>, 
              @Inject(MAT_DIALOG_DATA) public data: { qr_code: string, userId: number }) {}

  hasQr: boolean = false;
  verificationcode: number | undefined;
  messageSiQr: string = "Introduce el código de 6 dígitos que aparece en tu app de Google Authenticator";
  messageNoQr: string = 'Escanea el siguiente código QR con tu app de Google Authenticator para añadirlo a tu cuenta. <strong>Esta acción es única y solo se puede hacer una vez</strong>';
  message: string = this.messageSiQr;
  error: string = "";
  userId: number | undefined;
  qrCode: string | undefined;
  secretKey: string = '';  // Nueva propiedad para la secret key decodificada
  showCode: boolean = false;  // Nueva propiedad para controlar la visibilidad del código secreto

  ngOnInit(): void {
    this.userId = this.data.userId;
    if (this.data.qr_code) {
      this.hasQr = true;
      this.message = this.messageNoQr;
      this.qrCode = this.data.qr_code;
      console.log(this.qrCode);
      this.secretKey = this.extractSecretKey(this.qrCode) || '';  // Extraemos la secret key del QR code
    }
  }

  onGoverify(): void {
    this.dialogRef.close(true);
  }

  onVerify(): void {
    if (this.verificationcode !== undefined && this.verificationcode.toString().length === 6 && /^\d+$/.test(this.verificationcode.toString())) {
      if (this.userId) {
        this.loginService.verifyDobleFactor(this.userId, this.verificationcode).subscribe(
          resultado => {
            const authToken = resultado.headers?.get("Authorization");
            if (authToken) {
              try {
                const decodedToken = this.decodeBase64(authToken.replace("Bearer ", ""));
                this.secretKey = decodedToken;  // Actualizamos la secretKey con la clave decodificada
              } catch (e) {
                this.secretKey = authToken.replace("Bearer ", "");  // Si no se puede decodificar, mostramos el string original
              }
              this.showCode = true;  // Hacemos visible el código secreto
              localStorage.setItem("user", this.secretKey);
              this.dialogRef.close(true);
            }
          },
          error => {
            this.error = "Codigo incorrecto";
          }
        );
      }
    } else {
      this.error = "Introduce un codigo valido";
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
    localStorage.clear();
  }

  toggleCodeView(): void {
    this.showCode = !this.showCode;
  }

  copyToClipboard(): void {
    if (this.secretKey) {
      navigator.clipboard.writeText(this.secretKey).then(() => {
        console.log('Secret key copied to clipboard');
        alert('Código secreto copiado al portapapeles');
      }).catch(err => {
        console.error('Error copying text: ', err);
        alert('Error al copiar el código secreto');
      });
    }
  }

  // Función para extraer la clave secreta del string del QR
  extractSecretKey(qrCodeString: string): string {
    try {
      // Crear un objeto URL a partir del string del QR
      const url = new URL(qrCodeString);
      console.log('URL:', url);

      // Extraer el valor del parámetro 'secret'
      const data = url.searchParams.get('data');
      if (!data) {
        throw new Error('No se encontró el parámetro "data" en la URL.');
      }

      const decodedData = decodeURIComponent(data);
      console.log('Decoded Data:', decodedData);

      // Crear un objeto URL a partir del string decodificado
      const decodedUrl = new URL(decodedData);
      console.log('Decoded URL:', decodedUrl);

      // Extraer el valor del parámetro 'secret'
      const secret = decodedUrl.searchParams.get('secret');
      if (secret) {
        return secret;
      } else {
        throw new Error('No se encontró el parámetro "secret" en la URL decodificada.');
      }
    } catch (error) {
      console.error('Error al extraer la clave secreta:', error);
      return 'Error al extraer la clave secreta';
    }
  }

  // Función para decodificar el string Base64
  decodeBase64(encoded: string): string {
    try {
      console.log(atob(encoded));
      return atob(encoded);
    } catch (e) {
      console.error("Error decoding Base64 string:", e);
      return encoded;  // Devolvemos el string original si ocurre un error
    }
  }

}
