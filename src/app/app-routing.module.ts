import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
	{ path: 'projects', loadChildren: './projects/project.module#ProjectModule', canLoad: [AuthGuard] },
	{ path: 'programs', loadChildren: './programs/program.module#ProgramModule', canLoad: [AuthGuard] },
	{ path: 'courses', loadChildren: './courses/course.module#CourseModule', canLoad: [AuthGuard] },
	{ path: 'evaluations', loadChildren: './evaluations/evaluation.module#EvaluationModule', canLoad: [AuthGuard] },
	{ path: 'assessments', loadChildren: './assessments/assessment.module#AssessmentModule', canLoad: [AuthGuard] },
	{ path: 'overviews', loadChildren: './overviews/overviews.module#OverviewsModule', canLoad: [AuthGuard] }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
	providers: [AuthGuard]
})

export class AppRoutingModule{}