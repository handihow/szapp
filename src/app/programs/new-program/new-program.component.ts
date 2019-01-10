import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { ProgramService } from '../program.service';
import { Program } from '../program.model';

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

@Component({
  selector: 'app-new-program',
  templateUrl: './new-program.component.html',
  styleUrls: ['./new-program.component.css']
})
export class NewProgramComponent implements OnInit {
  
  programForm: FormGroup;
  user: User;
  organisation: Organisation;
  isLoading$: Observable<boolean>;

  constructor(   private store: Store<fromRoot.State>,
                 private programService: ProgramService) { }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the user and organisation from the root app state management
    this.store.select(fromRoot.getCurrentUser).pipe(take(1)).subscribe(user => {
      if(user){
        this.user = user;
      }
    })
    this.store.select(fromRoot.getCurrentOrganisation).pipe(take(1)).subscribe(organisation => {
        if(organisation){
          this.organisation = organisation;
        }
    });
    //create the program form
    this.programForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      code: new FormControl(null, Validators.required)
    });
  }

  onSubmit(){
    let program : Program = {
      name: this.programForm.value.name,
      code: this.programForm.value.code,
      organisation: this.organisation.id,
      user: this.user.uid
    }
    this.programService.startProgram(program)
  }

}
