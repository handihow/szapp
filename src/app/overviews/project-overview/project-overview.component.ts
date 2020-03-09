import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Organisation } from '../../auth/organisation.model';

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
  organisation: Organisation;


  chart: any; // This will hold our chart info
  doneLoadingChart: boolean;
  noChart: boolean;

  constructor(  private evaluationService: EvaluationService,
                private skillService: SkillService,
                private store: Store<fromOverview.State>,
                private router: Router ) { }

  ngOnInit() {
    //get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
         this.organisation = organisation
      }
    }));
    //fetch the evaluations belonging to the project
    this.store.select(fromOverview.getSelectedProject).subscribe(async project => {
      if(project){
        this.project = project
        this.skills = await this.skillService.getProjectSkills(project.id)
        if(this.skills.length>0){
          this.evaluations = await this.evaluationService.fetchEvaluationsOfSkillArray(this.skills)
          if(this.evaluations.length>0) {
            this.drawChart(this.evaluations);
          } else {
            this.hasNoChart();
          }
        } else {
          this.hasNoChart();
        }
      };
    });
   }

   hasNoChart(){
     this.doneLoadingChart = true;
     this.noChart = true;
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

     const weightedSkillCount = this.skills.map(s => s.weight ? s.weight : 1).reduce((p, n) => p + n);
     const weightRed = this.organisation.weightRed ? this.organisation.weightRed : 0;
     const weightYellow = this.organisation.weightYellow ? this.organisation.weightYellow : 1;
     const weightLightGreen = this.organisation.weightLightGreen ? this.organisation.weightLightGreen : 2;
     const weightGreen = this.organisation.weightGreen ? this.organisation.weightGreen : 3;
     //then count the progress per student
     students.forEach((student) => {

       let greenWeight = 0; let lightGreenWeight = 0; let yellowWeight = 0; let redWeight = 0;

       let maximumWeightedScore = 0;
       let totalWeightedScore = 0;

       //make an empty array for the student progress
       student.progress = [];
       //start counting the assessments
       this.skills.forEach(skill => {
         const evaluationIndex = this.evaluations.findIndex(e => e.skill === skill.id && e.user === student.uid && e.status === 'Beoordeeld');
         if(evaluationIndex > -1){
           //there is an evaluation on this skill
           const evaluation = this.evaluations[evaluationIndex];
           const skillWeight = skill.weight ? skill.weight : 1;
           maximumWeightedScore += skillWeight * weightGreen;
           if(evaluation.ratingTeacher === 0){
             greenWeight += skillWeight;
             totalWeightedScore += skillWeight * weightGreen;
           } else if(evaluation.ratingTeacher === 1){
             lightGreenWeight += skillWeight;
             totalWeightedScore += skillWeight * weightLightGreen;
           } else if(evaluation.ratingTeacher === 2) {
             yellowWeight += skillWeight;
             totalWeightedScore += skillWeight * weightYellow;
           } else if(evaluation.ratingTeacher === 3){
             redWeight += skillWeight;
             totalWeightedScore += skillWeight * weightRed;
           } 
         }
       })
       let greenResult = Math.round((greenWeight / weightedSkillCount) * 100);
       let lightGreenResult = Math.round((lightGreenWeight / weightedSkillCount) * 100);
       let yellowResult = Math.round((yellowWeight / weightedSkillCount) * 100);
       let redResult = Math.round((redWeight / weightedSkillCount) * 100);
       let remainingResult = 100 - greenResult - lightGreenResult - yellowResult - redResult;
       let grade = 0;
       if(maximumWeightedScore>0){
          grade = Math.round(totalWeightedScore / maximumWeightedScore * 100);
       }
       //add the progress of the student in the array of student progress
       student.progress.push({projectId: this.project.id, green: greenResult});
       student.progress.push({projectId: this.project.id, lightgreen: lightGreenResult});
       student.progress.push({projectId: this.project.id, yellow: yellowResult});
       student.progress.push({projectId: this.project.id, red: redResult});
       student.progress.push({projectId: this.project.id, remaining: remainingResult, grade: grade});
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
                  display: true,
                  anchor: 'end',
                  align: 'start',
                  font: {
                    size: 16
                  },
                  formatter: function(value, context) {
                      return students[context.dataIndex].progress[4].grade + '%';
                  }
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
