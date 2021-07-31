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
  comicLoaded,
  comicUpdated,
  loadComic,
  loadComicFailed,
  updateComic,
  updateComicFailed
} from '../actions/comic.actions';
import { Comic } from '@app/comic-book/models/comic';

export const COMIC_FEATURE_KEY = 'comic_state';

export interface ComicState {
  loading: boolean;
  comic: Comic;
  saving: boolean;
  saved: boolean;
}

export const initialState: ComicState = {
  loading: false,
  comic: null,
  saving: false,
  saved: false
};

export const reducer = createReducer(
  initialState,

  on(loadComic, state => ({ ...state, loading: true })),
  on(comicLoaded, (state, action) => ({
    ...state,
    loading: false,
    comic: action.comic
  })),
  on(loadComicFailed, state => ({ ...state, loading: false })),
  on(updateComic, state => ({ ...state, saving: true, saved: false })),
  on(comicUpdated, (state, action) => {
    if (!!state.comic && state.comic.id === action.comic.id) {
      return {
        ...state,
        saving: false,
        saved: true,
        comic: action.comic
      };
    } else {
      return state;
    }
  }),
  on(updateComicFailed, state => ({ ...state, saving: false, saved: false }))
);
