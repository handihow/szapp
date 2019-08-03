import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { FormControl, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { ProjectService } from '../project.service';
import { Project } from '../project.model';

import { Program } from '../../programs/program.model';
import { ProgramService } from '../../programs/program.service';

import { Skill } from '../../skills/skill.model';
import { SkillService } from '../../skills/skill.service';

import * as fromRoot from '../../app.reducer'; 
import * as fromProject from '../project.reducer';
import * as ProjectAction from '../project.actions';

import { RemoveSkillsComponent } from './remove-skills.component';
import { EditProjectComponent } from './edit-project.component';
import { Skillgroup } from './skillgroup.model';

import { UIService } from '../../shared/ui.service';
import { Observable, Subscription } from 'rxjs';

import { Angular2CsvComponent } from 'angular2-csv';
import { ngCopy } from 'angular-6-clipboard';

import { User } from '../../auth/user.model';

@Component({
  selector: 'app-current-project',
  templateUrl: './current-project.component.html',
  styleUrls: ['./current-project.component.css']
})
export class CurrentProjectComponent implements OnInit, OnDestroy {
  
  // user: User;
  project: Project;
  programs$: Observable<Program[]>;
  skills: Skill[];
  programSkills: Skill[];
  skillsForm: FormGroup;
  skillOrderNumbers: string[];
  skillGroups: Skillgroup[];

  user: User;

  data: any;
  options: any;

  displayedColumns = ['select' ,'order' ,'competency', 'topic', 'link']; //'program'
  dataSource = new MatTableDataSource<Skill>();
  isLoading$: Observable<boolean>;

  sub: Subscription;

  isFavorite: boolean;
  isLocked: boolean;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(Angular2CsvComponent, { static: true }) csvComponent: Angular2CsvComponent;

  selection = new SelectionModel<Skill>(true, null);

  constructor( private dialog: MatDialog, 
                private projectService: ProjectService,
                private programService: ProgramService,
                private skillService: SkillService,
                private store: Store<fromProject.State>,
                private uiService: UIService) { }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setDisplayedColumns(screenType);
    });
    //get the current organisation and start fetching programs
    this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
        //get the programs
        this.programs$ = this.programService.fetchExistingPrograms(organisation, true);
      };
    })
    //get the current project and then fetch the corresponding project skills
    this.store.select(fromProject.getActiveProject).pipe(take(1)).subscribe(project => {
        this.project = project;
        //get the current user
        this.store.select(fromRoot.getCurrentUser).pipe(take(1)).subscribe(user => {
          if(user){
            this.user = user;
            if(!this.project.starred){
              //define the starred property if it does not exist
              this.project.starred = {}
            }
            if(this.project.starred[user.uid]){
              this.isFavorite = true;
            }
            if(this.project.isLocked){
              this.isLocked = true;
            }
          }
        });
        //start fetching project skills
        this.sub = this.skillService.fetchSkills(null, this.project.id).subscribe(skills => {
           this.skills = skills;
           this.dataSource.data = this.skills; 
          this.skillOrderNumbers = this.skills.map(o => o.order);
        });
    });
    //create the skills form
    this.skillsForm = new FormGroup({
      program: new FormControl(null, Validators.required),
      competency: new FormControl(null, Validators.required)
    });
    //listen to changes in the program and then fetch associated skills
    this.skillsForm.get('program').valueChanges.subscribe(
      (program: Program) => {
        if(program){
          this.skillService.fetchSkills(program.id)
            .subscribe((skills: Skill[]) => {
              //set the skills variable to contain all the skills retrieved from the database
              this.programSkills = skills;
              //first make sure the topics variable is empty
              this.skillGroups = [];
              //sort the skills on order
              skills.sort((a,b) => {return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0);})
              //first create the unique list of topics from the skills array
              let topics = Array.from(new Set(skills.map((skill: any) => skill.topic))).sort();
              //then loop over the list of topics to create groups of skills that are displayed in the multiselect list
              topics.forEach((topic) =>{
                let skillgroup: Skillgroup = {
                  topic: topic,
                  skills: skills.filter(skill => skill.topic===topic)
                }
                this.skillGroups.push(skillgroup);
              });
            });
        }
      });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  //set the displayed columns of the table depending on the size of the display
  setDisplayedColumns(screenType){
    if(screenType == "desktop"){
      this.displayedColumns = ['select' ,'order' ,'competency', 'topic', 'link']; 
    } else if(screenType == "tablet"){
      this.displayedColumns = ['select' ,'order' ,'competency', 'topic']; 
    } else {
      this.displayedColumns = ['select' ,'order' ,'competency']; 
    }
  }

  onSubmit(skillsForm: FormGroup, formDirective: FormGroupDirective){
    let skillsToBeAddedToProject = this.skillsForm.value.competency;
    let filteredSkillsToBeAddedToProject : Skill[] = [];
    //loop through all the competencies that have been selected
    skillsToBeAddedToProject.forEach((skill) => {
      if(this.skillOrderNumbers.includes(skill.order)){
        this.uiService.showSnackbar('U heeft de leerplanreferentie ' + skill.order + ' reeds gebruikt. Deze wordt niet opgeslagen.', null, 3000);
      } else {
        filteredSkillsToBeAddedToProject.push(skill);
      }
    });
    this.skillService.manageSkillsOfProject(filteredSkillsToBeAddedToProject, this.project.id, true);
    //set the skills variable to empty array
    this.programSkills = [];
    //now reset the form
    formDirective.resetForm();
    skillsForm.reset();
  }

  onRemove() {
    const dialogRef = this.dialog.open(RemoveSkillsComponent, {
      data: {
        selectedItems: this.selection.selected.length,
        selectedSkills: this.selection.selected 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.skillService.manageSkillsOfProject(this.selection.selected, this.project.id, false);
        this.selection.clear();
      }
    });
  }

  onCopyToClipboard() {
    var textStr = "Nummer \t Competentie \t Onderwerp\n";
    this.selection.selected.forEach(skill => {
      textStr += skill.order + "\t" + skill.competency + "\t" + skill.topic + '\n'
    });
    ngCopy(textStr);
  }

  onEditProject() {
    const dialogRef = this.dialog.open(EditProjectComponent, {
      width: '300px'
    });
  }

  onSaveActive(){
    //count the number of skills in the project for the database update
    let countedSkills = this.skills.length;
    this.projectService.saveActiveProject(countedSkills);
  }

  downloadCsv() {
    //prepare the list of projects to be downloaded
    var skillsInCsv = JSON.parse(JSON.stringify(this.skills));;
    skillsInCsv.forEach((skill) => {
      //remove the id field
      delete skill.id;
      delete skill.program;
      delete skill.projects
    });
    this.data = skillsInCsv;
    //give options to the download file
    this.options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: false,
      useBom: false,
      headers: Object.keys(skillsInCsv[0])
    };
    setTimeout(() => { this.csvComponent.onDownload(); }, 0);
  }

  onFavorite(){
    this.isFavorite = !this.isFavorite;
    this.project.starred[this.user.uid] = this.isFavorite;
  }

  onLock(){
    this.isLocked = !this.isLocked;
    this.project.isLocked = this.isLocked;
  }


}
