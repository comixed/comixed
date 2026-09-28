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
  initialMultiComicScrapingState,
  MULTI_COMIC_SCRAPING_FEATURE_KEY,
  multiComicScrapingAdapter,
  MultiComicScrapingState
} from '@app/metadata/reducers/multi-comic-scraping.reducer';
import {
  selectMultiComicScrapingBusy,
  selectMultiComicScrapingEntries,
  selectMultiComicScrapingTotal
} from '@app/metadata/selectors/multi-comic-scraping.selectors';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';

describe('MultiComicScraping Selectors', () => {
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const TEST_TOTAL = 320;

  let state: MultiComicScrapingState;

  beforeEach(() => {
    state = multiComicScrapingAdapter.setAll(TEST_COMIC_LIST, {
      ...initialMultiComicScrapingState,
      busy: false,
      total: TEST_TOTAL
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when busy', () => {
      expect(
        selectMultiComicScrapingBusy({
          [MULTI_COMIC_SCRAPING_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when busy', () => {
      expect(
        selectMultiComicScrapingBusy({
          [MULTI_COMIC_SCRAPING_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the comic list', () => {
    expect(
      selectMultiComicScrapingEntries({
        [MULTI_COMIC_SCRAPING_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(TEST_COMIC_LIST);
  });

  it('should return the total comics', () => {
    expect(
      selectMultiComicScrapingTotal({
        [MULTI_COMIC_SCRAPING_FEATURE_KEY]: { ...state }
      })
    ).toBe(TEST_TOTAL);
  });
});
