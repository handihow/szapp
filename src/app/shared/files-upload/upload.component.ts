import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { take, map, startWith, finalize } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';

import { UIService } from '../../shared/ui.service';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  @Input() metadata: any;

  //files input or dropped by the user
  files: any[] = [];
  hasFiles: boolean;

  // State for dropzone CSS toggling
  isHovering: boolean;  

  //check if all files are uploaded
  allFilesUploaded: boolean;

  constructor(	private db: AngularFirestore,
  				private storage: AngularFireStorage, 
  				private uiService: UIService) { }

  ngOnInit() {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onFilesSelected(event: FileList) {
    if(event.length>5){
      return this.uiService.showSnackbar("You have selected too many files, maximum is 5", null, 3000);
    }
    this.hasFiles = true;
  	let newFiles = Array.from(event);
    this.files = this.files.concat(newFiles);
  }

  onRemoveFileFromList(index: number){
  	this.files.splice(index, 1);
  }

  startUpload(file, i: number) {
    if(file.isUploaded){
      return;
    }
    if(file.size>10000000){
      return this.uiService.showSnackbar("File size exceeds 10 MB. Upload cancelled", null, 3000);
    }
    const fileType = file.type.split('/')[0];
    const dateTime = new Date().getTime();
    // The storage path
    const path = "files/" + dateTime + "_" + file.name;
    const pathTN = "files/resized-" + dateTime + "_" + file.name;
    // The main task
    let task : AngularFireUploadTask = this.storage.upload(path, file, { ...this.metadata })
    this.files[i].task = task;
    // Progress monitoring
    this.files[i].percentage = task.percentageChanges();
    this.files[i].snapshot   = task.snapshotChanges()

    this.files[i].snapshot = task.snapshotChanges().pipe(
      finalize(() => {
          // Update firestore on completion
          this.db.collection('files').add({
            path,
            pathTN,
            size: file.size,
            filename: file.name,
            fileType: fileType,
            ...this.metadata
			    })
            .then(file => {
              this.files[i].isUploaded = true;
              this.files[i].id = file.id;
            })
          	.catch(err => {
          		this.uiService.showSnackbar(err.message, null, 3000)
          	})
      })
    )
  }

  // Determines if the upload task is active
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
  }

  uploadAll() {
    this.files.forEach((file, i) => {
      this.startUpload(file,i);
    });
    this.allFilesUploaded = true;
  }

  removeAll() {
    this.files = [];
    this.hasFiles = false;
  }

  deleteFile(i){
    this.db.collection('files').doc(this.files[i].id).delete()
      .then( _ => {
        this.uiService.showSnackbar("File was deleted successfully", null, 3000);
        this.onRemoveFileFromList(i);
      })
      .catch(err => {
        this.uiService.showSnackbar(err.message, null, 3000)
      })
  }

}
