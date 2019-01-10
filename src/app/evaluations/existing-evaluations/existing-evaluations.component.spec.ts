import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingEvaluationsComponent } from './existing-evaluations.component';

describe('ExistingEvaluationsComponent', () => {
  let component: ExistingEvaluationsComponent;
  let fixture: ComponentFixture<ExistingEvaluationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingEvaluationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingEvaluationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
