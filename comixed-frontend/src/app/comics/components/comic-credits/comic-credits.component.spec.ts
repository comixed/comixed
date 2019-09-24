/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { COMIC_1, COMIC_5 } from 'app/library';
import { ComicCreditsComponent } from './comic-credits.component';

describe('ComicCreditsComponent', () => {
  let component: ComicCreditsComponent;
  let fixture: ComponentFixture<ComicCreditsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CardModule, DataViewModule],
      declarations: [ComicCreditsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicCreditsComponent);
    component = fixture.componentInstance;
    component.comic = COMIC_1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('populates the credits when the comic is changed', () => {
    component.comic = COMIC_5;
    expect(component.credits).not.toEqual([]);
  });
});
