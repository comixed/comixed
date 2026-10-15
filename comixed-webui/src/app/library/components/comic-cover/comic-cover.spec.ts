/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComicCover } from './comic-cover';
import { COMIC_1 } from '@app/library/library-fixtures';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

describe('ComicCover', () => {
  const TEST_COMIC = COMIC_1;

  let component: ComicCover;
  let fixture: ComponentFixture<ComicCover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicCover],
      providers: [
        provideTranslateService(),
        provideRouter([{ path: '*', redirectTo: '' }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicCover);
    component = fixture.componentInstance;
    component.comic = TEST_COMIC;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
