import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { Store } from '@ngrx/store';

import * as fromAssessment from '../assessment.reducer';
import * as AssessmentAction from '../assessment.actions';

@Component({
	selector: 'app-select-formative',
	templateUrl: './select-formative.component.html'
})
export class SelectFormativeComponent implements OnInit {

	formativeForm: FormGroup;

	constructor(	@Inject(MAT_DIALOG_DATA) public passedData: any,
					private store: Store<fromAssessment.State>,
					private dialogRef:MatDialogRef<SelectFormativeComponent>) {}

	ngOnInit(){
		this.formativeForm = new FormGroup({
	      formative: new FormControl(null, Validators.required),
	    });
	}

	onSelectedFormative(formative){
	    this.formativeForm.get('formative').setValue(formative);
	  }

	onSubmit(){
		this.store.dispatch(new AssessmentAction.SetFormative(this.formativeForm.value.formative));
		this.dialogRef.close(true);
	}
}