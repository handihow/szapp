import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsExpansionPanelComponent } from './skills-expansion-panel.component';

describe('SkillsExpansionPanelComponent', () => {
  let component: SkillsExpansionPanelComponent;
  let fixture: ComponentFixture<SkillsExpansionPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillsExpansionPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
