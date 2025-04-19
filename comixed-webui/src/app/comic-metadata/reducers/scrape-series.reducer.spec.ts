/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  initialState,
  reducer,
  SeriesScrapingState
} from './scrape-series.reducer';
import {
  scrapeSeriesMetadata,
  scrapeSeriesMetadataFailure,
  scrapeSeriesMetadataSuccess
} from '@app/comic-metadata/actions/scrape-series.actions';
import {
  METADATA_SOURCE_1,
  SCRAPING_VOLUME_1
} from '@app/comic-metadata/comic-metadata.fixtures';
import { PUBLISHER_1, SERIES_1 } from '@app/collections/collections.fixtures';

describe('ScrapeSeries Reducer', () => {
  const ORIGINAL_PUBLISHER = PUBLISHER_1.name;
  const ORIGINAL_SERIES = SERIES_1.name;
  const ORIGINAL_VOLUME = SERIES_1.volume;
  const SOURCE = METADATA_SOURCE_1;
  const VOLUME = SCRAPING_VOLUME_1;

  let state: SeriesScrapingState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('scraping a series', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: false },
        scrapeSeriesMetadata({
          originalPublisher: ORIGINAL_PUBLISHER,
          originalSeries: ORIGINAL_SERIES,
          originalVolume: ORIGINAL_VOLUME,
          source: SOURCE,
          volume: VOLUME
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...initialState, busy: true },
          scrapeSeriesMetadataSuccess()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...initialState, busy: true },
          scrapeSeriesMetadataFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
