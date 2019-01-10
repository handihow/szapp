import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentProgramComponent } from './current-program.component';

describe('CurrentProgramComponent', () => {
  let component: CurrentProgramComponent;
  let fixture: ComponentFixture<CurrentProgramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentProgramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
