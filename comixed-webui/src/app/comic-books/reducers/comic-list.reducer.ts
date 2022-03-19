/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { createReducer, on } from '@ngrx/store';
import {
  comicListRemovalReceived,
  comicListUpdateReceived,
  comicsReceived,
  loadComics,
  loadComicsFailed,
  resetComicList
} from '../actions/comic-list.actions';
import { Comic } from '@app/comic-books/models/comic';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';

export const COMIC_LIST_FEATURE_KEY = 'comic_list_state';

export interface ComicListState {
  loading: boolean;
  lastId: number;
  lastPayload: boolean;
  comics: Comic[];
  unprocessed: Comic[];
  unscraped: Comic[];
  changed: Comic[];
  deleted: Comic[];
}

export const initialState: ComicListState = {
  loading: false,
  lastId: 0,
  lastPayload: false,
  comics: [],
  unprocessed: [],
  unscraped: [],
  changed: [],
  deleted: []
};

export const reducer = createReducer(
  initialState,

  on(resetComicList, state => ({
    ...state,
    loading: false,
    lastId: 0,
    lastPayload: false,
    comics: [],
    unprocessed: [],
    unscraped: [],
    changed: [],
    deleted: []
  })),
  on(loadComics, state => ({ ...state, loading: true })),
  on(comicsReceived, (state, action) => {
    let comics = state.comics.filter(
      comic => !action.comics.some(entry => entry.id === comic.id)
    );
    comics = comics.concat(action.comics);
    const lastId = action.lastId;
    const lastPayload = action.lastPayload;
    return comicListUpdate(
      { ...state, lastId, lastPayload, loading: false },
      comics
    );
  }),
  on(loadComicsFailed, state => ({ ...state, loading: false })),
  on(comicListUpdateReceived, (state, action) => {
    const comics = state.comics.filter(comic => comic.id !== action.comic.id);
    comics.push(action.comic);
    return comicListUpdate(state, comics);
  }),
  on(comicListRemovalReceived, (state, action) => {
    const comics = state.comics.filter(comic => comic.id !== action.comic.id);
    return comicListUpdate(state, comics);
  })
);

function comicListUpdate(
  state: ComicListState,
  comics: Comic[]
): ComicListState {
  return {
    ...state,
    comics,
    unprocessed: comics.filter(comic => !comic.fileDetails),
    unscraped: comics.filter(comic => !comic.comicVineId),
    changed: comics.filter(comic => comic.comicState == ComicBookState.CHANGED),
    deleted: comics.filter(
      comic => comic.comicState === ComicBookState.DELETED
    ),
    loading: false
  };
}
