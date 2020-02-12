
import {of,  Observable, Subscription } from 'rxjs';

import {switchMap, map,  take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFirePerformance } from '@angular/fire/performance';

import { UIService } from '../shared/ui.service';
import { Store } from '@ngrx/store';

import { User } from './user.model';
import { Organisation } from './organisation.model';
import { AuthData } from './auth-data.model'; 
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';
import * as Auth from './auth.actions';

import { environment } from '../../environments/environment';
import { RBAC } from '../shared/rbac';

declare var gapi;

@Injectable()
export class AuthService {

	user$: Observable<User>;
	public static SESSION_STORAGE_KEY: string = 'accessToken';

	constructor(	
		private afp: AngularFirePerformance,
		private router: Router, 
		private afAuth: AngularFireAuth,
		private afs: AngularFirestore,
		private uiService: UIService,
		private store: Store<fromRoot.State>){}

	initAuthListener(){
		//listen to value changes in the authentication state from angularfire
		//return the custom user from the firebase User collection
		this.user$ = this.afAuth.authState.pipe(
			this.afp.trace('userLogin'),
		switchMap(user => {
			if (user) {
				this.setUserPermissions(user);
				if(user.providerData[0].providerId==="google.com"){
					//user is signing in with Google
					this.updateUserWithGoogleAuth(user);
				}
				return this.afs.doc<User>(`users/${user.uid}`).valueChanges()
			} else {
				this.store.dispatch(new Auth.SetUnauthenticated());
				this.store.dispatch(new UI.StopLoading())
				return of(null)
			}
		}))
	    //subscribe to changes in the user (triggered by changes in the auth state)
	    //and set the custom user object as current user in the NgRx State Management
	    this.user$.subscribe(async user => {
	    	if(user){
	    		//after accidental page reload, organisation may be lost in the app state
	    		//make sure organisation is set in the app state
	    		const organisation = await this.setOrganisation(user);
	    		this.store.dispatch(new Auth.SetOrganisation(organisation));
	    		//dispatch the current user to the app state
	    		this.store.dispatch(new Auth.SetAuthenticated(user));
	    		//do not proceed to the evaluations route if the user is editing the profile or courses
	    		if(!(this.router.url.includes('profile') || this.router.url.includes('courses'))){
	    			//navigate to the standard page
	    			if(user.role==="Leerling"){
	    				this.router.navigate(['/evaluations']);
	    			} else {
	    				this.router.navigate(['/assessments'])
	    			}
	    		}
	    		this.store.dispatch(new UI.StopLoading());
	    	} else {
	    		this.store.dispatch(new Auth.SetUnauthenticated());
	    		this.store.dispatch(new UI.StopLoading())
	    		this.router.navigate(['/']);
	    	}
	    });
	}

	private setUserPermissions(user){
		let permissions = [];
		user.getIdTokenResult().then(value => {
			if(value.claims){
				Object.keys(RBAC.permissions).forEach(role => {
					if(value.claims[role]){
						RBAC.permissions[role].forEach(permission => {
							if(!permissions.includes(permission)){
								permissions.push(permission);
							}
						});
					}
				})
			}
			this.store.dispatch(new Auth.SetPermissions(permissions));
		});
	}

	//sets organisation the user belongs to
	private  setOrganisation(user) {
		var promise = new Promise<Organisation>((resolve, reject) => {
			var orgRef : AngularFirestoreDocument<any> = this.afs.doc(`organisations/${user.organisationId}`);
			orgRef.valueChanges()
			.pipe(take(1))
			.subscribe((organisation: Organisation) => {
				if(organisation){
					organisation.id = user.organisationId;
					resolve(organisation);
				}
			}, error => {
				reject(null);
				this.uiService.showSnackbar(error.message, null, 3000);
			});	
		})
		return promise;
	}

