import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { SkillService } from '../../skills/skill.service';
import { Comment } from '../../skills/comment.model';

@Component({
	selector: 'app-edit-comments',
	templateUrl: './edit-comments.component.html'
})
export class EditCommentsComponent implements OnInit {
	comments$: Observable<Comment[]>;
	skillId: string;

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private skillService: SkillService,
				private dialogRef:MatDialogRef<EditCommentsComponent>) {
		this.skillId = passedData.skillId;
	}

	ngOnInit(){
		this.comments$ = this.skillService.fetchSkillComments(this.skillId);
	}

	onRemove(comment){
		this.skillService.removeSkillComment(this.skillId, comment);
	}

	onClose(){
		this.dialogRef.close();
	}
}