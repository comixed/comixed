import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComicFileLookupComponent } from './comic-file-lookup.component';

describe('ComicFileLookupComponent', () => {
  let component: ComicFileLookupComponent;
  let fixture: ComponentFixture<ComicFileLookupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicFileLookupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicFileLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
