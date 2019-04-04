/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Action } from '@ngrx/store';
import { MultipleComicsScraping } from 'app/models/scraping/multiple-comics-scraping';
import * as ScrapingActions from 'app/actions/multiple-comics-scraping.actions';
import { Comic } from 'app/models/comics/comic';

const initial_state: MultipleComicsScraping = {
  selecting: true,
  started: false,
  busy: false,
  api_key: null,
  selected_comics: [],
  current_comic: null
};

export function multipleComicsScrapingReducer(
  state: MultipleComicsScraping = initial_state,
  action: ScrapingActions.Actions
) {
  switch (action.type) {
    case ScrapingActions.MULTIPLE_COMICS_SCRAPING_SETUP: {
      return {
        ...state,
        selecting: true,
        started: false,
        busy: false,
        api_key: action.payload.api_key,
        selected_comics: []
      };
    }

    case ScrapingActions.MULTIPLE_COMICS_SCRAPING_START: {
      return {
        ...state,
        selecting: false,
        started: true,
        selected_comics: action.payload.selected_comics,
        current_comic:
          action.payload.selected_comics.length > 0
            ? action.payload.selected_comics[0]
            : null
      };
    }

    case ScrapingActions.MULTIPLE_COMICS_SCRAPING_COMIC_SCRAPED: {
      const remaining_comics = state.selected_comics.filter((comic: Comic) => {
        return comic.id !== action.payload.comic.id;
      });
      return {
        ...state,
        busy: false,
        selected_comics: remaining_comics,
        current_comic: remaining_comics.length > 0 ? remaining_comics[0] : null
      };
    }

    default:
      return state;
  }
}
