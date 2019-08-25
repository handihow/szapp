import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
	selector: 'app-remove-user',
	templateUrl: './remove-user.component.html'
})
export class RemoveUserComponent {

	success: string;
	error: string;
	isWaiting: boolean;
	isDone: boolean;

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private fns: AngularFireFunctions,
				private dialogRef:MatDialogRef<RemoveUserComponent>) {}


	onConfirm(){
		// console.log(this.form.value);
    	this.isWaiting = true;
        const callable = this.fns.httpsCallable('removeUser');
        callable({ email: this.passedData.email })
        .subscribe(feedback => {
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