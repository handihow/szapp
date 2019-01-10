import { Component, OnInit, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { Course } from '../course.model';
import { CourseService } from '../course.service';
import * as fromCourse from '../course.reducer';
import * as fromRoot from '../../app.reducer'; 

@Component({
  selector: 'app-existing-courses',
  templateUrl: './existing-courses.component.html',
  styleUrls: ['./existing-courses.component.css']
})
export class ExistingCoursesComponent implements OnInit, AfterViewInit, OnDestroy {
  
  isLoading$: Observable<boolean>;
  displayedColumns = ['created', 'name', 'code', 'status'];
  dataSource = new MatTableDataSource<Course>();
  selection = new SelectionModel<Course>(false, null);

  //slide toggle that shows archived courses
  showArchived = false;

  courses: Course[];
  sub: Subscription;
  options: any;
  data: any;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor( private courseService: CourseService,
                private store: Store<fromCourse.State> ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setDisplayedColumns(window.innerWidth);
    
  }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current organisation and then the courses
    this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
        this.sub = this.courseService.fetchExistingCourses(organisation).subscribe(courses => {
          this.courses = courses;
          if(this.showArchived){
             this.dataSource.data = this.courses;        
          } else {
             this.dataSource.data = this.courses.filter(filteredCourse => (filteredCourse.status==="Actief" || filteredCourse.status==="Concept")); 
          }
        });
      };
    })    
    // selection changed
    this.selection.changed.subscribe((selectedCourse) =>
    {
        if (selectedCourse.added[0])   // will be undefined if no selection
        {
            this.courseService.editCourse(selectedCourse.added[0]);
        }
    });
    this.setDisplayedColumns(window.innerWidth);
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
  setDisplayedColumns(innerWidth){
    if(innerWidth > 1000){
      this.displayedColumns = ['created', 'name', 'code', 'status'];
    } else if(innerWidth > 800){
      this.displayedColumns = ['created', 'name', 'code'];
    } else {
      this.displayedColumns = ['name', 'code'];
    }
  }

  onChange(){
    if(this.showArchived){
       this.dataSource.data = this.courses;        
    } else {
       this.dataSource.data = this.courses.filter(filteredCourse => (filteredCourse.status==="Actief" || filteredCourse.status==="Concept")); 
    }
  }


}
