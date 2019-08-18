/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/library/models/comic.fixtures';
import { latestUpdatedDate, mergeComics } from './utility.functions';

describe('Utility Functions', () => {
  describe('merging comics', () => {
    const NO_OVERLAP = [COMIC_1, COMIC_3, COMIC_5];
    const SOME_OVERLAP = [COMIC_1, COMIC_2, COMIC_3, COMIC_5];
    const UPDATE = [COMIC_2, COMIC_4];
    const OVERLAP_UPDATED = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];

    it('updates an empty set', () => {
      expect(mergeComics([], UPDATE)).toEqual(UPDATE);
    });

    it('merges non-overlapping sets', () => {
      expect(
        mergeComics(NO_OVERLAP, UPDATE).sort(
          (left, right) => left.id - right.id
        )
      ).toEqual(
        NO_OVERLAP.concat(UPDATE).sort((left, right) => left.id - right.id)
      );
    });

    it('merges overlapping sets', () => {
      expect(
        mergeComics(SOME_OVERLAP, UPDATE).sort(
          (left, right) => left.id - right.id
        )
      ).toEqual(OVERLAP_UPDATED.sort((left, right) => left.id - right.id));
    });
  });

  describe('getting the latest updated date', () => {
    const LATEST_UPDATE = new Date().getTime();
    const COMICS = [
      { ...COMIC_1, last_updated_date: 0 },
      { ...COMIC_2, last_updated_date: LATEST_UPDATE },
      { ...COMIC_3, last_updated_date: 0 },
      { ...COMIC_4, last_updated_date: 0 },
      { ...COMIC_5, last_updated_date: 0 }
    ];

    it('returns 0 when no comics are provided', () => {
      expect(latestUpdatedDate([])).toEqual(0);
    });

    it('returns the latest date found', () => {
      expect(latestUpdatedDate(COMICS)).toEqual(LATEST_UPDATE);
    });
  });
});
