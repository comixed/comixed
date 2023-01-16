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
  initialState,
  reducer,
  ScrapeMetadataState
} from './scrape-metadata.reducer';
import { COMIC_DETAIL_2 } from '@app/comic-books/comic-books.fixtures';
import {
  metadataScrapedFromFilename,
  resetScrapedMetadata,
  scrapeMetadataFromFilename,
  scrapeMetadataFromFilenameFailed
} from '@app/comic-files/actions/scrape-metadata.actions';

describe('ScrapeMetadata Reducer', () => {
  const FILENAME = COMIC_DETAIL_2.baseFilename;
  const FOUND = Math.random() > 0.5;
  const SERIES = COMIC_DETAIL_2.series;
  const VOLUME = COMIC_DETAIL_2.volume;
  const ISSUE_NUMBER = COMIC_DETAIL_2.issueNumber;

  let state: ScrapeMetadataState;

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

    it('clears the found flag', () => {
      expect(state.found).toBeFalse();
    });

    it('has no series', () => {
      expect(state.series).toEqual('');
    });

    it('has no volume', () => {
      expect(state.volume).toEqual('');
    });

    it('has no issue number', () => {
      expect(state.issueNumber).toEqual('');
    });
  });

  describe('resetting the scraped data', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          found: true,
          series: SERIES,
          volume: VOLUME,
          issueNumber: ISSUE_NUMBER
        },
        resetScrapedMetadata()
      );
    });

    it('clears the found flag', () => {
      expect(state.found).toBeFalse();
    });

    it('clears the series', () => {
      expect(state.series).toEqual('');
    });

    it('clears the volume', () => {
      expect(state.volume).toEqual('');
    });

    it('clears the issue number', () => {
      expect(state.issueNumber).toEqual('');
    });
  });

  describe('scraping a filename', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          busy: false
        },
        scrapeMetadataFromFilename({ filename: FILENAME })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('receiving the metadata', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          busy: true,
          found: false,
          series: '',
          volume: '',
          issueNumber: ''
        },
        metadataScrapedFromFilename({
          found: FOUND,
          series: SERIES,
          volume: VOLUME,
          issueNumber: ISSUE_NUMBER
        })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the found flag', () => {
      expect(state.found).toEqual(FOUND);
    });

    it('sets the series', () => {
      expect(state.series).toEqual(SERIES);
    });

    it('sets the volume', () => {
      expect(state.volume).toEqual(VOLUME);
    });

    it('sets the issue number', () => {
      expect(state.issueNumber).toEqual(ISSUE_NUMBER);
    });
  });

  describe('failure scraping the metadata from the filename', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, found: true },
        scrapeMetadataFromFilenameFailed()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('clears the found flag', () => {
      expect(state.found).toBeFalse();
    });
  });
});
