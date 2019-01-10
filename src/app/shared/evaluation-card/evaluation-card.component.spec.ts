import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationCardComponent } from './evaluation-card.component';

describe('EvaluationCardComponent', () => {
  let component: EvaluationCardComponent;
  let fixture: ComponentFixture<EvaluationCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
