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
	selector: 'app-edit-official-class',
	templateUrl: './edit-official-class.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]
})
export class EditOfficialClassComponent implements OnInit {

	organisation$ : Observable<Organisation>
	officialClassForm: FormGroup;
	titles = environment.titles;

	constructor(private adminService: AdminService,
				@Inject(MAT_DIALOG_DATA) public passedData: any,
				private dialogRef:MatDialogRef<EditOfficialClassComponent>) {}

	ngOnInit(){
		//create the profile form
	    this.officialClassForm = new FormGroup({
	      officialClass: new FormControl(null, Validators.required),
	    });
	    this.organisation$ = this.adminService.fetchOrganisation(this.passedData.organisationId);

	}

	onSubmit(){
    	this.adminService.updateUsersOfficialClass(this.passedData.students, this.officialClassForm.value.officialClass)
    		.then( _ => this.dialogRef.close());
	}

}