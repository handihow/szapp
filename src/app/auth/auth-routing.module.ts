import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { LoginComponent } from './home/home.component';
import { UserProfileComponent } from './profile/profile.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotComponent } from './forgot/forgot.component';
import { CallbackComponent } from './callback/callback.component';

const routes: Routes = [
	{ path: '', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
	{ path: 'forgot', component: ForgotComponent },
	{ path: 'profile', component: UserProfileComponent, canLoad: [AuthGuard] },
	{ path: 'callback', component: CallbackComponent },
] 

@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	exports: [RouterModule]
})
export class AuthRoutingModule {}