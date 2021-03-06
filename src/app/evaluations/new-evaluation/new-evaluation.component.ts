import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';
import * as fromEvaluation from '../evaluation.reducer'; 
import * as EvaluationAction from '../evaluation.actions';

import * as firebase from 'firebase/app';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';

import { Subscription, Observable } from 'rxjs';
import { take, map, startWith, finalize } from 'rxjs/operators';

import { EvaluationService } from '../evaluation.service';
import { Evaluation } from '../evaluation.model';
import { Skill } from '../../skills/skill.model';
import { Project } from '../../projects/project.model';
import { UIService } from '../../shared/ui.service';
import { AuthService } from '../../auth/auth.service';

import { User } from '../../auth/user.model';
import { Organisation } from '../../auth/organisation.model';

import { Colors } from '../../shared/colors';

@Component({
  selector: 'app-new-evaluation',
  templateUrl: './new-evaluation.component.html',
  styleUrls: ['./new-evaluation.component.css']
})
export class NewEvaluationComponent implements OnInit, OnDestroy {
  
  skillId: string;
  skill: Skill;
  student: User;
  currentUser: User;
  organisation: Organisation;
  isLoading$: Observable<boolean>;
  project: Project;

  evaluationForm: FormGroup;
  //teachers of the organisation
  teachers: User[];
  filteredTeachers: User[];

  //settings on the vertical stepper
  isEditable: boolean = true;
  isOptional: boolean = true;
  isLinear = false;

  // Main task 
  task: AngularFireUploadTask
  // Progress monitoring
  percentage: Observable<number>;
  snapshot: Observable<any>;
  // Download URL
  downloadURL$: Observable<string>;
  // State for dropzone CSS toggling
  isHovering: boolean;  

  colors = Colors.evaluationColors;

  selectedColor: string;

  subs: Subscription[] = [];

  screenType$: Observable<string>;

  constructor(	 private store: Store<fromRoot.State>,
                 private formBuilder: FormBuilder,
                 private evaluationService: EvaluationService,
                 private storage: AngularFireStorage,
                 private authService: AuthService,
                 private uiService: UIService) { }

  ngOnInit() {

    //fetch the current user of the application (it may be a teacher who has selected student)
    this.subs.push(this.store.select(fromRoot.getCurrentUser).subscribe(user => {
      this.currentUser = user;
    }));
    //fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
    //get the current project
    this.subs.push(this.store.select(fromEvaluation.getActiveProject).subscribe((project: Project) => {
      this.project = project;
    }));
  	//subscribe to the evaluation store to retrieve the skills belonging to the project
    this.subs.push(this.store.select(fromEvaluation.getActiveSkill).subscribe((skill: Skill) => {
    		this.skill = skill;
    }));
    //get the loading state
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    //check the screen size and detect if on mobile
    // if(window.innerWidth<600){
    //   this.isMobile = true;
    // }
    //get the user and organisation from the evaluation state
    this.subs.push(this.store.select(fromEvaluation.getStudent).subscribe(user => {
        this.student = user;
    }));
    this.subs.push(this.store.select(fromRoot.getCurrentOrganisation).subscribe(organisation => {
        if(organisation){
          this.organisation = organisation;
          //get the list of teachers
          this.subs.push(this.authService.fetchTeachers(organisation.id).subscribe(teachers => {
            if(teachers) {
              this.teachers = teachers;
              this.filteredTeachers = [];
              teachers.forEach(teacher => {
                if(teacher.classes && teacher.subjects && this.project.classes.filter(value => -1 !== teacher.classes.indexOf(value)).length > 0 &&
                    this.project.subjects.filter(value => -1 !== teacher.subjects.indexOf(value)).length > 0) {
                  this.filteredTeachers.push(teacher);
                }
              })
            }
          }));
        }
    }));
    this.evaluationForm = new FormGroup({
       comment: new FormControl(null),
       color: new FormControl(null, Validators.required),
       url: new FormControl(null),
       imageUrl: new FormControl(null),
       thumbnailUrl: new FormControl(null),
       teacher: new FormControl(null)
    });
    if(this.currentUser.uid === this.student.uid){
      //the student is filling the form and the teacher input will be set to required
      this.evaluationForm.get('teacher').setValidators(Validators.required);
    }
    //listen for changes on the color and adjust the background color
    this.subs.push(this.evaluationForm.get('color').valueChanges.subscribe(
      (color) => {
        if(color){
          this.selectedColor = color.color;
        }
    }));
  }

  onSubmit(){
    //create variable with actual timestamp
    const timestamp = new Date();
    //first create the local evaluation variable
    if(this.currentUser.uid === this.student.uid){
      this.submitStudentEvaluation(timestamp);
    } else {
      this.submitTeacherEvaluation(timestamp);
    }
  }

