import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { OverviewsComponent } from './overviews.component';
import { StoreModule } from '@ngrx/store';

import { OverviewRoutingModule } from './overview-routing.module';
import { OverviewSelectProjectComponent } from './overview-select-project/overview-select-project.component';
import { ProjectOverviewComponent } from './project-overview/project-overview.component';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import { CourseOverviewComponent } from './course-overview/course-overview.component';

import { overviewReducer } from './overview.reducer';
import { ProgramReportComponent } from './program-report/program-report.component';
import { ProgramOverviewComponent } from './program-overview/program-overview.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    OverviewRoutingModule,
    StoreModule.forFeature('overview', overviewReducer)
  ],
  declarations: [OverviewsComponent, OverviewSelectProjectComponent, 
  					ProjectOverviewComponent, UserOverviewComponent, ProgramReportComponent, ProgramOverviewComponent,
  					CourseOverviewComponent]
})
export class OverviewsModule { }
