
import {map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs'; 

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as fromEvaluation from './evaluation.reducer';
import * as EvaluationAction from './evaluation.actions';

import * as fromAssessment from '../assessments/assessment.reducer';
import * as AssessmentAction from '../assessments/assessment.actions';

import { Evaluation } from './evaluation.model';
import { Project } from '../projects/project.model';
import { Program } from '../programs/program.model'; 
import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';
import { Skill } from '../skills/skill.model';
import { Progress } from '../auth/user.model';
import { Result } from '../assessments/result.model';

import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

@Injectable()
export class EvaluationService {
   
	constructor( private db: AngularFirestore,
				 private uiService: UIService,
				 private store: Store<fromEvaluation.State>){}


	newEvaluation(skill: Skill){
		this.store.dispatch(new EvaluationAction.SetSkill(skill));
	}

	showEvaluation(evaluation: Evaluation){
		this.store.dispatch(new EvaluationAction.SetEvaluation(evaluation));
	}

	saveEvaluation(evaluation: Evaluation, userId: string, skillId: string) {
		this.addEvaluationToDatabase(evaluation, userId, skillId);
		this.store.dispatch(new EvaluationAction.UnsetSkill());
	}

	//function allows fetching evaluations, either all evaluations of a user, 
	//or all evaluations of the user of a specific program or project
	fetchExistingEvaluations(
			user?: User, 
			program?: Program, 
			project?: Project, 
			latestOnly?: boolean, 
			assessment?: boolean,
			notEvaluatedOnly?: boolean): Observable<Evaluation[]> {
		this.store.dispatch(new UI.StartLoading());
		var queryStr = (ref => ref.where('user', '==', user.uid));
		if(program){
			queryStr = (ref => ref.where('user', '==', user.uid).where('program', '==', program.id));
		} else if(!user && project){
			queryStr = (ref => ref.where('project', '==', project.id));
		} else if(project){
			queryStr = (ref => ref.where('user', '==', user.uid).where('project', '==', project.id));
		} else if(latestOnly){
			queryStr = (ref => ref.where('user', '==', user.uid).where('isLatest', '==', true));
		} else if(assessment && notEvaluatedOnly) {
			var queryStr = (ref => ref.where('teacher', '==', user.uid).where('status', '==', 'Niet beoordeeld'));
		} else if(assessment) {
			var queryStr = (ref => ref.where('teacher', '==', user.uid));
		}
		return this.db.collection('evaluations', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Evaluation;
						const id = doc.payload.doc.id;
						return { id, ...data };
					})
			}))	
	}

	//method retrieves an actual evaluation of a certain user and skill (database ids not included)
	fetchActualEvaluation(userId: string, skillId: string) : Observable<Evaluation> {
		return this.db.collection('evaluations').doc(userId + '_' + skillId)
			.valueChanges();
	}

	//method retrieves related evaluations of a certain user and skill (database ids not included)
	fetchRelatedEvaluations(userId: string, skillId: string) : Observable<Evaluation[]> {
		var queryStr = (ref => ref.where('user', '==', userId));
		return this.db.collection('evaluations').doc(userId + '_' + skillId).collection('history', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Evaluation;
						const id = doc.payload.doc.id;
						return { id, ...data };
					}).sort((a,b)=>{return b.created - a.created})
			}))
	}

	addEvaluationToDatabase(evaluation: Evaluation, userId: string, skillId: string): Promise<boolean>{
		//first set the evaluation to the skill or override the existing
		const evalRef: AngularFirestoreDocument<any> = this.db.doc(`evaluations/${userId}_${skillId}`);
		return evalRef.set(evaluation, { merge: true })
			.then(doc => {
				if(evaluation.status==="Beoordeeld"){
					return this.db.collection('evaluations').doc(userId + '_' + skillId).collection('history').add(evaluation)
						.then(doc => {
							this.uiService.showSnackbar('Beoordeling succesvol bewaard', null, 3000);
							return true;
						})
						.catch(error => {
							this.uiService.showSnackbar(error.message, null, 3000);
							return false;
						});
				} else {
					this.uiService.showSnackbar('Zelfevaluatie succesvol bewaard', null, 3000);
					return true;
				}
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
				return false;
			});
	}

	updateEvaluationToDatabase(evaluation: Evaluation, userId: string, skillId: string): Promise<boolean>{
		return this.db.collection('evaluations').doc(userId + '_' + skillId).update(evaluation)
		.then(doc => {
			//then save the evaluation also to the history of previous
			return this.db.collection('evaluations').doc(userId + '_' + skillId).collection('history').add(evaluation)
				.then(doc => {
					this.uiService.showSnackbar('Beoordeling succesvol bewaard', null, 3000);
					return true;
				})
				.catch(error => {
					this.uiService.showSnackbar(error.message, null, 3000);
					return false;
				});
		})
		.catch(error => {
			this.uiService.showSnackbar(error.message, null, 3000);
			return false;
		})
	}

	deleteEvaluation(evaluation: Evaluation){
		this.db.collection('evaluations').doc(evaluation.id).collection('history')
			.snapshotChanges().pipe(take(1)).subscribe(docArray => {
			let evaluationsInHistory = docArray.map(doc => {
				var data = doc.payload.doc.data() as Evaluation;
				data.historyId = doc.payload.doc.id;
				return data;
			}).sort((a,b)=>{return b.created - a.created});
			console.log(evaluationsInHistory);
			if(evaluationsInHistory.length==0){
				//there is no history in the evaluation, safe to delete
				this.deleteSingleEvaluation(evaluation);
			} else if(evaluationsInHistory.length==1 && evaluation.status=="Beoordeeld"){
				//delete the history first and then the evaluation also
				this.db.collection('evaluations').doc(evaluation.id).collection('history').doc(evaluationsInHistory[0].historyId)
				.delete().then(_ => {
					this.deleteSingleEvaluation(evaluation);
				}).catch(err =>{
					this.uiService.showSnackbar(err.message, null, 3000);
				});
			} else if(evaluationsInHistory.length==1){
				//no history needs to be deleted but item from history needs to be restored
				this.restoreEvaluationFromHistory(evaluation, evaluationsInHistory[0]);
			} else {
				//now first delete the latest evaluation from history
				this.db.collection('evaluations').doc(evaluation.id).collection('history').doc(evaluationsInHistory[0].historyId)
				.delete().then(_ => {
					//then update the evaluation document with the data from the second in line history element
					this.restoreEvaluationFromHistory(evaluation, evaluationsInHistory[1]);	
				}).catch(err =>{
					this.uiService.showSnackbar(err.message, null, 3000);
				});
			}
		})
	}

	private deleteSingleEvaluation(evaluation: Evaluation){
		this.db.collection('evaluations').doc(evaluation.id).delete()
			.then(doc => {
				this.uiService.showSnackbar('Beoordeling verwijderd', null, 3000);
				this.store.dispatch(new AssessmentAction.StopAssessment());
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			});
	}

	private restoreEvaluationFromHistory(evaluation: Evaluation, historyEvaluation: Evaluation){
		this.db.collection('evaluations').doc(evaluation.id).update(historyEvaluation)
			.then(doc => {
				this.uiService.showSnackbar('Beoordeling verwijderd', null, 3000);
				this.store.dispatch(new AssessmentAction.StopAssessment());
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			});
	}

	saveAssessments(results: Result[]): boolean{
		let wasSuccessful = true;
		results.forEach(async result => {
			if(!result.evaluation){
		      let newAssessment: Evaluation = this.onNewAssessment(result);
		      let success = await this.addEvaluationToDatabase(newAssessment, result.student.uid, result.skill.id);
		      if(!success){
		      	wasSuccessful = false;
		      }
		    } else if(result.evaluation.status==="Beoordeeld"){
		      let newAssessment: Evaluation = this.onNewAssessment(result);
		      let success = await this.updateEvaluationToDatabase(newAssessment, result.student.uid, result.skill.id);
		      if(!success){
		      	wasSuccessful = false;
		      }
		    } else {
		      let updatedAssessment: Evaluation = this.onUpdateAssessment(result);
		      let success = await this.updateEvaluationToDatabase(updatedAssessment, result.student.uid, result.skill.id);
		      if(!success){
		      	wasSuccessful = false;
		      }
		    }
		})
		return wasSuccessful
	}

	private onNewAssessment(result: Result): Evaluation {
		let newEvaluation: Evaluation ;
	    let timestamp = Timestamp.now();
	      newEvaluation = {
	        id: result.student.uid + '_' + result.skill.id,
	        created: timestamp,
	        evaluated: timestamp,
	        user: result.student.uid,
	        studentName: result.student.displayName,
	        organisation: result.student.organisation,
	        status: 'Beoordeeld',
	        class: (result.student.classes && result.student.classes[0]) ? result.student.classes[0] : null,
	        skill: result.skill.id,
	        skillCompetency: result.skill.competency,
	        skillTopic: result.skill.topic,
	        skillOrder: result.skill.order,
	        project: result.project.id,
	        projectCode: result.project.code,
	        projectName: result.project.name,
	        program: result.skill.program,
	        colorStudent: '#9E9E9E',
	        colorLabelStudent: 'Grijs',
	        iconStudent: 'supervised_user_circle',
	        commentStudent: 'Direct beoordeeld door de leraar',
	        teacher: result.teacher.uid,
	        teacherName: result.teacher.displayName,
	        commentTeacher: 'Alleen kleurbeoordeling',
	        colorLabelTeacher: result.color.colorLabel,
	        iconTeacher: result.color.icon,
	        ratingTeacher: result.color.rating,
	        colorTeacher: result.color.color
	      };
	    return newEvaluation;
	}

	private onUpdateAssessment(result: Result): Evaluation {
		let updatedEvaluation: Evaluation = result.evaluation;
		let timestamp = Timestamp.now();
		updatedEvaluation.evaluated = timestamp;
		updatedEvaluation.teacher = result.teacher.uid;
	    updatedEvaluation.commentTeacher = 'Alleen kleurbeoordeling';
	    updatedEvaluation.colorLabelTeacher = result.color.colorLabel;
	    updatedEvaluation.iconTeacher = result.color.icon;
	    updatedEvaluation.ratingTeacher = result.color.rating;
	    updatedEvaluation.colorTeacher = result.color.color;
		return updatedEvaluation;
	}

}

  
  

  