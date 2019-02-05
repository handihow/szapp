import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Course } from '../../courses/course.model';
import { CourseService } from '../../courses/course.service';

import { Program } from '../../programs/program.model'; 

import { Chart } from 'chart.js';
import { User} from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';
import { AuthService } from '../../auth/auth.service';

import * as fromOverview from '../overview.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as OverviewAction from '../overview.actions';

import { Comment } from '../../comments/comment.model';
import { CommentService } from '../../comments/comment.service';

import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

declare var jsPDF: any;

@Component({
  selector: 'app-course-report',
  templateUrl: './course-report.component.html',
  styleUrls: ['./course-report.component.css']
})
export class CourseReportComponent implements OnInit {

  students: User[];
  selectedStudent: User;
  studentIndex: number;
  organisation: Organisation;
  course: Course;
  isLoading$: Observable<boolean>;
  currentUser: User;
  selectDateRangeForm: FormGroup;
  reportInputForm: FormGroup;

  fromDate: Timestamp;
  toDate: Timestamp;
  downloadStart: boolean;

  subs: Subscription[] = [];

  constructor(  private courseService: CourseService,
                private authService: AuthService,
                private store: Store<fromOverview.State>,
                private router: Router,
                private commentService: CommentService ) { }

  ngOnInit() {
    //get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current course
    this.subs.push(this.store.select(fromOverview.getActiveCourse).subscribe(course => {
      if(course){
        this.course = course;
       }
    }));
    //create the select date range form
    this.selectDateRangeForm = new FormGroup({
    	fromDate: new FormControl(null, Validators.required),
    	toDate: new FormControl(null, Validators.required)
    });
    //create the report input form
    this.reportInputForm = new FormGroup({
    	reportedBy: new FormControl(null, Validators.required),
    	reportDate: new FormControl(new Date(), Validators.required),
    	student: new FormControl(null)
    });
    //get the current user
    this.subs.push(this.store.select(fromRoot.getCurrentUser).subscribe(user => {
    	if(user){
    		this.currentUser = user;
    	}
    }));
    //fetch the evaluations belonging to the project
    this.subs.push(this.store.select(fromOverview.getActiveCourse).subscribe(course => {
      if(course){
        this.course = course;
        this.subs.push(this.courseService.fetchCourseTeachersAndStudents(course, "Leerling").subscribe(students => {
          this.students = students;
        }))  
      }
    }));
    //get the current organisation
    this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(org => {
      this.organisation = org;
    }));
  }

  ngOnDestroy(){
     this.subs.forEach((subscription)=>{
       subscription.unsubscribe();
     })
   }

   onReturnToOverview(){
     this.store.dispatch(new OverviewAction.StopCourse());
     this.router.navigate(['/overviews']);
   }

   onSubmitDateRange(){
   	this.fromDate = Timestamp.fromDate(this.selectDateRangeForm.value.fromDate.toDate());
   	this.toDate = Timestamp.fromDate(this.selectDateRangeForm.value.toDate.toDate());
   	this.studentIndex = 0;
   	this.selectedStudent = this.students[0]
   }

   onNext(){
   	if(this.studentIndex < this.students.length - 1){
   		this.studentIndex += 1;
   	}
   	this.selectedStudent = this.students[this.studentIndex];
   }

   onPrevious(){
   	if(this.studentIndex > 0){
   		this.studentIndex -= 1;
   	}
   	this.selectedStudent = this.students[this.studentIndex];
   }

   onDownloadPDF(){
     this.downloadStart = true;
   }
  

}
