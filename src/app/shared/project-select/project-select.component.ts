import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 

import { ProjectService } from '../../projects/project.service';
import { Project } from '../../projects/project.model';
import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

@Component({
  selector: 'app-project-select',
  templateUrl: './project-select.component.html',
  styleUrls: ['./project-select.component.css']
})
export class ProjectSelectComponent implements OnInit, OnDestroy {
  
  screenType$: Observable<string>;
  projects: Project[];
  starredProjects$: Observable<Project[]>;
  selectedProjectId: string;
  @Input() user: User;
  @Input() organisation: Organisation;
  @Output() selectedProject = new EventEmitter<Project>();
  subs: Subscription[] = [];

  constructor(private projectService: ProjectService, private store: Store<fromRoot.State>) { }

  ngOnInit() {
  	//fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
    //fetch the projects
    this.subs.push(this.projectService.fetchExistingProjects(this.organisation,true, null, false, true).subscribe(projects => {
      this.projects = projects;
    }));
    this.starredProjects$ = this.projectService.fetchExistingProjects(this.organisation,false,this.user,true, true);
  }

  selectProject(projectId){
    let project = this.projects.find(project => project.id === projectId);
    this.selectedProject.emit(project);
  }

  ngOnDestroy(){
  	this.subs.forEach(sub=> {
  		sub.unsubscribe();
  	})
  }

}
