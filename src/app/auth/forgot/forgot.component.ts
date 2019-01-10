import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AuthService } from '../auth.service';
import { AuthData } from '../auth-data.model';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  

  constructor(  private authService: AuthService ){ }

  ngOnInit() {
  }

  onSubmit(form: NgForm){	
  	this.authService.sendPasswordResetEmail(form.value.email);
  }


}
