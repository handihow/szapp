
import {map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as fromProgram from './program.reducer';
import * as ProgramAction from './program.actions';

import { Program } from './program.model';
import { Skill } from '../skills/skill.model';
import { User } from '../auth/user.model';
import { Organisation } from '../auth/organisation.model';

@Injectable()
export class ProgramService {
   
	constructor( private db: AngularFirestore,
				 private uiService: UIService,
				 private store: Store<fromProgram.State> ){}


	startProgram(program: Program){
		program.created = new Date();
		program.status = "Concept"
		this.addProgramToDatabase(program);
	}

	editProgram(program: Program){
		this.store.dispatch(new ProgramAction.StartProgram(program));
	}

	saveActiveProgram(countedSkills: number) {
		this.store.select(fromProgram.getActiveProgram).pipe(take(1)).subscribe(program => {
			var program = program;
			program.countSkills = countedSkills;
			this.saveProgramToDatabase(program);
			this.store.dispatch(new ProgramAction.StopProgram());	
		})
	}

	saveDraftProgram() {
		this.store.select(fromProgram.getActiveProgram).pipe(take(1)).subscribe(program => {
			this.addProgramToDatabase(program);
			this.store.dispatch(new ProgramAction.StopProgram());	
		})
	}

	fetchExistingPrograms(organisation: Organisation, activeOnly?: boolean, user?: User, starred?: boolean): Observable<Program[]> {
		this.store.dispatch(new UI.StartLoading());
		var queryStr = (ref => ref.where('organisation', '==', organisation.id));
		if(activeOnly){
			queryStr = (ref => ref.where('organisation', '==', organisation.id).where('status', '==', "Actief"))
		}
		if(starred){
			let str = 'starred.' + user.uid;
			queryStr = (ref => ref.where(str, '==', true));
		}
		return this.db.collection('programs', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Program;
						const id = doc.payload.doc.id;
						return { id, ...data };
					})
			}))	
	}

	private addProgramToDatabase(program: Program){
		var addedProgram = program;
		this.db.collection('programs').add(program)
			.then(doc => {
				addedProgram.id = doc.id;
				this.store.dispatch(new ProgramAction.StartProgram(addedProgram));
				this.uiService.showSnackbar("Leerplan is succesvol bewaard.", null, 3000);
			})
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			});
	}

	private saveProgramToDatabase(program: Program){
		this.db.collection('programs').doc(program.id).update(program)
			.catch(error => {
				this.uiService.showSnackbar(error.message, null, 3000);
			})
	}

	getAverageProgramResults(programId){
		return new Promise((resolve, reject) => {
			this.db.collection('results').doc(programId).valueChanges().subscribe(averages =>{
				if(averages){
					resolve(averages);
				} else {
					reject(null);
				}
			})
		})
	}
		
}

  
  

  