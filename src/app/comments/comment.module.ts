import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CommentRoutingModule } from './comment-routing.module';

import { CommentsComponent } from './comments.component';
import { NewCommentComponent } from './new-comment/new-comment.component';
import { ExistingCommentsComponent } from './existing-comments/existing-comments.component';
import { RemoveCommentsComponent } from './existing-comments/remove-comments.component';
import { EditCommentComponent } from './existing-comments/edit-comment.component';
import { StudentViewComponent } from './student-view/student-view.component';

@NgModule({
	declarations: [
		CommentsComponent,
		NewCommentComponent,
	    ExistingCommentsComponent,
	    RemoveCommentsComponent,
	    EditCommentComponent,
	    StudentViewComponent
	],
	imports: [
		SharedModule,
		CommentRoutingModule
	],
	entryComponents: [RemoveCommentsComponent, EditCommentComponent]
})
export class CommentModule {}