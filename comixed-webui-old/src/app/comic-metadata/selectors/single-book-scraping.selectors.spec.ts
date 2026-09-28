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
  SINGLE_BOOK_SCRAPING_FEATURE_KEY,
  SingleBookScrapingState
} from '../reducers/single-book-scraping.reducer';
import {
  selectChosenMetadataAutoSelectExactMatch,
  selectChosenMetadataConfirmBeforeScraping,
  selectChosenMetadataSource,
  selectScrapingIssueMetadata,
  selectScrapingVolumeMetadata,
  selectSingleBookScrapingBusy
} from './single-book-scraping.selectors';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-metadata/comic-metadata.fixtures';

describe('SingleBookScraping Selectors', () => {
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;

  let state: SingleBookScrapingState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      loadingRecords: Math.random() > 0.5,
      clearingCache: Math.random() > 0.5,
      volumes: VOLUMES,
      scrapingIssue: SCRAPING_ISSUE,
      metadataSource: METADATA_SOURCE_1,
      confirmBeforeScraping: Math.random() > 0.5,
      autoSelectExactMatch: Math.random() > 0.5
    };
  });

  it('selects the scraping busy state', () => {
    expect(
      selectSingleBookScrapingBusy({
        [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.busy || state.loadingRecords);
  });

  it('selects the scraping volumes', () => {
    expect(
      selectScrapingVolumeMetadata({
        [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.volumes);
  });

  it('selects the scraping issue', () => {
    expect(
      selectScrapingIssueMetadata({
        [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.scrapingIssue);
  });

  it('selects the selected metadata source', () => {
    expect(
      selectChosenMetadataSource({
        [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.metadataSource);
  });

  it('selects if confirming before selection', () => {
    expect(
      selectChosenMetadataConfirmBeforeScraping({
        [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.confirmBeforeScraping);
  });

  it('selects if autoselecting exact matches', () => {
    expect(
      selectChosenMetadataAutoSelectExactMatch({
        [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.autoSelectExactMatch);
  });
});
