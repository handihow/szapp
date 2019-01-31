import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProgramsComponent } from './programs.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
	{ path: '', component: ProgramsComponent, canLoad: [AuthGuard] }	
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ProgramRoutingModule {}