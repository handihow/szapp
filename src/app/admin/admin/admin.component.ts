import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  result$: Observable<any>;
  email : string = '';

  constructor(private fns: AngularFireFunctions) { }

  ngOnInit() {
  }

  setModerator(){
  	const callable = this.fns.httpsCallable('addDownloader');
    this.result$ = callable({ email: this.email });
  }

  removeModerator(){
    const callable = this.fns.httpsCallable('removeDownloader');
    this.result$ = callable({ email: this.email });
  }

  setClassNumbers(){
    const callable = this.fns.httpsCallable('setClassNumbers');
    this.result$ = callable({});
  }
}
