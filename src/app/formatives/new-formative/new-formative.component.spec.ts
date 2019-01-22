import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFormativeComponent } from './new-formative.component';

describe('NewFormativeComponent', () => {
  let component: NewFormativeComponent;
  let fixture: ComponentFixture<NewFormativeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewFormativeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFormativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
