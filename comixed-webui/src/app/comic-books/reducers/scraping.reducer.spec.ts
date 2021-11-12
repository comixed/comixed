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

import { initialState, reducer, ScrapingState } from './scraping.reducer';
import {
  comicScraped,
  loadScrapingIssue,
  loadScrapingIssueFailed,
  loadScrapingVolumes,
  loadScrapingVolumesFailed,
  resetScraping,
  scrapeComic,
  scrapeComicFailed,
  scrapingIssueLoaded,
  scrapingVolumesLoaded
} from '@app/comic-books/actions/scraping.actions';
import {
  COMIC_4,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-books/comic-books.fixtures';

describe('Scraping Reducer', () => {
  const SERIES = 'The Series';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const VOLUME_ID = SCRAPING_VOLUME_1.id;
  const ISSUE_NUMBER = '27';
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const COMIC = COMIC_4;

  let state: ScrapingState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading records flag', () => {
      expect(state.loadingRecords).toBeFalse();
    });

    it('has no volumes loaded', () => {
      expect(state.volumes).toEqual([]);
    });

    it('has no scraping issue', () => {
      expect(state.scrapingIssue).toBeNull();
    });
  });

  describe('resetting the scraping state', () => {
    beforeEach(() => {
      state = reducer({ ...state, volumes: VOLUMES }, resetScraping());
    });

    it('has no volumes loaded', () => {
      expect(state.volumes).toEqual([]);
    });
  });

  describe('loading a set of scraping volumes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loadingRecords: false },
        loadScrapingVolumes({
          series: SERIES,
          maximumRecords: MAXIMUM_RECORDS,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the loading records flag', () => {
      expect(state.loadingRecords).toBeTrue();
    });
  });

  describe('receiving a set of scraping issues', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loadingRecords: true, volumes: [] },
        scrapingVolumesLoaded({ volumes: VOLUMES })
      );
    });

    it('clears the loading records flag', () => {
      expect(state.loadingRecords).toBeFalse();
    });

    it('sets the scraping volumes', () => {
      expect(state.volumes).toEqual(VOLUMES);
    });
  });

  describe('failure to load scraping volumes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loadingRecords: true },
        loadScrapingVolumesFailed()
      );
    });

    it('clears the loading records flag', () => {
      expect(state.loadingRecords).toBeFalse();
    });
  });

  describe('loading a scraping issue', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loadingRecords: false },
        loadScrapingIssue({
          volumeId: VOLUME_ID,
          issueNumber: ISSUE_NUMBER,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loadingRecords).toBeTrue();
    });
  });

  describe('receiving a scraping issue', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loadingRecords: true,
          scrapingIssue: null
        },
        scrapingIssueLoaded({ issue: SCRAPING_ISSUE })
      );
    });

    it('clears the loading records flag', () => {
      expect(state.loadingRecords).toBeFalse();
    });
  });

  describe('failure to load a scraping issue', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loadingRecords: true },
        loadScrapingIssueFailed()
      );
    });

    it('clears the loading records flag', () => {
      expect(state.loadingRecords).toBeFalse();
    });
  });

  describe('scraping a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loadingRecords: false },
        scrapeComic({
          comic: COMIC,
          issueId: SCRAPING_ISSUE.id,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the loading records flag', () => {
      expect(state.loadingRecords).toBeTrue();
    });
  });

  describe('when a comic is scraped', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loadingRecords: true,
          volumes: VOLUMES,
          scrapingIssue: SCRAPING_ISSUE
        },
        comicScraped()
      );
    });

    it('clears the loading records flag', () => {
      expect(state.loadingRecords).toBeFalse();
    });

    it('clears the scraping volumes', () => {
      expect(state.volumes).toEqual([]);
    });

    it('clears the scraping issue', () => {
      expect(state.scrapingIssue).toBeNull();
    });
  });

  describe('failure to scrape a comic', () => {
    beforeEach(() => {
      state = reducer({ ...state, loadingRecords: true }, scrapeComicFailed());
    });

    it('clears the loading records flag', () => {
      expect(state.loadingRecords).toBeFalse();
    });
  });
});
