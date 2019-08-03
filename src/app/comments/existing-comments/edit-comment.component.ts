import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { CommentService } from '../comment.service';
import { Comment } from '../comment.model'; 
import { Organisation } from '../../auth/organisation.model';

export interface DialogData {
	comment: Comment,
	organisation: Organisation
}

@Component({
	selector: 'app-edit-comment',
	templateUrl: './edit-comment.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]
})
export class EditCommentComponent implements OnInit {

	commentForm: FormGroup;
	isDateEdited: boolean;

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private commentService: CommentService,
				private dialogRef:MatDialogRef<EditCommentComponent>) {
		// this.comment = passedData.data;
	}

	ngOnInit(){
		//create the edit comment form
		this.commentForm = new FormGroup({
	      comment: new FormControl(null, Validators.required)	    });
	    //get the comment to be edited from the passed data
	    this.commentForm.get('comment').setValue(this.passedData.comment.comment);
	}

	onSubmit(){
		let updatedComment: Comment = {
			id: this.passedData.comment.id,
			comment: this.commentForm.value.comment
		}
		this.commentService.updateCommentToDatabase(updatedComment).then( _ => {
			this.dialogRef.close(true);
		});
		
	}

}