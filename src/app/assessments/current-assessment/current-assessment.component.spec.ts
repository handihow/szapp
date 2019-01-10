import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentAssessmentComponent } from './current-assessment.component';

describe('CurrentAssessmentComponent', () => {
  let component: CurrentAssessmentComponent;
  let fixture: ComponentFixture<CurrentAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
