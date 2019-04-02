import { Component, OnInit, Input } from '@angular/core';
import { Evaluation } from '../../evaluations/evaluation.model';
import { EvaluationService } from '../../evaluations/evaluation.service';
import { Skill } from '../../skills/skill.model';
import { User } from '../../auth/user.model';
import { Observable, of } from 'rxjs';
import { SkillService } from '../../skills/skill.service';
import { MatDialog } from '@angular/material';
import { ShowAttachmentsComponent } from './show-attachments.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-skills-expansion-panel',
  templateUrl: './skills-expansion-panel.component.html',
  styleUrls: ['./skills-expansion-panel.component.css']
})
export class SkillsExpansionPanelComponent implements OnInit {
  
  @Input() skills: Skill[];
  @Input() newEvaluationsAllowed: boolean;
  @Input() detailViewAllowed: boolean;
  @Input() user: User;
  step: number;
  relatedEvaluations$: Observable<Evaluation[]>;
  teacher$: Observable<User>;

  constructor(private evaluationService: EvaluationService, 
              private skillService: SkillService,
              private dialog: MatDialog,
              private authService: AuthService) { }

  ngOnInit() {
  }

  setTeacher(index: number){
    if(this.skills[index].evaluation.status == 'Niet beoordeeld'){
      this.teacher$ = this.authService.fetchUserDisplayName(this.skills[index].evaluation.teacher);
    } else {
      this.teacher$ = of(null);
    }
  }

  setStep(index: number) {
    this.step = index;
    this.relatedEvaluations$ = of(null);
    this.setTeacher(this.step);
  }

  nextStep() {
    this.step++;
    this.relatedEvaluations$ = of(null);
    this.setTeacher(this.step);
  }

  prevStep() {
    this.step--;
    this.relatedEvaluations$ = of(null);
    this.setTeacher(this.step);
  }

  onSelectedEvaluation(evaluation: Evaluation){
    this.evaluationService.showEvaluation(evaluation);
  }

  onSelectedSkill(skill: Skill){
    this.evaluationService.newEvaluation(skill);
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
