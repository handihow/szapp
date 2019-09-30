import {map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as fromUI from '../shared/ui.reducer';

import {firestore} from 'firebase/app';
import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';

@Injectable()
export class AdminService {

	constructor(	
		private afs: AngularFirestore,
		private uiService: UIService,
		private store: Store<fromUI.State>){}

	getUsers(organisationId?: string, userType?: string) : Observable<User[]> {
		this.store.dispatch(new UI.StartLoading());	
		let queryStr = (ref => ref.orderBy('displayName', 'asc'));
		if(organisationId){
			queryStr = (ref => ref
								.where('organisationId', '==', organisationId)
								.orderBy('displayName', 'asc'));
		} else if(userType){
			queryStr = (ref => ref
								.where('organisationId', '==', organisationId)
								.where('role', '==', userType)
								.orderBy('displayName', 'asc'));
		}
		return this.afs.collection('users', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());	
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as User;
						const id = doc.payload.doc.id;
						return { id, ...data };
					});
			}));
	}

	fetchOrganisations(){
		return this.afs.collection('organisations')
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());	
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Organisation;
						const id = doc.payload.doc.id;
						return { id, ...data };
					});
			}));
	}

	fetchOrganisation(organisationId: string) : Observable<Organisation>{
		return this.afs.collection('organisations').doc(organisationId).valueChanges();
	}

	updateUsersOfficialClass(users: User[], officialClass: string){
		let batch = this.afs.firestore.batch();
		users.forEach(user => {
			let userRef = this.afs.collection('users').doc(user.uid).ref;
			batch.update(userRef, {officialClass: officialClass});
		});
		return batch.commit();
	}

}

