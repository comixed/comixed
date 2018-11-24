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
import { LibraryScrape } from '../models/library-scrape';
import { Issue } from '../models/scraping/issue';
import * as LibraryScrapingActions from '../actions/library-scraping.actions';

const initial_state: LibraryScrape = {
  busy: false,
  api_key: '',
  comic: null,
  series: '',
  volume: '',
  issue_number: '',
  volumes: [],
  current_volume: null,
  current_issue: null,
};

export function libraryScrapingReducer(
  state: LibraryScrape = initial_state,
  action: LibraryScrapingActions.Actions) {

  switch (action.type) {
    case LibraryScrapingActions.LIBRARY_SCRAPING_SETUP: {
      return {
        ...state,
        api_key: action.payload.api_key,
        series: action.payload.series,
        volume: action.payload.volume,
        issue_number: action.payload.issue_number,
        comic: action.payload.comic,
        volumes: [],
        current_volume: null,
        current_issue: null,
        busy: false,
      };
    }

    case LibraryScrapingActions.LIBRARY_SCRAPING_SAVE_API_KEY: {
      return {
        ...state,
        api_key: action.payload.api_key,
        comic: action.payload.comic,
        busy: true,
      };
    }

    case LibraryScrapingActions.LIBRARY_SCRAPING_SAVE_LOCAL_CHANGES: {
      return {
        ...state,
        busy: true,
        series: action.payload.series,
        volume: action.payload.volume,
        issue_number: action.payload.issue_number,
      };
    }

    case LibraryScrapingActions.LIBRARY_SCRAPING_FETCH_VOLUMES: {
      return {
        ...state,
        volumes: [],
        api_key: action.payload.api_key,
        series: action.payload.series,
        volume: action.payload.volume,
        issue_number: action.payload.issue_number,
        busy: true,
      };
    }

    case LibraryScrapingActions.LIBRARY_SCRAPING_FOUND_VOLUMES: {
      return {
        ...state,
        volumes: action.payload,
        busy: false,
      };
    }

    case LibraryScrapingActions.LIBRARY_SCRAPING_SET_CURRENT_VOLUME: {
      return {
        ...state,
        current_volume: action.payload,
        current_issue: null,
        busy: false,
      };
    }

    case LibraryScrapingActions.LIBRARY_SCRAPING_FETCH_ISSUES: {
      return {
        ...state,
        api_key: action.payload.api_key,
        volume_id: action.payload.volume_id,
        issue_number: action.payload.issue_number,
        busy: true,
      };
    }

    case LibraryScrapingActions.LIBRARY_SCRAPING_FOUND_ISSUE: {
      return {
        ...state,
        current_issue: action.payload.issue,
        busy: false,
      };
    }

    case LibraryScrapingActions.LIBRARY_SCRAPING_SCRAPE_METADATA: {
      return {
        ...state,
        busy: true,
      };
    }

    default:
      return state;
  }
}

