/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DuplicatePageListEntryComponent} from './duplicate-page-list-entry.component';

describe('DuplicatePageListEntryComponent', () => {
  let component: DuplicatePageListEntryComponent;
  let fixture: ComponentFixture<DuplicatePageListEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DuplicatePageListEntryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicatePageListEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
