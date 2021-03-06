import { BrowserModule, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

import { FlexLayoutModule } from '@angular/flex-layout';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { StoreModule } from '@ngrx/store';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';

import { AuthService } from './auth/auth.service';
import { ProjectService } from './projects/project.service';
import { ProgramService } from './programs/program.service';
import { EvaluationService } from './evaluations/evaluation.service';
import { SkillService } from './skills/skill.service';
import { CourseService } from './courses/course.service';
import { FormativeService } from './formatives/formative.service';
import { CommentService } from './comments/comment.service';
import { AdminService } from './admin/admin.service';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { UIService } from './shared/ui.service';
import { AuthModule } from './auth/auth.module';
import { reducers } from './app.reducer';
import { ServiceWorkerModule } from '@angular/service-worker';

@Injectable()
export class CustomHammerConfig extends HammerGestureConfig  {
   overrides = {
       pinch: { enable: false },
       rotate: { enable: false }
   };
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidenavListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    AppRoutingModule,
    FlexLayoutModule,
    CommonModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirePerformanceModule,
    AuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    StoreModule.forRoot(reducers),
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    Title,
    {provide: MAT_DATE_LOCALE, useValue: 'nl-be'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    AuthService,
    ProjectService,
    ProgramService,
    EvaluationService,
    SkillService,
    CourseService,
    FormativeService,
    CommentService,
    AdminService,
    UIService,
    { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
