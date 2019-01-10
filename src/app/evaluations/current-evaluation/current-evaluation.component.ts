import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { Evaluation } from '../evaluation.model';
import { EvaluationService } from '../evaluation.service';
import { Project } from '../../projects/project.model';
import { User } from '../../auth/user.model';

import * as fromEvaluation from '../evaluation.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as EvaluationAction from '../evaluation.actions';


@Component({
  selector: 'app-current-evaluation',
  templateUrl: './current-evaluation.component.html',
  styleUrls: ['./current-evaluation.component.css']
})
export class CurrentEvaluationComponent implements OnInit {
  
  evaluation:Evaluation;
  relatedEvaluations: Evaluation[];
  // image$:  Observable<string | null>;
  thumbnail:  string;
  isLoading$: Observable<boolean>;
  isEvaluated: boolean;
  currentUser$: Observable<User>;
  student$: Observable<User>;

  subs: Subscription[] = [];

  constructor(  private evaluationService: EvaluationService,
                private store: Store<fromEvaluation.State> ) {}

  ngOnInit() {
    //get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //fetch the current user of the application (it may be a teacher who has selected student)
    this.currentUser$ = this.store.select(fromRoot.getCurrentUser);
    //get the user and organisation from the evaluation state
    this.student$ = this.store.select(fromEvaluation.getStudent);
    //get the evaluation from the state and set the variables of the current evaluation
    this.subs.push(this.store.select(fromEvaluation.getActiveEvaluation).subscribe((evaluation: Evaluation) => {
      if(evaluation){
        this.evaluation = evaluation;
        //get related evaluations
        this.subs.push(this.evaluationService.fetchRelatedEvaluations(evaluation.user, evaluation.skill).subscribe(evaluations => {
          this.relatedEvaluations = evaluations;
        }));
      }  
    }));
    
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
  }


}
