import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/user.model';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  
  isAuth$: Observable<boolean>;
  isTeacher$ : Observable<boolean>;
  user$: Observable<User>;
  permissions: string[];
  titles: any = environment.titles;
  logo = environment.logo;

  @Output() sidenavToggle = new EventEmitter<void>();

  constructor( private store: Store<fromRoot.State>, private authService: AuthService) { }

  ngOnInit() {
    this.isAuth$ = this.store.select(fromRoot.getIsAuth);
    this.isTeacher$ = this.store.select(fromRoot.getIsTeacher);
    this.user$ = this.store.select(fromRoot.getCurrentUser);
    this.store.select(fromRoot.getPermissions).subscribe(value => this.permissions = value);
  }

  onToggleSidenav(){
  	this.sidenavToggle.emit()
  }

  onLogout(){
    this.authService.logout();
  }

  hasPermission(permission: string){
    return this.permissions.includes(permission);
  }

}
