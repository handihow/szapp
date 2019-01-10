import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { StoreModule } from '@ngrx/store';

import { AssessmentsComponent } from './assessments.component';
import { ExistingAssessmentsComponent } from './existing-assessments/existing-assessments.component';
import { CurrentAssessmentComponent } from './current-assessment/current-assessment.component';
import { assessmentReducer } from './assessment.reducer';
import { CourseOverviewComponent } from './course-overview/course-overview.component';

import { EditCommentsComponent } from './current-assessment/edit-comments.component';

@NgModule({
	declarations: [
		AssessmentsComponent,
	    ExistingAssessmentsComponent,
	    CurrentAssessmentComponent,
	    CourseOverviewComponent,
	    EditCommentsComponent
	],
	imports: [
		SharedModule,
		AssessmentRoutingModule,
		StoreModule.forFeature('assessment', assessmentReducer)
	],
	entryComponents: [EditCommentsComponent]	
})
export class AssessmentModule {}