
import {map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFirePerformance } from '@angular/fire/performance';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { AngularFireFunctions } from '@angular/fire/functions';

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as fromCourse from './course.reducer';
import * as CourseAction from './course.actions';

import { Course } from './course.model';
import { Skill } from '../skills/skill.model';
import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';

import { AuthService } from '../auth/auth.service';

@Injectable()
export class CourseService {

    private readonly API_URL: string = 'https://classroom.googleapis.com/v1/courses';

	constructor( private afp: AngularFirePerformance,
				 private db: AngularFirestore,
				 private fns: AngularFireFunctions,
			     private httpClient: HttpClient,
				 private uiService: UIService,
                 private authService: AuthService,
				 private store: Store<fromCourse.State> ){}


	startCourse(newCourse: Course){
		newCourse.created = new Date();
		newCourse.status = "Actief"
		this.addCourseToDatabase(newCourse);
	}

	editCourse(editedCourse: Course){
		this.saveCourseToDatabase(editedCourse);
		this.store.dispatch(new CourseAction.StartCourse(editedCourse));
	}

	saveActiveCourse() {
		this.store.dispatch(new CourseAction.StopCourse());	
	}

	saveDraftCourse() {
		this.store.select(fromCourse.getActiveCourse).pipe(take(1)).subscribe(activeCourse => {
			this.addCourseToDatabase(activeCourse);
			this.store.dispatch(new CourseAction.StopCourse());	
		})
	}

