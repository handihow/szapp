import { Component, Inject } from '@angular/core';

@Component({
	selector: 'app-remove-evaluation',
	template: `
		<h1 mat-dialog-title>Evaluatie(s) verwijderen</h1>
		<mat-dialog-content>
			<p>Je wilt deze evaluatie verwijderen.</p>
			<p>Weet je dit zeker?</p>
		</mat-dialog-content>
		<mat-dialog-actions>
			<button mat-raised-button color="warn" [mat-dialog-close]="true">Verwijderen</button>
			<button mat-raised-button color="primary" [mat-dialog-close]="false">Annuleren</button>
		</mat-dialog-actions>
	`
})
export class RemoveEvaluationComponent{

	constructor() {}

}