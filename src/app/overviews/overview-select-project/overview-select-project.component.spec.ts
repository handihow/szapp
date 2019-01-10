import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewSelectProjectComponent } from './overview-select-project.component';

describe('OverviewSelectProjectComponent', () => {
  let component: OverviewSelectProjectComponent;
  let fixture: ComponentFixture<OverviewSelectProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewSelectProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewSelectProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
