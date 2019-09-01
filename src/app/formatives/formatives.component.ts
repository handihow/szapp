import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-formatives',
  templateUrl: './formatives.component.html',
  styleUrls: ['./formatives.component.css']
})
export class FormativesComponent implements OnInit {
  index = 0;

  title : string = environment.titles.formatives;
  newTitle: string = "Nieuw " + environment.titles.formative;

  constructor(){ }

  ngOnInit() {
  }

  onDone(isDone: boolean) {
    if(isDone){
    	this.index = 0;
    }
  }
  
}
