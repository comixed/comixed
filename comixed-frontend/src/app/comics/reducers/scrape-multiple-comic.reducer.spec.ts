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
  ScrapeMultipleComicsState
} from './scrape-multiple-comic.reducer';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/comics.fixtures';
import {
  removeScrapedComic,
  scrapeMultipleComics,
  skipComic
} from 'app/comics/actions/scrape-multiple-comic.actions';

describe('ScrapeMultipleComic Reducer', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];

  let state: ScrapeMultipleComicsState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no comics', () => {
      expect(state.comics).toEqual([]);
    });
  });

  describe('starting the scraping multiple comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, comics: [] },
        scrapeMultipleComics({ comics: COMICS })
      );
    });

    it('sets the comics to be scraped', () => {
      expect(state.comics).toEqual(COMICS);
    });
  });

  describe('removing a scraped comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, comics: COMICS },
        removeScrapedComic({ comic: COMICS[0] })
      );
    });

    it('removes the specified comic', () => {
      expect(state.comics).toEqual(COMICS.slice(1));
    });
  });

  describe('skipping a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, comics: COMICS },
        skipComic({ comic: COMICS[0] })
      );
    });

    it('removes the specified comic', () => {
      expect(state.comics).toEqual(COMICS.slice(1));
    });
  });
});
