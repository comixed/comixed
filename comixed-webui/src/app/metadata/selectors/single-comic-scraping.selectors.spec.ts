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
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2
} from '@app/metadata/metadata-fixtures';
import {
  initialSingleComicScrapingState,
  SINGLE_COMIC_SCRAPING_FEATURE_KEY,
  singleComicScrapingAdapter,
  SingleComicScrapingState
} from '@app/metadata/reducers/single-comic-scraping.reducer';
import {
  selectSingleComicScrapingBusy,
  selectSingleComicScrapingEntries,
  selectSingleComicScrapingIssue
} from '@app/metadata/selectors/single-comic-scraping.selectors';

describe('SingleComicScraping Selectors', () => {
  const TEST_SCRAPING_VOLUME_LIST = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2];
  const TEST_SCRAPING_ISSUE = SCRAPING_ISSUE_1;

  let state: SingleComicScrapingState;

  beforeEach(() => {
    state = singleComicScrapingAdapter.setAll(TEST_SCRAPING_VOLUME_LIST, {
      ...initialSingleComicScrapingState,
      busy: false
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when loading', () => {
      expect(
        selectSingleComicScrapingBusy({
          [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when loading', () => {
      expect(
        selectSingleComicScrapingBusy({
          [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the configuration option list', () => {
    expect(
      selectSingleComicScrapingEntries({
        [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(TEST_SCRAPING_VOLUME_LIST);
  });

  describe('the scraping issue', () => {
    it('should return the issue when present', () => {
      expect(
        selectSingleComicScrapingIssue({
          [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: {
            ...state,
            issue: TEST_SCRAPING_ISSUE
          }
        })
      ).toStrictEqual(TEST_SCRAPING_ISSUE);
    });

    it('should return null when not present', () => {
      expect(
        selectSingleComicScrapingIssue({
          [SINGLE_COMIC_SCRAPING_FEATURE_KEY]: {
            ...state,
            issue: null
          }
        })
      ).toBeNull();
    });
  });
});
