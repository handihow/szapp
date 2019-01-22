import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormativesComponent } from './formatives.component';

const routes: Routes = [
	{ path: '', component: FormativesComponent }	
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FormativeRoutingModule {}