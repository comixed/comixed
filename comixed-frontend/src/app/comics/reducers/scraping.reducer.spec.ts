/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
  ScrapingGetIssue,
  ScrapingGetIssueFailed,
  ScrapingGetVolumes,
  ScrapingGetVolumesFailed,
  ScrapingIssueReceived,
  ScrapingLoadMetadata,
  ScrapingLoadMetadataFailed,
  ScrapingMetadataLoaded,
  ScrapingResetVolumes,
  ScrapingSkipComic,
  ScrapingStart,
  ScrapingVolumesReceived
} from 'app/comics/actions/scraping.actions';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4
} from 'app/comics/models/comic.fixtures';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';
import {
  SCRAPING_VOLUME_1001,
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003,
  SCRAPING_VOLUME_1004,
  SCRAPING_VOLUME_1005
} from 'app/comics/models/scraping-volume.fixtures';
import { initialState, reducer, ScrapingState } from './scraping.reducer';

describe('Scraping Reducer', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4];
  const COMIC = COMIC_3;
  const API_KEY = 'A0B1C2D3E4F56789';
  const SERIES = 'Awesome Comic Series';
  const VOLUME = '2019';
  const SCRAPING_VOLUME = SCRAPING_ISSUE_1000;
  const SKIP_CACHE = true;
  const VOLUMES = [
    SCRAPING_VOLUME_1001,
    SCRAPING_VOLUME_1002,
    SCRAPING_VOLUME_1003,
    SCRAPING_VOLUME_1004,
    SCRAPING_VOLUME_1005
  ];
  const ISSUE = SCRAPING_ISSUE_1000;

  let state: ScrapingState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('has no comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('has no current comic', () => {
      expect(state.comic).toBeNull();
    });

    it('clears the fetching volumes flag', () => {
      expect(state.fetchingVolumes).toBeFalsy();
    });

    it('has an empty set of volumes', () => {
      expect(state.volumes).toEqual([]);
    });

    it('clears the fetching issue flag', () => {
      expect(state.fetchingIssue).toBeFalsy();
    });

    it('has no current issue', () => {
      expect(state.issue).toBeNull();
    });

    it('clears the scraping flag', () => {
      expect(state.scraping).toBeFalsy();
    });
  });

  describe('starting the scraping process', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, comics: [], volumes: VOLUMES, issue: ISSUE },
        new ScrapingStart({ comics: COMICS })
      );
    });

    it('sets the list of comics', () => {
      expect(state.comics).toEqual(COMICS);
    });

    it('sets the current comic', () => {
      expect(state.comic).toEqual(COMICS[0]);
    });

    it('clears the volume list', () => {
      expect(state.volumes).toEqual([]);
    });

    it('clears the current issue', () => {
      expect(state.issue).toBeNull();
    });
  });

  describe('fetching volumes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingVolumes: false },
        new ScrapingGetVolumes({
          apiKey: API_KEY,
          series: SERIES,
          volume: VOLUME,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the fetching volumes flag', () => {
      expect(state.fetchingVolumes).toBeTruthy();
    });
  });

  describe('receiving volumes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingVolumes: true, volumes: [] },
        new ScrapingVolumesReceived({ volumes: VOLUMES })
      );
    });

    it('clears the fetching volumes flag', () => {
      expect(state.fetchingVolumes).toBeFalsy();
    });

    it('sets the list of volumes', () => {
      expect(state.volumes).toEqual(VOLUMES);
    });
  });

  describe('failing to get volumes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingVolumes: true },
        new ScrapingGetVolumesFailed()
      );
    });

    it('clears the fetching volumes flag', () => {
      expect(state.fetchingVolumes).toBeFalsy();
    });
  });

  describe('getting a selected issue', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingIssue: false },
        new ScrapingGetIssue({
          apiKey: API_KEY,
          volumeId: SCRAPING_VOLUME.id,
          issueNumber: ISSUE.issueNumber,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the fetching issue flag', () => {
      expect(state.fetchingIssue).toBeTruthy();
    });
  });

  describe('receiving the selected issue', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingIssue: true, issue: null },
        new ScrapingIssueReceived({
          issue: ISSUE
        })
      );
    });

    it('clears the fetching issue flag', () => {
      expect(state.fetchingIssue).toBeFalsy();
    });

    it('sets the current issue', () => {
      expect(state.issue).toEqual(ISSUE);
    });
  });

  describe('failing to get the issue', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingIssue: true },
        new ScrapingGetIssueFailed()
      );
    });

    it('clears the fetching issue flag', () => {
      expect(state.fetchingIssue).toBeFalsy();
    });
  });

  describe('fetching the metadata for a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, scraping: false },
        new ScrapingLoadMetadata({
          apiKey: API_KEY,
          comicId: COMIC.id,
          issueNumber: ISSUE.issueNumber,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the scraping flag', () => {
      expect(state.scraping).toBeTruthy();
    });
  });

  describe('the comic metadata was retrieved', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          scraping: true,
          comics: COMICS,
          comic: COMIC,
          volumes: VOLUMES
        },
        new ScrapingMetadataLoaded({ comic: COMIC })
      );
    });

    it('clears the scraping flag', () => {
      expect(state.scraping).toBeFalsy();
    });

    it('removes the scraped coming from the list', () => {
      state.comics.forEach(comic => expect(comic.id).not.toEqual(COMIC.id));
    });

    it('sets the next comic to scrape', () => {
      expect(state.comic).toEqual(state.comics[0]);
    });

    it('clears the volume list', () => {
      expect(state.volumes).toEqual([]);
    });
  });

  describe('failure to get the comic metadata', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, scraping: true },
        new ScrapingLoadMetadataFailed()
      );
    });

    it('clears the scraping flag', () => {
      expect(state.scraping).toBeFalsy();
    });
  });

  describe('scraped the last comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, scraping: true, comics: [COMIC], comic: COMIC },
        new ScrapingMetadataLoaded({ comic: COMIC })
      );
    });

    it('clears the scraping flag', () => {
      expect(state.scraping).toBeFalsy();
    });

    it('updates the list of comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('clears the current comic', () => {
      expect(state.comic).toBeNull();
    });
  });

  describe('skipping a comic', () => {
    const SKIPPED_COMIC = COMICS[1];

    beforeEach(() => {
      state = reducer(
        { ...state, comic: SKIPPED_COMIC, comics: COMICS },
        new ScrapingSkipComic({ comic: SKIPPED_COMIC })
      );
    });

    it('removes the skipped comic from the list', () => {
      expect(state.comics).not.toContain(SKIPPED_COMIC);
    });

    it('replaces the current comic with the front of the queue', () => {
      expect(state.comic).toEqual(state.comics[0]);
    });
  });

  describe('skipping the last comic', () => {
    const SKIPPED_COMIC = COMICS[1];

    beforeEach(() => {
      state = reducer(
        { ...state, comic: SKIPPED_COMIC, comics: [SKIPPED_COMIC] },
        new ScrapingSkipComic({ comic: SKIPPED_COMIC })
      );
    });

    it('removes the skipped comic from the list', () => {
      expect(state.comics).not.toContain(SKIPPED_COMIC);
    });

    it('sets the current comic to nul', () => {
      expect(state.comic).toBeNull();
    });
  });

  describe('resetting the list of volumes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, volumes: VOLUMES },
        new ScrapingResetVolumes()
      );
    });

    it('sets an empty set', () => {
      expect(state.volumes).toEqual([]);
    });
  });
});
