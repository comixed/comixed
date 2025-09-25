/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { deepClone } from '@angular-ru/cdk/object';
import {
  comicRemoved,
  comicUpdated,
  loadComicsByFilter,
  loadComicsById,
  loadComicsFailure,
  loadComicsForCollection,
  loadComicsForReadingList,
  loadComicsSuccess,
  loadReadComics,
  loadUnreadComics,
  resetComicList
} from '@app/comic-books/actions/comic-list.actions';

export const COMIC_LIST_FEATURE_KEY = 'comic_list_state';

export interface ComicListState {
  busy: boolean;
  comics: DisplayableComic[];
  coverYears: number[];
  coverMonths: number[];
  totalCount: number;
  filteredCount: number;
}

export const initialState: ComicListState = {
  busy: false,
  comics: [],
  coverYears: [],
  coverMonths: [],
  totalCount: 0,
  filteredCount: 0
};

export const reducer = createReducer(
  initialState,
  on(resetComicList, state => ({
    ...state,
    comics: [],
    coverYears: [],
    coverMonths: [],
    totalCount: 0,
    filteredCount: 0
  })),
  on(loadComicsByFilter, state => ({ ...state, busy: true })),
  on(loadComicsById, state => ({ ...state, busy: true })),
  on(loadComicsForCollection, state => ({ ...state, busy: true })),
  on(loadUnreadComics, state => ({ ...state, busy: true })),
  on(loadReadComics, state => ({ ...state, busy: true })),
  on(loadComicsForReadingList, state => ({ ...state, busy: true })),
  on(loadComicsSuccess, (state, action) => ({
    ...state,
    busy: false,
    comics: action.comics,
    coverYears: action.coverYears,
    coverMonths: action.coverMonths,
    totalCount: action.totalCount,
    filteredCount: action.filteredCount
  })),
  on(loadComicsFailure, state => ({
    ...state,
    busy: false
  })),
  on(comicUpdated, (state, action) => {
    const comics = deepClone(state.comics);
    const index = comics
      .map(entry => entry.comicBookId)
      .indexOf(action.comic.comicBookId);
    if (index !== -1) {
      comics[index] = { ...action.comic };
    }
    return { ...state, comics };
  }),
  on(comicRemoved, (state, action) => {
    const comics = state.comics.filter(
      entry => entry.comicBookId !== action.comic.comicBookId
    );
    return { ...state, comics };
  })
);

export const comicListFeature = createFeature({
  name: COMIC_LIST_FEATURE_KEY,
  reducer
});
