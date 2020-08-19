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
  ScrapingIssueState
} from './scraping-issue.reducer';
import {
  getScrapingIssue,
  getScrapingIssueFailed,
  scrapingIssueReceived
} from 'app/comics/actions/scraping-issue.actions';
import { SCRAPING_VOLUME_1003 } from 'app/comics/models/scraping-volume.fixtures';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';

describe('ScrapingIssues Reducer', () => {
  const API_KEY = 'A0B1C2D3E4F56789';
  const SCRAPING_VOLUME = SCRAPING_VOLUME_1003;
  const ISSUE = SCRAPING_ISSUE_1000;
  const SKIP_CACHE = true;

  let state: ScrapingIssueState;

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

    it('has no scraping issue', () => {
      expect(state.issue).toBeNull();
    });
  });

  describe('fetching a scraping issue', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: false },
        getScrapingIssue({
          apiKey: API_KEY,
          volumeId: SCRAPING_VOLUME.id,
          issueNumber: ISSUE.issueNumber,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the fetching flag', () => {
      expect(state.fetching).toBeTruthy();
    });
  });

  describe('receiving a scraping issue', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: true, issue: null },
        scrapingIssueReceived({ issue: ISSUE })
      );
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('sets the scraping issue', () => {
      expect(state.issue).toBe(ISSUE);
    });
  });

  describe('failed to fetch the scraping issue', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: true, issue: ISSUE },
        getScrapingIssueFailed()
      );
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('has no scraping issue', () => {
      expect(state.issue).toBeNull();
    });
  });
});
