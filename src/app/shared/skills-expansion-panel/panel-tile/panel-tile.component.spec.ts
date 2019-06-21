import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelTileComponent } from './panel-tile.component';

describe('PanelTileComponent', () => {
  let component: PanelTileComponent;
  let fixture: ComponentFixture<PanelTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
