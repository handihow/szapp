import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { take, map, startWith } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  constructor(	private courseService: CourseService,
                private projectService: ProjectService,
                private skillService: SkillService,
                private evaluationService: EvaluationService,
  				      private store: Store<fromAssessment.State>,
                private uiService: UIService,
                private router: Router) { }

  ngOnInit() {
  	//get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //get the current user
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
          });
        }
    }));
    //create the select skills form
    this.selectSkillForm = new FormGroup({
      project: new FormControl(null, Validators.required),
      skill: new FormControl(null, Validators.required)
    });
    //listen to changes in the program form field and fetch available skills
    this.selectSkillForm.get('project').valueChanges.subscribe(project => {
      if(project){
        this.skills$ = this.skillService.fetchSkills(null, project);
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
    })
  }

  onReset(){
    this.hasSelectedSkill = false;
    this.courseStudents.forEach(student => {
      student.evaluation = null;
    })
    this.selectSkillForm.reset();
  }

  onStartAssessment(student: User){  
    if(!student.evaluation || student.evaluation.status==="Beoordeeld"){
      this.onNewAssessment(student);
    } else {
      var evaluation: Evaluation = {
        id: student.uid + "_" + this.selectedSkill.id, ...student.evaluation
      }
      this.store.dispatch(new AssessmentAction.StartAssessment(evaluation));
    }
  }

  onNewAssessment(student: User){
    var newEvaluation : Evaluation;
    let timestamp = Timestamp.now();
      newEvaluation = {
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
      };
      this.evaluationService.addEvaluationToDatabase(newEvaluation, student.uid,this.selectedSkill.id).then( _ => {
        this.store.dispatch(new AssessmentAction.StartAssessment(newEvaluation));
      })
  }

  toUserOverview(student: User){
    this.router.navigate(['/overviews']).then( _ => {
      this.store.dispatch(new OverviewAction.SelectStudent(student));
    })
  }

}
