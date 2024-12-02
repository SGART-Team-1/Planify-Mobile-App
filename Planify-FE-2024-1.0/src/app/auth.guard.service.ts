import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../environments/environment.custom';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {


  constructor(private readonly dialog: MatDialog,private readonly client: HttpClient, private readonly router: Router, @Inject(PLATFORM_ID) private readonly platformId: Object) {}
      
  private readonly apiUrl = environment.apiUrl + '/api/users';


  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }
  
    const user = window.localStorage.getItem('user');
    if (!user) {
      return this.redirectToLogin();
    }
  
    return this.validateJWT(user).pipe(
      map(resultado => this.hasAccess(resultado, route)),
      catchError(() => this.redirectToLogin())
    );
  }
  
  private hasAccess(resultado: any, route: ActivatedRouteSnapshot): boolean {
    const role = resultado.type;
  
    if (this.hasAdminAccess(role, route) || this.hasCommonUserAccess(role, resultado, route)) {
      return true;
    }
  
    this.redirectToLogin();
    return false;
  }
  
  private hasAdminAccess(role: string, route: ActivatedRouteSnapshot): boolean {
    return role === 'Administrator' && route.data['role'] === 'Administrator';
  }
  
  private hasCommonUserAccess(role: string, resultado: any, route: ActivatedRouteSnapshot): boolean {
    if (role === 'CommonUser') {
      // El usuario accede a una interfaz del alcance de CommonUser
      const isUserActive = resultado.activated && !resultado.blocked && route.data['role'] === 'CommonUser';
      // El usuario accede a su perfil
      const userIdFromRoute = route.paramMap.get('userId');
      const isUserProfile = userIdFromRoute && resultado.id === Number(userIdFromRoute) && route.routeConfig?.path === 'inspect-user/:userId';
      return isUserActive || isUserProfile; // Si algo hay que quitar es isUserProfile
    }
    return false;
  }
  
  private redirectToLogin(): Observable<boolean> {
    this.router.navigate(['/login']);
    return of(false);
  }
  
    

    validateJWT(jwt: string): Observable<any> {
      
      return this.client.get(this.apiUrl+'/validateJWT');
    }

}
