import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-show-history',
	templateUrl: './show-history.component.html',
})
export class ShowHistoryComponent{

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}

}

