/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import * as DuplicateComicActions from '../actions/duplicate-comic.actions';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

export const DUPLICATE_COMIC_FEATURE_KEY = 'duplicate_comic_state';

export interface DuplicateComicState {
  busy: boolean;
  comics: ComicDetail[];
}

export const initialState: DuplicateComicState = {
  busy: false,
  comics: []
};

export const reducer = createReducer(
  initialState,

  on(DuplicateComicActions.loadDuplicateComics, state => ({
    ...state,
    busy: true
  })),
  on(DuplicateComicActions.duplicateComicsLoaded, (state, action) => ({
    ...state,
    busy: false,
    comics: action.comics
  })),
  on(DuplicateComicActions.loadDuplicateComicsFailed, state => ({
    ...state,
    busy: false
  }))
);
