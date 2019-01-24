import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-remove-formatives',
	template: `
		<h1 mat-dialog-title>Formatieven verwijderen</h1>
		<mat-dialog-content>
			Je wilt {{passedData.selectedItems}} formatieven verwijderen. Weet je dit zeker?
		</mat-dialog-content>
		<mat-dialog-actions>
			<button mat-raised-button color="warn" [mat-dialog-close]="true">Verwijderen</button>
			<button mat-raised-button color="accent" [mat-dialog-close]="false">Annuleren</button>
		</mat-dialog-actions>
	`
})
export class RemoveFormativesComponent{

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}

}