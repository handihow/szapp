import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import { Organisation } from '../../auth/organisation.model';

import { AuthService } from '../../auth/auth.service';

import { environment } from '../../../environments/environment';

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
  titles: any = environment.titles;
  organisation$: Observable<Organisation>;

  constructor( private authService: AuthService,
              private store: Store<fromRoot.State> ) { }

  ngOnInit() {
    this.isAuth$ = this.store.select(fromRoot.getIsAuth);
    this.isTeacher$ = this.store.select(fromRoot.getIsTeacher);
    this.organisation$ = this.store.select(fromRoot.getCurrentOrganisation);
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
