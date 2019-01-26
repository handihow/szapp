import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';

import { FormativeService } from '../../formatives/formative.service';
import { Formative } from '../../formatives/formative.model'; 

import { User } from '../../auth/user.model';

import * as fromAssessment from '../assessment.reducer';
import * as AssessmentAction from '../assessment.actions';

@Component({
	selector: 'app-select-formative',
	templateUrl: './select-formative.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]

})
export class SelectFormativeComponent implements OnInit, OnDestroy {

	formativeForm: FormGroup;
	formatives: Formative[];
	sub: Subscription
	screenType$: Observable<string>;

	constructor(	@Inject(MAT_DIALOG_DATA) public passedData: any,
					private store: Store<fromAssessment.State>,
					private formativeService: FormativeService,
					private dialogRef:MatDialogRef<SelectFormativeComponent>) {}

	ngOnInit(){
		//fetch the screen size 
    	this.screenType$ = this.store.select(fromRoot.getScreenType);
		this.sub = this.formativeService.fetchExistingFormatives(null, this.passedData).subscribe(formatives => {
			this.formatives = formatives;
		});
		this.formativeForm = new FormGroup({
	      formative: new FormControl(null, Validators.required)
	    });
	}

	ngOnDestroy(){
		this.sub.unsubscribe();
	}

	onSubmit(){
		let formative = this.formatives.find(formative => formative.id === this.formativeForm.value.formative)
		this.store.dispatch(new AssessmentAction.SetFormative(formative));
		this.dialogRef.close(true);
	}
}