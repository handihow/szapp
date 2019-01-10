import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material';

import * as fromAssessment from '../../assessments/assessment.reducer';
import * as AssessmentAction from '../../assessments/assessment.actions';

import * as fromEvaluation from '../../evaluations/evaluation.reducer';
import * as EvaluationAction from '../../evaluations/evaluation.actions';

import { EvaluationService } from '../../evaluations/evaluation.service';

import { AngularFireStorage } from 'angularfire2/storage';

import { Evaluation } from '../../evaluations/evaluation.model';
import { ShowFullImageComponent } from '../../shared/show-full-image';
import { ShowHistoryComponent } from './show-history.component';
import { RemoveEvaluationComponent } from './remove-evaluation.component';
import { User } from '../../auth/user.model';

@Component({
  selector: 'app-evaluation-card',
  templateUrl: './evaluation-card.component.html',
  styleUrls: ['./evaluation-card.component.css']
})
export class EvaluationCardComponent implements OnInit {
  
  @Input() evaluation: Evaluation;
  @Input() relatedEvaluations: Evaluation[];
  image$:  Observable<string | null>;
  thumbnail$:  Observable<string | null>;
  showRelatedEvaluations: boolean;
  @Input() isAssessment: boolean;
  @Input() user: User;

  constructor(	private store: Store<fromAssessment.State>,
                private storage: AngularFireStorage,
                private dialog: MatDialog,
                private evaluationService: EvaluationService) { }

  ngOnInit() {
    if(this.evaluation.thumbnailURL){
        const refTN = this.storage.ref(this.evaluation.thumbnailURL);
        this.thumbnail$ = refTN.getDownloadURL();
      }
  }

  onCancel(){
    if(this.isAssessment){
      this.store.dispatch(new AssessmentAction.StopAssessment());
    } else {
      this.store.dispatch(new EvaluationAction.UnsetEvaluation());
    }
  }

  onShowFullImage(){
    const refIM = this.storage.ref(this.evaluation.imageURL);
    this.image$ = refIM.getDownloadURL();
    const dialogRef = this.dialog.open(ShowFullImageComponent, {
      data: {
        image$: this.image$ 
      }
    });
  }

  onShowRelated(){
    const dialogRef = this.dialog.open(ShowHistoryComponent, {
      data: this.relatedEvaluations
    });
  }

  onRemove(){
    const dialogRef = this.dialog.open(RemoveEvaluationComponent, {width: '300px'});

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.evaluationService.deleteEvaluation(this.evaluation);
      }
    });
  }

}
