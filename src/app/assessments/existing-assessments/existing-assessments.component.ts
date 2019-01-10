import { Component, OnInit, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';

import { Evaluation } from '../../evaluations/evaluation.model';
import { EvaluationService } from '../../evaluations/evaluation.service';
import { User } from '../../auth/user.model';
import * as fromAssessment from '../assessment.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as AssessmentAction from '../assessment.actions';

import { CourseService } from '../../courses/course.service';
import { Course } from '../../courses/course.model';

@Component({
  selector: 'app-existing-assessments',
  templateUrl: './existing-assessments.component.html',
  styleUrls: ['./existing-assessments.component.css']
})
export class ExistingAssessmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  
  isLoading$: Observable<boolean>;
  displayedColumns = ['created', 'student', 'class', 'skill', 'topic', 'project', 'status'];
  dataSource = new MatTableDataSource<Evaluation>();
  selection = new SelectionModel<Evaluation>(false, null);
  evaluations: Evaluation[];
  user: User;
  courses: Course[];
  subs: Subscription[] = [];
  selectedCourse: Course;
  filterValue: string;

  //slide toggle that allows teachers to display only non-evaluated items in the list
  slideNotEvaluatedOnly: boolean;

  //All evaluations (including the ones that have already been assessed) are shown?
  allEvaluationsDisplayed: boolean;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(  private evaluationService: EvaluationService,
                private store: Store<fromAssessment.State>,
                private courseService: CourseService ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setDisplayedColumns(window.innerWidth);
    
  }
  
  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current user and then start fetching the existing evaluations
    this.subs.push(this.store.select(fromRoot.getCurrentUser).subscribe(async (user: User) => {
      if(user){
        this.user = user;
        this.subs.push(this.evaluationService.fetchExistingEvaluations(user,null,null,false,true,true).subscribe(evaluations => {
          this.evaluations = evaluations;
          this.dataSource.data = this.evaluations;
          //check if there is an active filter
          this.checkActiveFilter();
        })); 
        this.subs.push(this.courseService.fetchUserCourses(user).subscribe(courses => {
          this.courses = courses;
        }))
      }
    }));
    // selection changed
    this.selection.changed.subscribe((selectedEvaluation) =>
    {
        if (selectedEvaluation.added[0])   // will be undefined if no selection
        {   
            this.store.dispatch(new AssessmentAction.StartAssessment(selectedEvaluation.added[0]))
        }
    });
    this.setDisplayedColumns(window.innerWidth);
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
    this.store.dispatch(new AssessmentAction.SetAssessmentFilter(filterValue));
  }

  checkActiveFilter(){
    this.subs.push(this.store.select(fromAssessment.getCurrentFilter).subscribe(filter => {
        if(filter){
          this.filterValue = filter;
          this.doFilter(filter);
        }
      }));
  }

  //set the displayed columns of the table depending on the size of the display
  setDisplayedColumns(innerWidth){
    if(innerWidth > 1000){
      this.displayedColumns = ['created', 'student', 'class', 'skill', 'topic', 'project', 'status'];
    } else if(innerWidth > 800){
      this.displayedColumns = ['created', 'student', 'skill', 'topic'];
    } else {
      this.displayedColumns = ['created', 'student', 'skill'];
    }
  }

  onChange(){
    this.subs.forEach(sub => {
     sub.unsubscribe(); 
    });
    this.subs.push(this.evaluationService.fetchExistingEvaluations(this.user,null,null,false,true,false).subscribe(evaluations => {
      this.evaluations = evaluations;
      this.dataSource.data = this.evaluations;
      this.allEvaluationsDisplayed = true;
    })); 
  }

  onFilter(){
    if(this.slideNotEvaluatedOnly){
      this.dataSource.data = this.evaluations.filter(evaluation => evaluation.status==="Niet beoordeeld");
    } else {
      this.dataSource.data = this.evaluations;  
    }
  }

  displayCourse(course){
    this.store.dispatch(new AssessmentAction.StartCourse(course));
  }

}
