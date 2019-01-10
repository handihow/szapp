import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { UIService } from '../../shared/ui.service'

import { AuthService } from '../auth.service';
import { AuthData } from '../auth-data.model';
import * as fromRoot from '../../app.reducer';
import * as fromAuth from '../auth.reducer';
import { PasswordValidator } from './password-validation';

import { Organisation } from '../organisation.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  passwords: FormGroup;

  isLoading$: Observable<boolean>;
  organisations$: Observable<Organisation[]>;

  constructor(   
              private fb: FormBuilder,
              private authService: AuthService, 
              private uiService: UIService,
              private store: Store<fromRoot.State> ) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.authService.fetchOrganisations();
    this.organisations$ = this.store.select(fromRoot.getOrganisations);
    this.passwords = this.fb.group({
        password: new FormControl(null, Validators.required),
        repeat:  new FormControl(null, Validators.required)
      }, {validator: PasswordValidator.validate.bind(this)});
    this.signupForm = new FormGroup({
      email: new FormControl(null, Validators.required),
      organisation: new FormControl(null, Validators.required),
      name: new FormControl(null, Validators.required),
      passwordFormGroup: this.passwords,
      registrationCode: new FormControl(null, Validators.required)
    });
  }

  onSubmit(){	
    let userOrganisation: Organisation = this.signupForm.value.organisation;
    if(this.signupForm.value.registrationCode === userOrganisation.registrationCode){
      this.authService.registerUser({
        email: this.signupForm.value.email,
        password: this.signupForm.value.passwordFormGroup.password
      }, 
      this.signupForm.value.name,
      userOrganisation);
    } else {
      this.uiService.showSnackbar(
        "Registratie code hoort niet bij de geselecteerde organisatie. Controleer de code en/of de organisatie.", null, 3000);
    }
  	
  }

}
