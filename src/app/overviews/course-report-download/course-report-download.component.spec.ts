import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseReportDownloadComponent } from './course-report-download.component';

describe('CourseReportDownloadComponent', () => {
  let component: CourseReportDownloadComponent;
  let fixture: ComponentFixture<CourseReportDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseReportDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseReportDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
