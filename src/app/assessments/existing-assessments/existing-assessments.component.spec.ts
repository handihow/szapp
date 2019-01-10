import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingAssessmentsComponent } from './existing-assessments.component';

describe('ExistingAssessmentsComponent', () => {
  let component: ExistingAssessmentsComponent;
  let fixture: ComponentFixture<ExistingAssessmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingAssessmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingAssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
