import {map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as fromUI from '../shared/ui.reducer';

import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

import { Comment } from './comment.model';
import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';

@Injectable()
export class CommentService {
   
	constructor( private db: AngularFirestore,
				 private uiService: UIService,
				 private store: Store<fromUI.State> ){}


	addComment(comment: Comment){
		this.db.collection('comments').add(comment)
			.then(doc => {
				this.uiService.showSnackbar("Commentaar is succesvol bewaard.", null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			});
	}

	updateCommentToDatabase(comment: Comment): Promise<boolean>{
		return this.db.collection('comments').doc(comment.id).set(comment, {merge: true})
			.then( _ => {
				this.uiService.showSnackbar("Commentaar updated", null, 3000);
				return true;
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
				return false;
			})
	}


	fetchExistingComments(organisation?: Organisation, user?: User): Observable<Comment[]> {
		this.store.dispatch(new UI.StartLoading());
		var queryStr;
		if(organisation){
			queryStr = (ref => ref.where('organisation', '==', organisation.id));
		} else {
			queryStr = (ref => ref.where('teacher', '==', user.uid));
		}
		return this.db.collection('comments', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Comment;
						const id = doc.payload.doc.id;
						return { id, ...data };
					})
			}))	
	}

	fetchStudentComments(user: User): Observable<Comment[]> {
		this.store.dispatch(new UI.StartLoading());
		let queryStr = (ref => ref.where('student', '==', user.uid).orderBy('created', 'desc'));
		return this.db.collection('comments', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Comment;
						const id = doc.payload.doc.id;
						return { id, ...data };
					}).sort((a,b) => b.created - a.created)
			}))	
	}

	fetchCommentsStudentFromDateToDate(student: User, fromDate: Timestamp, toDate: Timestamp): Observable<Comment[]>{
		this.store.dispatch(new UI.StartLoading());
		let queryStr = (ref => ref.where('student', '==', student.uid)
									.where('created', '>', fromDate).where('created', '<', toDate));
		return this.db.collection('comments', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Comment;
						const id = doc.payload.doc.id;
						return { id, ...data };
					}).sort((a,b) => b.created - a.created)
			}))
	}

	removeComments(comments: Comment[]){
		comments.forEach((comment) => {
			this.db.collection('comments').doc(comment.id).delete()
			.then(_ => {
				this.uiService.showSnackbar("Commentaar verwijderd", null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			})
		});
	}

	
		
}

  
  

  