import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { take, map, startWith } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Evaluation } from '../../evaluations/evaluation.model';
import { EvaluationService } from '../../evaluations/evaluation.service';

import { SkillService } from '../../skills/skill.service';
import { Comment } from '../../skills/comment.model';
import { User } from '../../auth/user.model';

import * as fromRoot from '../../app.reducer'; 
import * as fromAssessment from '../assessment.reducer';
import * as AssessmentAction from '../assessment.actions';

import { UIService } from '../../shared/ui.service';
import { Observable, Subscription } from 'rxjs';

import { Colors } from '../../shared/colors';

import { EditCommentsComponent } from './edit-comments.component';

@Component({
  selector: 'app-current-assessment',
  templateUrl: './current-assessment.component.html',
  styleUrls: ['./current-assessment.component.css']
})
export class CurrentAssessmentComponent implements OnInit, OnDestroy {
  
  user: User;
  evaluation: Evaluation;
  relatedEvaluations: Evaluation[];
  assessmentForm: FormGroup;
  // image$:  Observable<string | null>;
  thumbnail$:  Observable<string | null>;
  isEvaluated: boolean;
  isLoading$: Observable<boolean>;
  //teachers of the organisation
  teachers$: Observable<User[]>;
  // showRelatedEvaluations: boolean;

  //variables holding the previous comments made on this subject and the filtered comments based on user input
  previousComments$: Observable<Comment[]>;

  colors = Colors.evaluationColors;

  selectedColor: string;
  subs: Subscription[] = [];

  constructor(  private evaluationService: EvaluationService,
                private skillService: SkillService,
                private store: Store<fromAssessment.State>,
                private uiService: UIService,
                private dialog: MatDialog) { }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current user
    this.store.select(fromRoot.getCurrentUser).pipe(take(1)).subscribe(async user => {
      if(user){
        this.user = user;
      }
    })
    //get the current evaluation to be assessed by the teacher
    this.store.select(fromAssessment.getActiveAssessment).subscribe(evaluation => {
        if(evaluation){
          this.evaluation = evaluation; 
          if(evaluation.status==="Beoordeeld"){
            this.isEvaluated = true;
          }
          //get related evaluations
          this.subs.push(this.evaluationService.fetchRelatedEvaluations(evaluation.user, evaluation.skill).subscribe(evaluations => {
            if(evaluations.length>0){
              this.relatedEvaluations = evaluations;
            }
          }));
          //get the previous comments of this competency
          this.previousComments$ = this.skillService.fetchSkillComments(evaluation.skill);
        }
    })
    //create the assessment form
    this.assessmentForm = new FormGroup({
      color: new FormControl(null, Validators.required),
      comment: new FormControl(null)
    });
  }

  displayFn(comment?: Comment): string | undefined {
    return comment ? comment.comment : undefined;
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
  }

  onCancel(){
    this.store.dispatch(new AssessmentAction.StopAssessment());
  }
  
  onSubmit(){
    //create time stamp
    var timestamp = new Date();
    if(this.assessmentForm.value.comment && this.assessmentForm.value.comment.id){
      //comment was picked from the list of comments
      this.evaluation.commentTeacher = this.assessmentForm.value.comment.comment
    } else if(this.assessmentForm.value.comment){
      //comment was added as new comment
      this.evaluation.commentTeacher = this.assessmentForm.value.comment;
      let newComment : Comment = { comment: this.assessmentForm.value.comment, date: timestamp, user: this.user.uid , teacher: this.user.displayName};
      this.skillService.saveSkillComment(this.evaluation.skill, newComment);
    } else {
      this.evaluation.commentTeacher = "";
    };
    this.evaluation.colorTeacher = this.assessmentForm.value.color.color;
    this.evaluation.colorLabelTeacher = this.assessmentForm.value.color.colorLabel;
    this.evaluation.iconTeacher = this.assessmentForm.value.color.icon;
    this.evaluation.ratingTeacher = this.assessmentForm.value.color.rating;
    this.evaluation.evaluated = timestamp;
    this.evaluation.teacherName = this.user.displayName;
    this.evaluation.status = "Beoordeeld";
    this.evaluationService.updateEvaluationToDatabase(this.evaluation, this.evaluation.user, this.evaluation.skill);
    this.store.dispatch(new AssessmentAction.StopAssessment());
  }

  editComments(evt: MouseEvent){
    evt.stopPropagation();
    const dialogRef = this.dialog.open(EditCommentsComponent, 
      {data: {skillId: this.evaluation.skill}});
  }
  

}
