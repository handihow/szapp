import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CourseRoutingModule } from './course-routing.module';
import { StoreModule } from '@ngrx/store';

import { CoursesComponent } from './courses.component';
import { NewCourseComponent } from './new-course/new-course.component';
import { ExistingCoursesComponent } from './existing-courses/existing-courses.component';
import { CurrentCourseComponent } from './current-course/current-course.component';
import { courseReducer } from './course.reducer';

import { RemoveParticipantsComponent } from './current-course/remove-participants.component';

import { EditCourseComponent } from './current-course/edit-course.component';
import { NewGcCourseComponent } from './new-gc-course/new-gc-course.component';

import { environment } from '../../environments/environment';

@NgModule({
	declarations: [
		CoursesComponent,
		NewCourseComponent,
	    ExistingCoursesComponent,
	    CurrentCourseComponent,
        RemoveParticipantsComponent,
        EditCourseComponent,
        NewGcCourseComponent
	],
	imports: [
		SharedModule,
		CourseRoutingModule,
		StoreModule.forFeature('course', courseReducer)
	],
    entryComponents: [RemoveParticipantsComponent, EditCourseComponent]
	
})
export class CourseModule {}