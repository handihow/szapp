import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { take, map, startWith } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { Organisation } from '../../auth/organisation.model';
import { User } from '../../auth/user.model';

import * as fromRoot from '../../app.reducer'; 
import * as fromAssessment from '../assessment.reducer';
import * as AssessmentAction from '../assessment.actions';

import { UIService } from '../../shared/ui.service';
import { Observable, Subscription } from 'rxjs';

import { CourseService } from '../../courses/course.service';
import { Course } from '../../courses/course.model';

import { ProjectService } from '../../projects/project.service';
import { Project } from '../../projects/project.model';

import { SkillService } from '../../skills/skill.service';
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

  projects$: Observable<Project[]>;
  starredProjects$: Observable<Project[]>;
  skills$: Observable<Skill[]>;

  hasSelectedSkill: boolean;
  selectedSkill: Skill;
  selectedProject: Project;

  behaviors: string[] = ["Normaal", "Snel"]
  formBehavior: string = "Snel"
  colors = Colors.evaluationColors;
  groupModel: any[] = [];
  results: Result[] = [];

  screenType$: Observable<string>;

  constructor(	private courseService: CourseService,
                private projectService: ProjectService,
                private skillService: SkillService,
                private evaluationService: EvaluationService,
  				      private store: Store<fromAssessment.State>,
                private uiService: UIService,
                private router: Router,
                private dialog: MatDialog) { }

  ngOnInit() {
  	//get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
    //fetch the current user
    this.subs.push(this.store.select(fromRoot.getCurrentUser).subscribe(user => {
        this.user = user;
        this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(org => {
            this.organisation = org;
            //fetch the programs belonging to the organisation
            this.projects$ = this.projectService.fetchExistingProjects(this.organisation,true);
            this.starredProjects$ = this.projectService.fetchExistingProjects(this.organisation,false,this.user,true);
        }));
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
    //listen to changes in the program form field and fetch available skills
    this.selectSkillForm.get('project').valueChanges.subscribe(projectId => {
      if(projectId){
        this.skills$ = this.skillService.fetchSkills(null, projectId);
      }
    })
  }

  ngOnDestroy(){
  	this.subs.forEach(sub=> {
  		sub.unsubscribe();
  	})
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

  onReset(){
    this.hasSelectedSkill = false;
    this.courseStudents.forEach(student => {
      student.evaluation = null;
    })
    this.selectSkillForm.reset();
    this.courseStudents.forEach( ( _ , index) => {
      this.groupModel[index] = null
    })
    this.results = [];
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
        class: (student.classes && student.classes[0]) ? student.classes[0] : null,
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
        toBeAdded: !student.evaluation ? true : false
      };
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
    const dialogRef = this.dialog.open(SaveAssessmentComponent, {width: '300px', data: this.results});

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.evaluationService.saveAssessments(this.results);
        this.onReset();
      }
    });
  }

}
