import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Program } from '../../programs/program.model';
import { ProgramService } from '../../programs/program.service';

import { Chart } from 'chart.js';

import { User} from '../../auth/user.model';
import { AuthService } from '../../auth/auth.service';

import * as fromOverview from '../overview.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as OverviewAction from '../overview.actions';

import { Colors } from '../../shared/colors';

@Component({
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrls: ['./user-overview.component.css']
})
export class UserOverviewComponent implements OnInit, OnDestroy {
  
  student: User;
  programs: Program[];
  isLoading$: Observable<boolean>;
  currentUser$: Observable<User>;
  selectProgramForm: FormGroup;

  subs: Subscription[] = [];

  chart = []; // This will hold our chart info
  chartType: string;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setChartType(window.innerWidth);
    
  }

  constructor(  private programService: ProgramService,
    private authService: AuthService,
    private store: Store<fromOverview.State> ) { }

  ngOnInit() {
    //get the current user
    this.currentUser$ = this.store.select(fromRoot.getCurrentUser);
    //get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //fetch the evaluations belonging to the project
    this.store.select(fromOverview.getSelectedStudent).subscribe(student => {
      if(student){
        this.student = student;
        this.subs.push(this.authService.fetchUserResults(student).subscribe(results => {
          let indexOfProgramResults = results.findIndex(o => o.id ==="program");
          if(indexOfProgramResults > -1) {
            this.student.programs = results[indexOfProgramResults];
            this.fetchPrograms();
          }
        }));
      };
    });
    
    //create the program input form
    this.selectProgramForm = new FormGroup({
      program: new FormControl(null, Validators.required)
    });
    this.setChartType(window.innerWidth);
  }

  fetchPrograms() {
    this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      this.subs.push(this.programService.fetchExistingPrograms(organisation, true).subscribe(programs => {
        var filteredPrograms = [];
        programs.forEach(program => {
          if(Object.keys(this.student.programs).includes(program.id)){
            filteredPrograms.push(program);
          }
        })
        this.programs = filteredPrograms;
        this.calculateProgramProgress();
      }));
    }));
  }

  ngOnDestroy(){
    this.subs.forEach((subscription)=>{
      subscription.unsubscribe();
    })
  }

  onSubmit(){
    this.store.dispatch(new OverviewAction.SelectProgram(this.selectProgramForm.value.program));
    this.selectProgramForm.reset();
  }

  onReturnToOverview(){
    this.store.dispatch(new OverviewAction.UnselectStudent());
  }

  //set the chart type depending on the size of the display
  setChartType(innerWidth){
    if(innerWidth > 1000){
      this.chartType="bar";
    } else {
      this.chartType = "horizontalBar";
    }
  }

  calculateProgramProgress(){
    if(!this.student.programs){
      return
    }
    var programProgress = [];
    let studentPrograms = Object.keys(this.student.programs);
    //loop through the student program progress results
    studentPrograms.forEach(async (program,index) => {
      if(program !=="id"){
        let programToBeAdded = this.programs.find(o => o.id === program);
        if(programToBeAdded){
          var greenResult = 0; var lightGreenResult = 0; var yellowResult = 0; var redResult = 0; var remainingResult = 100;
          if(this.student.programs[program] && programToBeAdded && programToBeAdded.countSkills > 0){
            greenResult = this.student.programs[program].Groen ? 
            Math.round(this.student.programs[program].Groen / programToBeAdded.countSkills * 100) : 0;
            lightGreenResult = this.student.programs[program].Lichtgroen ? 
            Math.round(this.student.programs[program].Lichtgroen / programToBeAdded.countSkills * 100) : 0;
            yellowResult = this.student.programs[program].Geel ? 
            Math.round(this.student.programs[program].Geel / programToBeAdded.countSkills * 100) : 0;
            redResult = this.student.programs[program].Rood ? 
            Math.round(this.student.programs[program].Rood / programToBeAdded.countSkills * 100) : 0;
            remainingResult = Math.round((programToBeAdded.countSkills - this.student.programs[program].total) / programToBeAdded.countSkills * 100);
          }
          //get the average of the class
          let averages = await this.programService.getAverageProgramResults(program);
          let average = averages[this.student.classes[0]] ? Math.round(averages[this.student.classes[0]] / programToBeAdded.countSkills * 100): 0;
          var newProgressResult = {
            program: program,
            programName: programToBeAdded.name,
            programCode: programToBeAdded.code,
            green: greenResult,
            lightgreen: lightGreenResult,
            yellow: yellowResult,
            red: redResult,
            remaining: remainingResult,
            classAverage: average
          } 
          programProgress.push(newProgressResult);
        }
      }
      if(index===studentPrograms.length-1){
        this.drawChart(programProgress);
      }
    })
  }

  drawChart(programProgress){
    var options = {};
    if(this.chartType==="bar"){
      options = {
        legend: { display: true },
        title: {
          display: true,
          text: 'Resultaten per leerplan'
        },
        scales: {
          yAxes: [{
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
          xAxes: [{
            stacked: true
          }]
        }
      };
    } else {
      options = {
        legend: { display: false },
        title: {
          display: true,
          text: 'Resultaten per leerplan'
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
      }
    }
    

    var data = {
      labels: programProgress.map(o=>o.programName),
      datasets: []
    };

    if(this.chartType==="bar"){
      data.datasets.push({
        label: "Klasgemiddelde",
        data: programProgress.map(o=>o.classAverage),
        type: 'line',
        borderColor: Colors.projectColors[4].color,
        backgroundColor: Colors.projectColors[4].color,
        fill: 'false',
        borderWidth: 2
      })
    }

    data.datasets.push({
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
    })

    //now create the chart
    this.chart = new Chart('canvas', {
      type: this.chartType,
      data: data,
      options: options
    });
  }

}


