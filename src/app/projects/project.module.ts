import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ProjectRoutingModule } from './project-routing.module';
import { StoreModule } from '@ngrx/store';

import { ProjectsComponent } from './projects.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { ExistingProjectsComponent } from './existing-projects/existing-projects.component';
import { CurrentProjectComponent } from './current-project/current-project.component';
import { RemoveSkillsComponent } from './current-project/remove-skills.component';
import { EditProjectComponent } from './current-project/edit-project.component';
import { projectReducer } from './project.reducer';

@NgModule({
	declarations: [
		ProjectsComponent,
		NewProjectComponent,
	    ExistingProjectsComponent,
	    CurrentProjectComponent,
	    RemoveSkillsComponent,
	    EditProjectComponent
	],
	imports: [
		SharedModule,
		ProjectRoutingModule,
		StoreModule.forFeature('project', projectReducer)
	],
  	entryComponents: [RemoveSkillsComponent, EditProjectComponent]
	
})
export class ProjectModule {}