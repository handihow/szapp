import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingProgramsComponent } from './existing-programs.component';

describe('ExistingProgramsComponent', () => {
  let component: ExistingProgramsComponent;
  let fixture: ComponentFixture<ExistingProgramsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingProgramsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingProgramsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
