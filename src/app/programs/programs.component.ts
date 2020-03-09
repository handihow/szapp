import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromProgram from './program.reducer';
import * as fromRoot from '../app.reducer'; 
import { MatDialog } from '@angular/material/dialog';

import { EditProgramComponent } from './current-program/edit-program.component';
import { SkillService } from '../skills/skill.service';
import { Skill } from '../skills/skill.model';
import { UIService } from '../shared/ui.service';

import { Program } from './program.model';
import { User } from '../auth/user.model';
import { ProgramService } from './program.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})
export class ProgramsComponent implements OnInit, OnDestroy {

  hasCurrentProgram$: Observable<boolean>;
  title : string = environment.titles.programs;
  newTitle: string = "Nieuw " + environment.titles.program;
  isFavorite: boolean;
  user: User;
  skillCount: number;
  weightedSkillCount: number;
  isAddingSkill: boolean;
  canUploadCsv: boolean;

  subs: Subscription[] = [];
  program: Program;

  constructor( private programService: ProgramService,
              private store: Store<fromProgram.State>,
              private dialog: MatDialog,
              private skillService: SkillService,
              private uiService: UIService ) { }

  ngOnInit() {
    this.subs.push(this.store.select(fromRoot.getCurrentUser).subscribe(user => {
        this.user = user;
        this.subs.push(this.store.select(fromProgram.getActiveProgram).subscribe(program => {
          if(program){
            this.program = program;
            if(this.program.starred && this.program.starred[this.user.uid]){
              this.isFavorite = true;
            }  
          }
        }));
    }));
    //make the csv upload button only available to the superusers of the application
    this.subs.push(this.store.select(fromRoot.getPermissions).subscribe(value => {
      if(value.includes('upload:skills')){
        this.canUploadCsv = true;
      }
    }));
  	this.hasCurrentProgram$ = this.store.select(fromProgram.getIsEditingProgram);
    
  }

  ngOnDestroy(){
    this.subs.forEach(sub => sub.unsubscribe());
  }

  onEditProgram() {
    const dialogRef = this.dialog.open(EditProgramComponent, {
      width: '300px'
    });
  }

  toggleAddSkill(){
    this.isAddingSkill = !this.isAddingSkill
  }

  onSaveActive(){
    //count the number of skills in the program for the database update
    this.programService.saveActiveProgram(this.skillCount, this.weightedSkillCount);
  }


  onFavorite(){
    this.isFavorite = !this.isFavorite;
    this.program.starred[this.user.uid] = this.isFavorite;
  }

  updateSkillCount(skillCounts: number[],){
    this.skillCount = skillCounts[0];
    this.weightedSkillCount = skillCounts[1];
  }

  handleFileSelect(evt) {
      var files = evt.target.files; // FileList object
      var file = files[0];
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (event: Event) => {
       var csv = reader.result;
       this.extractData(csv);
    }
  }

  extractData(data) { // Input csv data to the function

    let csvData = data;
    let allTextLines = csvData.split(/\r\n|\n/);
    let headers = allTextLines[0].split(',');

    var competencyIndex = -1;
    var topicIndex = -1;
    var orderIndex = -1;
    var linkIndex = -1;
    var linkTextIndex = -1;
    var weightIndex = -1;

    var skills: Skill[] = [];

    //check the fields that are present
    for ( let i = 0; i < headers.length; i++) {
      if(headers[i]==="Competentie") {
        competencyIndex = i;
      } else if (headers[i]==="Onderwerp"){
        topicIndex = i;
      } else if (headers[i]==="Volgnummer"){
        orderIndex = i;
      } else if (headers[i]==="Link"){
        linkIndex = i;
      } else if (headers[i]==="Linktekst"){
        linkTextIndex = i;
      } else if (headers[i]==="Gewicht"){
        weightIndex = i;
      }
    }

    if(competencyIndex==-1 || topicIndex==-1 || orderIndex==-1){
      let message =
          `
          Je mist een header in de csv file.
          Verplichte headers zijn "Volgnummer", "Competentie" en "Onderwerp" (hoofdletter gevoelig).
          `
      return this.uiService.showSnackbar(message, null, 3000);

    } else {

      var hasDuplicateOrderNumber = false;
      
      for ( let i = 1; i < allTextLines.length; i++) {
        // split content based on comma
        let data = allTextLines[i].split(',');
        const competency = data[competencyIndex];
        const order = data[orderIndex];
        const topic = data[topicIndex];
        const link = linkIndex > -1 ? data[linkIndex] : null;
        const linkText = linkTextIndex > -1 ? data[linkTextIndex] : null;
        const weight = weightIndex > -1 ? parseInt(data[weightIndex]) : 1;
        //create the new skill
        let skill: Skill = {
          competency: competency,
          order: this.program.code + ' - ' + order,
          topic: topic,
          program: this.program.id,
          link: link,
          linkText: linkText,
          weight: weight
        };
        //check if there are any duplicates in the order number
        if(i>0 && skills.map(o=>o.order).includes(skill.order)){
            hasDuplicateOrderNumber = true;
        }
        //save the skill to the skills variable
        skills.push(skill);
        
      }
      //show error message if duplicate order numbers have been detected in the file
      if(hasDuplicateOrderNumber){
          let duplicateErrorMessage =
            `
            Je csv file heeft competenties met dezelfde volgnummers.
            Corrigeer de file en probeer het opnieuw.
            `
          return this.uiService.showSnackbar(duplicateErrorMessage, null, 3000);
       
       //if no errors then batch upload the skills to the database
       } else {
        this.skillService.batchSaveSkillsToDatabase(skills);
       }
    }

  }
  
}
