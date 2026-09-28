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
  BATCH_SCRAPE_COMICS_FEATURE_KEY,
  BatchScrapeComicsState,
  initialBatchScrapeComicsState
} from '../reducers/batch-scrape-comics.reducer';
import { selectBatchScrapeComicsBusy } from './batch-scrape-comics.selectors';
import { beforeEach } from 'vitest';

describe('BatchScrapeComics Selectors', () => {
  let state: BatchScrapeComicsState;

  beforeEach(() => {
    state = { ...initialBatchScrapeComicsState };
  });

  describe('the busy state', () => {
    it('should return true when busy', () => {
      expect(
        selectBatchScrapeComicsBusy({
          [BATCH_SCRAPE_COMICS_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });

    it('should return false when not busy', () => {
      expect(
        selectBatchScrapeComicsBusy({
          [BATCH_SCRAPE_COMICS_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });
  });
});
