import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { take , map, startWith} from 'rxjs/operators';
import { FormControl, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { CourseService } from '../course.service';
import { Course } from '../course.model';
import { Skill } from '../../skills/skill.model';
import { SkillService } from '../../skills/skill.service';
import * as fromRoot from '../../app.reducer'; 
import * as fromCourse from '../course.reducer';
import * as CourseAction from '../course.actions';

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';
import { AuthService } from '../../auth/auth.service';

import { UIService } from '../../shared/ui.service';
import { Observable, Subscription } from 'rxjs';

import { RemoveParticipantsComponent } from './remove-participants.component';
import { EditCourseComponent } from './edit-course.component';

@Component({
  selector: 'app-current-course',
  templateUrl: './current-course.component.html',
  styleUrls: ['./current-course.component.css']
})
export class CurrentCourseComponent implements OnInit, OnDestroy {
  
  user: User;
  organisation: Organisation;
  course: Course;
  peopleForm: FormGroup;

  teachers: User[];
  filteredTeachers: User[];
  students: User[];
  filteredStudents: User[];
  teachersAndStudents: User[];

  subs: Subscription[] = [];

  displayedColumns = ['select', 'role' ,'name', 'email'];
  dataSource = new MatTableDataSource<Skill>();
  isLoading$: Observable<boolean>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  selection = new SelectionModel<Skill>(true, null);

  constructor( private dialog: MatDialog, 
                private courseService: CourseService,
                private skillService: SkillService,
                private store: Store<fromCourse.State>,
                private uiService: UIService,
                private authService: AuthService) { }

  ngOnInit() {
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current user
    this.store.select(fromRoot.getCurrentUser).pipe(take(1)).subscribe(user => {
      if(user){
        this.user = user;
      }
    });
    //get the current organisation
    this.store.select(fromRoot.getCurrentOrganisation).pipe(take(1)).subscribe(org => {
      if(org){
        this.organisation = org;
        this.subs.push(this.authService.fetchUsers(org.id, "Leraar").subscribe(teachers => {
          this.teachers = teachers;
          this.filteredTeachers = teachers;
        }));
        this.subs.push(this.authService.fetchUsers(org.id, "Leerling").subscribe(students => {
          this.students = students;
          this.filteredStudents = students;
        }));
      }
    })
    //get the current course and then fetch the corresponding course students and teachers
    this.store.select(fromCourse.getActiveCourse).pipe(take(1)).subscribe(activeCourse => {
        this.course = activeCourse; 
        this.subs.push(this.courseService.fetchCourseTeachersAndStudents(this.course).subscribe(users => {
          this.teachersAndStudents = users;
          //set the data source of the table
          this.dataSource.data = this.teachersAndStudents;
        }))
    });
    //create the skills form
    this.peopleForm = new FormGroup({
      classes: new FormControl(null),
      subjects: new FormControl(null),
      participants: new FormControl(null, Validators.required)
    });
  }

  ngOnDestroy() {
    this.subs.forEach(sub=> {
      sub.unsubscribe();
    })
  }
 
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
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

  onSubmit(){
    let newParticipants = this.peopleForm.get('participants').value;
    this.courseService.manageCourseParticipants(newParticipants, this.course.id, true);
    this.onResetFilters(); 
  }

  onFilterParticipants(){
    this.filteredTeachers = [];
    this.filteredStudents = [];
    let classes = this.peopleForm.get('classes').value;
    let subjects = this.peopleForm.get('subjects').value;
    if(!classes && !subjects){
      return this.uiService.showSnackbar("Geen klas(sen) of vak(ken) beschikbaar om leraren en leerlingen te filteren", null, 3000);
    } else if(classes && subjects){
    //both classes and subjects are available for filtering
      this.teachers.forEach(teacher => {
        if(teacher.classes && teacher.subjects 
            && teacher.classes.filter(value => -1 !== classes.indexOf(value)).length > 0
            && teacher.subjects.filter(value => -1 !== subjects.indexOf(value)).length > 0) {
          this.filteredTeachers.push(teacher);
        }
      })
      this.students.forEach(student => {
        if(student.classes && student.subjects 
            && student.classes.filter(value => -1 !== classes.indexOf(value)).length > 0
            && student.subjects.filter(value => -1 !== subjects.indexOf(value)).length > 0) {
          this.filteredStudents.push(student);
        }
      })
    } else if(classes){
    //only classes are available for filtering
      this.teachers.forEach(teacher => {
        if(teacher.classes 
            && teacher.classes.filter(value => -1 !== classes.indexOf(value)).length > 0) {
          this.filteredTeachers.push(teacher);
        }
      });
      this.students.forEach(student => {
        if(student.classes 
            && student.classes.filter(value => -1 !== classes.indexOf(value)).length > 0) {
          this.filteredStudents.push(student);
        }
      })
    } else {
    //only subjects are available for filtering
       this.teachers.forEach(teacher => {
        if(teacher.subjects 
            && teacher.subjects.filter(value => -1 !== subjects.indexOf(value)).length > 0) {
          this.filteredTeachers.push(teacher);
        }
      })
      this.students.forEach(student => {
        if(student.subjects 
            && student.subjects.filter(value => -1 !== subjects.indexOf(value)).length > 0) {
          this.filteredStudents.push(student);
        }
      })
    }
  }

  onResetFilters(){
    this.peopleForm.reset();
    this.filteredTeachers = this.teachers;
    this.filteredStudents = this.students;
  }

  onRemove() {
    const dialogRef = this.dialog.open(RemoveParticipantsComponent, {
      data: {
        selectedItems: this.selection.selected.length,
        selectedParticipants: this.selection.selected 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.courseService.manageCourseParticipants(this.selection.selected, this.course.id, false);
        this.selection.clear();
      }
    });
  }
  
  onEditCourse() {
    const dialogRef = this.dialog.open(EditCourseComponent, {
      width: '300px'
    });
  }

  onSaveActive(){
    this.courseService.saveActiveCourse();
  }

  onSyncParticipants(){
    this.courseService.addGoogleClassroomStudentsOrTeachers(this.course);
  }


}
