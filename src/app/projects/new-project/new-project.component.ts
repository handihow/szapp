import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { ProjectService } from '../project.service';
import { Project } from '../project.model';

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

import { Colors } from '../../shared/colors';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.css']
})
export class NewProjectComponent implements OnInit {
  
  projectForm: FormGroup;
  user: User;
  organisation: Organisation;
  isLoading$: Observable<boolean>;
  colors = Colors.projectColors.sort((a,b) => a.colorLabel.localeCompare(b.colorLabel));

  colorStyle = {
    'background-color': 'none'
  }

  constructor(   private store: Store<fromRoot.State>,
                 private projectService: ProjectService) { }

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
    //create the project form
    this.projectForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      code: new FormControl(null, Validators.required),
      classes: new FormControl(null, Validators.required),
      subjects: new FormControl(null, Validators.required),
      color: new FormControl(null, Validators.required),
      projectTaskUrl: new FormControl(null)
    });
    //listen for changes on the color and adjust the background color
    this.projectForm.get('color').valueChanges.subscribe(
      (color: string) => {
        this.colorStyle = {
          'background-color': color
        }
    })
  }

  onSubmit(){
    let project : Project = {
      name: this.projectForm.value.name,
      code: this.projectForm.value.code,
      classes: this.projectForm.value.classes,
      subjects: this.projectForm.value.subjects,
      organisation: this.organisation.id,
      user: this.user.uid,
      color: this.projectForm.value.color,
      projectTaskUrl: this.projectForm.value.projectTaskUrl ? this.projectForm.value.projectTaskUrl : null
    }
    this.projectService.startProject(project)
  }

}
