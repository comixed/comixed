/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
  SCRAPING_FEATURE_KEY,
  ScrapingState
} from '../reducers/scraping.reducer';
import {
  selectScrapingIssue,
  selectScrapingState,
  selectScrapingVolumes
} from './scraping.selectors';
import {
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-books/comic-book.fixtures';

describe('Scraping Selectors', () => {
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;

  let state: ScrapingState;

  beforeEach(() => {
    state = {
      loadingRecords: Math.random() > 0.5,
      volumes: VOLUMES,
      scrapingIssue: SCRAPING_ISSUE
    };
  });

  it('should select the feature state', () => {
    expect(
      selectScrapingState({
        [SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the scraping volumes', () => {
    expect(
      selectScrapingVolumes({
        [SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.volumes);
  });

  it('should select the scraping issue', () => {
    expect(
      selectScrapingIssue({
        [SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.scrapingIssue);
  });
});
