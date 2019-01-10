import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromProgram from '../program.reducer';
import * as fromRoot from '../../app.reducer'; 
import { Program } from '../program.model';
import { Organisation } from '../../auth/organisation.model';

import { ProgramService } from '../program.service';

@Component({
	selector: 'app-edit-program',
	templateUrl: './edit-program.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]
})
export class EditProgramComponent implements OnInit {

	programForm: FormGroup;
	program: Program;
	organisation: Organisation;
	availableStatus = ["Concept", "Actief", "Archief"];

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private store: Store<fromProgram.State>,
				private programService: ProgramService,
				private dialogRef:MatDialogRef<EditProgramComponent>) {}

	ngOnInit(){
		//create the edit program form
		this.programForm = new FormGroup({
	      name: new FormControl(null, Validators.required),
	      code: new FormControl(null, Validators.required),
	      status: new FormControl(null, Validators.required)
	    });
		//get the user's organisation
		this.store.select(fromRoot.getCurrentOrganisation).pipe(take(1)).subscribe(organisation => {
	        if(organisation){
	          this.organisation = organisation;
	        }
	    });
	    //get the active program from the state control
	    this.store.select(fromProgram.getActiveProgram).pipe(take(1)).subscribe(program => {
	        this.program = program; 
	        this.programForm.get('name').setValue(program.name);
	        this.programForm.get('code').setValue(program.code);
	        this.programForm.get('status').setValue(program.status);
	    })

	}

	onSubmit(){
		this.program.name = this.programForm.value.name;
		this.program.code = this.programForm.value.code;
		this.program.status = this.programForm.value.status;
		this.programService.editProgram(this.program);
		this.dialogRef.close();
	}

}