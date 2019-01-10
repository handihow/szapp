import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromAssessment from './assessment.reducer';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.css']
})
export class AssessmentsComponent implements OnInit {

  currentAssessment$: Observable<boolean>;
  currentCourse$: Observable<boolean>;
  
  constructor( 	private store: Store<fromAssessment.State> ) { }

  ngOnInit() {
  	this.currentAssessment$ = this.store.select(fromAssessment.getIsEditingAssessment);
  	this.currentCourse$ = this.store.select(fromAssessment.getIsEditingCourse);
  }


}
