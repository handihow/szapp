import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromOverview from './overview.reducer';
import * as fromRoot from '../app.reducer';
import * as OverviewAction from './overview.actions';

import { User } from '../auth/user.model';

@Component({
  selector: 'app-overviews',
  templateUrl: './overviews.component.html',
  styleUrls: ['./overviews.component.css']
})
export class OverviewsComponent implements OnInit {

  currentStudent$: Observable<boolean>;
  currentProject$: Observable<boolean>;
  currentProgram$: Observable<boolean>;
  currentCourse$: Observable<boolean>;
  
  constructor( private store: Store<fromOverview.State> ) { }

  ngOnInit() {
    //get the current user 
    this.store.select(fromRoot.getCurrentUser).subscribe((user:User) => {
      if(user){
        if(user.role==="Leerling"){
          //if the user is a student then set the selected student
          this.store.dispatch(new OverviewAction.SelectStudent(user));
        }
      }
    });
    //then subscribe to changes in the project and user
  	this.currentProject$ = this.store.select(fromOverview.hasSelectedProject);
    this.currentStudent$ = this.store.select(fromOverview.hasSelectedStudent);
    this.currentProgram$ = this.store.select(fromOverview.hasSelectedProgram);
    this.currentCourse$ = this.store.select(fromOverview.getIsEditingCourse);

  }

}