	fetchExistingCourses(organisation: Organisation, activeOnly?: boolean): Observable<Course[]> {
		this.store.dispatch(new UI.StartLoading());
		var queryStr = (ref => ref.where('organisation', '==', organisation.id));
		if(activeOnly){
			queryStr = (ref => ref.where('organisation', '==', organisation.id).where('status', '==', "Actief"))
		}
		return this.db.collection('courses', queryStr)
			.snapshotChanges().pipe(
				this.afp.trace('getCourses'),
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Course;
						const id = doc.payload.doc.id;
						return { id, ...data };
					})
			}))	
	}

	fetchUserCourses(user: User): Observable<Course[]> {
		this.store.dispatch(new UI.StartLoading());
		let str = 'participants.' + user.uid;
		var queryStr = (ref => ref.where(str, '==', true).where('status', '==', "Actief"));
		return this.db.collection('courses', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Course;
						const id = doc.payload.doc.id;
						return { id, ...data };
					})
			}))	
	}

	fetchCourseTeachersAndStudents(course: Course, userType?: string) : Observable<User[]> {
		let str = 'courses.' + course.id;
		var queryStr = (ref => ref.where(str, '==', true));
		if(userType){
			queryStr = (ref => ref.where(str, '==', true).where('role', '==', userType))
		}
		return this.db.collection('users', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as User;
						const id = doc.payload.doc.id;
						return { id, ...data };
					}).sort((a,b) => {return (a.displayName > b.displayName) ? 1 : ((b.displayName > a.displayName) ? -1 : 0);})
			}))
	}

	manageCourseParticipants(participants: User[], courseId: string, add: boolean){
		//if add is true, participants will be added to course, otherwise, removed from course
		participants.forEach((participant: User) => {
			let str = '{"courses":{"' + courseId + '":' + add + '}}';
			let courseOfParticipant = JSON.parse(str);
			let str2 = '{"participants":{"' + participant.uid + '":' + add + '}}';
			let participantOfCourse = JSON.parse(str2);
			this.db.collection('users').doc(participant.uid)
				.set(courseOfParticipant, {merge: true})
				.catch(error => {
					return this.uiService.showSnackbar(error.message, null, 3000);
				})
			this.db.collection('courses').doc(courseId)
				.set(participantOfCourse, {merge: true})
				.catch(error => {
					return this.uiService.showSnackbar(error.message, null, 3000);
				})
		});
		let addMessage = "Deelnemers toegevoegd aan lesgroep";
		let removeMessage = "Deelnemers verwijderd van lesgroep";
		this.uiService.showSnackbar(add ? addMessage : removeMessage, null, 3000);
	}

	private addCourseToDatabase(addedCourse: Course){
		var addedCourse = addedCourse;
		this.db.collection('courses').add(addedCourse)
			.then(doc => {
				addedCourse.id = doc.id;
				this.store.dispatch(new CourseAction.StartCourse(addedCourse));
				this.uiService.showSnackbar("Lesgroep is succesvol bewaard.", null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			});
	}

	private saveCourseToDatabase(savedCourse: Course){
		this.db.collection('courses').doc(savedCourse.id).update(savedCourse)
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			})
	}

	addGoogleClassroomsToDatabase(googleClassrooms: Course[], organisation: Organisation){
		var unsuccessfulUploads: Course[] = [];
		googleClassrooms.forEach(async classroom => {
			let success = await this.addGoogleClassroomToDatabase(classroom, organisation)
			if(!success){
				unsuccessfulUploads.push(classroom);
			}
		});
		if(unsuccessfulUploads.length>0){
			this.uiService.showSnackbar("Er zijn " + unsuccessfulUploads.length + " niet goed bewaard in de database. Probeer het opnieuw", null, 3000);
		} else {
			this.uiService.showSnackbar("Alle Google Classrooms zijn geimporteerd", null, 3000);
		}
		return unsuccessfulUploads.length>0 ? false : true;
	}

	findClassrooms(): Promise<any> {
		let authtoken = this.authService.getToken();
		if(!authtoken){
			this.uiService.showSnackbar("Je hebt geen geldig authorisatie token. Log opnieuw in", null, 3000);
			return null
		}
        return new Promise((resolve, reject) => {
        	this.store.dispatch(new UI.StartLoading());
        	this.httpClient.get(this.API_URL, {
	          headers: new HttpHeaders({
	                Authorization: `Bearer ${authtoken}`
	            })
        	}).subscribe(
			        data => {
			        	this.store.dispatch(new UI.StopLoading());
			        	resolve(data)
			        },
			        error => {
			        	this.store.dispatch(new UI.StopLoading());
			        	this.uiService.showSnackbar(error.message, null, 3000);
			        	reject(null)
			        }
			      )
        });
    }

    private addGoogleClassroomToDatabase(googleClassroom: Course, organisation: Organisation) {
		return new Promise((resolve, reject) => {
			this.store.dispatch(new UI.StartLoading());
			const classroomRef: AngularFirestoreDocument<any> = this.db.doc(`courses/${googleClassroom.googleClassroomInfo.id}`);
			classroomRef.set(googleClassroom, {merge: true})
				.then( _ => {
					this.store.dispatch(new UI.StopLoading());
					this.addGoogleClassroomStudentsOrTeachers(googleClassroom, organisation);
					resolve(true);
				})
				.catch(error => {
					this.store.dispatch(new UI.StopLoading());
					this.uiService.showSnackbar(error.message, null, 3000);
					reject(false);
				})
		})	
	}

	addGoogleClassroomStudentsOrTeachers(googleClassroom: Course, organisation: Organisation){
		["students", "teachers"].forEach(async userType => {
			let res = await this.listGoogleClassroomTeachersOrStudents(googleClassroom, userType);
			if(res && res[userType]){
				res[userType].forEach(async participant => {
					let fetchedParticipants = await this.fetchUser(participant.profile.emailAddress);
					if(fetchedParticipants.length === 0){
						//first add this user to the system;
						let newStudent = await this.createStudent(participant, organisation);
						if(newStudent){
							fetchedParticipants.push(newStudent);
						}
					}
					this.manageCourseParticipants(fetchedParticipants,googleClassroom.googleClassroomInfo.id,true);
				})
			}
		});
	}

	private createStudent(participant: any, organisation: Organisation): Promise<any>{
		return new Promise((resolve,reject) => {
			const callable = this.fns.httpsCallable('addStudent');
	        callable({ 
	        	email: participant.profile.emailAddress,
	        	displayName: participant.profile.name.fullName,
	        	photoURL: "https://ui-avatars.com/api/?background=03a9f4&color=F5F5F5&name=" + encodeURI(participant.profile.name.fullName),
	        	organisation: organisation
	        })
	        .subscribe(feedback => {
	        	console.log(feedback);
				if(feedback.result){
					resolve(feedback.result);
				} else if(feedback.error){
					resolve(null);
				}
			}, error => {
				resolve(null);
			});
		});
	}

	private fetchUser(email) : Promise<User[]> {
		return new Promise((resolve, reject) => {
			this.store.dispatch(new UI.StartLoading());
			var queryStr = (ref => ref.where('email', '==', email));
			this.db.collection('users', queryStr)
				.snapshotChanges().pipe(
				map(docArray => {
					this.store.dispatch(new UI.StopLoading());
					return docArray.map(doc => {
							const data = doc.payload.doc.data() as User;
							const id = doc.payload.doc.id;
							return { id, ...data };
						})
				})).pipe(take(1)).subscribe(participants =>{
					resolve(participants);
				})
		})
	}

    private findById(classroomId: string, authtoken: string): Observable<any> {
        return this.httpClient.get(this.API_URL + "/" + classroomId, {
          headers: new HttpHeaders({
                Authorization: `Bearer ${authtoken}`
            })
        });
    }

    private listGoogleClassroomTeachersOrStudents(classroom: Course, userType: string) : Promise<any> {
    	let authtoken = this.authService.getToken();
		if(!authtoken){
			this.uiService.showSnackbar("Je hebt geen geldig authorisatie token. Log opnieuw in", null, 3000);
			return null
		}
        return new Promise((resolve, reject) => {
        	this.store.dispatch(new UI.StartLoading());
        	this.httpClient.get(this.API_URL + "/" + classroom.googleClassroomInfo.id + "/" + userType, {
	          headers: new HttpHeaders({
	                Authorization: `Bearer ${authtoken}`
	            })
        	}).subscribe(
			        data => {
			        	this.store.dispatch(new UI.StopLoading());
			        	resolve(data)
			        },
			        error => {
			        	this.store.dispatch(new UI.StopLoading());
			        	this.uiService.showSnackbar(error.message, null, 3000);
			        	reject(null)
			        }
			      )
        });
    }
    
		
}

  
  

  