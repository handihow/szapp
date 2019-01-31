import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormativeOverviewComponent } from './formative-overview.component';

describe('FormativeOverviewComponent', () => {
  let component: FormativeOverviewComponent;
  let fixture: ComponentFixture<FormativeOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormativeOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormativeOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
