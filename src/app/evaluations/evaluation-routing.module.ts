import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

import { EvaluationsComponent } from './evaluations.component';

const routes: Routes = [
	{ path: '', component: EvaluationsComponent, canLoad: [AuthGuard] }
			
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EvaluationRoutingModule {}