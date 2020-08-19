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

import * as fromScrapeComic from '../reducers/scrape-comic.reducer';
import { ScrapeComicState } from '../reducers/scrape-comic.reducer';
import {
  selectScrapeComic,
  selectScrapeComicScraping,
  selectScrapeComicState,
  selectScrapeComicSuccess
} from './scrape-comic.selectors';
import { COMIC_2 } from 'app/comics/comics.fixtures';

describe('ScrapeComic Selectors', () => {
  const COMIC = COMIC_2;

  let state: ScrapeComicState;

  beforeEach(() => {
    state = {
      scraping: Math.random() * 100 > 50,
      comic: COMIC,
      success: Math.random() * 100 > 50
    } as ScrapeComicState;
  });

  it('should select the feature state', () => {
    expect(
      selectScrapeComicState({
        [fromScrapeComic.SCRAPE_COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the scraping flag', () => {
    expect(
      selectScrapeComicScraping({
        [fromScrapeComic.SCRAPE_COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state.scraping);
  });

  it('should select the success flag', () => {
    expect(
      selectScrapeComicSuccess({
        [fromScrapeComic.SCRAPE_COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state.success);
  });

  it('should select the comic', () => {
    expect(
      selectScrapeComic({
        [fromScrapeComic.SCRAPE_COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state.comic);
  });
});
