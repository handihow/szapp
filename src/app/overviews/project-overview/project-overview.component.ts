import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { Evaluation } from '../../evaluations/evaluation.model';
import { EvaluationService } from '../../evaluations/evaluation.service';

import { Skill } from '../../skills/skill.model';
import { SkillService } from '../../skills/skill.service';

import { Project } from '../../projects/project.model';
import * as Chart from 'chart.js';
import { User} from '../../auth/user.model';

import * as fromOverview from '../overview.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as OverviewAction from '../overview.actions';

import { Colors } from '../../shared/colors';

@Component({
  selector: 'app-project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.css']
})
export class ProjectOverviewComponent implements OnInit, OnDestroy {
  
  skills: Skill[];
  project: Project;
  evaluations: Evaluation[];
  isLoading$: Observable<boolean>;
  subs: Subscription[]=[];

  chart: any; // This will hold our chart info
  doneLoadingChart: boolean;

  constructor(  private evaluationService: EvaluationService,
                private skillService: SkillService,
                private store: Store<fromOverview.State>,
                private router: Router ) { }

  ngOnInit() {
    //get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //fetch the evaluations belonging to the project
    this.store.select(fromOverview.getSelectedProject).subscribe(project => {
      if(project){
        this.project = project
        this.subs.push(this.skillService.fetchSkills(null, project.id).subscribe(skills => {
          this.skills = skills;
        }))
        this.subs.push(this.evaluationService.fetchExistingEvaluations(null, null, project).subscribe(evaluations => {
          this.evaluations = evaluations;
          if(evaluations && evaluations.length>0) {
            this.drawChart(evaluations);
          }
        }));
      };
    });
   }

   ngOnDestroy(){
     this.subs.forEach((subscription)=>{
       subscription.unsubscribe();
     });
   }

   onReturnToOverview(){
     this.store.dispatch(new OverviewAction.UnselectProject());
     this.router.navigate(['/overviews']);
   }

   drawChart(evaluations: Evaluation[]){
     
     //make an array of unique students
     let students: User[] = []
     let studentIds = Array.from(new Set(evaluations.map((item: Evaluation) => item.user))).sort();
     studentIds.forEach((id) => {
       let studentName = evaluations.find(item => item.user===id).studentName;
       let student : User = { displayName: studentName, uid: id };
       students.push(student);
     })
     //then count the progress per student
     students.forEach((student) => {

       //make an empty array for the student progress
       student.progress = [];
       //start counting the assessments
       let countGreenAssessmentsByTeacher = this.evaluations.findIndex(evaluation => 
        (evaluation.ratingTeacher===0 && evaluation.user === student.uid)) > -1 ?
           this.evaluations.filter(evaluation => 
        (evaluation.ratingTeacher===0 && evaluation.user === student.uid)).length : 0 ;

       let countLightGreenAssessmentsByTeacher = this.evaluations.findIndex(evaluation => 
        (evaluation.ratingTeacher===1 && evaluation.user === student.uid)) > -1 ?
           this.evaluations.filter(evaluation => 
        (evaluation.ratingTeacher===1 && evaluation.user === student.uid)).length : 0 ;

       let countYellowAssessmentsByTeacher = this.evaluations.findIndex(evaluation => 
        (evaluation.ratingTeacher===2 && evaluation.user === student.uid)) > -1 ?
           this.evaluations.filter(evaluation => 
        (evaluation.ratingTeacher===2 && evaluation.user === student.uid)).length : 0 ;

       let countRedAssessmentsByTeacher = this.evaluations.findIndex(evaluation => 
        (evaluation.ratingTeacher===3 && evaluation.user === student.uid)) > -1 ?
           this.evaluations.filter(evaluation => 
        (evaluation.ratingTeacher===3 && evaluation.user === student.uid)).length : 0 ;

       let countRemainingAssessments = this.project.countSkills - countGreenAssessmentsByTeacher 
         - countLightGreenAssessmentsByTeacher - countYellowAssessmentsByTeacher  - countRedAssessmentsByTeacher;

       //add the progress of the student in the array of student progress
       student.progress.push({projectId: this.project.id, green: countGreenAssessmentsByTeacher});
       student.progress.push({projectId: this.project.id, lightgreen: countLightGreenAssessmentsByTeacher});
       student.progress.push({projectId: this.project.id, yellow: countYellowAssessmentsByTeacher});
       student.progress.push({projectId: this.project.id, red: countRedAssessmentsByTeacher});
       student.progress.push({projectId: this.project.id, remaining: countRemainingAssessments});
     });
     this.chart = new Chart('project-chart', {
        type: 'horizontalBar',
        data: {
          labels: students.map(o=>o.displayName),
          datasets: [
            {
              label: "Groen",
              data: students.map(o => o.progress[0].green),
              backgroundColor: Colors.chartColors[0].background,
              borderColor: Colors.chartColors[0].border,
              borderWidth: 2,
              datalabels: {
                  display: false
              }
            },
            {
              label: "Lichtgroen",
              data: students.map(o => o.progress[1].lightgreen),
              backgroundColor: Colors.chartColors[1].background,
              borderColor: Colors.chartColors[1].border,
              borderWidth: 2,
              datalabels: {
                  display: false
              }
            },
            {
              label: "Geel",
              data: students.map(o => o.progress[2].yellow),
              backgroundColor: Colors.chartColors[2].background,
              borderColor: Colors.chartColors[2].border,
              borderWidth: 2,
              datalabels: {
                  display: false
              }
            },
            {
              label: "Rood",
              data: students.map(o => o.progress[3].red),
              backgroundColor: Colors.chartColors[3].background,
              borderColor: Colors.chartColors[3].border,
              borderWidth: 2,
              datalabels: {
                  display: false
              }
            },
            {
              label: "Niet beoordeeld",
              data: students.map(o => o.progress[4].remaining),
              datalabels: {
                  display: false
              }
            }
          ]
        },
        options: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Resultaten per leerling'
          },
          scales: {
              xAxes: [{
                  stacked: true
              }],
              yAxes: [{
                  stacked: true
              }]
          }
        }     
     });
     this.doneLoadingChart = true;
  }

}
