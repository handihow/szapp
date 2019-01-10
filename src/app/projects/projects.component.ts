import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromProject from './project.reducer';

import { ProjectService } from './project.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  currentProject$: Observable<boolean>;
  
  constructor( private projectService: ProjectService,
              private store: Store<fromProject.State> ) { }

  ngOnInit() {
  	this.currentProject$ = this.store.select(fromProject.getIsEditingProject);
  }

}
