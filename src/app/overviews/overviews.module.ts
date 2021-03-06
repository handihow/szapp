import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { OverviewsComponent } from './overviews.component';
import { StoreModule } from '@ngrx/store';

import { OverviewRoutingModule } from './overview-routing.module';
import { ProjectOverviewComponent } from './project-overview/project-overview.component';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import { CourseOverviewComponent } from './course-overview/course-overview.component';

import { overviewReducer } from './overview.reducer';
import { ProgramReportComponent } from './program-report/program-report.component';
import { ProgramOverviewComponent } from './program-overview/program-overview.component';
import { FormativeOverviewComponent } from './formative-overview/formative-overview.component';
import { CourseReportComponent } from './course-report/course-report.component';
import { UserGraphComponent } from './user-graph/user-graph.component';
import { UserCommentsComponent } from './user-comments/user-comments.component';
import { CourseReportDownloadComponent } from './course-report-download/course-report-download.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    OverviewRoutingModule,
    StoreModule.forFeature('overview', overviewReducer)
  ],
  declarations: [OverviewsComponent,ProjectOverviewComponent, UserOverviewComponent, ProgramReportComponent, 
              ProgramOverviewComponent, CourseOverviewComponent, FormativeOverviewComponent, CourseReportComponent, UserGraphComponent, UserCommentsComponent, CourseReportDownloadComponent]
})
export class OverviewsModule { }
