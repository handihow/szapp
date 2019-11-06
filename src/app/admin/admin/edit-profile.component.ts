import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Organisation } from '../../auth/organisation.model';
import { environment } from '../../../environments/environment';

import { AdminService } from '../admin.service';

import { Store } from '@ngrx/store';
import { User } from '../../auth/user.model';

@Component({
	selector: 'app-edit-profile',
	templateUrl: './edit-profile.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]
})
export class EditProfileComponent implements OnInit {

	organisation$ : Observable<Organisation>

	success: string;
	error: string;
	user: User;
	
	isWaiting: boolean;
	isDone: boolean;

	profileForm: FormGroup;
	titles = environment.titles;
	usesClassNumber = environment.usesClassNumbers;

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private adminService: AdminService,
				private fns: AngularFireFunctions,
				private dialogRef:MatDialogRef<EditProfileComponent>) {}

	ngOnInit(){
		//create the profile form
	    this.profileForm = new FormGroup({
	      displayName: new FormControl(null, Validators.required),
	      email: new FormControl(null, Validators.required),
	      officialClass: new FormControl(null),
	      subjects: new FormControl(null),
	      classNumber: new FormControl(null)
	    });
		this.user = this.passedData;
		if(this.user.displayName && this.user.email){
			this.profileForm.get("displayName").setValue(this.user.displayName);
			this.profileForm.get("email").setValue(this.user.email);
		}
		if(this.user.officialClass){
			this.profileForm.get("officialClass").setValue(this.user.officialClass);	
		}
		if(this.user.subjects){
			this.profileForm.get("subjects").setValue(this.user.subjects);
		}
		if(this.user.classNumber && this.usesClassNumber){
			this.profileForm.get("classNumber").setValue(this.user.classNumber);
		}
		this.organisation$ = this.adminService.fetchOrganisation(this.passedData.organisationId);
	}

	onSubmit(){
    	this.isWaiting = true;
        const callable = this.fns.httpsCallable('changeProfile');
        callable({ 
        	uid: this.user.uid,
        	displayName: this.profileForm.value.displayName,
        	email: this.profileForm.value.email,
        	officialClass: this.profileForm.value.officialClass ? this.profileForm.value.officialClass : null,
        	subjects: this.profileForm.value.subjects ? this.profileForm.value.subjects : null,
        	classNumber: this.profileForm.value.classNumber ? this.profileForm.value.classNumber : null
		}).subscribe(feedback => {
			this.isWaiting = false;
			this.isDone = true;
			if(feedback.result){
				this.success = feedback.result;
			} else if(feedback.error){
				this.error = feedback.error;
			}
		}, error => {
			this.isWaiting = false;
			this.isDone = true;
			this.error = error;
		});
	}

}