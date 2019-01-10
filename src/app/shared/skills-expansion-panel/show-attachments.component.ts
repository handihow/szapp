import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-show-attachments',
	template: `
		<h1 mat-dialog-title>Bijlagen</h1>
		<mat-dialog-content>
			<app-files-list [attachments]="passedData.attachments" [userRole]="passedData.userRole"></app-files-list>
		</mat-dialog-content>
		<mat-dialog-actions>
			<button mat-raised-button [mat-dialog-close]="false">Klaar</button>
		</mat-dialog-actions>
	`
})
export class ShowAttachmentsComponent{

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}

}