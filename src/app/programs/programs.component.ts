import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromProgram from './program.reducer';

import { ProgramService } from './program.service';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})
export class ProgramsComponent implements OnInit {

  currentProgram$: Observable<boolean>;
  
  constructor( private programService: ProgramService,
              private store: Store<fromProgram.State> ) { }

  ngOnInit() {
  	this.currentProgram$ = this.store.select(fromProgram.getIsEditingProgram);
  }
  
}
