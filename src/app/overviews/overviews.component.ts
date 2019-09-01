import { Component, OnInit, HostListener, OnDestroy} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../app.reducer';
import * as fromOverview from './overview.reducer';
import * as OverviewAction from './overview.actions';

import { Router } from '@angular/router';

import { Subscription, Observable } from 'rxjs';

import { Project } from '../projects/project.model';
import { Program } from '../programs/program.model';

import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';

import { Course } from '../courses/course.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-overviews',
  templateUrl: './overviews.component.html',
  styleUrls: ['./overviews.component.css']
})
export class OverviewsComponent implements OnInit, OnDestroy  {
  
  user: User;
  organisation: Organisation;
  isLoading$: Observable<boolean>;
  starredProjects$: Observable<Project[]>;
  projects: Project[];
  programs$: Observable<Program[]>;
  starredPrograms$: Observable<Program[]>;
  courses$: Observable<Course[]>;
  selectStudentForm: FormGroup;
  selectProjectForm: FormGroup;
  selectProgramForm: FormGroup;
  selectClassroomForm: FormGroup;
  selectFormativeForm: FormGroup;
  selectClassroomReportForm: FormGroup;
  subs: Subscription[] = [];
  title : string = environment.titles.overviews;
  projectsTitle: string = environment.titles.projects;
  projectTitle: string = environment.titles.project;
  formativesTitle: string = environment.titles.formatives;
  formativeTitle: string = environment.titles.formative;

  constructor( private router: Router, private store: Store<fromOverview.State>  ) { }

  ngOnInit() {
    //get the current user 
    this.store.select(fromRoot.getCurrentUser).subscribe((user:User) => {
      if(user){
        this.user = user;
        if(user.role==="Leerling"){
          //if the user is a student then set the selected student
          this.store.dispatch(new OverviewAction.SelectStudent(user));
          this.router.navigate(['/overviews/user'])
        }
      }
      this.store.select(fromRoot.getCurrentOrganisation).subscribe(org => {
        this.organisation = org;
      });
      this.isLoading$ = this.store.select(fromRoot.getIsLoading);
      //create the project input form
      this.selectProjectForm = new FormGroup({
        project: new FormControl(null, Validators.required)
      });
      //create the student input form
      this.selectStudentForm = new FormGroup({
        student: new FormControl(null, Validators.required)
      });
      //create the program input form
      this.selectProgramForm = new FormGroup({
        program: new FormControl(null, Validators.required)
      });
      //create the classroom input form
      this.selectClassroomForm = new FormGroup({
        course: new FormControl(null, Validators.required),
        program: new FormControl(null, Validators.required)
      });
      //create the formative input form
      this.selectFormativeForm = new FormGroup({
        formative: new FormControl(null, Validators.required)
      })
      //create the select classroom for report form
      this.selectClassroomReportForm = new FormGroup({
        course: new FormControl(null, Validators.required)
      })
    });

  }

  ngOnDestroy(){
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
  }

  onSubmitStudent(){
    this.store.dispatch(new OverviewAction.SelectStudent(this.selectStudentForm.value.student));
    this.router.navigate(['/overviews/user']);
  }

  onSubmitProject(){
    this.store.dispatch(new OverviewAction.SelectProject(this.selectProjectForm.value.project));
    this.router.navigate(['/overviews/project']);
  }

  onSubmitClassroomForm(){
    this.store.dispatch(new OverviewAction.SelectProgram(this.selectClassroomForm.value.program));
    this.store.dispatch(new OverviewAction.StartCourse(this.selectClassroomForm.value.course));
    this.router.navigate(['/overviews/course']);
  }

  onSubmitProgram(){
    this.store.dispatch(new OverviewAction.SelectProgram(this.selectProgramForm.value.program));
    this.router.navigate(['/overviews/program']);
  }

  onSubmitFormative(){
    this.store.dispatch(new OverviewAction.SelectFormative(this.selectFormativeForm.value.formative));
    this.router.navigate(['/overviews/formative'])
  }

  onSubmitClassroomReport(){
    this.store.dispatch(new OverviewAction.StartCourse(this.selectClassroomReportForm.value.course));
    this.router.navigate(['/overviews/course-report']);
  }

  onSelectedProject(project){
    this.selectProjectForm.get('project').setValue(project);
  }

  onSelectedProgram(program){
    this.selectProgramForm.get('program').setValue(program);
  }

  onSelectedProgramWithClassroom(program){
    this.selectClassroomForm.get('program').setValue(program);
  }

  onSelectedCourse(course){
    this.selectClassroomForm.get('course').setValue(course);
  }

  onSelectedCourseReport(course){
    this.selectClassroomReportForm.get('course').setValue(course);
  }

  onSelectedFormative(formative){
    this.selectFormativeForm.get('formative').setValue(formative);
  }

  onSelectedStudent(student){
    this.selectStudentForm.get('student').setValue(student);
  }

  

}
