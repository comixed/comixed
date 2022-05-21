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

import { initialState, MetadataState, reducer } from './metadata.reducer';
import {
  clearMetadataCache,
  clearMetadataCacheFailed,
  comicScraped,
  issueMetadataLoaded,
  loadIssueMetadata,
  loadIssueMetadataFailed,
  loadVolumeMetadata,
  loadVolumeMetadataFailed,
  metadataCacheCleared,
  resetMetadataState,
  scrapeComic,
  scrapeComicFailed,
  setAutoSelectExactMatch,
  setChosenMetadataSource,
  setConfirmBeforeScraping,
  volumeMetadataLoaded
} from '@app/comic-metadata/actions/metadata.actions';
import { COMIC_BOOK_4 } from '@app/comic-books/comic-books.fixtures';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-metadata/comic-metadata.fixtures';

describe('Scraping Reducer', () => {
  const SERIES = 'The Series';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const VOLUME_ID = SCRAPING_VOLUME_1.id;
  const ISSUE_NUMBER = '27';
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const COMIC = COMIC_BOOK_4;
  const METADATA_SOURCE = METADATA_SOURCE_1;

  let state: MetadataState;

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

    it('clears the clearing cache flag', () => {
      expect(state.clearingCache).toBeFalse();
    });

    it('has no volumes loaded', () => {
      expect(state.volumes).toEqual([]);
    });

    it('has no scraping issue', () => {
      expect(state.scrapingIssue).toBeNull();
    });

    it('has no selected metadata source', () => {
      expect(state.metadataSource).toBeNull();
    });

    it('sets the confirm before scraping flag', () => {
      expect(state.confirmBeforeScraping).toBeTrue();
    });

    it('clears the auto-select exact match flag', () => {
      expect(state.autoSelectExactMatch).toBeFalse();
    });
  });

  describe('resetting the scraping state', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          volumes: VOLUMES,
          confirmBeforeScraping: false,
          autoSelectExactMatch: true
        },
        resetMetadataState()
      );
    });

    it('has no volumes loaded', () => {
      expect(state.volumes).toEqual([]);
    });

    it('sets the confirm before scraping flag', () => {
      expect(state.confirmBeforeScraping).toBeTrue();
    });

    it('clears the auto-select exact match flag', () => {
      expect(state.autoSelectExactMatch).toBeFalse();
    });
  });

  describe('changing the confirm before scraping state', () => {
    const confirm = Math.random() > 0.5;

    beforeEach(() => {
      state = reducer(
        { ...state, confirmBeforeScraping: !confirm },
        setConfirmBeforeScraping({ confirmBeforeScraping: confirm })
      );
    });

    it('sets the state', () => {
      expect(state.confirmBeforeScraping).toEqual(confirm);
    });
  });

  describe('changing the auto-select exact match state', () => {
    const confirm = Math.random() > 0.5;

    beforeEach(() => {
      state = reducer(
        { ...state, autoSelectExactMatch: !confirm },
        setAutoSelectExactMatch({ autoSelectExactMatch: confirm })
      );
    });

    it('sets the state', () => {
      expect(state.autoSelectExactMatch).toEqual(confirm);
    });
  });

  describe('loading a set of scraping volumes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loadingRecords: false },
        loadVolumeMetadata({
          metadataSource: METADATA_SOURCE,
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
        volumeMetadataLoaded({ volumes: VOLUMES })
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
        loadVolumeMetadataFailed()
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
        loadIssueMetadata({
          metadataSource: METADATA_SOURCE,
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
        issueMetadataLoaded({ issue: SCRAPING_ISSUE })
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
        loadIssueMetadataFailed()
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
          metadataSource: METADATA_SOURCE,
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

  describe('selecting a metadata source', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, metadataSource: null },
        setChosenMetadataSource({ metadataSource: METADATA_SOURCE })
      );
    });

    it('sets the metadata source', () => {
      expect(state.metadataSource).toEqual(METADATA_SOURCE);
    });
  });

  describe('clearing the metadata cache', () => {
    beforeEach(() => {
      state = reducer({ ...state, clearingCache: false }, clearMetadataCache());
    });

    it('sets the clearing cache flag', () => {
      expect(state.clearingCache).toBeTrue();
    });
  });

  describe('successfully cleared the metadata cache', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingCache: true },
        metadataCacheCleared()
      );
    });

    it('clears the clearing cache flag', () => {
      expect(state.clearingCache).toBeFalse();
    });
  });

  describe('failed to clear the metadata cache', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingCache: true },
        clearMetadataCacheFailed()
      );
    });

    it('clears the clearing cache flag', () => {
      expect(state.clearingCache).toBeFalse();
    });
  });
});
