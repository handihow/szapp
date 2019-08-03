import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromCourse from '../course.reducer';
import * as fromRoot from '../../app.reducer'; 
import { Course } from '../course.model';
import { Organisation } from '../../auth/organisation.model';

import { CourseService } from '../course.service';

@Component({
	selector: 'app-edit-course',
	templateUrl: './edit-course.component.html',
	styles: [`
		.full-width {
			width: 100%;
		}
	`]
})
export class EditCourseComponent implements OnInit {

	courseForm: FormGroup;
	course: Course;
	organisation: Organisation;
	availableStatus = ["Concept", "Actief", "Archief"];

	constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
				private store: Store<fromCourse.State>,
				private courseService: CourseService,
				private dialogRef:MatDialogRef<EditCourseComponent>) {}

	ngOnInit(){
		//create the edit program form
		this.courseForm = new FormGroup({
	      name: new FormControl(null, Validators.required),
	      code: new FormControl(null, Validators.required),
	      status: new FormControl(null, Validators.required)
	    });
		//get the user's organisation
		this.store.select(fromRoot.getCurrentOrganisation).pipe(take(1)).subscribe(organisation => {
	        if(organisation){
	          this.organisation = organisation;
	        }
	    });
	    //get the active program from the state control
	    this.store.select(fromCourse.getActiveCourse).pipe(take(1)).subscribe(course => {
	        this.course = course; 
	        this.courseForm.get('name').setValue(course.name);
	        this.courseForm.get('code').setValue(course.code);
	        if(course.isGoogleClassroom){
	        	this.courseForm.get('code').disable();
	        }
	        this.courseForm.get('status').setValue(course.status);
	    })

	}

	onSubmit(){
		this.course.name = this.courseForm.value.name;
		this.course.code = this.courseForm.value.code;
		this.course.status = this.courseForm.value.status;
		this.courseService.editCourse(this.course);
		this.dialogRef.close();
	}

}