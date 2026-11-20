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

import {
  initialScrapeFilenameState,
  SCRAPE_FILENAME_FEATURE_KEY,
  ScrapeFilenameState
} from '../reducers/scrape-filename.reducer';
import {
  selectScrapeFilenameBusy,
  selectScrapeFilenameData
} from './scrape-filename.selectors';
import { beforeEach } from 'vitest';

describe('ScrapeFilename Selectors', () => {
  const TEST_SERIES = 'The Series';
  const TEST_VOLUME = '2026';
  const TEST_ISSUE_NUMBER = '403';

  let state: ScrapeFilenameState;

  beforeEach(() => {
    state = {
      ...initialScrapeFilenameState,
      series: TEST_SERIES,
      volume: TEST_VOLUME,
      issueNumber: TEST_ISSUE_NUMBER
    };
  });

  describe('the busy flag', () => {
    it('should return true when busy', () => {
      expect(
        selectScrapeFilenameBusy({
          [SCRAPE_FILENAME_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });

    it('should return false when not busy', () => {
      expect(
        selectScrapeFilenameBusy({
          [SCRAPE_FILENAME_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });
  });

  it('should return comic filename data', () => {
    expect(
      selectScrapeFilenameData({
        [SCRAPE_FILENAME_FEATURE_KEY]: {
          ...state,
          series: TEST_SERIES,
          volume: TEST_VOLUME,
          issueNumber: TEST_ISSUE_NUMBER
        }
      })
    ).toStrictEqual({
      series: TEST_SERIES,
      volume: TEST_VOLUME,
      issueNumber: TEST_ISSUE_NUMBER
    });
  });
});
