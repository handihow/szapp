import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillSelectComponent } from './skill-select.component';

describe('SkillSelectComponent', () => {
  let component: SkillSelectComponent;
  let fixture: ComponentFixture<SkillSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
