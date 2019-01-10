import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

import { CoursesComponent } from './courses.component';

const routes: Routes = [
	{ path: '', component: CoursesComponent, canLoad: [AuthGuard] }
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CourseRoutingModule {}