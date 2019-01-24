import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FormativeRoutingModule } from './formative-routing.module';

import { FormativesComponent } from './formatives.component';
import { NewFormativeComponent } from './new-formative/new-formative.component';
import { ExistingFormativesComponent } from './existing-formatives/existing-formatives.component';
import { RemoveFormativesComponent } from './existing-formatives/remove-formatives.component';
import { EditFormativeComponent } from './existing-formatives/edit-formative.component';

@NgModule({
	declarations: [
		FormativesComponent,
		NewFormativeComponent,
	    ExistingFormativesComponent,
	    RemoveFormativesComponent,
	    EditFormativeComponent
	],
	imports: [
		SharedModule,
		FormativeRoutingModule
	],
	entryComponents: [RemoveFormativesComponent, EditFormativeComponent]
})
export class FormativeModule {}