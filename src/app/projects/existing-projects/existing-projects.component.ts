import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { Project } from '../project.model';
import { ProjectService } from '../project.service';
import * as fromProject from '../project.reducer';
import * as fromRoot from '../../app.reducer'; 
import * as ProjectAction from '../project.actions';

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
  filterValue: string;

  //slide toggle that shows archived programs
  showArchived: boolean;

  projects: Project[];
  subs: Subscription[] = [];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(Angular2CsvComponent, { static: true }) csvComponent: Angular2CsvComponent;

  constructor( private projectService: ProjectService,
                private store: Store<fromProject.State> ) { }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setDisplayedColumns(screenType);
    });
    //get the current organisation
    this.store.select(fromRoot.getCurrentOrganisation).subscribe(async organisation => {
      if(organisation){
        //get the projects
        this.subs.push(this.projectService.fetchExistingProjects(organisation).subscribe(projects => {
           this.projects = projects;
           this.onChange();
           //check if there is an active filter
          this.checkActiveFilter();
        }));
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
  }

  //when view is loaded, initialize the sorting and paginator
  ngAfterViewInit() {
  	this.dataSource.sort = this.sort;
  	this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
       sub.unsubscribe() 
    });
  }

  //filter the table based on user input
  doFilter(filterValue: string) {
  	this.dataSource.filter = filterValue.trim().toLowerCase();
    this.store.dispatch(new ProjectAction.SetProjectFilter(filterValue));
  }

  checkActiveFilter(){
    this.subs.push(this.store.select(fromProject.getActiveFilter).subscribe(filter => {
        if(filter){
          this.filterValue = filter;
          this.doFilter(filter);
        }
      }));
  }

  //set the displayed columns of the table depending on the size of the display
  setDisplayedColumns(screenType){
    if(screenType==="desktop"){
      this.displayedColumns = ['created', 'name', 'code', 'classes', 'subjects', 'status'];
    } else if(screenType==="tablet"){
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
      delete project.isLocked;
      delete project.locked;
      delete project.progress;
      delete project.starred;
      delete project.stickers;
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
