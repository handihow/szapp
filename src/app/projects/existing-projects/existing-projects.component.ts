import { Component, OnInit, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { Project } from '../project.model';
import { ProjectService } from '../project.service';
import * as fromProject from '../project.reducer';
import * as fromRoot from '../../app.reducer'; 

import { Angular2CsvComponent } from 'angular2-csv';

@Component({
  selector: 'app-existing-projects',
  templateUrl: './existing-projects.component.html',
  styleUrls: ['./existing-projects.component.css']
})
export class ExistingProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  
  isLoading$: Observable<boolean>;
  displayedColumns = ['created', 'name', 'code', 'classes', 'subjects', 'status'];
  dataSource = new MatTableDataSource<Project>();
  selection = new SelectionModel<Project>(false, null);

  data: any;
  options: any;

  //slide toggle that shows archived programs
  showArchived: boolean;

  projects: Project[];
  sub: Subscription;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(Angular2CsvComponent) csvComponent: Angular2CsvComponent;

  constructor( private projectService: ProjectService,
                private store: Store<fromProject.State> ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setDisplayedColumns(window.innerWidth);
    
  }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current organisation
    this.store.select(fromRoot.getCurrentOrganisation).subscribe(async organisation => {
      if(organisation){
        //get the projects
        this.sub = this.projectService.fetchExistingProjects(organisation).subscribe(projects => {
           this.projects = projects;
           this.onChange();
        });
      };
    })
    // selection changed
    this.selection.changed.subscribe((selectedProject) =>
    {
        if (selectedProject.added[0])   // will be undefined if no selection
        {
            this.projectService.editProject(selectedProject.added[0]);
        }
    });
    this.setDisplayedColumns(window.innerWidth);
  }

  //when view is loaded, initialize the sorting and paginator
  ngAfterViewInit() {
  	this.dataSource.sort = this.sort;
  	this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  //filter the table based on user input
  doFilter(filterValue: string) {
  	this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  //set the displayed columns of the table depending on the size of the display
  setDisplayedColumns(innerWidth){
    if(innerWidth > 1000){
      this.displayedColumns = ['created', 'name', 'code', 'classes', 'subjects', 'status'];
    } else if(innerWidth > 800){
      this.displayedColumns = ['created', 'name', 'code', 'status'];
    } else {
      this.displayedColumns = ['name', 'code'];
    }
  }

  onChange(){
    if(this.showArchived){
       this.dataSource.data = this.projects;        
    } else {
       this.dataSource.data = this.projects.filter(project => (project.status==="Actief" || project.status==="Concept")); 
    } 
  }

  downloadCsv() {
    //prepare the list of programs to be downloaded
    var projectsToBeDownloaded = this.projects;
    projectsToBeDownloaded.forEach(project => {
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      project.localDate = project.created.toDate().toLocaleDateString('nl-be', options);      
    })
    var projectsInCsv = JSON.parse(JSON.stringify(projectsToBeDownloaded));
    projectsInCsv.forEach((project) => {
      //remove the id field
      
      var classStr = '';
      //separate the courses and subjects with ";"
      project.classes.forEach((doc, index) => {
        if(index==0){
          classStr += doc;
        } else {
          classStr = classStr + '-'+ doc;
        }
      })
      project.classStr = classStr;
      //separate the subjects with ";"
      var subjectStr = '';
      //separate the courses and subjects with ";"
      project.subjects.forEach((doc, index) => {
        if(index==0){
          subjectStr += doc;
        } else {
          subjectStr = subjectStr + '-'+ doc;
        }
      })
      project.subjectStr = subjectStr;
      if(!project.projectTaskUrl){
        project.projectTaskUrl = "-";
      }
      delete project.id;
      delete project.classes;
      delete project.subjects;
      delete project.created;
      delete project.organisation;
      delete project.user;
    });
    this.data = projectsInCsv;
    //give options to the download file
    this.options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: false,
      useBom: false,
      headers: Object.keys(projectsInCsv[0])
    };
    setTimeout(() => { this.csvComponent.onDownload(); }, 0);
  }

}
