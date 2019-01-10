import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { MatDialog } from '@angular/material';

import { CourseService } from '../course.service';
import { Course } from '../course.model';

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.css']
})
export class NewCourseComponent implements OnInit {
  
  courseForm: FormGroup;
  user: User;
  organisation: Organisation;
  isLoading$: Observable<boolean>;

  constructor(   private dialog: MatDialog,
                 private store: Store<fromRoot.State>,
                 private courseService: CourseService) {}

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
    //create the course form
    this.courseForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      code: new FormControl(null, Validators.required)
    });
  }

  onSubmit(){
    let newCourse : Course = {
      name: this.courseForm.value.name,
      code: this.courseForm.value.code,
      organisation: this.organisation.id,
      user: this.user.uid
    }
    this.courseService.startCourse(newCourse)
  }

}
