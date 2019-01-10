import { Component, OnInit, HostListener, OnDestroy} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import * as fromOverview from '../overview.reducer';
import * as OverviewAction from '../overview.actions';

import { Subscription, Observable } from 'rxjs';
import { take, map, startWith } from 'rxjs/operators';

import { Project } from '../../projects/project.model';
import { ProjectService } from '../../projects/project.service';

import { Program } from '../../programs/program.model';
import { ProgramService } from '../../programs/program.service';

import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

import { Course } from '../../courses/course.model';
import { CourseService } from '../../courses/course.service';

@Component({
  selector: 'app-overview-select-project',
  templateUrl: './overview-select-project.component.html',
  styleUrls: ['./overview-select-project.component.css']
})
export class OverviewSelectProjectComponent implements OnInit, OnDestroy {
  
  user: User;
  isLoading$: Observable<boolean>;
  starredProjects$: Observable<Project[]>;
  projects$: Observable<Project[]>;
  programs$: Observable<Program[]>;
  starredPrograms$: Observable<Program[]>;
  courses$: Observable<Course[]>;
  selectStudentForm: FormGroup;
  selectProjectForm: FormGroup;
  selectProgramForm: FormGroup;
  selectClassroomForm: FormGroup;
  students: User[];
  filteredStudents: Observable<User[]>;
  subs: Subscription[] = [];

  constructor(   private store: Store<fromOverview.State>,
                 private authService: AuthService,
                 private projectService: ProjectService,
                 private programService: ProgramService,
                 private courseService: CourseService ) { }

  ngOnInit() {
    //get the current user and isLoading state
    this.store.select(fromRoot.getCurrentUser).subscribe(user => {
      this.user = user;
      //get the courses related to the user
      this.courses$ = this.courseService.fetchUserCourses(user);
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
    })
    //get the current organisation and start fetching projects
    this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
      if(organisation){
        //get the projects
        this.projects$ = this.projectService.fetchExistingProjects(organisation, true);
        this.starredProjects$ = this.projectService.fetchExistingProjects(organisation,false,this.user,true);
        this.programs$ = this.programService.fetchExistingPrograms(organisation, true);
        this.starredPrograms$ = this.programService.fetchExistingPrograms(organisation,false,this.user,true);
        this.subs.push(this.authService.fetchUsers(organisation.id, "Leerling").subscribe(students => {
          this.students = students.sort(this.sortStudents); 
          //filter students in the autocomplete form
          this.filteredStudents = this.selectStudentForm.get("student").valueChanges
            .pipe(
              startWith<string | User>(''),
              map(value => typeof value === 'string' ? value : value.displayName),
              map(name => name ? this.filter(name) : this.students.slice())
            );
        }));
      };
    }))
    
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

  ngOnDestroy(){
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
  }

  filter(userInput: string): User[] {
    return this.students.filter(option =>
      (option.displayName.toLowerCase().indexOf(userInput.toLowerCase()) === 0 
          || (option.classes && option.classes.includes(userInput))));
  }

  displayFn(user?: User): string | undefined {
    return user ? user.displayName : undefined;
  }

  onSubmitStudent(){
    this.store.dispatch(new OverviewAction.SelectStudent(this.selectStudentForm.value.student));
    this.selectStudentForm.get("student").setValue("");
    this.selectProjectForm.reset();
  }

  onSubmitProject(){
    this.store.dispatch(new OverviewAction.SelectProject(this.selectProjectForm.value.project));
    this.selectStudentForm.get("student").setValue("");
    this.selectProjectForm.reset();
  }

  onSubmitProgram(){
    this.store.dispatch(new OverviewAction.SelectProgram(this.selectProgramForm.value.program));
    this.selectStudentForm.get("student").setValue("");
    this.selectProjectForm.reset();
  }

  onSelectClassroomForm(){
    this.store.dispatch(new OverviewAction.SelectProgram(this.selectClassroomForm.value.program));
    this.store.dispatch(new OverviewAction.StartCourse(this.selectClassroomForm.value.course));
  }

}
