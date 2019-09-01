import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {FormControl} from '@angular/forms';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 
import { take, map, startWith } from 'rxjs/operators';

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

import { AuthService } from '../../auth/auth.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-select',
  templateUrl: './student-select.component.html',
  styleUrls: ['./student-select.component.css']
})
export class StudentSelectComponent implements OnInit, OnDestroy {
  
  @Input() resetTrigger: boolean;
  @Input() organisation: Organisation;
  studentControl = new FormControl();
  students: User[];
  filteredStudents$: Observable<User[]>;
  filteredStudents: User[];
  @Output() selectedStudent = new EventEmitter<User>();
  sub: Subscription;
  selectedClass: string;
  student: User;
  screenType$: Observable<string>;
  titles = environment.titles;

  constructor(private authService: AuthService, private store: Store<fromRoot.State>) { }

  ngOnInit() {
  	//fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
   }

   ngOnChanges(){
     if(this.resetTrigger){
        this.studentControl = new FormControl(null);
        this.selectedClass = null;
        this.student = null;
     }
     if(this.organisation){
       //fetch users
        this.sub = this.authService.fetchStudents(this.organisation.id, true, true).subscribe(students => {
            this.students = students; 
            //filter students in the autocomplete form
        this.filteredStudents$ = this.studentControl.valueChanges
            .pipe(
              startWith<string | User>(''),
              map(value => typeof value === 'string' ? value : value.displayName),
              map(name => name ? this.filter(name) : this.students.slice())
            );
        });
        this.studentControl.valueChanges.subscribe(student => {
          this.selectedStudent.emit(student);  
        })
      }
   }

   ngOnDestroy(){
     if(this.sub){
       this.sub.unsubscribe();
     }
   }

   onSelectClass(selectedClass: string){
   	this.filteredStudents = this.students.filter(student => (student.classes && student.classes.includes(selectedClass)));
   }

   onSelectStudent(studentId){
   	let student = this.students.find(student => student.uid === studentId);
    	if(student){
    		this.selectedStudent.emit(student);	
    	}
   }

   filter(userInput: string): User[] {
    return this.students.filter(option =>
      (option.displayName.toLowerCase().indexOf(userInput.toLowerCase()) === 0 
          || (option.classes && option.classes.includes(userInput))));
   }

   displayFn(user?: User): string | undefined {
    return user ? user.displayName : undefined;
   }

  //  private sortStudents(A,B) {
  //   if(!A.classes || !A.classes[0]){
  //     return 1
  //   } else if(!B.classes || !B.classes[0]){
  //     return -1
  //   } else if (A.classes[0] == B.classes[0]){
  //     return (A.displayName > B.displayName) ? 1 : ((B.displayName > A.displayName) ? -1 : 0);
  //   } else {
  //     return (A.classes[0] > B.classes[0]) ? 1 : ((B.classes[0] > A.classes[0]) ? -1 : 0);  
  //   }
  // }

}
