import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-read-comment',
	template: `
		<h3 mat-dialog-title>{{passedData.teacherName}} op {{passedData.created.toDate() | date : 'dd-MM-yyyy'}}</h3>
		<mat-dialog-content>
			{{passedData.comment}}
		</mat-dialog-content>
		<mat-dialog-actions>
			<button mat-raised-button color="accent" [mat-dialog-close]="false">Sluiten</button>
		</mat-dialog-actions>
	`
})
export class ReadCommentComponent{

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}

}