import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('aboutSection') aboutSection!: ElementRef;

  constructor(private router: Router) {}

  goToAbout() {
    // Usamos desplazamiento suave con Ionic
    this.aboutSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']).then(() => {
      // Reinicia la vista al tope cuando cambie la ruta
      window.scrollTo(0, 0);
    });
  }
}