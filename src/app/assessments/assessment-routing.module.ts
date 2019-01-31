import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssessmentsComponent } from './assessments.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
	{ path: '', component: AssessmentsComponent, canLoad: [AuthGuard] }	
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AssessmentRoutingModule {}