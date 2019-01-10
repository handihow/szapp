import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGcCourseComponent } from './new-gc-course.component';

describe('NewGcCourseComponent', () => {
  let component: NewGcCourseComponent;
  let fixture: ComponentFixture<NewGcCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewGcCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewGcCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
