import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';

import { Store } from '@ngrx/store';
import { User } from '../../auth/user.model';

@Component({
	selector: 'app-edit-roles',
	templateUrl: './edit-roles.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]
})
export class EditRolesComponent implements OnInit {

	success: string;
	error: string;
	user: User;
	student: boolean = false;
	teacher: boolean = false;
	schooladmin: boolean = false;
	admin: boolean = false;
	isWaiting: boolean;
	isDone: boolean;

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private fns: AngularFireFunctions,
				private dialogRef:MatDialogRef<EditRolesComponent>) {}

	ngOnInit(){
		this.user = this.passedData;
		if(this.user.roles){
			console.log(this.user.roles);
			Object.keys(this.user.roles).forEach(role => {
				if(this.user.roles[role]){this[role]=true};
			});
		}
	}

	onChangeRoles(){
    	this.isWaiting = true;
        const callable = this.fns.httpsCallable('changeRoles');
        callable({ email: this.user.email, roles: {
				student: this.student,
				teacher: this.teacher,
				schooladmin: this.schooladmin,
				admin: this.admin
			} 
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