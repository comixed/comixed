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

import { ComicDetailTrailPipe } from './comic-detail-trail-pipe';
import { beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { COMIC_1 } from '@app/library/library-fixtures';
import { MenuItem } from '@openng/optimus-ui/api';

describe('ComicDetailTrailPipe', () => {
  const TEST_COMIC = COMIC_1;

  let pipe: ComicDetailTrailPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ComicDetailTrailPipe, provideTranslateService()]
    });

    pipe = TestBed.inject(ComicDetailTrailPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transforming a comic', () => {
    let trail: MenuItem[];

    beforeEach(() => {
      trail = pipe.transform(TEST_COMIC);
    });

    it('should show to the publisher', () => {
      expect(trail[0].label).toStrictEqual(TEST_COMIC.publisher);
    });

    it('should show to the series', () => {
      expect(trail[1].label).toStrictEqual(
        `${TEST_COMIC.series} V${TEST_COMIC.volume}`
      );
    });

    it('should show to the issue number', () => {
      expect(trail[2].label).toStrictEqual(`#${TEST_COMIC.issueNumber}`);
    });
  });
});
