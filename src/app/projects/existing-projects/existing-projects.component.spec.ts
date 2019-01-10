import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingProjectsComponent } from './existing-projects.component';

describe('ExistingProjectsComponent', () => {
  let component: ExistingProjectsComponent;
  let fixture: ComponentFixture<ExistingProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
