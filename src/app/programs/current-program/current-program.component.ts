import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { take , map, startWith} from 'rxjs/operators';
import { FormControl, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { ProgramService } from '../program.service';
import { Program } from '../program.model';
import { Skill } from '../../skills/skill.model';
import { SkillService } from '../../skills/skill.service';
import * as fromRoot from '../../app.reducer'; 
import * as fromProgram from '../program.reducer';
import * as ProgramAction from '../program.actions';

import { RemoveSkillsComponent } from './remove-skills.component';
import { AddAttachmentsComponent } from './add-attachments.component';

import { User } from '../../auth/user.model';

import { UIService } from '../../shared/ui.service';
import { Observable, Subscription } from 'rxjs';

import { Angular2CsvComponent } from 'angular2-csv';
import { ngCopy } from 'angular-6-clipboard';

@Component({
  selector: 'app-current-program',
  templateUrl: './current-program.component.html',
  styleUrls: ['./current-program.component.css']
})
export class CurrentProgramComponent implements OnInit, OnDestroy {
  
  user: User;
  program: Program;
  skillsForm: FormGroup;
  topics: string[] = [];
  filteredTopics: Observable<string[]>;
  orders: string[] = [];
  skills: Skill[] = [];
  skill: Skill; 
  sub: Subscription;

  options: any;
  data: any;

  displayedColumns = ['select', 'order', 'weight', 'competency', 'topic', 'link', 'attachments'];
  dataSource = new MatTableDataSource<Skill>();
  isLoading$: Observable<boolean>;

  @Input() isAddingSkill: boolean;
  @Output() toggleAddSkill = new EventEmitter<boolean>();
  @Output() skillCount = new EventEmitter<number[]>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(Angular2CsvComponent, { static: true }) csvComponent: Angular2CsvComponent;

  selection = new SelectionModel<Skill>(true, null);

  constructor( private dialog: MatDialog, 
                private programService: ProgramService,
                private skillService: SkillService,
                private store: Store<fromProgram.State>,
                private uiService: UIService) { }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setDisplayedColumns(screenType);
    });
    //get the current program and then fetch the corresponding program skills
    this.store.select(fromProgram.getActiveProgram).pipe(take(1)).subscribe(program => {
        this.program = program;
        //get the current user
        this.store.select(fromRoot.getCurrentUser).pipe(take(1)).subscribe(user => {
          if(user){
            this.user = user;
            if(!this.program.starred){
              //define the starred property if it does not exist
              this.program.starred = {}
            }
          }
        }); 
        this.sub = this.skillService.fetchSkills(this.program.id).subscribe(skills => {
          this.skills = skills;
          this.skillCount.emit([this.skills.length, this.skills.map(s => s.weight ? s.weight : 1).reduce((p, n) => p + n)]);
          //set the data source of the table
          this.dataSource.data = this.skills;
          //make a list of unique topics that will be used in the autocomplete 
          this.skills.map(o => o.topic).forEach((topic)=>{
            if(!this.topics.includes(topic)){
              this.topics.push(topic);
            }
          })
          //make a list of orders to enable showing an error message when user fills in a duplicate code
          this.orders = this.skills.map(o => o.order);
        })
     });
    //create the skills form
    this.skillsForm = new FormGroup({
      order: new FormControl(null, Validators.required),
      competency: new FormControl(null, Validators.required),
      topic: new FormControl(null, Validators.required),
      weight: new FormControl(1, [Validators.min(1),Validators.max(9)]),
      link: new FormControl(null),
      linkText: new FormControl(null)
    });
    //listen for valuechanges on the topic to filter the content of the autocomplete
    this.filteredTopics = this.skillsForm.get('topic').valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter(val))
      );
  }

  closeSkillModal(){
    this.toggleAddSkill.emit(true);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  //set the displayed columns of the table depending on the size of the display
  setDisplayedColumns(screenType){
    if(screenType==="desktop"){
      this.displayedColumns = ['select', 'order', 'weight' ,'competency', 'topic', 'link', 'attachments'];
    } else if(screenType==="tablet"){
      this.displayedColumns = ['select', 'order', 'weight' ,'competency', 'topic', 'link'];
    } else {
      this.displayedColumns = ['select', 'order' ,'competency'];
    }
  }
 
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  //filter on the table
  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onCopyToClipboard() {
    var textStr = "Nummer \t Competentie \t Onderwerp\n";
    this.selection.selected.forEach(skill => {
      textStr += skill.order + "\t" + skill.competency + "\t" + skill.topic + '\n'
    });
    ngCopy(textStr);
  }

  //filter on the autocomplete field
  filter(val: string): string[] {
    if(val){
      return this.topics.filter(option =>
      option.toLowerCase().includes(val.toLowerCase()));
    }
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

  onSubmit(skillsForm: FormGroup, formDirective: FormGroupDirective){
    if(this.skill){
      //user is editing an existing skill
      //update the properties of the existing skill
      this.skill.competency = skillsForm.value.competency;
      this.skill.order = skillsForm.value.order;
      this.skill.topic = skillsForm.value.topic;
      this.skill.weight = skillsForm.value.weight ? skillsForm.value.weight: 1,
      this.skill.link = skillsForm.value.link ? skillsForm.value.link : null;
      this.skill.linkText = skillsForm.value.linkText ? skillsForm.value.linkText : null;
      this.skill.program = this.program.id;
      //update the skill in the database
      this.skillService.updateSkillToDatabase(this.skill);
      //then set the skill to null
      this.skill = null;
      //and clear the selection
      this.selection.clear();
    } else {
      let orderNumber = this.program.code + ' - ' + skillsForm.value.order;
      //show a warning message if the order number was already used
      if(this.orders.includes(orderNumber)){
        return this.uiService.showSnackbar('U heeft dit volgnummer al gebruikt. Kies een opeenvolgend uniek nummer', null, 3000);
      }
      //create the new skill
      let skill : Skill = {
        competency: skillsForm.value.competency,
        order: orderNumber,
        topic: skillsForm.value.topic,
        weight: skillsForm.value.weight ? skillsForm.value.weight : 1,
        link: skillsForm.value.link ? skillsForm.value.link : null,
        linkText: skillsForm.value.linkText ? skillsForm.value.linkText : null,
        program: this.program.id
      }
      //save the skill to the database
      this.skillService.saveSkillToDatabase(skill);
    }
    //reset all form
    formDirective.resetForm();
    skillsForm.reset();
    this.isAddingSkill = false;
  }

  onRemove() {
    const dialogRef = this.dialog.open(RemoveSkillsComponent, {
      data: {
        selectedItems: this.selection.selected.length 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.skillService.removeSkills(this.selection.selected);
        this.selection.clear();
      }
    });
  }

  onEdit() {
    this.isAddingSkill = true;
    this.skill = this.selection.selected[0];
    this.skillsForm.get('competency').setValue(this.skill.competency);
    this.skillsForm.get('order').setValue(this.skill.order);
    this.skillsForm.get('topic').setValue(this.skill.topic);
    this.skillsForm.get('weight').setValue(this.skill.weight ? this.skill.weight : 1);
    this.skillsForm.get('link').setValue(this.skill.link);
    this.skillsForm.get('linkText').setValue(this.skill.linkText);
  }

  onAddAttachments() {
    this.skill = this.selection.selected[0];
    const dialogRef = this.dialog.open(AddAttachmentsComponent, {
      data: {
        skill: this.skill.id,
        userRole: this.user.role
      },
      width: "800px",
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      var skillToBeUpdated = this.selection.selected[0];
      if(result){
        skillToBeUpdated.hasAttachments = true;
      } else {
        skillToBeUpdated.hasAttachments = false;
      }
      this.skillService.updateSkillToDatabase(skillToBeUpdated);
      this.selection.clear();
    });

  }

  downloadCsv() {
    //prepare the list of projects to be downloaded
    var skillsInCsv = JSON.parse(JSON.stringify(this.skills));
    skillsInCsv.forEach((skill) => {
      if(typeof skill.link === 'undefined' || !skill.link){
        skill.link = ' ';
      } 
      if(typeof skill.linkText === 'undefined' || !skill.linkText){
        skill.linkText = ' '
      }
      if(typeof skill.weight === 'undefined' || !skill.weight) {
        skill.weight = 1;
      }
    });
    this.data = skillsInCsv;
    //give options to the download file
    this.options = { 
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: ',',
      showLabels: true, 
      showTitle: false,
      useBom: false,
      headers: ['Volgnummer', 'Gewicht', 'Competentie', 'Onderwerp', 'Link', 'Linktekst'],
      keys: ['order', 'weight', 'competency', 'topic', 'link', 'linkText' ]
    };
    setTimeout(() => { this.csvComponent.onDownload(); }, 0);
  }


  onChangeWeight(event, skill: Skill, increase: boolean){
    event.stopPropagation();
    const currentWeight = skill.weight && typeof skill.weight === 'string' ? 
                              parseInt(skill.weight) : 
                              skill.weight ? skill.weight : 1;
    const changedWeight : number = currentWeight + (increase ? 1 : -1);
    this.skillService.updateSkillWeight(skill.id, changedWeight);
  }


}
