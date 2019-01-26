import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 

import { SkillService } from '../../skills/skill.service';
import { Skill } from '../../skills/skill.model';
import { Project } from '../../projects/project.model';

@Component({
  selector: 'app-skill-select',
  templateUrl: './skill-select.component.html',
  styleUrls: ['./skill-select.component.css']
})
export class SkillSelectComponent implements OnInit {
  
  screenType$: Observable<string>;
  skills: Skill[];
  skillId: string;
  @Input() project: Project;
  @Output() selectedSkill = new EventEmitter<Skill>();
  sub: Subscription;

  constructor(private store: Store<fromRoot.State>, private skillService: SkillService) { }

  ngOnInit() {
  	//fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
  }

  ngOnChanges(){
  	if(this.project){
  		this.sub = this.skillService.fetchSkills(null, this.project.id, true).subscribe(skills => {
	      this.skills = skills;
	    });	
  	} else {
  		this.cancelSubscription();
  	}	
  }

  ngOnDestroy(){
  	this.cancelSubscription();
  }

  private cancelSubscription(){
  	if(this.sub){
		this.sub.unsubscribe()
	}
  }

  selectSkill(skillId){
    let skill = this.skills.find(skill => skill.id === skillId);
    this.selectedSkill.emit(skill);
  }



}
