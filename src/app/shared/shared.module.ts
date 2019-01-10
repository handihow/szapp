import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Angular2CsvModule } from 'angular2-csv';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ShowFullImageComponent } from './show-full-image';

import { NgxImageGalleryModule } from 'ngx-image-gallery';

import { DropZoneDirective } from './drop-zone.directive';
import { FileSizePipe } from './file-size.pipe';
import { SkillsExpansionPanelComponent } from './skills-expansion-panel/skills-expansion-panel.component';
import { EvaluationCardComponent } from './evaluation-card/evaluation-card.component';

import { ShowHistoryComponent } from './evaluation-card/show-history.component';

import { UploadComponent } from './files-upload/upload.component';
import { RemoveEvaluationComponent } from './evaluation-card/remove-evaluation.component';
import { FilesListComponent } from './files-list/files-list.component';
import { ShowAttachmentsComponent } from './skills-expansion-panel/show-attachments.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

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
		RemoveEvaluationComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		FlexLayoutModule,
		Angular2CsvModule,
		RouterModule,
		NgxImageGalleryModule,
    	AngularFontAwesomeModule
	],
	exports: [
		CommonModule,
		FormsModule,
		Angular2CsvModule,
		ReactiveFormsModule,
		MaterialModule,
		FlexLayoutModule,
		ShowFullImageComponent,
		DropZoneDirective,
		FileSizePipe,
		SkillsExpansionPanelComponent,
		EvaluationCardComponent,
		UploadComponent,
		FilesListComponent,
    	AngularFontAwesomeModule
	],
	entryComponents: [ShowFullImageComponent, ShowHistoryComponent, ShowAttachmentsComponent, RemoveEvaluationComponent]
})
export class SharedModule {}