import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { FormativeService } from '../formative.service';
import { Formative } from '../formative.model';

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

@Component({
  selector: 'app-new-formative',
  templateUrl: './new-formative.component.html',
  styleUrls: ['./new-formative.component.css']
})
export class NewFormativeComponent implements OnInit {
  
  formativeForm: FormGroup;
  user: User;
  organisation: Organisation;
  isLoading$: Observable<boolean>;
  @Output() isDone = new EventEmitter<boolean>();
  availableTags = ["Beoordeling", "Exit kaart", "Formatieve toets", 
                          "Huiswerk", "Oefening", "Opdracht",  "Prestatietaak", "Quiz", "Test", "Toets", "Werkblad"]

  constructor(   private store: Store<fromRoot.State>,
                 private formativeService: FormativeService) { }

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
    //create the formative form
    this.formativeForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      date: new FormControl(null, Validators.required),
      classes: new FormControl(null, Validators.required),
      subjects: new FormControl(null, Validators.required),
      tags: new FormControl(null),
      formativeUrl: new FormControl(null)
    });
  }

  onSubmit(){
    let formative : Formative = {
      name: this.formativeForm.value.name,
      date: this.formativeForm.value.date.toDate(),
      classes: this.formativeForm.value.classes,
      subjects: this.formativeForm.value.subjects,
      tags: this.formativeForm.value.tags,
      organisation: this.organisation.id,
      user: this.user.uid,
      created: new Date(),
      formativeUrl: this.formativeForm.value.formativeUrl ? this.formativeForm.value.formativeUrl : null
    }
    this.formativeService.addFormative(formative);
    this.formativeForm.reset();
    this.isDone.emit(true);
  }

}
