import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Program } from '../../programs/program.model';
import { ProgramService } from '../../programs/program.service';

import { Chart } from 'chart.js';

import { User} from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';
import { AuthService } from '../../auth/auth.service';

import * as fromOverview from '../overview.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as OverviewAction from '../overview.actions';

import { Colors } from '../../shared/colors';

@Component({
  selector: 'app-user-graph',
  templateUrl: './user-graph.component.html',
  styleUrls: ['./user-graph.component.css']
})
export class UserGraphComponent implements OnInit, OnDestroy {
  @Input() student: User;
  @Input() organisation: Organisation;
  programs: Program[];
  isLoading$: Observable<boolean>;
  currentUser$: Observable<User>;

  subs: Subscription[] = [];

  chart = []; // This will hold our chart info
  chartType: string;

  constructor(	private programService: ProgramService,
			    private authService: AuthService,
			    private store: Store<fromOverview.State>,
			    private router: Router ) { }

  ngOnInit() {

  	this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(org => {
      this.organisation = org;
    }));
    //get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setChartType(screenType);
    });
  }

  ngOnDestroy(){
    this.subs.forEach((subscription)=>{
      subscription.unsubscribe();
    })
  }

  ngOnChanges(){
    //fetch the evaluations belonging to the project
    if(this.student){
      this.subs.push(this.authService.fetchUserResults(this.student).subscribe(results => {
        let indexOfProgramResults = results.findIndex(o => o.id ==="program");
        if(indexOfProgramResults > -1) {
          this.student.programs = results[indexOfProgramResults];
          this.fetchPrograms();
        }
      }));
    }
  }

  fetchPrograms() {
    this.subs.push(this.programService.fetchExistingPrograms(this.organisation, true).subscribe(programs => {
      var filteredPrograms = [];
      programs.forEach(program => {
        if(Object.keys(this.student.programs).includes(program.id)){
          filteredPrograms.push(program);
        }
      })
      this.programs = filteredPrograms;
      this.calculateProgramProgress();
    }));
  }

  //set the chart type depending on the size of the display
  setChartType(screenType){
    if(screenType==="phone"){
      this.chartType = "horizontalBar";
    } else {
      this.chartType="bar";
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
          let average = averages[this.student.classes[0]] ? Math.round(averages['average'] / programToBeAdded.countSkills * 100): 0;
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

  /* takes a string phrase and breaks it into separate phrases 
   no bigger than 'maxwidth', breaks are made at complete words.*/

  private formatLabel(str, maxwidth){
      var sections = [];
      var words = str.split(" ");
      var temp = "";

      words.forEach(function(item, index){
          if(temp.length > 0)
          {
              var concat = temp + ' ' + item;

              if(concat.length > maxwidth){
                  sections.push(temp);
                  temp = "";
              }
              else{
                  if(index == (words.length-1))
                  {
                      sections.push(concat);
                      return;
                  }
                  else{
                      temp = concat;
                      return;
                  }
              }
          }

          if(index == (words.length-1))
          {
              sections.push(item);
              return;
          }

          if(item.length < maxwidth) {
              temp = item;
          }
          else {
              sections.push(item);
          }

      });

      return sections;
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
            stacked: true,
            ticks: {
               autoSkip: false
            }
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
      labels: programProgress.map(o=>this.formatLabel(o.programName, 10)),
      labelString: [],
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
    this.chart = new Chart(this.student.uid, {
      type: this.chartType,
      data: data,
      options: options
    });
  }

}
