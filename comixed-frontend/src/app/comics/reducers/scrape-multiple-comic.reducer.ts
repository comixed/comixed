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

import { Action, createReducer, on } from '@ngrx/store';
import {
  removeScrapedComic,
  scrapeMultipleComics,
  skipComic
} from '../actions/scrape-multiple-comic.actions';
import { Comic } from 'app/comics';

export const SCRAPE_MULTIPLE_COMICS_STATE = 'scrape_multiple_comics_state';

export interface ScrapeMultipleComicsState {
  comics: Comic[];
}

export const initialState: ScrapeMultipleComicsState = {
  comics: []
};

const scrapeMultipleComicReducer = createReducer(
  initialState,

  on(scrapeMultipleComics, (state, action) => ({
    ...state,
    comics: action.comics
  })),
  on(removeScrapedComic, (state, action) => ({
    ...state,
    comics: state.comics.filter(comic => comic.id !== action.comic.id)
  })),
  on(skipComic, (state, action) => ({
    ...state,
    comics: state.comics.filter(comic => comic.id !== action.comic.id)
  }))
);

export function reducer(
  state: ScrapeMultipleComicsState | undefined,
  action: Action
) {
  return scrapeMultipleComicReducer(state, action);
}
