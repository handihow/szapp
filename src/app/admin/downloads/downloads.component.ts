import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { User } from '../../auth/user.model';

import * as fromRoot from '../../app.reducer'; 
import { take, map, startWith } from 'rxjs/operators';

import { Angular2CsvComponent } from 'angular2-csv';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.css']
})
export class DownloadsComponent implements OnInit {
  
  user: User;
  result: any;
  data: any;
  options: any;
  isLoading: boolean = false;
  value = 1000;

  @ViewChild(Angular2CsvComponent, { static: true }) csvComponent: Angular2CsvComponent;

  constructor(private fns: AngularFireFunctions, private store: Store<fromRoot.State>) { }

  ngOnInit() {
    //get the current user
    this.store.select(fromRoot.getCurrentUser).pipe(take(1)).subscribe(async user => {
      if(user){
        this.user = user;
      }
    })
  }

  downloadEvaluationsCsv(){
    this.isLoading = true;
  	const callable = this.fns.httpsCallable('jsonDownload');
    const limit = this.value.toString();
    callable({ limit: limit, organisation: this.user.organisationId }).subscribe(result => {
      this.isLoading = false;
      console.log(this.result);
    	this.result = result;
	    if(this.result && this.result.evaluations){
	    	this.downloadCsv(this.result.evaluations);
	    }
    });
  }

  downloadCsv(evaluations) {
    this.data = evaluations;
    console.log(evaluations);
    //give options to the download file
    this.options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: false,
      useBom: false,
      headers: ['Gemaakt', 'Geevalueerd', 'Klas', 'Kleur leerling', 'Kleur leraar', 'Commentaar leerling', 'Commentaar leraar', 'Leerplan code', 'Leerplan', 'Project code', 'Project', 'Competentie', 'Gewicht', 'Code', 'Onderwerp', 'Status', 'Naam leerling', 'Naam leraar']
    };
    setTimeout(() => { this.csvComponent.onDownload(); }, 0);
  }

}

