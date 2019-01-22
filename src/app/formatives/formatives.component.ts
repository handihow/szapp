import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-formatives',
  templateUrl: './formatives.component.html',
  styleUrls: ['./formatives.component.css']
})
export class FormativesComponent implements OnInit {
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
