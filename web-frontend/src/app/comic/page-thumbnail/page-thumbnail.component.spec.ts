import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageThumbnailComponent } from './page-thumbnail.component';

describe('PageThumbnailComponent', () => {
  let component: PageThumbnailComponent;
  let fixture: ComponentFixture<PageThumbnailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageThumbnailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
