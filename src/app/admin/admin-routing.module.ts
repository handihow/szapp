import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

import { AdminComponent } from './admin/admin.component';
import { DownloadsComponent } from './downloads/downloads.component';

const routes: Routes = [
	{ path: '', component: AdminComponent, canLoad: [AuthGuard], pathMatch: "full" },
	{ path: 'downloads', component: DownloadsComponent, canLoad: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
