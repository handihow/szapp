import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
	{ path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
	{ path: 'projects', loadChildren: () => import( './projects/project.module').then(m => m.ProjectModule) },
	{ path: 'programs', loadChildren: () => import( './programs/program.module').then(m => m.ProgramModule) },
	{ path: 'courses', loadChildren: () => import( './courses/course.module').then(m => m.CourseModule) },
	{ path: 'formatives', loadChildren: () => import( './formatives/formative.module').then(m => m.FormativeModule) },
	{ path: 'comments', loadChildren: () => import( './comments/comment.module').then(m => m.CommentModule) },
	{ path: 'evaluations', loadChildren: () => import( './evaluations/evaluation.module').then(m => m.EvaluationModule) },
	{ path: 'assessments', loadChildren: () => import( './assessments/assessment.module').then(m => m.AssessmentModule) },
	{ path: 'overviews', loadChildren: () => import( './overviews/overviews.module').then(m => m.OverviewsModule) }
];


@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule{}