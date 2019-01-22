import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';
import {formatDate } from '@angular/common';

import { Program } from '../program.model';
import { ProgramService } from '../program.service';
import * as fromProgram from '../program.reducer';
import * as fromRoot from '../../app.reducer'; 

import { Angular2CsvComponent } from 'angular2-csv';

@Component({
  selector: 'app-existing-programs',
  templateUrl: './existing-programs.component.html',
  styleUrls: ['./existing-programs.component.css']
})
export class ExistingProgramsComponent implements OnInit, AfterViewInit, OnDestroy {
  
  isLoading$: Observable<boolean>;
  displayedColumns = ['created', 'name', 'code', 'status'];
  dataSource = new MatTableDataSource<Program>();
  selection = new SelectionModel<Program>(false, null);

  options: any;
  data: any;

  //slide toggle that shows archived programs
  showArchived = false;

  programs: Program[];
  sub: Subscription;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(Angular2CsvComponent) csvComponent: Angular2CsvComponent;

  constructor( private programService: ProgramService,
                private store: Store<fromProgram.State> ) { }


  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setDisplayedColumns(screenType);
    });
    //get the current organisation and then the programs
    this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
        this.sub = this.programService.fetchExistingPrograms(organisation).subscribe(programs => {
          this.programs = programs;
          if(this.showArchived){
             this.dataSource.data = this.programs;        
          } else {
             this.dataSource.data = this.programs.filter(program => (program.status==="Actief" || program.status==="Concept")); 
          }
        });
      };
    })    
    // selection changed
    this.selection.changed.subscribe((selectedProgram) =>
    {
        if (selectedProgram.added[0])   // will be undefined if no selection
        {
            this.programService.editProgram(selectedProgram.added[0]);
        }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  //when view is loaded, initialize the sorting and paginator
  ngAfterViewInit() {
  	this.dataSource.sort = this.sort;
  	this.dataSource.paginator = this.paginator;
  }

  //filter the table based on user input
  doFilter(filterValue: string) {
  	this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  //set the displayed columns of the table depending on the size of the display
  setDisplayedColumns(screenType){
    if(screenType==="desktop"){
      this.displayedColumns = ['created', 'name', 'code', 'status'];
    } else if(screenType==="tablet"){
      this.displayedColumns = ['created', 'name', 'code'];
    } else {
      this.displayedColumns = ['name', 'code'];
    }
  }

  onChange(){
    if(this.showArchived){
       this.dataSource.data = this.programs;        
    } else {
       this.dataSource.data = this.programs.filter(program => (program.status==="Actief" || program.status==="Concept")); 
    }
  }

  downloadCsv() {
    //prepare the list of programs to be downloaded
    var programsToBeDownloaded = this.programs;
    programsToBeDownloaded.forEach(program => {
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      program.localDate = program.created.toDate().toLocaleDateString('nl-be', options);      
    })
    var programsInCsv = JSON.parse(JSON.stringify(programsToBeDownloaded));
    programsInCsv.forEach((program) => {
      //remove the id field
      delete program.id;
      delete program.user;
      delete program.organisation;
      delete program.created;
      delete program.starred;
    });
    this.data = programsInCsv;
    //give options to the download file
    this.options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: false,
      useBom: false,
      headers: Object.keys(programsInCsv[0])
    };
    setTimeout(() => { this.csvComponent.onDownload(); }, 0);
  }

}
