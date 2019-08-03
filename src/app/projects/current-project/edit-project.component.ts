import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromProject from '../project.reducer';
import * as fromRoot from '../../app.reducer'; 
import { Project } from '../project.model';
import { Organisation } from '../../auth/organisation.model';

import { Colors } from '../../shared/colors';

import { ProjectService } from '../project.service';

@Component({
	selector: 'app-edit-project',
	templateUrl: './edit-project.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]
})
export class EditProjectComponent implements OnInit {

	projectForm: FormGroup;
	project: Project;
	organisation: Organisation;
	availableStatus = ["Concept", "Actief", "Archief"];
	colors = Colors.projectColors.sort((a,b) => a.colorLabel.localeCompare(b.colorLabel));

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private store: Store<fromProject.State>,
				private projectService: ProjectService,
				private dialogRef:MatDialogRef<EditProjectComponent>) {}

	ngOnInit(){
		//create the edit project form
		this.projectForm = new FormGroup({
	      name: new FormControl(null, Validators.required),
	      code: new FormControl(null, Validators.compose([
                  Validators.required,
                  Validators.minLength(19),
                  Validators.maxLength(19)
                ])),
	      classes: new FormControl(null, Validators.required),
	      subjects: new FormControl(null, Validators.required),
	      status: new FormControl(null, Validators.required),
	      color: new FormControl(null, Validators.required),
	      projectTaskUrl: new FormControl(null)
	    });
		//get the user's organisation
		this.store.select(fromRoot.getCurrentOrganisation).pipe(take(1)).subscribe(organisation => {
	        if(organisation){
	          this.organisation = organisation;
	        }
	    });
	    //get the active project from the state control
	    this.store.select(fromProject.getActiveProject).pipe(take(1)).subscribe(project => {
	        this.project = project; 
	        this.projectForm.get('name').setValue(project.name);
	        this.projectForm.get('code').setValue(project.code);
	        this.projectForm.get('classes').setValue(project.classes);
	        this.projectForm.get('subjects').setValue(project.subjects);
	        this.projectForm.get('status').setValue(project.status);
	        this.projectForm.get('color').setValue(project.color);
	        if(project.projectTaskUrl){
	        	this.projectForm.get('projectTaskUrl').setValue(project.projectTaskUrl);
	        }
	    })

	}

	onSubmit(){
		this.project.name = this.projectForm.value.name;
		this.project.code = this.projectForm.value.code;
		this.project.classes = this.projectForm.value.classes;
		this.project.subjects = this.projectForm.value.subjects;
		this.project.status = this.projectForm.value.status;
		this.project.color = this.projectForm.value.color;
		this.project.projectTaskUrl = this.projectForm.value.projectTaskUrl;
		this.projectService.editProject(this.project);
		this.dialogRef.close();
	}

}