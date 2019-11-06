import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { CommentService } from '../comment.service';
import { Comment } from '../comment.model';

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

@Component({
  selector: 'app-new-comment',
  templateUrl: './new-comment.component.html',
  styleUrls: ['./new-comment.component.css']
})
export class NewCommentComponent implements OnInit {
  
  resetStudent: boolean;
  commentForm: FormGroup;
  user: User;
  organisation: Organisation;
  isLoading$: Observable<boolean>;
  @Output() isDone = new EventEmitter<boolean>();

  constructor(   private store: Store<fromRoot.State>,
                 private commentService: CommentService) { }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the user and organisation from the root app state management
    this.store.select(fromRoot.getCurrentUser).pipe(take(1)).subscribe(user => {
      if(user){
        this.user = user;
      }
    })
    this.store.select(fromRoot.getCurrentOrganisation).pipe(take(1)).subscribe(organisation => {
        if(organisation){
          this.organisation = organisation;
        }
    });
    //create the comment form
    this.commentForm = new FormGroup({
      comment: new FormControl(null, Validators.required),
      student: new FormControl(null, Validators.required)
    });
  }

  onSelectedStudent(student){
    this.resetStudent = false;
    this.commentForm.get('student').setValue(student);
  }

  onSubmit(){
    let student = this.commentForm.value.student;
    let comment : Comment = {
      comment: this.commentForm.value.comment,
      student: student.uid,
      studentName: student.displayName,
      className: student.officialClass ? student.officialClass : "-",
      organisation: this.organisation.id,
      teacher: this.user.uid,
      teacherName: this.user.displayName,
      created: new Date(),
    }
    this.commentService.addComment(comment);
    this.resetStudent = true;
    this.commentForm.reset();
    this.isDone.emit(true);
  }

}
