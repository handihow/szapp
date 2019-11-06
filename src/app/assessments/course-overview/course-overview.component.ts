import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { take, map, startWith } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Organisation } from '../../auth/organisation.model';
import { User } from '../../auth/user.model';

import * as fromRoot from '../../app.reducer'; 
import * as fromAssessment from '../assessment.reducer';
import * as AssessmentAction from '../assessment.actions';

import { UIService } from '../../shared/ui.service';
import { Observable, Subscription, of } from 'rxjs';

import { CourseService } from '../../courses/course.service';
import { Course } from '../../courses/course.model';

import { Project } from '../../projects/project.model';
import { Skill } from '../../skills/skill.model';

import { EvaluationService } from '../../evaluations/evaluation.service';
import { Evaluation } from '../../evaluations/evaluation.model';

import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

import { Router } from '@angular/router';
import * as OverviewAction from '../../overviews/overview.actions';

import { Colors } from '../../shared/colors';
import { Color } from '../../shared/color.model';

import { SaveAssessmentComponent } from './save-assessment.component';
import { Result } from '../result.model';

import { SelectFormativeComponent } from './select-formative.component';
import { Formative } from '../../formatives/formative.model';

@Component({
  selector: 'app-course-overview',
  templateUrl: './course-overview.component.html',
  styleUrls: ['./course-overview.component.css']
})
export class CourseOverviewComponent implements OnInit, OnDestroy {
  
  user: User;
  organisation: Organisation;
  isLoading$: Observable<boolean>;
  course: Course;
  courseTeachers$: Observable<User[]>;
  courseStudents: User[];

  subs: Subscription[] = [];

  selectSkillForm: FormGroup;

  skills: Skill[];

  hasSelectedSkill: boolean;
  selectedSkill: Skill;
  selectedProject: Project;
  resetProject: boolean;
  resetSkill: boolean;

  behaviors: string[] = ["Normaal", "Snel"]
  formBehavior: string = "Normaal"
  colors = Colors.evaluationColors;
  groupModel: any[] = [];
  results: Result[] = [];

  formative: Formative;

  constructor(	private courseService: CourseService,
                private evaluationService: EvaluationService,
  				      private store: Store<fromAssessment.State>,
                private uiService: UIService,
                private router: Router,
                private dialog: MatDialog) { }

