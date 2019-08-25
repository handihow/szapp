import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer'; 

import { AdminService } from '../../admin/admin.service';
import { Organisation } from '../../auth/organisation.model';


@Component({
  selector: 'app-organisation-select',
  templateUrl: './organisation-select.component.html',
  styleUrls: ['./organisation-select.component.css']
})
export class OrganisationSelectComponent implements OnInit {

  organisations: Organisation[];
  selectedOrganisationId: string;
  @Input() usedInForm: boolean;
  @Output() selectedOrganisation = new EventEmitter<Organisation>();
  screenType$: Observable<string>;
  subs: Subscription[] = [];

  constructor(	private store: Store<fromRoot.State>,
                private adminService: AdminService) { }

  ngOnInit() {
    //fetch the screen size 
    this.screenType$ = this.store.select(fromRoot.getScreenType);
    //get the organisations
  	this.subs.push(this.adminService.fetchOrganisations().subscribe(organisations => {
  	  this.organisations = organisations;
  	}));
  }

  ngOnDestroy(){
  	this.subs.forEach(sub=> {
  		sub.unsubscribe();
  	})
  }

  selectOrganisation(organisationId){
    let organisation = this.organisations.find(organisation => organisation.id === organisationId);
    this.selectedOrganisation.emit(organisation);
  }

}