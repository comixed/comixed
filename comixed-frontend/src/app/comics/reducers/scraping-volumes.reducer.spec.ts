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
  initialState,
  reducer,
  ScrapingVolumesState
} from './scraping-volumes.reducer';
import {
  SCRAPING_VOLUME_1001,
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003,
  SCRAPING_VOLUME_1004,
  SCRAPING_VOLUME_1005
} from 'app/comics/comics.fixtures';
import {
  getScrapingVolumes,
  getScrapingVolumesFailed,
  scrapingVolumesReceived
} from 'app/comics/actions/scraping-volumes.actions';

describe('ScrapingVolumes Reducer', () => {
  const API_KEY = 'A0B1C2D3E4F56789';
  const SERIES = 'Awesome Comic Series';
  const MAX_RECORDS = 55;
  const VOLUME = '2019';
  const SKIP_CACHE = true;
  const VOLUMES = [
    SCRAPING_VOLUME_1001,
    SCRAPING_VOLUME_1002,
    SCRAPING_VOLUME_1003,
    SCRAPING_VOLUME_1004,
    SCRAPING_VOLUME_1005
  ];

  let state: ScrapingVolumesState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('has no volumes', () => {
      expect(state.volumes).toEqual([]);
    });
  });

  describe('fetching scraping volumes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: false },
        getScrapingVolumes({
          apiKey: API_KEY,
          series: SERIES,
          volume: VOLUME,
          maxRecords: MAX_RECORDS,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the fetching flag', () => {
      expect(state.fetching).toBeTruthy();
    });
  });

  describe('receiving scraping volumes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: true, volumes: [] },
        scrapingVolumesReceived({ volumes: VOLUMES })
      );
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('sets the scraping volumes', () => {
      expect(state.volumes).toEqual(VOLUMES);
    });
  });

  describe('failing to fetch scraping volumes', () => {
    beforeEach(() => {
      state = reducer({ ...state, fetching: true }, getScrapingVolumesFailed());
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('has no volumes', () => {
      expect(state.volumes).toEqual([]);
    });
  });
});
