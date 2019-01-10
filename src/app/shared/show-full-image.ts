import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
	selector: 'app-show-full-image',
	templateUrl: './show-full-image.html',
	styles: [`
		.full-width {
				max-width: 100%
			}
	`],
	animations: [
	  trigger('photoState', [
	    state('90', style({
	      transform: 'rotateZ(90deg)',
	    })),
	    state('180',   style({
	      transform: 'rotateY(180deg) rotateZ(180deg)',
	    })),
	    state('270',   style({
	      transform: 'rotateY(180deg) rotateZ(-90deg)',
	    })),
	    transition('* => *', animate('500ms ease')),
	  ])
	]
})
export class ShowFullImageComponent{

	imageState: string = '';

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}

	rotate() {
		if(this.imageState === '') {
			this.imageState = '90';
		} else if(this.imageState==='90') {
			this.imageState = '180'
		} else if(this.imageState==='180') {
			this.imageState = '270'
		} else {
			this.imageState = ''
		}
	}


}