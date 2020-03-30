import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Angular2CsvModule } from 'angular2-csv';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ShowFullImageComponent } from './show-full-image';

import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { ImgFallbackModule } from 'ngx-img-fallback';

import { DropZoneDirective } from './drop-zone.directive';
import { FileSizePipe } from './file-size.pipe';
import { SkillsExpansionPanelComponent } from './skills-expansion-panel/skills-expansion-panel.component';
import { EvaluationCardComponent } from './evaluation-card/evaluation-card.component';

import { ShowHistoryComponent } from './evaluation-card/show-history.component';

import { UploadComponent } from './files-upload/upload.component';
import { RemoveEvaluationComponent } from './evaluation-card/remove-evaluation.component';
import { FilesListComponent } from './files-list/files-list.component';
import { ShowAttachmentsComponent } from './skills-expansion-panel/show-attachments.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProjectSelectComponent } from './project-select/project-select.component';
import { SkillSelectComponent } from './skill-select/skill-select.component';
import { CourseSelectComponent } from './course-select/course-select.component';
import { ProgramSelectComponent } from './program-select/program-select.component';
import { StudentSelectComponent } from './student-select/student-select.component';
import { FormativeSelectComponent } from './formative-select/formative-select.component';
import { PanelTileComponent } from './skills-expansion-panel/panel-tile/panel-tile.component';
import { OrganisationSelectComponent } from './organisation-select/organisation-select.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';

@NgModule({
	declarations: [
		ShowFullImageComponent,
		ShowAttachmentsComponent,
		DropZoneDirective,
		FileSizePipe,
		SkillsExpansionPanelComponent,
		EvaluationCardComponent,
		ShowHistoryComponent,
		UploadComponent,
		FilesListComponent,
		RemoveEvaluationComponent,
		ProjectSelectComponent,
		SkillSelectComponent,
		CourseSelectComponent,
		ProgramSelectComponent,
		StudentSelectComponent,
		FormativeSelectComponent,
		PanelTileComponent,
		OrganisationSelectComponent,
		UserAvatarComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		FlexLayoutModule,
		Angular2CsvModule,
		RouterModule,
		NgxGalleryModule,
    	FontAwesomeModule,
    	AngularFireFunctionsModule,
    	ImgFallbackModule
	],
	exports: [
		CommonModule,
		FormsModule,
		Angular2CsvModule,
		ReactiveFormsModule,
		MaterialModule,
		FlexLayoutModule,
		AngularFireFunctionsModule,
		ImgFallbackModule,
		ShowFullImageComponent,
		DropZoneDirective,
		FileSizePipe,
		SkillsExpansionPanelComponent,
		EvaluationCardComponent,
		UploadComponent,
		FilesListComponent,
		ProjectSelectComponent,
		SkillSelectComponent,
		CourseSelectComponent,
		ProgramSelectComponent,
		StudentSelectComponent,
    	FontAwesomeModule,
    	FormativeSelectComponent,
    	PanelTileComponent,
    	OrganisationSelectComponent,
    	UserAvatarComponent
	],
	entryComponents: [ShowFullImageComponent, ShowHistoryComponent, ShowAttachmentsComponent, RemoveEvaluationComponent]
})
export class SharedModule {}