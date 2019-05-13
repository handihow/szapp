import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';

import { UIService } from '../../shared/ui.service';

import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';

@Component({
  selector: 'app-files-list',
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.css']
})
export class FilesListComponent implements OnInit {
  
  @Input() userRole: string;
  @Input() attachments: any[];

  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

    
  // gallery images
  hasImages: boolean;

  constructor(private db: AngularFirestore, 
              private storage: AngularFireStorage,
              private uiService: UIService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.galleryImages = [];
    this.getImages();
  }

  private getImages() {
    if(this.attachments){
      this.attachments.forEach((attachment) => {
        if(attachment.fileType==="image"){
          const ref = this.storage.ref(attachment.path);
          const downloadUrl = ref.getDownloadURL().subscribe(url => {
            this.hasImages = true;
            this.galleryImages.push({
              small: url,
              medium: url,
              big: url
            });
          })
        }
      })
    }
  }

  onDownloadAttachment(record){
    const ref = this.storage.ref(record.path);
    const downloadUrl = ref.getDownloadURL().subscribe(url => {
      window.open(url, "_blank");
    });
  }

  onDeleteAttachment(record){
    const ref = this.storage.ref(record.path);
    const refTN = this.storage.ref(record.pathTN);
    this.db.collection('files').doc(record.id).delete()
      .then( _ => {
        ref.delete();
        refTN.delete();
        this.uiService.showSnackbar("File was deleted successfully", null, 3000);
      })
      .catch(err => {
        this.uiService.showSnackbar(err.message, null, 3000)
      })
  }


}
