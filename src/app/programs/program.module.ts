import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ProgramRoutingModule } from './program-routing.module';
import { StoreModule } from '@ngrx/store';

import { ProgramsComponent } from './programs.component';
import { NewProgramComponent } from './new-program/new-program.component';
import { ExistingProgramsComponent } from './existing-programs/existing-programs.component';
import { CurrentProgramComponent } from './current-program/current-program.component';
import { RemoveSkillsComponent } from './current-program/remove-skills.component';
import { EditProgramComponent } from './current-program/edit-program.component';
import { AddAttachmentsComponent } from './current-program/add-attachments.component';
import { programReducer } from './program.reducer';

@NgModule({
	declarations: [
		ProgramsComponent,
		NewProgramComponent,
	    ExistingProgramsComponent,
	    CurrentProgramComponent,
	    RemoveSkillsComponent,
	    EditProgramComponent,
	    AddAttachmentsComponent
	],
	imports: [
		SharedModule,
		ProgramRoutingModule,
		StoreModule.forFeature('program', programReducer)
	],
  	entryComponents: [RemoveSkillsComponent, EditProgramComponent, AddAttachmentsComponent]
	
})
export class ProgramModule {}