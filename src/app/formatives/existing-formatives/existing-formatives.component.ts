import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';

import { Formative } from '../formative.model';
import { FormativeService } from '../formative.service';
import * as fromRoot from '../../app.reducer'; 

@Component({
  selector: 'app-existing-formatives',
  templateUrl: './existing-formatives.component.html',
  styleUrls: ['./existing-formatives.component.css']
})
export class ExistingFormativesComponent implements OnInit, AfterViewInit, OnDestroy {
  
  isLoading$: Observable<boolean>;
  displayedColumns = ['created', 'name', 'date', 'subjects', 'classes', 'tags', 'url'];
  dataSource = new MatTableDataSource<Formative>();
  selection = new SelectionModel<Formative>(false, null);

  options: any;
  data: any;

  formatives: Formative[];
  sub: Subscription;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor( private formativeService: FormativeService,
                private store: Store<fromRoot.State> ) { }


  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setDisplayedColumns(screenType);
    });
    //get the current organisation and then the formatives
    this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
        this.sub = this.formativeService.fetchExistingFormatives(organisation).subscribe(formatives => {
          this.formatives = formatives;
          this.dataSource.data = this.formatives;        
        });
      };
    })    
    // selection changed
    this.selection.changed.subscribe((selectedFormative) =>
    {
        if (selectedFormative.added[0])   // will be undefined if no selection
        {
            //open pop-up to edit formative
        }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
      this.displayedColumns = ['created', 'name', 'date', 'subjects', 'classes', 'tags', 'url'];
    } else if(screenType==="tablet"){
      this.displayedColumns = ['created', 'name', 'date', 'subjects', 'classes'];
    } else {
      this.displayedColumns = ['created', 'name', 'date' ];
    }
  }

}
