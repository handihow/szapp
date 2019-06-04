import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
	{
	  path: 'admin',
	  loadChildren: './admin/admin.module#AdminModule'
	},
	{ path: 'projects', loadChildren: './projects/project.module#ProjectModule' },
	{ path: 'programs', loadChildren: './programs/program.module#ProgramModule' },
	{ path: 'courses', loadChildren: './courses/course.module#CourseModule' },
	{ path: 'formatives', loadChildren: './formatives/formative.module#FormativeModule' },
	{ path: 'comments', loadChildren: './comments/comment.module#CommentModule' },
	{ path: 'evaluations', loadChildren: './evaluations/evaluation.module#EvaluationModule' },
	{ path: 'assessments', loadChildren: './assessments/assessment.module#AssessmentModule' },
	{ path: 'overviews', loadChildren: './overviews/overviews.module#OverviewsModule' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule{}