import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Course } from '../../courses/course.model';
import { CourseService } from '../../courses/course.service';

import { Program } from '../../programs/program.model'; 

import { Chart } from 'chart.js';
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

  students: User[];
  course: Course;
  program: Program;
  isLoading$: Observable<boolean>;
  currentUser$: Observable<User>;

  subs: Subscription[] = [];

  chart = []; // This will hold our chart info

  constructor(  private courseService: CourseService,
                private authService: AuthService,
                private store: Store<fromOverview.State> ) { }

  ngOnInit() {
    //get the current user
    this.currentUser$ = this.store.select(fromRoot.getCurrentUser);
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
              let indexOfProgramResults = results.findIndex(o => o.id ==="program");
              if(indexOfProgramResults > -1) {
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
     this.store.dispatch(new OverviewAction.StopCourse())
   }

   drawChart(){
     if(!this.students  || !this.program){
       return
     }
     var programProgress = [];
     //loop through the student program progress results
     this.students.forEach(student => {
     	if(student.programs[this.program.id]){
     		let greenResult = student.programs[this.program.id].Groen ? 
	                             Math.round(student.programs[this.program.id].Groen / this.program.countSkills * 100) : 0;
		     let lightgreenResult = student.programs[this.program.id].Lichtgroen ? 
		                             Math.round(student.programs[this.program.id].Lichtgroen / this.program.countSkills * 100) : 0;
		     let yellowResult = student.programs[this.program.id].Geel ? 
		                             Math.round(student.programs[this.program.id].Geel / this.program.countSkills * 100) : 0;
		     let redResult = student.programs[this.program.id].Rood ? 
		                             Math.round(student.programs[this.program.id].Rood / this.program.countSkills * 100) : 0;
		     let remainingResult = Math.round((this.program.countSkills - student.programs[this.program.id].total) / this.program.countSkills * 100);
		     var newProgressResult = {
		         student: student.uid,
		         studentName: student.displayName,
		         green: greenResult,
		         lightgreen: lightgreenResult,
		         yellow: yellowResult,
		         red: redResult,
		         remaining: remainingResult,
		       } 
		     programProgress.push(newProgressResult);
     	}
	     
      })

     //now create the chart
     this.chart = new Chart('canvas', {
        type: 'horizontalBar',
        data: {
          labels: programProgress.map(o=>o.studentName),
          datasets: [
            {
              label: "Groen",
              data: programProgress.map(o=>o.green),
              backgroundColor: Colors.chartColors[0].background,
              borderColor: Colors.chartColors[0].border,
              borderWidth: 2
            },
            {
              label: "Lichtgroen",
              data: programProgress.map(o=>o.lightgreen),
              backgroundColor: Colors.chartColors[1].background,
              borderColor: Colors.chartColors[1].border,
              borderWidth: 2
            },
            {
              label: "Geel",
              data: programProgress.map(o=>o.yellow),
              backgroundColor: Colors.chartColors[2].background,
              borderColor: Colors.chartColors[2].border,
              borderWidth: 2
            },
            {
              label: "Rood",
              data: programProgress.map(o=>o.red),
              backgroundColor: Colors.chartColors[3].background,
              borderColor: Colors.chartColors[3].border,
              borderWidth: 2
            },
            {
              label: "Niet beoordeeld",
              data: programProgress.map(o=>o.remaining)
            }
          ]
        },
        options: {
          legend: { display: false },
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
  }

}
