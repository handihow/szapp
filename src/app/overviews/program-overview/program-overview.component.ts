
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { Evaluation } from '../../evaluations/evaluation.model';
import { EvaluationService } from '../../evaluations/evaluation.service';

import { Skill } from '../../skills/skill.model';
import { SkillService } from '../../skills/skill.service';

import { Program } from '../../programs/program.model';
import { User } from '../../auth/user.model';

import { Project } from '../../projects/project.model';
import { ProjectService } from '../../projects/project.service';

import { Organisation } from '../../auth/organisation.model';

import { UIService } from '../../shared/ui.service';

import * as fromOverview from '../overview.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as OverviewAction from '../overview.actions';

declare var jsPDF: any;


@Component({
  selector: 'app-program-overview',
  templateUrl: './program-overview.component.html',
  styleUrls: ['./program-overview.component.css']
})
export class ProgramOverviewComponent implements OnInit {
  
  program: Program;
  skills: Skill[];
  isLoading: boolean;
  organisation: Organisation;

  subs: Subscription[] = [];

  constructor(	private skillService: SkillService,
                private store: Store<fromOverview.State>,
                private projectService: ProjectService) { }

  ngOnInit() {

    this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
    	if(organisation){
        this.organisation = organisation;
  			this.subs.push(this.projectService.fetchExistingProjects(organisation, false).subscribe(projects => {
  	              this.subs.push(this.store.select(fromOverview.getSelectedProgram).subscribe(program => {
  				        if(program){
  				          this.program = program;
  				          this.subs.push(this.skillService.fetchSkills(program).subscribe(skills => {
  				              this.addProjectsToSkills(projects, skills);
  				          }));
  				        }
  				  }))
  	        }));
    	}
    }))

  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    })
  }

  addProjectsToSkills(projects, skills) {
    this.skills = skills;    
    this.skills.forEach((skill) =>{
      skill.listedUnderProjects = [];
      if(skill.projects){
      	Object.keys(skill.projects).forEach((projectId) => {
      		if(skill.projects[projectId]){
      			let project = projects.find(o => o.id === projectId);
      			skill.listedUnderProjects.push(project);
      		}
      	})
      }
    })
    this.skills.sort(this.sortSkills);
    this.isLoading = false;
  }

  private sortSkills(a,b) {
    if (a.order < b.order)
      return -1;
    if (a.order > b.order)
      return 1;
    return 0;
  }

  onDownloadPDF(){
    // Default export is a4 paper, portrait, using milimeters for units
    var doc = new jsPDF('l', 'pt');
    var columns = [["Nummer", "Competentie", "Onderwerp", "Project(en)"]];
    var rows = [];
    this.skills.forEach((skill)=>{
      var newTableRow = [];
      newTableRow.push(skill.order);
      newTableRow.push(skill.competency);
      newTableRow.push(skill.topic);
      var projectsString = "";
      if(skill.listedUnderProjects.length>0){
        skill.listedUnderProjects.forEach((project, index) => {
          if(index>0){
            projectsString += ", ";
          }
          projectsString += project.code + "-" + project.name;
        })
      }
      newTableRow.push(projectsString);
      rows.push(newTableRow);
    });
    
    //add titles to the document (name of program and name of the organisation)
    doc.setFontSize(14);
    doc.text(this.program.code + ' ' + this.program.name, 40, 50);
    doc.setFontSize(12);
    doc.text(this.organisation.name, 40, 110);
    
    //add the date of the report
    doc.setFontSize(12);
    let currentDate = new Date().toLocaleDateString();
    doc.text('Rapport gemaakt op: ' + currentDate, 40, 130);
    
    //add the table with results
    doc.autoTable({
      head: columns, 
      body: rows,
      startY: 150,
      margin: {top: 50},
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto'
      }
    });

    //save the document
    doc.save(this.organisation.name + '_' + this.program.name + '.pdf');
  }

  onStopProgram(){
    this.store.dispatch(new OverviewAction.UnselectProgram());
  }

}
