import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Course } from '../../courses/course.model';

import { Program } from '../../programs/program.model'; 

import { User} from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

import * as fromOverview from '../overview.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as OverviewAction from '../overview.actions';

import { Comment } from '../../comments/comment.model';
import { CommentService } from '../../comments/comment.service';

import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

declare var jsPDF: any;

@Component({
  selector: 'app-course-report-download',
  templateUrl: './course-report-download.component.html',
  styleUrls: ['./course-report-download.component.css']
})
export class CourseReportDownloadComponent implements OnInit {

  @Input() course: Course;
  @Input() students: User[];
  @Input() fromDate: Timestamp;
  @Input() toDate: Timestamp;
  @Input() downloadStart: boolean;
  @Input() organisation: Organisation;
  selectedStudent: User;
  counter: number = 0;

  constructor(	private store: Store<fromOverview.State>,
                private commentService: CommentService) { }

  ngOnInit() {
  }

  ngOnChanges(){
  	if(this.downloadStart){
  		this.onDownloadPDF();
  	}
  }

  async onDownloadPDF(){
    // Default export is a4 paper, portrait, using milimeters for units
    var doc = new jsPDF('l', 'pt');
    await this.asyncForEach(this.students, async (student, index) => {
      this.createHeader(doc, student);
      await this.createChart(doc, student);
      await this.createCommentsTable(doc, student);
      doc.addPage();
      if(index === this.students.length - 1){
      	this.counter = 100;
      } else {
      	this.counter += Math.round(100 / this.students.length);
      }
    })
    let currentDate = new Date().toLocaleDateString();
    //save the document
    doc.save(this.course.name + '_' + currentDate + '.pdf');
  }
  
  private async asyncForEach(array, callback) {
    return new Promise<boolean>(async (resolve, reject) =>{
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
        if(index === array.length - 1){
          resolve(true)
        }
      }
    })
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
    return new Promise<boolean>(async (resolve, reject) => {
    	this.selectedStudent = student;
    	//wait 2 seconds for the screen to update
    	await new Promise(resolve => setTimeout(resolve, 2000));
    	let newCanvas = <HTMLCanvasElement>document.getElementById(student.uid);
		let newCanvasImage = newCanvas.toDataURL("image/png", 1.0);
		doc.addImage(newCanvasImage, 'PNG', 100, 130, 600, 300);
    	resolve(true);
    })
  }

  private createCommentsTable(doc, student: User): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      let columns = [["Leraar", "Datum", "Commentaar"]];
      let rows = [];
      this.commentService.fetchCommentsStudentFromDateToDate(student, 
         this.fromDate, this.toDate).subscribe(comments => {
          if(comments && comments.length>0){
            comments.forEach(comment=>{
                  var teacherEvaluatedDate = "-";
                  if(comment.created instanceof Timestamp){
                    var teacherEvaluated : Timestamp = comment.created;
                    teacherEvaluatedDate = teacherEvaluated.toDate().toLocaleDateString();
                  }
                  var newTableRow = [];
                  newTableRow.push(comment.teacherName);
                  newTableRow.push(teacherEvaluatedDate);
                  newTableRow.push(comment.comment);
                  rows.push(newTableRow);
                });

            //add the table with results
            doc.autoTable({
              head: columns,
              body: rows,
              startY: 450,
              margin: {top: 50},
              styles: {
                overflow: 'linebreak',
                cellWidth: 'auto',
                minCellWidth: 60
              }
            });
            resolve(true);
          } else {
            doc.setFontSize(12);
            doc.text('Geen commentaar', 40, 450);
            resolve(false)
          }
         });
    })
  }

}
