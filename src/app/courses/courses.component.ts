import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromCourse from './course.reducer';
import * as fromRoot from '../app.reducer';

import { CourseService } from './course.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  currentCourse$: Observable<boolean>;
  hasToken: boolean;
  currentUser$: Observable<User>;

  constructor( private courseService: CourseService,
              private store: Store<fromCourse.State>,
              private authService: AuthService) { }

  ngOnInit() {
  	this.currentCourse$ = this.store.select(fromCourse.getIsEditingCourse);
    this.currentUser$ = this.store.select(fromRoot.getCurrentUser);
  }

  onConnectGC(){
    this.authService.getIncrementalGoogleScopes().then(result => {
      if(result){
        this.hasToken = true;
      }
    });
  }
  
}
