import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 

import { FormativeService } from '../../formatives/formative.service';
import { Formative } from '../../formatives/formative.model';

import { User } from '../../auth/user.model';

@Component({
  selector: 'app-formative-select',
  templateUrl: './formative-select.component.html',
  styleUrls: ['./formative-select.component.css']
})
export class FormativeSelectComponent implements OnInit {
  
  formatives: Formative[];
  @Input() user: User;
  selectedFormativeId: string;
  @Output() selectedFormative = new EventEmitter<Formative>();
  screenType$: Observable<string>;
  subs: Subscription[] = [];

  constructor(	private store: Store<fromRoot.State>,
                private formativeService: FormativeService) { }

  ngOnInit() {
  	 //fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
  }

  ngOnChanges(){
    if(this.user){
      //get the formatives
      this.subs.push(this.formativeService.fetchExistingFormatives(null,this.user).subscribe(formatives => {
        this.formatives = formatives;
      }))
    }
  }

  ngOnDestroy(){
  	this.subs.forEach(sub=> {
  		sub.unsubscribe();
  	})
  }

  selectFormative(formativeId){
    let formative = this.formatives.find(formative => formative.id === formativeId);
    this.selectedFormative.emit(formative);
  }


}
