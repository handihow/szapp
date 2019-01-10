import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 
import { Observable, Subscription } from 'rxjs';

import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { UIService } from '../../shared/ui.service';
import { take, map, startWith, finalize } from 'rxjs/operators';

import { User } from '../user.model';
import { Organisation } from '../organisation.model';

@Component({
  selector: 'user-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
 
  isLoading$: Observable<boolean>;
  user: User;
  userSubs: Subscription;
  organisation$: Observable<Organisation>;

  isEditing: boolean;

  profileForm: FormGroup;
  userId: string;

  classes: string[];
  subjects: string[];
  thumbnail$:  Observable<string | null>;

  // Main task 
  task: AngularFireUploadTask
  // Progress monitoring
  percentage: Observable<number>;
  snapshot: Observable<any>;
  // Download URL
  downloadURL: Observable<string>;
  // State for dropzone CSS toggling
  isHovering: boolean;  

  constructor(	private store: Store<fromRoot.State>,
                private authService: AuthService,
                private storage: AngularFireStorage,
                private uiService: UIService ) {}

  ngOnInit() {
    //create the profile form
    this.profileForm = new FormGroup({
      classes: new FormControl(null),
      subjects: new FormControl(null),
      imageUrl: new FormControl(null),
      thumbnailUrl: new FormControl(null)
    });
    //get the user, loading and organisation from the root app state management
    this.userSubs = this.store.select(fromRoot.getCurrentUser).subscribe(user => {
      if(user){
        this.user = user;
        this.userId = user.uid;
        this.profileForm.get("classes").setValue(user.classes);
        this.profileForm.get("subjects").setValue(user.subjects);
        if(user.thumbnailURL){
          const refTN = this.storage.ref(user.thumbnailURL);
          this.thumbnail$ = refTN.getDownloadURL();
        }
      }
    })
  	this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.organisation$ = this.store.select(fromRoot.getCurrentOrganisation);
  }

  onSubmit(){
    this.isEditing = false;
    this.authService.updateUserProfile({
      uid: this.userId,
      classes: this.profileForm.value.classes,
      subjects: this.profileForm.value.subjects,
      imageURL: this.profileForm.value.imageUrl,
      thumbnailURL: this.profileForm.value.thumbnailUrl
    });
  }

  onEdit(){
    this.isEditing = true;
  }

  onCancel(){
    this.isEditing = false;
  }

  ngOnDestroy(){
    this.userSubs.unsubscribe();
  }

  startUpload(event: FileList) {
    //don't upload if user has cancelled selecting the image
    if(!event.item(0)){
      return
    }
    // The File object
    const file = event.item(0)

    // Client-side validation 
    if (file.type.split('/')[0] !== 'image') { 
      this.uiService.showSnackbar('Geen geldig image file type. Upload geannuleerd.', null, 3000);
      return;
    }

    const storagePathPrefix='profile/'
    const dateTime = new Date().getTime();
    const filename = "_" + file.name;
    const resize = 'resized-'
    // The storage path
    const path = storagePathPrefix + dateTime + filename;
    const tnPath = storagePathPrefix + resize + dateTime + filename;

    // Totally optional metadata
    const customMetadata = { app: 'SZAPP' };
    
    // The main task
    this.task = this.storage.upload(path, file, { customMetadata })

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot   = this.task.snapshotChanges()

    // The file's download URL
    // this.downloadURL = this.task.downloadURL(); 

    this.snapshot = this.task.snapshotChanges().pipe(
      finalize(() => {
          // Update firestore on completion
          // this.db.collection('photos').add( { path, size: snap.totalBytes })
          const refTN = this.storage.ref(path);
          this.downloadURL = refTN.getDownloadURL();
          this.profileForm.get('imageUrl').setValue(path);
          this.profileForm.get('thumbnailUrl').setValue(tnPath);
        }
      )
    )
  }

  // Determines if the upload task is active
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }


} 