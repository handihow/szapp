import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommentsComponent } from './comments.component';
import { AuthGuard } from '../auth/auth.guard';
import { StudentViewComponent } from './student-view/student-view.component';

const routes: Routes = [
	{ path: '', component: CommentsComponent, canLoad: [AuthGuard], pathMatch: 'full' },
	{ path: 'student', component: StudentViewComponent, canLoad: [AuthGuard] }
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CommentRoutingModule {}