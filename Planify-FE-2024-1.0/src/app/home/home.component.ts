import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  @ViewChild('aboutSection') aboutSection!: ElementRef

  constructor(private router: Router) { }

  goToAbout() {
    this.aboutSection.nativeElement.scrollIntoView({behavior: 'smooth'});
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']).then(() => {
      window.scrollTo(0,0);
    });
  }
}
