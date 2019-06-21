import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { Evaluation } from '../evaluation.model';
import { EvaluationService } from '../evaluation.service';
import { Skill } from '../../skills/skill.model';
import { SkillService } from '../../skills/skill.service';

import { Project } from '../../projects/project.model';
import { User } from '../../auth/user.model';

import * as fromEvaluation from '../evaluation.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as EvaluationAction from '../evaluation.actions';

@Component({
  selector: 'app-existing-evaluations',
  templateUrl: './existing-evaluations.component.html',
  styleUrls: ['./existing-evaluations.component.css']
})
export class ExistingEvaluationsComponent implements OnInit, OnDestroy {
  
  skills: Skill[];
  project: Project;
  hasProjectTask: boolean;
  isLoading$: Observable<boolean>;
  student: User;
  currentUser$: Observable<User>;
  newEvaluationsAllowed = true;
  showEvaluationsAllowed = true;
  subs: Subscription[] = [];

  constructor( private evaluationService: EvaluationService,
                private skillService: SkillService,
                private store: Store<fromEvaluation.State> ) { }

  ngOnInit() {
    //get the loading state of the app
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //fetch the evaluations belonging to the user
    this.store.select(fromEvaluation.getStudent).subscribe(user => {
      this.student = user;
    });
    this.currentUser$ = this.store.select(fromRoot.getCurrentUser);
    //fetch the skills belonging to the project
    this.store.select(fromEvaluation.getActiveProject).subscribe(project => {
        this.project = project;
        if(project && project.projectTaskUrl){
          this.hasProjectTask=true;
        }
    });

    this.subs.push(this.skillService.fetchSkills(null, this.project.id).subscribe(skills => {
      this.skills = skills.sort(this.sortSkills);
    }));
  }

  sortSkills(a,b) {
    if (a.order < b.order)
      return -1;
    if (a.order > b.order)
      return 1;
    return 0;
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    })
  }

  onStartEvaluation(evaluation: Evaluation) {
    this.store.dispatch(new EvaluationAction.SetEvaluation(evaluation))
  }

  onStopProject(){
    this.store.dispatch(new EvaluationAction.UnsetProject())
  }
  

}
