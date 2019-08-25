import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationSelectComponent } from './organisation-select.component';

describe('OrganisationSelectComponent', () => {
  let component: OrganisationSelectComponent;
  let fixture: ComponentFixture<OrganisationSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganisationSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
