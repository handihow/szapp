import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 

import { ProgramService } from '../../programs/program.service';
import { Program } from '../../programs/program.model';
import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

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

  constructor(private programService: ProgramService, private store: Store<fromRoot.State>) { }

  ngOnInit() {
  	//fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
  }

  ngOnChanges(){
    if(this.organisation && this.user){
      //fetch the programs
      this.subs.push(this.programService.fetchExistingPrograms(this.organisation, true, null, null, true).subscribe(programs => {
        if(this.relevantProgramsOnly){
          var filteredPrograms = [];
          programs.forEach(program => {
            if(this.user.programs && Object.keys(this.user.programs).includes(program.id)){
              filteredPrograms.push(program);
            }
          })
          this.programs = filteredPrograms;
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

        