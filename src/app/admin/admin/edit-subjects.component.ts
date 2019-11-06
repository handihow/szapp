import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';

import { Store } from '@ngrx/store';
import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';
import { environment } from '../../../environments/environment';

@Component({
	selector: 'app-edit-subjects',
	templateUrl: './edit-subjects.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]
})
export class EditSubjectsComponent implements OnInit {

	organisation$ : Observable<Organisation>
	subjectsForm: FormGroup;
	titles = environment.titles;

	constructor(private adminService: AdminService,
				@Inject(MAT_DIALOG_DATA) public passedData: any,
				private dialogRef:MatDialogRef<EditSubjectsComponent>) {}

	ngOnInit(){
		//create the profile form
	    this.subjectsForm = new FormGroup({
	      subjects: new FormControl(null, Validators.required),
	    });
	    this.organisation$ = this.adminService.fetchOrganisation(this.passedData.organisationId);

	}

	onSubmit(){
    	this.adminService.updateUsersProfile(this.passedData.students, {subjects: this.subjectsForm.value.subjects})
    		.then( _ => this.dialogRef.close());
	}

}