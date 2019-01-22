import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import * as fromEvaluation from '../evaluation.reducer';
import * as EvaluationAction from '../evaluation.actions';
import { MatDialog } from '@angular/material';

import { Subscription, Observable } from 'rxjs';
import { take, map, startWith } from 'rxjs/operators';

import { AuthService } from '../../auth/auth.service';
import { EvaluationService } from '../evaluation.service';
import { Evaluation } from '../evaluation.model';
import { Project } from '../../projects/project.model';
import { ProjectService } from '../../projects/project.service';

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

import { Stickers } from '../../shared/stickers';
import { AddStickerComponent } from './add-sticker.component';

@Component({
  selector: 'app-select-project-student',
  templateUrl: './select-project-student.component.html',
  styleUrls: ['./select-project-student.component.css']
})
export class SelectProjectStudentComponent implements OnInit, OnDestroy {
  
  user: User;
  isLoading$: Observable<boolean>;
  projects: Project[];
  filteredProjects: Project[];
  isFilterEnabled: boolean;
  isFiltered: boolean;
  columns = 4;
  isTeacher: boolean;
  hasSelectedStudent$: Observable<boolean>;
  selectStudentForm: FormGroup;
  students: User[];
  filteredStudents: Observable<User[]>;
  studentForm: FormGroup;
  selectedStudent: User;
  evaluations: Evaluation[];
  subs: Subscription[] = [];

  screenType: string;

  constructor(   private store: Store<fromEvaluation.State>,
                 private evaluationService: EvaluationService,
                 private authService: AuthService,
                 private dialog: MatDialog,
                 private projectService: ProjectService) { }

  ngOnInit() {
    //get the isLoading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading); 
    //get the screen type
    this.store.select(fromRoot.getScreenType).subscribe(screenType => {
      this.setColumns(screenType);
    });
    //get the current user 
    this.store.select(fromRoot.getCurrentUser).subscribe((user:User) => {
      if(user){
        //set the user property
        this.user = user;
        if(this.user.role==="Leraar"){
          //if the user is a teacher then initialize the view for teachers
          this.initializeTeacherView(user);
        } else {
          //else set the student in the app state
          this.subs.push(this.authService.fetchUserResults(user).subscribe(results => {
            let indexOfProgressResults = results.findIndex(o => o.id ==="progress");
            if(indexOfProgressResults > -1) {
              user.progress = results[indexOfProgressResults];
            }
            this.store.dispatch(new EvaluationAction.SetStudent(user));
          }));
        }
      }
    });
    //create the student input form
    this.selectStudentForm = new FormGroup({
      student: new FormControl(null, Validators.required)
    });
    //get the current organisation and start fetching projects
    this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
        this.subs.push(this.projectService.fetchExistingProjects(organisation, true).subscribe(projects => {
          this.projects = projects;
          this.hasSelectedStudent$ = this.store.select(fromEvaluation.hasSelectedStudent);
          this.store.select(fromEvaluation.getStudent).subscribe(user => {
            this.isFilterEnabled=false;
            this.isFiltered = false;
            if(user){
              this.selectedStudent = user;
              if((user.classes && user.classes.length>0) && (user.subjects && user.subjects.length>0)){
                this.isFilterEnabled=true;
                this.isFiltered = true;
              }
              this.onFilter();
              this.updateProgressBarsAndStickers(this.selectedStudent);
            };
          })
        }));
      };
    });
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
  }

  onFilter(){
    if(this.isFiltered){
        this.filteredProjects = [];
        //find projects where the classes or subjects are set in user's profile
        this.projects.forEach(project => {
          if(project.classes.filter(value => -1 !== this.selectedStudent.classes.indexOf(value)).length > 0 &&
              project.subjects.filter(value => -1 !== this.selectedStudent.subjects.indexOf(value)).length > 0){
            this.filteredProjects.push(project);
          }
        })
      } else {
        this.filteredProjects = this.projects
      }
  }

  initializeTeacherView(user: User){
    //set the isTeacher variable to true
    this.isTeacher = true;
    //start fetching students
    this.subs.push(this.authService.fetchUsers(user.organisationId, "Leerling").subscribe(students => {
      this.students = students.sort(this.sortStudents);
      //filter students in the autocomplete form
      this.filteredStudents = this.selectStudentForm.get("student").valueChanges
        .pipe(
          startWith<string | User>(''),
          map(value => typeof value === 'string' ? value : value.displayName),
          map(name => name ? this.filter(name) : this.students.slice())
        );
    }));
  }

  private sortStudents(A,B) {
    if(!A.classes || !A.classes[0]){
      return 1
    } else if(!B.classes || !B.classes[0]){
      return -1
    } else if (A.classes[0] == B.classes[0]){
      return (A.displayName > B.displayName) ? 1 : ((B.displayName > A.displayName) ? -1 : 0);
    } else {
      return (A.classes[0] > B.classes[0]) ? 1 : ((B.classes[0] > A.classes[0]) ? -1 : 0);  
    }
  }

  updateProgressBarsAndStickers(user: User){
    this.projects.forEach(project => {
      project.progress = 0;
      if(user.progress && user.progress[project.id]){
        project.progress = Math.round(user.progress[project.id] / project.countSkills * 100);
      }
      if(project.stickers && project.stickers[user.uid]){
        let index = project.stickers[user.uid];
        project.sticker = Stickers.projectStickers.find(sticker => sticker.id == index).asset;
      } else {
        project.sticker = null;
      }
      if(project.isLocked && (!project.unlocked || !project.unlocked[user.uid])){
        project.locked = true;
      } else {
        project.locked = false;
      }
    })
  }

  filter(userInput: string): User[] {
    return this.students.filter(option =>
      (option.displayName.toLowerCase().indexOf(userInput.toLowerCase()) === 0 
          || (option.classes && option.classes.includes(userInput))));
  }

  displayFn(user?: User): string | undefined {
    return user ? user.displayName : undefined;
  }

  onSelect(project){
    if(!project.locked){
      this.store.dispatch(new EvaluationAction.SetProject(project));  
    }
  }

  onSubmit(){
    this.evaluations = null;
    let selectedStudent = this.selectStudentForm.value.student;
    this.subs.push(this.authService.fetchUserResults(selectedStudent).subscribe(results => {
      let indexOfProgressResults = results.findIndex(o => o.id ==="progress");
      if(indexOfProgressResults > -1) {
        selectedStudent.progress = results[indexOfProgressResults];
      }
      this.store.dispatch(new EvaluationAction.SetStudent(selectedStudent));
      this.selectStudentForm.get("student").setValue("");
    }));
    
  }

  onChange(){
    this.store.dispatch(new EvaluationAction.UnsetStudent());
  }

  setColumns(screenType){
    if(screenType == "desktop"){
      this.columns = 4;
    } else if(screenType == "tablet"){
      this.columns = 2;
    } else {
      this.columns = 1;
    }
  }

  onAddSticker(event, project){
    event.stopPropagation();
    const dialogRef = this.dialog.open(AddStickerComponent, {
      data: {project: project, student: this.selectedStudent}
    });
  }

  onUnlock(event, project){
    event.stopPropagation();
    this.projectService.unlockProject(project, this.selectedStudent);
  }


}
