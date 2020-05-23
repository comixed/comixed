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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/models/comic.fixtures';
import {
  latestUpdatedDate,
  mergeComics,
  mergeReadingLists
} from './library.functions';
import {
  READING_LIST_1,
  READING_LIST_2
} from 'app/comics/models/reading-list.fixtures';
import * as _ from 'lodash';
import { ReadingList } from 'app/comics/models/reading-list';

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
        [...mergeComics(NO_OVERLAP, UPDATE)].sort(
          (left, right) => left.id - right.id
        )
      ).toEqual(
        [...NO_OVERLAP.concat(UPDATE)].sort((left, right) => left.id - right.id)
      );
    });

    it('merges overlapping sets', () => {
      expect(
        [...mergeComics(SOME_OVERLAP, UPDATE)].sort(
          (left, right) => left.id - right.id
        )
      ).toEqual([...OVERLAP_UPDATED].sort((left, right) => left.id - right.id));
    });
  });

  describe('merging reading lists', () => {
    const UPDATE = [READING_LIST_1];
    const UPDATED: ReadingList = {
      ...READING_LIST_1,
      name: 'Updated Reading List'
    };

    it('updates an empty list', () => {
      expect(mergeReadingLists([], UPDATE)).toEqual(UPDATE);
    });

    it('merges non-overlapping sets', () => {
      expect(
        _.isEqual(mergeReadingLists([READING_LIST_2], UPDATE), [
          READING_LIST_2,
          READING_LIST_1
        ])
      ).toBeTruthy();
    });

    it('merges overlapping sets', () => {
      expect(mergeReadingLists(UPDATE, [UPDATED])).toEqual([UPDATED]);
    });
  });

  describe('getting the latest updated date', () => {
    const LATEST_UPDATE = new Date().getTime();
    const COMICS = [
      { ...COMIC_1, lastUpdatedDate: 0 },
      { ...COMIC_2, lastUpdatedDate: LATEST_UPDATE },
      { ...COMIC_3, lastUpdatedDate: 0 },
      { ...COMIC_4, lastUpdatedDate: 0 },
      { ...COMIC_5, lastUpdatedDate: 0 }
    ];

    it('returns 0 when no comics are provided', () => {
      expect(latestUpdatedDate([])).toEqual(0);
    });

    it('returns the latest date found', () => {
      expect(latestUpdatedDate(COMICS)).toEqual(LATEST_UPDATE);
    });
  });
});
