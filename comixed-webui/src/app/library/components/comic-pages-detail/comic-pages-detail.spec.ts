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
import { ComicPagesDetail } from '@app/library/components/comic-pages-detail/comic-pages-detail';
import { COMIC_PAGE_1, COMIC_PAGE_2 } from '@app/library/library-fixtures';
import { provideTranslateService } from '@ngx-translate/core';

describe('ComicPagesDetail', () => {
  const TEST_COMIC_PAGE_LIST = [COMIC_PAGE_1, COMIC_PAGE_2];

  let component: ComicPagesDetail;
  let fixture: ComponentFixture<ComicPagesDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicPagesDetail],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicPagesDetail);
    component = fixture.componentInstance;
    component.pages = TEST_COMIC_PAGE_LIST;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
