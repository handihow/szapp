import { Component, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrls: ['./user-overview.component.css']
})
export class UserOverviewComponent implements OnInit, OnDestroy {
  
  student: User;
  organisation: Organisation;
  isLoading$: Observable<boolean>;
  currentUser$: Observable<User>;
  selectProgramForm: FormGroup;

  subs: Subscription[] = [];

  constructor(  private programService: ProgramService,
    private authService: AuthService,
    private store: Store<fromOverview.State>,
    private router: Router ) { }

  ngOnInit() {
    //get the current user
    this.currentUser$ = this.store.select(fromRoot.getCurrentUser);
    //get the current organisation
    this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(org => {
      this.organisation = org;
    }));
    //get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //fetch the evaluations belonging to the project
    this.store.select(fromOverview.getSelectedStudent).subscribe(student => {
      if(student){
        this.student = student;
      };
    });
    
    //create the program input form
    this.selectProgramForm = new FormGroup({
      program: new FormControl(null, Validators.required)
    });
  }

  ngOnDestroy(){
    this.subs.forEach((subscription)=>{
      subscription.unsubscribe();
    })
  }

  onSubmit(){
    this.store.dispatch(new OverviewAction.SelectProgram(this.selectProgramForm.value.program));
    this.router.navigate(['/overviews/report']);
  }

  onReturnToOverview(){
    this.store.dispatch(new OverviewAction.UnselectStudent());
    this.router.navigate(['/overviews']);
  }

  onSelectedProgram(program){
    this.selectProgramForm.get('program').setValue(program);
  }

  

}


