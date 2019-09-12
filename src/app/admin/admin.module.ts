import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { AdminComponent } from './admin/admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DownloadsComponent } from './downloads/downloads.component';
import { EditRolesComponent } from './admin/edit-roles.component';
import { AddUsersComponent } from './admin/add-users.component';
import { RemoveUserComponent } from './admin/remove-user.component';
import { EditProfileComponent } from './admin/edit-profile.component';

@NgModule({
  declarations: [
    AdminComponent,
    DownloadsComponent,
    EditRolesComponent,
    AddUsersComponent,
    RemoveUserComponent,
    EditProfileComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
  ],
  entryComponents: [
    EditRolesComponent,
    AddUsersComponent,
    RemoveUserComponent,
    EditProfileComponent
  ]
})
export class AdminModule { }
