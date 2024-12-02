import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppUser } from './AppUser';
import { InspectAdminService } from '../../inspect-admin/inspect-admin.service';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.custom';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  

  actualUser: AppUser = {} as AppUser;
  constructor(private readonly client: HttpClient, private readonly router: Router, private readonly inspectServices: InspectAdminService) { }
  private readonly apiUrl = environment.apiUrl + '/api/users';


  ngOnInit(): void {
    if (typeof window !== "undefined") {
        const user = window.localStorage.getItem("user") as string;
        if (user) {
            this.getUser(user).subscribe(
                (resultado: any) => {
                    this.actualUser.id = resultado.id;
                    this.actualUser.name = resultado.name;
                    this.actualUser.surnames = resultado.surname;
                    this.actualUser.photo = resultado.photo;
                    this.actualUser.dtype = resultado.type;

                    if (this.actualUser.photo === null) {
                      this.actualUser.photo = "../../../assets/register/userDefault.png";
                    }
                    else {
                      this.actualUser.photo = 'data:image/png;base64,' + this.actualUser.photo
                    }

                },
                (error: any) => {
                    console.error('Error fetching user:', error);
                }
            );
        }
    }
}

  getUser(jwt: string): Observable<any> {
   
    return this.client.get(this.apiUrl+"/validateJWT");
  }

  
  logOut(): void {
    this.router.navigate(["/home"]);
  }

}