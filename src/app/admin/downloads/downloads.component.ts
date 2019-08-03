import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';

import { Angular2CsvComponent } from 'angular2-csv';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.css']
})
export class DownloadsComponent implements OnInit {
  
  result: any;
  data: any;
  options: any;
  isLoading: boolean = false;
  value = 1000;

  @ViewChild(Angular2CsvComponent, { static: true }) csvComponent: Angular2CsvComponent;

  constructor(private fns: AngularFireFunctions) { }

  ngOnInit() {
  }

  downloadEvaluationsCsv(){
    this.isLoading = true;
  	const callable = this.fns.httpsCallable('jsonDownload');
    const limit = this.value.toString();
    callable({ limit: limit }).subscribe(result => {
      this.isLoading = false;
    	console.log(result);
    	this.result = result;
	    if(this.result && this.result.evaluations){
	    	this.downloadCsv(this.result.evaluations);
	    }
    });
  }

  downloadCsv(evaluations) {
    this.data = evaluations;
    //give options to the download file
    this.options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: false,
      useBom: false,
      headers: ['Gemaakt', 'Geevalueerd', 'Klas', 'Kleur leerling', 'Kleur leraar', 'Commentaar leerling', 'Commentaar leraar', 'Project code', 'Project', 'Competentie', 'Code', 'Onderwerp', 'Status', 'Naam leerling', 'Naam leraar']
    };
    setTimeout(() => { this.csvComponent.onDownload(); }, 0);
  }

}

