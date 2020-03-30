import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 

import { AuthService } from '../../auth/auth.service';
import { ProgramService } from '../../programs/program.service';
import { Program } from '../../programs/program.model';
import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-program-select',
  templateUrl: './program-select.component.html',
  styleUrls: ['./program-select.component.css']
})
export class ProgramSelectComponent implements OnInit {
  
  screenType$: Observable<string>;
  programs: Program[];
  starredPrograms$: Observable<Program[]>;
  selectedProgramId: string;
  @Input() user: User;
  @Input() organisation: Organisation;
  @Input() relevantProgramsOnly: boolean;
  @Output() selectedProgram = new EventEmitter<Program>();
  subs: Subscription[] = [];
  titles = environment.titles;

  constructor(private programService: ProgramService, 
              private store: Store<fromRoot.State>,
              private authService: AuthService) { }

  ngOnInit() {
  	//fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
  }

  ngOnChanges(){
    if(this.organisation && this.user){
      //fetch the programs
      this.subs.push(this.programService.fetchExistingPrograms(this.organisation, true, null, null, true).subscribe(programs => {
        if(this.relevantProgramsOnly){
          this.subs.push(this.authService.fetchUserResults(this.user).subscribe(results => {
          let indexOfProgramResults = results.findIndex(o => o.id ==="program");
            if(indexOfProgramResults > -1) {
              const userPrograms = results[indexOfProgramResults];
              var filteredPrograms = [];
              programs.forEach(program => {
                // console.log(Object.keys(this.user.programs));
                if(userPrograms && Object.keys(userPrograms).includes(program.id)){
                  filteredPrograms.push(program);
                }
              })
              this.programs = filteredPrograms;
            }
          }));
        } else {
          this.programs = programs;  
        }
      }));
      this.starredPrograms$ = this.programService.fetchExistingPrograms(this.organisation, false, this.user, true, true);
    }  
  }

  

  selectProgram(programId){
    let program = this.programs.find(program => program.id === programId);
    this.selectedProgram.emit(program);
  }

  ngOnDestroy(){
  	this.subs.forEach(sub=> {
  		sub.unsubscribe();
  	})
  }

}

        