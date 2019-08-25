import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';

import { AdminService } from '../admin.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/user.model';
import * as fromRoot from '../../app.reducer'; 

import { EditRolesComponent } from './edit-roles.component';
import { AddUsersComponent } from './add-users.component';
import { RemoveUserComponent } from './remove-user.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements  OnInit, AfterViewInit, OnDestroy {
  // email : string = '';

  isLoading$: Observable<boolean>;
  displayedColumns = ['email', 'displayName', 'organisation', 'role', 'manage'];
  dataSource = new MatTableDataSource<User>();
  selection = new SelectionModel<User>(false, null);
  users: User[];
  selectedUser: User;
  subs: Subscription[] = [];
  filterValue: string;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private authService: AuthService,
              private adminService: AdminService,
              private store: Store<fromRoot.State>,
              private dialog: MatDialog) { }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setDisplayedColumns(screenType);
    });
    this.subs.push(this.adminService.getUsers().subscribe(users => {
      this.users = users;
      this.dataSource.data = this.users;
    })); 
  }

  // setModerator(){
  // 	const callable = this.fns.httpsCallable('addDownloader');
  //   this.result$ = callable({ email: this.email });
  // }

  // removeModerator(){
  //   const callable = this.fns.httpsCallable('removeDownloader');
  //   this.result$ = callable({ email: this.email });
  // }

  // setClassNumbers(){
  //   const callable = this.fns.httpsCallable('setClassNumbers');
  //   this.result$ = callable({});
  // }

  assignRoles(user: User){
    this.selectedUser = user;
    const dialogRef = this.dialog.open(EditRolesComponent, {
      data: user,
      width: '350px'
    });
  }

  addUsers(){
    const dialogRef = this.dialog.open(AddUsersComponent, {
      width: '600px'
    });
  }

  requestPasswordReset(user: User){
    this.authService.sendPasswordResetEmail(user.email, true);
  }

  deleteAccount(user: User){
    const dialogRef = this.dialog.open(RemoveUserComponent, {
      data: user,
      width: '350px'
    });
  }

  //when view is loaded, initialize the sorting and paginator
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub.unsubscribe();  
    })
  }

  //filter the table based on user input
  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  //set the displayed columns of the table depending on the size of the display
  setDisplayedColumns(screenType){
    if(screenType == "desktop"){
      this.displayedColumns = ['email', 'displayName', 'organisation', 'role', 'manage'];
    } else if(screenType == "tablet"){
      this.displayedColumns = ['email', 'displayName', 'role', 'manage'];
    } else {
      this.displayedColumns = ['email', 'manage'];
    }
  }

  filterOrganisation(organisation){
    this.subs.forEach(sub => {
     sub.unsubscribe(); 
    });
    let filter = organisation ? organisation.id : null;
    this.subs.push(this.adminService.getUsers(filter).subscribe(users => {
      this.users = users;
      this.dataSource.data = this.users;
    }));
  }

  onFilter(){
    console.log('data is filtered');
    // if(this.slideNotEvaluatedOnly){
    //   this.dataSource.data = this.evaluations.filter(evaluation => evaluation.status==="Niet beoordeeld");
    // } else {
    //   this.dataSource.data = this.evaluations;  
    // }
  }

}
