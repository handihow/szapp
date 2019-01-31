import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

import { Evaluation } from '../../evaluations/evaluation.model';
import { Formative } from '../../formatives/formative.model';
import { FormativeService } from '../../formatives/formative.service';

import { Store } from '@ngrx/store';
import * as fromOverview from '../overview.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as OverviewAction from '../overview.actions';

import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { Skill } from '../../skills/skill.model';
import { User } from '../../auth/user.model';

declare var jsPDF: any;

interface FormativeResult {
    student: string,
    course: string,
    [key: string]: any
}


@Component({
  selector: 'app-formative-overview',
  templateUrl: './formative-overview.component.html',
  styleUrls: ['./formative-overview.component.css']
})
export class FormativeOverviewComponent implements OnInit, OnDestroy {
  
  isLoading$: Observable<boolean>;
  subs: Subscription[] = [];
  formative: Formative;
  evaluations: Evaluation[];
  skills: Skill[] = [];
  students: User[] = [];

  viewSkills: boolean;

  displayedColumns: string[] = ['student', 'course'];
  dataSource = new MatTableDataSource<FormativeResult>();
  hasFinishedCalculations: boolean;

  constructor( private formativeService: FormativeService,
  				private store: Store<fromOverview.State>,
                private router: Router ) { }

  ngOnInit() {
  	//get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the formative from store and then the relevant evaluations
  	this.subs.push(this.store.select(fromOverview.getSelectedFormative).subscribe(formative => {
      if(formative){
        this.formative = formative;
        if(!formative.hasSavedResults){
          this.subs.push(this.formativeService.fetchFormativeResults(formative).subscribe(evaluations => {
              this.evaluations = evaluations;
              this.calculateEvaluations();
          }));
        } else {
          this.subs.push(this.formativeService.fetchSavedResultsOfFormative(formative).subscribe(evaluations => {
              this.evaluations = evaluations;
              this.calculateEvaluations();
          }));
        }
      }
  	}))
  }

  ngOnDestroy(){
  	this.subs.forEach(sub => {
  		sub.unsubscribe();
  	})
  }

  calculateEvaluations() {
  	  //create a list of unique skills
  	  let skillIds = Array.from(new Set(this.evaluations.map(o => o.skill)));
  	  //first, extract a list of unique skills from the evaluations
	    this.createSkillsArray(skillIds);
  	  //create a list of unique students
  	  let studentIds = Array.from(new Set(this.evaluations.map(o => o.user)));
      //extract a list of unique students from the evaluations
      this.createStudentsArray(studentIds);
  	  //loop over the students and then the skills to find an icon
      let results = [];
  	  this.students.forEach(student => {
        let evaluation = this.evaluations.find((evaluation: Evaluation) => evaluation.user === student.uid);
        let result: FormativeResult = {
          student: evaluation.studentName,
          course: evaluation.class
        };
  	  	this.skills.forEach((skill, i) => {
          result[skill.id] = {};
   	  		let index = this.evaluations.findIndex((evaluation: Evaluation) => evaluation.skill === skill.id && evaluation.user === student.uid);
          if(index ===-1){
    	  			result[skill.id].icon ="supervised_user_circle";
    	  			result[skill.id].iconColor ="grey";
              result[skill.id].teacherColor = "-";
    	  			result[skill.id].comment = "Geen evaluatie op deze competentie";
    	  	} else {
    	  			let evaluationAtIndex = this.evaluations[index];
    	  			result[skill.id].icon = evaluationAtIndex.iconTeacher;
    	  			result[skill.id].iconColor = evaluationAtIndex.colorTeacher;
              result[skill.id].teacherColor = evaluationAtIndex.colorLabelTeacher;
    	  			result[skill.id].comment = evaluationAtIndex.commentTeacher;
    	  	}
    	  	result[skill.id].competency = this.skills[i].competency;
    	  	result[skill.id].topic = this.skills[i].topic;
  	  	});
        results.push(result);
  	  });
      this.dataSource.data = results;
      this.hasFinishedCalculations = true;
  }

  onDownloadPDF(){
    // Default export is a4 paper, portrait, using milimeters for units
    var doc = new jsPDF('l', 'pt');
    var columns = [["Leerling", "Klas", ...this.skills.map(o => o.order)]];
    var rows = [];
    this.dataSource.data.forEach((result)=>{
      var newTableRow = [];
      newTableRow.push(result.student);
      newTableRow.push(result.course);
      this.skills.forEach(skill => {
        newTableRow.push(result[skill.id].teacherColor);
      })
      rows.push(newTableRow);
    });
    
    //add titles to the document (name of program and name of the student)
    doc.setFontSize(20);
    doc.text(this.formative.name, 40, 50);
    doc.setFontSize(14);
    doc.text(this.formative.date.toDate().toLocaleDateString(), 40, 70);
    doc.setFontSize(12);
    doc.text(this.formative.tags, 40, 90);
    //add the date of the report
    doc.setFontSize(10);
    let currentDate = new Date().toLocaleDateString();
    doc.text('Rapport gemaakt op: ' + currentDate, 40, 110);
    
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

    //save the document
    doc.save(this.formative.name + '_' + currentDate + '.pdf');
  }

  private createSkillsArray(skillIds: string[]){
  	let skills: Skill[] = [];
  	skillIds.forEach(skillId => {
  		let skillFromEvaluation = this.evaluations.find((evaluation: Evaluation) => evaluation.skill === skillId);
  		skills.push({
  			id: skillId,
  			order: skillFromEvaluation.skillOrder,
  			competency: skillFromEvaluation.skillCompetency,
  			topic: skillFromEvaluation.skillTopic
  		})
  	})
  	this.skills = skills.sort(this.sortSkills);
  	this.skills.forEach(skill => {
      this.displayedColumns.push(skill.id);
    })
  }

  private createStudentsArray(studentIds: string[]){
    let students: User[] = [];
    studentIds.forEach(studentId => {
      let studentFromEvaluation = this.evaluations.find((evaluation: Evaluation) => evaluation.user === studentId);
      students.push({
        uid: studentId,
        displayName: studentFromEvaluation.studentName
      })
    })
    this.students = students.sort(this.sortStudents);
  }

  private sortSkills(a,b) {
    if (a.order < b.order)
      return -1;
    if (a.order > b.order)
      return 1;
    return 0;
  }

  private sortStudents(a,b) {
    if (a.displayName < b.displayName)
      return -1;
    if (a.displayName > b.displayName)
      return 1;
    return 0;
  }

  toggleSkills(){
    this.viewSkills = !this.viewSkills;
  }

  onBack(){
    this.store.dispatch(new OverviewAction.UnselectFormative());
    this.router.navigate(['/overviews'])
  }

  onSave(){
    this.formativeService.saveResultsOfFormative(this.formative,this.evaluations);
  }


}
