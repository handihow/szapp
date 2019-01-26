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
import { UIService } from '../../shared/ui.service';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.css']
})
export class NewProjectComponent implements OnInit {
  
  projectForm: FormGroup;
  user: User;
  organisation: Organisation;
  projects: Project[];
  isLoading$: Observable<boolean>;
  colors = Colors.projectColors.sort((a,b) => a.colorLabel.localeCompare(b.colorLabel));

  colorStyle = {
    'background-color': 'none'
  }

  constructor(   private store: Store<fromRoot.State>,
                 private projectService: ProjectService,
                 private uiService: UIService) { }

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
          this.projectService.fetchExistingProjects(organisation).pipe(take(1)).subscribe(projects => {
            this.projects = projects;
          });
        }
    });
    //create the project form
    this.projectForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      codeYear: new FormControl(null, Validators.compose([
                  Validators.required,
                  Validators.minLength(4),
                  Validators.maxLength(4)
                ])),
      codePlace: new FormControl(null, Validators.compose([
                  Validators.required,
                  Validators.minLength(4),
                  Validators.maxLength(4)
                ])),
      codeCourse: new FormControl(null, Validators.compose([
                  Validators.required,
                  Validators.minLength(4),
                  Validators.maxLength(4)
                ])),
      codeOrder: new FormControl(null, Validators.compose([
                  Validators.required,
                  Validators.minLength(4),
                  Validators.maxLength(4)
                ])),
      code: new FormControl({value: null, disabled: true}, Validators.compose([
                  Validators.required,
                  Validators.minLength(19),
                  Validators.maxLength(19)
                ])),
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
    this.projectForm.get('code').enable();
    let codes = this.projects.map(v => v.code);
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
    if(codes.includes(project.code)){
      this.uiService.showSnackbar("Deze projectcode is al eens gebruikt. Kan geen nieuw project aanmaken.", null, 3000);
    } else {
      this.projectService.startProject(project)
    }
  }

  generateCode(){
    let year = this.projectForm.get('codeYear').value;
    let place = this.projectForm.get('codePlace').value;
    let course = this.projectForm.get('codeCourse').value;
    let order = this.projectForm.get('codeOrder').value;
    if(year && place && course && order){
      let code = year + " " + place + " " + course + " " + order 
      this.projectForm.get('code').setValue(code);
    } else {
      this.uiService.showSnackbar("Completeer eerst de vier velden om de code te genereren", null, 3000);
    }
    
  }

}
