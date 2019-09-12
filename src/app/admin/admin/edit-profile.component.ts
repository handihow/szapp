import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

	success: string;
	error: string;
	user: User;
	
	isWaiting: boolean;
	isDone: boolean;

	profileForm: FormGroup;

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private fns: AngularFireFunctions,
				private dialogRef:MatDialogRef<EditProfileComponent>) {}

	ngOnInit(){
		//create the profile form
	    this.profileForm = new FormGroup({
	      displayName: new FormControl(null, Validators.required),
	      email: new FormControl(null, Validators.required),
	    });
		this.user = this.passedData;
		if(this.user.displayName && this.user.email){
			this.profileForm.get("displayName").setValue(this.user.displayName);
			this.profileForm.get("email").setValue(this.user.email);
		}
	}

	onSubmit(){
    	this.isWaiting = true;
        const callable = this.fns.httpsCallable('changeProfile');
        callable({ 
        	uid: this.user.uid,
        	displayName: this.profileForm.value.displayName,
        	email: this.profileForm.value.email,
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