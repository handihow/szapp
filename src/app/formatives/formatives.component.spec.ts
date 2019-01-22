import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormativesComponent } from './formatives.component';

describe('FormativesComponent', () => {
  let component: FormativesComponent;
  let fixture: ComponentFixture<FormativesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormativesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormativesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
