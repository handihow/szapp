
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { Evaluation } from '../../evaluations/evaluation.model';
import { EvaluationService } from '../../evaluations/evaluation.service';

import { Skill } from '../../skills/skill.model';
import { SkillService } from '../../skills/skill.service';

import { Program } from '../../programs/program.model';
import { User } from '../../auth/user.model';

import { UIService } from '../../shared/ui.service';

import * as fromOverview from '../overview.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as OverviewAction from '../overview.actions';

import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

declare var jsPDF: any;

@Component({
  selector: 'app-program-report',
  templateUrl: './program-report.component.html',
  styleUrls: ['./program-report.component.css']
})
export class ProgramReportComponent implements OnInit, OnDestroy {
  
  skills: Skill[];
  evaluations: Evaluation[];
  program: Program;
  isLoading: boolean;
  student: User;
  currentUser$: Observable<User>;
  newEvaluationsAllowed = false;
  detailViewAllowed = false;

  subs: Subscription[] = [];

  constructor(  private uiService: UIService,
                private evaluationService: EvaluationService,
                private skillService: SkillService,
                private store: Store<fromOverview.State> ) { }

  ngOnInit() {
    //get the loading state of the app
    this.isLoading = true;
    //fetch the evaluations belonging to the user
    this.store.select(fromOverview.getSelectedStudent).subscribe(user => {
      if(user){
        this.subs.push(this.evaluationService.fetchExistingEvaluations(user).subscribe(evaluations => {
          this.evaluations = evaluations;
          this.evaluations.sort((a,b)=>{return b.created - a.created});
        }));
        this.student = user;
      };
    })
    //fetch the current user of the application (it may be a teacher who has selected student)
    this.currentUser$ = this.store.select(fromRoot.getCurrentUser);
    //fetch the skills belonging to the project
    this.subs.push(this.store.select(fromOverview.getSelectedProgram).subscribe(program => {
        if(program){
          this.program = program;
          this.subs.push(this.skillService.fetchSkills(program).subscribe(skills => {
              this.analyzeSkills(skills);
          }));
        }
    }))
  }

  analyzeSkills(skills) {
    if(typeof this.evaluations =="undefined" || typeof skills =="undefined" || skills.length == 0){
      return this.isLoading = false;
    }
    this.skills = skills;    
    this.skills.forEach((skill) =>{
      let evaluation = this.evaluations.find((evaluation: Evaluation) => evaluation.skill === skill.id);
      if(evaluation){
        skill.studentColor = evaluation.colorStudent;
        skill.teacherColor = evaluation.colorTeacher;
        skill.studentIcon = evaluation.iconStudent;
        skill.teacherIcon = evaluation.iconTeacher ? evaluation.iconTeacher: "supervised_user_circle";
        skill.evaluation = evaluation;
        skill.ratingTeacher = evaluation.ratingTeacher !=null ? evaluation.ratingTeacher + 2 : 1;
        skill.teacherColorLabel = evaluation.colorLabelTeacher ? evaluation.colorLabelTeacher : '-';
        skill.teacherEvaluated = evaluation.evaluated ? evaluation.evaluated : '-';
      } else {
        skill.studentColor = "grey";
        skill.teacherColor = "grey";
        skill.studentIcon = "account_circle";
        skill.teacherIcon = "supervised_user_circle";
        skill.ratingTeacher = 1;
        skill.teacherColorLabel = '-';
        skill.teacherEvaluated = '-'
      }
    })
    this.skills.sort((a,b)=> {return b.ratingTeacher - a.ratingTeacher});
    this.isLoading = false;
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    })
  }

  onDownloadPDF(){
    // Default export is a4 paper, portrait, using milimeters for units
    var doc = new jsPDF('l', 'pt');
    var columns = [["Nummer", "Competentie", "Onderwerp", "Laatste evaluatie", "Kleur"]];
    var rows = [];
    this.skills.forEach((skill)=>{
      var teacherEvaluatedDate = "-";
      if(skill.teacherEvaluated instanceof Timestamp){
        console.log(skill.teacherEvaluated);
        var teacherEvaluated : Timestamp = skill.teacherEvaluated;
        teacherEvaluatedDate = teacherEvaluated.toDate().toLocaleDateString();
      }
      var newTableRow = [];
      newTableRow.push(skill.order);
      newTableRow.push(skill.competency);
      newTableRow.push(skill.topic);
      newTableRow.push(teacherEvaluatedDate);
      newTableRow.push(skill.teacherColorLabel);
      rows.push(newTableRow);
    });
    
    //add titles to the document (name of program and name of the student)
    doc.setFontSize(20);
    doc.text(this.program.code + ' ' + this.program.name, 40, 50);
    doc.setFontSize(14);
    doc.text(this.student.displayName, 40, 70);
    doc.setFontSize(10);
    doc.text(this.student.classes ? this.student.classes : '-', 40, 90);
    doc.setFontSize(10);
    doc.text(this.student.organisation, 40, 110);
    
    //add the date of the report
    doc.setFontSize(10);
    let currentDate = new Date().toLocaleDateString();
    doc.text('Rapport gemaakt op: ' + currentDate, 40, 130);
    
    //add the table with results
    doc.autoTable({
      head: columns,
      body: rows,
      startY: 150,
      margin: {top: 50},
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto',
        minCellWidth: 60
      }
    });

    //save the document
    doc.save(this.student.displayName + '_' + this.program.name + '.pdf');
  }

  onStopProgram(){
    this.store.dispatch(new OverviewAction.UnselectProgram());
  }

  

}