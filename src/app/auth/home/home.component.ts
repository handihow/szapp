import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 
import { Observable } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class LoginComponent implements OnInit {
  
  loginWithEmail: boolean;
  isLoading$: Observable<boolean>;
  isAuth$: Observable<boolean>;
  isIEOrEdge: boolean;

  constructor(  private authService: AuthService,
  				      private store: Store<fromRoot.State> ) { }

  ngOnInit() {
    this.isAuth$ = this.store.select(fromRoot.getIsAuth);
  	this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
  }

  onSubmit(form: NgForm){
   
   this.authService.login({
      email: form.value.email,
      password: form.value.password
    });

  }

  onGoogleLogin() {
   this.authService.signInWithGoogle();

  }

  toggleLoginWithEmail(){
    this.loginWithEmail = !this.loginWithEmail;
  }

}