  ngOnInit() {
  	//get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //fetch the current user
    this.subs.push(this.store.select(fromRoot.getCurrentUser).subscribe(user => {
       this.user = user;
    }));
    this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(org => {
      this.organisation = org;
    }));
    //get the current evaluation to be assessed by the teacher
    this.subs.push(this.store.select(fromAssessment.getActiveCourse).subscribe(course => {
        if(course){
          this.course = course;
          this.courseTeachers$ = this.courseService.fetchCourseTeachersAndStudents(course, 'Leraar');
          this.courseService.fetchCourseTeachersAndStudents(course, 'Leerling').subscribe(students =>{
            this.courseStudents = students;
            students.forEach( _ => {
              this.groupModel.push(null)
            })
          });
        }
    }));
    //create the select skills form
    this.selectSkillForm = new FormGroup({
      project: new FormControl(null, Validators.required),
      skill: new FormControl(null, Validators.required)
    });
    //get the formative
    this.subs.push(this.store.select(fromAssessment.getCurrentFormative).subscribe(formative => {
      this.formative = formative;
    }));

  }

  ngOnDestroy(){
  	this.subs.forEach(sub=> {
  		sub.unsubscribe();
  	})
  }

  onSelectedProject(project){
    this.resetProject = false;
    this.selectSkillForm.get('project').setValue(project);
    this.selectedProject = project;
  }

  onSelectedSkill(skill){
    this.resetSkill = false;
    this.selectSkillForm.get('skill').setValue(skill);
  }

  onClose(){
  	this.store.dispatch(new AssessmentAction.StopCourse());
  }

  onSubmit(){
    this.hasSelectedSkill = true;
    this.selectedSkill = this.selectSkillForm.value.skill;
    this.selectedProject = this.selectSkillForm.value.project;
    this.courseStudents.forEach(student => {
      student.evaluation = null;
      this.evaluationService.fetchActualEvaluation(student.uid,this.selectedSkill.id).subscribe(evaluation => {
        if(evaluation){
          student.evaluation = evaluation;
        }
      })
    });
    this.courseStudents.forEach( ( _ , index) => {
      this.groupModel[index] = null
    })
  }

  onReset(dontResetProject?: boolean){
    this.hasSelectedSkill = false;
    this.courseStudents.forEach(student => {
      student.evaluation = null;
    })
    this.courseStudents.forEach( ( _ , index) => {
      this.groupModel[index] = null
    })
    this.results = [];
    if(!dontResetProject){
      this.resetProject = true;
      this.resetSkill = true;
    }
  }

  onStartAssessment(student: User){  
    let newEvaluation: Evaluation;
    if(!student.evaluation || student.evaluation.status==="Beoordeeld"){
      newEvaluation = this.onNewAssessment(student);
    } else {
      newEvaluation = {
        id: student.uid + "_" + this.selectedSkill.id, ...student.evaluation
      }
    }
    this.store.dispatch(new AssessmentAction.StartAssessment(newEvaluation));
  }

  onNewAssessment(student: User): Evaluation{
    var newEvaluation : Evaluation;
    let timestamp = Timestamp.now();
      newEvaluation = {
        id: student.uid + '_' + this.selectedSkill.id,
        created: timestamp,
        user: student.uid,
        studentName: student.displayName,
        organisation: this.organisation.id,
        status: 'Niet beoordeeld',
        class: student.officialClass,
        skill: this.selectedSkill.id,
        skillCompetency: this.selectedSkill.competency,
        skillTopic: this.selectedSkill.topic,
        skillOrder: this.selectedSkill.order,
        project: this.selectedProject.id,
        projectCode: this.selectedProject.code,
        projectName: this.selectedProject.name,
        program: this.selectedSkill.program,
        colorStudent: '#9E9E9E',
        colorLabelStudent: 'Grijs',
        iconStudent: 'supervised_user_circle',
        commentStudent: 'Direct beoordeeld door de leraar',
        teacher: this.user.uid,
        teacherName: this.user.displayName,
        toBeAdded: !student.evaluation ? true : false
      };
      if(this.formative){
        newEvaluation.formative = this.formative.id;
        newEvaluation.formativeName = this.formative.name;
        newEvaluation.formativeDate = this.formative.date;
      }
      return newEvaluation;
  }

  toUserOverview(student: User){
    this.router.navigate(['/overviews']).then( _ => {
      this.store.dispatch(new OverviewAction.SelectStudent(student));
    })
  }

  onChanged(color: Color, evaluation: Evaluation, student: User){
    //first check if the result should overwrite an existing result
    let index = this.results.findIndex(result => result.student.uid === student.uid);
    let result: Result = {
        color: color,
        evaluation: evaluation,
        student: student,
        skill: this.selectedSkill,
        teacher: this.user,
        project: this.selectedProject
      }
    if(index===-1){
      this.results.push(result);
    } else {
      this.results[index] = result
    }
  }

  onSave(){
    const dialogRef = this.dialog.open(SaveAssessmentComponent, {width: '350px', data: this.results});

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.evaluationService.saveAssessments(this.results, this.formative);
        this.onReset(true);
      }
    });
  }

  onSelectFormative(){
    //get the loading state
    this.isLoading$ = of(false);
    const dialogRef = this.dialog.open(SelectFormativeComponent, {width: '350px', data: this.user});

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        //get the loading state
        this.isLoading$ = this.store.select(fromRoot.getIsLoading);
      }
    });
  }

  onRemoveFormative(){
    this.store.dispatch(new AssessmentAction.UnsetFormative());
  }

}
