import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentCourseComponent } from './current-course.component';

describe('CurrentCourseComponent', () => {
  let component: CurrentCourseComponent;
  let fixture: ComponentFixture<CurrentCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
