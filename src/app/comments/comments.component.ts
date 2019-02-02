import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  index = 0;

  constructor(){ }

  ngOnInit() {
  }

  onDone(isDone: boolean) {
    if(isDone){
    	this.index = 0;
    }
  }
  
}
