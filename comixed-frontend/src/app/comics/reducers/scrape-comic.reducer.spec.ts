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
  ScrapeComicState
} from './scrape-comic.reducer';
import {
  comicScraped,
  scrapeComic,
  scrapeComicFailed
} from 'app/comics/actions/scrape-comic.actions';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';

describe('ScrapeComic Reducer', () => {
  const API_KEY = 'A0B1C2D3E4F56789';
  const COMIC = COMIC_1;
  const ISSUE = SCRAPING_ISSUE_1000;
  const SKIP_CACHE = true;

  let state: ScrapeComicState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the saving state', () => {
      expect(state.scraping).toBeFalsy();
    });

    it('clears the success flag', () => {
      expect(state.success).toBeFalsy();
    });

    it('has no comic', () => {
      expect(state.comic).toBeNull();
    });
  });

  describe('scraping a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, scraping: false, success: true },
        scrapeComic({
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

    it('clears the success flag', () => {
      expect(state.success).toBeFalsy();
    });
  });

  describe('when the scraping succeeds', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, scraping: true, success: false, comic: null },
        comicScraped({ comic: COMIC })
      );
    });

    it('clears the scraping flag', () => {
      expect(state.scraping).toBeFalsy();
    });

    it('sets the success flag', () => {
      expect(state.success).toBeTruthy();
    });

    it('sets the comic', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('when the scraping succeeds', () => {
    beforeEach(() => {
      state = reducer({ ...state, scraping: true }, scrapeComicFailed());
    });

    it('clears the scraping flag', () => {
      expect(state.scraping).toBeFalsy();
    });
  });
});
