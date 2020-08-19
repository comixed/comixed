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
  SCRAPE_MULTIPLE_COMICS_STATE,
  ScrapeMultipleComicsState
} from '../reducers/scrape-multiple-comic.reducer';
import {
  selectScrapeMultipleComicState,
  selectScrapingMultipleComics
} from './scrape-multiple-comic.selectors';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/comics.fixtures';

describe('ScrapeMultipleComic Selectors', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];

  let state: ScrapeMultipleComicsState;

  beforeEach(() => {
    state = { comics: COMICS } as ScrapeMultipleComicsState;
  });

  it('can select the feature state', () => {
    expect(
      selectScrapeMultipleComicState({
        [SCRAPE_MULTIPLE_COMICS_STATE]: state
      })
    ).toEqual(state);
  });

  it('can select the comics', () => {
    expect(
      selectScrapingMultipleComics({ [SCRAPE_MULTIPLE_COMICS_STATE]: state })
    ).toEqual(COMICS);
  });
});
