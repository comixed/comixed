import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComicListEntryComponent } from './comic-list-entry.component';

describe('ComicListEntryComponent', () => {
  let component: ComicListEntryComponent;
  let fixture: ComponentFixture<ComicListEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComicListEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicListEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
