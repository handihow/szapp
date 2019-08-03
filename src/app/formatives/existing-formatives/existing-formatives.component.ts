import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog  } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

import { Formative } from '../formative.model';
import { FormativeService } from '../formative.service';
import * as fromRoot from '../../app.reducer'; 

import { RemoveFormativesComponent } from './remove-formatives.component';
import { EditFormativeComponent } from './edit-formative.component';

@Component({
  selector: 'app-existing-formatives',
  templateUrl: './existing-formatives.component.html',
  styleUrls: ['./existing-formatives.component.css']
})
export class ExistingFormativesComponent implements OnInit, AfterViewInit, OnDestroy {
  
  isLoading$: Observable<boolean>;
  user: User;
  organisation: Organisation;
  displayedColumns = ['select', 'date', 'name', 'subjects', 'classes', 'tags', 'url'];
  dataSource = new MatTableDataSource<Formative>();
  selection = new SelectionModel<Formative>(true, null);

  allOrganisation: boolean;

  options: any;
  data: any;

  formatives: Formative[];
  subs: Subscription[] = [];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(  private dialog: MatDialog,
                private formativeService: FormativeService,
                private store: Store<fromRoot.State> ) { }


  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current user
    this.store.select(fromRoot.getCurrentUser).subscribe(user => {
      if(user){
        this.user = user;
        this.subs.push(this.formativeService.fetchExistingFormatives(null, user).subscribe(formatives => {
          this.formatives = formatives;
          this.dataSource.data = this.formatives;        
        }));
      }
    });
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setDisplayedColumns(screenType);
    });
    //get the current organisation and then the formatives
    this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
        this.organisation = organisation;
      };
    })    
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
      this.displayedColumns = ['select', 'date', 'name', 'subjects', 'classes', 'tags', 'url'];
    } else if(screenType==="tablet"){
      this.displayedColumns = ['select', 'date', 'name', 'subjects', 'classes'];
    } else {
      this.displayedColumns = ['select', 'date', 'name'];
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
      this.subs.push(this.formativeService.fetchExistingFormatives(this.organisation, null).subscribe(formatives => {
        this.formatives = formatives;
        this.dataSource.data = this.formatives;    
      }));
      this.displayedColumns.push('teacherName'); 
    } else {
      this.subs.push(this.formativeService.fetchExistingFormatives(null, this.user).subscribe(formatives => {
        this.formatives = formatives;
        this.dataSource.data = this.formatives;        
      }));
      let index = this.displayedColumns.findIndex(str => str == "teacherName");
        if(index>-1){
          this.displayedColumns.splice(index, 1);
        } 
    }
  }

  onEdit() {
    let formative = this.selection.selected[0];
    const dialogRef = this.dialog.open(EditFormativeComponent, {
      data: {
        formative:formative,
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
    const dialogRef = this.dialog.open(RemoveFormativesComponent, {
      data: {
        selectedItems: this.selection.selected.length 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.formativeService.removeFormatives(this.selection.selected);
        this.selection.clear();
      }
    });
  }

}
