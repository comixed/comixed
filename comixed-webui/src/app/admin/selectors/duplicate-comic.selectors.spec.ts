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

import { beforeEach } from 'vitest';
import {
  DUPLICATE_COMIC_FEATURE_KEY,
  duplicateComicAdapter,
  DuplicateComicState,
  initialDuplicateComicState
} from '@app/admin/reducers/duplicate-comic.reducer';
import {
  selectDuplicateComicBusy,
  selectDuplicateComicCoverMonths,
  selectDuplicateComicCoverYears,
  selectDuplicateComicEntries,
  selectDuplicateComicTotal
} from '@app/admin/selectors/duplicate-comic.selectors';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';

describe('DuplicateComic Selectors', () => {
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const TEST_COVER_MONTH_LIST = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEAR_LIST = [1965, 1971, 1986, 1996, 1998, 2006];
  const TEST_TOTAL = 320;

  let state: DuplicateComicState;

  beforeEach(() => {
    state = duplicateComicAdapter.setAll(TEST_COMIC_LIST, {
      ...initialDuplicateComicState,
      busy: false,
      coverMonths: TEST_COVER_MONTH_LIST,
      coverYears: TEST_COVER_YEAR_LIST,
      total: TEST_TOTAL
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when busy', () => {
      expect(
        selectDuplicateComicBusy({
          [DUPLICATE_COMIC_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when busy', () => {
      expect(
        selectDuplicateComicBusy({
          [DUPLICATE_COMIC_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the comic list ', () => {
    expect(
      selectDuplicateComicEntries({
        [DUPLICATE_COMIC_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(TEST_COMIC_LIST);
  });

  it('should return the cover month list', () => {
    expect(
      selectDuplicateComicCoverMonths({
        [DUPLICATE_COMIC_FEATURE_KEY]: { ...state }
      })
    ).toBe(TEST_COVER_MONTH_LIST);
  });

  it('should return the cover year list', () => {
    expect(
      selectDuplicateComicCoverYears({
        [DUPLICATE_COMIC_FEATURE_KEY]: { ...state }
      })
    ).toBe(TEST_COVER_YEAR_LIST);
  });

  it('should return the total comics', () => {
    expect(
      selectDuplicateComicTotal({
        [DUPLICATE_COMIC_FEATURE_KEY]: { ...state }
      })
    ).toBe(TEST_TOTAL);
  });
});
