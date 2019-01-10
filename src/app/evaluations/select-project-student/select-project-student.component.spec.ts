import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProjectStudentComponent } from './select-project-student.component';

describe('SelectProjectStudentComponent', () => {
  let component: SelectProjectStudentComponent;
  let fixture: ComponentFixture<SelectProjectStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectProjectStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProjectStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
