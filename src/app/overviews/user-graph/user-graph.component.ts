import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Program } from '../../programs/program.model';
import { ProgramService } from '../../programs/program.service';

import * as Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
  noResults: boolean;

  subs: Subscription[] = [];

  chart: any; // This will hold our chart info
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
        let indexOfWeightedProgramResults = results.findIndex(o => o.id ==="weightedprogram");
        let indexOfProgramResults = results.findIndex(o => o.id ==="program");
        if(indexOfWeightedProgramResults > -1) {
          this.fetchPrograms(results[indexOfWeightedProgramResults]);
        } else if(indexOfProgramResults > -1){
          this.fetchPrograms(results[indexOfProgramResults]);
        } else {
          this.noResults = true;
        }
      }));
    }
  }

  fetchPrograms(studentResults) {
    this.subs.push(this.programService.fetchExistingPrograms(this.organisation, true).subscribe(programs => {
      var filteredPrograms = [];
      programs.forEach(program => {
        if(Object.keys(studentResults).includes(program.id)){
          filteredPrograms.push(program);
        }
      })
      this.programs = filteredPrograms;
      this.calculateProgramProgress(studentResults);
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

  calculateProgramProgress(studentResults){
    if(!studentResults){
      return
    }
    var programProgress = [];
    let studentPrograms = Object.keys(studentResults);
    //loop through the student program progress results
    studentPrograms.forEach(async (program,index) => {
      if(program !=="id"){
        let programToBeAdded = this.programs.find(o => o.id === program);
        if(programToBeAdded){
          let greenResult = 0; let lightGreenResult = 0; let yellowResult = 0; let redResult = 0; let remainingResult = 100;
          let grade = 0;
          const weightedSkillCount = programToBeAdded.countSkillsWeighted ? 
                                        programToBeAdded.countSkillsWeighted : programToBeAdded.countSkills ?
                                        programToBeAdded.countSkills : 0;
          if(studentResults[program] && weightedSkillCount > 0){
            let maximumWeightedScore = 0;
            let totalWeightedScore = 0;
            //green
            const greenWeightedCount = studentResults[program].Groen ? studentResults[program].Groen : 0;
            greenResult = Math.round(greenWeightedCount / weightedSkillCount * 100);
            maximumWeightedScore += greenWeightedCount * 3;
            totalWeightedScore += greenWeightedCount * 3;
            
            //light green
            const lightGreenWeightedCount = studentResults[program].Lichtgroen ? 
                                                studentResults[program].Lichtgroen : 0;
            lightGreenResult = Math.round(lightGreenWeightedCount / weightedSkillCount * 100);
            maximumWeightedScore += lightGreenWeightedCount * 3;
            totalWeightedScore += lightGreenWeightedCount * 2;
            
            //yellow
            const yellowWeightedCount = studentResults[program].Geel ? studentResults[program].Geel : 0;
            yellowResult = Math.round(yellowWeightedCount / weightedSkillCount * 100);
            maximumWeightedScore += yellowWeightedCount * 3;
            totalWeightedScore += yellowWeightedCount * 1;
            
            //red
            const redWeightedCount = studentResults[program].Rood ? studentResults[program].Rood : 0;
            redResult = Math.round(redWeightedCount / weightedSkillCount * 100);
            maximumWeightedScore += redWeightedCount * 3;
            remainingResult = 100 - greenResult - lightGreenResult - yellowResult - redResult;
            grade = Math.round(totalWeightedScore / maximumWeightedScore * 100);
          }
          //get the score of the student in percentage
          
          var newProgressResult = {
            program: program,
            programName: programToBeAdded.name,
            programCode: programToBeAdded.code,
            green: greenResult,
            lightgreen: lightGreenResult,
            yellow: yellowResult,
            red: redResult,
            remaining: remainingResult,
            grade: grade
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
      datasets: [],
    };


    if(this.chartType==="bar"){
      data.datasets.push({
        label: "Cijfer",
        data: programProgress.map(o=>o.grade),
        name: 'cijfer',
        type: 'scatter',
        datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            font: {
              size: 16
            },
            formatter: function(value, context) {
                return value + '%';
            }
        },
        borderColor: Colors.projectColors[4].color,
        backgroundColor: Colors.projectColors[4].color,
        fill: 'false',
        borderWidth: 2
      })
    }

    data.datasets.push({
      label: "Groen",
      data: programProgress.map(o=>o.green),
      datalabels: {
          display: false
      },
      backgroundColor: Colors.chartColors[0].background,
      borderColor: Colors.chartColors[0].border,
      borderWidth: 2
    },
    {
      label: "Lichtgroen",
      data: programProgress.map(o=>o.lightgreen),
      datalabels: {
          display: false
      },
      backgroundColor: Colors.chartColors[1].background,
      borderColor: Colors.chartColors[1].border,
      borderWidth: 2
    },
    {
      label: "Geel",
      data: programProgress.map(o=>o.yellow),
      datalabels: {
          display: false
      },
      backgroundColor: Colors.chartColors[2].background,
      borderColor: Colors.chartColors[2].border,
      borderWidth: 2
    },
    {
      label: "Rood",
      data: programProgress.map(o=>o.red),
      datalabels: {
          display: false
      },
      backgroundColor: Colors.chartColors[3].background,
      borderColor: Colors.chartColors[3].border,
      borderWidth: 2
    },
    {
      label: "Niet beoordeeld",
      data: programProgress.map(o=>o.remaining),
      datalabels: {
          display: false
      },
    })


    //now create the chart
    this.chart = new Chart(this.student.uid, {
      plugins: [ChartDataLabels],
      type: this.chartType,
      data: data,
      options: options
    });
  }

}
