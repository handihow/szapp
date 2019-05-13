
import {map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as fromProject from './project.reducer';
import * as ProjectAction from './project.actions';

import { Project } from './project.model';
import { Program } from '../programs/program.model';
import { Skill } from '../skills/skill.model';
import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';

@Injectable()
export class ProjectService {
   
	constructor( private db: AngularFirestore,
				 private uiService: UIService,
				 private store: Store<fromProject.State> ){}


	startProject(project: Project){
		project.created = new Date();
		project.status = "Concept"
		this.addProjectToDatabase(project);
	}

	editProject(project: Project){
		this.store.dispatch(new ProjectAction.StartProject(project));
	}

	saveActiveProject(countedSkills: number) {
		this.store.select(fromProject.getActiveProject).pipe(take(1)).subscribe(project => {
			var project = project;
			project.countSkills = countedSkills;
			this.saveProjectToDatabase(project);
			this.store.dispatch(new ProjectAction.StopProject());	
		})
	}

	saveDraftProject() {
		this.store.select(fromProject.getActiveProject).pipe(take(1)).subscribe(project => {
			this.addProjectToDatabase(project);
			this.store.dispatch(new ProjectAction.StopProject());	
		})
	}

	fetchExistingProjects(organisation: Organisation, activeOnly?: boolean, user?: User, starred?: boolean, disableLoading?: boolean) : Observable<Project[]> {
		if(!disableLoading){
			this.store.dispatch(new UI.StartLoading());	
		}
		var queryStr = (ref => ref.where('organisation', '==', organisation.id));
		if(activeOnly){
			queryStr = (ref => ref.where('organisation', '==', organisation.id).where('status', '==', "Actief"))
		}
		if(starred){
			let str = 'starred.' + user.uid;
			queryStr = (ref => ref.where(str, '==', true));
		}
		return this.db.collection('projects', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				if(!disableLoading){
					this.store.dispatch(new UI.StopLoading());	
				}
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Project;
						const id = doc.payload.doc.id;
						return { id, ...data };
					}).sort((a,b) => {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);})
			}));	
	}

	private addProjectToDatabase(project: Project){
		var addedProject = project;
		this.db.collection('projects').add(project)
			.then(doc => {
				addedProject.id = doc.id;
				this.store.dispatch(new ProjectAction.StartProject(addedProject));
				this.uiService.showSnackbar("Project is succesvol bewaard.", null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			});
	}

	private saveProjectToDatabase(project: Project){
		this.db.collection('projects').doc(project.id).update(project)
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			})
	}

	setProjectSticker(project: Project, student: User, stickerID: number){
		if(!project.stickers){
			project.stickers = {};
		}
		project.stickers[student.uid] = stickerID;
		this.db.collection('projects').doc(project.id).update(project);
	}

	unlockProject(project: Project, student: User){
		if(!project.unlocked){
			project.unlocked = {};
		}
		project.unlocked[student.uid] = true;
		this.db.collection('projects').doc(project.id).update(project);
	}

}

  
  

  