
import {map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { Subscription, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';

import { Program } from '../programs/program.model';
import { Project } from '../projects/project.model';
import { Skill } from './skill.model';
import { Comment } from './comment.model';
import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';
import * as fromRoot from '../app.reducer';

@Injectable()
export class SkillService {

	constructor( private db: AngularFirestore,
				 private uiService: UIService,
				 private store: Store<fromRoot.State> ){}

	saveSkillToDatabase(skill: Skill){
		this.store.dispatch(new UI.StartLoading());
		this.db.collection('skills').add(skill)
			.then(doc => {
				this.store.dispatch(new UI.StopLoading());
			})
			.catch(error => {
				this.store.dispatch(new UI.StopLoading());
				this.uiService.showSnackbar(error.message, null, 3000);
			})
	}

	manageSkillsOfProject(skills: Skill[], projectId: string, add: boolean){
		//if add is true, skills will be added to project, otherwise, removed from project
		skills.forEach((skill: Skill) => {
			let str = '{"projects":{"' + projectId + '":' + add + '}}';
			let projectSkill = JSON.parse(str);
			this.db.collection('skills').doc(skill.id)
				.set(projectSkill, {merge: true})
				.catch(error => {
					return this.uiService.showSnackbar(error.message, null, 3000);
				})
		});
		let addMessage = "Competenties toegevoegd aan project";
		let removeMessage = "Competenties verwijderd van project";
		this.uiService.showSnackbar(add ? addMessage : removeMessage, null, 3000);
	}

	batchSaveSkillsToDatabase(skills: Skill[]){
		this.store.dispatch(new UI.StartLoading());
		var batch = this.db.firestore.batch();
		skills.forEach((skill) => {
			var skillsRef = this.db.firestore.collection('skills').doc();
			batch.set(skillsRef, skill);
		});
		batch.commit()
		.then(_ => {
			this.uiService.showSnackbar('Competenties succesvol toegevoegd', null, 3000);
			this.store.dispatch(new UI.StopLoading());
		}, (error) => {
			this.uiService.showSnackbar('Probleem bij verwerken van competenties ' + error.message, null, 3000);
			this.store.dispatch(new UI.StopLoading());
		})
		.catch(e => {
			this.uiService.showSnackbar('Probleem bij verwerken van competenties ' + e.message, null, 3000);
			this.store.dispatch(new UI.StopLoading());
		});
	}

	updateSkillToDatabase(skill: Skill){
		this.store.dispatch(new UI.StartLoading());
		this.db.collection('skills').doc(skill.id)
			.set(skill, {merge: true})
			.then(doc => {
				this.store.dispatch(new UI.StopLoading());
				this.uiService.showSnackbar('Competentie update succesvol', null, 3000);
			})
			.catch(error => {
				this.store.dispatch(new UI.StopLoading());
				this.uiService.showSnackbar(error.message, null, 3000);
			})
	}

	updateSkillWeight(skillId: string, weight: number){
		this.db.collection('skills').doc(skillId)
			.update({weight: weight})
			.then(doc => {
				this.uiService.showSnackbar('Competentie update succesvol', null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			})
	}

	fetchSkills(programId?: string, projectId?: string, disableLoading?: boolean) : Observable<Skill[]> {
		if(!disableLoading){
			this.store.dispatch(new UI.StartLoading());	
		}
		var queryStr;
		if(programId) {
			queryStr = (ref => ref.where('program', '==', programId));
		} else {
			let str = 'projects.' + projectId;
			queryStr = (ref => ref.where(str, '==', true));
		}
		return this.db.collection('skills', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				if(!disableLoading){
					this.store.dispatch(new UI.StopLoading());	
				}
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Skill;
						const id = doc.payload.doc.id;
						return { id, ...data };
					}).sort(this.sortSkills)
			}))
	}

	private sortSkills(a,b) {
	    if (a.order < b.order)
	      return -1;
	    if (a.order > b.order)
	      return 1;
	    return 0;
	}

	fetchSkillAttachments(skillId: string) : Observable<any[]> {
	  var queryStr = (ref => ref.where('skill', '==', skillId));
	  return this.db.collection('files', queryStr)
		  .snapshotChanges().pipe(
		  map(attachments => {
				  return attachments.map(doc => {
					  const data = doc.payload.doc.data();
					  const id = doc.payload.doc.id;
					  return { id, ...data};
				  })
			  }))
  	} 

	fetchSkillComments(skillId: string) : Observable<Comment[]>{
		this.store.dispatch(new UI.StartLoading());
		return this.db.collection('skills').doc(skillId).collection('comments')
				.snapshotChanges().pipe(
				map(docArray => {
					this.store.dispatch(new UI.StopLoading());
					return docArray.map(doc => {
						return {
							id: doc.payload.doc.id,
							comment: doc.payload.doc.data().comment
						}
					})
				}))
	}

	saveSkillComment(skillId: string, comment: Comment){
		this.store.dispatch(new UI.StartLoading());
		this.db.collection('skills').doc(skillId).collection('comments').add(comment)
			.then(doc => {
				this.store.dispatch(new UI.StopLoading());
			})
			.catch(error => {
				this.store.dispatch(new UI.StopLoading());
				this.uiService.showSnackbar(error.message, null, 3000);
			})
	}

	// updateSkillComment(skillId: string, commentId: string, updatedCommentString: string){
	// 	this.db.collection('skills').doc(skillId).collection('comments').doc(commentId).set({comment: updatedCommentString})
	// 		.then(doc => {
	// 			this.uiService.showSnackbar("Commentaar bijgewerkt", null, 3000);
	// 		})
	// 		.catch(error => {
	// 			this.uiService.showSnackbar(error.message, null, 3000);
	// 		})
	// }


	removeSkillComment(skillId: string, comment: Comment){
		return this.db.collection('skills').doc(skillId).collection('comments').doc(comment.id).delete()
			.then(doc => {
				this.uiService.showSnackbar("Commentaar verwijderd", null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			})
	}

	removeSkills(skills: Skill[]){
		skills.forEach((skill) => {
			this.db.collection('skills').doc(skill.id).delete()
				.catch(error => {
					this.uiService.showSnackbar(error.message, null, 3000);
				})
		});
	}
}