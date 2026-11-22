/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { MultiComicScrapingActions } from '../actions/multi-comic-scraping.actions';
import { Comic } from '@app/library/models/comic';

export const MULTI_COMIC_SCRAPING_FEATURE_KEY = 'multi_comic_scraping_state';

export interface MultiComicScrapingState extends EntityState<Comic> {
  busy: boolean;
  total: number;
  current: Comic | null;
}

export const multiComicScrapingAdapter: EntityAdapter<Comic> =
  createEntityAdapter<Comic>({
    selectId: comic => comic.comicId,
    sortComparer: (left, right) => left.comicId - right.comicId
  });

export const initialMultiComicScrapingState: MultiComicScrapingState =
  multiComicScrapingAdapter.getInitialState({
    busy: false,
    current: null,
    total: 0
  });

export const multiComicScrapingReducer = createReducer(
  initialMultiComicScrapingState,
  on(MultiComicScrapingActions.startScraping, state => ({
    ...state,
    busy: true
  })),
  on(MultiComicScrapingActions.startScrapingSuccess, (state, action) => {
    return multiComicScrapingAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      current: null,
      total: action.total
    });
  }),
  on(MultiComicScrapingActions.startScrapingFailure, state => ({
    ...state,
    busy: false
  })),
  on(MultiComicScrapingActions.loadComics, state => ({ ...state, busy: true })),
  on(MultiComicScrapingActions.loadComicsSuccess, (state, action) => {
    return multiComicScrapingAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      current: null,
      total: action.total
    });
  }),
  on(MultiComicScrapingActions.loadComicsFailure, state => ({
    ...state,
    busy: false
  })),
  on(MultiComicScrapingActions.setCurrentComic, (state, action) => ({
    ...state,
    current: action.entry
  })),
  on(MultiComicScrapingActions.removeComic, state => ({
    ...state,
    busy: true
  })),
  on(MultiComicScrapingActions.removeComicSuccess, (state, action) => {
    return multiComicScrapingAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      current: null,
      total: action.total
    });
  }),
  on(MultiComicScrapingActions.removeComicFailure, state => ({
    ...state,
    busy: false
  })),
  on(MultiComicScrapingActions.scrapeComic, state => ({
    ...state,
    busy: true
  })),
  on(MultiComicScrapingActions.scrapeComicSuccess, (state, action) => {
    return multiComicScrapingAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      current: action.entries[0] ?? null,
      total: action.total
    });
  }),
  on(MultiComicScrapingActions.scrapeComicFailure, state => ({
    ...state,
    busy: false
  }))
);

export const multiComicScrapingFeature = createFeature({
  name: MULTI_COMIC_SCRAPING_FEATURE_KEY,
  reducer: multiComicScrapingReducer
});
