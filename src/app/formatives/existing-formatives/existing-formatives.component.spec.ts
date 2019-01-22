import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingFormativesComponent } from './existing-formatives.component';

describe('ExistingFormativesComponent', () => {
  let component: ExistingFormativesComponent;
  let fixture: ComponentFixture<ExistingFormativesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingFormativesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingFormativesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
