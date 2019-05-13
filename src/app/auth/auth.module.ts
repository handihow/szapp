import { NgModule } from '@angular/core';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { LoginComponent } from './home/home.component';
import { UserProfileComponent } from './profile/profile.component';
import { ForgotComponent } from './forgot/forgot.component';
import { SignupComponent } from './signup/signup.component';
import { CallbackComponent } from './callback/callback.component';

@NgModule({
	declarations: [
		LoginComponent, 
		UserProfileComponent,
		ForgotComponent,
		SignupComponent,
		CallbackComponent],
	imports: [
    	AngularFireAuthModule,
    	SharedModule,
    	AuthRoutingModule,
    	HttpClientModule
	],
	exports: []
})
export class AuthModule {}