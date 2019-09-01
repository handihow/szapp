import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

import { Comment } from '../comment.model';
import { CommentService } from '../comment.service';
import * as fromRoot from '../../app.reducer'; 

import { RemoveCommentsComponent } from './remove-comments.component';
import { EditCommentComponent } from './edit-comment.component';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-existing-comments',
  templateUrl: './existing-comments.component.html',
  styleUrls: ['./existing-comments.component.css']
})
export class ExistingCommentsComponent implements OnInit, AfterViewInit, OnDestroy {
  
  isLoading$: Observable<boolean>;
  user: User;
  organisation: Organisation;
  displayedColumns = ['select', 'created', 'comment', 'studentName', 'className', 'read', 'reported'];
  dataSource = new MatTableDataSource<Comment>();
  selection = new SelectionModel<Comment>(true, null);
  titles= environment.titles;


  allOrganisation: boolean;

  options: any;
  data: any;

  comments: Comment[];
  subs: Subscription[] = [];


  hasPermission: boolean;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(  private dialog: MatDialog,
                private commentService: CommentService,
                private store: Store<fromRoot.State> ) { }


  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current user
    this.store.select(fromRoot.getCurrentUser).subscribe(user => {
      if(user){
        this.user = user;
        this.subs.push(this.commentService.fetchExistingComments(null, user).subscribe(comments => {
          this.comments = comments;
          this.dataSource.data = this.comments;        
        }));
      }
    });
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setDisplayedColumns(screenType);
    });
    //get the current organisation and then the comments
    this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
        this.organisation = organisation;
      };
    });
    this.store.select(fromRoot.getPermissions).subscribe(value => {
      if(value.includes('all:comments')){
        this.hasPermission = true;
      }
    });     
  }

  ngOnDestroy() {
    this.subs.forEach(function(sub){
      sub.unsubscribe();
    })
  }

  //when view is loaded, initialize the sorting and paginator
  ngAfterViewInit() {
  	this.dataSource.sort = this.sort;
  	this.dataSource.paginator = this.paginator;
  }

  //filter the table based on user input
  doFilter(filterValue: string) {
  	this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  //set the displayed columns of the table depending on the size of the display
  setDisplayedColumns(screenType){
    if(screenType==="desktop"){
      this.displayedColumns = ['select', 'created', 'comment', 'studentName', 'className', 'read', 'reported'];
    } else if(screenType==="tablet"){
      this.displayedColumns = ['select', 'created', 'comment', 'studentName', 'className'];
    } else {
      this.displayedColumns = ['select', 'created', 'comment', 'studentName'];
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  onChange(){
    if(this.allOrganisation){
      this.subs.push(this.commentService.fetchExistingComments(this.organisation, null).subscribe(comments => {
        this.comments = comments;
        this.dataSource.data = this.comments;
        if(!this.displayedColumns.includes("teacherName")){
          this.displayedColumns.push('teacherName');    
        } 
      }));
    } else {
      this.subs.push(this.commentService.fetchExistingComments(null, this.user).subscribe(comments => {
        this.comments = comments;
        this.dataSource.data = this.comments;   
        let index = this.displayedColumns.findIndex(str => str == "teacherName");
        if(index>-1){
          this.displayedColumns.splice(index, 1);
        }    
      }));
    }
  }

  onEdit() {
    let comment = this.selection.selected[0];
    const dialogRef = this.dialog.open(EditCommentComponent, {
      data: {
        comment:comment,
        organisation: this.organisation
      },
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.selection.clear();
      }
    });
  }

  onRemove() {
    const dialogRef = this.dialog.open(RemoveCommentsComponent, {
      data: {
        selectedItems: this.selection.selected.length 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.commentService.removeComments(this.selection.selected);
        this.selection.clear();
      }
    });
  }

}
