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
import { deselectComics, selectComics } from '../actions/library.actions';
import { Comic } from '@app/comic-books/models/comic';

export const LIBRARY_FEATURE_KEY = 'library_state';

export interface LibraryState {
  selected: Comic[];
}

export const initialState: LibraryState = {
  selected: []
};

export const reducer = createReducer(
  initialState,

  on(selectComics, (state, action) => {
    const selected = state.selected.filter(
      comic => action.comics.includes(comic) === false
    );

    return { ...state, selected: selected.concat(action.comics) };
  }),
  on(deselectComics, (state, action) => {
    const selected = state.selected.filter(
      comic => action.comics.includes(comic) === false
    );

    return { ...state, selected };
  })
);
