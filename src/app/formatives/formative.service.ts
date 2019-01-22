import {map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as fromUI from '../shared/ui.reducer';

import { Formative } from './formative.model';
import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';

@Injectable()
export class FormativeService {
   
	constructor( private db: AngularFirestore,
				 private uiService: UIService,
				 private store: Store<fromUI.State> ){}


	addFormative(formative: Formative){
		this.db.collection('formatives').add(formative)
			.then(doc => {
				this.uiService.showSnackbar("Toets is succesvol bewaard.", null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			});
	}

	updateFormativeToDatabase(formative: Formative){
		this.db.collection('formatives').doc(formative.id).update(formative)
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			})
	}

	fetchExistingFormatives(organisation: Organisation, user?: User, starred?: boolean): Observable<Formative[]> {
		this.store.dispatch(new UI.StartLoading());
		var queryStr = (ref => ref.where('organisation', '==', organisation.id));
		if(starred){
			let str = 'starred.' + user.uid;
			queryStr = (ref => ref.where(str, '==', true));
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
	
		
}

  
  

  