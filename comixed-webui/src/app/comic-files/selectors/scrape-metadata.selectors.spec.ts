/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
  SCRAPE_METADATA_FEATURE_KEY,
  ScrapeMetadataState
} from '../reducers/scrape-metadata.reducer';
import { selectScrapeMetadataState } from './scrape-metadata.selectors';
import { COMIC_DETAIL_2 } from '@app/comic-books/comic-books.fixtures';

describe('ScrapeMetadata Selectors', () => {
  const COMIC = COMIC_DETAIL_2;

  let state: ScrapeMetadataState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      found: Math.random() > 0.5,
      series: COMIC.series,
      volume: COMIC.volume,
      issueNumber: COMIC.issueNumber
    };
  });

  it('should select the feature state', () => {
    expect(
      selectScrapeMetadataState({
        [SCRAPE_METADATA_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