  submitTeacherEvaluation(timestamp){
    let evaluation: Evaluation = {
        id: this.student.uid + '_' + this.skill.id,
        created: timestamp,
        evaluated: timestamp,
        user: this.student.uid,
        studentName: this.student.displayName,
        organisation: this.organisation.id,
        status: 'Beoordeeld',
        class: this.student.officialClass,
        skill: this.skill.id,
        skillCompetency: this.skill.competency,
        skillTopic: this.skill.topic,
        skillOrder: this.skill.order,
        skillWeight: this.skill.weight ? this.skill.weight : 1,
        project: this.project.id,
        projectCode: this.project.code,
        projectName: this.project.name,
        program: this.skill.program,
        colorStudent: 'grey',
        colorLabelStudent: 'Grijs',
        iconStudent: 'account_circle',
        commentStudent: 'Direct beoordeeld door ' + this.currentUser.displayName,
        teacher: this.currentUser.uid,
        teacherName: this.currentUser.displayName,
        colorTeacher: this.evaluationForm.value.color.color,
        colorLabelTeacher: this.evaluationForm.value.color.colorLabel,
        iconTeacher: this.evaluationForm.value.color.icon,
        ratingTeacher: this.evaluationForm.value.color.rating,
        commentTeacher: this.evaluationForm.value.comment 
                                      ? this.evaluationForm.value.comment : null,
        urlStudent: this.evaluationForm.value.url 
                                      ? this.evaluationForm.value.url : null,
        imageURL: this.evaluationForm.value.imageUrl ? this.evaluationForm.value.imageUrl : null,
        thumbnailURL: this.evaluationForm.value.thumbnailUrl ?this.evaluationForm.value.thumbnailUrl : null
    };
    this.evaluationService.saveEvaluation(evaluation, this.student.uid, this.skill.id);
  }

  submitStudentEvaluation(timestamp){
    let evaluation : Evaluation = {
      created: timestamp,
      user: this.student.uid,
      studentName: this.student.displayName,
      organisation: this.organisation.id,
      status: 'Niet beoordeeld',
      skill: this.skill.id,
      skillCompetency: this.skill.competency,
      skillTopic: this.skill.topic,
      skillOrder: this.skill.order,
      skillWeight: this.skill.weight ? this.skill.weight : 1,
      project: this.project.id,
      projectCode: this.project.code,
      projectName: this.project.name,
      program: this.skill.program,
      class: this.student.officialClass
    };
    //then set the properties of the evaluation variable
    evaluation.colorStudent = this.evaluationForm.value.color.color;
    evaluation.colorLabelStudent = this.evaluationForm.value.color.colorLabel;
    evaluation.iconStudent = this.evaluationForm.value.color.icon;
    evaluation.ratingStudent = this.evaluationForm.value.color.rating;
    evaluation.commentStudent = this.evaluationForm.value.comment 
                                      ? this.evaluationForm.value.comment : null;
    evaluation.urlStudent = this.evaluationForm.value.url 
                                      ? this.evaluationForm.value.url : null;
    evaluation.imageURL = this.evaluationForm.value.imageUrl;
    evaluation.thumbnailURL = this.evaluationForm.value.thumbnailUrl;
    evaluation.teacher = this.evaluationForm.value.teacher;
    this.evaluationService.saveEvaluation(evaluation, this.student.uid, this.skill.id);
  }

  startUpload(event: FileList) {
    //don't upload if user has cancelled selecting the image
    if(!event.item(0)){
      return
    }
    // The File object
    const file = event.item(0)

    // Client-side validation 
    if (file.type.split('/')[0] !== 'image') { 
      this.uiService.showSnackbar('Geen geldig image file type. Upload geannuleerd.', null, 3000);
      return;
    }

    const storagePathPrefix='evaluation/'
    const dateTime = new Date().getTime();
    const filename = "_" + file.name;
    const resize = 'resized-'
    // The storage path
    const path = storagePathPrefix + dateTime + filename;
    const tnPath = storagePathPrefix + resize + dateTime + filename;

    // Totally optional metadata
    const customMetadata = { app: 'SZAPP' };

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata })

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot   = this.task.snapshotChanges()
   
    // The file's download URL
    // this.downloadURL = this.task.downloadURL(); 

    this.snapshot = this.task.snapshotChanges().pipe(
      finalize(() => {
          // Update firestore on completion
          // this.db.collection('photos').add( { path, size: snap.totalBytes })
          const refTN = this.storage.ref(path);
          this.downloadURL$ = refTN.getDownloadURL();
          this.evaluationForm.get('imageUrl').setValue(path);
          this.evaluationForm.get('thumbnailUrl').setValue(tnPath);
      })
    )

  }

  // Determines if the upload task is active
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onCancel() {
    this.store.dispatch(new EvaluationAction.UnsetSkill());
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  setAdditionalValidators(){
    this.evaluationForm.get('imageUrl').setValidators(Validators.required);
    this.evaluationForm.get('imageUrl').updateValueAndValidity();
  }
}
