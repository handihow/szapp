import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentEvaluationComponent } from './current-evaluation.component';

describe('CurrentEvaluationComponent', () => {
  let component: CurrentEvaluationComponent;
  let fixture: ComponentFixture<CurrentEvaluationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentEvaluationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
