import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { EvaluationRoutingModule } from './evaluation-routing.module';
import { StoreModule } from '@ngrx/store';

import { EvaluationsComponent } from './evaluations.component';
import { SelectProjectStudentComponent } from './select-project-student/select-project-student.component';
import { ExistingEvaluationsComponent } from './existing-evaluations/existing-evaluations.component';
import { CurrentEvaluationComponent } from './current-evaluation/current-evaluation.component';
import { evaluationReducer } from './evaluation.reducer';
import { NewEvaluationComponent } from './new-evaluation/new-evaluation.component';

@NgModule({
	declarations: [
		EvaluationsComponent,
		SelectProjectStudentComponent,
	    ExistingEvaluationsComponent,
	    CurrentEvaluationComponent,
	    NewEvaluationComponent,
	],
	imports: [
		SharedModule,
		EvaluationRoutingModule,
		StoreModule.forFeature('evaluation', evaluationReducer)
	]
})
export class EvaluationModule {}