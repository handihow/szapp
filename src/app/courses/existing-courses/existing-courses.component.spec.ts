import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingCoursesComponent } from './existing-courses.component';

describe('ExistingCourseesComponent', () => {
  let component: ExistingCoursesComponent;
  let fixture: ComponentFixture<ExistingCoursesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingCoursesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
