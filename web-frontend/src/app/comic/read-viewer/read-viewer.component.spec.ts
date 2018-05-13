import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadViewerComponent } from './read-viewer.component';

describe('ReadViewerComponent', () => {
  let component: ReadViewerComponent;
  let fixture: ComponentFixture<ReadViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
