import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SkillService } from '../../skills/skill.service';

@Component({
	selector: 'app-add-attachments',
	templateUrl: './add-attachments.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]

})
export class AddAttachmentsComponent implements OnInit {

	attachments: any[];
	hasAttachments: boolean;

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any, private skillService: SkillService) {}

	ngOnInit(){
		this.skillService.fetchSkillAttachments(this.passedData.skill)
	      .subscribe((attachments: any[]) => {
	      	if(attachments.length>0){
	      		this.hasAttachments = true;
	      	} else {
	      		this.hasAttachments = false;
	      	}
	        this.attachments = attachments;
	      });
	}


}