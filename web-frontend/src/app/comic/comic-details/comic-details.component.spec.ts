import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComicDetailsComponent } from './comic-details.component';

describe('ComicDetailsComponent', () => {
  let component: ComicDetailsComponent;
  let fixture: ComponentFixture<ComicDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComicDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
