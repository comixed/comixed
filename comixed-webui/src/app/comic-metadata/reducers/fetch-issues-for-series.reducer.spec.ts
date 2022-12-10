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
  FetchIssuesForSeriesState,
  initialState,
  reducer
} from './fetch-issues-for-series.reducer';
import {
  fetchIssuesForSeriesFailed,
  fetchIssuesForSeries,
  issuesForSeriesFetched
} from '@app/comic-metadata/actions/fetch-issues-for-series.actions';
import {
  METADATA_SOURCE_1,
  SCRAPING_VOLUME_1
} from '@app/comic-metadata/comic-metadata.fixtures';

describe('FetchIssuesForSeries Reducer', () => {
  const SOURCE = METADATA_SOURCE_1;
  const VOLUME = SCRAPING_VOLUME_1;

  let state: FetchIssuesForSeriesState;

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

  describe('fetching the issues for a series', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: false },
        fetchIssuesForSeries({ source: SOURCE, volume: VOLUME })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('success fetching issues for a series', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: true },
        issuesForSeriesFetched()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('failure fetching the issues for a series', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: true },
        fetchIssuesForSeriesFailed()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
