import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  index = 0;
  titles = environment.titles;

  constructor(){ }

  ngOnInit() {
  }

  onDone(isDone: boolean) {
    if(isDone){
    	this.index = 0;
    }
  }
  
}
