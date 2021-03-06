import {map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as fromUI from '../shared/ui.reducer';

import { Formative } from './formative.model';
import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';
import { Evaluation } from '../evaluations/evaluation.model';

@Injectable()
export class FormativeService {
   
	constructor( private db: AngularFirestore,
				 private uiService: UIService,
				 private store: Store<fromUI.State> ){}


	addFormative(formative: Formative){
		this.db.collection('formatives').add(formative)
			.then(doc => {
				this.uiService.showSnackbar("Formatief is succesvol bewaard.", null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			});
	}

	updateFormativeToDatabase(formative: Formative): Promise<boolean>{
		return this.db.collection('formatives').doc(formative.id).set(formative, {merge: true})
			.then( _ => {
				this.uiService.showSnackbar("Formatief updated", null, 3000);
				return true;
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
				return false;
			})
	}

	saveResultsOfFormative(formative: Formative, evaluations: Evaluation[]) {
		let hasErrors = false;
		let errorMessages = '';
		evaluations.forEach(async evaluation => {
			await this.db.collection('formatives').doc(formative.id).collection('evaluations').add(evaluation)
			.then( _ => {
				this.uiService.showSnackbar("Evaluatie bewaard in formatief", null, 1000);
			})
			.catch(error => {
				hasErrors = true;
				errorMessages += error.message + " ";
			})
		})
		if(hasErrors){
			this.uiService.showSnackbar("Foutmeldingen bij het bewaren: " + errorMessages, null, 3000);
		} else {
			formative.hasSavedResults = true;
			this.updateFormativeToDatabase(formative).then( _ => {
				this.uiService.showSnackbar("Resultaten van formatief zijn bewaard", null, 3000);
			});
		}
	}

	fetchSavedResultsOfFormative(formative: Formative): Observable<Evaluation[]>{
		this.store.dispatch(new UI.StartLoading());
		return this.db.collection('formatives').doc(formative.id).collection('evaluations')
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

	fetchExistingFormatives(organisation?: Organisation, user?: User): Observable<Formative[]> {
		this.store.dispatch(new UI.StartLoading());
		var queryStr;
		if(organisation){
			queryStr = (ref => ref.where('organisation', '==', organisation.id));
		} else {
			queryStr = (ref => ref.where('user', '==', user.uid));
		}
		return this.db.collection('formatives', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Formative;
						const id = doc.payload.doc.id;
						return { id, ...data };
					})
			}))	
	}

	removeFormatives(formatives: Formative[]){
		formatives.forEach((formative) => {
			this.db.collection('formatives').doc(formative.id).delete()
			.then(_ => {
				this.uiService.showSnackbar("Formatief verwijderd", null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			})
		});
	}

	fetchFormativeResults(formative: Formative): Observable<Evaluation[]>{
		this.store.dispatch(new UI.StartLoading());
		var queryStr = (ref => ref.where('formative', '==', formative.id));
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
	
		
}

  
  

  