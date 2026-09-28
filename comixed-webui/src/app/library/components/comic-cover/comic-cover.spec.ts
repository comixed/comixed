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
import { COMIC_1 } from '@app/library/library-fixtures';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ComicCover } from '@app/library/components/comic-cover/comic-cover';
import { beforeEach } from 'vitest';

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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when loaded', () => {
    beforeEach(() => {
      component.comic = TEST_COMIC;
      fixture.detectChanges();
    });

    it('should show the comic title as the title', () => {
      expect(
        document.querySelector('#comic-cover-title')?.textContent.trim()
      ).toBe(TEST_COMIC.title);
    });

    it('should show the comic base filename as the subtitle', () => {
      expect(
        document.querySelector('#comic-cover-subtitle')?.textContent.trim()
      ).toBe(TEST_COMIC.baseFilename);
    });
  });
});
