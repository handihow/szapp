import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Course } from '../../courses/course.model';
import { CourseService } from '../../courses/course.service';
import { Organisation } from '../../auth/organisation.model';

import { Program } from '../../programs/program.model'; 

import * as Chart from 'chart.js';
import { User} from '../../auth/user.model';
import { AuthService } from '../../auth/auth.service';

import * as fromOverview from '../overview.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as OverviewAction from '../overview.actions';

import { Colors } from '../../shared/colors';

@Component({
  selector: 'app-course-overview',
  templateUrl: './course-overview.component.html',
  styleUrls: ['./course-overview.component.css']
})
export class CourseOverviewComponent implements OnInit, OnDestroy  {

  organisation: Organisation;
  students: User[];
  course: Course;
  program: Program;
  isLoading$: Observable<boolean>;
  hasFinishedCalculating: boolean;
  currentUser$: Observable<User>;

  subs: Subscription[] = [];

  chart: any; // This will hold our chart info

  constructor(  private courseService: CourseService,
                private authService: AuthService,
                private store: Store<fromOverview.State>,
                private router: Router ) { }

  ngOnInit() {
    //get the current user
    this.currentUser$ = this.store.select(fromRoot.getCurrentUser);
    this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
         this.organisation = organisation
      }
    }));
    //get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //fetch the currently selected program belonging to the overview
    this.subs.push(this.store.select(fromOverview.getSelectedProgram).subscribe(program => {
    	this.program = program
    }));
    //fetch the evaluations belonging to the project
    this.subs.push(this.store.select(fromOverview.getActiveCourse).subscribe(course => {
      if(course){
        this.course = course;
        this.subs.push(this.courseService.fetchCourseTeachersAndStudents(course, "Leerling").subscribe(students => {
          students.forEach((student, index) => {
            this.subs.push(this.authService.fetchUserResults(student).subscribe(results => {
              let indexOfWeightedProgramResults = results.findIndex(o => o.id ==="weightedprogram");
              let indexOfProgramResults = results.findIndex(o => o.id ==="program");
              if(indexOfWeightedProgramResults > -1) {
                student.programs = results[indexOfWeightedProgramResults]
              } else if(indexOfProgramResults > -1){
                student.programs = results[indexOfProgramResults];
              }
              if(index===(students.length - 1)){
                this.students = students;
                this.drawChart();
              }
            }))
          })
        }))  
      }
    }));

   }

   ngOnDestroy(){
     this.subs.forEach((subscription)=>{
       subscription.unsubscribe();
     })
   }

   onReturnToOverview(){
     this.store.dispatch(new OverviewAction.UnselectProgram());
     this.store.dispatch(new OverviewAction.StopCourse());
     this.router.navigate(['/overviews']);
   }

   drawChart(){
     if(!this.students || !this.program){
       return 
     }
     const programProgress = [];
     const weightRed = this.organisation.weightRed ? this.organisation.weightRed : 0;
     const weightYellow = this.organisation.weightYellow ? this.organisation.weightYellow : 1;
     const weightLightGreen = this.organisation.weightLightGreen ? this.organisation.weightLightGreen : 2;
     const weightGreen = this.organisation.weightGreen ? this.organisation.weightGreen : 3;
     //loop through the student program progress results
     this.students.forEach(student => {
     	if(student.programs[this.program.id]){
        const programResult = student.programs[this.program.id];
        let greenResult = 0; let lightGreenResult = 0; let yellowResult = 0; let redResult = 0; let remainingResult = 100;
     		let grade = 0;
        const weightedSkillCount = this.program.countSkillsWeighted ? 
                                        this.program.countSkillsWeighted : this.program.countSkills ?
                                        this.program.countSkills : 0;
        let maximumWeightedScore = 0;
        let totalWeightedScore = 0;

        const greenWeightedCount = programResult.Groen ? programResult.Groen : 0;
        greenResult = Math.round(greenWeightedCount / weightedSkillCount * 100);
        maximumWeightedScore += greenWeightedCount * weightGreen;
        totalWeightedScore += greenWeightedCount * weightGreen;
        
        //light green
        const lightGreenWeightedCount = programResult.Lichtgroen ? 
                                            programResult.Lichtgroen : 0;
        lightGreenResult = Math.round(lightGreenWeightedCount / weightedSkillCount * 100);
        maximumWeightedScore += lightGreenWeightedCount * weightGreen;
        totalWeightedScore += lightGreenWeightedCount * weightLightGreen;
        
        //yellow
        const yellowWeightedCount = programResult.Geel ? programResult.Geel : 0;
        yellowResult = Math.round(yellowWeightedCount / weightedSkillCount * 100);
        maximumWeightedScore += yellowWeightedCount * weightGreen;
        totalWeightedScore += yellowWeightedCount * weightYellow;
        
        //red
        const redWeightedCount = programResult.Rood ? programResult.Rood : 0;
        redResult = Math.round(redWeightedCount / weightedSkillCount * 100);
        maximumWeightedScore += redWeightedCount * weightGreen;
        totalWeightedScore += redWeightedCount * weightRed;
        remainingResult = 100 - greenResult - lightGreenResult - yellowResult - redResult;
        if(maximumWeightedScore>0){
          grade = Math.round(totalWeightedScore / maximumWeightedScore * 100);
        }
        
        const newProgressResult = {
		         student: student.uid,
		         studentName: student.displayName,
		         green: greenResult,
		         lightgreen: lightGreenResult,
		         yellow: yellowResult,
		         red: redResult,
		         remaining: remainingResult,
             grade: grade
		       } 
		     programProgress.push(newProgressResult);
     	}
	     
      })

     //now create the chart
     this.chart = new Chart('course-program-chart', {
        type: 'horizontalBar',
        data: {
          labels: programProgress.map(o=>o.studentName),
          datasets: [
            {
              label: "Groen",
              data: programProgress.map(o=>o.green),
              backgroundColor: Colors.chartColors[0].background,
              borderColor: Colors.chartColors[0].border,
              borderWidth: 2,
              datalabels: {
                  display: false
              }
            },
            {
              label: "Lichtgroen",
              data: programProgress.map(o=>o.lightgreen),
              backgroundColor: Colors.chartColors[1].background,
              borderColor: Colors.chartColors[1].border,
              borderWidth: 2,
              datalabels: {
                  display: false
              }
            },
            {
              label: "Geel",
              data: programProgress.map(o=>o.yellow),
              backgroundColor: Colors.chartColors[2].background,
              borderColor: Colors.chartColors[2].border,
              borderWidth: 2,
              datalabels: {
                  display: false
              }
            },
            {
              label: "Rood",
              data: programProgress.map(o=>o.red),
              backgroundColor: Colors.chartColors[3].background,
              borderColor: Colors.chartColors[3].border,
              borderWidth: 2,
              datalabels: {
                  display: false
              }
            },
            {
              label: "Niet beoordeeld",
              data: programProgress.map(o=>o.remaining),
              datalabels: {
                  display: true,
                  anchor: 'end',
                  align: 'start',
                  font: {
                    size: 16
                  },
                  formatter: function(value, context) {
                      return programProgress[context.dataIndex].grade + '%';
                  }
              }
            }
          ]
        },
        options: {
          legend: { display: true },
          title: {
            display: true,
            text: 'Lesgroep resultaten voor leerplan ' + this.program.name
          },
          scales: {
              xAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Resultaat (%)'
                  },
                  stacked: true,
                  position: 'bottom',
                  ticks: {
                    beginAtZero: true,
                    max: 100,
                    stepSize: 20
                  }
              }],
              yAxes: [{
                  stacked: true
              }]
          } 
        },

     });

     this.hasFinishedCalculating = true;
  }

}
