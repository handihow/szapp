import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FormativeRoutingModule } from './formative-routing.module';

import { FormativesComponent } from './formatives.component';
import { NewFormativeComponent } from './new-formative/new-formative.component';
import { ExistingFormativesComponent } from './existing-formatives/existing-formatives.component';

@NgModule({
	declarations: [
		FormativesComponent,
		NewFormativeComponent,
	    ExistingFormativesComponent
	],
	imports: [
		SharedModule,
		FormativeRoutingModule
	]
	
})
export class FormativeModule {}