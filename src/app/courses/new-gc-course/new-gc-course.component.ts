import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../auth/auth.service';
import { Course } from '../course.model';
import { CourseService } from '../course.service';

import { UIService } from '../../shared/ui.service';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

import { take } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-new-gc-course',
  templateUrl: './new-gc-course.component.html',
  styleUrls: ['./new-gc-course.component.css']
})
export class NewGcCourseComponent implements OnInit {
  
  organisation: Organisation;
  user: User;
  googleClassrooms: Course[] = [];
  isLoading: boolean = true;
  selectedOptions: Course[] = [];
  isFinished: boolean;
  isLoading$: Observable<boolean>;
  hasToken: boolean = true;

  constructor(	private store: Store<fromRoot.State>,
               	private courseService: CourseService,
                private uiService: UIService,
                private authService: AuthService) { }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
  	//get the user and organisation from the root app state management
    this.store.select(fromRoot.getCurrentUser).pipe(take(1)).subscribe(user => {
      if(user){
        this.user = user;
        if(user.hasGoogleForEducation){
          this.getGoogleClassrooms();
        }
      }
    })
    this.store.select(fromRoot.getCurrentOrganisation).pipe(take(1)).subscribe(organisation => {
        if(organisation){
          this.organisation = organisation;
        }
    });
  }

  async getGoogleClassrooms(){
    let res = await this.courseService.findClassrooms().catch(err => {
      this.uiService.showSnackbar("Geen geldig access token. Log opnieuw als je Google Classrooms wilt importeren.", null, 3000);
      this.authService.removeToken();
      this.hasToken = false;
    });
    if(res.courses){
      let today = new Date();
      res.courses.forEach(classroom => {
        let googleClassroom : Course = {
          name: classroom.name,
          code: classroom.enrollmentCode,
          created: today,
          status: "Actief",
          isGoogleClassroom: true,
          googleClassroomInfo: classroom,
          organisation: this.organisation.id,
          user: this.user.uid
        }
        this.googleClassrooms.push(googleClassroom);
      })
    }
  }

  async startImport(){
  	this.isFinished = await this.courseService.addGoogleClassroomsToDatabase(this.selectedOptions, this.organisation);

  }

  moreImports() {
  	this.isFinished = false;
  }

}