	fetchOrganisations(){
		this.store.dispatch(new UI.StartLoading())
		this.afs.collection('organisations')
			.snapshotChanges().pipe(
			map(docArray => {
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as Organisation;
						const id = doc.payload.doc.id;
						return { id, ...data };
					})
			}))
			.pipe(take(1))
			.subscribe((organisations: Organisation[]) => {
				this.store.dispatch(new Auth.SetOrganisations(organisations));
				this.store.dispatch(new UI.StopLoading());
			}, error => {
				this.store.dispatch(new UI.StopLoading());
				this.uiService.showSnackbar(error.message, null, 3000);
			});	

	}

	registerUser(authData: AuthData, name: string, organisation: Organisation) {
		this.store.dispatch(new UI.StartLoading());
		this.afAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
		.then((user) => {
			this.createUser(user.user, name, organisation);
		})
		.catch(error =>{
			this.store.dispatch(new UI.StopLoading());
			this.uiService.showSnackbar(error.message, null, 3000)
		});
	}

	login(authData: AuthData) {
		this.store.dispatch(new UI.StartLoading());
		this.afAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
		.catch(error =>{
			this.store.dispatch(new UI.StopLoading());
			this.uiService.showSnackbar(error.message, null, 3000)
		});
	}

	logout(){
		this.removeToken();
		this.afAuth.auth.signOut();
	}

	signInWithGoogle() {
		//set the loading state in the app
		this.store.dispatch(new UI.StartLoading());
		this.router.navigate(['/callback']);
		//start the authentication process
		const provider = new firebase.auth.GoogleAuthProvider()
		return this.oAuthLogin(provider);
	}

	//signs in the user with oAuth
	private oAuthLogin(provider) {
		//set the loading state in the app
		this.store.dispatch(new UI.StartLoading());
		return this.afAuth.auth.signInWithRedirect(provider)
		.catch(error =>{
			this.store.dispatch(new UI.StopLoading());
			this.uiService.showSnackbar(error.message, null, 3000)
		});
	}

	private initGapi(){
		return new Promise((resolve, reject) => {
			var script = document.createElement('script');
		    script.type = 'text/javascript';
		    script.src = 'https://apis.google.com/js/api.js';
		    // Once the Google API Client is loaded, you can run your code
		    script.onload = function(e){
		    	gapi.load('client', () => {
					gapi.client.init({
					   apiKey: environment.firebase.apiKey,
				       clientId: environment.firebase.clientId,
				       discoveryDocs: environment.firebase.discoveryDocs,
				       scope: environment.firebase.scopes.join(' ')
					})
					.then(() => {
					   resolve(true)   
					})
					.catch(_ => {
						reject(false);
					})
				})
			}
			// Add to the document
    		document.getElementsByTagName('head')[0].appendChild(script); 
		})
	}
	
	async getIncrementalGoogleScopes() {
	  await this.initGapi();
	  let success = await this.initGapi();
	  if(success){
	  	const googleAuth = gapi.auth2.getAuthInstance();
		var googleUser = await googleAuth.signIn();
		console.log(googleUser);
		// googleUser.grant({'scope': environment.firebase.scopes.join(' ')});
		const access_token = await googleUser.getAuthResponse().access_token;
		if(access_token){
			this.setToken(access_token);
			return true;
		} else {
			return false;
		}
	  } 
	}

	public getToken(): string {
        let token: string = sessionStorage.getItem(AuthService.SESSION_STORAGE_KEY);
        if (!token) {
            return null
        }
        return sessionStorage.getItem(AuthService.SESSION_STORAGE_KEY);
    }

    private setToken(token: string){
    	sessionStorage.setItem(
                AuthService.SESSION_STORAGE_KEY, token
            );
    }

    public removeToken(){
    	sessionStorage.removeItem(AuthService.SESSION_STORAGE_KEY);
    }

	//check what organisation the user belongs to
	// private  getOrganisation(user) {
	// 	var promise = new Promise<Organisation>((resolve, reject) => {
	// 		this.afs.collection('organisations')
	// 		.snapshotChanges().pipe(
	// 		map(docArray => {
	// 			return docArray.map(doc => {
	// 					const data = doc.payload.doc.data() as Organisation;
	// 					const id = doc.payload.doc.id;
	// 					return { id, ...data };
	// 				})
	// 		}))
	// 		.pipe(take(1))
	// 		.subscribe((organisations: Organisation[]) => {
	// 			var userOrganisation: Organisation = null;
	// 			organisations.map(o => o.emailEndsWith).forEach((domain, index) => {
	// 				if((user.email).endsWith(domain)){
	// 					//user organisation to be returned from the promise
	// 					userOrganisation = organisations[index];
	// 				}
	// 			});
	// 			//resolve the users organisation (can be null if user's email extension was not recognized)
	// 			resolve(userOrganisation);
	// 		}, error => {
	// 			reject(null);
	// 			this.uiService.showSnackbar(error.message, null, 3000);
	// 		});	
	// 	})
	// 	return promise;
	// }

	//create custom user profile after signing up
	private createUser(user: User, name: string, organisation: Organisation) {
		// Sets user data to firestore
		const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
		//when signing up, automatically assign the student profile (teacher rights will need to be set in Firebase)
		const data: User = {
	    	uid: user.uid,
	    	email: user.email,
	    	displayName: name,
	    	organisation: organisation.name,
	    	organisationId: organisation.id,
	    	role: 'Leerling'
	    }
	    return userRef.set(data, { merge: true })
	}

	// updates the profile when logging in again with Google account
	private async updateUserWithGoogleAuth(user) {
		
	    // Sets user data to firestore
	    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

	    //creates the user object to be stored
	    const data: User = {
	    	uid: user.uid,
	    	email: user.email,
	    	displayName: user.displayName,
	    	photoURL: user.photoURL,
	    	hasGoogleForEducation: true
	    }
	    //now save the users data in the database and resolve true when the database update is finished
	    userRef.set(data, { merge: true })
	}

	updateUserProfile(profileUpdate) {
	    // Sets user data to firestore on login
	    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${profileUpdate.uid}`);

	    var data: User = {
	      	officialClass: profileUpdate.officialClass ? profileUpdate.officialClass : null,
	      	subjects: profileUpdate.subjects ? profileUpdate.subjects : null,
	      	classNumber: profileUpdate.classNumber ? profileUpdate.classNumber : 99
	    }

	    if(profileUpdate.imageURL){
	    	data.imageURL = profileUpdate.imageURL;
	    }
	    if(profileUpdate.thumbnailURL){
	    	data.thumbnailURL = profileUpdate.thumbnailURL;
	    }

	    return userRef.set(data, { merge: true })

	}

	sendPasswordResetEmail(emailAddress, doNotNavigate?: boolean){
		var auth = firebase.auth();
		var uiService = this.uiService;
		var router = this.router;
		auth.sendPasswordResetEmail(emailAddress).then(function() {
		  uiService.showSnackbar("Er is een email gestuurd met instructies om het wachtwoord te resetten naar " + emailAddress + ". Check eventueel of de email in de spam inbox is beland.", null, 3000);
		  if(!doNotNavigate){
		  	router.navigate(['/']);	
		  }
		}).catch(function(error) {
		  uiService.showSnackbar(error, null, 3000);
		});
	}

	fetchStudents(organisationId: string, disableLoading?: boolean, orderByClass?: boolean, usesClassNumbers?: boolean) : Observable<User[]> {
		if(!disableLoading){
			this.store.dispatch(new UI.StartLoading());	
		}
		var queryStr = (ref => ref
								.where('organisationId', '==', organisationId)
								.where('roles.student', '==', true)
								.orderBy('displayName', 'asc'));
		if(orderByClass && usesClassNumbers){
			queryStr = (ref => ref
								.where('organisationId', '==', organisationId)
								.where('roles.student', '==', true)
								.orderBy('officialClass', 'asc')
								.orderBy('classNumber', 'asc')
								.orderBy('displayName', 'asc'));
		} else if(orderByClass){
			queryStr = (ref => ref
								.where('organisationId', '==', organisationId)
								.where('roles.student', '==', true)
								.orderBy('officialClass', 'asc')
								.orderBy('displayName', 'asc'));
		}
		return this.afs.collection('users', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				if(!disableLoading){
					this.store.dispatch(new UI.StopLoading());	
				}
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as User;
						const id = doc.payload.doc.id;
						return { id, ...data };
					});
			}));
	}

	fetchTeachers(organisationId: string, disableLoading?: boolean) : Observable<User[]> {
		if(!disableLoading){
			this.store.dispatch(new UI.StartLoading());	
		}
		var queryStr = (ref => ref
								.where('organisationId', '==', organisationId)
								.where('roles.teacher', '==', true)
								.orderBy('displayName', 'asc'));
		return this.afs.collection('users', queryStr)
			.snapshotChanges().pipe(
			map(docArray => {
				if(!disableLoading){
					this.store.dispatch(new UI.StopLoading());	
				}
				return docArray.map(doc => {
						const data = doc.payload.doc.data() as User;
						const id = doc.payload.doc.id;
						return { id, ...data };
					});
			}));
	}

	fetchUserResults(user: User) {
		this.store.dispatch(new UI.StartLoading());
		return this.afs.collection('users').doc(user.uid).collection('results')
			.snapshotChanges().pipe(
			map(docArray => {
				this.store.dispatch(new UI.StopLoading());
				return docArray.map(doc => {
					const data = doc.payload.doc.data();
					const id = doc.payload.doc.id;
					return { id, ...data}
				})
			}))
	}

	fetchUserDisplayName(userId: string) : Observable<User> {
		return this.afs.collection('users').doc(userId).valueChanges();
	}

}

