import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { FormativeService } from '../formative.service';
import { Formative } from '../formative.model'; 
import { Organisation } from '../../auth/organisation.model';

export interface DialogData {
	formative: Formative,
	organisation: Organisation
}

@Component({
	selector: 'app-edit-formative',
	templateUrl: './edit-formative.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]
})
export class EditFormativeComponent implements OnInit {

	formativeForm: FormGroup;
	isDateEdited: boolean;

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private formativeService: FormativeService,
				private dialogRef:MatDialogRef<EditFormativeComponent>) {
		// this.formative = passedData.data;
	}

	ngOnInit(){
		//create the edit formative form
		this.formativeForm = new FormGroup({
	      name: new FormControl(null, Validators.required),
	      date: new FormControl(null, Validators.required),
	      classes: new FormControl(null, Validators.required),
	      subjects: new FormControl(null, Validators.required),
	      tags: new FormControl(null),
	      formativeUrl: new FormControl(null)
	    });
	    //get the formative to be edited from the passed data
	    this.formativeForm.get('name').setValue(this.passedData.formative.name);
	    this.formativeForm.get('date').setValue(this.passedData.formative.date.toDate());
	    this.formativeForm.get('classes').setValue(this.passedData.formative.classes);
	    this.formativeForm.get('subjects').setValue(this.passedData.formative.subjects);
	    this.formativeForm.get('tags').setValue(this.passedData.formative.tags);
	    this.formativeForm.get('formativeUrl').setValue(this.passedData.formative.formativeUrl);
	    this.formativeForm.get('date').valueChanges.subscribe(date => {
	    	this.isDateEdited = true;
	    })
	}

	onSubmit(){
		let updatedFormative: Formative = {
			id: this.passedData.formative.id,
			name: this.formativeForm.value.name,
			classes: this.formativeForm.value.classes,
			subjects: this.formativeForm.value.subjects,
			tags: this.formativeForm.value.tags,
			formativeUrl: this.formativeForm.value.formativeUrl
		}
		if(this.isDateEdited){
			updatedFormative.date = this.formativeForm.value.date.toDate();
		}
		this.formativeService.updateFormativeToDatabase(updatedFormative).then( _ => {
			this.dialogRef.close(true);
		});
		
	}

}