import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-save-assessment',
	template: `
		<h1 mat-dialog-title>Evaluatie(s) bewaren</h1>
		<mat-dialog-content>
			<p>Je bent klaar met het invoeren van {{passedData.length}} evaluatie(s).</p>
			<p>Wil je deze bewaren?</p>
		</mat-dialog-content>
		<mat-dialog-actions>
			<button mat-raised-button color="warn" [mat-dialog-close]="false">Annuleren</button>
			<button mat-raised-button color="primary" [mat-dialog-close]="true">Bewaren</button>
		</mat-dialog-actions>
	`
})
export class SaveAssessmentComponent {

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}

}