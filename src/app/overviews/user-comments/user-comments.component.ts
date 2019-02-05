import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

import { Comment } from '../../comments/comment.model';
import { CommentService } from '../../comments/comment.service';
import { User } from '../../auth/user.model';

@Component({
  selector: 'app-user-comments',
  templateUrl: './user-comments.component.html',
  styleUrls: ['./user-comments.component.css']
})
export class UserCommentsComponent implements OnInit {
  
  @Input() fromDate: Timestamp;
  @Input() toDate: Timestamp;
  @Input() student: User;
  comments$: Observable<Comment[]>;

  constructor(private commentService: CommentService) { }

  ngOnInit() {
  }

  ngOnChanges() {
   	if(this.student && this.fromDate && this.toDate){
   		this.comments$ = this.commentService.fetchCommentsStudentFromDateToDate(this.student, 
                                 this.fromDate, this.toDate);
   	}
  }

}
