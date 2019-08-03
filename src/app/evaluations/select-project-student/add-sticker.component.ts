import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Stickers } from '../../shared/stickers';

import { ProjectService } from '../../projects/project.service';

@Component({
	selector: 'app-add-sticker',
	templateUrl: './add-sticker.component.html',
})
export class AddStickerComponent{
	stickers = Stickers.projectStickers;

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any, private projectService: ProjectService) {}

	giveSticker(sticker){
		this.projectService.setProjectSticker(this.passedData.project, this.passedData.student, sticker.id);
	}

}
