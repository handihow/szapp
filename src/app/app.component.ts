import { Component, OnInit, HostListener } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { Store } from '@ngrx/store';
import * as UIAction from './shared/ui.actions';
import * as fromUI from './shared/ui.reducer';

import { AuthService } from './auth/auth.service';
import * as firebase from "firebase/app";
import "firebase/analytics";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  //listen to changes on the window size
  @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.setScreenSize(window.innerWidth);
   }

  constructor(
              private titleService: Title,
              private updates: SwUpdate,
              private authService: AuthService,
               private store: Store<fromUI.State>) {
    //let the service worker check for app updates
    updates.available.subscribe(event => {
      //in the production environment, check for updates for the app
      if(environment.production){
         updates.activateUpdate().then(() => document.location.reload());
      }
    });
  }

  ngOnInit(){
    this.titleService.setTitle( environment.titles.appLongName )
  	this.authService.initAuthListener();
    this.setScreenSize(window.innerWidth);
    firebase.analytics();
  }

  setScreenSize(innerWidth){
    if(innerWidth > 1000){
      this.store.dispatch(new UIAction.ScreenType('desktop'));
    } else if(innerWidth > 600){
      this.store.dispatch(new UIAction.ScreenType('tablet'));
    } else {
      this.store.dispatch(new UIAction.ScreenType('phone'));
    }
  }

}
