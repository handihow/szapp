import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormativesComponent } from './formatives.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
	{ path: '', component: FormativesComponent, canLoad: [AuthGuard] }	
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FormativeRoutingModule {}