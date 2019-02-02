import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingCommentsComponent } from './existing-comments.component';

describe('ExistingCommentsComponent', () => {
  let component: ExistingCommentsComponent;
  let fixture: ComponentFixture<ExistingCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
