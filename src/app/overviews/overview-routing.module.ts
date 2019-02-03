import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OverviewsComponent } from './overviews.component';
import { AuthGuard } from '../auth/auth.guard';

import { ProjectOverviewComponent } from './project-overview/project-overview.component';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import { ProgramOverviewComponent } from './program-overview/program-overview.component';
import { CourseOverviewComponent } from './course-overview/course-overview.component';
import { ProgramReportComponent } from './program-report/program-report.component';
import { FormativeOverviewComponent } from './formative-overview/formative-overview.component';
import { CourseReportComponent } from './course-report/course-report.component';

const routes: Routes = [
	{ path: '', component: OverviewsComponent, canLoad: [AuthGuard], pathMatch: 'full' },
	{ path: 'project', component: ProjectOverviewComponent, canLoad: [AuthGuard] },
	{ path: 'user', component: UserOverviewComponent, canLoad: [AuthGuard] },
	{ path: 'program', component: ProgramOverviewComponent, canLoad: [AuthGuard] },
	{ path: 'course', component: CourseOverviewComponent, canLoad: [AuthGuard] },
	{ path: 'report', component: ProgramReportComponent, canLoad: [AuthGuard] },
	{ path: 'formative', component: FormativeOverviewComponent, canLoad: [AuthGuard] },
	{ path: 'course-report', component: CourseReportComponent, canLoad: [AuthGuard] }
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class OverviewRoutingModule {}