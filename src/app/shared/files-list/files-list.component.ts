import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';

import { UIService } from '../../shared/ui.service';

import { NgxImageGalleryComponent, GALLERY_IMAGE, GALLERY_CONF } from "ngx-image-gallery";

@Component({
  selector: 'app-files-list',
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.css']
})
export class FilesListComponent implements OnInit {
  
  @Input() userRole: string;
  @Input() attachments: any[];

  @ViewChild(NgxImageGalleryComponent) ngxImageGallery: NgxImageGalleryComponent;

  // gallery configuration
  conf: GALLERY_CONF = {
    imageOffset: '0px',
    showDeleteControl: false,
    showImageTitle: false,
    inline: true, // make gallery inline (default false)
    backdropColor: "rgba(0,0,0,0)", // gallery backdrop (background) color (default rgba(13,13,14,0.85))
    showExtUrlControl: false, // show image external url icon (default true)
    showCloseControl: false, // show gallery close icon (default true)
  };
    
  // gallery images
  images: GALLERY_IMAGE[];
  hasImages: boolean;

  constructor(private db: AngularFirestore, 
              private storage: AngularFireStorage,
              private uiService: UIService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.images = [];
    this.getImages();
  }

  private getImages() {
    if(this.attachments){
      this.attachments.forEach((attachment) => {
        if(attachment.fileType==="image"){
          const ref = this.storage.ref(attachment.path);
          const downloadUrl = ref.getDownloadURL().subscribe(url => {
            this.hasImages = true;
            this.images.push({url: url});
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
