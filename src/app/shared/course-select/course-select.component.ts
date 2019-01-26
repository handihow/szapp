import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 

import { CourseService } from '../../courses/course.service';
import { Course } from '../../courses/course.model';

import { User } from '../../auth/user.model';

@Component({
  selector: 'app-course-select',
  templateUrl: './course-select.component.html',
  styleUrls: ['./course-select.component.css']
})
export class CourseSelectComponent implements OnInit {
  
  courses: Course[];
  @Input() user: User;
  selectedCourseId: string;
  @Output() selectedCourse = new EventEmitter<Course>();
  screenType$: Observable<string>;
  subs: Subscription[] = [];

  constructor(	private store: Store<fromRoot.State>,
                private courseService: CourseService) { }

  ngOnInit() {
    //fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
    //get the courses
    this.subs.push(this.courseService.fetchUserCourses(this.user).subscribe(courses => {
      this.courses = courses;
    }))
  }

  ngOnDestroy(){
  	this.subs.forEach(sub=> {
  		sub.unsubscribe();
  	})
  }

  selectCourse(courseId){
    let course = this.courses.find(course => course.id === courseId);
    this.selectedCourse.emit(course);
  }

}
