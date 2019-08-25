import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit {
  
  @Output() closeSidenav = new EventEmitter<void>();

  isAuth$: Observable<boolean>;
  isTeacher$ : Observable<boolean>;
  permissions: string[];

  constructor( private authService: AuthService,
              private store: Store<fromRoot.State> ) { }

  ngOnInit() {
    this.isAuth$ = this.store.select(fromRoot.getIsAuth);
    this.isTeacher$ = this.store.select(fromRoot.getIsTeacher);
    this.store.select(fromRoot.getPermissions).subscribe(value => this.permissions = value);
  }

  onClose() {
  	this.closeSidenav.emit();
  }

  onLogout() {
    this.onClose();
    this.authService.logout();
  }

  hasPermission(permission: string){
    return this.permissions.includes(permission);
  }

}
