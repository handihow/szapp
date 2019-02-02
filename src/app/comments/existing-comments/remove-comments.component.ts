import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-remove-comments',
	template: `
		<h1 mat-dialog-title>Commentaar verwijderen</h1>
		<mat-dialog-content>
			Je wilt {{passedData.selectedItems}} items verwijderen. Weet je dit zeker?
		</mat-dialog-content>
		<mat-dialog-actions>
			<button mat-raised-button color="warn" [mat-dialog-close]="true">Verwijderen</button>
			<button mat-raised-button color="accent" [mat-dialog-close]="false">Annuleren</button>
		</mat-dialog-actions>
	`
})
export class RemoveCommentsComponent{

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}

}