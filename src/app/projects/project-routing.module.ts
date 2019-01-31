import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectsComponent } from './projects.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
	{ path: '', component: ProjectsComponent, canLoad: [AuthGuard] }	
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ProjectRoutingModule {}