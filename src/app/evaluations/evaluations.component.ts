import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromEvaluation from './evaluation.reducer';
import * as fromProject from '../projects/project.reducer';
import * as fromRoot from '../app.reducer';

import { EvaluationService } from './evaluation.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.css']
})
export class EvaluationsComponent implements OnInit, OnDestroy {

  currentEvaluation$: Observable<boolean>;
  currentSkill$: Observable<boolean>;
  currentProject$: Observable<boolean>;
  title : string = environment.titles.evaluations;
  sub: Subscription;

  constructor( private evaluationService: EvaluationService,
              private store: Store<fromRoot.State> ) { }

  ngOnInit() {
    //start listening to the current project and current evaluation
  	this.currentProject$ = this.store.select(fromEvaluation.hasActiveProject);
    this.currentSkill$ = this.store.select(fromEvaluation.hasActiveSkill);
    this.currentEvaluation$ = this.store.select(fromEvaluation.hasActiveEvaluation);
    this.sub = this.store.select(fromRoot.getCurrentUser).subscribe(user => {
      if(user && user.role === 'Leraar'){
        this.title = environment.titles.assessments;
      }
    })
  }

  ngOnDestroy(){
    this.sub.unsubscribe();
  }

}
