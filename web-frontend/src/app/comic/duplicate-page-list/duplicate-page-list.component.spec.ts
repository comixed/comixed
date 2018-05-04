import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DuplicatePageListComponent} from './duplicate-page-list.component';

describe('DuplicatePagesComponent', () => {
  let component: DuplicatePageListComponent;
  let fixture: ComponentFixture<DuplicatePageListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DuplicatePagesComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicatePagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
