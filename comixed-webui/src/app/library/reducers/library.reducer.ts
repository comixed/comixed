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

import { createReducer, on } from '@ngrx/store';
import {
  clearSelectedComics,
  deselectComics,
  editMultipleComics,
  editMultipleComicsFailed,
  multipleComicsEdited,
  selectComics
} from '../actions/library.actions';
import { ComicBook } from '@app/comic-books/models/comic-book';

export const LIBRARY_FEATURE_KEY = 'library_state';

export interface LibraryState {
  selected: ComicBook[];
  busy: boolean;
}

export const initialState: LibraryState = {
  selected: [],
  busy: false
};

export const reducer = createReducer(
  initialState,

  on(selectComics, (state, action) => {
    const selected = state.selected.filter(
      comicBook => action.comicBooks.includes(comicBook) === false
    );

    return { ...state, selected: selected.concat(action.comicBooks) };
  }),
  on(deselectComics, (state, action) => {
    const selected = state.selected.filter(
      comicBook => action.comicBooks.includes(comicBook) === false
    );

    return { ...state, selected };
  }),
  on(clearSelectedComics, state => ({ ...state, selected: [] })),
  on(editMultipleComics, state => ({ ...state, busy: true })),
  on(multipleComicsEdited, state => ({ ...state, busy: false })),
  on(editMultipleComicsFailed, state => ({ ...state, busy: false }))
);
