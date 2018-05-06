import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ImportComicListComponent} from './import-comic-list.component';

describe('ImportComicListComponent', () => {
  let component: ImportComicsComponent;
  let fixture: ComponentFixture<ImportComicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportComicListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportComicListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
