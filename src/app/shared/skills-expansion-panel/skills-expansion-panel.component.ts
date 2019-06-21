import { Component, OnInit, Input } from '@angular/core';
import { Evaluation } from '../../evaluations/evaluation.model';
import { EvaluationService } from '../../evaluations/evaluation.service';
import { Skill } from '../../skills/skill.model';
import { User } from '../../auth/user.model';
import { Observable, of } from 'rxjs';


@Component({
  selector: 'app-skills-expansion-panel',
  templateUrl: './skills-expansion-panel.component.html',
  styleUrls: ['./skills-expansion-panel.component.css']
})
export class SkillsExpansionPanelComponent implements OnInit {
  
  @Input() skills: Skill[];
  @Input() newEvaluationsAllowed: boolean;
  @Input() showEvaluationsAllowed: boolean;
  @Input() user: User;
  step: number;

  constructor(private evaluationService: EvaluationService) { }

  ngOnInit() {
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    if(this.step === this.skills.length - 1){
      //last tile
      this.step = 0;
    } else {
      this.step++;
    }
  }

  prevStep() {
    this.step--;
  }


}
