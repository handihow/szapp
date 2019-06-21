import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Skill } from '../../../skills/skill.model';

import { EvaluationService } from '../../../evaluations/evaluation.service';
import { Evaluation } from '../../../evaluations/evaluation.model';

import { Observable, of, Subscription } from 'rxjs';
import { User } from '../../../auth/user.model';

import { AuthService } from '../../../auth/auth.service';

import { SkillService } from '../../../skills/skill.service';

import { MatDialog } from '@angular/material';
import { ShowAttachmentsComponent } from '../show-attachments.component';

@Component({
  selector: 'app-panel-tile',
  templateUrl: './panel-tile.component.html',
  styleUrls: ['./panel-tile.component.css']
})
export class PanelTileComponent implements OnInit {
  
  @Input() currentTile: number;
  @Input() indexOfTile: number;
  @Input() lastTileIndex: number;
  @Input() skill: Skill;
  @Input() user: User;
  @Input() newEvaluationsAllowed: boolean;
  @Input() showEvaluationsAllowed: boolean;

  sub: Subscription;

  teacher$: Observable<User>;
  actualEvaluation: Evaluation;
  relatedEvaluations$: Observable<Evaluation[]>;

  @Output() openedPanelIndex = new EventEmitter<number>();
  @Output() clickedPreviousStep = new EventEmitter<boolean>();
  @Output() clickedNextStep = new EventEmitter<boolean>();

  constructor(private evaluationService: EvaluationService, 
  				private authService: AuthService,
  				private skillService: SkillService,
              	private dialog: MatDialog) { }

  ngOnInit() {
  	this.sub = this.evaluationService.fetchActualEvaluation(this.user.uid, this.skill.id).subscribe(actualEvaluation => {
  		this.actualEvaluation = actualEvaluation;
  		if(this.actualEvaluation && this.actualEvaluation.status == 'Niet beoordeeld'){
	      this.teacher$ = this.authService.fetchUserDisplayName(this.actualEvaluation.teacher);
	    } else {
	      this.teacher$ = of(null);
	    }
  	});
  }

  setStep(){
  	this.openedPanelIndex.emit(this.indexOfTile);
  }

  previousStep(){
  	this.clickedPreviousStep.emit(true);
  }

  nextStep(){
  	this.clickedNextStep.emit(true);
  }

  onSelectedSkill(skill: Skill){
    this.evaluationService.newEvaluation(skill);
  }

  onSelectedEvaluation(evaluation: Evaluation){
    this.evaluationService.showEvaluation(evaluation);
  }

  onViewHistory(skill: Skill){
    this.relatedEvaluations$ = this.evaluationService.fetchRelatedEvaluations(this.user.uid, skill.id);
  }

  showAttachment(skillId: string){
    this.skillService.fetchSkillAttachments(skillId).subscribe(attachments => {
      const dialogRef = this.dialog.open(ShowAttachmentsComponent , {
	      data: {
	        attachments: attachments,
	        userRole: this.user.role 
	      },
	      width: "800px"
	    });
    });
  }

}
