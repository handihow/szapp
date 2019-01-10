import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';
import { SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  constructor(
              private updates: SwUpdate,
              private authService: AuthService) {
  	//eliminate firebase timestamp error
  	const firestore = firebase.firestore();
	  const settings = {timestampsInSnapshots: true};
	  firestore.settings(settings);
    //let the service worker check for app updates
    updates.available.subscribe(event => {
      //in the production environment, check for updates for the app
      if(environment.production){
         updates.activateUpdate().then(() => document.location.reload());
      }
    });
  }

  ngOnInit(){
  	this.authService.initAuthListener();
  }

}
