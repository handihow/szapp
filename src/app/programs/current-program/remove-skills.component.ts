import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-remove-skills',
	template: `
		<h1 mat-dialog-title>Competenties verwijderen</h1>
		<mat-dialog-content>
			Je wilt {{passedData.selectedItems}} competentie(s) verwijderen. Weet je dit zeker?
		</mat-dialog-content>
		<mat-dialog-actions>
			<button mat-raised-button color="warn" [mat-dialog-close]="true">Verwijderen</button>
			<button mat-raised-button color="accent" [mat-dialog-close]="false">Annuleren</button>
		</mat-dialog-actions>
	`
})
export class RemoveSkillsComponent{

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}

}