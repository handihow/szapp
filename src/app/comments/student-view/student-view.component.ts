import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { Comment } from '../comment.model';
import { CommentService } from '../comment.service';
import * as fromRoot from '../../app.reducer'; 

import { User } from '../../auth/user.model';
import { environment } from '../../../environments/environment'; 

@Component({
  selector: 'app-student-view',
  templateUrl: './student-view.component.html',
  styleUrls: ['./student-view.component.css']
})
export class StudentViewComponent implements OnInit {

  isLoading$: Observable<boolean>;
  user: User;
  comments$: Observable<Comment[]>;
  titles = environment.titles;
  keywords = environment.keywords;

  constructor(	private commentService: CommentService,
                private store: Store<fromRoot.State> ) { }

  ngOnInit() {
  	//get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current user
    this.store.select(fromRoot.getCurrentUser).subscribe(user => {
      if(user){
        this.user = user;
        this.comments$ = this.commentService.fetchStudentComments(user);
      }
    });
  }

  onRead(comment: Comment){
  	comment.isReadByStudent = true;
  	this.commentService.updateCommentToDatabase(comment);
  }
  
}
