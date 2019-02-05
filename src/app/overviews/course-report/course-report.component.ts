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
    // Default export is a4 paper, portrait, using milimeters for units
    var doc = new jsPDF('l', 'pt');
    this.students.forEach(student => {
      this.createHeader(doc, student);
      this.createChart(doc, student);
      this.createCommentsTable(doc, student);
      doc.addPage();
    })
    let currentDate = new Date().toLocaleDateString();
    //save the document
    doc.save(this.course.name + '_' + currentDate + '.pdf');
  }

  private createHeader(doc, student: User){
    //add titles to the document (name of program and name of the student)
    doc.setFontSize(20);
    doc.text(student.displayName, 40, 50);
    doc.setFontSize(14);
    doc.text(student.classes ? student.classes : '-', 40, 70);
    doc.setFontSize(10);
    doc.text(student.organisation, 40, 90);
    //add the date of the report
    doc.setFontSize(10);
    let currentDate = new Date().toLocaleDateString();
    doc.text('Rapport gemaakt op: ' + currentDate, 40, 110);
  }

  private createChart(doc, student: User){
    console.log(doc);
    console.log(student);
  }

  private async createCommentsTable(doc, student: User){
    var columns = [["Leraar", "Datum", "Commentaar"]];
    var rows = [];
    let studentComments : Comment[] = await this.commentService.fetchCommentsStudentFromDateToDate(student, 
       this.fromDate, this.toDate).toPromise();
    studentComments.forEach(comment=>{
          var teacherEvaluatedDate = "-";
          if(comment.created instanceof Timestamp){
            var teacherEvaluated : Timestamp = comment.created;
            teacherEvaluatedDate = teacherEvaluated.toDate().toLocaleDateString();
          }
          var newTableRow = [];
          newTableRow.push(comment.teacherName);
          newTableRow.push(comment.created);
          newTableRow.push(comment.comment);
          rows.push(newTableRow);
        });

    //add the table with results
    doc.autoTable({
      head: columns,
      body: rows,
      startY: 130,
      margin: {top: 50},
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto',
        minCellWidth: 60
      }
    });
    
  }

}
